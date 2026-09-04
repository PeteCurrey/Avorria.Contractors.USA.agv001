/**
 * AVORRIA DETERMINISTIC CONTRACTOR MATCHING ENGINE
 * Phase 8: Contextual matching signals for project opportunities.
 * 
 * Rules:
 * 1. Zero Fake Intelligence: No synthetic "AI match scores" or arbitrary 98% ratings.
 * 2. Deterministic Verification: Explains exact matching criteria (Trade, Territory, Verification).
 * 3. Transparent Signals: Clearly lists matching criteria so clients understand why contractors surfaced.
 */

import { getAllPublishedContractors, ContractorWorkspaceData } from '@/lib/tenant/repository';
import { evaluateContractorVerification } from '@/lib/verification/engine';
import { STANDARD_TRADES } from '@/lib/trades/registry';
import { ContractorMatchResult, OpportunityRequirements } from './types';

export interface OpportunityMatchingCriteria {
  trade: string; // Standard trade slug
  state: string; // e.g., 'TX'
  city?: string;
  requirements?: OpportunityRequirements;
}

/**
 * Evaluates published contractors against opportunity requirements using deterministic signals.
 */
export async function findMatchingContractorsForOpportunity(
  criteria: OpportunityMatchingCriteria
): Promise<{
  matches: ContractorMatchResult[];
  totalMatches: number;
  verifiedMatchesCount: number;
  summaryText: string;
}> {
  const publishedContractors = await getAllPublishedContractors();
  const results: ContractorMatchResult[] = [];

  const tradeName =
    STANDARD_TRADES.find((t) => t.slug === criteria.trade)?.name ||
    criteria.trade.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  for (const ws of publishedContractors) {
    const verification = evaluateContractorVerification(ws, ws.verificationRecords || []);

    // 1. Trade Match
    const tradeMatched = ws.trades.includes(criteria.trade);

    // 2. Territory Match (State level + city/radius if present)
    const primaryState = ws.serviceAreas.primaryState || 'TX';
    const additionalStates = ws.serviceAreas.additionalStates || [];
    const stateMatched = primaryState.toLowerCase() === criteria.state.toLowerCase() ||
      additionalStates.some((s) => s.toLowerCase() === criteria.state.toLowerCase());

    const cities = ws.serviceAreas.cities || [];
    const cityMatched = Boolean(
      criteria.city &&
      cities.some((c) => c.toLowerCase().includes(criteria.city!.toLowerCase()) || criteria.city!.toLowerCase().includes(c.toLowerCase()))
    );

    const locationMatched = stateMatched || cityMatched;

    // Skip contractors who don't match trade OR location
    if (!tradeMatched && !locationMatched) {
      continue;
    }

    // 3. Credentials
    const hasInsurance = ws.documents.some(
      (d) => d.document_type.includes('insurance') || d.document_type.includes('coi')
    ) || Boolean(verification.records.find((r) => r.category === 'insurance' && r.status === 'verified'));

    const hasLicense = ws.documents.some(
      (d) => d.document_type.includes('license')
    ) || Boolean(verification.records.find((r) => r.category === 'licensing' && r.status === 'verified')) || ws.baselineCredentials.hasTradeLicense;

    const hasSafetyProgram = ws.documents.some(
      (d) => d.document_type.includes('safety') || d.document_type.includes('jha')
    ) || Boolean(verification.records.find((r) => r.category === 'safety_program' && r.status === 'verified')) || ws.baselineCredentials.hasSafetyPlan;

    // 4. Build transparent match reasons
    const matchReasons: string[] = [];
    if (tradeMatched) {
      matchReasons.push(`Operates in ${tradeName}`);
    }
    if (cityMatched && criteria.city) {
      matchReasons.push(`Servicing ${criteria.city}, ${primaryState}`);
    } else if (stateMatched) {
      matchReasons.push(`Active across ${primaryState}`);
    }

    if (verification.isVerified) {
      matchReasons.push(`Verified by Avorria against published criteria (${verification.verificationReference || 'Active'})`);
    }

    if (criteria.requirements?.generalLiabilityRequired && hasInsurance) {
      matchReasons.push('Commercial General Liability on record');
    }
    if (criteria.requirements?.tradeLicenseRequired && hasLicense) {
      matchReasons.push('Trade contractor license on record');
    }
    if (criteria.requirements?.safetyPlanRequired && hasSafetyProgram) {
      matchReasons.push('Written site safety program on record');
    }

    const isEligible = tradeMatched && locationMatched;

    results.push({
      contractorId: ws.organisation.id,
      slug: ws.organisation.slug,
      businessName: ws.organisation.name,
      trade: tradeName,
      tradeMatched,
      location: `${ws.serviceAreas.cities?.[0] || 'Operating Area'}, ${primaryState}`,
      locationMatched,
      isVerified: verification.isVerified,
      verificationStatus: verification.aggregateStatus,
      verificationReference: verification.verificationReference,
      hasInsurance,
      hasLicense,
      hasSafetyProgram,
      readinessScore: ws.profile.readiness_score,
      matchReasons,
      isEligible,
    });
  }

  // Sort: Eligible first, then verified first, then both trade & territory matched, then readiness
  results.sort((a, b) => {
    if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    const aBoth = a.tradeMatched && a.locationMatched;
    const bBoth = b.tradeMatched && b.locationMatched;
    if (aBoth !== bBoth) return aBoth ? -1 : 1;
    return (b.readinessScore || 0) - (a.readinessScore || 0);
  });

  const verifiedCount = results.filter((r) => r.isVerified).length;
  let summaryText = `${results.length} relevant contractor${results.length === 1 ? '' : 's'} identified`;
  if (verifiedCount > 0) {
    summaryText += ` (${verifiedCount} Verified by Avorria)`;
  }
  summaryText += ` matching ${tradeName} in ${criteria.city ? `${criteria.city}, ` : ''}${criteria.state}.`;

  return {
    matches: results,
    totalMatches: results.length,
    verifiedMatchesCount: verifiedCount,
    summaryText,
  };
}
