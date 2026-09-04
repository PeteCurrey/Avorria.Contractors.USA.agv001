/**
 * AVORRIA REQUEST & REQUIREMENT PACK ENGINE VERIFICATION SUITE
 * Phase 9: Structured Project Requests, Requirement Packs & Contractor Response Foundation.
 *
 * Verifies:
 * 1. Pack Creation, Unique Reference (REQ-XXXXXX), and Persistence
 * 2. Multi-Trade Classification Assignment
 * 3. Structured Requirement Item Management & Provenance Tracking
 * 4. Deterministic Readiness Evaluator & Conflict Detection
 * 5. Lifecycle State Machine Transitions (draft -> ready -> active -> closed) & Protection against illegal transitions
 * 6. Duplication Integrity (fresh draft, new reference, preserves requirements, omits attachments)
 * 7. Requirement-to-Evidence Matrix & Candidate Matching Preview
 * 8. Append-Only Audit Event Trail
 */

import {
  createRequirementPack,
  updateRequirementPack,
  transitionPackStatus,
  duplicateRequirementPack,
  addPackTrade,
  removePackTrade,
  addRequirement,
  updateRequirement,
  removeRequirement,
  addAttachment,
  generatePackReference,
} from '../src/lib/request/service';
import {
  getRequirementPackById,
  getRequirementPacksByTenant,
  getPackTrades,
  getPackRequirements,
  getPackAttachments,
  getPackEvents,
} from '../src/lib/request/repository';
import { evaluateRequestReadiness } from '../src/lib/request/readiness';
import { previewContractorMatchesForPack } from '../src/lib/request/matching-preview';
import { getContractorWorkspace, saveOnboardingStep, completeOnboarding, setPassportVisibility } from '../src/lib/tenant/repository';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, description: string, detail?: string) {
  if (condition) {
    console.log(`✅ ${description}`);
    passedCount++;
  } else {
    console.error(`❌ FAILED: ${description}${detail ? ` -> ${detail}` : ''}`);
    failedCount++;
  }
}

async function runRequestEngineSuite() {
  console.log('🚀 Starting Avorria Phase 9 Request & Requirement Pack Engine Verification...\n');

  const CLIENT_TENANT_ID = `test-client-req-${Date.now()}`;
  const CLIENT_USER_ID = 'usr_client_req_tester';

  // ─────────────────────────────────────────────────────────────
  // 1. Reference Generation & Format
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Reference Generation ---');
  const ref1 = generatePackReference();
  const ref2 = generatePackReference();
  assert(/^REQ-[A-Z0-9]{6}$/.test(ref1), `Reference matches format REQ-XXXXXX (${ref1})`);
  assert(ref1 !== ref2, `Generated references are unique (${ref1} !== ${ref2})`);

  // ─────────────────────────────────────────────────────────────
  // 2. Requirement Pack Creation & Persistence
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. Requirement Pack Creation ---');
  const initialPack = await createRequirementPack(
    CLIENT_TENANT_ID,
    CLIENT_USER_ID,
    {
      title: 'Austin Tech Center Switchgear & Distribution Upgrade',
      project_type: 'Commercial Tenant Improvement',
      description: 'Full replacement of main 480V switchgear and secondary distribution boards.',
      scope: 'Demolition of existing switchboard, supply and installation of 2000A main switchgear, testing, and commissioning.',
      state: 'TX',
      city: 'Austin',
      site_address: '100 Congress Ave, Suite 500',
      site_access_notes: 'Loading dock reservation required. After-hours execution only.',
      target_start_date: '2026-11-01',
      target_completion_date: '2026-12-15',
      urgency: 'within_30_days',
      flexibility: 'negotiable',
      value_tier: 'tier_3_100k_250k',
    },
    ['electrical-contracting'],
    [
      {
        category: 'insurance',
        title: 'Commercial General Liability ($2,000,000 Occurrence)',
        description: 'Minimum $2M per occurrence, $4M general aggregate.',
        strength: 'required',
        minimum_value: '$2,000,000 per occurrence',
        evidence_required: true,
        provenance: 'client',
      },
    ]
  );

  assert(Boolean(initialPack.id), `Pack created with ID ${initialPack.id}`);
  assert(initialPack.status === 'draft', `Initial status is "draft" (got ${initialPack.status})`);
  assert(initialPack.tenant_id === CLIENT_TENANT_ID, `Pack owned by tenant ${CLIENT_TENANT_ID}`);
  assert(/^REQ-[A-Z0-9]{6}$/.test(initialPack.reference), `Pack reference is ${initialPack.reference}`);

  const loadedPack = await getRequirementPackById(initialPack.id, CLIENT_TENANT_ID);
  assert(Boolean(loadedPack), 'Pack loaded from hermetic repository');
  assert(loadedPack?.trades?.length === 1, `Assigned trades count is 1 (got ${loadedPack?.trades?.length})`);
  assert(loadedPack?.requirements?.length === 1, `Requirements count is 1 (got ${loadedPack?.requirements?.length})`);

  // ─────────────────────────────────────────────────────────────
  // 3. Multi-Trade Classification Management
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Multi-Trade Management ---');
  await addPackTrade(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, 'low-voltage-telecom');
  let trades = await getPackTrades(initialPack.id, CLIENT_TENANT_ID);
  assert(trades.length === 2, `Added trade: Total trades now 2 (got ${trades.length})`);
  assert(trades.some((t) => t.trade_slug === 'low-voltage-telecom'), 'Added trade slug low-voltage-telecom verified');

  await removePackTrade(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, 'low-voltage-telecom');
  trades = await getPackTrades(initialPack.id, CLIENT_TENANT_ID);
  assert(trades.length === 1, `Removed trade: Total trades reverted to 1 (got ${trades.length})`);

  // ─────────────────────────────────────────────────────────────
  // 4. Structured Requirement Items & Provenance
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Structured Requirement Management ---');
  const reqLicence = await addRequirement(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, {
    category: 'licence',
    title: 'Texas Master Electrician License',
    description: 'Active license in good standing with TDLR.',
    strength: 'required',
    jurisdiction: 'TX',
    evidence_required: true,
    provenance: 'client',
  });
  assert(reqLicence.category === 'licence', `Requirement category is licence (got ${reqLicence.category})`);
  assert(reqLicence.provenance === 'client', `Requirement provenance is client (got ${reqLicence.provenance})`);

  const reqSafety = await addRequirement(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, {
    category: 'safety',
    title: 'Written Site-Specific Health & Safety Plan (HASP)',
    description: 'Compliant with OSHA 29 CFR 1926.',
    strength: 'required',
    evidence_required: true,
    provenance: 'template',
  });
  assert(reqSafety.provenance === 'template', `Template requirement provenance is template (got ${reqSafety.provenance})`);

  const allReqs = await getPackRequirements(initialPack.id, CLIENT_TENANT_ID);
  assert(allReqs.length === 3, `Total pack requirements count is 3 (got ${allReqs.length})`);

  // Update requirement
  const updatedReq = await updateRequirement(
    reqLicence.id,
    initialPack.id,
    CLIENT_TENANT_ID,
    CLIENT_USER_ID,
    { strength: 'required', minimum_value: 'Master Class' }
  );
  assert(updatedReq.minimum_value === 'Master Class', `Updated requirement threshold is Master Class (got ${updatedReq.minimum_value})`);

  // ─────────────────────────────────────────────────────────────
  // 5. Deterministic Readiness Evaluator & Conflict Detection
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. Deterministic Readiness & Conflict Evaluation ---');
  const freshPack = await getRequirementPackById(initialPack.id, CLIENT_TENANT_ID);
  if (!freshPack) throw new Error('Pack not found');

  const readiness1 = evaluateRequestReadiness(freshPack);
  assert(readiness1.isReady === true, `Pack readiness is true (100% complete)`);
  assert(readiness1.completionPercent === 100, `Completion percent is 100%`);
  assert(readiness1.conflicts.length === 0, `Zero conflicts detected`);
  assert(readiness1.statusMessage === 'Ready to identify contractors', `Status message is "Ready to identify contractors"`);

  // Conflict test: Jurisdiction mismatch (Pack in TX, requirement specifying CA)
  const conflictingReq = await addRequirement(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, {
    category: 'licence',
    title: 'California C-10 Electrical License',
    strength: 'required',
    jurisdiction: 'CA', // MISMATCH!
    evidence_required: true,
    provenance: 'client',
  });
  const packWithConflict = await getRequirementPackById(initialPack.id, CLIENT_TENANT_ID);
  const readinessWithConflict = evaluateRequestReadiness(packWithConflict!);
  assert(readinessWithConflict.isReady === false, 'Readiness is false when jurisdiction conflict exists');
  assert(readinessWithConflict.conflicts.length > 0, `Detected ${readinessWithConflict.conflicts.length} conflict(s)`);
  assert(readinessWithConflict.conflicts[0].code === 'JURISDICTION_MISMATCH', `Conflict code is JURISDICTION_MISMATCH`);

  // Clean up conflicting requirement
  await removeRequirement(conflictingReq.id, initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID);

  // ─────────────────────────────────────────────────────────────
  // 6. Lifecycle State Machine Transitions
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. Deterministic Lifecycle Transitions ---');
  // Transition: draft -> ready
  const readyPack = await transitionPackStatus(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, 'ready');
  assert(readyPack.status === 'ready', `Transitioned draft -> ready (got ${readyPack.status})`);

  // Transition: ready -> active
  const activePack = await transitionPackStatus(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, 'active');
  assert(activePack.status === 'active', `Transitioned ready -> active (got ${activePack.status})`);

  // Transition: active -> closed
  const closedPack = await transitionPackStatus(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, 'closed');
  assert(closedPack.status === 'closed', `Transitioned active -> closed (got ${closedPack.status})`);

  // Terminal state protection: closed -> draft MUST FAIL
  let closedToDraftFailed = false;
  try {
    await transitionPackStatus(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, 'draft');
  } catch (err: unknown) {
    closedToDraftFailed = true;
  }
  assert(closedToDraftFailed, 'Strict protection: Illegal transition from closed to draft rejected');

  // ─────────────────────────────────────────────────────────────
  // 7. Request Duplication Integrity
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. Request Duplication Integrity ---');
  // Add a private attachment to test attachment omission on duplication
  await addAttachment(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID, {
    fileName: 'confidential_floorplan.pdf',
    filePath: '/secure/attachments/confidential_floorplan.pdf',
    fileSizeBytes: 1048576,
    mimeType: 'application/pdf',
    description: 'Internal confidential floorplan',
  });

  const duplicatedPack = await duplicateRequirementPack(initialPack.id, CLIENT_TENANT_ID, CLIENT_USER_ID);
  assert(duplicatedPack.id !== initialPack.id, `Duplicated pack has new ID ${duplicatedPack.id}`);
  assert(duplicatedPack.reference !== initialPack.reference, `Duplicated pack has fresh reference ${duplicatedPack.reference}`);
  assert(duplicatedPack.status === 'draft', `Duplicated pack resets to status "draft" (got ${duplicatedPack.status})`);
  assert(duplicatedPack.title.includes('(Copy)'), `Duplicated title includes "(Copy)" (${duplicatedPack.title})`);
  assert(duplicatedPack.trades?.length === 1, `Duplicated pack preserved 1 trade (got ${duplicatedPack.trades?.length})`);
  assert(duplicatedPack.requirements?.length === 3, `Duplicated pack preserved 3 requirements (got ${duplicatedPack.requirements?.length})`);
  assert(duplicatedPack.attachments?.length === 0, `Security verified: Duplication omits attachments (got ${duplicatedPack.attachments?.length})`);

  // ─────────────────────────────────────────────────────────────
  // 8. Requirement-to-Evidence Matrix & Preliminary Candidate Matching
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 8. Requirement-to-Evidence Matching Preview ---');
  // Setup a test published contractor with published credentials
  const CONTRACTOR_ORG_ID = `test-contractor-match-${Date.now()}`;
  const contractorWs = await getContractorWorkspace(CONTRACTOR_ORG_ID);
  await saveOnboardingStep(CONTRACTOR_ORG_ID, 1, {
    businessName: 'Vance Commercial Electric LLC',
    phone: '(512) 555-4022',
    email: 'marcus@vanceelectric.com',
  });
  await saveOnboardingStep(CONTRACTOR_ORG_ID, 2, {
    trades: ['electrical-contracting'],
  });
  await saveOnboardingStep(CONTRACTOR_ORG_ID, 3, {
    primaryState: 'TX',
    cities: ['Austin'],
  });
  await saveOnboardingStep(CONTRACTOR_ORG_ID, 4, {
    credentials: {
      hasGeneralLiability: true,
      hasTradeLicense: true,
      hasSafetyPlan: true,
      hasOshaCard: true,
    },
  });
  await completeOnboarding(CONTRACTOR_ORG_ID);
  await setPassportVisibility(CONTRACTOR_ORG_ID, 'published');

  // Preview matches against duplicated pack
  const matchPreview = await previewContractorMatchesForPack(duplicatedPack);
  assert(matchPreview.totalContractorsEvaluated > 0, `Evaluated published contractors (${matchPreview.totalContractorsEvaluated})`);
  assert(matchPreview.candidates.length > 0, `Found candidate contractors (${matchPreview.candidates.length})`);

  const matchedContractor = matchPreview.candidates.find((c) => c.contractorId === CONTRACTOR_ORG_ID);
  assert(Boolean(matchedContractor), 'Target contractor surfaced in preliminary preview');
  assert(matchedContractor?.tradeMatched === true, 'Trade match verified (electrical-contracting)');
  assert(matchedContractor?.locationMatched === true, 'Location match verified (Austin, TX)');
  assert(matchedContractor?.overallEligible === true, 'Contractor marked overallEligible');

  // Verify Requirement-to-Evidence Matrix rows
  const matrix = matchedContractor?.requirementMatrix || [];
  assert(matrix.length === 3, `Requirement matrix contains 3 rows (got ${matrix.length})`);

  const insRow = matrix.find((r) => r.category === 'insurance');
  assert(Boolean(insRow), 'Insurance row present in matrix');
  assert(
    insRow?.evidenceAlignmentStatus === 'declared' || insRow?.evidenceAlignmentStatus === 'aligned',
    `Insurance alignment status is declared or aligned (got ${insRow?.evidenceAlignmentStatus})`
  );

  const licRow = matrix.find((r) => r.category === 'licence');
  assert(Boolean(licRow), 'Licence row present in matrix');
  assert(
    licRow?.evidenceAlignmentStatus === 'declared' || licRow?.evidenceAlignmentStatus === 'aligned',
    `Licence alignment status is declared or aligned (got ${licRow?.evidenceAlignmentStatus})`
  );

  // ─────────────────────────────────────────────────────────────
  // 9. Append-Only Audit Trail
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 9. Append-Only Audit Event Trail ---');
  const events = await getPackEvents(initialPack.id, CLIENT_TENANT_ID);
  assert(events.length >= 6, `Audit events captured >= 6 events (got ${events.length})`);
  assert(events.some((e) => e.event_type === 'request_created'), 'request_created event recorded');
  assert(events.some((e) => e.event_type === 'request_marked_ready'), 'request_marked_ready event recorded');
  assert(events.some((e) => e.event_type === 'request_activated'), 'request_activated event recorded');
  assert(events.some((e) => e.event_type === 'request_closed'), 'request_closed event recorded');
  assert(events.some((e) => e.event_type === 'request_duplicated'), 'request_duplicated event recorded');

  console.log(`\n🎉 PHASE 9 REQUEST ENGINE TEST SUITE: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runRequestEngineSuite().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
