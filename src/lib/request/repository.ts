/**
 * AVORRIA REQUEST REPOSITORY
 * Phase 9: Hermetic persistence for requirement packs, trades,
 * structured requirements, attachments, and append-only audit events.
 */

import fs from 'fs';
import path from 'path';
import {
  RequirementPack,
  RequirementPackTrade,
  RequirementItem,
  RequirementPackAttachment,
  RequirementPackEvent,
  RequirementPackStatus,
  RequirementPackEventType,
} from './types';

export interface RequestStoreData {
  packs: Record<string, RequirementPack>; // keyed by pack id
  trades: RequirementPackTrade[];
  requirements: RequirementItem[];
  attachments: RequirementPackAttachment[];
  events: RequirementPackEvent[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests-store.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadRequestStore(): RequestStoreData {
  ensureDataDir();
  if (!fs.existsSync(REQUESTS_FILE)) {
    return {
      packs: {},
      trades: [],
      requirements: [],
      attachments: [],
      events: [],
    };
  }
  try {
    const raw = fs.readFileSync(REQUESTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      packs: parsed.packs || {},
      trades: parsed.trades || [],
      requirements: parsed.requirements || [],
      attachments: parsed.attachments || [],
      events: parsed.events || [],
    };
  } catch {
    return {
      packs: {},
      trades: [],
      requirements: [],
      attachments: [],
      events: [],
    };
  }
}

export function saveRequestStore(store: RequestStoreData): void {
  ensureDataDir();
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────
// 1. REQUIREMENT PACKS
// ─────────────────────────────────────────────────────────────

export async function getRequirementPacksByTenant(tenantId: string): Promise<RequirementPack[]> {
  const store = loadRequestStore();
  const packs = Object.values(store.packs).filter((p) => p.tenant_id === tenantId);
  return packs.map((p) => populatePackRelations(p, store));
}

export async function getRequirementPackById(
  packId: string,
  tenantId?: string
): Promise<RequirementPack | null> {
  const store = loadRequestStore();
  const pack = store.packs[packId];
  if (!pack) return null;

  if (tenantId && pack.tenant_id !== tenantId) {
    return null; // Tenant isolation
  }

  return populatePackRelations(pack, store);
}

export async function saveRequirementPack(pack: RequirementPack): Promise<RequirementPack> {
  const store = loadRequestStore();
  const now = new Date().toISOString();
  store.packs[pack.id] = {
    ...pack,
    updated_at: now,
  };
  saveRequestStore(store);
  return populatePackRelations(store.packs[pack.id], store);
}

export async function updateRequirementPackStatus(
  packId: string,
  tenantId: string,
  newStatus: RequirementPackStatus
): Promise<RequirementPack> {
  const store = loadRequestStore();
  const pack = store.packs[packId];
  if (!pack) throw new Error(`Requirement pack ${packId} not found`);
  if (pack.tenant_id !== tenantId) {
    throw new Error('Unauthorized: Tenant does not own this requirement pack');
  }

  pack.status = newStatus;
  pack.updated_at = new Date().toISOString();
  saveRequestStore(store);
  return populatePackRelations(pack, store);
}

export async function deleteRequirementPack(packId: string, tenantId: string): Promise<boolean> {
  const store = loadRequestStore();
  const pack = store.packs[packId];
  if (!pack || pack.tenant_id !== tenantId) return false;

  delete store.packs[packId];
  store.trades = store.trades.filter((t) => t.pack_id !== packId);
  store.requirements = store.requirements.filter((r) => r.pack_id !== packId);
  store.attachments = store.attachments.filter((a) => a.pack_id !== packId);
  store.events = store.events.filter((e) => e.pack_id !== packId);

  saveRequestStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// 2. TRADES
// ─────────────────────────────────────────────────────────────

export async function getPackTrades(packId: string, tenantId: string): Promise<RequirementPackTrade[]> {
  const store = loadRequestStore();
  return store.trades.filter((t) => t.pack_id === packId && t.tenant_id === tenantId);
}

export async function addPackTrade(
  packId: string,
  tenantId: string,
  tradeSlug: string,
  tradeName: string
): Promise<RequirementPackTrade> {
  const store = loadRequestStore();
  const pack = store.packs[packId];
  if (!pack || pack.tenant_id !== tenantId) {
    throw new Error('Unauthorized: Tenant does not own this requirement pack');
  }

  const existing = store.trades.find((t) => t.pack_id === packId && t.trade_slug === tradeSlug);
  if (existing) return existing;

  const trade: RequirementPackTrade = {
    id: `rpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    pack_id: packId,
    tenant_id: tenantId,
    trade_slug: tradeSlug,
    trade_name: tradeName,
    created_at: new Date().toISOString(),
  };

  store.trades.push(trade);
  saveRequestStore(store);
  return trade;
}

export async function removePackTrade(
  packId: string,
  tenantId: string,
  tradeSlug: string
): Promise<boolean> {
  const store = loadRequestStore();
  const pack = store.packs[packId];
  if (!pack || pack.tenant_id !== tenantId) return false;

  const initialLen = store.trades.length;
  store.trades = store.trades.filter((t) => !(t.pack_id === packId && t.trade_slug === tradeSlug));
  const removed = store.trades.length < initialLen;
  if (removed) saveRequestStore(store);
  return removed;
}

// ─────────────────────────────────────────────────────────────
// 3. REQUIREMENTS
// ─────────────────────────────────────────────────────────────

export async function getPackRequirements(packId: string, tenantId: string): Promise<RequirementItem[]> {
  const store = loadRequestStore();
  return store.requirements
    .filter((r) => r.pack_id === packId && r.tenant_id === tenantId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function addPackRequirement(
  packId: string,
  tenantId: string,
  requirement: Omit<RequirementItem, 'id' | 'pack_id' | 'tenant_id' | 'created_at' | 'updated_at'>
): Promise<RequirementItem> {
  const store = loadRequestStore();
  const pack = store.packs[packId];
  if (!pack || pack.tenant_id !== tenantId) {
    throw new Error('Unauthorized: Tenant does not own this requirement pack');
  }

  const now = new Date().toISOString();
  const existingReqs = store.requirements.filter((r) => r.pack_id === packId);

  const item: RequirementItem = {
    ...requirement,
    id: `req_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    pack_id: packId,
    tenant_id: tenantId,
    sort_order: requirement.sort_order ?? existingReqs.length,
    created_at: now,
    updated_at: now,
  };

  store.requirements.push(item);
  saveRequestStore(store);
  return item;
}

export async function updatePackRequirement(
  requirementId: string,
  tenantId: string,
  updates: Partial<Omit<RequirementItem, 'id' | 'pack_id' | 'tenant_id' | 'created_at' | 'updated_at'>>
): Promise<RequirementItem> {
  const store = loadRequestStore();
  const req = store.requirements.find((r) => r.id === requirementId && r.tenant_id === tenantId);
  if (!req) throw new Error(`Requirement ${requirementId} not found or unauthorized`);

  Object.assign(req, updates, { updated_at: new Date().toISOString() });
  saveRequestStore(store);
  return req;
}

export async function removePackRequirement(requirementId: string, tenantId: string): Promise<boolean> {
  const store = loadRequestStore();
  const initialLen = store.requirements.length;
  store.requirements = store.requirements.filter((r) => !(r.id === requirementId && r.tenant_id === tenantId));
  const removed = store.requirements.length < initialLen;
  if (removed) saveRequestStore(store);
  return removed;
}

// ─────────────────────────────────────────────────────────────
// 4. ATTACHMENTS
// ─────────────────────────────────────────────────────────────

export async function getPackAttachments(packId: string, tenantId: string): Promise<RequirementPackAttachment[]> {
  const store = loadRequestStore();
  return store.attachments.filter((a) => a.pack_id === packId && a.tenant_id === tenantId);
}

export async function addPackAttachment(
  packId: string,
  tenantId: string,
  userId: string,
  attachment: Omit<RequirementPackAttachment, 'id' | 'pack_id' | 'tenant_id' | 'uploaded_by_user_id' | 'created_at'>
): Promise<RequirementPackAttachment> {
  const store = loadRequestStore();
  const pack = store.packs[packId];
  if (!pack || pack.tenant_id !== tenantId) {
    throw new Error('Unauthorized: Tenant does not own this requirement pack');
  }

  const record: RequirementPackAttachment = {
    ...attachment,
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    pack_id: packId,
    tenant_id: tenantId,
    uploaded_by_user_id: userId,
    created_at: new Date().toISOString(),
  };

  store.attachments.push(record);
  saveRequestStore(store);
  return record;
}

export async function removePackAttachment(attachmentId: string, tenantId: string): Promise<boolean> {
  const store = loadRequestStore();
  const initialLen = store.attachments.length;
  store.attachments = store.attachments.filter((a) => !(a.id === attachmentId && a.tenant_id === tenantId));
  const removed = store.attachments.length < initialLen;
  if (removed) saveRequestStore(store);
  return removed;
}

// ─────────────────────────────────────────────────────────────
// 5. AUDIT EVENTS (Append-only)
// ─────────────────────────────────────────────────────────────

export async function logPackEvent(
  packId: string,
  tenantId: string,
  userId: string,
  eventType: RequirementPackEventType,
  payload?: Record<string, unknown>
): Promise<RequirementPackEvent> {
  const store = loadRequestStore();
  const event: RequirementPackEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    pack_id: packId,
    tenant_id: tenantId,
    actor_user_id: userId,
    event_type: eventType,
    payload,
    created_at: new Date().toISOString(),
  };

  store.events.push(event);
  saveRequestStore(store);
  return event;
}

export async function getPackEvents(packId: string, tenantId: string): Promise<RequirementPackEvent[]> {
  const store = loadRequestStore();
  return store.events
    .filter((e) => e.pack_id === packId && e.tenant_id === tenantId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ─────────────────────────────────────────────────────────────
// HELPER: Populate Relations
// ─────────────────────────────────────────────────────────────

function populatePackRelations(pack: RequirementPack, store: RequestStoreData): RequirementPack {
  return {
    ...pack,
    trades: store.trades.filter((t) => t.pack_id === pack.id),
    requirements: store.requirements
      .filter((r) => r.pack_id === pack.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    attachments: store.attachments.filter((a) => a.pack_id === pack.id),
    events: store.events
      .filter((e) => e.pack_id === pack.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  };
}
