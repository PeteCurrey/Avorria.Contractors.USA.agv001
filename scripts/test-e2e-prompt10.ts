/**
 * AVORRIA CONTRACTORS USA — BUILD PROMPT 10 VERIFICATION SUITE
 *
 * Tests Notification Deliverability, Escalating Urgency, Subject Lines,
 * In-App Notification Center, Team Dispatch, and Digest Queue.
 */

import {
  runRenewalAlertCheck,
  listNotifications,
  markAsRead,
} from '../src/lib/workspace/notifications';
import {
  saveOrganization,
  saveUser,
  saveCredential,
  saveNotificationPreferences,
  getNotificationPreferences,
  loadWorkspaceStore,
  saveWorkspaceStore,
} from '../src/lib/workspace/db';
import {
  buildRenewalSubject,
  buildRenewalEmailHtml,
  buildDigestSubject,
  buildDigestEmailHtml,
} from '../src/lib/notifications/email-templates';
import {
  getQueuedItems,
  clearQueuedItems,
  runDigestSend,
} from '../src/lib/notifications/digest';
import {
  Organization,
  WorkspaceUser,
  Credential,
} from '../src/lib/workspace/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runSuite() {
  console.log('\n======================================================');
  console.log('AVORRIA BUILD PROMPT 10 — NOTIFICATION & DELIVERABILITY SUITE');
  console.log('======================================================\n');

  // Clear workspace store notifications & test credentials
  const store = loadWorkspaceStore();
  store.notifications = {};
  store.credentials = {};
  saveWorkspaceStore(store);
  clearQueuedItems([]);

  const testOrgId = 'org_prompt10_test';
  const org: Organization = {
    id: testOrgId,
    name: 'Apex Electrical Solutions LLC',
    primary_trade: 'Electrical',
    additional_trades: [],
    states_licensed: ['TX'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subscription_tier: 'verified',
    subscription_status: 'active',
  };
  await saveOrganization(org);

  // Seed two users: 1 owner and 1 admin
  const ownerUser: WorkspaceUser = {
    id: 'usr_p10_owner',
    org_id: testOrgId,
    role: 'owner',
    full_name: 'David Vance',
    email: 'david@apexelectrical.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const adminUser: WorkspaceUser = {
    id: 'usr_p10_admin',
    org_id: testOrgId,
    role: 'admin',
    full_name: 'Sarah Connor',
    email: 'sarah@apexelectrical.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveUser(ownerUser);
  await saveUser(adminUser);

  // ── TEST 1: Subject Line & Template Content ──
  console.log('[1/7] Testing Email Subject Lines & Template Builders...');
  const sub60 = buildRenewalSubject({
    recipientName: 'David',
    orgName: 'Apex Electrical Solutions LLC',
    credentialLabel: 'General Liability COI (#GL-9021)',
    expirationDateFormatted: 'November 15, 2026',
    daysRemaining: 60,
    urgency: 'info',
    actionUrl: 'https://avorria.com/workspace/comply?credential=c1',
  });
  assert(
    sub60.includes('General Liability COI') && sub60.includes('60 days') && sub60.includes('Apex Electrical Solutions LLC'),
    `60-day subject is specific: "${sub60}"`
  );

  const sub14 = buildRenewalSubject({
    recipientName: 'David',
    orgName: 'Apex Electrical Solutions LLC',
    credentialLabel: 'Master Electrician License',
    expirationDateFormatted: 'September 19, 2026',
    daysRemaining: 14,
    urgency: 'critical',
    actionUrl: 'https://avorria.com/workspace/comply?credential=c2',
  });
  assert(
    sub14.startsWith('🔴 URGENT:') && sub14.includes('Master Electrician License') && sub14.includes('14 days'),
    `14-day subject has URGENT prefix: "${sub14}"`
  );

  const subExpired = buildRenewalSubject({
    recipientName: 'David',
    orgName: 'Apex Electrical Solutions LLC',
    credentialLabel: 'Workers Comp Policy',
    expirationDateFormatted: 'September 1, 2026',
    daysRemaining: 0,
    urgency: 'critical',
    actionUrl: 'https://avorria.com/workspace/comply?credential=c3',
  });
  assert(
    subExpired.startsWith('🚨 EXPIRED:') && subExpired.includes('Workers Comp Policy'),
    `Expired subject has EXPIRED prefix: "${subExpired}"`
  );

  const htmlOutput = buildRenewalEmailHtml({
    recipientName: 'David',
    orgName: 'Apex Electrical Solutions LLC',
    credentialLabel: 'General Liability COI',
    expirationDateFormatted: 'October 1, 2026',
    daysRemaining: 14,
    urgency: 'critical',
    actionUrl: 'https://avorria.com/workspace/comply?credential=c1',
  });
  assert(htmlOutput.includes('https://avorria.com/workspace/comply?credential=c1'), 'HTML contains deep-link action URL');
  assert(htmlOutput.includes('URGENT ACTION REQUIRED'), 'HTML contains critical urgency badge');

  // ── TEST 2: Credential Expiring in 60 Days (Informational, Owner only) ──
  console.log('\n[2/7] Testing 60-Day Notice (Urgency: info, Owners only)...');
  const d60 = new Date();
  d60.setDate(d60.getDate() + 55); // 55 days remaining -> triggers 60-day threshold
  const cred60: Credential = {
    id: 'cred_60d',
    org_id: testOrgId,
    type: 'general_liability_coi',
    policy_or_license_number: 'GL-6060',
    expiration_date: d60.toISOString().split('T')[0],
    status: 'current',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveCredential(cred60);

  const res60 = await runRenewalAlertCheck();
  assert(res60.alertsSent >= 1, `Alerts created for 60-day threshold (sent: ${res60.alertsSent})`);

  const notifs60 = await listNotifications(testOrgId);
  const n60 = notifs60.find((n) => n.related_credential_id === 'cred_60d');
  assert(!!n60, '60-day notification recorded in in-app store');
  assert(n60?.urgency === 'info', `60-day urgency is 'info' (got: ${n60?.urgency})`);
  assert(n60?.user_id === ownerUser.id, '60-day notification routed to Owner');
  assert(
    n60?.action_url === 'https://avorria.com/workspace/comply?credential=cred_60d',
    'Notification has direct action_url deep link'
  );

  // ── TEST 3: Credential Expiring in 14 Days (Critical, All Admins & Owners) ──
  console.log('\n[3/7] Testing 14-Day Notice (Urgency: critical, All Admins & Owners)...');
  const d14 = new Date();
  d14.setDate(d14.getDate() + 10); // 10 days remaining -> triggers 14-day threshold
  const cred14: Credential = {
    id: 'cred_14d',
    org_id: testOrgId,
    type: 'trade_license',
    policy_or_license_number: 'LIC-TX-1414',
    expiration_date: d14.toISOString().split('T')[0],
    status: 'expiring_14',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveCredential(cred14);

  const res14 = await runRenewalAlertCheck();
  assert(res14.alertsSent >= 2, `Critical alert sent to both Owner and Admin (sent: ${res14.alertsSent})`);

  const notifs14 = await listNotifications(testOrgId);
  const n14Owner = notifs14.find((n) => n.related_credential_id === 'cred_14d' && n.user_id === ownerUser.id);
  const n14Admin = notifs14.find((n) => n.related_credential_id === 'cred_14d' && n.user_id === adminUser.id);
  assert(!!n14Owner && !!n14Admin, '14-day alert delivered to both owner and admin');
  assert(n14Owner?.urgency === 'critical', `14-day urgency is 'critical' (got: ${n14Owner?.urgency})`);

  // ── TEST 4: Deduplication Protection ──
  console.log('\n[4/7] Testing Deduplication on Consecutive Runs...');
  const countBefore = (await listNotifications(testOrgId)).length;
  const resDedup = await runRenewalAlertCheck();
  const countAfter = (await listNotifications(testOrgId)).length;
  assert(resDedup.alertsSent === 0, `Deduplication check passed: 0 alerts on second run (sent: ${resDedup.alertsSent})`);
  assert(countBefore === countAfter, 'No duplicate records inserted into in-app notifications store');

  // ── TEST 5: Single Notification Mark-Read ──
  console.log('\n[5/7] Testing Mark Single Notification as Read...');
  const unreadBefore = (await listNotifications(testOrgId)).filter((n) => !n.read_at).length;
  assert(unreadBefore > 0, `There are ${unreadBefore} unread notifications`);

  const targetNotif = notifs14[0];
  const markRes = await markAsRead(targetNotif.id);
  assert(markRes === true, `markAsRead returned true for ${targetNotif.id}`);

  const refreshedNotifs = await listNotifications(testOrgId);
  const targetRefreshed = refreshedNotifs.find((n) => n.id === targetNotif.id);
  assert(!!targetRefreshed?.read_at, 'Target notification read_at timestamp is set');
  const otherUnread = refreshedNotifs.filter((n) => n.id !== targetNotif.id && !n.read_at).length;
  assert(otherUnread === unreadBefore - 1, 'Only target notification was marked read');

  // ── TEST 6: User Notification Preferences & Digest Routing ──
  console.log('\n[6/7] Testing Preferences & Digest Queue Option...');
  // Configure admin user with daily digest mode
  await saveNotificationPreferences(adminUser.id, {
    digest_mode: 'daily',
  });
  const savedPrefs = await getNotificationPreferences(adminUser.id);
  assert(savedPrefs.digest_mode === 'daily', 'Notification preferences saved digest_mode=daily');

  // Add an expiring 30-day credential
  const d30 = new Date();
  d30.setDate(d30.getDate() + 25); // 25 days remaining -> triggers 30-day threshold
  const cred30: Credential = {
    id: 'cred_30d',
    org_id: testOrgId,
    type: 'umbrella',
    policy_or_license_number: 'UMB-3030',
    expiration_date: d30.toISOString().split('T')[0],
    status: 'expiring_30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveCredential(cred30);

  const res30 = await runRenewalAlertCheck();
  assert(res30.emailsQueued >= 1, `Item queued for user in digest mode (queued: ${res30.emailsQueued})`);

  const queuedItems = getQueuedItems();
  const userDigestItem = queuedItems.find((q) => q.userId === adminUser.id && q.credentialId === 'cred_30d');
  assert(!!userDigestItem, 'Digest queue contains queued renewal item for admin');
  assert(userDigestItem?.urgency === 'warning', 'Queued item preserves urgency level (warning)');

  // ── TEST 7: Digest Runner Execution ──
  console.log('\n[7/7] Testing Digest Runner Drain & Dispatch...');
  const mockResend = {
    emails: {
      send: async (payload: any) => {
        assert(payload.to === adminUser.email, `Digest addressed to correct recipient: ${payload.to}`);
        assert(payload.subject.includes('Compliance Digest'), `Digest subject formatted: "${payload.subject}"`);
        assert(payload.html.includes('UMB-3030'), 'Digest HTML includes expiring credential row');
        return { data: { id: 'mock_resend_email_id' }, error: null };
      },
    },
  } as any;

  const digestResult = await runDigestSend(mockResend);
  assert(digestResult.sent === 1, `Digest runner sent 1 consolidated email (sent: ${digestResult.sent})`);
  assert(getQueuedItems().length === 0, 'Digest queue drained after execution');

  console.log('\n======================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('\n✗ Suite crashed:', err);
  process.exit(1);
});
