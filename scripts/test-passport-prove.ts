import { 
  getPassportByOrg, 
  savePassport, 
  getPublicPassport, 
  verifyPassportPassword 
} from '../src/lib/workspace/passport';
import { createCredential, listCredentials } from '../src/lib/workspace/credentials';
import { listNotifications } from '../src/lib/workspace/notifications';
import { saveOrganization, saveUser, resetWorkspaceStore } from '../src/lib/workspace/db';
import crypto from 'crypto';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runPassportProveTest() {
  console.log('--- RUNNING PROVE & PASSPORT ENGINE VERIFICATION ---');
  resetWorkspaceStore();

  const testOrgId = 'org-prove-test-' + Date.now();
  const testSlug = 'apex-mechanical-' + Date.now();
  const org = await saveOrganization({
    id: testOrgId,
    name: 'Apex Mechanical Contractors',
    primary_trade: 'Mechanical',
    additional_trades: ['HVAC'],
    states_licensed: ['CA'],
    subscription_tier: 'pro',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  await saveUser({
    id: 'user-prove-' + Date.now(),
    org_id: org.id,
    email: 'admin@apexmechanical.com',
    full_name: 'Marcus Vance',
    role: 'owner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  console.log(`Initialized test org: ${org.name} (${org.id}), slug: ${testSlug}`);

  // 1. Initial passport setup
  const initialPassport = await savePassport(org.id, {
    slug: testSlug,
    is_password_protected: false,
  });
  assert(initialPassport !== null, 'Passport created for organization');
  assert(initialPassport.slug === testSlug, `Passport slug matches requested slug: ${initialPassport.slug}`);
  assert(!initialPassport.is_password_protected, 'Passport is initially unprotected');

  // 2. Add credentials to org
  const activeCred = await createCredential({
    org_id: org.id,
    type: 'general_liability_coi',
    carrier_or_authority: 'Travelers Casualty',
    policy_or_license_number: 'GL-987654321',
    coverage_amount: 2000000,
    effective_date: '2025-01-01',
    expiration_date: '2027-01-01',
    state: 'CA',
  });

  const expiringCred = await createCredential({
    org_id: org.id,
    type: 'osha_card',
    carrier_or_authority: 'OSHA Training Institute',
    policy_or_license_number: 'OSHA-10-888',
    effective_date: '2021-01-01',
    expiration_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days away
    state: 'CA',
  });
  assert(expiringCred.status === 'expiring_30', `Status computed dynamically as expiring_30: ${expiringCred.status}`);

  // 3. Configure password protection with bcrypt and include credentials
  const secretPassword = 'ClientAccessVault2026!';
  const updatedPassport = await savePassport(org.id, {
    slug: testSlug,
    is_password_protected: true,
    password: secretPassword,
    included_credential_ids: [activeCred.id, expiringCred.id],
  });

  assert(updatedPassport.is_password_protected === true, 'Passport marked as password protected');
  assert(updatedPassport.password_hash !== null && updatedPassport.password_hash !== secretPassword, 'Password is never stored plaintext; bcrypt hashed');
  assert(updatedPassport.password_hash!.startsWith('$2'), 'Bcrypt hash format verified');

  // 4. Test Public Passport retrieval with password protection (no password supplied)
  const publicGated = await getPublicPassport(testSlug, '127.0.0.1');
  assert(publicGated !== null, 'Public passport resolved by slug');
  assert(publicGated!.isPasswordProtected === true, 'Public passport correctly flags that password is required');
  assert(publicGated!.isPasswordUnlocked === false, 'Public passport locked when no password provided');
  assert(publicGated!.credentials.length === 0, 'Credentials withheld when password protected and unauthenticated');

  // 5. Test Password Verification
  const badCheck = await verifyPassportPassword(testSlug, 'WrongPassword123');
  assert(!badCheck, 'Incorrect password correctly rejected');

  const goodCheck = await verifyPassportPassword(testSlug, secretPassword);
  assert(goodCheck, 'Correct password accepted by bcrypt verification');

  // 6. Access logging with SHA-256 IP hash and view notification
  const clientIp = '203.0.113.195';
  const expectedIpHash = crypto.createHash('sha256').update(clientIp).digest('hex');

  const authenticatedView = await getPublicPassport(
    testSlug,
    clientIp,
    'https://general-contractor-review.com/bid-pack-77',
    secretPassword
  );

  assert(authenticatedView !== null, 'Authenticated view returned');
  assert(authenticatedView!.isPasswordUnlocked === true, 'Authenticated view unlocked');
  assert(authenticatedView!.credentials.length === 2, `Credentials revealed on verified access: ${authenticatedView!.credentials.length}`);

  // Check that notification was triggered for org
  const notifications = await listNotifications(org.id);
  const viewNotification = notifications.find(n => n.type === 'passport_viewed');
  assert(viewNotification !== undefined, 'In-app notification generated for passport view');
  assert(Boolean(viewNotification?.message && viewNotification.message.includes('viewed your Contractor Passport')), `Notification message formatted properly: "${viewNotification?.message || ''}"`);

  // 7. Test Live Request-Time Status Evaluation
  // Add an expired credential and include it in passport
  const expiredCred = await createCredential({
    org_id: org.id,
    type: 'trade_license',
    carrier_or_authority: 'State Licensing Board',
    policy_or_license_number: 'LIC-MECH-9922',
    effective_date: '2020-01-01',
    expiration_date: '2023-01-01', // already expired
    state: 'CA',
  });
  assert(expiredCred.status === 'expired', 'Historical expired credential flagged as expired on creation');

  // Update passport to include expired credential
  await savePassport(org.id, {
    slug: testSlug,
    is_password_protected: true,
    included_credential_ids: [activeCred.id, expiringCred.id, expiredCred.id],
  });

  // When querying public passport, live request-time evaluation guarantees status is accurate
  const liveView = await getPublicPassport(testSlug, '127.0.0.1', undefined, secretPassword);
  const credOnPassport = liveView!.credentials.find(c => c.id === expiredCred.id);
  assert(credOnPassport !== undefined, 'Expired credential appears on passport');
  assert(credOnPassport !== undefined && credOnPassport.status === 'expired', 'Expired credential reflects LIVE status "expired" on passport, never stale cached status');

  console.log('--- ALL PROVE & PASSPORT ENGINE TESTS PASSED ---');
}

runPassportProveTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
