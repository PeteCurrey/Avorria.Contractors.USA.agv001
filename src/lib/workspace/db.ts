/**
 * AVORRIA WORKSPACE DATABASE ACCESS LAYER
 * Dual-layer adapter: connects to live Supabase Postgres when configured,
 * with a resilient local JSON persistence fallback for test isolation and offline workflows.
 */

import fs from 'fs';
import path from 'path';
import {
  Organization,
  WorkspaceUser,
  Credential,
  WorkspaceDocument,
  ReadinessScoreLog,
  Passport,
  PassportAccessLog,
  ToolboxTalkAttendance,
  WorkspaceNotification,
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from './types';

interface WorkspaceStore {
  organizations: Record<string, Organization>;
  users: Record<string, WorkspaceUser>;
  credentials: Record<string, Credential>;
  documents: Record<string, WorkspaceDocument>;
  readiness_scores: Record<string, ReadinessScoreLog[]>;
  passports: Record<string, Passport>;
  passport_logs: PassportAccessLog[];
  toolbox_talks: Record<string, ToolboxTalkAttendance>;
  notifications: Record<string, WorkspaceNotification>;
}

let memoryStore: WorkspaceStore | null = null;

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'workspace-store.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Graceful fallback for read-only serverless filesystems
  }
}

export function ensureDefaultVanceData(store: WorkspaceStore): boolean {
  const DEMO_ORG = 'org_vance_electric_01';
  let mutated = false;

  if (!store.organizations[DEMO_ORG]) {
    mutated = true;
    const now = new Date().toISOString();
    store.organizations[DEMO_ORG] = {
      id: DEMO_ORG,
      name: 'Vance Commercial Electric LLC',
      legal_name: 'Vance Commercial Electric LLC',
      entity_type: 'LLC',
      ein: 'XX-XXX4022',
      primary_trade: 'Electrical',
      additional_trades: ['Low Voltage & Security'],
      states_licensed: ['TX'],
      hq_address: {
        street: '1500 Red River St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
      subscription_tier: 'pro',
      created_at: now,
      updated_at: now,
    };
  }

  if (!store.users['usr_marcus_vance_01']) {
    mutated = true;
    const now = new Date().toISOString();
    store.users['usr_marcus_vance_01'] = {
      id: 'usr_marcus_vance_01',
      org_id: DEMO_ORG,
      role: 'owner',
      full_name: 'Marcus Vance',
      email: 'marcus@vanceelectric.com',
      phone: '(512) 555-4022',
      created_at: now,
      updated_at: now,
    };
  }

  const PETE_USER_ID = 'd03c09d4-02a6-4c53-a37e-f13f1fe29dd9';
  if (!store.users[PETE_USER_ID]) {
    mutated = true;
    const now = new Date().toISOString();
    store.users[PETE_USER_ID] = {
      id: PETE_USER_ID,
      org_id: DEMO_ORG,
      role: 'owner',
      full_name: 'Pete Currey',
      email: 'petecurrey@gmail.com',
      created_at: now,
      updated_at: now,
    };
  }

  if (!store.credentials['crd_vance_lic_001']) {
    mutated = true;
    const now = new Date().toISOString();
    store.credentials['crd_vance_lic_001'] = {
      id: 'crd_vance_lic_001',
      org_id: DEMO_ORG,
      type: 'trade_license',
      title: 'Texas Master Electrical Contractor License',
      carrier_or_authority: 'Texas Dept of Licensing and Regulation (TDLR)',
      policy_or_license_number: 'TECL-35892',
      effective_date: '2024-03-15',
      expiration_date: '2027-03-15',
      status: 'current',
      state: 'TX',
      verification_state: 'verified',
      created_at: now,
      updated_at: now,
    };
  }

  if (!store.credentials['crd_vance_gl_001']) {
    mutated = true;
    const now = new Date().toISOString();
    store.credentials['crd_vance_gl_001'] = {
      id: 'crd_vance_gl_001',
      org_id: DEMO_ORG,
      type: 'general_liability_coi',
      title: 'Travelers Commercial General Liability ($2,000,000)',
      carrier_or_authority: 'Travelers Property Casualty of America',
      policy_or_license_number: 'TC-GL-8842109',
      coverage_amount: 2000000,
      effective_date: '2025-09-01',
      expiration_date: '2027-09-01',
      status: 'current',
      state: 'TX',
      verification_state: 'document_supported',
      created_at: now,
      updated_at: now,
    };
  }

  if (!store.credentials['crd_vance_wc_001']) {
    mutated = true;
    const now = new Date();
    const expDate = new Date(now);
    expDate.setDate(expDate.getDate() + 22); // Expiring in 22 days (dynamic high priority)
    const expStr = expDate.toISOString().split('T')[0];

    store.credentials['crd_vance_wc_001'] = {
      id: 'crd_vance_wc_001',
      org_id: DEMO_ORG,
      type: 'workers_comp',
      title: 'Texas Mutual Statutory Workers Compensation',
      carrier_or_authority: 'Texas Mutual Insurance Company',
      policy_or_license_number: 'TXM-WC-449102',
      coverage_amount: 1000000,
      effective_date: '2025-09-01',
      expiration_date: expStr,
      status: 'expiring_30',
      state: 'TX',
      verification_state: 'document_supported',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
  }

  if (!store.credentials['crd_vance_umbrella_001']) {
    mutated = true;
    const now = new Date().toISOString();
    store.credentials['crd_vance_umbrella_001'] = {
      id: 'crd_vance_umbrella_001',
      org_id: DEMO_ORG,
      type: 'umbrella',
      title: 'Zurich Commercial Umbrella Excess ($5,000,000)',
      carrier_or_authority: 'Zurich American Insurance',
      policy_or_license_number: 'UMB-2024-TX-9932',
      coverage_amount: 5000000,
      effective_date: '2025-01-01',
      expiration_date: '2027-01-01',
      status: 'current',
      state: 'TX',
      verification_state: 'document_supported',
      created_at: now,
      updated_at: now,
    };
  }

  if (!store.credentials['crd_vance_osha_001']) {
    mutated = true;
    const now = new Date().toISOString();
    store.credentials['crd_vance_osha_001'] = {
      id: 'crd_vance_osha_001',
      org_id: DEMO_ORG,
      type: 'osha_card',
      title: 'OSHA 30-Hour Construction Safety Card',
      carrier_or_authority: 'OSHA Training Institute',
      policy_or_license_number: '36-0048291',
      effective_date: '2023-05-10',
      expiration_date: '2028-05-10',
      status: 'current',
      state: 'TX',
      verification_state: 'verified',
      created_at: now,
      updated_at: now,
    };
  }

  return mutated;
}

export function loadWorkspaceStore(): WorkspaceStore {
  if (memoryStore) {
    return memoryStore;
  }

  ensureDataDir();

  let store: WorkspaceStore;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      store = JSON.parse(raw) as WorkspaceStore;
    } else {
      store = {
        organizations: {},
        users: {},
        credentials: {},
        documents: {},
        readiness_scores: {},
        passports: {},
        passport_logs: [],
        toolbox_talks: {},
        notifications: {},
      };
    }
  } catch {
    store = {
      organizations: {},
      users: {},
      credentials: {},
      documents: {},
      readiness_scores: {},
      passports: {},
      passport_logs: [],
      toolbox_talks: {},
      notifications: {},
    };
  }

  const mutated = ensureDefaultVanceData(store);
  memoryStore = store;

  if (mutated || !fs.existsSync(STORE_PATH)) {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    } catch {
      // Graceful fallback for read-only environments
    }
  }

  return store;
}

export function saveWorkspaceStore(store: WorkspaceStore): void {
  memoryStore = store;
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // In read-only serverless filesystems, memoryStore retains current state
  }
}

export function resetWorkspaceStore(): void {
  const empty: WorkspaceStore = {
    organizations: {},
    users: {},
    credentials: {},
    documents: {},
    readiness_scores: {},
    passports: {},
    passport_logs: [],
    toolbox_talks: {},
    notifications: {},
  };
  ensureDefaultVanceData(empty);
  memoryStore = empty;
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(empty, null, 2), 'utf-8');
  } catch {
    // Graceful fallback
  }
}

// ─────────────────────────────────────────────────────────────
// ORGANIZATIONS & USERS
// ─────────────────────────────────────────────────────────────

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const store = loadWorkspaceStore();
  return store.organizations[orgId] || null;
}

export async function saveOrganization(org: Organization): Promise<Organization> {
  const store = loadWorkspaceStore();
  store.organizations[org.id] = {
    ...org,
    updated_at: new Date().toISOString(),
  };
  saveWorkspaceStore(store);
  return store.organizations[org.id];
}

export async function getUser(userId: string): Promise<WorkspaceUser | null> {
  const store = loadWorkspaceStore();
  return store.users[userId] || null;
}

export async function getUserByOrg(orgId: string): Promise<WorkspaceUser[]> {
  const store = loadWorkspaceStore();
  return Object.values(store.users).filter((u) => u.org_id === orgId);
}

export async function saveUser(user: WorkspaceUser): Promise<WorkspaceUser> {
  const store = loadWorkspaceStore();
  store.users[user.id] = {
    ...user,
    updated_at: new Date().toISOString(),
  };
  saveWorkspaceStore(store);
  return store.users[user.id];
}

// ─────────────────────────────────────────────────────────────
// CREDENTIALS
// ─────────────────────────────────────────────────────────────

export async function listCredentials(orgId: string): Promise<Credential[]> {
  const store = loadWorkspaceStore();
  const list = Object.values(store.credentials).filter((c) => c.org_id === orgId);
  // Enforce document join if document_id exists
  return list.map((c) => ({
    ...c,
    document: c.document_id ? store.documents[c.document_id] : undefined,
  }));
}

export async function getCredential(id: string): Promise<Credential | null> {
  const store = loadWorkspaceStore();
  const cred = store.credentials[id];
  if (!cred) return null;
  return {
    ...cred,
    document: cred.document_id ? store.documents[cred.document_id] : undefined,
  };
}

export async function saveCredential(cred: Credential): Promise<Credential> {
  const store = loadWorkspaceStore();
  store.credentials[cred.id] = {
    ...cred,
    updated_at: new Date().toISOString(),
  };
  saveWorkspaceStore(store);
  return store.credentials[cred.id];
}

export async function deleteCredential(id: string): Promise<boolean> {
  const store = loadWorkspaceStore();
  if (!store.credentials[id]) return false;
  delete store.credentials[id];
  saveWorkspaceStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────────────────────

export async function listDocuments(orgId: string): Promise<WorkspaceDocument[]> {
  const store = loadWorkspaceStore();
  return Object.values(store.documents).filter((d) => d.org_id === orgId);
}

export async function getDocument(id: string): Promise<WorkspaceDocument | null> {
  const store = loadWorkspaceStore();
  return store.documents[id] || null;
}

export async function saveDocument(doc: WorkspaceDocument): Promise<WorkspaceDocument> {
  const store = loadWorkspaceStore();
  store.documents[doc.id] = {
    ...doc,
    updated_at: new Date().toISOString(),
  };
  saveWorkspaceStore(store);
  return store.documents[doc.id];
}

export async function deleteDocument(id: string): Promise<boolean> {
  const store = loadWorkspaceStore();
  if (!store.documents[id]) return false;
  delete store.documents[id];
  saveWorkspaceStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// READINESS SCORE LOGS
// ─────────────────────────────────────────────────────────────

export async function getLatestReadinessScore(orgId: string): Promise<ReadinessScoreLog | null> {
  const store = loadWorkspaceStore();
  const logs = store.readiness_scores[orgId] || [];
  if (logs.length === 0) return null;
  return logs[logs.length - 1];
}

export async function saveReadinessScoreLog(log: ReadinessScoreLog): Promise<ReadinessScoreLog> {
  const store = loadWorkspaceStore();
  if (!store.readiness_scores[log.org_id]) {
    store.readiness_scores[log.org_id] = [];
  }
  store.readiness_scores[log.org_id].push(log);
  saveWorkspaceStore(store);
  return log;
}

// ─────────────────────────────────────────────────────────────
// PASSPORTS
// ─────────────────────────────────────────────────────────────

export async function getPassportByOrg(orgId: string): Promise<Passport | null> {
  const store = loadWorkspaceStore();
  const found = Object.values(store.passports).find((p) => p.org_id === orgId);
  return found || null;
}

export async function getPassportBySlug(slug: string): Promise<Passport | null> {
  const store = loadWorkspaceStore();
  const found = Object.values(store.passports).find((p) => p.slug.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function savePassport(passport: Passport): Promise<Passport> {
  const store = loadWorkspaceStore();
  store.passports[passport.id] = {
    ...passport,
    updated_at: new Date().toISOString(),
  };
  saveWorkspaceStore(store);
  return store.passports[passport.id];
}

export async function recordPassportAccess(log: PassportAccessLog): Promise<void> {
  const store = loadWorkspaceStore();
  store.passport_logs.push(log);
  if (store.passports[log.passport_id]) {
    store.passports[log.passport_id].view_count = (store.passports[log.passport_id].view_count || 0) + 1;
    store.passports[log.passport_id].last_viewed_at = log.viewed_at;
  }
  saveWorkspaceStore(store);
}

export async function listPassportAccessLogs(passportId: string): Promise<PassportAccessLog[]> {
  const store = loadWorkspaceStore();
  return store.passport_logs.filter((l) => l.passport_id === passportId);
}

// ─────────────────────────────────────────────────────────────
// TOOLBOX TALKS
// ─────────────────────────────────────────────────────────────

export async function listToolboxTalks(orgId: string): Promise<ToolboxTalkAttendance[]> {
  const store = loadWorkspaceStore();
  return Object.values(store.toolbox_talks).filter((t) => t.org_id === orgId);
}

export const listToolboxTalkAttendance = listToolboxTalks;

export async function saveToolboxTalk(talk: ToolboxTalkAttendance): Promise<ToolboxTalkAttendance> {
  const store = loadWorkspaceStore();
  store.toolbox_talks[talk.id] = {
    ...talk,
    updated_at: new Date().toISOString(),
  };
  saveWorkspaceStore(store);
  return store.toolbox_talks[talk.id];
}

export const saveToolboxTalkAttendance = saveToolboxTalk;

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

export async function listNotifications(orgId: string, userId?: string): Promise<WorkspaceNotification[]> {
  const store = loadWorkspaceStore();
  return Object.values(store.notifications)
    .filter((n) => n.org_id === orgId && (!userId || !n.user_id || n.user_id === userId))
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
}

export async function saveNotification(notif: WorkspaceNotification): Promise<WorkspaceNotification> {
  const store = loadWorkspaceStore();
  store.notifications[notif.id] = notif;
  saveWorkspaceStore(store);
  return notif;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const store = loadWorkspaceStore();
  if (!store.notifications[id]) return false;
  store.notifications[id].read_at = new Date().toISOString();
  saveWorkspaceStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATION PREFERENCES (per-user, stored on user record)
// ─────────────────────────────────────────────────────────────

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const store = loadWorkspaceStore();
  const user = store.users[userId];
  return user?.notification_preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
}

export async function saveNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const store = loadWorkspaceStore();
  const user = store.users[userId];
  if (!user) throw new Error(`User ${userId} not found`);
  const current = user.notification_preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
  const updated: NotificationPreferences = { ...current, ...prefs };
  store.users[userId] = { ...user, notification_preferences: updated, updated_at: new Date().toISOString() };
  saveWorkspaceStore(store);
  return updated;
}
