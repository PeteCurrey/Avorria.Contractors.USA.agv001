/**
 * AVORRIA PHASE 9 — VERIFICATION WORKFLOW TEST SUITE
 *
 * Verifies:
 * 1. Verification queue — items in PENDING_VERIFICATION, REVIEW_REQUIRED, VERIFICATION_FAILED appear;
 *    VERIFIED and DOCUMENT_SUPPORTED do not appear in actionable queue.
 * 2. verifyEvidence — sets VERIFIED state, stamps verified_at, verifier name and reference, appends event.
 * 3. requestReview — contractor review request transitions state to REVIEW_REQUIRED, stamps verification_requested_at.
 * 4. RBAC guard — contractor accounts cannot promote evidence to VERIFIED via updateEvidence.
 * 5. Material change invalidation — modifying document or policy dates on VERIFIED evidence
 *    invalidates verification and resets state to REVIEW_REQUIRED.
 * 6. Multi-tenant isolation — org_id boundary strictly enforced; evidence of one org is not leaked to another.
 * 7. Audit log immutability — events array is strictly append-only; prior events remain unchanged.
 * 8. VERIFICATION_FAILED workflow — auditor can record verification failure with rationale.
 */

import {
  listEvidence,
  createEvidence,
  updateEvidence,
  getEvidence,
  requestReview,
  verifyEvidence,
  deleteEvidence,
} from '../src/lib/prove/prove-store';
import type { VerificationState } from '../src/lib/prove/types';

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

async function runPhase9VerificationTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA PHASE 9: CONTROLLED EVIDENCE REVIEW & VERIFICATION WORKFLOW');
  console.log('Verification Queue, Verifier Actions, Immutability & Material Guard');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  const TEST_ORG_A = `org_p9_test_a_${Date.now()}`;
  const TEST_ORG_B = `org_p9_test_b_${Date.now()}`;

  // ─── 1. VERIFICATION QUEUE SEPARATION ───────────────────────────────────────
  console.log('--- 1. Verification Queue Filtering & State Separation ---');

  // Create evidence items in different states
  const itemSupplied = await createEvidence({
    org_id: TEST_ORG_A,
    title: 'Self Attested Tooling Safety Roster',
    evidence_type: 'safety',
    related_record_id: 'rec_s1',
    related_record_type: 'credential',
    related_record_title: 'Tooling Safety Roster',
    verification_state: 'CONTRACTOR_SUPPLIED',
  });
  assert(itemSupplied.verification_state === 'CONTRACTOR_SUPPLIED', 'Item created as CONTRACTOR_SUPPLIED');

  const itemDocSupported = await createEvidence({
    org_id: TEST_ORG_A,
    title: 'Equipment Maintenance Invoice with Stamp',
    evidence_type: 'credential',
    related_record_id: 'rec_s2',
    related_record_type: 'credential',
    related_record_title: 'Maintenance Log',
    document_id: 'doc_inv_123',
    document_title: 'Maintenance Invoice.pdf',
    document_file_url: '/uploads/invoice.pdf',
    verification_state: 'DOCUMENT_SUPPORTED',
  });
  assert(itemDocSupported.verification_state === 'DOCUMENT_SUPPORTED', 'Item with doc created as DOCUMENT_SUPPORTED');

  const itemPending = await createEvidence({
    org_id: TEST_ORG_A,
    title: 'Bonding Line Verification Certificate',
    evidence_type: 'licence',
    related_record_id: 'rec_s3',
    related_record_type: 'credential',
    related_record_title: 'Surety Bond',
    verification_state: 'PENDING_VERIFICATION',
    is_internal_verifier: true,
  });
  assert(itemPending.verification_state === 'PENDING_VERIFICATION', 'Verifier placed item into PENDING_VERIFICATION');

  const itemReview = await requestReview(itemDocSupported.id, 'Contractor asks for formal review');
  assert(itemReview.verification_state === 'REVIEW_REQUIRED', 'Contractor requestReview sets state to REVIEW_REQUIRED');
  assert(Boolean(itemReview.verification_requested_at), 'verification_requested_at timestamp is stamped');

  const allOrgA = await listEvidence(TEST_ORG_A);
  const queueStates: VerificationState[] = ['PENDING_VERIFICATION', 'REVIEW_REQUIRED', 'VERIFICATION_FAILED'];
  const queueItems = allOrgA.filter((i) => queueStates.includes(i.verification_state));

  assert(queueItems.length === 2, 'Queue contains exactly the 2 actionable items (PENDING and REVIEW_REQUIRED)');
  assert(queueItems.some((i) => i.id === itemPending.id), 'Queue includes itemPending');
  assert(queueItems.some((i) => i.id === itemDocSupported.id), 'Queue includes itemReview');
  assert(!queueItems.some((i) => i.id === itemSupplied.id), 'Queue excludes CONTRACTOR_SUPPLIED (not yet requested)');

  // ─── 2. VERIFIER ACTION: verifyEvidence ────────────────────────────────────
  console.log('\n--- 2. Formal Verification Execution ---');

  const verifierName = 'Avorria Compliance Officer J. Miller';
  const verifierRef = 'AV-VER-TX-2026-00921';

  const verifiedItem = await verifyEvidence(
    itemDocSupported.id,
    verifierName,
    verifierRef,
    'state_board_lookup',
    'Confirmed active status on state board database'
  );

  assert(verifiedItem.verification_state === 'VERIFIED', 'verifyEvidence transitions item to VERIFIED');
  assert(verifiedItem.verifier_name === verifierName, 'Verifier name is permanently preserved');
  assert(verifiedItem.verification_reference === verifierRef, 'Verification reference is recorded');
  assert(verifiedItem.verification_method === 'state_board_lookup', 'Verification method is recorded');
  assert(Boolean(verifiedItem.verified_at), 'verified_at timestamp is stamped');

  // Verify it is no longer in actionable queue
  const updatedAllOrgA = await listEvidence(TEST_ORG_A);
  const updatedQueue = updatedAllOrgA.filter((i) => queueStates.includes(i.verification_state));
  assert(!updatedQueue.some((i) => i.id === verifiedItem.id), 'VERIFIED item is resolved and leaves actionable queue');

  // ─── 3. RBAC: CONTRACTOR CANNOT SELF-VERIFY ────────────────────────────────
  console.log('\n--- 3. RBAC: Contractor Cannot Self-Promote to VERIFIED ---');

  // A contractor tries to update verification_state to VERIFIED without reviewer role
  const selfVerifyAttempt = await updateEvidence(itemSupplied.id, {
    verification_state: 'VERIFIED',
    actor_role: 'contractor',
    actor_name: 'Sneaky Contractor',
  });

  assert(
    selfVerifyAttempt.verification_state !== 'VERIFIED',
    'Contractor cannot self-promote evidence to VERIFIED'
  );
  assert(
    selfVerifyAttempt.verification_state === 'CONTRACTOR_SUPPLIED',
    'State remains CONTRACTOR_SUPPLIED on unauthorized promotion attempt'
  );

  // ─── 4. MATERIAL CHANGE INVALIDATION ───────────────────────────────────────
  console.log('\n--- 4. Material Change Invalidation Guard ---');

  // Let's modify a VERIFIED item: replace document
  const priorEventsCount = verifiedItem.events.length;
  const modifiedItem = await updateEvidence(verifiedItem.id, {
    document_file_url: '/uploads/tampered-replacement.pdf',
    document_title: 'Replacement Certificate.pdf',
    actor_role: 'contractor',
    actor_name: 'Marcus Contractor',
  });

  assert(
    modifiedItem.verification_state === 'REVIEW_REQUIRED',
    'Replacing document on VERIFIED item invalidates verification -> resets to REVIEW_REQUIRED'
  );
  assert(modifiedItem.verified_at === undefined, 'verified_at is cleared upon material invalidation');
  assert(modifiedItem.verifier_name === undefined, 'verifier_name is cleared upon material invalidation');
  assert(modifiedItem.verification_reference === undefined, 'verification_reference is cleared');
  assert(modifiedItem.events.length > priorEventsCount, 'Invalidation event is appended to audit log');

  const invalidationEvent = modifiedItem.events.find((e) => e.action === 'verification_invalidated');
  assert(Boolean(invalidationEvent), 'Explicit verification_invalidated audit event exists');

  // ─── 5. VERIFICATION FAILURE WORKFLOW ──────────────────────────────────────
  console.log('\n--- 5. Verification Failed State Workflow ---');

  const failedItem = await updateEvidence(itemPending.id, {
    verification_state: 'VERIFICATION_FAILED',
    actor_role: 'internal_verifier',
    actor_name: 'Avorria Reviewer Sarah Chen',
    notes: 'Bonding line limit is below the commercial minimum threshold of $1,000,000.',
  });

  assert(failedItem.verification_state === 'VERIFICATION_FAILED', 'Verifier transitions item to VERIFICATION_FAILED');
  assert(
    failedItem.notes?.includes('below the commercial minimum threshold'),
    'Failure reasoning is preserved in item notes'
  );

  // Verification failed item should appear in the queue so contractor and verifier can track it
  const recheckQueue = (await listEvidence(TEST_ORG_A)).filter((i) =>
    queueStates.includes(i.verification_state)
  );
  assert(
    recheckQueue.some((i) => i.id === failedItem.id),
    'VERIFICATION_FAILED item appears in queue for visibility and follow-up'
  );

  // ─── 6. AUDIT LOG IMMUTABILITY ─────────────────────────────────────────────
  console.log('\n--- 6. Append-Only Audit Log Immutability ---');

  const historyItem = await getEvidence(failedItem.id);
  const initialEvents = [...(historyItem?.events || [])];
  assert(initialEvents.length >= 2, 'History contains at least creation and state update events');

  // Add another contractor request
  await requestReview(failedItem.id, 'Contractor re-submitted with amended policy cover');
  const afterReviewItem = await getEvidence(failedItem.id);

  assert(
    afterReviewItem!.events.length === initialEvents.length + 1,
    'Audit events count strictly increments by 1'
  );

  // Check that prior event IDs and fields are identical
  let allPriorPreserved = true;
  for (let i = 0; i < initialEvents.length; i++) {
    if (initialEvents[i].id !== afterReviewItem!.events[i].id ||
        initialEvents[i].action !== afterReviewItem!.events[i].action ||
        initialEvents[i].timestamp !== afterReviewItem!.events[i].timestamp) {
      allPriorPreserved = false;
      break;
    }
  }
  assert(allPriorPreserved, 'All historic events are untouched (strictly append-only)');

  // ─── 7. MULTI-TENANT ISOLATION ─────────────────────────────────────────────
  console.log('\n--- 7. Multi-Tenant Isolation ---');

  // Create evidence under Org B
  const orgBItem = await createEvidence({
    org_id: TEST_ORG_B,
    title: 'Org B Specialized Safety Plan',
    evidence_type: 'safety',
    related_record_id: 'rec_b1',
    related_record_type: 'credential',
    related_record_title: 'Safety Plan',
    verification_state: 'PENDING_VERIFICATION',
    is_internal_verifier: true,
  });

  const listOrgA = await listEvidence(TEST_ORG_A);
  const listOrgB = await listEvidence(TEST_ORG_B);

  assert(
    !listOrgA.some((i) => i.id === orgBItem.id),
    'Org A cannot see Org B evidence items'
  );
  assert(
    listOrgB.some((i) => i.id === orgBItem.id),
    'Org B can see its own evidence items'
  );
  assert(
    !listOrgB.some((i) => i.org_id === TEST_ORG_A),
    'Org B evidence list contains zero Org A items'
  );

  // Cleanup test artifacts
  await deleteEvidence(itemSupplied.id);
  await deleteEvidence(itemDocSupported.id);
  await deleteEvidence(itemPending.id);
  await deleteEvidence(orgBItem.id);

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`PHASE 9 VERIFICATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9VerificationTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
