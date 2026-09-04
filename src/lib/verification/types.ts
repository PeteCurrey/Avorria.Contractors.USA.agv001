/**
 * AVORRIA VERIFICATION ENGINE DOMAIN TYPES
 * 
 * Strict evidence-based verification domain model.
 */

export type VerificationCriterionCategory =
  | 'business_identity'
  | 'insurance'
  | 'licensing'
  | 'safety_program'
  | 'workforce_training';

export type VerificationCriterionEvidenceType =
  | 'insurance_coi'
  | 'trade_license'
  | 'safety_plan'
  | 'jha_jsa'
  | 'osha_card'
  | 'business_formation'
  | 'other';

export type VerificationRecordStatus =
  | 'not_submitted'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'needs_clarification'
  | 'expired'
  | 'revoked';

export type AggregateVerificationStatus =
  | 'not_verified'
  | 'verification_in_progress'
  | 'verified'
  | 'verification_expired'
  | 'verification_suspended';

export interface VerificationCriterion {
  id: string;
  slug: string;
  name: string;
  category: VerificationCriterionCategory;
  description: string;
  trade?: string; // specific trade slug or undefined if universal
  jurisdiction?: string; // state code or undefined if nationwide
  requirementType: 'legal_regulatory' | 'industry_standard' | 'client_prequal' | 'avorria_readiness';
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
    | 'evidence_changed';
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
  totalCriteriaCount: number;
  satisfiedCriteriaCount: number;
  records: VerificationRecord[];
  applicableCriteria: VerificationCriterion[];
  recentEvents: VerificationEvent[];
}

export interface ReviewDecisionInput {
  verificationRecordId: string;
  decision: 'verify' | 'reject' | 'needs_clarification';
  notes?: string;
  rejectionReason?: string;
  expiresAt?: string;
}

export interface ReviewerContext {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'avorria_reviewer' | 'avorria_compliance_officer' | 'system_admin';
  authorized: boolean;
}
