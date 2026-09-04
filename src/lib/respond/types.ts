/**
 * AVORRIA RESPOND DOMAIN TYPES
 * Phase 11: Private Contractor Invitations & Structured Response Engine.
 *
 * Design principles:
 * - Invitation-gated: A contractor can only respond after receiving a valid invitation.
 * - Immutable historical record: once a response is submitted, its snapshot is never rewritten.
 * - Three distinct evidence signals must never collapse:
 *     (1) Contractor's own declaration in response.
 *     (2) Avorria's published evidence at invitation time.
 *     (3) Avorria's formal verification (AV-VER-XXXXXX reference).
 * - No price columns, no ranking, no award mechanics in this phase.
 * - Lifecycle transitions are deterministic and append-only (events log every change).
 */

// ─────────────────────────────────────────────────────────────
// INVITATION LIFECYCLE
// ─────────────────────────────────────────────────────────────

/**
 * Invitation state machine:
 *   draft → sent → viewed → interested | declined
 *   sent | viewed | interested → withdrawn (by client)
 *   sent → expired (by system after expires_at)
 *
 * Terminal states: declined, withdrawn, expired
 */
export type InvitationStatus =
  | 'draft'       // Created but not yet dispatched to contractor
  | 'sent'        // Dispatched — contractor notified, not yet viewed
  | 'viewed'      // Contractor has opened the invitation
  | 'interested'  // Contractor has indicated they intend to respond
  | 'declined'    // Contractor declined to respond
  | 'withdrawn'   // Client withdrew the invitation
  | 'expired';    // Passed expires_at without contractor action

export type InvitationEventType =
  | 'invitation_created'
  | 'invitation_sent'
  | 'invitation_viewed'
  | 'contractor_expressed_interest'
  | 'contractor_declined'
  | 'invitation_withdrawn'
  | 'invitation_expired'
  | 'response_submitted'
  | 'response_withdrawn';

// ─────────────────────────────────────────────────────────────
// RESPONSE LIFECYCLE
// ─────────────────────────────────────────────────────────────

/**
 * Response state machine:
 *   draft → submitted
 *   submitted → withdrawn (contractor may withdraw before any client action)
 *
 * Terminal states: submitted (from client perspective), withdrawn
 */
export type ResponseStatus =
  | 'draft'       // Being built by contractor — not visible to client yet
  | 'submitted'   // Submitted — visible to client in their response centre
  | 'withdrawn';  // Contractor has withdrawn their response

export type AvailabilityStatus =
  | 'available'
  | 'available_with_conditions'
  | 'limited_availability'
  | 'unavailable'
  | 'to_be_confirmed';

/**
 * Contractor's per-requirement acknowledgement.
 * Controlled vocabulary — no free-form binary pass/fail.
 */
export type RequirementResponseStatus =
  | 'confirmed'              // Contractor confirms they meet this requirement
  | 'cannot_confirm'         // Contractor cannot confirm they meet this requirement
  | 'requires_clarification' // Contractor needs clarification before confirming
  | 'not_applicable';        // Contractor considers the requirement outside their scope

// ─────────────────────────────────────────────────────────────
// EVIDENCE SNAPSHOT (taken at invitation time — never mutated)
// ─────────────────────────────────────────────────────────────

/**
 * Snapshot of a contractor's evidence state at the moment of invitation.
 * This is captured once per requirement per invitation and never updated.
 * If contractor evidence changes after invitation, show a delta warning but do NOT mutate the snapshot.
 */
export interface InvitationEvidenceSnapshot {
  requirementId: string;
  requirementTitle: string;
  requirementCategory: string;
  requirementStrength: 'required' | 'preferred' | 'optional';
  /** Evidence state as determined by MATCH_ENGINE_V1 at time of invitation */
  evidenceStateAtInvitation: string; // CanonicalEvidenceState from match types
  evidenceExplanation?: string;
  verificationReference?: string; // AV-VER-XXXXXX if applicable at time
}

// ─────────────────────────────────────────────────────────────
// CORE ENTITIES
// ─────────────────────────────────────────────────────────────

export interface RequestInvitation {
  id: string;

  // Client side
  tenant_id: string;
  pack_id: string;
  invited_by_user_id: string;

  // Match provenance
  match_set_id: string;
  match_engine_version: string;

  // Contractor side
  contractor_id: string;
  contractor_slug?: string;
  contractor_name?: string;

  // Lifecycle
  status: InvitationStatus;

  // Content
  invitation_message?: string;
  declined_reason?: string;
  withdrawn_reason?: string;

  // Snapshot of evidence at invitation time (from match set candidate)
  evidence_snapshot?: InvitationEvidenceSnapshot[];

  // Timestamps
  invited_at?: string;
  sent_at?: string;
  viewed_at?: string;
  responded_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RequestInvitationEvent {
  id: string;
  invitation_id: string;
  tenant_id: string;
  contractor_id: string;
  event_type: InvitationEventType;
  previous_status?: InvitationStatus;
  new_status?: InvitationStatus;
  actor_user_id?: string;
  actor_role?: 'client' | 'contractor' | 'system';
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// RESPONSE ENTITIES
// ─────────────────────────────────────────────────────────────

export interface RequestResponseRequirement {
  id: string;
  response_id: string;
  requirement_id: string;
  contractor_id: string;
  response_status: RequirementResponseStatus;
  contractor_comment?: string;
  evidence_reference?: string;
  created_at: string;
}

export interface RequestResponse {
  id: string;
  invitation_id: string;
  contractor_id: string;
  pack_id: string;
  client_tenant_id?: string;

  // Lifecycle
  status: ResponseStatus;

  // Availability
  availability_status?: AvailabilityStatus;
  proposed_start_date?: string;
  proposed_completion_date?: string;
  availability_notes?: string;

  // Content
  response_notes?: string;

  // Per-requirement acknowledgements (loaded on demand)
  requirement_acknowledgements?: RequestResponseRequirement[];

  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// ENRICHED VIEW TYPES (for UI layer)
// ─────────────────────────────────────────────────────────────

/** Client's view of a single invitation with response summary */
export interface InvitationWithResponseSummary {
  invitation: RequestInvitation;
  response?: RequestResponse;
  /** True if contractor's Passport evidence has changed since snapshot was taken */
  evidenceDriftDetected?: boolean;
}

/** Contractor's inbox item — shows pack summary without exposing client's full requirement data */
export interface ContractorInboxItem {
  invitation: RequestInvitation;
  packTitle: string;
  packDescription?: string;
  packTrades: string[];
  packTerritory?: string;
  requirementCount: number;
  /** Contractor's own response if one exists */
  response?: RequestResponse;
}

/** Per-requirement view shown to contractor during response building */
export interface ContractorResponseRequirementView {
  requirementId: string;
  requirementTitle: string;
  requirementCategory: string;
  requirementStrength: 'required' | 'preferred' | 'optional';
  requirementDescription?: string;
  /** Evidence state as captured in the invitation snapshot */
  evidenceStateAtInvitation: string;
  evidenceExplanation?: string;
  verificationReference?: string;
  /** Contractor's current acknowledgement (undefined if not yet addressed) */
  acknowledgement?: RequestResponseRequirement;
}

// ─────────────────────────────────────────────────────────────
// INPUT TYPES (for API + service layer)
// ─────────────────────────────────────────────────────────────

export interface CreateInvitationInput {
  pack_id: string;
  contractor_id: string;
  contractor_slug?: string;
  contractor_name?: string;
  match_set_id: string;
  match_engine_version?: string;
  invitation_message?: string;
  expires_at?: string;
}

export interface SendInvitationInput {
  invitation_message?: string;
  expires_at?: string;
}

export interface ContractorInterestInput {
  notes?: string;
}

export interface ContractorDeclineInput {
  reason: string;
}

export interface WithdrawInvitationInput {
  reason?: string;
}

export interface UpsertRequirementAcknowledgementInput {
  requirement_id: string;
  response_status: RequirementResponseStatus;
  contractor_comment?: string;
  evidence_reference?: string;
}

export interface SubmitResponseInput {
  availability_status: AvailabilityStatus;
  proposed_start_date?: string;
  proposed_completion_date?: string;
  availability_notes?: string;
  response_notes?: string;
  requirement_acknowledgements: UpsertRequirementAcknowledgementInput[];
}

export interface UpdateResponseDraftInput {
  availability_status?: AvailabilityStatus;
  proposed_start_date?: string;
  proposed_completion_date?: string;
  availability_notes?: string;
  response_notes?: string;
}

// ─────────────────────────────────────────────────────────────
// RESPONSE CENTRE SUMMARY (client view — informational only)
// ─────────────────────────────────────────────────────────────

/**
 * Comparison view for client response centre.
 * This is informational only — no winner/loser ranking, no scoring, no award action.
 */
export interface ResponseCentreSummary {
  pack_id: string;
  invitations: Array<{
    invitation: RequestInvitation;
    response?: RequestResponse;
    confirmedCount: number;
    cannotConfirmCount: number;
    requiresClarificationCount: number;
    notApplicableCount: number;
    unansweredCount: number;
    availabilityStatus?: AvailabilityStatus;
  }>;
}
