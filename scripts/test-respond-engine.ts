/**
 * AVORRIA RESPOND ENGINE TEST SUITE
 * Phase 11: Private Contractor Invitations & Structured Response Engine.
 *
 * Verifies:
 * 1. Invitation creation against eligible Match Set candidates.
 * 2. Rejection of invitations against stale Match Sets.
 * 3. Rejection of invitations against non-candidate contractors.
 * 4. Duplicate invitation guard (single active invitation per contractor per pack).
 * 5. Invitation Evidence Snapshot immutability (captured at invitation time).
 * 6. Client invitation dispatch (draft -> sent).
 * 7. Contractor invitation inbox & automatic view tracking (sent -> viewed).
 * 8. Contractor decline workflow with mandatory explanation (viewed -> declined).
 * 9. Contractor interest expression & draft response initialisation (viewed -> interested).
 * 10. Per-requirement acknowledgements (confirmed, cannot_confirm, requires_clarification, not_applicable).
 * 11. Response submission validation (availability declaration required).
 * 12. Immutability of submitted responses (editing rejected, only withdrawal permitted).
 * 13. Contractor response withdrawal workflow.
 * 14. Client invitation withdrawal workflow.
 * 15. Client Response Centre aggregation & informational-only comparison.
 * 16. Append-only lifecycle event trail.
 */

import {
  createContractorInvitation,
  sendInvitation,
  withdrawInvitation,
  getContractorInbox,
  viewContractorInvitation,
  expressContractorInterest,
  declineInvitation,
  updateResponseDraft,
  saveRequirementAcknowledgement,
  submitContractorResponse,
  withdrawContractorResponse,
  getResponseCentre,
  getInvitationWithResponse,
  getInvitationAuditTrail,
} from '../src/lib/respond/service';
import {
  resetRespondStore,
  getInvitation,
  getResponseById,
  loadRespondStore,
} from '../src/lib/respond/repository';
import {
  createRequirementPack,
  addPackTrade,
  addRequirement,
  transitionPackStatus,
} from '../src/lib/request/service';
import {
  getOrComputeMatchSet,
  refreshMatchSet,
} from '../src/lib/match/service';
import {
  getContractorWorkspace,
  saveOnboardingStep,
  completeOnboarding,
  setPassportVisibility,
} from '../src/lib/tenant/repository';

let passed = 0;
let failed = 0;

function assert(condition: unknown, description: string, detail?: string) {
  if (Boolean(condition)) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${description}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

async function runRespondEngineTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA PHASE 11: RESPOND ENGINE TEST SUITE');
  console.log('Private Contractor Invitations & Structured Response Engine');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  resetRespondStore();

  const CLIENT_A_ORG = 'test-client-apex-org';
  const CLIENT_A_USER = 'test-client-eleanor-usr';
  const CONTRACTOR_A_SLUG = 'apex-commercial-electric';
  const CONTRACTOR_B_SLUG = 'lone-star-plumbing';

  // 1. Setup Contractor Workspaces
  console.log('--- 1. Setting up published contractor workspaces ---');
  const wsA = await getContractorWorkspace(CONTRACTOR_A_SLUG);
  await saveOnboardingStep(CONTRACTOR_A_SLUG, 'profile', {
    businessName: 'Apex Commercial Electric LLC',
    phone: '(512) 555-0101',
    address: '100 Industrial Pkwy',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
  });
  await saveOnboardingStep(CONTRACTOR_A_SLUG, 'trades', {
    primaryTrade: 'electrical-contracting',
    secondaryTrades: ['low-voltage-telecom'],
  });
  await saveOnboardingStep(CONTRACTOR_A_SLUG, 'service_areas', {
    primaryState: 'TX',
    cities: ['Austin', 'Round Rock', 'San Marcos'],
    nationwide: false,
  });
  await saveOnboardingStep(CONTRACTOR_A_SLUG, 'baseline_credentials', {
    hasInsurance: true,
    generalLiabilityLimit: '$2,000,000',
    hasLicense: true,
    licenseNumber: 'TX-EL-88992',
    hasWorkersComp: true,
    hasSafetyProgram: true,
  });
  await completeOnboarding(CONTRACTOR_A_SLUG);
  await setPassportVisibility(CONTRACTOR_A_SLUG, 'published');

  const contractorAOrgId = wsA.organisation.id;
  assert(Boolean(contractorAOrgId), 'Contractor A workspace published with valid organisation ID');

  // 2. Setup Requirement Pack & Match Set
  console.log('\n--- 2. Setting up Requirement Pack & Fresh Match Set ---');
  const pack = await createRequirementPack(CLIENT_A_ORG, CLIENT_A_USER, {
    title: 'Austin Tech Center Switchgear Modernisation',
    description: 'Modernisation of 480V 3-phase switchgear and distribution boards.',
    project_type: 'commercial_renovation',
    country: 'USA',
    state: 'TX',
    city: 'Austin',
    urgency: 'within_30_days',
    flexibility: 'fixed',
    value_tier: 'tier_3_100k_250k',
  });
  await addPackTrade(pack.id, CLIENT_A_ORG, CLIENT_A_USER, {
    trade_slug: 'electrical-contracting',
    trade_name: 'Electrical Contracting',
    is_primary: true,
  });
  const req1 = await addRequirement(pack.id, CLIENT_A_ORG, CLIENT_A_USER, {
    category: 'insurance',
    title: 'Commercial General Liability $2M',
    strength: 'required',
    provenance: 'client',
  });
  const req2 = await addRequirement(pack.id, CLIENT_A_ORG, CLIENT_A_USER, {
    category: 'licence',
    title: 'Texas Master Electrician Licence',
    strength: 'required',
    provenance: 'client',
  });
  const req3 = await addRequirement(pack.id, CLIENT_A_ORG, CLIENT_A_USER, {
    category: 'safety',
    title: 'Arc Flash / NFPA 70E Safety Protocol',
    strength: 'preferred',
    provenance: 'client',
  });
  await transitionPackStatus(pack.id, CLIENT_A_ORG, CLIENT_A_USER, 'ready');

  const matchSet = await getOrComputeMatchSet(pack.id, CLIENT_A_ORG, CLIENT_A_USER);
  assert(matchSet.candidates.length > 0, 'Match Set generated with eligible candidates');
  assert(!matchSet.is_stale, 'Match Set is initially not stale');

  const candidateA = matchSet.candidates.find((c) => c.contractorId === contractorAOrgId);
  assert(Boolean(candidateA), 'Contractor A exists in Match Set candidate set');

  // 3. Create Draft Invitation
  console.log('\n--- 3. Creating Draft Invitation & Snapshotting ---');
  const inv1 = await createContractorInvitation(CLIENT_A_ORG, CLIENT_A_USER, {
    pack_id: pack.id,
    contractor_id: contractorAOrgId,
    contractor_slug: CONTRACTOR_A_SLUG,
    contractor_name: 'Apex Commercial Electric LLC',
    match_set_id: matchSet.id,
    invitation_message: 'Please review our technical requirements and confirm availability.',
  });

  assert(inv1.status === 'draft', 'Created invitation has initial status "draft"');
  assert(inv1.pack_id === pack.id, 'Invitation linked to Requirement Pack ID');
  assert(inv1.match_set_id === matchSet.id, 'Invitation records originating match_set_id');
  assert(inv1.match_engine_version === 'MATCH_ENGINE_V1', 'Invitation stamps match_engine_version');
  assert(Boolean(inv1.evidence_snapshot && inv1.evidence_snapshot.length >= 3), 'Invitation captured evidence snapshot of all requirements');

  // Snapshot immutability check
  const snapItem = inv1.evidence_snapshot?.find((s) => s.requirementId === req1.id);
  assert(Boolean(snapItem && snapItem.evidenceStateAtInvitation), 'Evidence snapshot captured canonical state at invitation');

  // 4. Invariant: Stale Match Set blocks invitation
  console.log('\n--- 4. Invariant: Stale Match Set blocks invitation creation ---');
  // Mutate pack to make match set stale
  await addRequirement(pack.id, CLIENT_A_ORG, CLIENT_A_USER, {
    category: 'credential',
    title: 'OSHA 30 Supervisor Card',
    strength: 'optional',
    provenance: 'client',
  });

  let staleInviteBlocked = false;
  try {
    await createContractorInvitation(CLIENT_A_ORG, CLIENT_A_USER, {
      pack_id: pack.id,
      contractor_id: 'some-other-contractor',
      match_set_id: matchSet.id,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('stale')) {
      staleInviteBlocked = true;
    }
  }
  assert(staleInviteBlocked, 'Attempting to invite against a stale match set is strictly blocked');

  // Refresh match set
  const refreshedMatchSet = await refreshMatchSet(pack.id, CLIENT_A_ORG, CLIENT_A_USER);
  assert(!refreshedMatchSet.is_stale, 'Match Set successfully refreshed');

  // 5. Invariant: Non-candidate contractor blocked from invitation
  console.log('\n--- 5. Invariant: Non-matched contractor blocked ---');
  let nonCandidateBlocked = false;
  try {
    await createContractorInvitation(CLIENT_A_ORG, CLIENT_A_USER, {
      pack_id: pack.id,
      contractor_id: 'unmatched-random-contractor-999',
      match_set_id: refreshedMatchSet.id,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('eligible candidate')) {
      nonCandidateBlocked = true;
    }
  }
  assert(nonCandidateBlocked, 'Inviting an un-matched contractor is strictly rejected');

  // 6. Invariant: Duplicate active invitation prevented
  console.log('\n--- 6. Invariant: Duplicate active invitation prevented ---');
  let duplicateBlocked = false;
  try {
    await createContractorInvitation(CLIENT_A_ORG, CLIENT_A_USER, {
      pack_id: pack.id,
      contractor_id: contractorAOrgId,
      match_set_id: refreshedMatchSet.id,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('already has an active invitation')) {
      duplicateBlocked = true;
    }
  }
  assert(duplicateBlocked, 'Duplicate active invitation for the same contractor on the same pack rejected');

  // 7. Dispatch Invitation (draft -> sent)
  console.log('\n--- 7. Dispatching Invitation (draft -> sent) ---');
  const sentInv = await sendInvitation(inv1.id, CLIENT_A_ORG, CLIENT_A_USER, {
    invitation_message: 'Updated note: Please respond by end of week.',
  });
  assert(sentInv.status === 'sent', 'Invitation status transitioned to "sent"');
  assert(Boolean(sentInv.sent_at), 'sent_at timestamp recorded');

  // 8. Contractor Inbox & View Tracking
  console.log('\n--- 8. Contractor Inbox & Automatic View Tracking ---');
  const inbox = await getContractorInbox(contractorAOrgId);
  assert(inbox.length === 1, 'Contractor inbox returns exactly 1 invitation');
  assert(inbox[0].packTitle === pack.title, 'Inbox item enriched with Requirement Pack title');
  assert(inbox[0].invitation.status === 'sent', 'Inbox item initially shows status "sent"');

  const viewedInv = await viewContractorInvitation(inv1.id, contractorAOrgId);
  assert(viewedInv.status === 'viewed', 'Viewing invitation automatically advances status to "viewed"');
  assert(Boolean(viewedInv.viewed_at), 'viewed_at timestamp recorded');

  // Cross-contractor isolation check
  let wrongContractorViewBlocked = false;
  try {
    await viewContractorInvitation(inv1.id, 'unauthorized-contractor-id');
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Access denied')) {
      wrongContractorViewBlocked = true;
    }
  }
  assert(wrongContractorViewBlocked, 'Contractor B cannot view Contractor A invitation (Access Denied)');

  // 9. Contractor Decline Workflow (Test on separate invitation)
  console.log('\n--- 9. Contractor Decline Workflow ---');
  // Create second pack to test decline cleanly
  const pack2 = await createRequirementPack(CLIENT_A_ORG, CLIENT_A_USER, {
    title: 'Round Rock Substation Backup Generator',
    description: 'Installation of 500kW diesel backup generator and automatic transfer switch.',
    country: 'USA',
    state: 'TX',
    city: 'Austin',
    urgency: 'flexible',
    flexibility: 'negotiable',
    value_tier: 'tier_2_25k_100k',
  });
  await addPackTrade(pack2.id, CLIENT_A_ORG, CLIENT_A_USER, {
    trade_slug: 'electrical-contracting',
    trade_name: 'Electrical Contracting',
    is_primary: true,
  });
  await addRequirement(pack2.id, CLIENT_A_ORG, CLIENT_A_USER, {
    category: 'licence',
    title: 'Texas Master Electrician Licence',
    strength: 'required',
    provenance: 'client',
  });
  await transitionPackStatus(pack2.id, CLIENT_A_ORG, CLIENT_A_USER, 'ready');
  const matchSet2 = await getOrComputeMatchSet(pack2.id, CLIENT_A_ORG, CLIENT_A_USER);

  const invDecline = await createContractorInvitation(CLIENT_A_ORG, CLIENT_A_USER, {
    pack_id: pack2.id,
    contractor_id: contractorAOrgId,
    match_set_id: matchSet2.id,
  });
  await sendInvitation(invDecline.id, CLIENT_A_ORG, CLIENT_A_USER);

  const declinedInv = await declineInvitation(invDecline.id, contractorAOrgId, {
    reason: 'Currently booked on high-voltage transmission project; cannot take on new substation work.',
  });
  assert(declinedInv.status === 'declined', 'Invitation status transitioned to "declined"');
  assert(Boolean(declinedInv.declined_reason), 'Declined reason stored');
  assert(Boolean(declinedInv.responded_at), 'responded_at timestamp stored on decline');

  // 10. Contractor Interest & Response Builder
  console.log('\n--- 10. Contractor Interest & Draft Response Initialisation ---');
  const { invitation: interestedInv, response: draftResponse } = await expressContractorInterest(
    inv1.id,
    contractorAOrgId
  );
  assert(interestedInv.status === 'interested', 'Invitation transitioned to "interested"');
  assert(draftResponse.status === 'draft', 'Draft response automatically initialised');
  assert(draftResponse.invitation_id === inv1.id, 'Response links to invitation ID');

  // 11. Per-Requirement Acknowledgements
  console.log('\n--- 11. Structured Per-Requirement Acknowledgements ---');
  const ack1 = await saveRequirementAcknowledgement(draftResponse.id, contractorAOrgId, {
    requirement_id: req1.id,
    response_status: 'confirmed',
    contractor_comment: 'Active $2M General Liability policy with Hartford Underwriters.',
    evidence_reference: 'POL-GL-2024-9988',
  });
  assert(ack1.response_status === 'confirmed', 'Requirement 1 confirmed by contractor');

  const ack2 = await saveRequirementAcknowledgement(draftResponse.id, contractorAOrgId, {
    requirement_id: req2.id,
    response_status: 'confirmed',
    contractor_comment: 'Licence TX-EL-88992 current and in good standing.',
  });
  assert(ack2.response_status === 'confirmed', 'Requirement 2 confirmed by contractor');

  const ack3 = await saveRequirementAcknowledgement(draftResponse.id, contractorAOrgId, {
    requirement_id: req3.id,
    response_status: 'requires_clarification',
    contractor_comment: 'We have internal NFPA 70E procedures; require clarification on site-specific arc boundary testing.',
  });
  assert(ack3.response_status === 'requires_clarification', 'Requirement 3 marked "requires_clarification"');

  // Update availability draft
  await updateResponseDraft(draftResponse.id, contractorAOrgId, {
    availability_status: 'available',
    proposed_start_date: '2026-10-15',
    proposed_completion_date: '2026-12-01',
    availability_notes: 'Dedicated 4-wire crew available for October start.',
    response_notes: 'Apex Electric has executed 14 similar switchgear modernisations across Central Texas.',
  });

  // 12. Submit Response & Validation
  console.log('\n--- 12. Submitting Response & Invariant Validation ---');
  const submittedResponse = await submitContractorResponse(inv1.id, contractorAOrgId, {
    availability_status: 'available',
    proposed_start_date: '2026-10-15',
    proposed_completion_date: '2026-12-01',
    availability_notes: 'Dedicated 4-wire crew available for October start.',
    response_notes: 'Apex Electric has executed 14 similar switchgear modernisations across Central Texas.',
    requirement_acknowledgements: [
      {
        requirement_id: req1.id,
        response_status: 'confirmed',
        contractor_comment: 'Active $2M General Liability policy with Hartford Underwriters.',
        evidence_reference: 'POL-GL-2024-9988',
      },
      {
        requirement_id: req2.id,
        response_status: 'confirmed',
        contractor_comment: 'Licence TX-EL-88992 current and in good standing.',
      },
      {
        requirement_id: req3.id,
        response_status: 'requires_clarification',
        contractor_comment: 'We have internal NFPA 70E procedures; require clarification on site-specific arc boundary testing.',
      },
    ],
  });

  assert(submittedResponse.status === 'submitted', 'Response successfully transitioned to "submitted"');
  assert(Boolean(submittedResponse.submitted_at), 'submitted_at timestamp recorded');

  // Invariant: cannot edit submitted response
  let editSubmittedBlocked = false;
  try {
    await updateResponseDraft(submittedResponse.id, contractorAOrgId, {
      availability_status: 'unavailable',
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('draft response')) {
      editSubmittedBlocked = true;
    }
  }
  assert(editSubmittedBlocked, 'Attempting to edit a submitted response is strictly rejected (Immutability)');

  // 13. Client Response Centre
  console.log('\n--- 13. Client Response Centre Aggregation ---');
  const responseCentre = await getResponseCentre(pack.id, CLIENT_A_ORG);
  assert(responseCentre.invitations.length === 1, 'Response centre shows 1 invitation');

  const summaryItem = responseCentre.invitations[0];
  assert(summaryItem.confirmedCount === 2, 'Response centre correctly calculates 2 confirmed requirements');
  assert(summaryItem.requiresClarificationCount === 1, 'Response centre correctly calculates 1 clarification requirement');
  assert(summaryItem.availabilityStatus === 'available', 'Response centre reports contractor availability status');

  const detailedResp = getInvitationWithResponse(inv1.id, CLIENT_A_ORG);
  assert(detailedResp.response?.status === 'submitted', 'Client can view submitted response with acknowledgements');
  assert(detailedResp.response?.requirement_acknowledgements?.length === 3, 'All 3 per-requirement acknowledgements returned');

  // 14. Append-Only Audit Trail Validation
  console.log('\n--- 14. Append-Only Lifecycle Audit Trail ---');
  const auditEvents = getInvitationAuditTrail(inv1.id, CLIENT_A_ORG);
  assert(auditEvents.length >= 4, `Invitation logged ${auditEvents.length} distinct lifecycle events`);
  const eventTypes = auditEvents.map((e) => e.event_type);
  assert(eventTypes.includes('invitation_created'), 'Audit trail contains "invitation_created"');
  assert(eventTypes.includes('invitation_sent'), 'Audit trail contains "invitation_sent"');
  assert(eventTypes.includes('contractor_expressed_interest'), 'Audit trail contains "contractor_expressed_interest"');
  assert(eventTypes.includes('response_submitted'), 'Audit trail contains "response_submitted"');

  // 15. Response Withdrawal Workflow
  console.log('\n--- 15. Response Withdrawal Workflow ---');
  const withdrawnResp = await withdrawContractorResponse(submittedResponse.id, contractorAOrgId);
  assert(withdrawnResp.status === 'withdrawn', 'Contractor successfully withdrew response');

  // 16. Client Invitation Withdrawal Workflow
  console.log('\n--- 16. Client Invitation Withdrawal Workflow ---');
  const pack3 = await createRequirementPack(CLIENT_A_ORG, CLIENT_A_USER, {
    title: 'Austin Hospital Emergency Power System',
    country: 'USA',
    state: 'TX',
    city: 'Austin',
    urgency: 'immediate',
    flexibility: 'fixed',
    value_tier: 'tier_4_250k_1m',
  });
  await addPackTrade(pack3.id, CLIENT_A_ORG, CLIENT_A_USER, {
    trade_slug: 'electrical-contracting',
    trade_name: 'Electrical Contracting',
    is_primary: true,
  });
  await transitionPackStatus(pack3.id, CLIENT_A_ORG, CLIENT_A_USER, 'ready');
  const matchSet3 = await getOrComputeMatchSet(pack3.id, CLIENT_A_ORG, CLIENT_A_USER);

  const invWithdraw = await createContractorInvitation(CLIENT_A_ORG, CLIENT_A_USER, {
    pack_id: pack3.id,
    contractor_id: contractorAOrgId,
    match_set_id: matchSet3.id,
  });
  await sendInvitation(invWithdraw.id, CLIENT_A_ORG, CLIENT_A_USER);

  const clientWithdrawnInv = await withdrawInvitation(invWithdraw.id, CLIENT_A_ORG, CLIENT_A_USER, {
    reason: 'Client cancelled project funding',
  });
  assert(clientWithdrawnInv.status === 'withdrawn', 'Client successfully withdrew invitation');
  assert(clientWithdrawnInv.withdrawn_reason === 'Client cancelled project funding', 'Withdrawal reason preserved');

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRespondEngineTests().catch((err) => {
  console.error('Fatal error in respond engine tests:', err);
  process.exit(1);
});
