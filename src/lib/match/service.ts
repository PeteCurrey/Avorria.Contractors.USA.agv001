/**
 * AVORRIA MATCH SERVICE LAYER
 * Phase 10: Service orchestration for MATCH_ENGINE_V1, snapshots, invalidation, and auditing.
 */

import {
  MatchSet,
  EvaluatedContractorMatch,
  MatchFilterOptions,
  MatchSortOption,
  MATCH_ENGINE_VERSION,
} from './types';
import {
  getMatchSetByPackId,
  saveMatchSetWithSnapshots,
  invalidateMatchSet,
} from './repository';
import { runMatchEngineV1 } from './engine';
import { getRequirementPackById } from '@/lib/request/repository';
import { logPackEvent } from '@/lib/request/repository';
import { getAllPublishedContractors } from '@/lib/tenant/repository';
import { trackEvent } from '@/lib/analytics/events';

export async function getOrComputeMatchSet(
  packId: string,
  tenantId: string,
  userId: string,
  filters?: MatchFilterOptions,
  sort?: MatchSortOption
): Promise<MatchSet> {
  const existing = await getMatchSetByPackId(packId, tenantId);

  if (existing) {
    trackEvent('match_viewed', tenantId, { packId, isStale: existing.is_stale });
    return applyFiltersAndSort(existing, filters, sort);
  }

  // No match set found: compute fresh
  return refreshMatchSet(packId, tenantId, userId, filters, sort);
}

export async function refreshMatchSet(
  packId: string,
  tenantId: string,
  userId: string,
  filters?: MatchFilterOptions,
  sort?: MatchSortOption
): Promise<MatchSet> {
  const pack = await getRequirementPackById(packId, tenantId);
  if (!pack) {
    throw new Error(`Requirement pack ${packId} not found or unauthorized`);
  }

  const publishedContractors = await getAllPublishedContractors();

  // Run deterministic MATCH_ENGINE_V1
  const result = runMatchEngineV1(pack, publishedContractors);
  const now = new Date().toISOString();

  const matchSet: MatchSet = {
    id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenant_id: tenantId,
    pack_id: packId,
    engine_version: MATCH_ENGINE_VERSION,
    status: 'ready',
    is_stale: false,
    stale_reason: undefined,
    total_contractors_evaluated: result.totalEvaluated,
    eligible_contractors_count: result.eligibleCount,
    verified_contractors_count: result.verifiedCount,
    candidates: result.candidates,
    generated_at: now,
    updated_at: now,
  };

  const saved = await saveMatchSetWithSnapshots(matchSet);

  // Append-only audit logging on requirement pack
  await logPackEvent(packId, tenantId, userId, 'request_updated', {
    action: 'match_refresh_completed',
    engineVersion: MATCH_ENGINE_VERSION,
    eligibleContractors: result.eligibleCount,
    verifiedContractors: result.verifiedCount,
  });

  trackEvent('match_refresh_completed', tenantId, {
    packId,
    eligibleCount: result.eligibleCount,
    verifiedCount: result.verifiedCount,
  });

  return applyFiltersAndSort(saved, filters, sort);
}

export async function invalidateMatchSetOnPackChange(
  packId: string,
  tenantId: string,
  reason: string
): Promise<boolean> {
  const success = await invalidateMatchSet(packId, tenantId, reason);
  if (success) {
    trackEvent('match_set_invalidated', tenantId, { packId, reason });
  }
  return success;
}

/**
 * Deterministic filtering and sorting on a MatchSet's candidate array.
 */
function applyFiltersAndSort(
  matchSet: MatchSet,
  filters?: MatchFilterOptions,
  sort: MatchSortOption = 'verified_first'
): MatchSet {
  let list = [...matchSet.candidates];

  if (filters) {
    if (filters.verificationOnly) {
      list = list.filter((c) => c.verificationStatus === 'verified');
    }
    if (filters.tradeSlug) {
      list = list.filter((c) => c.primaryTrade.toLowerCase().includes(filters.tradeSlug!.toLowerCase()));
    }
    if (filters.territoryExactOnly) {
      list = list.filter((c) => c.territoryAlignment === 'exact');
    }
    if (filters.overallStatus) {
      list = list.filter((c) => c.overallStatus === filters.overallStatus);
    }
    if (filters.evidenceVerifiedOnly) {
      list = list.filter((c) => c.alignedCount > 0);
    }
    if (filters.allRequiredAlignedOnly) {
      list = list.filter((c) => c.overallStatus === 'aligned');
    }
  }

  // Deterministic sorting
  list.sort((a, b) => {
    switch (sort) {
      case 'alignment_highest':
        if (a.alignedCount !== b.alignedCount) return b.alignedCount - a.alignedCount;
        return a.businessName.localeCompare(b.businessName);
      case 'evidence_highest':
        const aTotal = a.alignedCount + a.declaredCount;
        const bTotal = b.alignedCount + b.declaredCount;
        if (aTotal !== bTotal) return bTotal - aTotal;
        return a.businessName.localeCompare(b.businessName);
      case 'alphabetical':
        return a.businessName.localeCompare(b.businessName);
      case 'verified_first':
      default:
        if (a.verificationStatus !== b.verificationStatus) {
          return a.verificationStatus === 'verified' ? -1 : 1;
        }
        if (a.alignedCount !== b.alignedCount) {
          return b.alignedCount - a.alignedCount;
        }
        return a.businessName.localeCompare(b.businessName);
    }
  });

  return {
    ...matchSet,
    candidates: list,
  };
}
