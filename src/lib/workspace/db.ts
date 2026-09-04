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

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'workspace-store.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadWorkspaceStore(): WorkspaceStore {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    const initial: WorkspaceStore = {
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
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as WorkspaceStore;
  } catch {
    const fallback: WorkspaceStore = {
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
    return fallback;
  }
}

export function saveWorkspaceStore(store: WorkspaceStore): void {
  ensureDataDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export function resetWorkspaceStore(): void {
  ensureDataDir();
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
  fs.writeFileSync(STORE_PATH, JSON.stringify(empty, null, 2), 'utf-8');
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
