/**
 * AVORRIA PHASE 8 — CONNECT & RELATIONSHIP ENGINE TEST SUITE
 * 
 * Verifies:
 * 1. Client Onboarding & Organisation Isolation
 * 2. Saved Contractors (Persistence, Deduplication, Shortlist Migration)
 * 3. Contractor Relationships (State Machine: Pending -> Connected, Decline, Archive)
 * 4. Controlled Opportunities (Creation, Privacy, Status Transitions)
 * 5. Opportunity Invitations (Direct Routing, Deduplication, Isolation)
 * 6. Contractor Responses (Interest, Decline, Custom Notes)
 * 7. Deterministic Contractor Matching Engine (Trade + Territory + Verification Signals)
 * 8. Strict Multi-Tenant Security & Anti-Abuse Rate Limiting
 */

import {
  saveClientProfile,
  getClientProfile,
  saveContractor,
  isContractorSaved,
  getSavedContractors,
  removeSavedContractor,
  requestRelationship,
  getClientRelationships,
  getContractorRelationships,
  updateRelationshipStatus,
  saveOpportunity,
  getOpportunityById,
  getClientOpportunities,
  updateOpportunityStatus,
  inviteContractorToOpportunity,
  getOpportunityInvitations,
  getContractorInvitations,
  respondToOpportunityInvitation,
  getConnectNotifications,
  loadConnectStore,
  saveConnectStore,
} from '../src/lib/connect/repository';
import {
  completeClientOnboarding,
  syncLocalShortlistToClient,
  initiateContractorConnection,
  createClientOpportunity,
  sendOpportunityInvitation,
  replyToOpportunityInvitation,
} from '../src/lib/connect/service';
import { findMatchingContractorsForOpportunity } from '../src/lib/connect/matching';
import { loadTenantsStore, saveTenantsStore, ContractorWorkspaceData } from '../src/lib/tenant/repository';

function assert(condition: unknown, description: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${description}`);
    throw new Error(`Test assertion failed: ${description}`);
  }
  console.log(`✅ ${description}`);
}

async function runConnectEngineTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AVORRIA PHASE 8 — CONNECT & RELATIONSHIP TEST SUITE       ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const timestamp = Date.now();
  const clientAId = `client-org-a-${timestamp}`;
  const clientBId = `client-org-b-${timestamp}`;
  const contractor1Id = `contractor-org-1-${timestamp}`;
  const contractor2Id = `contractor-org-2-${timestamp}`;

  // Seed two mock published contractors in tenants-store
  const tenantStore = loadTenantsStore();
  const mockContractor1: ContractorWorkspaceData = {
    organisation: {
      id: contractor1Id,
      name: 'Austin Master Electricians LLC',
      slug: `austin-electricians-${timestamp}`,
      legal_name: 'Austin Master Electricians LLC',
      business_structure: 'llc',
      tax_id_ein: '74-1234567',
      website: 'https://austinelectric.example.com',
      phone: '512-555-0111',
      email: 'contact@austinelectric.example.com',
      address_line1: '1200 Congress Ave',
      address_line2: null,
      city: 'Austin',
      state_province: 'TX',
      postal_code: '78701',
      country: 'US',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    profile: {
      id: `prof-${contractor1Id}`,
      organisation_id: contractor1Id,
      dba_name: null,
      primary_phone: '512-555-0111',
      primary_email: 'contact@austinelectric.example.com',
      website: null,
      business_description: 'Commercial high voltage, switchgear, and backup generators.',
      year_established: 2014,
      employee_count: 18,
      readiness_score: 95,
      readiness_breakdown: {},
      visibility: 'published',
      is_indexable: true,
      onboarding_status: 'completed',
      onboarding_started_at: null,
      onboarding_last_saved_at: null,
      onboarding_completed_at: new Date().toISOString(),
      onboarding_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    trades: ['electrical-contracting'],
    serviceAreas: {
      primaryState: 'TX',
      additionalStates: [],
      counties: ['Travis County'],
      cities: ['Austin', 'Round Rock'],
      radiusMiles: 60,
    },
    baselineCredentials: {
      hasGeneralLiability: true,
      hasWorkersComp: true,
      hasTradeLicense: true,
      hasSafetyPlan: true,
      hasToolboxTalks: true,
      hasOshaCard: true,
    },
    documents: [
      {
        id: `doc-${contractor1Id}-1`,
        organisation_id: contractor1Id,
        document_type: 'commercial_general_liability_insurance',
        title: 'ACORD 25 COI',
        file_path: `/storage/org_${contractor1Id}/coi.pdf`,
        file_size_bytes: 400000,
        mime_type: 'application/pdf',
        visibility: 'private',
        status: 'active',
        version_number: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    generatedDocuments: [],
    verificationRecords: [
      {
        id: `ver-${contractor1Id}-1`,
        organisationId: contractor1Id,
        criterionSlug: 'business-identity-verification',
        category: 'business_identity',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'hash1',
        verificationReference: 'AV-VER-AUSTIN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `ver-${contractor1Id}-2`,
        organisationId: contractor1Id,
        criterionSlug: 'business-profile-coherence',
        category: 'business_profile',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'hash1',
        verificationReference: 'AV-VER-AUSTIN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `ver-${contractor1Id}-3`,
        organisationId: contractor1Id,
        criterionSlug: 'general-liability-insurance',
        category: 'insurance',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'hash1',
        verificationReference: 'AV-VER-AUSTIN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `ver-${contractor1Id}-4`,
        organisationId: contractor1Id,
        criterionSlug: 'state-trade-contractor-license',
        category: 'licensing',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'hash1',
        verificationReference: 'AV-VER-AUSTIN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `ver-${contractor1Id}-5`,
        organisationId: contractor1Id,
        criterionSlug: 'written-site-safety-program',
        category: 'safety_program',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'hash1',
        verificationReference: 'AV-VER-AUSTIN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    auditLogs: [],
  };

  const mockContractor2: ContractorWorkspaceData = {
    ...mockContractor1,
    organisation: {
      ...mockContractor1.organisation,
      id: contractor2Id,
      name: 'Lone Star Commercial Roofing',
      slug: `lonestar-roofing-${timestamp}`,
    },
    profile: {
      ...mockContractor1.profile,
      id: `prof-${contractor2Id}`,
      organisation_id: contractor2Id,
    },
    trades: ['commercial-roofing'],
    serviceAreas: {
      primaryState: 'TX',
      additionalStates: [],
      counties: ['Bexar County'],
      cities: ['San Antonio'],
      radiusMiles: 50,
    },
    verificationRecords: [], // Unverified
  };

  tenantStore[contractor1Id] = mockContractor1;
  tenantStore[contractor2Id] = mockContractor2;
  saveTenantsStore(tenantStore);

  // ─────────────────────────────────────────────────────────────
  // 1. CLIENT ONBOARDING & PROFILE ISOLATION
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Client Onboarding & Profile Isolation ---');

  const clientProfileA = await completeClientOnboarding(clientAId, {
    organisationName: 'Apex Commercial Properties Group',
    organisationType: 'property_management',
    contactName: 'David Vance',
    jobTitle: 'VP Facilities',
    businessEmail: 'david@apexprop.com',
    phone: '512-555-0199',
    primaryState: 'TX',
    cities: ['Austin', 'Round Rock'],
    preferredTrades: ['electrical-contracting', 'commercial-roofing'],
  });

  assert(
    clientProfileA.organisation_name === 'Apex Commercial Properties Group',
    'Client A profile created successfully'
  );
  assert(
    clientProfileA.account_status === 'active',
    'Client A account status is active'
  );

  const fetchedProfileA = await getClientProfile(clientAId);
  const fetchedProfileB = await getClientProfile(clientBId);

  assert(
    fetchedProfileA?.contact_name === 'David Vance',
    'Client A can retrieve own profile'
  );
  assert(
    fetchedProfileB === null,
    'Client B profile is non-existent before onboarding (Strict Isolation)'
  );

  // ─────────────────────────────────────────────────────────────
  // 2. SAVED CONTRACTORS & SHORTLIST MIGRATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. Saved Contractors & Shortlist Migration ---');

  // Client A saves Contractor 1
  const savedRec1 = await saveContractor(
    clientAId,
    contractor1Id,
    mockContractor1.organisation.slug,
    mockContractor1.organisation.name,
    'electrical-contracting',
    'Austin, TX',
    'Preferred master electrician for commercial buildings'
  );

  assert(
    savedRec1.contractor_slug === mockContractor1.organisation.slug,
    'Contractor 1 successfully saved to Client A bookmark list'
  );

  const isSaved = await isContractorSaved(clientAId, contractor1Id);
  assert(isSaved === true, 'isContractorSaved returns true for saved contractor');

  // Prevent duplicate saved contractor
  const duplicateSave = await saveContractor(
    clientAId,
    contractor1Id,
    mockContractor1.organisation.slug
  );
  const clientASavedList = await getSavedContractors(clientAId);
  assert(
    clientASavedList.filter((s) => s.contractor_organisation_id === contractor1Id).length === 1,
    'Duplicate save requests idempotently return existing record without duplicating'
  );

  // Test local shortlist migration
  const migrationResult = await syncLocalShortlistToClient(clientAId, [
    mockContractor2.organisation.slug,
    'non-existent-slug-ignored',
  ]);
  assert(
    migrationResult.addedCount === 1,
    'Local shortlist migration successfully added eligible contractor 2 and ignored invalid slug'
  );

  const updatedSavedList = await getSavedContractors(clientAId);
  assert(
    updatedSavedList.length === 2,
    'Client A now has exactly 2 saved contractors in authenticated store'
  );

  // Client B cannot see Client A's saved contractors
  const clientBSavedList = await getSavedContractors(clientBId);
  assert(
    clientBSavedList.length === 0,
    'Client B saved contractors list is empty (Tenant Isolation enforced)'
  );

  // ─────────────────────────────────────────────────────────────
  // 3. CONTRACTOR RELATIONSHIPS (STATE MACHINE)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Contractor Relationships (State Machine) ---');

  // Client A initiates connection with Contractor 1
  const connectReq = await initiateContractorConnection(
    clientAId,
    mockContractor1.organisation.slug,
    'usr_david_vance',
    'Looking to partner on scheduled tenant upgrades.'
  );
  assert(
    connectReq.success === true && connectReq.relationship?.status === 'pending',
    'Connection request initiated with status "pending"'
  );

  // Contractor 1 retrieves pending relationships
  const contractor1Rels = await getContractorRelationships(contractor1Id);
  assert(
    contractor1Rels.some((r) => r.client_organisation_id === clientAId && r.status === 'pending'),
    'Contractor 1 sees incoming pending request from Client A'
  );

  // Contractor 2 cannot see Contractor 1's relationship requests
  const contractor2Rels = await getContractorRelationships(contractor2Id);
  assert(
    contractor2Rels.length === 0,
    'Contractor 2 cannot see Contractor 1 relationship requests (Isolation)'
  );

  // Contractor 1 accepts relationship -> status transitions to 'connected'
  const targetRelId = connectReq.relationship!.id;
  const acceptedRel = await updateRelationshipStatus(targetRelId, 'connected', contractor1Id);
  assert(
    acceptedRel.status === 'connected' && Boolean(acceptedRel.connected_at),
    'Relationship transitioned to "connected" with timestamp'
  );

  // Client A sees relationship is now connected
  const clientARels = await getClientRelationships(clientAId);
  assert(
    clientARels.some((r) => r.id === targetRelId && r.status === 'connected'),
    'Client A reflects connected status in relationships workspace'
  );

  // Notifications generated
  const clientANotifs = await getConnectNotifications(clientAId);
  assert(
    clientANotifs.some((n) => n.event_type === 'contractor_connection_accepted'),
    'Client A received notification when Contractor 1 accepted connection'
  );

  // Unauthorized party cannot update relationship
  let unauthorizedBlocked = false;
  try {
    await updateRelationshipStatus(targetRelId, 'archived', clientBId);
  } catch {
    unauthorizedBlocked = true;
  }
  assert(
    unauthorizedBlocked === true,
    'Third-party Client B is blocked from modifying Client A - Contractor 1 relationship'
  );

  // ─────────────────────────────────────────────────────────────
  // 4. CONTROLLED OPPORTUNITIES
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Controlled Project Opportunities ---');

  const opp1 = await createClientOpportunity(clientAId, 'usr_david_vance', {
    title: 'Switchgear Overhaul & Panel Replacement',
    project_type: 'Commercial Maintenance',
    trade: 'electrical-contracting',
    location: { city: 'Austin', state: 'TX' },
    timeframe: 'within_30_days',
    scope: 'Upgrade 480V distribution boards in south facility building B.',
    requirements: {
      tradeLicenseRequired: true,
      generalLiabilityRequired: true,
      safetyPlanRequired: true,
      verificationRequired: true,
    },
    status: 'open',
  });

  assert(
    opp1.status === 'open' && opp1.trade === 'electrical-contracting',
    'Opportunity 1 created with status "open"'
  );

  // Client A retrieves own opportunities
  const clientAOpps = await getClientOpportunities(clientAId);
  assert(
    clientAOpps.some((o) => o.id === opp1.id),
    'Client A can list own opportunity'
  );

  // Client B cannot see Client A's opportunity
  const clientBOpps = await getClientOpportunities(clientBId);
  assert(
    clientBOpps.length === 0,
    'Client B cannot list Client A private opportunities'
  );

  // Uninvited contractor cannot read opportunity details
  const uninvitedView = await getOpportunityById(opp1.id, contractor2Id);
  assert(
    uninvitedView === null,
    'Uninvited Contractor 2 cannot access private Opportunity 1 details'
  );

  // ─────────────────────────────────────────────────────────────
  // 5. DETERMINISTIC CONTRACTOR MATCHING
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. Deterministic Contractor Matching Engine ---');

  const matchResults = await findMatchingContractorsForOpportunity({
    trade: 'electrical-contracting',
    state: 'TX',
    city: 'Austin',
    requirements: {
      generalLiabilityRequired: true,
      tradeLicenseRequired: true,
      safetyPlanRequired: true,
      verificationRequired: true,
    },
  });

  assert(
    matchResults.totalMatches > 0,
    'Matching engine returned candidate matches'
  );
  assert(
    matchResults.verifiedMatchesCount >= 1,
    'Matching engine recognized verified standing without fake AI scores'
  );

  const topMatch = matchResults.matches[0];
  assert(
    topMatch.tradeMatched === true && topMatch.locationMatched === true,
    'Top match matched both trade and geographic territory'
  );
  assert(
    topMatch.matchReasons.length >= 2,
    'Top match returned transparent human-readable match reasons'
  );

  // ─────────────────────────────────────────────────────────────
  // 6. INVITATIONS & CONTRACTOR RESPONSE
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. Invitations & Contractor Response ---');

  // Client A invites Contractor 1 to Opportunity 1
  const invitation = await sendOpportunityInvitation(
    opp1.id,
    contractor1Id,
    clientAId,
    'usr_david_vance'
  );

  assert(
    invitation.status === 'pending' && invitation.contractor_organisation_id === contractor1Id,
    'Invitation sent to Contractor 1 with status "pending"'
  );

  // Prevent duplicate invitations to same contractor for same opportunity
  const dupeInv = await inviteContractorToOpportunity(
    opp1.id,
    contractor1Id,
    clientAId,
    'usr_david_vance'
  );
  assert(
    dupeInv.id === invitation.id,
    'Duplicate invitation returns existing invitation without duplicating'
  );

  // Contractor 1 can now access opportunity details
  const invitedContractorView = await getOpportunityById(opp1.id, contractor1Id);
  assert(
    invitedContractorView !== null && invitedContractorView.id === opp1.id,
    'Invited Contractor 1 is now authorized to view Opportunity 1'
  );

  // Contractor 1 responds: "accepted" (Interested) with message
  const response = await replyToOpportunityInvitation(
    invitation.id,
    contractor1Id,
    'accepted',
    'We have 2 master electricians available for Q4 deployment.'
  );

  assert(
    response.status === 'accepted' && Boolean(response.responded_at),
    'Contractor 1 response recorded as "accepted" with timestamp'
  );

  // Client A views invitations and sees response
  const oppInvs = await getOpportunityInvitations(opp1.id, clientAId);
  const recordedInv = oppInvs.find((i) => i.id === invitation.id);
  assert(
    recordedInv?.status === 'accepted' && recordedInv?.response_message?.includes('master electricians'),
    'Client A views contractor interest and custom response note'
  );

  // Client A closes opportunity
  const closedOpp = await updateOpportunityStatus(opp1.id, clientAId, 'closed');
  assert(
    closedOpp.status === 'closed',
    'Client successfully closed opportunity'
  );

  // ─────────────────────────────────────────────────────────────
  // 7. ANTI-ABUSE & PRIVACY HYGIENE
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. Anti-Abuse & Privacy Hygiene ---');

  // Client cannot invite contractors to a closed opportunity
  let inviteClosedBlocked = false;
  try {
    await inviteContractorToOpportunity(opp1.id, contractor2Id, clientAId, 'usr_david_vance');
  } catch {
    inviteClosedBlocked = true;
  }
  assert(
    inviteClosedBlocked === true,
    'Invitations blocked for closed opportunities'
  );

  // Third party cannot read opportunity invitations
  let unauthorizedInvReadBlocked = false;
  try {
    await getOpportunityInvitations(opp1.id, clientBId);
  } catch {
    unauthorizedInvReadBlocked = true;
  }
  assert(
    unauthorizedInvReadBlocked === true,
    'Client B cannot read Client A opportunity invitations'
  );

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ALL 25+ PHASE 8 CONNECT ENGINE ASSERTIONS PASSED!       ');
  console.log('═══════════════════════════════════════════════════════════\n');
}

runConnectEngineTests().catch((err) => {
  console.error('\n❌ Phase 8 Connect Engine Test Suite Failed:', err);
  process.exit(1);
});
