/**
 * AVORRIA COMPARE ENGINE V1
 * Phase 12: Deterministic Evidence-Led Contractor Response Comparison
 *
 * Principles:
 * - 100% deterministic rule-based evaluation.
 * - Requirement-by-requirement side-by-side alignment.
 * - Three-layer evidence model:
 *   1. Verified Evidence (AV-VER-XXXXXX)
 *   2. Published Passport Evidence (unverified)
 *   3. Contractor Declarations (confirmed / cannot_confirm / requires_clarification)
 * - Zero contractor rankings, zero winner badges, zero AI scores.
 * - Identifies factual attention items and clarification needs without subjective judgment.
 */

import { RequirementPack } from '@/lib/request/types';
import {
  CompareSet,
  CompareContractor,
  EvaluatedComparisonMatrix,
  RequirementComparisonRow,
  AttentionItem,
  ComparisonContractorSummary,
  COMPARE_ENGINE_VERSION,
} from './types';

export function runCompareEngineV1(
  set: CompareSet,
  pack: RequirementPack,
  contractors: CompareContractor[]
): EvaluatedComparisonMatrix {
  const requirements = pack.requirements || [];

  // 1. Build requirement-by-requirement rows
  const rows: RequirementComparisonRow[] = requirements.map((req) => {
    const contractorPositions: Record<string, CompareContractor['requirement_declarations'][0]> = {};

    for (const c of contractors) {
      const decl = c.requirement_declarations.find((d) => d.requirement_id === req.id);
      if (decl) {
        contractorPositions[c.contractor_id] = decl;
      } else {
        // Unanswered fallback
        contractorPositions[c.contractor_id] = {
          requirement_id: req.id,
          response_status: 'unanswered',
          evidence_state: 'MISSING',
          clarification_status: 'not_requested',
        };
      }
    }

    return {
      requirement: req,
      contractorPositions,
    };
  });

  // 2. Build contractor summaries
  const contractorSummaries: ComparisonContractorSummary[] = contractors.map((c) => {
    const confirmedCount = c.requirement_declarations.filter((d) => d.response_status === 'confirmed').length;
    const cannotConfirmCount = c.requirement_declarations.filter((d) => d.response_status === 'cannot_confirm').length;
    const clarificationCount = c.requirement_declarations.filter((d) => d.response_status === 'requires_clarification').length;
    const notApplicableCount = c.requirement_declarations.filter((d) => d.response_status === 'not_applicable').length;
    const unansweredCount = c.requirement_declarations.filter((d) => d.response_status === 'unanswered').length;

    return {
      contractorId: c.contractor_id,
      businessName: c.contractor_name,
      slug: c.contractor_slug,
      verificationStatus: c.verification_status,
      verificationReference: c.verification_reference,
      responseStatus: 'submitted',
      availabilityStatus: c.availability_status || 'not_stated',
      proposedStartDate: c.proposed_start_date,
      proposedCompletionDate: c.proposed_completion_date,
      availabilityNotes: c.availability_notes,
      responseNotes: c.response_notes,
      confirmedCount,
      cannotConfirmCount,
      clarificationCount,
      notApplicableCount,
      unansweredCount,
    };
  });

  // 3. Generate factual Attention Items
  const attentionItems: AttentionItem[] = [];

  for (const c of contractors) {
    // A. Clarifications requested by contractor
    for (const d of c.requirement_declarations) {
      if (d.response_status === 'requires_clarification') {
        const req = requirements.find((r) => r.id === d.requirement_id);
        attentionItems.push({
          type: 'clarification_required',
          severity: 'attention',
          contractorId: c.contractor_id,
          contractorName: c.contractor_name,
          requirementId: d.requirement_id,
          requirementTitle: req?.title || 'Requirement',
          message: `${c.contractor_name} indicated clarification is required on "${req?.title || 'this requirement'}".${
            d.contractor_comment ? ` Comment: "${d.contractor_comment}"` : ''
          }`,
        });
      }

      // B. Required criteria marked cannot_confirm
      if (d.response_status === 'cannot_confirm') {
        const req = requirements.find((r) => r.id === d.requirement_id);
        if (req?.strength === 'required') {
          attentionItems.push({
            type: 'unconfirmed_criteria',
            severity: 'attention',
            contractorId: c.contractor_id,
            contractorName: c.contractor_name,
            requirementId: d.requirement_id,
            requirementTitle: req?.title,
            message: `${c.contractor_name} stated they cannot confirm mandatory requirement "${req.title}".`,
          });
        }
      }

      // C. Expired or missing evidence for mandatory criteria
      if (d.evidence_state === 'EXPIRED') {
        const req = requirements.find((r) => r.id === d.requirement_id);
        attentionItems.push({
          type: 'evidence_gap',
          severity: 'attention',
          contractorId: c.contractor_id,
          contractorName: c.contractor_name,
          requirementId: d.requirement_id,
          requirementTitle: req?.title,
          message: `${c.contractor_name} published evidence for "${req?.title || 'requirement'}" has expired.`,
        });
      }
    }

    // D. Schedule conditions
    if (c.availability_status === 'available_with_conditions' || c.availability_status === 'limited_availability') {
      attentionItems.push({
        type: 'schedule_divergence',
        severity: 'notice',
        contractorId: c.contractor_id,
        contractorName: c.contractor_name,
        message: `${c.contractor_name} declared "${c.availability_status.replace(/_/g, ' ')}"${
          c.availability_notes ? `: "${c.availability_notes}"` : '.'
        }`,
      });
    }
  }

  const verifiedCount = contractors.filter((c) => c.verification_status === 'verified').length;
  const unverifiedCount = contractors.length - verifiedCount;
  const clarificationsCount = attentionItems.filter((i) => i.type === 'clarification_required').length;
  const evidenceGapsCount = attentionItems.filter((i) => i.type === 'evidence_gap').length;

  return {
    compareSetId: set.id,
    requestId: pack.id,
    packTitle: pack.title,
    packReference: pack.reference,
    packCity: pack.city,
    packState: pack.state,
    packStatus: pack.status,
    engineVersion: COMPARE_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    isStale: set.is_stale,
    staleReason: set.stale_reason,
    contractors: contractorSummaries,
    rows,
    attentionSummary: {
      totalClarificationsNeeded: clarificationsCount,
      totalEvidenceGaps: evidenceGapsCount,
      verifiedContractorsCount: verifiedCount,
      unverifiedContractorsCount: unverifiedCount,
      items: attentionItems,
    },
  };
}
