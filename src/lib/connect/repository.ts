/**
 * AVORRIA CONNECT REPOSITORY
 * Phase 8: Hermetic persistence for client profiles, saved contractors,
 * relationships, opportunities, invitations, and audit notifications.
 */

import fs from 'fs';
import path from 'path';
import {
  ClientProfile,
  ClientSavedContractor,
  ContractorRelationship,
  Opportunity,
  OpportunityInvitation,
  ConnectNotification,
  RelationshipStatus,
  OpportunityStatus,
  InvitationStatus,
} from './types';
import { loadTenantsStore } from '@/lib/tenant/repository';

export interface ConnectStoreData {
  clients: Record<string, ClientProfile>; // keyed by client_organisation_id
  savedContractors: ClientSavedContractor[];
  relationships: ContractorRelationship[];
  opportunities: Opportunity[];
  invitations: OpportunityInvitation[];
  notifications: ConnectNotification[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const CONNECT_FILE = path.join(DATA_DIR, 'connect-store.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadConnectStore(): ConnectStoreData {
  ensureDataDir();
  if (!fs.existsSync(CONNECT_FILE)) {
    return {
      clients: {},
      savedContractors: [],
      relationships: [],
      opportunities: [],
      invitations: [],
      notifications: [],
    };
  }
  try {
    const raw = fs.readFileSync(CONNECT_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      clients: parsed.clients || {},
      savedContractors: parsed.savedContractors || [],
      relationships: parsed.relationships || [],
      opportunities: parsed.opportunities || [],
      invitations: parsed.invitations || [],
      notifications: parsed.notifications || [],
    };
  } catch {
    return {
      clients: {},
      savedContractors: [],
      relationships: [],
      opportunities: [],
      invitations: [],
      notifications: [],
    };
  }
}

export function saveConnectStore(store: ConnectStoreData): void {
  ensureDataDir();
  fs.writeFileSync(CONNECT_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────
// 1. CLIENT PROFILES
// ─────────────────────────────────────────────────────────────

export async function getClientProfile(clientOrgId: string): Promise<ClientProfile | null> {
  const store = loadConnectStore();
  return store.clients[clientOrgId] || null;
}

export async function saveClientProfile(profile: ClientProfile): Promise<ClientProfile> {
  const store = loadConnectStore();
  store.clients[profile.organisation_id] = {
    ...profile,
    updated_at: new Date().toISOString(),
  };
  saveConnectStore(store);
  return store.clients[profile.organisation_id];
}

// ─────────────────────────────────────────────────────────────
// 2. SAVED CONTRACTORS
// ─────────────────────────────────────────────────────────────

export async function getSavedContractors(clientOrgId: string): Promise<ClientSavedContractor[]> {
  const store = loadConnectStore();
  return store.savedContractors.filter((s) => s.client_organisation_id === clientOrgId);
}

export async function isContractorSaved(clientOrgId: string, contractorOrgId: string): Promise<boolean> {
  const store = loadConnectStore();
  return store.savedContractors.some(
    (s) => s.client_organisation_id === clientOrgId && s.contractor_organisation_id === contractorOrgId
  );
}

export async function saveContractor(
  clientOrgId: string,
  contractorOrgId: string,
  contractorSlug: string,
  contractorName?: string,
  trade?: string,
  location?: string,
  notes?: string
): Promise<ClientSavedContractor> {
  const store = loadConnectStore();
  const existing = store.savedContractors.find(
    (s) => s.client_organisation_id === clientOrgId && s.contractor_organisation_id === contractorOrgId
  );
  if (existing) {
    if (notes) existing.notes = notes;
    saveConnectStore(store);
    return existing;
  }

  const record: ClientSavedContractor = {
    id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    client_organisation_id: clientOrgId,
    contractor_organisation_id: contractorOrgId,
    contractor_slug: contractorSlug,
    contractor_name: contractorName,
    trade,
    location,
    notes,
    created_at: new Date().toISOString(),
  };

  store.savedContractors.unshift(record);
  saveConnectStore(store);
  return record;
}

export async function removeSavedContractor(clientOrgId: string, contractorOrgId: string): Promise<boolean> {
  const store = loadConnectStore();
  const initialLength = store.savedContractors.length;
  store.savedContractors = store.savedContractors.filter(
    (s) => !(s.client_organisation_id === clientOrgId && s.contractor_organisation_id === contractorOrgId)
  );
  const removed = store.savedContractors.length < initialLength;
  if (removed) saveConnectStore(store);
  return removed;
}

// ─────────────────────────────────────────────────────────────
// 3. CONTRACTOR RELATIONSHIPS
// ─────────────────────────────────────────────────────────────

export async function getClientRelationships(clientOrgId: string): Promise<ContractorRelationship[]> {
  const store = loadConnectStore();
  return store.relationships.filter((r) => r.client_organisation_id === clientOrgId);
}

export async function getContractorRelationships(contractorOrgId: string): Promise<ContractorRelationship[]> {
  const store = loadConnectStore();
  return store.relationships.filter((r) => r.contractor_organisation_id === contractorOrgId);
}

export async function getRelationship(
  clientOrgId: string,
  contractorOrgId: string
): Promise<ContractorRelationship | null> {
  const store = loadConnectStore();
  return (
    store.relationships.find(
      (r) => r.client_organisation_id === clientOrgId && r.contractor_organisation_id === contractorOrgId
    ) || null
  );
}

export async function requestRelationship(
  clientOrgId: string,
  contractorOrgId: string,
  initiatorUserId: string,
  message?: string
): Promise<ContractorRelationship> {
  const store = loadConnectStore();
  const existing = store.relationships.find(
    (r) => r.client_organisation_id === clientOrgId && r.contractor_organisation_id === contractorOrgId
  );

  // Lookup names from stores
  const clientProfile = store.clients[clientOrgId];
  const tenants = loadTenantsStore();
  const contractorWs = tenants[contractorOrgId];

  const now = new Date().toISOString();

  if (existing) {
    if (existing.status === 'declined' || existing.status === 'archived') {
      existing.status = 'pending';
      existing.message = message;
      existing.updated_at = now;
      saveConnectStore(store);
      return existing;
    }
    return existing;
  }

  const relationship: ContractorRelationship = {
    id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    client_organisation_id: clientOrgId,
    client_name: clientProfile?.organisation_name || 'Commercial Client',
    contractor_organisation_id: contractorOrgId,
    contractor_name: contractorWs?.organisation.name || 'Contractor',
    contractor_slug: contractorWs?.organisation.slug,
    initiated_by: 'client',
    initiator_user_id: initiatorUserId,
    status: 'pending',
    message,
    created_at: now,
    updated_at: now,
  };

  store.relationships.unshift(relationship);

  // Create notification for contractor
  store.notifications.unshift({
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recipient_organisation_id: contractorOrgId,
    sender_organisation_id: clientOrgId,
    event_type: 'contractor_connection_requested',
    title: 'New Connection Request',
    message: `${relationship.client_name} requested to connect with your business network.`,
    entity_id: relationship.id,
    entity_type: 'relationship',
    is_read: false,
    created_at: now,
  });

  saveConnectStore(store);
  return relationship;
}

export async function updateRelationshipStatus(
  relationshipId: string,
  newStatus: RelationshipStatus,
  authorOrgId: string
): Promise<ContractorRelationship> {
  const store = loadConnectStore();
  const rel = store.relationships.find((r) => r.id === relationshipId);
  if (!rel) throw new Error(`Relationship ${relationshipId} not found`);

  // Authorize: author must be client OR contractor party
  if (rel.client_organisation_id !== authorOrgId && rel.contractor_organisation_id !== authorOrgId) {
    throw new Error('Unauthorized: You are not a party to this relationship');
  }

  const now = new Date().toISOString();
  rel.status = newStatus;
  rel.updated_at = now;

  if (newStatus === 'connected') {
    rel.connected_at = now;
    // Notify client
    store.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recipient_organisation_id: rel.client_organisation_id,
      sender_organisation_id: rel.contractor_organisation_id,
      event_type: 'contractor_connection_accepted',
      title: 'Connection Accepted',
      message: `${rel.contractor_name} accepted your connection request.`,
      entity_id: rel.id,
      entity_type: 'relationship',
      is_read: false,
      created_at: now,
    });
  } else if (newStatus === 'archived') {
    rel.archived_at = now;
  }

  saveConnectStore(store);
  return rel;
}

// ─────────────────────────────────────────────────────────────
// 4. OPPORTUNITIES
// ─────────────────────────────────────────────────────────────

export async function getClientOpportunities(clientOrgId: string): Promise<Opportunity[]> {
  const store = loadConnectStore();
  const opps = store.opportunities.filter((o) => o.client_organisation_id === clientOrgId);
  // Augment with invitation metrics
  return opps.map((opp) => {
    const invs = store.invitations.filter((i) => i.opportunity_id === opp.id);
    return {
      ...opp,
      invitationsCount: invs.length,
      acceptedCount: invs.filter((i) => i.status === 'accepted').length,
    };
  });
}

export async function getOpportunityById(
  opportunityId: string,
  requestingOrgId?: string
): Promise<Opportunity | null> {
  const store = loadConnectStore();
  const opp = store.opportunities.find((o) => o.id === opportunityId);
  if (!opp) return null;

  // If requestingOrgId is provided, enforce access: must be client owner OR invited contractor
  if (requestingOrgId) {
    const isClientOwner = opp.client_organisation_id === requestingOrgId;
    const isInvited = store.invitations.some(
      (i) => i.opportunity_id === opportunityId && i.contractor_organisation_id === requestingOrgId
    );
    if (!isClientOwner && !isInvited) {
      return null;
    }
  }

  const invs = store.invitations.filter((i) => i.opportunity_id === opp.id);
  return {
    ...opp,
    invitationsCount: invs.length,
    acceptedCount: invs.filter((i) => i.status === 'accepted').length,
  };
}

export async function saveOpportunity(
  clientOrgId: string,
  userId: string,
  data: Omit<Opportunity, 'id' | 'client_organisation_id' | 'created_by_user_id' | 'created_at' | 'updated_at'>
): Promise<Opportunity> {
  const store = loadConnectStore();
  const client = store.clients[clientOrgId];
  const now = new Date().toISOString();

  const opp: Opportunity = {
    ...data,
    id: `opp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    client_organisation_id: clientOrgId,
    client_name: client?.organisation_name || 'Commercial Client',
    created_by_user_id: userId,
    status: data.status || 'open',
    created_at: now,
    updated_at: now,
  };

  store.opportunities.unshift(opp);
  saveConnectStore(store);
  return opp;
}

export async function updateOpportunityStatus(
  opportunityId: string,
  clientOrgId: string,
  newStatus: OpportunityStatus
): Promise<Opportunity> {
  const store = loadConnectStore();
  const opp = store.opportunities.find((o) => o.id === opportunityId);
  if (!opp) throw new Error(`Opportunity ${opportunityId} not found`);
  if (opp.client_organisation_id !== clientOrgId) {
    throw new Error('Unauthorized: Only the client owner can update this opportunity');
  }

  opp.status = newStatus;
  opp.updated_at = new Date().toISOString();
  saveConnectStore(store);
  return opp;
}

// ─────────────────────────────────────────────────────────────
// 5. OPPORTUNITY INVITATIONS & RESPONSES
// ─────────────────────────────────────────────────────────────

export async function getOpportunityInvitations(
  opportunityId: string,
  clientOrgId: string
): Promise<OpportunityInvitation[]> {
  const store = loadConnectStore();
  const opp = store.opportunities.find((o) => o.id === opportunityId);
  if (!opp || opp.client_organisation_id !== clientOrgId) {
    throw new Error('Unauthorized: You do not own this opportunity');
  }
  return store.invitations.filter((i) => i.opportunity_id === opportunityId);
}

export async function getContractorInvitations(contractorOrgId: string): Promise<OpportunityInvitation[]> {
  const store = loadConnectStore();
  return store.invitations.filter((i) => i.contractor_organisation_id === contractorOrgId);
}

export async function inviteContractorToOpportunity(
  opportunityId: string,
  contractorOrgId: string,
  clientOrgId: string,
  userId: string
): Promise<OpportunityInvitation> {
  const store = loadConnectStore();
  const opp = store.opportunities.find((o) => o.id === opportunityId);
  if (!opp || opp.client_organisation_id !== clientOrgId) {
    throw new Error('Unauthorized: You do not own this opportunity');
  }
  if (opp.status !== 'open') {
    throw new Error('Cannot invite contractors to a closed or cancelled opportunity');
  }

  // Prevent duplicate invitations
  const existing = store.invitations.find(
    (i) => i.opportunity_id === opportunityId && i.contractor_organisation_id === contractorOrgId
  );
  if (existing) return existing;

  const tenants = loadTenantsStore();
  const contractorWs = tenants[contractorOrgId];
  const now = new Date().toISOString();

  const invitation: OpportunityInvitation = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    opportunity_id: opportunityId,
    opportunity_title: opp.title,
    opportunity_trade: opp.trade,
    opportunity_location: { city: opp.location.city, state: opp.location.state },
    client_organisation_id: clientOrgId,
    client_name: opp.client_name,
    contractor_organisation_id: contractorOrgId,
    contractor_name: contractorWs?.organisation.name || 'Contractor',
    contractor_slug: contractorWs?.organisation.slug,
    invited_by_user_id: userId,
    status: 'pending',
    invited_at: now,
  };

  store.invitations.unshift(invitation);

  // Notify contractor
  store.notifications.unshift({
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recipient_organisation_id: contractorOrgId,
    sender_organisation_id: clientOrgId,
    event_type: 'contractor_invited_to_opportunity',
    title: 'New Opportunity Invitation',
    message: `${opp.client_name} invited you to project: "${opp.title}"`,
    entity_id: opportunityId,
    entity_type: 'opportunity',
    is_read: false,
    created_at: now,
  });

  saveConnectStore(store);
  return invitation;
}

export async function respondToOpportunityInvitation(
  invitationId: string,
  contractorOrgId: string,
  decision: 'accepted' | 'declined',
  message?: string
): Promise<OpportunityInvitation> {
  const store = loadConnectStore();
  const inv = store.invitations.find((i) => i.id === invitationId);
  if (!inv) throw new Error(`Invitation ${invitationId} not found`);
  if (inv.contractor_organisation_id !== contractorOrgId) {
    throw new Error('Unauthorized: You are not the invited contractor');
  }

  const now = new Date().toISOString();
  inv.status = decision;
  inv.responded_at = now;
  if (message) inv.response_message = message;

  // Notify client
  store.notifications.unshift({
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recipient_organisation_id: inv.client_organisation_id,
    sender_organisation_id: contractorOrgId,
    event_type: 'opportunity_response_received',
    title: `Contractor ${decision === 'accepted' ? 'Interested' : 'Declined'}`,
    message: `${inv.contractor_name} responded: ${decision === 'accepted' ? 'Interested in project' : 'Declined invitation'}.`,
    entity_id: inv.opportunity_id,
    entity_type: 'opportunity',
    is_read: false,
    created_at: now,
  });

  saveConnectStore(store);
  return inv;
}

// ─────────────────────────────────────────────────────────────
// 6. NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

export async function getConnectNotifications(orgId: string): Promise<ConnectNotification[]> {
  const store = loadConnectStore();
  return store.notifications.filter((n) => n.recipient_organisation_id === orgId);
}
