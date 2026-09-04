/**
 * AVORRIA RESPOND REPOSITORY
 * Phase 11: Hermetic persistence for request invitations, invitation events,
 * contractor responses, and per-requirement acknowledgements.
 *
 * Follows the same hermetic pattern as all prior phases:
 * - Data stored in .data/respond-store.json
 * - No network calls — deterministic across all test environments
 * - State is loaded fresh each call; writes are atomic replace of full store
 */

import fs from 'fs';
import path from 'path';
import {
  RequestInvitation,
  RequestInvitationEvent,
  RequestResponse,
  RequestResponseRequirement,
  InvitationStatus,
  ResponseStatus,
  InvitationEventType,
} from './types';

export interface RespondStoreData {
  invitations: RequestInvitation[];
  invitationEvents: RequestInvitationEvent[];
  responses: RequestResponse[];
  responseRequirements: RequestResponseRequirement[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const RESPOND_FILE = path.join(DATA_DIR, 'respond-store.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadRespondStore(): RespondStoreData {
  ensureDataDir();
  if (!fs.existsSync(RESPOND_FILE)) {
    return {
      invitations: [],
      invitationEvents: [],
      responses: [],
      responseRequirements: [],
    };
  }
  try {
    const raw = fs.readFileSync(RESPOND_FILE, 'utf-8');
    return JSON.parse(raw) as RespondStoreData;
  } catch {
    return {
      invitations: [],
      invitationEvents: [],
      responses: [],
      responseRequirements: [],
    };
  }
}

function saveRespondStore(data: RespondStoreData): void {
  ensureDataDir();
  fs.writeFileSync(RESPOND_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(): string {
  return `ri_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

// ─────────────────────────────────────────────────────────────
// INVITATION CRUD
// ─────────────────────────────────────────────────────────────

export function createInvitation(invitation: Omit<RequestInvitation, 'id' | 'created_at' | 'updated_at'>): RequestInvitation {
  const store = loadRespondStore();

  // Guard: one invitation per contractor per pack
  const existing = store.invitations.find(
    (i) => i.pack_id === invitation.pack_id && i.contractor_id === invitation.contractor_id &&
            !['withdrawn', 'expired', 'declined'].includes(i.status)
  );
  if (existing) {
    throw new Error(`Contractor ${invitation.contractor_id} already has an active invitation for pack ${invitation.pack_id}`);
  }

  const record: RequestInvitation = {
    ...invitation,
    id: generateId(),
    created_at: now(),
    updated_at: now(),
  };

  store.invitations.push(record);
  saveRespondStore(store);
  return record;
}

export function getInvitation(id: string): RequestInvitation | undefined {
  const store = loadRespondStore();
  return store.invitations.find((i) => i.id === id);
}

export function getInvitationsByPack(pack_id: string, tenant_id: string): RequestInvitation[] {
  const store = loadRespondStore();
  return store.invitations.filter((i) => i.pack_id === pack_id && i.tenant_id === tenant_id);
}

export function getInvitationsByContractor(contractor_id: string): RequestInvitation[] {
  const store = loadRespondStore();
  return store.invitations.filter((i) => i.contractor_id === contractor_id);
}

export function updateInvitationStatus(
  id: string,
  status: InvitationStatus,
  fields?: Partial<Pick<RequestInvitation, 'viewed_at' | 'responded_at' | 'sent_at' | 'declined_reason' | 'withdrawn_reason' | 'invitation_message' | 'expires_at'>>
): RequestInvitation {
  const store = loadRespondStore();
  const idx = store.invitations.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error(`Invitation not found: ${id}`);

  store.invitations[idx] = {
    ...store.invitations[idx],
    ...fields,
    status,
    updated_at: now(),
  };

  saveRespondStore(store);
  return store.invitations[idx];
}

// ─────────────────────────────────────────────────────────────
// INVITATION EVENTS (append-only)
// ─────────────────────────────────────────────────────────────

export function appendInvitationEvent(
  event: Omit<RequestInvitationEvent, 'id' | 'created_at'>
): RequestInvitationEvent {
  const store = loadRespondStore();
  const record: RequestInvitationEvent = {
    ...event,
    id: `rie_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    created_at: now(),
  };
  store.invitationEvents.push(record);
  saveRespondStore(store);
  return record;
}

export function getInvitationEvents(invitation_id: string): RequestInvitationEvent[] {
  const store = loadRespondStore();
  return store.invitationEvents
    .filter((e) => e.invitation_id === invitation_id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

// ─────────────────────────────────────────────────────────────
// RESPONSE CRUD
// ─────────────────────────────────────────────────────────────

export function createResponse(
  response: Omit<RequestResponse, 'id' | 'created_at' | 'updated_at' | 'requirement_acknowledgements'>
): RequestResponse {
  const store = loadRespondStore();

  // Guard: one response per invitation
  const existing = store.responses.find((r) => r.invitation_id === response.invitation_id);
  if (existing) {
    throw new Error(`Response already exists for invitation ${response.invitation_id}`);
  }

  const record: RequestResponse = {
    ...response,
    id: `rr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    status: 'draft',
    created_at: now(),
    updated_at: now(),
  };

  store.responses.push(record);
  saveRespondStore(store);
  return record;
}

export function getResponseByInvitation(invitation_id: string): RequestResponse | undefined {
  const store = loadRespondStore();
  return store.responses.find((r) => r.invitation_id === invitation_id);
}

export function getResponseById(id: string): RequestResponse | undefined {
  const store = loadRespondStore();
  return store.responses.find((r) => r.id === id);
}

export function getResponsesByPack(pack_id: string): RequestResponse[] {
  const store = loadRespondStore();
  return store.responses.filter((r) => r.pack_id === pack_id);
}

export function getResponsesByContractor(contractor_id: string): RequestResponse[] {
  const store = loadRespondStore();
  return store.responses.filter((r) => r.contractor_id === contractor_id);
}

export function updateResponse(
  id: string,
  fields: Partial<Omit<RequestResponse, 'id' | 'invitation_id' | 'contractor_id' | 'pack_id' | 'created_at' | 'requirement_acknowledgements'>>
): RequestResponse {
  const store = loadRespondStore();
  const idx = store.responses.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Response not found: ${id}`);

  const current = store.responses[idx];
  // Guard: cannot modify a submitted response (except to withdraw)
  if (current.status === 'submitted' && fields.status !== 'withdrawn') {
    throw new Error('Cannot modify a submitted response. Only withdrawal is permitted.');
  }

  store.responses[idx] = {
    ...current,
    ...fields,
    updated_at: now(),
  };
  saveRespondStore(store);
  return store.responses[idx];
}

// ─────────────────────────────────────────────────────────────
// RESPONSE REQUIREMENTS (per-requirement acknowledgements)
// ─────────────────────────────────────────────────────────────

export function upsertRequirementAcknowledgement(
  acknowledgement: Omit<RequestResponseRequirement, 'id' | 'created_at'>
): RequestResponseRequirement {
  const store = loadRespondStore();

  // Check response is still in draft
  const response = store.responses.find((r) => r.id === acknowledgement.response_id);
  if (!response) throw new Error(`Response not found: ${acknowledgement.response_id}`);
  if (response.status !== 'draft') {
    throw new Error('Cannot modify requirement acknowledgements on a non-draft response.');
  }

  const existingIdx = store.responseRequirements.findIndex(
    (r) => r.response_id === acknowledgement.response_id && r.requirement_id === acknowledgement.requirement_id
  );

  if (existingIdx !== -1) {
    // Update in place (only allowed while draft)
    store.responseRequirements[existingIdx] = {
      ...store.responseRequirements[existingIdx],
      response_status: acknowledgement.response_status,
      contractor_comment: acknowledgement.contractor_comment,
      evidence_reference: acknowledgement.evidence_reference,
    };
    saveRespondStore(store);
    return store.responseRequirements[existingIdx];
  }

  const record: RequestResponseRequirement = {
    ...acknowledgement,
    id: `rrr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    created_at: now(),
  };
  store.responseRequirements.push(record);
  saveRespondStore(store);
  return record;
}

export function getRequirementAcknowledgements(response_id: string): RequestResponseRequirement[] {
  const store = loadRespondStore();
  return store.responseRequirements.filter((r) => r.response_id === response_id);
}

export function getResponseWithAcknowledgements(response_id: string): RequestResponse | undefined {
  const store = loadRespondStore();
  const response = store.responses.find((r) => r.id === response_id);
  if (!response) return undefined;
  return {
    ...response,
    requirement_acknowledgements: store.responseRequirements.filter((r) => r.response_id === response_id),
  };
}

// ─────────────────────────────────────────────────────────────
// UTILITY: Reset store (test environments only)
// ─────────────────────────────────────────────────────────────

export function resetRespondStore(): void {
  saveRespondStore({
    invitations: [],
    invitationEvents: [],
    responses: [],
    responseRequirements: [],
  });
}
