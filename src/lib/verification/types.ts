/**
 * AVORRIA VERIFICATION ENGINE DOMAIN TYPES
 * 
 * Strict evidence-based verification domain model.
 * Phase 6: Expanded taxonomy, submissions, lifecycle, and review governance.
 */

export type VerificationCriterionCategory =
  | 'business_identity'
  | 'insurance'
  | 'licensing'
  | 'safety_program'
  | 'workforce_training'
  | 'business_profile';

export type VerificationCriterionEvidenceType =
  | 'insurance_coi'
  | 'trade_license'
  | 'safety_plan'
  | 'jha_jsa'
  | 'osha_card'
  | 'business_formation'
  | 'profile_attestation'
  | 'other';

export type VerificationRequirementType =
  | 'legal_regulatory'
  | 'industry_standard'
  | 'client_prequal'
  | 'avorria_readiness';

export type EvidenceItemStatus =
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'needs_review'
  | 'expired'
  | 'superseded'
  | 'not_applicable';

export type VerificationRecordStatus =
  | 'not_submitted'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'needs_clarification'
  | 'expired'
  | 'revoked';

export type VerificationSubmissionStatus =
  | 'not_started'
  | 'preparing'
  | 'ready_to_submit'
  | 'submitted'
  | 'under_review'
  | 'additional_evidence_required'
  | 'approved'
  | 'verified'
  | 'rejected'
  | 'withdrawn'
  | 'expired'
  | 'suspended';

export type AggregateVerificationStatus =
  | 'not_verified'
  | 'verification_in_progress'
  | 'verified'
  | 'verification_expired'
  | 'verification_suspended'
  | 'attention_required';

export interface VerificationCriterion {
  id: string;
  slug: string;
  name: string;
  category: VerificationCriterionCategory;
  description: string;
  trade?: string; // specific trade slug or undefined if universal
  jurisdiction?: string; // state code or undefined if nationwide
  requirementType: VerificationRequirementType;
  evidenceType: VerificationCriterionEvidenceType;
  mandatory: boolean;
  sourceName: string;
  sourceUrl?: string;
  effectiveDate: string;
  nextReviewDate: string;
  governedBy: string;
  active: boolean;
  verificationWeight: number;
}

export interface VerificationRecord {
  id: string;
  organisationId: string;
  criterionSlug: string;
  category: VerificationCriterionCategory;
  status: VerificationRecordStatus;
  evidenceStatus?: EvidenceItemStatus;
  evidenceDocumentId?: string;
  evidenceReference?: string;
  evidenceHash?: string;
  verificationMethod: 'document_inspection' | 'state_board_lookup' | 'automated_api' | 'third_party_audit';
  reviewer?: string;
  reviewedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  notes?: string;
  clarificationRequestedAt?: string;
  clarificationResponse?: string;
  verificationReference?: string; // e.g. AV-VER-XXXXXX
  createdAt: string;
  updatedAt: string;
}

export interface VerificationSubmission {
  id: string;
  organisationId: string;
  status: VerificationSubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerName?: string;
  verificationType: string;
  criteriaVersion: string;
  decision?: 'approve' | 'reject' | 'request_evidence' | 'suspend' | 'withdraw';
  decisionReason?: string;
  nextReviewAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationEvent {
  id: string;
  verificationRecordId: string;
  organisationId: string;
  eventType:
    | 'submitted'
    | 'review_started'
    | 'clarification_requested'
    | 'clarification_provided'
    | 'verified'
    | 'rejected'
    | 'expired'
    | 'revoked'
    | 'suspended'
    | 'evidence_changed'
    | 'evidence_accepted'
    | 'evidence_rejected';
  previousStatus?: VerificationRecordStatus;
  newStatus: VerificationRecordStatus;
  actorId: string;
  actorType: 'contractor' | 'reviewer' | 'system';
  notes?: string;
  evidenceReference?: string;
  createdAt: string;
}

export interface ContractorVerificationState {
  aggregateStatus: AggregateVerificationStatus;
  isVerified: boolean;
  verificationReference?: string; // e.g. AV-VER-984210
  verifiedAt?: string;
  expiresAt?: string;
  nextReviewDate?: string;
  criteriaVersion?: string;
  totalCriteriaCount: number;
  satisfiedCriteriaCount: number;
  records: VerificationRecord[];
  submissions?: VerificationSubmission[];
  applicableCriteria: VerificationCriterion[];
  recentEvents: VerificationEvent[];
  requiresAttention?: boolean;
  attentionReason?: string;
}

export interface ReviewDecisionInput {
  verificationRecordId: string;
  decision: 'verify' | 'reject' | 'needs_clarification' | 'suspend';
  notes?: string;
  rejectionReason?: string;
  expiresAt?: string;
}

export interface OverallReviewDecisionInput {
  decision: 'approve' | 'reject' | 'request_evidence' | 'suspend';
  notes?: string;
  reason?: string;
  expiresAt?: string;
  criteriaVersion?: string;
}

export interface ReviewerContext {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'avorria_reviewer' | 'avorria_compliance_officer' | 'system_admin';
  authorized: boolean;
}
