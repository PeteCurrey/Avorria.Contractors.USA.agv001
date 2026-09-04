/**
 * AVORRIA PROVE — DOMAIN TYPES
 *
 * Phase 7: Contractor Evidence, Verification & Trust Layer.
 *
 * Core conceptual model:
 *   CLAIM        Something the contractor asserts about its business.
 *   RECORD       Structured database object representing that claim or business fact.
 *   EVIDENCE     Document, record or supported source that substantiates the record.
 *   VERIFICATION Determination about the evidence/record made through an actual verification process.
 *
 * These concepts must never be collapsed.
 */

// ─── Supported Evidence Categories ──────────────────────────────────────────

export type EvidenceType =
  | 'business'      // Business identity, registration, formation
  | 'licence'       // COMPLY trade licences
  | 'insurance'     // COMPLY insurance policies / COIs
  | 'credential'    // COMPLY certifications, qualifications, OSHA
  | 'safety'        // COMPLY safety policies, plans, audits
  | 'project'       // CREATE project experience
  | 'capability'    // CREATE capabilities
  | 'reference';    // CREATE client references

// ─── Explicit Verification States ───────────────────────────────────────────

export type VerificationState =
  | 'CONTRACTOR_SUPPLIED'     // Contractor provided the claim/evidence (unverified)
  | 'DOCUMENT_SUPPORTED'      // Supporting document attached, but no independent audit yet
  | 'PENDING_VERIFICATION'    // Entered an active verification queue
  | 'VERIFIED'                // Confirmed by an actual supported verification process
  | 'VERIFICATION_FAILED'     // Evidence did not satisfy verification criteria
  | 'REVIEW_REQUIRED';        // Requires manual / auditor review

// ─── Evidence Sources ────────────────────────────────────────────────────────

export type EvidenceSource =
  | 'contractor_uploaded'     // Contractor uploaded directly
  | 'platform_generated'      // Generated within Avorria (e.g. JHA, Quote)
  | 'third_party_issuer'      // Directly issued by third party or authority
  | 'verification_audit';     // Created/verified during formal auditor review

// ─── Underlying Record Lifecycle State ──────────────────────────────────────

export type RelatedRecordState =
  | 'CURRENT'
  | 'EXPIRING'
  | 'EXPIRED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'DRAFT';

// ─── Evidence Audit Event ───────────────────────────────────────────────────

export interface EvidenceEvent {
  id: string;
  action:
    | 'evidence_created'
    | 'document_linked'
    | 'document_unlinked'
    | 'review_requested'
    | 'verification_initiated'
    | 'verified'
    | 'verification_failed'
    | 'verification_invalidated'
    | 'state_updated';
  actor: string;
  actor_role: string;
  timestamp: string; // ISO Platform Timestamp
  notes?: string;
}

// ─── Core Evidence Item ─────────────────────────────────────────────────────

export interface EvidenceItem {
  id: string;
  org_id: string;
  title: string;
  evidence_type: EvidenceType;

  // The Avorria record this evidence substantiates (CLAIM -> RECORD -> EVIDENCE)
  related_record_id: string;
  related_record_type: 'credential' | 'project' | 'capability' | 'reference' | 'business';
  related_record_title: string;
  related_record_state: RelatedRecordState;

  // Evidence document / artifact
  document_id?: string;
  document_title?: string;
  document_file_url?: string;
  document_type?: string;
  file_size_bytes?: number;

  // Origin and source
  source: EvidenceSource;
  source_label: string;

  // ─── SOURCE DATES (Date-only YYYY-MM-DD from the underlying document) ───
  issued_date?: string;          // When external document was issued
  effective_date?: string;       // When coverage/license became effective
  expiry_date?: string;          // When coverage/license expires

  // Verification state (independent from record lifecycle)
  verification_state: VerificationState;
  verification_method?: 'document_inspection' | 'state_board_lookup' | 'third_party_audit' | 'automated_api';
  verifier_name?: string;
  verification_reference?: string;   // e.g. AV-VER-04513A
  
  // ─── VERIFICATION WORKFLOW TIMESTAMPS (ISO Timestamps) ───────────────────
  verification_requested_at?: string; // When review was requested
  verified_at?: string;               // Populated ONLY when genuine verification occurred
  verification_failed_at?: string;    // Populated if verification failed

  notes?: string;

  // ─── PLATFORM TIMESTAMPS (ISO Timestamps) ────────────────────────────────
  created_at: string; // When record entered Avorria platform
  updated_at: string; // When record was last edited in Avorria
  created_by?: string;

  // History / Audit (Immutable event log)
  events: EvidenceEvent[];
}

// ─── Evidence Position Summary ───────────────────────────────────────────────

export interface EvidencePosition {
  total_evidence: number;
  verified: number;
  document_supported: number;
  contractor_supplied: number;
  pending_verification: number;
  review_required: number;
  verification_failed: number;
  unsupported_records_count: number;
}

// ─── Unsupported Record (Evidence Needed) ───────────────────────────────────

export interface UnsupportedRecord {
  id: string;
  title: string;
  category: EvidenceType;
  record_type_label: string;
  record_state: RelatedRecordState;
  action_href: string;
  reason: string;
}

// ─── Category Evidence Completeness ─────────────────────────────────────────

export interface CategoryEvidenceCompleteness {
  category: EvidenceType;
  label: string;
  total_records: number;
  records_with_evidence: number;
  verified_count: number;
  document_supported_count: number;
  contractor_supplied_count: number;
}

export interface EvidenceCompletenessSummary {
  categories: CategoryEvidenceCompleteness[];
  total_records: number;
  total_with_evidence: number;
  total_verified: number;
}

// ─── Form Inputs ─────────────────────────────────────────────────────────────

export interface CreateEvidenceInput {
  org_id: string;
  title: string;
  evidence_type: EvidenceType;
  related_record_id: string;
  related_record_type: 'credential' | 'project' | 'capability' | 'reference' | 'business';
  related_record_title: string;
  related_record_state?: RelatedRecordState;
  document_id?: string;
  document_title?: string;
  document_file_url?: string;
  source?: EvidenceSource;
  source_label?: string;
  issued_date?: string;
  effective_date?: string;
  expiry_date?: string;
  verification_state?: VerificationState;
  notes?: string;
  created_by?: string;
  is_internal_verifier?: boolean;
}

export interface UpdateEvidenceInput {
  title?: string;
  document_id?: string;
  document_title?: string;
  document_file_url?: string;
  issued_date?: string;
  effective_date?: string;
  expiry_date?: string;
  verification_state?: VerificationState;
  notes?: string;
  related_record_state?: RelatedRecordState;
  actor_role?: 'contractor' | 'internal_verifier';
  actor_name?: string;
}
