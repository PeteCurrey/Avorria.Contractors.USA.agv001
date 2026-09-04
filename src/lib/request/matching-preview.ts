/**
 * AVORRIA REQUIREMENT-TO-EVIDENCE MATCHING PREVIEW ENGINE
 * Phase 9: Contextual evaluation of candidate contractors against structured Requirement Packs.
 *
 * Principles:
 * 1. Zero Fake Intelligence: Deterministic cross-referencing between client requirements and contractor Passport evidence.
 * 2. Controlled Alignment Vocabulary: 'aligned' | 'declared' | 'not_found' | 'not_applicable' | 'needs_review'.
 *    NEVER synthesize "verified" for a requirement unless AV-VER-XXXXXX verification record explicitly exists.
 * 3. Security & Privacy: No internal file paths, storage keys, or administrative reviewer notes leaked.
 * 4. Strictly Preview: Client-facing only. Contractors receive NO notifications and are not aware of the preview.
 */

import { getAllPublishedContractors, ContractorWorkspaceData } from '@/lib/tenant/repository';
import { evaluateContractorVerification } from '@/lib/verification/engine';
import { STANDARD_TRADES } from '@/lib/trades/registry';
import {
  RequirementPack,
  RequirementItem,
  ContractorMatchPreviewResult,
  RequirementMatrixRow,
  PackMatchPreviewResult,
  EvidenceAlignmentStatus,
} from './types';

export async function previewContractorMatchesForPack(
  pack: RequirementPack
): Promise<PackMatchPreviewResult> {
  const publishedContractors = await getAllPublishedContractors();
  const packTrades = pack.trades?.map((t) => t.trade_slug) || [];
  const packState = pack.state?.toUpperCase() || 'TX';
  const packCity = pack.city?.toLowerCase() || '';
  const packRequirements = pack.requirements || [];

  const candidates: ContractorMatchPreviewResult[] = [];

  for (const ws of publishedContractors) {
    // 1. Verification record evaluation via Phase 6 verification engine
    const verification = evaluateContractorVerification(ws, ws.verificationRecords || []);

    // 2. Trade match: Contractor operates in at least one of the pack's trades
    const matchedTrades = ws.trades.filter((t) => packTrades.includes(t));
    const tradeMatched = packTrades.length === 0 || matchedTrades.length > 0;

    // 3. Location match: State and/or City coverage
    const primaryState = (ws.serviceAreas.primaryState || 'TX').toUpperCase();
    const additionalStates = (ws.serviceAreas.additionalStates || []).map((s) => s.toUpperCase());
    const stateMatched = primaryState === packState || additionalStates.includes(packState);

    const contractorCities = (ws.serviceAreas.cities || []).map((c) => c.toLowerCase());
    const cityMatched = Boolean(
      packCity && contractorCities.some((c) => c.includes(packCity) || packCity.includes(c))
    );

    const locationMatched = stateMatched || cityMatched;

    // Skip contractors who match neither trade nor location
    if (!tradeMatched && !locationMatched) {
      continue;
    }

    // 4. Build Requirement-to-Evidence Matrix for this contractor
    const matrixRows: RequirementMatrixRow[] = packRequirements.map((req) =>
      evaluateRequirementAgainstContractor(req, ws, verification)
    );

    const alignedCount = matrixRows.filter((r) => r.evidenceAlignmentStatus === 'aligned').length;
    const declaredCount = matrixRows.filter((r) => r.evidenceAlignmentStatus === 'declared').length;
    const notFoundCount = matrixRows.filter((r) => r.evidenceAlignmentStatus === 'not_found').length;
    const needsReviewCount = matrixRows.filter((r) => r.evidenceAlignmentStatus === 'needs_review').length;

    // 5. Transparent match reasons
    const matchReasons: string[] = [];
    const primaryTradeName =
      STANDARD_TRADES.find((t) => t.slug === ws.trades[0])?.name || ws.trades[0] || 'Contracting';

    if (tradeMatched && packTrades.length > 0) {
      const names = matchedTrades
        .map((slug) => STANDARD_TRADES.find((t) => t.slug === slug)?.name || slug)
        .join(', ');
      matchReasons.push(`Operates in requested trade (${names})`);
    }

    if (cityMatched && pack.city) {
      matchReasons.push(`Local coverage in ${pack.city}, ${packState}`);
    } else if (stateMatched) {
      matchReasons.push(`Licensed / active across ${packState}`);
    }

    if (verification.isVerified) {
      matchReasons.push(
        `Verified by Avorria against published criteria (${verification.verificationReference || 'Active'})`
      );
    }

    if (alignedCount > 0) {
      matchReasons.push(`${alignedCount} requirement(s) supported by published evidence`);
    }

    const overallEligible = tradeMatched && locationMatched;

    candidates.push({
      contractorId: ws.organisation.id,
      slug: ws.organisation.slug,
      businessName: ws.organisation.name,
      primaryTrade: primaryTradeName,
      location: `${ws.serviceAreas.cities?.[0] || 'Operating Area'}, ${primaryState}`,
      isVerified: verification.isVerified,
      verificationReference: verification.verificationReference,
      tradeMatched,
      locationMatched,
      overallEligible,
      alignedCount,
      declaredCount,
      notFoundCount,
      needsReviewCount,
      requirementMatrix: matrixRows,
      matchReasons,
    });
  }

  // Deterministic sorting: Eligible first, verified first, highest alignedCount, then business name
  candidates.sort((a, b) => {
    if (a.overallEligible !== b.overallEligible) return a.overallEligible ? -1 : 1;
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    if (a.alignedCount !== b.alignedCount) return b.alignedCount - a.alignedCount;
    return a.businessName.localeCompare(b.businessName);
  });

  return {
    packId: pack.id,
    packReference: pack.reference,
    totalContractorsEvaluated: publishedContractors.length,
    eligibleContractorsCount: candidates.filter((c) => c.overallEligible).length,
    verifiedContractorsCount: candidates.filter((c) => c.isVerified).length,
    candidates,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Deterministically evaluates a single requirement against a contractor's published workspace data.
 */
function evaluateRequirementAgainstContractor(
  req: RequirementItem,
  ws: ContractorWorkspaceData,
  verification: ReturnType<typeof evaluateContractorVerification>
): RequirementMatrixRow {
  const category = req.category;
  const reqType = (req.requirement_type || '').toLowerCase();
  const titleLower = req.title.toLowerCase();

  let status: EvidenceAlignmentStatus = 'not_found';
  let summary = 'No corresponding evidence or credential found on published Passport.';
  let publishedDocRef: string | undefined = undefined;

  // ─── INSURANCE CATEGORY ──────────────────────────────────────
  if (category === 'insurance' || reqType.includes('insurance') || titleLower.includes('insurance') || titleLower.includes('liability')) {
    const verifiedIns = verification.records.find((r) => r.category === 'insurance' && r.status === 'verified');
    const coiDoc = ws.documents.find(
      (d) => d.document_type.includes('insurance') || d.document_type.includes('coi')
    );

    if (verifiedIns) {
      status = 'aligned';
      summary = `Verified insurance on record (${verifiedIns.verificationReference || 'AV-VER-INS'}).`;
      publishedDocRef = 'Certificate of Insurance (COI) — Verified';
    } else if (coiDoc) {
      status = 'aligned';
      summary = `Published ${coiDoc.title} on file.`;
      publishedDocRef = coiDoc.title;
    } else if (ws.baselineCredentials.hasGeneralLiability) {
      status = 'declared';
      summary = 'Contractor self-declared active General Liability coverage; documentary evidence not published.';
    } else {
      status = 'not_found';
      summary = 'No published certificate of insurance found.';
    }
  }
  // ─── LICENCE CATEGORY ────────────────────────────────────────
  else if (category === 'licence' || reqType.includes('license') || titleLower.includes('license') || titleLower.includes('licence')) {
    const verifiedLic = verification.records.find((r) => r.category === 'licensing' && r.status === 'verified');
    const licDoc = ws.documents.find((d) => d.document_type.includes('license'));

    if (verifiedLic) {
      status = 'aligned';
      summary = `Verified trade contractor license (${verifiedLic.verificationReference || 'Active'}).`;
      publishedDocRef = 'Trade Contractor License — Verified';
    } else if (licDoc) {
      status = 'aligned';
      summary = `Published ${licDoc.title} on file.`;
      publishedDocRef = licDoc.title;
    } else if (ws.baselineCredentials.hasTradeLicense) {
      status = 'declared';
      summary = 'Contractor self-declared trade license; document not published.';
    } else {
      status = 'not_found';
      summary = 'No published trade license document found.';
    }
  }
  // ─── SAFETY CATEGORY ─────────────────────────────────────────
  else if (category === 'safety' || reqType.includes('safety') || titleLower.includes('safety') || titleLower.includes('jha') || titleLower.includes('osha')) {
    const verifiedSafety = verification.records.find((r) => r.category === 'safety_program' && r.status === 'verified');
    const safetyDoc = ws.documents.find(
      (d) => d.document_type.includes('safety') || d.document_type.includes('jha')
    );

    if (verifiedSafety) {
      status = 'aligned';
      summary = 'Verified site safety program on record.';
      publishedDocRef = 'Written Safety Program — Verified';
    } else if (safetyDoc) {
      status = 'aligned';
      summary = `Published safety document on file: ${safetyDoc.title}.`;
      publishedDocRef = safetyDoc.title;
    } else if (ws.baselineCredentials.hasSafetyPlan || ws.baselineCredentials.hasOshaCard) {
      status = 'declared';
      summary = 'Contractor declared active written safety plan or OSHA cardholder on staff.';
    } else {
      status = 'not_found';
      summary = 'No safety program documentation found.';
    }
  }
  // ─── CREDENTIAL / CERTIFICATION ──────────────────────────────
  else if (category === 'credential' || reqType.includes('cert') || titleLower.includes('cert')) {
    const certDoc = ws.documents.find((d) => d.document_type.includes('cert'));
    if (certDoc) {
      status = 'aligned';
      summary = `Published credential document on file: ${certDoc.title}.`;
      publishedDocRef = certDoc.title;
    } else {
      status = 'needs_review';
      summary = 'Specific qualification requires verification during direct engagement.';
    }
  }
  // ─── SCOPE / SITE / OTHER ────────────────────────────────────
  else {
    status = 'needs_review';
    summary = 'Project-specific scope requirement to be evaluated upon formal contractor response.';
  }

  return {
    requirementId: req.id,
    requirementTitle: req.title,
    category: req.category,
    strength: req.strength,
    minimumValue: req.minimum_value,
    evidenceAlignmentStatus: status,
    evidenceSummary: summary,
    publishedDocumentRef: publishedDocRef,
  };
}
