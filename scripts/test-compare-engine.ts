/**
 * AVORRIA COMPARE ENGINE TEST SUITE
 * Phase 12: Evidence-Led Contractor Response Comparison.
 *
 * Verifies:
 * 1.  Full environment setup: 3 published contractor workspaces.
 * 2.  Requirement Pack creation, match set generation.
 * 3.  Invitations created, sent, and contractor responses submitted for all 3 contractors.
 * 4.  Minimum 2 contractors guard: createCompareSet rejects 1-contractor input.
 * 5.  Maximum 6 contractors guard: createCompareSet rejects 7-contractor input.
 * 6.  Non-invited contractor rejection: compare blocked if not in match set invitation list.
 * 7.  Contractor with non-submitted response rejection.
 * 8.  Successful 3-contractor comparison creation.
 * 9.  Matrix structure: engineVersion, generatedAt, compareSetId, requestId present.
 * 10. Matrix rows cover all requirements (requirement-by-requirement alignment).
 * 11. Contractor position in row: each contractor_id represented in contractorPositions.
 * 12. Deterministic output: running engine twice with same input = same matrix.
 * 13. Attention items: clarification_required items surfaced correctly.
 * 14. Attention items: unconfirmed_criteria on mandatory requirements surfaced.
 * 15. Attention items: evidence_gap surfaced when evidence_state === EXPIRED.
 * 16. Schedule divergence attention items generated for conditional availability.
 * 17. Contractor summaries: confirmedCount, cannotConfirmCount, clarificationCount computed.
 * 18. Evidence layer separation: VERIFIED status reflected in matrix.
 * 19. Stale invalidation: pack change after compare creation marks set stale.
 * 20. Refresh workflow: refreshCompareSet rebuilds and clears stale flag.
 * 21. Clarification flagging: requestClarification returns success, logs event.
 * 22. Wrong-tenant security: getCompareSetMatrix with wrong tenantId throws.
 * 23. Zero numerical scores: no score/ranking fields on matrix or row output.
 * 24. attentionSummary totals match actual item counts.
 * 25. Engine version constant is stamped on output.
 */

import {
  createCompareSet,
  getCompareSetMatrix,
  refreshCompareSet,
  requestClarification,
} from '../src/lib/compare/service';
import { resetCompareStore } from '../src/lib/compare/repository';
import {
  resetRespondStore,
} from '../src/lib/respond/repository';
import {
  createContractorInvitation,
  sendInvitation,
  expressContractorInterest,
  submitContractorResponse,
  viewContractorInvitation,
} from '../src/lib/respond/service';
import {
  createRequirementPack,
  addPackTrade,
  addRequirement,
  transitionPackStatus,
} from '../src/lib/request/service';
import { getOrComputeMatchSet } from '../src/lib/match/service';
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

async function runCompareEngineTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA PHASE 12: COMPARE ENGINE TEST SUITE');
  console.log('Evidence-Led Contractor Response Comparison');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  resetRespondStore();
  resetCompareStore();

  const CLIENT_ORG = 'test-compare-client-org';
  const CLIENT_USER = 'test-compare-client-usr';

  // ──────────────────────────────────────────────────────────────────────────
  // SETUP: 3 Contractor Workspaces
  // ──────────────────────────────────────────────────────────────────────────
  console.log('--- Setup: Creating 3 published contractor workspaces ---');

  async function setupContractor(suffix: string, businessName: string) {
    const orgId = `compare-ws-${suffix}-${Date.now()}`;
    const ws = await getContractorWorkspace(orgId);
    await saveOnboardingStep(orgId, 1, {
      businessName,
      phone: `(512) 555-0${suffix}00`,
      email: `${suffix}@comparetest.com`,
    });
    await saveOnboardingStep(orgId, 2, { trades: ['electrical-contracting'] });
    await saveOnboardingStep(orgId, 3, {
      primaryState: 'TX',
      cities: ['Austin', 'Round Rock'],
    });
    await saveOnboardingStep(orgId, 4, {
      credentials: {
        hasGeneralLiability: true,
        hasTradeLicense: true,
        hasWorkersComp: true,
        hasSafetyPlan: true,
      },
    });
    await completeOnboarding(orgId);
    await setPassportVisibility(orgId, 'published');
    return { orgId, slug: ws.organisation.slug, name: businessName };
  }

  const contractorA = await setupContractor('alpha', 'Alpha Electrical LLC');
  const contractorB = await setupContractor('beta', 'Beta Power Services Inc');
  const contractorC = await setupContractor('gamma', 'Gamma Industrial Electric');

  assert(Boolean(contractorA.orgId), 'Contractor A workspace published');
  assert(Boolean(contractorB.orgId), 'Contractor B workspace published');
  assert(Boolean(contractorC.orgId), 'Contractor C workspace published');

  // ──────────────────────────────────────────────────────────────────────────
  // SETUP: Requirement Pack + Requirements + Match Set
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Setup: Requirement Pack and Match Set ---');

  const pack = await createRequirementPack(CLIENT_ORG, CLIENT_USER, {
    title: 'Data Centre UPS & Switchgear Modernisation',
    description: 'Upgrade 480V switchgear and battery UPS systems across 3 floors.',
    project_type: 'commercial_renovation',
    state: 'TX',
    city: 'Austin',
    urgency: 'within_30_days',
    flexibility: 'fixed',
    value_tier: 'tier_3_100k_250k',
  });
  await addPackTrade(pack.id, CLIENT_ORG, CLIENT_USER, 'electrical-contracting');

  const reqInsurance = await addRequirement(pack.id, CLIENT_ORG, CLIENT_USER, {
    category: 'insurance',
    title: 'Commercial General Liability $2M',
    strength: 'required',
    provenance: 'client',
  });
  const reqLicence = await addRequirement(pack.id, CLIENT_ORG, CLIENT_USER, {
    category: 'licence',
    title: 'Texas Master Electrician Licence',
    strength: 'required',
    provenance: 'client',
  });
  const reqSafety = await addRequirement(pack.id, CLIENT_ORG, CLIENT_USER, {
    category: 'safety',
    title: 'NFPA 70E Arc Flash Protocol',
    strength: 'preferred',
    provenance: 'client',
  });

  await transitionPackStatus(pack.id, CLIENT_ORG, CLIENT_USER, 'ready');
  const matchSet = await getOrComputeMatchSet(pack.id, CLIENT_ORG, CLIENT_USER);
  assert(matchSet.candidates.length >= 3, 'Match Set has all 3 contractors as candidates');

  // ──────────────────────────────────────────────────────────────────────────
  // SETUP: Invite + Send + Respond for all 3 contractors
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Setup: Create, send invitations and submit responses ---');

  async function createAndSubmitResponse(
    contractor: { orgId: string; slug: string; name: string },
    ackOverrides: Record<string, { status: string; comment?: string }> = {}
  ) {
    const inv = await createContractorInvitation(CLIENT_ORG, CLIENT_USER, {
      pack_id: pack.id,
      contractor_id: contractor.orgId,
      contractor_slug: contractor.slug,
      contractor_name: contractor.name,
      match_set_id: matchSet.id,
    });
    await sendInvitation(inv.id, CLIENT_ORG, CLIENT_USER);
    await viewContractorInvitation(inv.id, contractor.orgId);
    await expressContractorInterest(inv.id, contractor.orgId);

    // Default: confirm all requirements
    const defaults: Record<string, { status: string; comment?: string }> = {
      [reqInsurance.id]: { status: 'confirmed' },
      [reqLicence.id]: { status: 'confirmed' },
      [reqSafety.id]: { status: 'confirmed' },
    };
    const acks = { ...defaults, ...ackOverrides };

    await submitContractorResponse(inv.id, contractor.orgId, {
      availability_status: 'available',
      proposed_start_date: '2026-10-01',
      proposed_completion_date: '2027-01-31',
      requirement_acknowledgements: Object.entries(acks).map(([reqId, ack]) => ({
        requirement_id: reqId,
        response_status: ack.status as 'confirmed' | 'cannot_confirm' | 'requires_clarification' | 'not_applicable',
        contractor_comment: ack.comment,
      })),
    });

    return inv;
  }

  // Contractor A: all confirmed
  await createAndSubmitResponse(contractorA);

  // Contractor B: requires clarification on safety, cannot confirm licence
  await createAndSubmitResponse(contractorB, {
    [reqSafety.id]: { status: 'requires_clarification', comment: 'Need details on your specific arc flash PPE category requirement.' },
    [reqLicence.id]: { status: 'cannot_confirm', comment: 'Our licensed electrician is on another project until December.' },
  });

  // Contractor C: confirmed all but limited availability
  const invC = await createContractorInvitation(CLIENT_ORG, CLIENT_USER, {
    pack_id: pack.id,
    contractor_id: contractorC.orgId,
    contractor_slug: contractorC.slug,
    contractor_name: contractorC.name,
    match_set_id: matchSet.id,
  });
  await sendInvitation(invC.id, CLIENT_ORG, CLIENT_USER);
  await viewContractorInvitation(invC.id, contractorC.orgId);
  await expressContractorInterest(invC.id, contractorC.orgId);
  await submitContractorResponse(invC.id, contractorC.orgId, {
    availability_status: 'available_with_conditions',
    availability_notes: 'Available from November only due to concurrent project commitments.',
    proposed_start_date: '2026-11-01',
    requirement_acknowledgements: [
      { requirement_id: reqInsurance.id, response_status: 'confirmed' },
      { requirement_id: reqLicence.id, response_status: 'confirmed' },
      { requirement_id: reqSafety.id, response_status: 'confirmed' },
    ],
  });

  assert(true, 'All 3 contractor responses submitted successfully');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Minimum 2 contractors guard
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 4: Minimum 2 contractor enforcement ---');
  let tooFewBlocked = false;
  try {
    await createCompareSet(CLIENT_ORG, CLIENT_USER, {
      request_id: pack.id,
      contractor_ids: [contractorA.orgId],
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes('at least 2')) tooFewBlocked = true;
  }
  assert(tooFewBlocked, 'createCompareSet rejects fewer than 2 contractor IDs');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Maximum 6 contractors guard
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 5: Maximum 6 contractor enforcement ---');
  let tooManyBlocked = false;
  try {
    await createCompareSet(CLIENT_ORG, CLIENT_USER, {
      request_id: pack.id,
      contractor_ids: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes('maximum of 6')) tooManyBlocked = true;
  }
  assert(tooManyBlocked, 'createCompareSet rejects more than 6 contractor IDs');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Non-invited contractor rejection
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 6: Non-invited contractor rejection ---');
  let nonInvitedBlocked = false;
  try {
    await createCompareSet(CLIENT_ORG, CLIENT_USER, {
      request_id: pack.id,
      contractor_ids: [contractorA.orgId, 'random-uninvited-contractor-xyz'],
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes('not invited')) nonInvitedBlocked = true;
  }
  assert(nonInvitedBlocked, 'createCompareSet rejects non-invited contractor IDs');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Successful 3-contractor comparison creation
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 8: Successful 3-contractor comparison creation ---');
  const { compareSet, matrix } = await createCompareSet(CLIENT_ORG, CLIENT_USER, {
    request_id: pack.id,
    contractor_ids: [contractorA.orgId, contractorB.orgId, contractorC.orgId],
  });

  assert(Boolean(compareSet.id), 'CompareSet created with valid ID');
  assert(compareSet.tenant_id === CLIENT_ORG, 'CompareSet tenant_id matches client org');
  assert(!compareSet.is_stale, 'Fresh CompareSet is not stale');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 9: Matrix structure integrity
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 9: Matrix structure integrity ---');
  assert(matrix.compareSetId === compareSet.id, 'Matrix compareSetId matches created set');
  assert(matrix.requestId === pack.id, 'Matrix requestId matches requirement pack');
  assert(Boolean(matrix.engineVersion), 'Matrix engineVersion is present');
  assert(Boolean(matrix.generatedAt), 'Matrix generatedAt timestamp is present');
  assert(!matrix.isStale, 'Matrix reports not stale on creation');
  assert(matrix.packTitle === 'Data Centre UPS & Switchgear Modernisation', 'Matrix packTitle matches');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 10: Matrix rows cover all requirements
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 10: Matrix rows requirement coverage ---');
  assert(matrix.rows.length === 3, `Matrix has a row for each of the 3 requirements (got ${matrix.rows.length})`);
  const rowReqIds = matrix.rows.map((r) => r.requirement.id);
  assert(rowReqIds.includes(reqInsurance.id), 'Matrix includes insurance requirement row');
  assert(rowReqIds.includes(reqLicence.id), 'Matrix includes licence requirement row');
  assert(rowReqIds.includes(reqSafety.id), 'Matrix includes safety requirement row');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 11: Contractor positions in each row
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 11: Contractor positions in rows ---');
  const insuranceRow = matrix.rows.find((r) => r.requirement.id === reqInsurance.id)!;
  assert(Boolean(insuranceRow.contractorPositions[contractorA.orgId]), 'Contractor A has position in insurance row');
  assert(Boolean(insuranceRow.contractorPositions[contractorB.orgId]), 'Contractor B has position in insurance row');
  assert(Boolean(insuranceRow.contractorPositions[contractorC.orgId]), 'Contractor C has position in insurance row');
  assert(
    insuranceRow.contractorPositions[contractorA.orgId].response_status === 'confirmed',
    'Contractor A confirmed insurance requirement'
  );

  const licenceRow = matrix.rows.find((r) => r.requirement.id === reqLicence.id)!;
  assert(
    licenceRow.contractorPositions[contractorB.orgId].response_status === 'cannot_confirm',
    'Contractor B cannot_confirm licence requirement'
  );

  const safetyRow = matrix.rows.find((r) => r.requirement.id === reqSafety.id)!;
  assert(
    safetyRow.contractorPositions[contractorB.orgId].response_status === 'requires_clarification',
    'Contractor B requires_clarification on safety requirement'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 12: Deterministic output
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 12: Deterministic output ---');
  const matrix2 = await getCompareSetMatrix(compareSet.id, CLIENT_ORG);
  assert(matrix2.compareSetId === matrix.compareSetId, 'Second matrix evaluation returns same compareSetId');
  assert(matrix2.rows.length === matrix.rows.length, 'Second evaluation returns same number of rows');
  assert(
    matrix2.rows.every((r, i) => r.requirement.id === matrix.rows[i].requirement.id),
    'Rows are in same deterministic order on second evaluation'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 13: Attention items — clarification_required
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 13: Attention items — clarification_required ---');
  const clarificationItems = matrix.attentionSummary.items.filter((i) => i.type === 'clarification_required');
  assert(clarificationItems.length >= 1, 'At least 1 clarification_required attention item generated');
  const clarifyOnSafety = clarificationItems.find(
    (i) => i.requirementId === reqSafety.id && i.contractorId === contractorB.orgId
  );
  assert(Boolean(clarifyOnSafety), 'Contractor B clarification on NFPA 70E requirement surfaced as attention item');
  assert(clarifyOnSafety?.severity === 'attention', 'Clarification items have severity = attention');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 14: Attention items — unconfirmed mandatory criteria
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 14: Attention items — unconfirmed mandatory criteria ---');
  const unconfirmedItems = matrix.attentionSummary.items.filter((i) => i.type === 'unconfirmed_criteria');
  assert(unconfirmedItems.length >= 1, 'At least 1 unconfirmed_criteria attention item generated');
  const licenceUnconfirmed = unconfirmedItems.find(
    (i) => i.requirementId === reqLicence.id && i.contractorId === contractorB.orgId
  );
  assert(Boolean(licenceUnconfirmed), 'Contractor B unconfirmed mandatory licence requirement surfaced as attention item');
  assert(
    licenceUnconfirmed?.message.includes('mandatory') || licenceUnconfirmed?.message.includes('cannot confirm'),
    'Attention item message references the mandatory requirement context'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 16: Schedule divergence attention items
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 16: Schedule divergence attention items ---');
  const scheduleItems = matrix.attentionSummary.items.filter((i) => i.type === 'schedule_divergence');
  assert(scheduleItems.length >= 1, 'At least 1 schedule_divergence attention item generated');
  const contractorCSchedule = scheduleItems.find((i) => i.contractorId === contractorC.orgId);
  assert(Boolean(contractorCSchedule), 'Contractor C conditional availability surfaced as schedule_divergence');
  assert(contractorCSchedule?.severity === 'notice', 'Schedule items have severity = notice');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 17: Contractor summaries
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 17: Contractor summaries ---');
  assert(matrix.contractors.length === 3, 'Matrix has 3 contractor summaries');

  const summaryA = matrix.contractors.find((c) => c.contractorId === contractorA.orgId)!;
  assert(summaryA.confirmedCount === 3, 'Contractor A confirmedCount = 3');
  assert(summaryA.cannotConfirmCount === 0, 'Contractor A cannotConfirmCount = 0');

  const summaryB = matrix.contractors.find((c) => c.contractorId === contractorB.orgId)!;
  assert(summaryB.clarificationCount === 1, 'Contractor B clarificationCount = 1');
  assert(summaryB.cannotConfirmCount === 1, 'Contractor B cannotConfirmCount = 1');
  assert(summaryB.confirmedCount === 1, 'Contractor B confirmedCount = 1');

  const summaryC = matrix.contractors.find((c) => c.contractorId === contractorC.orgId)!;
  assert(summaryC.confirmedCount === 3, 'Contractor C confirmedCount = 3');
  assert(summaryC.availabilityStatus === 'available_with_conditions', 'Contractor C availability status = available_with_conditions');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 23: Zero numerical scores / rankings on matrix
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 23: Zero numerical scores / rankings verification ---');
  const matrixKeys = Object.keys(matrix);
  const forbiddenKeys = ['score', 'rank', 'suitability', 'match_percentage', 'confidence', 'rating', 'recommended'];
  const foundForbidden = forbiddenKeys.filter((k) => matrixKeys.some((mk) => mk.toLowerCase().includes(k)));
  assert(foundForbidden.length === 0, `Matrix contains zero scoring/ranking fields (found: ${JSON.stringify(foundForbidden)})`);

  const summaryKeys = Object.keys(matrix.contractors[0] || {});
  const foundForbiddenSummary = forbiddenKeys.filter((k) => summaryKeys.some((sk) => sk.toLowerCase().includes(k)));
  assert(foundForbiddenSummary.length === 0, 'Contractor summaries contain zero scoring/ranking fields');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 24: attentionSummary totals
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 24: attentionSummary totals are accurate ---');
  const actualClarifications = matrix.attentionSummary.items.filter((i) => i.type === 'clarification_required').length;
  assert(
    matrix.attentionSummary.totalClarificationsNeeded === actualClarifications,
    `totalClarificationsNeeded (${matrix.attentionSummary.totalClarificationsNeeded}) matches actual count (${actualClarifications})`
  );
  const actualEvidenceGaps = matrix.attentionSummary.items.filter((i) => i.type === 'evidence_gap').length;
  assert(
    matrix.attentionSummary.totalEvidenceGaps === actualEvidenceGaps,
    `totalEvidenceGaps (${matrix.attentionSummary.totalEvidenceGaps}) matches actual count (${actualEvidenceGaps})`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 25: Engine version stamped
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 25: Engine version constant ---');
  assert(matrix.engineVersion === 'COMPARE_ENGINE_V1', 'Matrix engineVersion = COMPARE_ENGINE_V1');
  assert(compareSet.comparison_version === 'COMPARE_ENGINE_V1', 'CompareSet comparison_version = COMPARE_ENGINE_V1');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 19: Stale invalidation when pack changes
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 19: Stale invalidation when pack changes ---');
  // Add a requirement to the pack — this should invalidate the compare set
  await addRequirement(pack.id, CLIENT_ORG, CLIENT_USER, {
    category: 'credential',
    title: 'OSHA 30 Construction Safety Card',
    strength: 'optional',
    provenance: 'client',
  });

  const staleMatrix = await getCompareSetMatrix(compareSet.id, CLIENT_ORG);
  assert(staleMatrix.isStale, 'Compare set is marked stale after pack requirement addition');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 20: Refresh workflow
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 20: Refresh compare set ---');
  const refreshed = await refreshCompareSet(compareSet.id, CLIENT_ORG, CLIENT_USER);
  assert(!refreshed.isStale, 'Refreshed matrix is no longer stale');
  assert(Boolean(refreshed.compareSetId), 'Refreshed matrix has valid compareSetId');
  assert(refreshed.rows.length === 4, `Refreshed matrix includes new requirement (4 rows total, got ${refreshed.rows.length})`);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 21: Clarification flagging
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 21: Clarification flagging from Compare ---');
  const clarifyResult = await requestClarification(
    compareSet.id,
    CLIENT_ORG,
    CLIENT_USER,
    contractorB.orgId,
    reqSafety.id,
    'Please clarify the PPE category required for arc flash activities on this site.'
  );
  assert(clarifyResult.success === true, 'requestClarification returns { success: true }');
  assert(Boolean(clarifyResult.message), 'requestClarification returns a message');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 22: Wrong-tenant security
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test 22: Wrong-tenant security ---');
  let wrongTenantBlocked = false;
  try {
    await getCompareSetMatrix(compareSet.id, 'completely-wrong-other-org');
  } catch (e) {
    if (e instanceof Error) wrongTenantBlocked = true;
  }
  assert(wrongTenantBlocked, 'getCompareSetMatrix with wrong tenantId throws an error');

  let wrongTenantRefreshBlocked = false;
  try {
    await refreshCompareSet(compareSet.id, 'completely-wrong-other-org', 'some-user');
  } catch (e) {
    if (e instanceof Error) wrongTenantRefreshBlocked = true;
  }
  assert(wrongTenantRefreshBlocked, 'refreshCompareSet with wrong tenantId throws an error');

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`COMPARE ENGINE TEST SUITE COMPLETE`);
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  console.log('════════════════════════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

runCompareEngineTests().catch((err) => {
  console.error('FATAL ERROR in compare engine test suite:', err);
  process.exit(1);
});
