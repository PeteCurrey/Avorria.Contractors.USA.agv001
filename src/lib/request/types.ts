/**
 * AVORRIA REQUEST DOMAIN TYPES
 * Phase 9: Structured Project Requests, Requirement Packs & Contractor Response Foundation.
 *
 * Design principles:
 * - Evidence states use a controlled vocabulary (aligned/declared/not_found/not_applicable/needs_review).
 * - "verified" is NEVER used for requirement matching — only for Avorria-issued AV-VER-XXXXXX records.
 * - Requirement provenance is always explicit and auditable.
 * - Lifecycle transitions are deterministic and irreversible (closed→draft is forbidden).
 */

// ─────────────────────────────────────────────────────────────
// STATUS & CONTROLLED VOCABULARIES
// ─────────────────────────────────────────────────────────────

export type RequirementPackStatus = 'draft' | 'ready' | 'active' | 'closed' | 'cancelled';

export type RequirementCategory =
  | 'insurance'
  | 'licence'
  | 'credential'
  | 'safety'
  | 'evidence'
  | 'scope'
  | 'site'
  | 'other';

export type RequirementStrength = 'required' | 'preferred' | 'optional';

/**
 * Provenance tracks who originated the requirement.
 * AI may suggest but never authorize — only 'client' provenance is effective after client review.
 */
export type RequirementProvenance = 'client' | 'template' | 'ai_suggestion' | 'imported';

export type PackUrgency = 'immediate' | 'within_30_days' | 'within_90_days' | 'flexible' | 'undefined';

export type PackFlexibility = 'fixed' | 'negotiable' | 'flexible' | 'undefined';

export type PackValueTier =
  | 'tier_1_under_25k'
  | 'tier_2_25k_100k'
  | 'tier_3_100k_250k'
  | 'tier_4_250k_1m'
  | 'tier_5_1m_plus'
  | 'undefined';

/**
 * Controlled evidence alignment status.
 * NEVER use 'verified' here — verification is reserved for Avorria AV-VER-XXXXXX workflow.
 */
export type EvidenceAlignmentStatus =
  | 'aligned'        // Contractor's published data directly addresses the requirement
  | 'declared'       // Contractor has declared they meet this but no document evidence is published
  | 'not_found'      // No relevant evidence found in published Passport data
  | 'not_applicable' // Requirement is not applicable to this contractor's trade/scope
  | 'needs_review';  // Evidence found but requires manual assessment

export type RequirementPackEventType =
  | 'request_created'
  | 'request_updated'
  | 'requirement_added'
  | 'requirement_updated'
  | 'requirement_removed'
  | 'trade_added'
  | 'trade_removed'
  | 'attachment_added'
  | 'attachment_removed'
  | 'request_marked_ready'
  | 'request_activated'
  | 'request_closed'
  | 'request_cancelled'
  | 'request_duplicated';

// ─────────────────────────────────────────────────────────────
// CORE ENTITIES
// ─────────────────────────────────────────────────────────────

export interface RequirementItem {
  id: string;
  pack_id: string;
  tenant_id: string;
  category: RequirementCategory;
  requirement_type?: string;  // e.g. 'general_liability', 'trade_license', 'osha_30'
  title: string;
  description?: string;
  strength: RequirementStrength;
  minimum_value?: string;   // Client-defined text, e.g. '$2,000,000 per occurrence' — NOT a financial computation field
  jurisdiction?: string;    // e.g. 'TX' or 'Travis County'
  evidence_required: boolean;
  provenance: RequirementProvenance;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RequirementPackTrade {
  id: string;
  pack_id: string;
  tenant_id: string;
  trade_slug: string;
  trade_name: string;
  created_at: string;
}

export interface RequirementPackAttachment {
  id: string;
  pack_id: string;
  tenant_id: string;
  uploaded_by_user_id: string;
  file_name: string;
  file_path: string;   // Internal storage path — NEVER expose to contractors
  file_size_bytes?: number;
  mime_type?: string;
  description?: string;
  created_at: string;
}

export interface RequirementPackEvent {
  id: string;
  pack_id: string;
  tenant_id: string;
  actor_user_id: string;
  event_type: RequirementPackEventType;
  payload?: Record<string, unknown>;
  created_at: string;
}

export interface RequirementPack {
  id: string;
  tenant_id: string;
  created_by_user_id: string;
  reference: string;    // REQ-XXXXXX — deterministic, unique, non-sequential
  title: string;
  project_type?: string;
  description?: string;
  scope?: string;
  country: string;
  state: string;
  city: string;
  site_address?: string;
  site_access_notes?: string;
  target_start_date?: string;
  target_completion_date?: string;
  urgency: PackUrgency;
  flexibility: PackFlexibility;
  value_tier: PackValueTier;
  status: RequirementPackStatus;
  created_at: string;
  updated_at: string;
  // Populated relations (not stored in pack table)
  trades?: RequirementPackTrade[];
  requirements?: RequirementItem[];
  attachments?: RequirementPackAttachment[];
  events?: RequirementPackEvent[];
}

// ─────────────────────────────────────────────────────────────
// READINESS EVALUATION
// ─────────────────────────────────────────────────────────────

export interface ReadinessCheckItem {
  key: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface ReadinessConflict {
  code: string;
  message: string;
  affectedRequirementIds?: string[];
}

export interface RequestReadinessResult {
  isReady: boolean;
  completionPercent: number;
  checklist: ReadinessCheckItem[];
  conflicts: ReadinessConflict[];
  statusMessage: string;
}

// ─────────────────────────────────────────────────────────────
// PRELIMINARY MATCH PREVIEW (Requirement × Contractor Evidence Matrix)
// ─────────────────────────────────────────────────────────────

/**
 * A single row in the Requirement-to-Evidence matrix.
 * Maps one client requirement against a contractor's published Passport data.
 */
export interface RequirementMatrixRow {
  requirementId: string;
  requirementTitle: string;
  category: RequirementCategory;
  strength: RequirementStrength;
  minimumValue?: string;
  evidenceAlignmentStatus: EvidenceAlignmentStatus;
  evidenceSummary: string;   // Human-readable explanation of why this status was assigned
  publishedDocumentRef?: string;  // e.g. 'COI — Commercial General Liability' — no internal path
}

/**
 * Full match preview for a single contractor against the requirement pack.
 * Presented only to the client — never notifies the contractor.
 */
export interface ContractorMatchPreviewResult {
  contractorId: string;
  slug: string;
  businessName: string;
  primaryTrade: string;
  location: string;
  isVerified: boolean;
  verificationReference?: string;
  tradeMatched: boolean;
  locationMatched: boolean;
  overallEligible: boolean;
  alignedCount: number;      // Requirements with 'aligned' status
  declaredCount: number;     // Requirements with 'declared' status
  notFoundCount: number;     // Requirements with 'not_found' status
  needsReviewCount: number;  // Requirements with 'needs_review' status
  requirementMatrix: RequirementMatrixRow[];
  matchReasons: string[];    // Transparent, deterministic match reason strings
}

export interface PackMatchPreviewResult {
  packId: string;
  packReference: string;
  totalContractorsEvaluated: number;
  eligibleContractorsCount: number;
  verifiedContractorsCount: number;
  candidates: ContractorMatchPreviewResult[];
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// SERVICE INPUT TYPES
// ─────────────────────────────────────────────────────────────

export interface CreateRequirementPackInput {
  title: string;
  project_type?: string;
  description?: string;
  scope?: string;
  state: string;
  city: string;
  site_address?: string;
  site_access_notes?: string;
  target_start_date?: string;
  target_completion_date?: string;
  urgency?: PackUrgency;
  flexibility?: PackFlexibility;
  value_tier?: PackValueTier;
}

export interface UpdateRequirementPackInput {
  title?: string;
  project_type?: string;
  description?: string;
  scope?: string;
  state?: string;
  city?: string;
  site_address?: string;
  site_access_notes?: string;
  target_start_date?: string;
  target_completion_date?: string;
  urgency?: PackUrgency;
  flexibility?: PackFlexibility;
  value_tier?: PackValueTier;
}

export interface AddRequirementInput {
  category: RequirementCategory;
  requirement_type?: string;
  title: string;
  description?: string;
  strength?: RequirementStrength;
  minimum_value?: string;
  jurisdiction?: string;
  evidence_required?: boolean;
  provenance?: RequirementProvenance;
}

export interface UpdateRequirementInput {
  title?: string;
  description?: string;
  strength?: RequirementStrength;
  minimum_value?: string;
  jurisdiction?: string;
  evidence_required?: boolean;
}
