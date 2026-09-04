/**
 * AVORRIA CONNECT SERVICE LAYER
 * Phase 8: Business logic orchestration for client accounts, relationships, and opportunities.
 */

import {
  getClientProfile,
  saveClientProfile,
  getSavedContractors,
  saveContractor,
  removeSavedContractor,
  getClientRelationships,
  getContractorRelationships,
  getRelationship,
  requestRelationship,
  updateRelationshipStatus,
  getClientOpportunities,
  getOpportunityById,
  saveOpportunity,
  updateOpportunityStatus,
  getOpportunityInvitations,
  getContractorInvitations,
  inviteContractorToOpportunity,
  respondToOpportunityInvitation,
  getConnectNotifications,
} from './repository';
import {
  ClientProfile,
  ClientOrganisationType,
  ClientSavedContractor,
  ContractorRelationship,
  Opportunity,
  OpportunityInvitation,
  RelationshipStatus,
  OpportunityStatus,
  ConnectNotification,
} from './types';
import { getContractorWorkspaceBySlug, getAllPublishedContractors, loadTenantsStore } from '@/lib/tenant/repository';
import { trackEvent } from '@/lib/analytics/events';

// Rate limiter for connection requests (max 10 requests per hour per client)
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const connectionRateMap = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_CONNECTIONS_PER_HOUR = 10;

function checkConnectionRateLimit(clientOrgId: string): boolean {
  const now = Date.now();
  const bucket = connectionRateMap.get(clientOrgId);
  if (!bucket || now > bucket.resetAt) {
    connectionRateMap.set(clientOrgId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_CONNECTIONS_PER_HOUR) {
    return false;
  }
  bucket.count += 1;
  return true;
}

// ─────────────────────────────────────────────────────────────
// 1. CLIENT ACCOUNT ONBOARDING & PROFILE
// ─────────────────────────────────────────────────────────────

export interface CompleteClientOnboardingInput {
  organisationName: string;
  organisationType: ClientOrganisationType;
  contactName: string;
  jobTitle?: string;
  businessEmail: string;
  phone?: string;
  primaryState: string;
  cities?: string[];
  preferredTrades?: string[];
}

export async function completeClientOnboarding(
  clientOrgId: string,
  input: CompleteClientOnboardingInput
): Promise<ClientProfile> {
  const profile: ClientProfile = {
    id: `client_prof_${Date.now()}`,
    organisation_id: clientOrgId,
    organisation_name: input.organisationName.trim(),
    organisation_type: input.organisationType,
    contact_name: input.contactName.trim(),
    job_title: input.jobTitle?.trim(),
    business_email: input.businessEmail.trim(),
    phone: input.phone?.trim(),
    operating_territory: {
      primaryState: input.primaryState.toUpperCase(),
      cities: input.cities || [],
    },
    preferred_trades: input.preferredTrades || [],
    account_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const saved = await saveClientProfile(profile);

  trackEvent('client_onboarding_completed', clientOrgId, {
    organisationType: input.organisationType,
    primaryState: input.primaryState,
  });

  return saved;
}

// ─────────────────────────────────────────────────────────────
// 2. SAVED CONTRACTORS & LOCALSTORAGE SHORTLIST MIGRATION
// ─────────────────────────────────────────────────────────────

export async function syncLocalShortlistToClient(
  clientOrgId: string,
  contractorSlugs: string[]
): Promise<{ addedCount: number; totalSaved: number }> {
  if (!Array.isArray(contractorSlugs) || contractorSlugs.length === 0) {
    const existing = await getSavedContractors(clientOrgId);
    return { addedCount: 0, totalSaved: existing.length };
  }

  const tenants = loadTenantsStore();
  let addedCount = 0;

  for (const slug of contractorSlugs) {
    // Lookup contractor by slug
    const ws = Object.values(tenants).find(
      (t) => t.organisation.slug === slug && t.profile.visibility === 'published'
    );
    if (!ws) continue;

    const saved = await saveContractor(
      clientOrgId,
      ws.organisation.id,
      ws.organisation.slug,
      ws.organisation.name,
      ws.trades[0],
      `${ws.serviceAreas.cities?.[0] || 'Operating Area'}, ${ws.serviceAreas.primaryState || 'TX'}`
    );
    if (saved) addedCount += 1;
  }

  const allSaved = await getSavedContractors(clientOrgId);
  return { addedCount, totalSaved: allSaved.length };
}

// ─────────────────────────────────────────────────────────────
// 3. RELATIONSHIPS WORKFLOW
// ─────────────────────────────────────────────────────────────

export async function initiateContractorConnection(
  clientOrgId: string,
  contractorSlug: string,
  userId: string,
  message?: string
): Promise<{ success: boolean; relationship?: ContractorRelationship; message: string }> {
  // 1. Rate limit
  if (!checkConnectionRateLimit(clientOrgId)) {
    return {
      success: false,
      message: 'Rate limit exceeded: You have reached the maximum number of connection requests for this hour.',
    };
  }

  // 2. Resolve contractor
  const contractorWs = await getContractorWorkspaceBySlug(contractorSlug);
  if (!contractorWs || contractorWs.profile.visibility !== 'published') {
    return {
      success: false,
      message: 'The requested contractor is not available for connection requests.',
    };
  }

  // 3. Create or update relationship
  const rel = await requestRelationship(
    clientOrgId,
    contractorWs.organisation.id,
    userId,
    message
  );

  trackEvent('contractor_connection_requested', clientOrgId, {
    contractorOrgId: contractorWs.organisation.id,
    contractorSlug,
  });

  return {
    success: true,
    relationship: rel,
    message: `Connection request sent to ${contractorWs.organisation.name}.`,
  };
}

export async function respondToContractorConnection(
  relationshipId: string,
  contractorOrgId: string,
  action: 'accept' | 'decline'
): Promise<ContractorRelationship> {
  const targetStatus: RelationshipStatus = action === 'accept' ? 'connected' : 'declined';
  const updated = await updateRelationshipStatus(relationshipId, targetStatus, contractorOrgId);

  trackEvent(
    action === 'accept' ? 'contractor_connection_accepted' : 'contractor_connection_declined',
    contractorOrgId,
    { relationshipId }
  );

  return updated;
}

// ─────────────────────────────────────────────────────────────
// 4. OPPORTUNITIES & INVITATIONS
// ─────────────────────────────────────────────────────────────

export async function createClientOpportunity(
  clientOrgId: string,
  userId: string,
  input: Omit<Opportunity, 'id' | 'client_organisation_id' | 'created_by_user_id' | 'created_at' | 'updated_at'>
): Promise<Opportunity> {
  const opp = await saveOpportunity(clientOrgId, userId, input);

  trackEvent('opportunity_created', clientOrgId, {
    trade: input.trade,
    timeframe: input.timeframe,
  });

  return opp;
}

export async function sendOpportunityInvitation(
  opportunityId: string,
  contractorOrgId: string,
  clientOrgId: string,
  userId: string
): Promise<OpportunityInvitation> {
  const invitation = await inviteContractorToOpportunity(
    opportunityId,
    contractorOrgId,
    clientOrgId,
    userId
  );

  trackEvent('contractor_invited_to_opportunity', clientOrgId, {
    opportunityId,
    contractorOrgId,
  });

  return invitation;
}

export async function replyToOpportunityInvitation(
  invitationId: string,
  contractorOrgId: string,
  decision: 'accepted' | 'declined',
  message?: string
): Promise<OpportunityInvitation> {
  const invitation = await respondToOpportunityInvitation(
    invitationId,
    contractorOrgId,
    decision,
    message
  );

  trackEvent('opportunity_response_received', contractorOrgId, {
    invitationId,
    decision,
  });

  return invitation;
}
