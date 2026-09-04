/**
 * AVORRIA RESPOND SERVICE
 * Phase 11: Business logic for invitations, contractor interest/decline,
 * contractor response building, and client response centre.
 *
 * Key invariants enforced here:
 * - Invitations may only be created against an eligible (non-stale) match set candidate.
 * - Evidence snapshots are captured at invitation time from the match set candidate — never re-captured.
 * - Contractor declarations in responses NEVER auto-upgrade evidence state to "Verified".
 * - No pricing, ranking, or award logic exists here.
 */

import {
  RequestInvitation,
  RequestResponse,
  RequestResponseRequirement,
  ContractorInboxItem,
  ContractorResponseRequirementView,
  InvitationWithResponseSummary,
  ResponseCentreSummary,
  CreateInvitationInput,
  SendInvitationInput,
  ContractorDeclineInput,
  WithdrawInvitationInput,
  SubmitResponseInput,
  UpdateResponseDraftInput,
  UpsertRequirementAcknowledgementInput,
  InvitationEvidenceSnapshot,
} from './types';

import {
  createInvitation,
  getInvitation,
  getInvitationsByPack,
  getInvitationsByContractor,
  updateInvitationStatus,
  appendInvitationEvent,
  getInvitationEvents,
  createResponse,
  getResponseByInvitation,
  getResponseById,
  getResponsesByPack,
  getResponsesByContractor,
  updateResponse,
  upsertRequirementAcknowledgement,
  getRequirementAcknowledgements,
  getResponseWithAcknowledgements,
} from './repository';

import { getOrComputeMatchSet } from '@/lib/match/service';
import { getRequirementPackById } from '@/lib/request/repository';

// ─────────────────────────────────────────────────────────────
// CLIENT: CREATE & SEND INVITATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Creates a draft invitation for a contractor from a specific match set.
 * Validates that the contractor exists as an eligible candidate in the match set.
 * Captures the evidence snapshot at this point in time.
 */
export async function createContractorInvitation(
  tenant_id: string,
  invited_by_user_id: string,
  input: CreateInvitationInput
): Promise<RequestInvitation> {
  // Validate match set is current
  const matchSet = await getOrComputeMatchSet(input.pack_id, tenant_id, invited_by_user_id);

  if (matchSet.is_stale) {
    throw new Error(
      'Cannot invite from a stale match set. Please refresh the match set before sending invitations.'
    );
  }

  // Validate contractor is an eligible candidate in this match set
  const candidate = matchSet.candidates.find((c) => c.contractorId === input.contractor_id);
  if (!candidate) {
    throw new Error(
      `Contractor ${input.contractor_id} was not found as an eligible candidate in match set ${input.match_set_id}. Only matched candidates may be invited.`
    );
  }

  // Capture evidence snapshot from match set candidate
  const evidenceSnapshot: InvitationEvidenceSnapshot[] = candidate.requirementResults.map((r) => ({
    requirementId: r.requirementId,
    requirementTitle: r.requirementTitle,
    requirementCategory: r.category,
    requirementStrength: r.strength,
    evidenceStateAtInvitation: r.evidenceState,
    evidenceExplanation: r.explanations?.map((e) => e.message).join('; ') ?? r.publishedInformationSummary,
    verificationReference: candidate.verificationReference,
  }));

  const invitation = createInvitation({
    tenant_id,
    pack_id: input.pack_id,
    invited_by_user_id,
    match_set_id: matchSet.id,
    match_engine_version: matchSet.engine_version,
    contractor_id: input.contractor_id,
    contractor_slug: input.contractor_slug ?? candidate.slug,
    contractor_name: input.contractor_name ?? candidate.businessName,
    status: 'draft',
    invitation_message: input.invitation_message,
    expires_at: input.expires_at,
    evidence_snapshot: evidenceSnapshot,
  });

  appendInvitationEvent({
    invitation_id: invitation.id,
    tenant_id,
    contractor_id: input.contractor_id,
    event_type: 'invitation_created',
    previous_status: undefined,
    new_status: 'draft',
    actor_user_id: invited_by_user_id,
    actor_role: 'client',
    metadata: { match_set_id: matchSet.id, match_engine_version: matchSet.engine_version },
  });

  return invitation;
}

/**
 * Sends a draft invitation to the contractor (transitions draft → sent).
 */
export async function sendInvitation(
  id: string,
  tenant_id: string,
  actor_user_id: string,
  input: SendInvitationInput = {}
): Promise<RequestInvitation> {
  const inv = getInvitation(id);
  if (!inv) throw new Error(`Invitation not found: ${id}`);
  if (inv.tenant_id !== tenant_id) throw new Error('Access denied: invitation belongs to a different tenant.');
  if (inv.status !== 'draft') throw new Error(`Cannot send invitation in status "${inv.status}". Must be "draft".`);

  const updated = updateInvitationStatus(id, 'sent', {
    sent_at: new Date().toISOString(),
    invitation_message: input.invitation_message ?? inv.invitation_message,
    expires_at: input.expires_at ?? inv.expires_at,
  });

  appendInvitationEvent({
    invitation_id: id,
    tenant_id,
    contractor_id: inv.contractor_id,
    event_type: 'invitation_sent',
    previous_status: 'draft',
    new_status: 'sent',
    actor_user_id,
    actor_role: 'client',
  });

  return updated;
}

/**
 * Withdraws a sent invitation (client action). Allowed from: sent, viewed, interested.
 */
export async function withdrawInvitation(
  id: string,
  tenant_id: string,
  actor_user_id: string,
  input: WithdrawInvitationInput = {}
): Promise<RequestInvitation> {
  const inv = getInvitation(id);
  if (!inv) throw new Error(`Invitation not found: ${id}`);
  if (inv.tenant_id !== tenant_id) throw new Error('Access denied.');
  if (!['sent', 'viewed', 'interested'].includes(inv.status)) {
    throw new Error(`Cannot withdraw invitation in status "${inv.status}".`);
  }

  const updated = updateInvitationStatus(id, 'withdrawn', {
    withdrawn_reason: input.reason,
  });

  appendInvitationEvent({
    invitation_id: id,
    tenant_id,
    contractor_id: inv.contractor_id,
    event_type: 'invitation_withdrawn',
    previous_status: inv.status,
    new_status: 'withdrawn',
    actor_user_id,
    actor_role: 'client',
    metadata: { reason: input.reason },
  });

  return updated;
}

/**
 * List all invitations for a given requirement pack (client view).
 */
export function listPackInvitations(pack_id: string, tenant_id: string): RequestInvitation[] {
  return getInvitationsByPack(pack_id, tenant_id);
}

// ─────────────────────────────────────────────────────────────
// CLIENT: RESPONSE CENTRE
// ─────────────────────────────────────────────────────────────

/**
 * Returns the full response centre summary for a pack — all invitations + their responses.
 * Informational only — no ranking, no scoring, no award actions.
 */
export async function getResponseCentre(pack_id: string, tenant_id: string): Promise<ResponseCentreSummary> {
  const invitations = getInvitationsByPack(pack_id, tenant_id);
  const responses = getResponsesByPack(pack_id);

  const items: ResponseCentreSummary['invitations'] = invitations.map((inv) => {
    const response = responses.find((r) => r.invitation_id === inv.id);
    let confirmedCount = 0;
    let cannotConfirmCount = 0;
    let requiresClarificationCount = 0;
    let notApplicableCount = 0;
    let unansweredCount = 0;

    if (response) {
      const acks = getRequirementAcknowledgements(response.id);
      const requirementIds = (inv.evidence_snapshot ?? []).map((s) => s.requirementId);
      confirmedCount = acks.filter((a) => a.response_status === 'confirmed').length;
      cannotConfirmCount = acks.filter((a) => a.response_status === 'cannot_confirm').length;
      requiresClarificationCount = acks.filter((a) => a.response_status === 'requires_clarification').length;
      notApplicableCount = acks.filter((a) => a.response_status === 'not_applicable').length;
      unansweredCount = requirementIds.filter((rid) => !acks.some((a) => a.requirement_id === rid)).length;
    }

    return {
      invitation: inv,
      response,
      confirmedCount,
      cannotConfirmCount,
      requiresClarificationCount,
      notApplicableCount,
      unansweredCount,
      availabilityStatus: response?.availability_status,
    };
  });

  return { pack_id, invitations: items };
}

/**
 * Returns a single invitation with its full response (if any) for the client.
 */
export function getInvitationWithResponse(
  invitation_id: string,
  tenant_id: string
): InvitationWithResponseSummary {
  const inv = getInvitation(invitation_id);
  if (!inv) throw new Error(`Invitation not found: ${invitation_id}`);
  if (inv.tenant_id !== tenant_id) throw new Error('Access denied.');

  const response = getResponseByInvitation(invitation_id);
  const responseWithAcks = response ? getResponseWithAcknowledgements(response.id) : undefined;

  return {
    invitation: inv,
    response: responseWithAcks,
  };
}

// ─────────────────────────────────────────────────────────────
// CONTRACTOR: INBOX
// ─────────────────────────────────────────────────────────────

/**
 * Returns all invitations addressed to a contractor, enriched with pack info.
 */
export async function getContractorInbox(contractor_id: string): Promise<ContractorInboxItem[]> {
  const invitations = getInvitationsByContractor(contractor_id);
  const responses = getResponsesByContractor(contractor_id);

  const items: ContractorInboxItem[] = [];

  for (const inv of invitations) {
    // Load the pack to get title/description — guard against missing packs
    let packTitle = `Project Request ${inv.pack_id.slice(0, 8)}`;
    let packDescription: string | undefined;
    let packTrades: string[] = [];
    let packTerritory: string | undefined;
    let requirementCount = 0;

    try {
      const pack = await getRequirementPackById(inv.pack_id, inv.tenant_id);
      if (pack) {
        packTitle = pack.title;
        packDescription = pack.description;
        packTrades = pack.trades?.map((t) => t.trade_slug) ?? [];
        packTerritory = pack.state;
        requirementCount = pack.requirements?.length ?? 0;
      }
    } catch {
      // Pack not accessible to contractor — use defaults
    }

    const response = responses.find((r) => r.invitation_id === inv.id);

    items.push({
      invitation: inv,
      packTitle,
      packDescription,
      packTrades,
      packTerritory,
      requirementCount,
      response,
    });
  }

  return items.sort((a, b) => {
    // Sort: active first, then by sent_at desc
    const activeStatuses = ['sent', 'viewed', 'interested'];
    const aActive = activeStatuses.includes(a.invitation.status) ? 0 : 1;
    const bActive = activeStatuses.includes(b.invitation.status) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    const aDate = a.invitation.sent_at ?? a.invitation.created_at;
    const bDate = b.invitation.sent_at ?? b.invitation.created_at;
    return bDate.localeCompare(aDate);
  });
}

// ─────────────────────────────────────────────────────────────
// CONTRACTOR: VIEW INVITATION
// ─────────────────────────────────────────────────────────────

/**
 * Contractor views their invitation — auto-advances status from 'sent' → 'viewed'.
 */
export async function viewContractorInvitation(
  invitation_id: string,
  contractor_id: string
): Promise<RequestInvitation> {
  const inv = getInvitation(invitation_id);
  if (!inv) throw new Error(`Invitation not found: ${invitation_id}`);
  if (inv.contractor_id !== contractor_id) throw new Error('Access denied: this invitation is not addressed to you.');

  if (inv.status === 'sent') {
    const updated = updateInvitationStatus(invitation_id, 'viewed', {
      viewed_at: new Date().toISOString(),
    });

    appendInvitationEvent({
      invitation_id,
      tenant_id: inv.tenant_id,
      contractor_id,
      event_type: 'invitation_viewed',
      previous_status: 'sent',
      new_status: 'viewed',
      actor_user_id: contractor_id,
      actor_role: 'contractor',
    });

    return updated;
  }

  return inv;
}

/**
 * Returns the contractor's view of requirements with their evidence snapshot + current acknowledgement.
 */
export async function getContractorResponseRequirementsView(
  invitation_id: string,
  contractor_id: string
): Promise<ContractorResponseRequirementView[]> {
  const inv = getInvitation(invitation_id);
  if (!inv) throw new Error(`Invitation not found: ${invitation_id}`);
  if (inv.contractor_id !== contractor_id) throw new Error('Access denied.');

  const response = getResponseByInvitation(invitation_id);
  const acks = response ? getRequirementAcknowledgements(response.id) : [];

  return (inv.evidence_snapshot ?? []).map((snapshot) => {
    const ack = acks.find((a) => a.requirement_id === snapshot.requirementId);
    return {
      requirementId: snapshot.requirementId,
      requirementTitle: snapshot.requirementTitle,
      requirementCategory: snapshot.requirementCategory,
      requirementStrength: snapshot.requirementStrength,
      evidenceStateAtInvitation: snapshot.evidenceStateAtInvitation,
      evidenceExplanation: snapshot.evidenceExplanation,
      verificationReference: snapshot.verificationReference,
      acknowledgement: ack,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// CONTRACTOR: INTEREST & DECLINE
// ─────────────────────────────────────────────────────────────

/**
 * Contractor expresses interest — advances status to 'interested'.
 * Also initialises a draft response record if one doesn't exist.
 */
export async function expressContractorInterest(
  invitation_id: string,
  contractor_id: string
): Promise<{ invitation: RequestInvitation; response: RequestResponse }> {
  const inv = getInvitation(invitation_id);
  if (!inv) throw new Error(`Invitation not found: ${invitation_id}`);
  if (inv.contractor_id !== contractor_id) throw new Error('Access denied.');
  if (!['sent', 'viewed'].includes(inv.status)) {
    throw new Error(`Cannot express interest on invitation in status "${inv.status}".`);
  }

  const updated = updateInvitationStatus(invitation_id, 'interested');

  appendInvitationEvent({
    invitation_id,
    tenant_id: inv.tenant_id,
    contractor_id,
    event_type: 'contractor_expressed_interest',
    previous_status: inv.status,
    new_status: 'interested',
    actor_user_id: contractor_id,
    actor_role: 'contractor',
  });

  // Initialise draft response if none exists
  let response = getResponseByInvitation(invitation_id);
  if (!response) {
    response = createResponse({
      invitation_id,
      contractor_id,
      pack_id: inv.pack_id,
      client_tenant_id: inv.tenant_id,
      status: 'draft',
    });
  }

  return { invitation: updated, response };
}

/**
 * Contractor declines the invitation.
 */
export async function declineInvitation(
  invitation_id: string,
  contractor_id: string,
  input: ContractorDeclineInput
): Promise<RequestInvitation> {
  const inv = getInvitation(invitation_id);
  if (!inv) throw new Error(`Invitation not found: ${invitation_id}`);
  if (inv.contractor_id !== contractor_id) throw new Error('Access denied.');
  if (!['sent', 'viewed', 'interested'].includes(inv.status)) {
    throw new Error(`Cannot decline invitation in status "${inv.status}".`);
  }

  const updated = updateInvitationStatus(invitation_id, 'declined', {
    declined_reason: input.reason,
    responded_at: new Date().toISOString(),
  });

  appendInvitationEvent({
    invitation_id,
    tenant_id: inv.tenant_id,
    contractor_id,
    event_type: 'contractor_declined',
    previous_status: inv.status,
    new_status: 'declined',
    actor_user_id: contractor_id,
    actor_role: 'contractor',
    metadata: { reason: input.reason },
  });

  return updated;
}

// ─────────────────────────────────────────────────────────────
// CONTRACTOR: RESPONSE BUILDER
// ─────────────────────────────────────────────────────────────

/**
 * Updates a draft response (availability, dates, notes).
 */
export async function updateResponseDraft(
  response_id: string,
  contractor_id: string,
  input: UpdateResponseDraftInput
): Promise<RequestResponse> {
  const response = getResponseById(response_id);
  if (!response) throw new Error(`Response not found: ${response_id}`);
  if (response.contractor_id !== contractor_id) throw new Error('Access denied.');
  if (response.status !== 'draft') throw new Error('Can only update a draft response.');

  return updateResponse(response_id, {
    availability_status: input.availability_status,
    proposed_start_date: input.proposed_start_date,
    proposed_completion_date: input.proposed_completion_date,
    availability_notes: input.availability_notes,
    response_notes: input.response_notes,
  });
}

/**
 * Saves or updates a single requirement acknowledgement on a draft response.
 * Safe to call repeatedly as contractor works through requirements.
 */
export async function saveRequirementAcknowledgement(
  response_id: string,
  contractor_id: string,
  input: UpsertRequirementAcknowledgementInput
): Promise<RequestResponseRequirement> {
  const response = getResponseById(response_id);
  if (!response) throw new Error(`Response not found: ${response_id}`);
  if (response.contractor_id !== contractor_id) throw new Error('Access denied.');
  if (response.status !== 'draft') throw new Error('Can only update acknowledgements on a draft response.');

  return upsertRequirementAcknowledgement({
    response_id,
    requirement_id: input.requirement_id,
    contractor_id,
    response_status: input.response_status,
    contractor_comment: input.contractor_comment,
    evidence_reference: input.evidence_reference,
  });
}

/**
 * Submits the contractor's response — transitions draft → submitted.
 * Validates that availability is declared. Requirement acknowledgements are written
 * from input (allowing final save + submit in one operation).
 *
 * After submission, the snapshot is immutable. No further edits permitted except withdrawal.
 */
export async function submitContractorResponse(
  invitation_id: string,
  contractor_id: string,
  input: SubmitResponseInput
): Promise<RequestResponse> {
  const inv = getInvitation(invitation_id);
  if (!inv) throw new Error(`Invitation not found: ${invitation_id}`);
  if (inv.contractor_id !== contractor_id) throw new Error('Access denied.');
  if (!['interested'].includes(inv.status)) {
    throw new Error(
      `Cannot submit response for invitation in status "${inv.status}". Contractor must first express interest.`
    );
  }

  let response = getResponseByInvitation(invitation_id);
  if (!response) {
    response = createResponse({
      invitation_id,
      contractor_id,
      pack_id: inv.pack_id,
      client_tenant_id: inv.tenant_id,
      status: 'draft',
    });
  }

  if (response.status !== 'draft') {
    throw new Error(`Cannot submit response in status "${response.status}". Only draft responses can be submitted.`);
  }

  // Save all requirement acknowledgements first (while still draft)
  for (const ack of input.requirement_acknowledgements) {
    upsertRequirementAcknowledgement({
      response_id: response.id,
      requirement_id: ack.requirement_id,
      contractor_id,
      response_status: ack.response_status,
      contractor_comment: ack.contractor_comment,
      evidence_reference: ack.evidence_reference,
    });
  }

  // Validate mandatory field
  if (!input.availability_status) {
    throw new Error('Availability status is required before submitting a response.');
  }

  // Submit
  const submitted = updateResponse(response.id, {
    availability_status: input.availability_status,
    proposed_start_date: input.proposed_start_date,
    proposed_completion_date: input.proposed_completion_date,
    availability_notes: input.availability_notes,
    response_notes: input.response_notes,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  });

  // Update invitation: responded_at
  updateInvitationStatus(invitation_id, 'interested', {
    responded_at: new Date().toISOString(),
  });

  appendInvitationEvent({
    invitation_id,
    tenant_id: inv.tenant_id,
    contractor_id,
    event_type: 'response_submitted',
    previous_status: 'interested',
    new_status: 'interested', // Invitation remains "interested" after response; no status change needed
    actor_user_id: contractor_id,
    actor_role: 'contractor',
    metadata: { response_id: response.id, availability: input.availability_status },
  });

  return submitted;
}

/**
 * Contractor withdraws their submitted response.
 */
export async function withdrawContractorResponse(
  response_id: string,
  contractor_id: string
): Promise<RequestResponse> {
  const response = getResponseById(response_id);
  if (!response) throw new Error(`Response not found: ${response_id}`);
  if (response.contractor_id !== contractor_id) throw new Error('Access denied.');
  if (response.status !== 'submitted') {
    throw new Error('Only submitted responses can be withdrawn.');
  }

  const updated = updateResponse(response_id, { status: 'withdrawn' });

  const inv = getInvitation(response.invitation_id);
  if (inv) {
    appendInvitationEvent({
      invitation_id: response.invitation_id,
      tenant_id: inv.tenant_id,
      contractor_id,
      event_type: 'response_withdrawn',
      previous_status: inv.status,
      new_status: inv.status,
      actor_user_id: contractor_id,
      actor_role: 'contractor',
      metadata: { response_id },
    });
  }

  return updated;
}

// ─────────────────────────────────────────────────────────────
// UTILITY: Invitation audit trail
// ─────────────────────────────────────────────────────────────

export function getInvitationAuditTrail(invitation_id: string, tenant_id: string) {
  const inv = getInvitation(invitation_id);
  if (!inv) throw new Error(`Invitation not found: ${invitation_id}`);
  if (inv.tenant_id !== tenant_id) throw new Error('Access denied.');
  return getInvitationEvents(invitation_id);
}
