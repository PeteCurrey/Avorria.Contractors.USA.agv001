/**
 * AVORRIA COMPLY ENGINE & CREDENTIAL EXPIRATIONS TEST
 *
 * Verifies:
 * 1. Credential CRUD operations (Create, Read, Update, Delete).
 * 2. Automated status computation based on expiration date:
 *    - > 60 days => 'current'
 *    - 31-60 days => 'expiring_60'
 *    - 15-30 days => 'expiring_30'
 *    - 0-14 days => 'expiring_14'
 *    - < 0 days => 'expired'
 * 3. Invariant: Expired credentials NEVER silently disappear from the ledger.
 * 4. Document attachment linkage via document_id.
 * 5. Renewal alert check runs and creates notifications for org owners/admins.
 */

import { resetWorkspaceStore, saveOrganization, saveUser } from '../src/lib/workspace/db';
import {
  createCredential,
  updateCredential,
  deleteCredential,
  listCredentials,
  getCredential,
  computeCredentialStatus,
} from '../src/lib/workspace/credentials';
import { runRenewalAlertCheck, listNotifications } from '../src/lib/workspace/notifications';

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

async function runComplyEngineTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA COMPLY ENGINE: CREDENTIAL & EXPIRATION VERIFICATION');
  console.log('Build Prompt 1: Foundation, Authenticated Workspace, and Comply/Prove Core');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  resetWorkspaceStore();

  const orgId = `org_comply_${Date.now()}`;
  await saveOrganization({
    id: orgId,
    name: 'Volt Commercial Power LLC',
    primary_trade: 'Electrical',
    additional_trades: [],
    states_licensed: ['TX'],
    subscription_tier: 'pro',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const ownerId = `usr_owner_${Date.now()}`;
  await saveUser({
    id: ownerId,
    org_id: orgId,
    role: 'owner',
    full_name: 'Arthur Pendelton',
    email: 'arthur@voltcommercial.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 1. Test Automated Status Computation Function
  console.log('--- 1. Automated Status Classification ---');

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  assert(computeCredentialStatus(addDays(120)) === 'current', '120 days out is "current"');
  assert(computeCredentialStatus(addDays(55)) === 'expiring_60', '55 days out is "expiring_60"');
  assert(computeCredentialStatus(addDays(28)) === 'expiring_30', '28 days out is "expiring_30"');
  assert(computeCredentialStatus(addDays(7)) === 'expiring_14', '7 days out is "expiring_14"');
  assert(computeCredentialStatus(addDays(-3)) === 'expired', '3 days in the past is "expired"');

  // 2. Test Credential Creation & Storage
  console.log('\n--- 2. Credential Creation & Document Linkage ---');
  const cred1 = await createCredential({
    org_id: orgId,
    type: 'general_liability_coi',
    carrier_or_authority: 'Travelers Property Casualty',
    policy_or_license_number: 'GL-TRV-88912',
    coverage_amount: 2000000,
    expiration_date: addDays(180),
    document_file_url: '/uploads/coi_2026.pdf',
    document_title: 'COI Travelers $2M 2026',
  });

  assert(Boolean(cred1.id), 'Credential created with ID');
  assert(cred1.status === 'current', 'Initial status is "current"');
  assert(Boolean(cred1.document_id), 'Linked document_id generated for attached file');

  const fetched = await getCredential(cred1.id);
  assert(fetched?.document?.file_url === '/uploads/coi_2026.pdf', 'Document record joined on credential fetch');

  // 3. Test Invariant: Expired Credentials Never Disappear
  console.log('\n--- 3. Invariant: Expired Credentials Remain Visible ---');
  const expiredCred = await createCredential({
    org_id: orgId,
    type: 'trade_license',
    carrier_or_authority: 'TDLR',
    policy_or_license_number: 'TECL-OLD-11',
    expiration_date: addDays(-10),
  });

  assert(expiredCred.status === 'expired', 'Expired credential marked status="expired"');

  const allCreds = await listCredentials(orgId);
  const foundExpired = allCreds.find((c) => c.id === expiredCred.id);
  assert(Boolean(foundExpired), 'Expired credential is present in listCredentials()');
  assert(foundExpired?.status === 'expired', 'Expired credential retains status="expired"');

  // 4. Test Credential Update
  console.log('\n--- 4. Credential Update & Renewal Transition ---');
  // Renew the expired credential by updating expiration date to next year
  const renewed = await updateCredential(expiredCred.id, {
    expiration_date: addDays(365),
    policy_or_license_number: 'TECL-RENEWED-2027',
  });
  assert(renewed.status === 'current', 'Updating expired credential with future date restores status to "current"');
  assert(renewed.policy_or_license_number === 'TECL-RENEWED-2027', 'Updated policy number persisted');

  // 5. Test Deletion
  console.log('\n--- 5. Credential Deletion ---');
  const tempCred = await createCredential({
    org_id: orgId,
    type: 'umbrella',
    expiration_date: addDays(90),
  });
  const deletedOk = await deleteCredential(tempCred.id);
  assert(deletedOk === true, 'deleteCredential returns true');
  const checkDeleted = await getCredential(tempCred.id);
  assert(checkDeleted === null, 'Deleted credential is no longer retrievable');

  // 6. Test Renewal Alert Engine
  console.log('\n--- 6. Automated Renewal Alert Engine ---');
  // Create an expiring credential within 14 days
  await createCredential({
    org_id: orgId,
    type: 'auto',
    carrier_or_authority: 'Progressive Commercial',
    policy_or_license_number: 'AUTO-9923',
    expiration_date: addDays(10),
  });

  const alertResult = await runRenewalAlertCheck();
  assert(alertResult.evaluatedCredentials >= 2, 'Renewal check evaluated credentials');
  assert(alertResult.alertsSent >= 1, 'Alert generated for expiring credential');

  const notifs = await listNotifications(orgId, ownerId);
  const expiringAlert = notifs.find((n) => n.type === 'expiring_14');
  assert(Boolean(expiringAlert), 'expiring_14 notification created for organization owner');
  assert(expiringAlert?.message?.includes('AUTO'), 'Notification message identifies credential');

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`COMPLY ENGINE TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

runComplyEngineTests().catch((e) => {
  console.error('FATAL ERROR:', e);
  process.exit(1);
});
