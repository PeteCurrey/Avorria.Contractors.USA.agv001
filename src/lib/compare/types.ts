/**
 * AVORRIA COMPARE ENGINE V1 DOMAIN TYPES
 * Phase 12: Evidence-Led Contractor Response Comparison
 *
 * Invariants:
 * 1. Deterministic output: Same responses + same requirements = exact same comparison matrix.
 * 2. Strict non-marketplace: No rankings, no winner badges, no numerical suitability scores.
 * 3. Evidence signal separation:
 *    - Layer 1: Avorria Verified Evidence (AV-VER-XXXXXX)
 *    - Layer 2: Published Passport Evidence (self-published, unverified)
 *    - Layer 3: Contractor Response Declarations (statements made in response)
 */

import { RequirementItem } from '@/lib/request/types';
import { CanonicalEvidenceState } from '@/lib/match/types';
import { RequirementResponseStatus } from '@/lib/respond/types';

export const COMPARE_ENGINE_VERSION = 'COMPARE_ENGINE_V1';

export type ComparisonClarificationStatus = 'not_requested' | 'requested' | 'answered';

export interface CompareContractorRequirementItem {
  requirement_id: string;
  response_status: RequirementResponseStatus | 'unanswered';
  evidence_state: CanonicalEvidenceState;
  verification_reference?: string;
  contractor_comment?: string;
  evidence_reference?: string;
  clarification_status: ComparisonClarificationStatus;
}

export interface CompareContractor {
  id: string;
  compare_set_id: string;
  tenant_id: string;
  contractor_id: string;
  invitation_id: string;
  response_id: string;
  contractor_name: string;
  contractor_slug?: string;
  verification_status: 'verified' | 'published_unverified';
  verification_reference?: string;
  availability_status?: string;
  proposed_start_date?: string;
  proposed_completion_date?: string;
  availability_notes?: string;
  response_notes?: string;
  requirement_declarations: CompareContractorRequirementItem[];
  created_at: string;
}

export interface CompareEvent {
  id: string;
  compare_set_id: string;
  tenant_id: string;
  user_id: string;
  event_type:
    | 'compare_set_created'
    | 'compare_viewed'
    | 'compare_refreshed'
    | 'compare_invalidated'
    | 'compare_contractor_added'
    | 'compare_contractor_removed'
    | 'clarification_requested_from_compare';
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface CompareSet {
  id: string;
  tenant_id: string;
  request_id: string;
  created_by: string;
  comparison_version: string;
  is_stale: boolean;
  stale_reason?: string;
  created_at: string;
  updated_at: string;
  contractors?: CompareContractor[];
  events?: CompareEvent[];
}

export interface RequirementComparisonRow {
  requirement: RequirementItem;
  contractorPositions: Record<string, CompareContractorRequirementItem>;
}

export interface AttentionItem {
  type: 'clarification_required' | 'evidence_gap' | 'schedule_divergence' | 'unconfirmed_criteria';
  severity: 'attention' | 'notice';
  contractorId: string;
  contractorName: string;
  requirementId?: string;
  requirementTitle?: string;
  message: string;
}

export interface ComparisonContractorSummary {
  contractorId: string;
  businessName: string;
  slug?: string;
  verificationStatus: 'verified' | 'published_unverified';
  verificationReference?: string;
  responseStatus: 'submitted' | 'draft' | 'withdrawn';
  availabilityStatus: string;
  proposedStartDate?: string;
  proposedCompletionDate?: string;
  availabilityNotes?: string;
  responseNotes?: string;
  confirmedCount: number;
  cannotConfirmCount: number;
  clarificationCount: number;
  notApplicableCount: number;
  unansweredCount: number;
}

export interface EvaluatedComparisonMatrix {
  compareSetId: string;
  requestId: string;
  packTitle: string;
  packReference: string;
  packCity: string;
  packState: string;
  packStatus: string;
  engineVersion: string;
  generatedAt: string;
  isStale: boolean;
  staleReason?: string;
  contractors: ComparisonContractorSummary[];
  rows: RequirementComparisonRow[];
  attentionSummary: {
    totalClarificationsNeeded: number;
    totalEvidenceGaps: number;
    verifiedContractorsCount: number;
    unverifiedContractorsCount: number;
    items: AttentionItem[];
  };
}

export interface CreateCompareSetInput {
  request_id: string;
  contractor_ids: string[]; // 2 to 6 contractors
}
