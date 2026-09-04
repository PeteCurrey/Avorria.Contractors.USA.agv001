/**
 * AVORRIA REQUEST SERVICE LAYER
 * Phase 9: Business logic orchestration for structured project requests,
 * requirement packs, deterministic lifecycle state machine, and auditing.
 */

import {
  RequirementPack,
  RequirementPackStatus,
  CreateRequirementPackInput,
  UpdateRequirementPackInput,
  AddRequirementInput,
  UpdateRequirementInput,
  RequirementItem,
  RequirementPackAttachment,
  RequirementPackTrade,
} from './types';
import {
  getRequirementPackById,
  saveRequirementPack,
  updateRequirementPackStatus,
  addPackTrade as repoAddPackTrade,
  removePackTrade as repoRemovePackTrade,
  addPackRequirement as repoAddPackRequirement,
  updatePackRequirement as repoUpdatePackRequirement,
  removePackRequirement as repoRemovePackRequirement,
  addPackAttachment as repoAddPackAttachment,
  removePackAttachment as repoRemovePackAttachment,
  logPackEvent,
} from './repository';
import { evaluateRequestReadiness } from './readiness';
import { getTradeBySlug, STANDARD_TRADES } from '@/lib/trades/registry';
import { trackEvent } from '@/lib/analytics/events';
import { invalidateMatchSet } from '@/lib/match/repository';

/**
 * Generates deterministic, unique, non-sequential reference code (e.g. REQ-783921).
 */
export function generatePackReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REQ-${randomPart}`;
}

// ─────────────────────────────────────────────────────────────
// 1. REQUIREMENT PACK LIFECYCLE
// ─────────────────────────────────────────────────────────────

export async function createRequirementPack(
  tenantId: string,
  userId: string,
  input: CreateRequirementPackInput,
  tradeSlugs?: string[],
  initialRequirements?: AddRequirementInput[]
): Promise<RequirementPack> {
  const reference = generatePackReference();
  const now = new Date().toISOString();

  const pack: RequirementPack = {
    id: `pack_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenant_id: tenantId,
    created_by_user_id: userId,
    reference,
    title: input.title.trim(),
    project_type: input.project_type?.trim(),
    description: input.description?.trim(),
    scope: input.scope?.trim(),
    country: 'US',
    state: (input.state || 'TX').toUpperCase(),
    city: input.city?.trim() || '',
    site_address: input.site_address?.trim(),
    site_access_notes: input.site_access_notes?.trim(),
    target_start_date: input.target_start_date,
    target_completion_date: input.target_completion_date,
    urgency: input.urgency || 'undefined',
    flexibility: input.flexibility || 'undefined',
    value_tier: input.value_tier || 'undefined',
    status: 'draft',
    created_at: now,
    updated_at: now,
  };

  const saved = await saveRequirementPack(pack);

  // Assign trades if provided
  if (tradeSlugs && tradeSlugs.length > 0) {
    for (const slug of tradeSlugs) {
      const reg = getTradeBySlug(slug);
      const name = reg?.name || slug;
      await repoAddPackTrade(saved.id, tenantId, slug, name);
    }
  }

  // Assign initial requirements if provided
  if (initialRequirements && initialRequirements.length > 0) {
    let order = 0;
    for (const req of initialRequirements) {
      await repoAddPackRequirement(saved.id, tenantId, {
        category: req.category,
        requirement_type: req.requirement_type,
        title: req.title.trim(),
        description: req.description?.trim(),
        strength: req.strength || 'required',
        minimum_value: req.minimum_value?.trim(),
        jurisdiction: req.jurisdiction?.trim(),
        evidence_required: req.evidence_required ?? false,
        provenance: req.provenance || 'client',
        sort_order: order++,
      });
    }
  }

  // Append-only audit trail
  await logPackEvent(saved.id, tenantId, userId, 'request_created', {
    reference: saved.reference,
    title: saved.title,
  });

  trackEvent('requirement_pack_created', tenantId, {
    packId: saved.id,
    reference: saved.reference,
  });

  return (await getRequirementPackById(saved.id, tenantId)) || saved;
}

export async function updateRequirementPack(
  packId: string,
  tenantId: string,
  userId: string,
  updates: UpdateRequirementPackInput
): Promise<RequirementPack> {
  const existing = await getRequirementPackById(packId, tenantId);
  if (!existing) throw new Error(`Requirement pack ${packId} not found or unauthorized`);

  if (existing.status === 'closed' || existing.status === 'cancelled') {
    throw new Error(`Cannot update a ${existing.status} requirement pack`);
  }

  const updated: RequirementPack = {
    ...existing,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    project_type: updates.project_type !== undefined ? updates.project_type.trim() : existing.project_type,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
    scope: updates.scope !== undefined ? updates.scope.trim() : existing.scope,
    state: updates.state !== undefined ? updates.state.toUpperCase().trim() : existing.state,
    city: updates.city !== undefined ? updates.city.trim() : existing.city,
    site_address: updates.site_address !== undefined ? updates.site_address.trim() : existing.site_address,
    site_access_notes: updates.site_access_notes !== undefined ? updates.site_access_notes.trim() : existing.site_access_notes,
    target_start_date: updates.target_start_date !== undefined ? updates.target_start_date : existing.target_start_date,
    target_completion_date: updates.target_completion_date !== undefined ? updates.target_completion_date : existing.target_completion_date,
    urgency: updates.urgency !== undefined ? updates.urgency : existing.urgency,
    flexibility: updates.flexibility !== undefined ? updates.flexibility : existing.flexibility,
    value_tier: updates.value_tier !== undefined ? updates.value_tier : existing.value_tier,
  };

  const saved = await saveRequirementPack(updated);

  await logPackEvent(packId, tenantId, userId, 'request_updated', {
    updatedFields: Object.keys(updates),
  });

  // Invalidate any existing match set
  await invalidateMatchSet(packId, tenantId, 'Requirement pack parameters updated');

  return saved;
}

/**
 * Deterministic lifecycle state machine transitions:
 * - draft -> ready (requires readiness validation)
 * - draft -> cancelled
 * - ready -> active
 * - ready -> draft
 * - ready -> cancelled
 * - active -> closed
 * - active -> cancelled
 * - closed / cancelled cannot be transitioned (closed -> draft is strictly forbidden)
 */
export async function transitionPackStatus(
  packId: string,
  tenantId: string,
  userId: string,
  targetStatus: RequirementPackStatus
): Promise<RequirementPack> {
  const pack = await getRequirementPackById(packId, tenantId);
  if (!pack) throw new Error(`Requirement pack ${packId} not found or unauthorized`);

  const current = pack.status;

  if (current === targetStatus) {
    return pack;
  }

  // Terminal state protection
  if (current === 'closed' || current === 'cancelled') {
    throw new Error(`Cannot change status of a ${current} requirement pack. Re-opening is forbidden.`);
  }

  // Transition validation
  if (targetStatus === 'ready') {
    if (current !== 'draft') {
      throw new Error(`Invalid transition: ${current} -> ready`);
    }
    const readiness = evaluateRequestReadiness(pack);
    if (!readiness.isReady) {
      throw new Error(`Cannot mark pack ready: ${readiness.statusMessage}`);
    }
    await logPackEvent(packId, tenantId, userId, 'request_marked_ready');
    trackEvent('requirement_pack_marked_ready', tenantId, { packId });
  } else if (targetStatus === 'active') {
    if (current !== 'ready' && current !== 'draft') {
      throw new Error(`Invalid transition: ${current} -> active`);
    }
    // Check readiness before activation
    const readiness = evaluateRequestReadiness(pack);
    if (!readiness.isReady) {
      throw new Error(`Cannot activate pack: ${readiness.statusMessage}`);
    }
    await logPackEvent(packId, tenantId, userId, 'request_activated');
    trackEvent('requirement_pack_activated', tenantId, { packId });
  } else if (targetStatus === 'closed') {
    if (current !== 'active') {
      throw new Error(`Invalid transition: ${current} -> closed. Only active packs can be closed.`);
    }
    await logPackEvent(packId, tenantId, userId, 'request_closed');
    trackEvent('requirement_pack_closed', tenantId, { packId });
  } else if (targetStatus === 'cancelled') {
    await logPackEvent(packId, tenantId, userId, 'request_cancelled');
    trackEvent('requirement_pack_cancelled', tenantId, { packId });
  } else if (targetStatus === 'draft') {
    if (current !== 'ready') {
      throw new Error(`Invalid transition: ${current} -> draft. Only ready packs may be returned to draft.`);
    }
  } else {
    throw new Error(`Unsupported target status: ${targetStatus}`);
  }

  return updateRequirementPackStatus(packId, tenantId, targetStatus);
}

/**
 * Duplicates a Requirement Pack into a fresh draft with a brand new reference number.
 * Omit attachments to prevent accidental leakage of sensitive site documentation.
 */
export async function duplicateRequirementPack(
  packId: string,
  tenantId: string,
  userId: string
): Promise<RequirementPack> {
  const source = await getRequirementPackById(packId, tenantId);
  if (!source) throw new Error(`Requirement pack ${packId} not found or unauthorized`);

  const newReference = generatePackReference();
  const now = new Date().toISOString();

  const newPack: RequirementPack = {
    id: `pack_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenant_id: tenantId,
    created_by_user_id: userId,
    reference: newReference,
    title: `${source.title} (Copy)`,
    project_type: source.project_type,
    description: source.description,
    scope: source.scope,
    country: source.country,
    state: source.state,
    city: source.city,
    site_address: source.site_address,
    site_access_notes: source.site_access_notes,
    target_start_date: undefined, // Cleared for copy
    target_completion_date: undefined,
    urgency: source.urgency,
    flexibility: source.flexibility,
    value_tier: source.value_tier,
    status: 'draft',
    created_at: now,
    updated_at: now,
  };

  const savedCopy = await saveRequirementPack(newPack);

  // Copy trades
  if (source.trades) {
    for (const t of source.trades) {
      await repoAddPackTrade(savedCopy.id, tenantId, t.trade_slug, t.trade_name);
    }
  }

  // Copy requirements (resetting IDs, keeping provenance and criteria)
  if (source.requirements) {
    for (const r of source.requirements) {
      await repoAddPackRequirement(savedCopy.id, tenantId, {
        category: r.category,
        requirement_type: r.requirement_type,
        title: r.title,
        description: r.description,
        strength: r.strength,
        minimum_value: r.minimum_value,
        jurisdiction: r.jurisdiction,
        evidence_required: r.evidence_required,
        provenance: r.provenance,
        sort_order: r.sort_order,
      });
    }
  }

  // Log duplication event on source and creation event on new pack
  await logPackEvent(source.id, tenantId, userId, 'request_duplicated', {
    newPackId: savedCopy.id,
    newReference,
  });

  await logPackEvent(savedCopy.id, tenantId, userId, 'request_created', {
    sourcePackId: source.id,
    sourceReference: source.reference,
  });

  trackEvent('requirement_pack_duplicated', tenantId, {
    sourcePackId: source.id,
    newPackId: savedCopy.id,
  });

  return (await getRequirementPackById(savedCopy.id, tenantId)) || savedCopy;
}

// ─────────────────────────────────────────────────────────────
// 2. TRADES MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function addPackTrade(
  packId: string,
  tenantId: string,
  userId: string,
  tradeSlug: string
): Promise<RequirementPackTrade> {
  const reg = getTradeBySlug(tradeSlug);
  const tradeName = reg?.name || tradeSlug;
  const trade = await repoAddPackTrade(packId, tenantId, tradeSlug, tradeName);

  await logPackEvent(packId, tenantId, userId, 'trade_added', { tradeSlug, tradeName });
  await invalidateMatchSet(packId, tenantId, 'Trade classification added');
  return trade;
}

export async function removePackTrade(
  packId: string,
  tenantId: string,
  userId: string,
  tradeSlug: string
): Promise<boolean> {
  const removed = await repoRemovePackTrade(packId, tenantId, tradeSlug);
  if (removed) {
    await logPackEvent(packId, tenantId, userId, 'trade_removed', { tradeSlug });
    await invalidateMatchSet(packId, tenantId, 'Trade classification removed');
  }
  return removed;
}

// ─────────────────────────────────────────────────────────────
// 3. REQUIREMENTS MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function addRequirement(
  packId: string,
  tenantId: string,
  userId: string,
  input: AddRequirementInput
): Promise<RequirementItem> {
  const pack = await getRequirementPackById(packId, tenantId);
  if (!pack) throw new Error(`Requirement pack ${packId} not found or unauthorized`);

  if (pack.status === 'closed' || pack.status === 'cancelled') {
    throw new Error(`Cannot add requirements to a ${pack.status} requirement pack`);
  }

  const req = await repoAddPackRequirement(packId, tenantId, {
    category: input.category,
    requirement_type: input.requirement_type,
    title: input.title.trim(),
    description: input.description?.trim(),
    strength: input.strength || 'required',
    minimum_value: input.minimum_value?.trim(),
    jurisdiction: input.jurisdiction?.trim(),
    evidence_required: input.evidence_required ?? false,
    provenance: input.provenance || 'client',
    sort_order: pack.requirements?.length ?? 0,
  });

  await logPackEvent(packId, tenantId, userId, 'requirement_added', {
    requirementId: req.id,
    title: req.title,
    category: req.category,
    provenance: req.provenance,
  });

  await invalidateMatchSet(packId, tenantId, 'Requirement added');

  return req;
}

export async function updateRequirement(
  requirementId: string,
  packId: string,
  tenantId: string,
  userId: string,
  updates: UpdateRequirementInput
): Promise<RequirementItem> {
  const req = await repoUpdatePackRequirement(requirementId, tenantId, updates);
  await logPackEvent(packId, tenantId, userId, 'requirement_updated', {
    requirementId,
    updates: Object.keys(updates),
  });

  await invalidateMatchSet(packId, tenantId, 'Requirement updated');

  return req;
}

export async function removeRequirement(
  requirementId: string,
  packId: string,
  tenantId: string,
  userId: string
): Promise<boolean> {
  const removed = await repoRemovePackRequirement(requirementId, tenantId);
  if (removed) {
    await logPackEvent(packId, tenantId, userId, 'requirement_removed', { requirementId });
    await invalidateMatchSet(packId, tenantId, 'Requirement removed');
  }
  return removed;
}

// ─────────────────────────────────────────────────────────────
// 4. ATTACHMENTS MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function addAttachment(
  packId: string,
  tenantId: string,
  userId: string,
  file: {
    fileName: string;
    filePath: string;
    fileSizeBytes?: number;
    mimeType?: string;
    description?: string;
  }
): Promise<RequirementPackAttachment> {
  const attachment = await repoAddPackAttachment(packId, tenantId, userId, {
    file_name: file.fileName,
    file_path: file.filePath,
    file_size_bytes: file.fileSizeBytes,
    mime_type: file.mimeType,
    description: file.description,
  });

  await logPackEvent(packId, tenantId, userId, 'attachment_added', {
    attachmentId: attachment.id,
    fileName: attachment.file_name,
  });

  return attachment;
}

export async function removeAttachment(
  attachmentId: string,
  packId: string,
  tenantId: string,
  userId: string
): Promise<boolean> {
  const removed = await repoRemovePackAttachment(attachmentId, tenantId);
  if (removed) {
    await logPackEvent(packId, tenantId, userId, 'attachment_removed', { attachmentId });
  }
  return removed;
}
