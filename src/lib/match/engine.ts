/**
 * AVORRIA MATCH ENGINE V1
 * Phase 10: Deterministic, Explainable Contractor Matching & Requirement Intelligence Engine.
 *
 * Rules & Invariants:
 * 1. ZERO Fake Intelligence: No synthetic "AI match scores" or arbitrary 94% numbers.
 * 2. Deterministic Multidimensional Matching: Trade, Territory, Verification, Requirements, Evidence, Expiry.
 * 3. Canonical Evidence States: VERIFIED, DECLARED, EXPIRED, MISSING, NEEDS_CLARIFICATION, NOT_APPLICABLE.
 * 4. Missing is NOT Failure: Clear distinction between "Evidence not found" and "Requirement failed".
 * 5. Eligibility Gate: Non-eligible contractors (suspended, unaligned trade, or out-of-territory) are filtered out.
 */

import { ContractorWorkspaceData } from '@/lib/tenant/repository';
import { evaluateContractorVerification } from '@/lib/verification/engine';
import { STANDARD_TRADES } from '@/lib/trades/registry';
import { RequirementPack, RequirementItem } from '@/lib/request/types';
import {
  MATCH_ENGINE_VERSION,
  TradeAlignment,
  TerritoryAlignment,
  CanonicalEvidenceState,
  OverallMatchStatus,
  MatchVerificationStatus,
  MatchExplanation,
  RequirementEvaluationResult,
  EvaluatedContractorMatch,
  MatchSet,
} from './types';

// Standardized trade category clusters for related-trade matching
const RELATED_TRADE_CLUSTERS: Record<string, string[]> = {
  mep: ['electrical-contracting', 'hvac-mechanical', 'commercial-plumbing', 'low-voltage-telecom', 'fire-protection'],
  structural: ['concrete-masonry', 'carpentry-framing', 'general-contracting'],
  finishes: ['painting-wallcoverings', 'flooring-tile'],
  exterior: ['commercial-roofing', 'landscaping-earthwork'],
  specialty: ['fire-protection', 'specialty-demolition', 'low-voltage-telecom'],
};

/**
 * Evaluates all published contractors against a Requirement Pack using MATCH_ENGINE_V1.
 */
export function runMatchEngineV1(
  pack: RequirementPack,
  publishedContractors: ContractorWorkspaceData[]
): {
  engineVersion: string;
  totalEvaluated: number;
  eligibleCount: number;
  verifiedCount: number;
  candidates: EvaluatedContractorMatch[];
} {
  const candidates: EvaluatedContractorMatch[] = [];

  for (const ws of publishedContractors) {
    // 1. Evaluate individual contractor
    const match = matchRequestToContractor(pack, ws);

    // 2. Eligibility Gate: Contractor must pass basic eligibility to enter candidate set
    if (match.isEligible) {
      candidates.push(match);
    }
  }

  // 3. Deterministic Sorting:
  // - Verified by Avorria first
  // - Most aligned requirements first
  // - Exact trade and territory alignment first
  // - Alphabetical by business name
  candidates.sort((a, b) => {
    if (a.verificationStatus !== b.verificationStatus) {
      return a.verificationStatus === 'verified' ? -1 : 1;
    }
    if (a.alignedCount !== b.alignedCount) {
      return b.alignedCount - a.alignedCount;
    }
    const aExact = a.tradeAlignment === 'exact' && a.territoryAlignment === 'exact';
    const bExact = b.tradeAlignment === 'exact' && b.territoryAlignment === 'exact';
    if (aExact !== bExact) {
      return aExact ? -1 : 1;
    }
    return a.businessName.localeCompare(b.businessName);
  });

  const verifiedCount = candidates.filter((c) => c.verificationStatus === 'verified').length;

  return {
    engineVersion: MATCH_ENGINE_VERSION,
    totalEvaluated: publishedContractors.length,
    eligibleCount: candidates.length,
    verifiedCount,
    candidates,
  };
}

/**
 * Evaluates a single contractor against a Requirement Pack.
 * Machine-readable and 100% deterministic.
 */
export function matchRequestToContractor(
  pack: RequirementPack,
  ws: ContractorWorkspaceData
): EvaluatedContractorMatch {
  // A. Verification Signal (Separate from suitability)
  const verification = evaluateContractorVerification(ws, ws.verificationRecords || []);
  const verificationStatus: MatchVerificationStatus = verification.isVerified
    ? 'verified'
    : 'published_unverified';

  // B. Trade Alignment
  const packTradeSlugs = (pack.trades || []).map((t) => t.trade_slug);
  const tradeResult = evaluateTradeAlignment(packTradeSlugs, ws.trades);

  // C. Territory Alignment
  const territoryResult = evaluateTerritoryAlignment(
    pack.state,
    pack.city,
    ws.serviceAreas
  );

  // D. Eligibility Gate
  // Must be active published profile, not suspended, with some trade and territory alignment
  const isPublished = ws.profile.visibility === 'published';
  const isSuspended = ws.profile.visibility === 'suspended';
  const hasTrade = tradeResult.alignment !== 'none';
  const hasTerritory = territoryResult.alignment !== 'no_alignment' && territoryResult.alignment !== 'not_published';
  const isEligible = isPublished && !isSuspended && hasTrade && hasTerritory;

  // E. Requirement-Level Evaluation
  const requirements = pack.requirements || [];
  const requirementResults: RequirementEvaluationResult[] = requirements.map((req) =>
    evaluateRequirement(req, ws, verification, pack.state)
  );

  // F. Count Metric Calculations
  const alignedCount = requirementResults.filter((r) => r.evidenceState === 'VERIFIED').length;
  const declaredCount = requirementResults.filter((r) => r.evidenceState === 'DECLARED').length;
  const expiredCount = requirementResults.filter((r) => r.evidenceState === 'EXPIRED').length;
  const missingCount = requirementResults.filter((r) => r.evidenceState === 'MISSING').length;
  const needsClarificationCount = requirementResults.filter((r) => r.evidenceState === 'NEEDS_CLARIFICATION').length;

  // G. Derived Overall Status
  const overallStatus = determineOverallStatus(
    isEligible,
    tradeResult.alignment,
    territoryResult.alignment,
    requirementResults
  );

  // H. Match Explanations
  const matchExplanations = buildContractorExplanations(
    tradeResult,
    territoryResult,
    verification,
    requirementResults,
    overallStatus
  );

  const primaryTradeSlug = ws.trades[0] || 'general-contracting';
  const primaryTradeName =
    STANDARD_TRADES.find((t) => t.slug === primaryTradeSlug)?.name || primaryTradeSlug;

  const locationStr = `${ws.serviceAreas.cities?.[0] || 'Operating Area'}, ${ws.serviceAreas.primaryState || 'TX'}`;

  return {
    contractorId: ws.organisation.id,
    slug: ws.organisation.slug,
    businessName: ws.organisation.name,
    primaryTrade: primaryTradeName,
    location: locationStr,
    overallStatus,
    tradeAlignment: tradeResult.alignment,
    tradeAlignmentDetail: tradeResult.detail,
    territoryAlignment: territoryResult.alignment,
    territoryAlignmentDetail: territoryResult.detail,
    verificationStatus,
    verificationReference: verification.verificationReference,
    isEligible,
    alignedCount,
    declaredCount,
    expiredCount,
    missingCount,
    needsClarificationCount,
    requirementResults,
    matchExplanations,
  };
}

// ─────────────────────────────────────────────────────────────
// TRADE ALIGNMENT LOGIC
// ─────────────────────────────────────────────────────────────

function evaluateTradeAlignment(
  requiredTradeSlugs: string[],
  contractorTradeSlugs: string[]
): { alignment: TradeAlignment; detail: string; matchedTrade?: string } {
  if (requiredTradeSlugs.length === 0) {
    return {
      alignment: 'exact',
      detail: 'No specific trade restriction defined in requirement pack.',
    };
  }

  // 1. Exact match check
  const exactMatch = contractorTradeSlugs.find((slug) => requiredTradeSlugs.includes(slug));
  if (exactMatch) {
    const tradeName = STANDARD_TRADES.find((t) => t.slug === exactMatch)?.name || exactMatch;
    return {
      alignment: 'exact',
      detail: `Exact trade match: operates in ${tradeName}.`,
      matchedTrade: tradeName,
    };
  }

  // 2. Related trade cluster check
  for (const reqSlug of requiredTradeSlugs) {
    const reqTrade = STANDARD_TRADES.find((t) => t.slug === reqSlug);
    const clusterCategory = reqTrade?.category;
    if (clusterCategory && RELATED_TRADE_CLUSTERS[clusterCategory]) {
      const cluster = RELATED_TRADE_CLUSTERS[clusterCategory];
      const relatedSlug = contractorTradeSlugs.find((cSlug) => cluster.includes(cSlug));
      if (relatedSlug) {
        const contractorTradeName = STANDARD_TRADES.find((t) => t.slug === relatedSlug)?.name || relatedSlug;
        const requestedTradeName = reqTrade?.name || reqSlug;
        return {
          alignment: 'related',
          detail: `Related trade alignment: ${contractorTradeName} operates within ${clusterCategory.toUpperCase()} trade category of ${requestedTradeName}.`,
          matchedTrade: contractorTradeName,
        };
      }
    }
  }

  return {
    alignment: 'none',
    detail: 'No published trade alignment with project requirements.',
  };
}

// ─────────────────────────────────────────────────────────────
// TERRITORY ALIGNMENT LOGIC
// ─────────────────────────────────────────────────────────────

function evaluateTerritoryAlignment(
  projectState: string,
  projectCity: string,
  serviceAreas: ContractorWorkspaceData['serviceAreas']
): { alignment: TerritoryAlignment; detail: string } {
  const normProjectState = (projectState || 'TX').toUpperCase().trim();
  const normProjectCity = (projectCity || '').toLowerCase().trim();

  const primaryState = (serviceAreas.primaryState || '').toUpperCase().trim();
  const additionalStates = (serviceAreas.additionalStates || []).map((s) => s.toUpperCase().trim());
  const cities = (serviceAreas.cities || []).map((c) => c.toLowerCase().trim());

  if (!primaryState && cities.length === 0) {
    return {
      alignment: 'not_published',
      detail: 'Service territory information not published on Passport.',
    };
  }

  // 1. Exact city / metro check
  const cityMatch = Boolean(
    normProjectCity && cities.some((c) => c.includes(normProjectCity) || normProjectCity.includes(c))
  );
  if (cityMatch) {
    return {
      alignment: 'exact',
      detail: `Exact service territory: explicitly services ${projectCity}, ${normProjectState}.`,
    };
  }

  // 2. Regional state check
  const stateMatch = primaryState === normProjectState || additionalStates.includes(normProjectState);
  if (stateMatch) {
    return {
      alignment: 'regional',
      detail: `Regional service territory: licensed and operating across ${normProjectState}.`,
    };
  }

  return {
    alignment: 'no_alignment',
    detail: `Published service area does not cover project location (${projectCity}, ${normProjectState}).`,
  };
}

// ─────────────────────────────────────────────────────────────
// REQUIREMENT-LEVEL EVALUATION (CANONICAL EVIDENCE STATES)
// ─────────────────────────────────────────────────────────────

function evaluateRequirement(
  req: RequirementItem,
  ws: ContractorWorkspaceData,
  verification: ReturnType<typeof evaluateContractorVerification>,
  projectState: string
): RequirementEvaluationResult {
  const category = req.category;
  const reqType = (req.requirement_type || '').toLowerCase();
  const titleLower = req.title.toLowerCase();
  const now = new Date().getTime();

  let evidenceState: CanonicalEvidenceState = 'MISSING';
  let summary = 'No applicable evidence or credential published on Avorria.';
  let publishedDocRef: string | undefined = undefined;
  let issuingAuthority: string | undefined = undefined;
  let expiryDate: string | undefined = undefined;
  let isExpired = false;
  const explanations: MatchExplanation[] = [];

  // ─── 1. INSURANCE EVALUATION ─────────────────────────────────
  if (category === 'insurance' || reqType.includes('insurance') || titleLower.includes('insurance') || titleLower.includes('liability')) {
    const verifiedIns = verification.records.find((r) => r.category === 'insurance' && r.status === 'verified');
    const coiDoc = ws.documents.find(
      (d) => d.document_type.includes('insurance') || d.document_type.includes('coi')
    );

    if (coiDoc?.expires_at) {
      expiryDate = new Date(coiDoc.expires_at).toISOString().split('T')[0];
      if (new Date(coiDoc.expires_at).getTime() < now) {
        isExpired = true;
      }
    }

    if (coiDoc?.issuing_organisation) {
      issuingAuthority = coiDoc.issuing_organisation;
    }

    // Expiry check
    if (isExpired) {
      evidenceState = 'EXPIRED';
      summary = `Certificate of Insurance on file expired on ${expiryDate}. Current evidence required.`;
      publishedDocRef = coiDoc?.title;
      explanations.push({
        code: 'INSURANCE_EXPIRED',
        dimension: 'insurance',
        message: `Insurance document expired on ${expiryDate}.`,
        isPositive: false,
      });
    }
    // Limit check: parse client minimum (e.g. $2,000,000 or $2M)
    else if (req.minimum_value && (coiDoc || verifiedIns)) {
      const parsedReqMin = parseMonetaryValue(req.minimum_value);
      const parsedDocLimit = coiDoc?.notes ? parseMonetaryValue(coiDoc.notes) : undefined;

      if (parsedReqMin && parsedDocLimit && parsedDocLimit < parsedReqMin) {
        evidenceState = 'NEEDS_CLARIFICATION';
        summary = `Published policy limit ($${(parsedDocLimit / 1000000).toFixed(1)}M) below stated minimum of ${req.minimum_value}.`;
        publishedDocRef = coiDoc?.title;
        explanations.push({
          code: 'INSURANCE_LIMIT_SHORTFALL',
          dimension: 'insurance',
          message: summary,
          isPositive: false,
        });
      } else if (verifiedIns) {
        evidenceState = 'VERIFIED';
        summary = `Verified Commercial General Liability insurance on record (${verifiedIns.verificationReference || 'Active'}).`;
        publishedDocRef = coiDoc?.title || 'Certificate of Insurance (COI)';
        explanations.push({
          code: 'INSURANCE_VERIFIED',
          dimension: 'insurance',
          message: 'Insurance verified by Avorria compliance reviewers against published criteria.',
          isPositive: true,
        });
      } else if (coiDoc) {
        evidenceState = 'VERIFIED';
        summary = `Published Certificate of Insurance on file: ${coiDoc.title}.`;
        publishedDocRef = coiDoc.title;
        explanations.push({
          code: 'INSURANCE_PUBLISHED',
          dimension: 'insurance',
          message: 'Active Certificate of Insurance published on Passport.',
          isPositive: true,
        });
      }
    } else if (verifiedIns) {
      evidenceState = 'VERIFIED';
      summary = `Verified insurance on record (${verifiedIns.verificationReference || 'Active'}).`;
      publishedDocRef = coiDoc?.title || 'Certificate of Insurance (COI)';
    } else if (coiDoc) {
      evidenceState = 'VERIFIED';
      summary = `Published Certificate of Insurance on file: ${coiDoc.title}.`;
      publishedDocRef = coiDoc.title;
    } else if (ws.baselineCredentials.hasGeneralLiability) {
      evidenceState = 'DECLARED';
      summary = 'Contractor self-declared active General Liability coverage; documentary evidence not published.';
      explanations.push({
        code: 'INSURANCE_DECLARED',
        dimension: 'insurance',
        message: 'Coverage declared by contractor, but Certificate of Insurance is not published.',
        isPositive: true,
      });
    } else {
      evidenceState = 'MISSING';
      summary = 'Evidence not found — no Certificate of Insurance published on Passport.';
      explanations.push({
        code: 'INSURANCE_MISSING',
        dimension: 'insurance',
        message: 'No published insurance documents found.',
        isPositive: false,
      });
    }
  }

  // ─── 2. LICENCE EVALUATION ───────────────────────────────────
  else if (category === 'licence' || reqType.includes('license') || titleLower.includes('license') || titleLower.includes('licence')) {
    const verifiedLic = verification.records.find((r) => r.category === 'licensing' && r.status === 'verified');
    const licDoc = ws.documents.find((d) => d.document_type.includes('license'));

    if (licDoc?.expires_at) {
      expiryDate = new Date(licDoc.expires_at).toISOString().split('T')[0];
      if (new Date(licDoc.expires_at).getTime() < now) {
        isExpired = true;
      }
    }

    if (licDoc?.issuing_organisation) {
      issuingAuthority = licDoc.issuing_organisation;
    }

    // Jurisdiction check
    const reqJurisdiction = (req.jurisdiction || projectState || '').toUpperCase().trim();
    const contractorState = (ws.serviceAreas.primaryState || 'TX').toUpperCase().trim();

    if (isExpired) {
      evidenceState = 'EXPIRED';
      summary = `Licence document expired on ${expiryDate}. Renewal required.`;
      publishedDocRef = licDoc?.title;
      explanations.push({
        code: 'LICENCE_EXPIRED',
        dimension: 'licence',
        message: `Licence document expired on ${expiryDate}.`,
        isPositive: false,
      });
    } else if (reqJurisdiction && reqJurisdiction.length === 2 && reqJurisdiction !== contractorState && !licDoc?.notes?.includes(reqJurisdiction)) {
      evidenceState = 'NEEDS_CLARIFICATION';
      summary = `Licence published in ${contractorState} does not confirm coverage for project jurisdiction ${reqJurisdiction}.`;
      publishedDocRef = licDoc?.title;
      explanations.push({
        code: 'LICENCE_JURISDICTION_MISMATCH',
        dimension: 'licence',
        message: summary,
        isPositive: false,
      });
    } else if (verifiedLic) {
      evidenceState = 'VERIFIED';
      summary = `Verified trade contractor licence on record (${verifiedLic.verificationReference || 'Active'}).`;
      publishedDocRef = licDoc?.title || 'Trade Contractor Licence';
      explanations.push({
        code: 'LICENCE_VERIFIED',
        dimension: 'licence',
        message: 'Trade licence verified by Avorria reviewers with state licensing board.',
        isPositive: true,
      });
    } else if (licDoc) {
      evidenceState = 'VERIFIED';
      summary = `Published trade licence on file: ${licDoc.title}.`;
      publishedDocRef = licDoc.title;
      explanations.push({
        code: 'LICENCE_PUBLISHED',
        dimension: 'licence',
        message: 'Active trade licence document published on Passport.',
        isPositive: true,
      });
    } else if (ws.baselineCredentials.hasTradeLicense) {
      evidenceState = 'DECLARED';
      summary = 'Contractor self-declared trade license in good standing; document not published.';
      explanations.push({
        code: 'LICENCE_DECLARED',
        dimension: 'licence',
        message: 'Licence declared by contractor, but document is not published.',
        isPositive: true,
      });
    } else {
      evidenceState = 'MISSING';
      summary = 'No applicable licence information published on Avorria.';
      explanations.push({
        code: 'LICENCE_MISSING',
        dimension: 'licence',
        message: 'No published licence records found.',
        isPositive: false,
      });
    }
  }

  // ─── 3. SAFETY EVALUATION ────────────────────────────────────
  else if (category === 'safety' || reqType.includes('safety') || titleLower.includes('safety') || titleLower.includes('jha') || titleLower.includes('osha')) {
    const verifiedSafety = verification.records.find((r) => r.category === 'safety_program' && r.status === 'verified');
    const safetyDoc = ws.documents.find(
      (d) => d.document_type.includes('safety') || d.document_type.includes('jha')
    );

    if (verifiedSafety) {
      evidenceState = 'VERIFIED';
      summary = `Verified written safety program on record (${verifiedSafety.verificationReference || 'Active'}).`;
      publishedDocRef = 'Written Safety Program — Verified';
      explanations.push({
        code: 'SAFETY_VERIFIED',
        dimension: 'safety',
        message: 'Safety program audit verified by Avorria.',
        isPositive: true,
      });
    } else if (safetyDoc) {
      evidenceState = 'VERIFIED';
      summary = `Published safety documentation on file: ${safetyDoc.title}.`;
      publishedDocRef = safetyDoc.title;
      explanations.push({
        code: 'SAFETY_PUBLISHED',
        dimension: 'safety',
        message: 'Site safety / JHA program published on Passport.',
        isPositive: true,
      });
    } else if (ws.baselineCredentials.hasSafetyPlan || ws.baselineCredentials.hasOshaCard) {
      evidenceState = 'DECLARED';
      summary = 'Contractor declared active written safety plan or OSHA cardholder on staff.';
      explanations.push({
        code: 'SAFETY_DECLARED',
        dimension: 'safety',
        message: 'Safety program self-declared in baseline profile.',
        isPositive: true,
      });
    } else {
      evidenceState = 'MISSING';
      summary = 'Evidence not found — no written safety program published.';
      explanations.push({
        code: 'SAFETY_MISSING',
        dimension: 'safety',
        message: 'No safety documentation found on Passport.',
        isPositive: false,
      });
    }
  }

  // ─── 4. CREDENTIALS / CERTIFICATIONS ─────────────────────────
  else if (category === 'credential' || reqType.includes('cert') || titleLower.includes('cert')) {
    const certDoc = ws.documents.find((d) => d.document_type.includes('cert'));
    if (certDoc) {
      evidenceState = 'VERIFIED';
      summary = `Published credential on file: ${certDoc.title}.`;
      publishedDocRef = certDoc.title;
    } else {
      evidenceState = 'MISSING';
      summary = 'Credential not published on Passport; verify directly during engagement.';
    }
  }

  // ─── 5. SCOPE / SITE / OTHER ─────────────────────────────────
  else {
    evidenceState = 'NEEDS_CLARIFICATION';
    summary = 'Project-specific scope requirement to be evaluated upon formal contractor response.';
    explanations.push({
      code: 'SCOPE_CLARIFICATION',
      dimension: 'general',
      message: 'Scope item requires direct confirmation during project introduction.',
      isPositive: true,
    });
  }

  return {
    requirementId: req.id,
    requirementTitle: req.title,
    category: req.category,
    strength: req.strength,
    statedMinimum: req.minimum_value,
    evidenceState,
    publishedInformationSummary: summary,
    publishedEvidenceRef: publishedDocRef,
    issuingAuthority,
    expiryDate,
    isExpired,
    explanations,
  };
}

// ─────────────────────────────────────────────────────────────
// OVERALL STATUS DETERMINATION
// ─────────────────────────────────────────────────────────────

function determineOverallStatus(
  isEligible: boolean,
  tradeAlignment: TradeAlignment,
  territoryAlignment: TerritoryAlignment,
  requirements: RequirementEvaluationResult[]
): OverallMatchStatus {
  if (!isEligible || tradeAlignment === 'none' || territoryAlignment === 'no_alignment') {
    return 'not_aligned';
  }

  const mandatoryReqs = requirements.filter((r) => r.strength === 'required');

  // If there are discrepancies in mandatory requirements (expired evidence or limit shortfall)
  const hasReviewItems = mandatoryReqs.some(
    (r) => r.evidenceState === 'EXPIRED' || r.evidenceState === 'NEEDS_CLARIFICATION'
  );
  if (hasReviewItems) {
    return 'needs_review';
  }

  // If all mandatory requirements have verified/published evidence
  const allMandatoryVerified = mandatoryReqs.length > 0 && mandatoryReqs.every(
    (r) => r.evidenceState === 'VERIFIED'
  );
  if (allMandatoryVerified && tradeAlignment === 'exact') {
    return 'aligned';
  }

  // If some are declared or trade is related
  const hasDeclared = mandatoryReqs.some((r) => r.evidenceState === 'DECLARED');
  if (hasDeclared || tradeAlignment === 'related') {
    return 'partially_aligned';
  }

  // If mandatory items are missing
  const hasMissing = mandatoryReqs.some((r) => r.evidenceState === 'MISSING');
  if (hasMissing) {
    return 'insufficient_information';
  }

  return 'partially_aligned';
}

// ─────────────────────────────────────────────────────────────
// EXPLANATION BUILDER
// ─────────────────────────────────────────────────────────────

function buildContractorExplanations(
  trade: { alignment: TradeAlignment; detail: string },
  territory: { alignment: TerritoryAlignment; detail: string },
  verification: ReturnType<typeof evaluateContractorVerification>,
  requirements: RequirementEvaluationResult[],
  overallStatus: OverallMatchStatus
): MatchExplanation[] {
  const list: MatchExplanation[] = [];

  // Trade explanation
  list.push({
    code: `TRADE_${trade.alignment.toUpperCase()}`,
    dimension: 'trade',
    message: trade.detail,
    isPositive: trade.alignment !== 'none',
  });

  // Territory explanation
  list.push({
    code: `TERRITORY_${territory.alignment.toUpperCase()}`,
    dimension: 'territory',
    message: territory.detail,
    isPositive: territory.alignment === 'exact' || territory.alignment === 'regional',
  });

  // Verification explanation
  if (verification.isVerified) {
    list.push({
      code: 'VERIFICATION_ACTIVE',
      dimension: 'verification',
      message: `Verified by Avorria against published criteria (${verification.verificationReference || 'Active'}).`,
      isPositive: true,
    });
  }

  // Critical requirement findings
  for (const r of requirements) {
    if (r.evidenceState === 'EXPIRED') {
      list.push({
        code: `${r.category.toUpperCase()}_EXPIRED`,
        dimension: (r.category as any) || 'general',
        message: `${r.requirementTitle}: Published document expired.`,
        isPositive: false,
      });
    }
  }

  return list;
}

// ─────────────────────────────────────────────────────────────
// HELPER: PARSE MONETARY STRINGS
// ─────────────────────────────────────────────────────────────

function parseMonetaryValue(str: string): number | undefined {
  if (!str) return undefined;
  const cleaned = str.replace(/[^0-9.kmKM]/g, '');
  if (str.toLowerCase().includes('m')) {
    const num = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? undefined : num * 1000000;
  }
  if (str.toLowerCase().includes('k')) {
    const num = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? undefined : num * 1000;
  }
  const rawNum = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(rawNum) ? undefined : rawNum;
}
