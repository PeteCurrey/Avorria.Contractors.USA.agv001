/**
 * AVORRIA PROVE ENGINE — INTEGRATION & DYNAMIC DATE BOUNDARY TESTS
 *
 * Verifies:
 * 1. Evidence CRUD and isolation
 * 2. Claim -> Record -> Evidence -> Verification model integrity
 * 3. Separation of Record Lifecycle vs Verification State
 * 4. Dynamic Freshness Boundary calculations:
 *    - today (0 days, 2 hours) -> "Updated today"
 *    - yesterday (1 day) -> "Updated yesterday"
 *    - recent (< 7 days) -> "Updated X days ago"
 *    - weeks (< 30 days) -> "Updated X weeks ago"
 *    - months (< 365 days) -> "Last updated X months ago"
 *    - missing / null timestamp -> "Evidence date not recorded"
 * 5. Evidence completeness aggregation across all Avorria domains
 * 6. Detection of unsupported records (evidence needed)
 * 7. Verification request workflow (marking for auditor review)
 */

import { getRelativeFreshness, getFreshnessTier, formatVerificationTimestamp } from '../src/lib/prove/freshness';
import {
  listEvidence,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  getEvidence,
  requestReview,
  getEvidencePosition,
  getUnsupportedRecords,
  getEvidenceCompleteness,
} from '../src/lib/prove/prove-store';

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

async function runProveEngineTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA PROVE: EVIDENCE, VERIFICATION & TRUST LAYER TESTS');
  console.log('Phase 7: Dynamic Date Boundaries, Domain Completeness & Provenance');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  // ─── 1. DYNAMIC DATE BOUNDARY TESTS ─────────────────────────────────────────
  console.log('--- 1. Dynamic Date Boundary Testing ---');

  const now = new Date();
  const dateFromDaysAgo = (days: number, hours: number = 0) => {
    const d = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000));
    return d.toISOString();
  };

  // Test: Today (< 24 hours)
  const todayTimestamp = dateFromDaysAgo(0, 3);
  const todayResult = getRelativeFreshness(todayTimestamp);
  assert(todayResult.includes('Updated today') || todayResult.includes('ago'), `Today: "${todayResult}"`);
  assert(getFreshnessTier(todayTimestamp) === 'fresh', 'Today is fresh tier');

  // Test: Yesterday (1 day ago)
  const yesterdayTimestamp = dateFromDaysAgo(1, 1);
  const yesterdayResult = getRelativeFreshness(yesterdayTimestamp);
  assert(yesterdayResult === 'Updated yesterday', `Yesterday: "${yesterdayResult}"`);
  assert(getFreshnessTier(yesterdayTimestamp) === 'fresh', 'Yesterday is fresh tier');

  // Test: Recent (4 days ago)
  const fourDaysTimestamp = dateFromDaysAgo(4);
  const fourDaysResult = getRelativeFreshness(fourDaysTimestamp);
  assert(fourDaysResult.includes('4 days ago'), `4 days ago: "${fourDaysResult}"`);
  assert(getFreshnessTier(fourDaysTimestamp) === 'fresh', '4 days is fresh tier');

  // Test: Weeks (14 days ago)
  const twoWeeksTimestamp = dateFromDaysAgo(14);
  const twoWeeksResult = getRelativeFreshness(twoWeeksTimestamp);
  assert(twoWeeksResult.includes('2 weeks ago'), `14 days ago: "${twoWeeksResult}"`);
  assert(getFreshnessTier(twoWeeksTimestamp) === 'fresh', '14 days is fresh tier');

  // Test: Moderate (45 days ago)
  const monthAndHalfTimestamp = dateFromDaysAgo(45);
  const monthAndHalfResult = getRelativeFreshness(monthAndHalfTimestamp);
  assert(monthAndHalfResult.includes('month'), `45 days ago: "${monthAndHalfResult}"`);
  assert(getFreshnessTier(monthAndHalfTimestamp) === 'moderate', '45 days is moderate tier');

  // Test: Aged (120 days ago)
  const fourMonthsTimestamp = dateFromDaysAgo(120);
  const fourMonthsResult = getRelativeFreshness(fourMonthsTimestamp);
  assert(fourMonthsResult.includes('4 months ago'), `120 days ago: "${fourMonthsResult}"`);
  assert(getFreshnessTier(fourMonthsTimestamp) === 'aged', '120 days is aged tier');

  // Test: Missing / Null Timestamp
  assert(getRelativeFreshness(null) === 'Evidence date not recorded', 'Null timestamp handled safely');
  assert(getRelativeFreshness(undefined) === 'Evidence date not recorded', 'Undefined timestamp handled safely');
  assert(getFreshnessTier(null) === 'unrecorded', 'Null is unrecorded tier');

  // Test: Verification Timestamp Formatter
  assert(formatVerificationTimestamp(null) === 'Unrecorded', 'Format null returns Unrecorded');
  assert(formatVerificationTimestamp('2026-09-04T12:00:00Z').includes('2026'), 'Format ISO date returns year');

  // ─── 2. EVIDENCE STORE & CRUD VERIFICATION ──────────────────────────────────
  console.log('\n--- 2. Evidence Store CRUD & Tenant Isolation ---');
  const testOrg = `org_test_prove_${Date.now()}`;

  // Initial list should be empty for new org
  const initialList = await listEvidence(testOrg);
  assert(initialList.length === 0, 'New org has zero initial evidence');

  // Create Evidence Item
  const created = await createEvidence({
    org_id: testOrg,
    title: 'ISO-9001 Quality Management Certificate',
    evidence_type: 'credential',
    related_record_id: 'crd_iso_test_01',
    related_record_type: 'credential',
    related_record_title: 'ISO-9001 Standard Compliance',
    related_record_state: 'CURRENT',
    document_id: 'doc_iso_001',
    document_title: 'ISO_9001_Audit_Certificate.pdf',
    document_file_url: '/uploads/iso9001.pdf',
    source: 'third_party_issuer',
    source_label: 'BSI Assurance Services',
    verification_state: 'DOCUMENT_SUPPORTED',
    notes: 'Annual surveillance audit complete.',
    created_by: 'Arthur Pendelton',
  });

  assert(Boolean(created.id), `Evidence created with ID: ${created.id}`);
  assert(created.verification_state === 'DOCUMENT_SUPPORTED', 'Verification state is DOCUMENT_SUPPORTED');
  assert(created.events.length === 1, 'Initial creation event recorded in audit history');

  // Read back
  const fetched = await getEvidence(created.id);
  assert(fetched?.title === 'ISO-9001 Quality Management Certificate', 'Fetched evidence matches title');

  // Request review
  const reviewed = await requestReview(created.id, 'Please verify against BSI accredited register');
  assert(reviewed.verification_state === 'REVIEW_REQUIRED', 'Evidence transitioned to REVIEW_REQUIRED');
  assert(reviewed.events.length === 2, 'Review request logged in audit events');

  // Update Evidence (via internal verifier — RBAC gate: contractors cannot self-verify)
  const updated = await updateEvidence(created.id, {
    notes: 'Updated audit notes for compliance officer',
    verification_state: 'VERIFIED',
    actor_role: 'internal_verifier',
    actor_name: 'Avorria Verification Desk',
  });
  assert(updated.verification_state === 'VERIFIED', 'Updated to VERIFIED (internal verifier role)');
  assert(updated.events.length === 3, 'State change logged in audit events');

  // Delete Evidence
  const deleted = await deleteEvidence(created.id);
  assert(deleted === true, 'Evidence deleted successfully');
  const afterDelete = await getEvidence(created.id);
  assert(afterDelete === null, 'Deleted evidence cannot be fetched');

  // ─── 3. VANCE COMMERCIAL ELECTRIC EVIDENCE INTEGRITY ────────────────────────
  console.log('\n--- 3. Vance Commercial Electric Real Evidence Integrity ---');
  const vanceOrg = 'org_vance_electric_01';
  const vanceEvidence = await listEvidence(vanceOrg);

  assert(vanceEvidence.length >= 8, `Vance has ${vanceEvidence.length} evidence items`);

  // Verify separation of record state vs verification state
  const tdlrEvidence = vanceEvidence.find((e) => e.id === 'evi_vance_01');
  assert(tdlrEvidence !== undefined, 'TDLR Master License evidence found');
  assert(tdlrEvidence?.verification_state === 'VERIFIED', 'TDLR is VERIFIED');
  assert(tdlrEvidence?.related_record_state === 'CURRENT', 'TDLR record state is CURRENT (separate from verification!)');
  assert(tdlrEvidence?.verification_reference === 'AV-VER-04513A', 'TDLR reference AV-VER-04513A intact');

  // Verify Document Supported evidence
  const glEvidence = vanceEvidence.find((e) => e.id === 'evi_vance_02');
  assert(glEvidence?.verification_state === 'DOCUMENT_SUPPORTED', 'Travelers GL is DOCUMENT_SUPPORTED');
  assert(glEvidence?.related_record_state === 'CURRENT', 'Travelers GL record state is CURRENT');

  // Verify Expiring record with Document Supported evidence
  const wcEvidence = vanceEvidence.find((e) => e.id === 'evi_vance_03');
  assert(wcEvidence?.verification_state === 'DOCUMENT_SUPPORTED', 'Texas Mutual WC is DOCUMENT_SUPPORTED');
  assert(wcEvidence?.related_record_state === 'EXPIRING', 'Texas Mutual WC record state is EXPIRING (non-conflated!)');

  // ─── 4. EVIDENCE POSITION & COMPLETENESS AGGREGATION ────────────────────────
  console.log('\n--- 4. Evidence Position & Completeness Breakdown ---');
  const position = await getEvidencePosition(vanceOrg);
  assert(position.total_evidence >= 8, `Total evidence: ${position.total_evidence}`);
  assert(position.verified >= 2, `Verified evidence: ${position.verified}`);
  assert(position.document_supported >= 4, `Document supported: ${position.document_supported}`);

  const completeness = await getEvidenceCompleteness(vanceOrg);
  assert(completeness.categories.length === 6, 'Completeness covers all 6 commercial domains');
  assert(completeness.total_with_evidence >= 8, `Total with evidence: ${completeness.total_with_evidence}`);

  const unsupported = await getUnsupportedRecords(vanceOrg);
  assert(Array.isArray(unsupported), `Unsupported records list derived (${unsupported.length} items needing evidence)`);

  // ─── 5. SECTION 70 RBAC: SELF-VERIFICATION PREVENTION ────────────────────────
  console.log('\n--- 5. Section 70 RBAC: Contractor Cannot Self-Verify ---');

  const selfVerifyOrg = `org_rbac_test_${Date.now()}`;

  // Contractor attempts to create evidence with VERIFIED state (no is_internal_verifier flag)
  const selfVerifyAttempt = await createEvidence({
    org_id: selfVerifyOrg,
    title: 'Self-Verify Attempt Evidence',
    evidence_type: 'credential',
    related_record_id: 'crd_rbac_test_01',
    related_record_type: 'credential',
    related_record_title: 'RBAC Test Credential',
    related_record_state: 'CURRENT',
    document_id: 'doc_rbac_test_01',
    document_title: 'SomeDoc.pdf',
    document_file_url: '/uploads/somedoc.pdf',
    source: 'contractor_uploaded',
    source_label: 'Contractor Uploaded',
    verification_state: 'VERIFIED',      // Contractor tries to claim VERIFIED
    is_internal_verifier: false,          // RBAC flag: not a verifier
    created_by: 'Contractor Self',
  });

  // System MUST downgrade VERIFIED → DOCUMENT_SUPPORTED (has a doc) not let contractor self-verify
  assert(
    selfVerifyAttempt.verification_state !== 'VERIFIED',
    `Contractor self-verify blocked. State is ${selfVerifyAttempt.verification_state} (not VERIFIED)`
  );
  assert(
    selfVerifyAttempt.verification_state === 'DOCUMENT_SUPPORTED',
    `Correctly downgraded to DOCUMENT_SUPPORTED (has attached doc)`
  );

  // Contractor attempts to self-verify via update (actor_role !== 'internal_verifier')
  const updateSelfVerifyAttempt = await updateEvidence(selfVerifyAttempt.id, {
    verification_state: 'VERIFIED',
    actor_role: 'contractor',
    actor_name: 'Contractor Self',
  });
  assert(
    updateSelfVerifyAttempt.verification_state !== 'VERIFIED',
    `Update self-verify also blocked. State is ${updateSelfVerifyAttempt.verification_state}`
  );
  assert(
    updateSelfVerifyAttempt.verification_state === 'DOCUMENT_SUPPORTED',
    `State preserved as DOCUMENT_SUPPORTED after rejected self-verify update`
  );

  // ─── 6. SECTION 65/66: MATERIAL CHANGE INVALIDATES VERIFICATION ──────────────
  console.log('\n--- 6. Section 65/66: Material Change Invalidates VERIFIED Evidence ---');

  const matChangeOrg = `org_matchange_test_${Date.now()}`;

  // Create evidence and manually set to VERIFIED via verifier
  const verifiedItem = await createEvidence({
    org_id: matChangeOrg,
    title: 'Material Change Test Evidence',
    evidence_type: 'licence',
    related_record_id: 'crd_matchange_01',
    related_record_type: 'credential',
    related_record_title: 'Contractor Electrical License',
    related_record_state: 'CURRENT',
    document_id: 'doc_original_01',
    document_title: 'OriginalLicense.pdf',
    document_file_url: '/uploads/license_original.pdf',
    source: 'third_party_issuer',
    source_label: 'State Board',
    verification_state: 'DOCUMENT_SUPPORTED',
    is_internal_verifier: false,
    created_by: 'Contractor Owner',
  });

  // Internal verifier promotes to VERIFIED
  const verifiedByInternalOp = await updateEvidence(verifiedItem.id, {
    verification_state: 'VERIFIED',
    actor_role: 'internal_verifier',
    actor_name: 'Avorria Verification Desk',
  });
  assert(
    verifiedByInternalOp.verification_state === 'VERIFIED',
    `Internal verifier can promote to VERIFIED: state is ${verifiedByInternalOp.verification_state}`
  );

  // Contractor replaces document on VERIFIED evidence — MUST invalidate verification
  const afterDocReplace = await updateEvidence(verifiedByInternalOp.id, {
    document_id: 'doc_replacement_02',
    document_title: 'ReplacedLicense.pdf',
    document_file_url: '/uploads/license_replaced.pdf',
    actor_role: 'contractor',
    actor_name: 'Contractor Owner',
  });
  assert(
    afterDocReplace.verification_state === 'REVIEW_REQUIRED',
    `Document replacement invalidates VERIFIED → REVIEW_REQUIRED. State: ${afterDocReplace.verification_state}`
  );
  assert(
    afterDocReplace.verified_at === undefined,
    `verified_at cleared after material change`
  );
  const invalidationEvent = afterDocReplace.events.find((ev) => ev.action === 'verification_invalidated');
  assert(
    invalidationEvent !== undefined,
    `Audit event 'verification_invalidated' recorded on material change`
  );
  assert(
    invalidationEvent?.notes?.includes('document'),
    `Invalidation event notes reference 'document' as cause`
  );

  // Contractor changes expiry date on separate VERIFIED item — MUST also invalidate
  const verifiedForDateTest = await createEvidence({
    org_id: matChangeOrg,
    title: 'Expiry Date Change Test',
    evidence_type: 'insurance',
    related_record_id: 'crd_matchange_02',
    related_record_type: 'credential',
    related_record_title: 'GL Insurance Record',
    related_record_state: 'CURRENT',
    document_file_url: '/uploads/gl_policy.pdf',
    source: 'contractor_uploaded',
    source_label: 'Contractor',
    verification_state: 'DOCUMENT_SUPPORTED',
    is_internal_verifier: false,
    created_by: 'Contractor Owner',
    expiry_date: '2026-12-31',
  });
  // Promote to VERIFIED
  await updateEvidence(verifiedForDateTest.id, {
    verification_state: 'VERIFIED',
    actor_role: 'internal_verifier',
    actor_name: 'Avorria Ops',
  });
  // Contractor edits expiry date
  const afterDateChange = await updateEvidence(verifiedForDateTest.id, {
    expiry_date: '2027-03-31',
    actor_role: 'contractor',
    actor_name: 'Contractor Owner',
  });
  assert(
    afterDateChange.verification_state === 'REVIEW_REQUIRED',
    `Expiry date change also invalidates VERIFIED → REVIEW_REQUIRED. State: ${afterDateChange.verification_state}`
  );

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProveEngineTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
