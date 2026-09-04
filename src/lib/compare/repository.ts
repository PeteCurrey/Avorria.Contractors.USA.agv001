/**
 * AVORRIA COMPARE REPOSITORY LAYER
 * Phase 12: Hermetic persistence in `.data/compare-store.json` with multi-tenant isolation.
 */

import fs from 'fs';
import path from 'path';
import {
  CompareSet,
  CompareContractor,
  CompareEvent,
  ComparisonClarificationStatus,
} from './types';

export interface CompareStoreData {
  sets: Record<string, CompareSet>;
  contractors: CompareContractor[];
  events: CompareEvent[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'compare-store.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadCompareStore(): CompareStoreData {
  ensureDataDir();
  if (!fs.existsSync(STORE_FILE)) {
    return { sets: {}, contractors: [], events: [] };
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      sets: parsed.sets || {},
      contractors: parsed.contractors || [],
      events: parsed.events || [],
    };
  } catch {
    return { sets: {}, contractors: [], events: [] };
  }
}

export function saveCompareStore(store: CompareStoreData): void {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export function resetCompareStore(): void {
  ensureDataDir();
  if (fs.existsSync(STORE_FILE)) {
    fs.unlinkSync(STORE_FILE);
  }
}

function populateCompareSetRelations(set: CompareSet, store: CompareStoreData): CompareSet {
  const contractors = store.contractors.filter((c) => c.compare_set_id === set.id);
  const events = store.events.filter((e) => e.compare_set_id === set.id);
  return {
    ...set,
    contractors,
    events,
  };
}

export async function getCompareSetById(
  id: string,
  tenantId?: string
): Promise<CompareSet | null> {
  const store = loadCompareStore();
  const set = store.sets[id];
  if (!set) return null;
  if (tenantId && set.tenant_id !== tenantId) {
    return null; // Tenant isolation
  }
  return populateCompareSetRelations(set, store);
}

export async function getCompareSetsByRequest(
  requestId: string,
  tenantId: string
): Promise<CompareSet[]> {
  const store = loadCompareStore();
  return Object.values(store.sets)
    .filter((s) => s.request_id === requestId && s.tenant_id === tenantId)
    .map((s) => populateCompareSetRelations(s, store))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function saveCompareSet(compareSet: CompareSet): Promise<CompareSet> {
  const store = loadCompareStore();
  const now = new Date().toISOString();
  store.sets[compareSet.id] = {
    ...compareSet,
    updated_at: now,
  };
  saveCompareStore(store);
  return populateCompareSetRelations(store.sets[compareSet.id], store);
}

export async function deleteCompareSet(id: string, tenantId: string): Promise<boolean> {
  const store = loadCompareStore();
  const set = store.sets[id];
  if (!set || set.tenant_id !== tenantId) return false;

  delete store.sets[id];
  store.contractors = store.contractors.filter((c) => c.compare_set_id !== id);
  store.events = store.events.filter((e) => e.compare_set_id !== id);

  saveCompareStore(store);
  return true;
}

export async function saveCompareContractors(
  compareSetId: string,
  contractors: CompareContractor[]
): Promise<void> {
  const store = loadCompareStore();
  // Remove any existing contractors for this set
  store.contractors = store.contractors.filter((c) => c.compare_set_id !== compareSetId);
  store.contractors.push(...contractors);
  saveCompareStore(store);
}

export async function getCompareContractors(compareSetId: string): Promise<CompareContractor[]> {
  const store = loadCompareStore();
  return store.contractors.filter((c) => c.compare_set_id === compareSetId);
}

export async function updateCompareClarification(
  compareSetId: string,
  contractorId: string,
  requirementId: string,
  status: ComparisonClarificationStatus
): Promise<boolean> {
  const store = loadCompareStore();
  const targetContractor = store.contractors.find(
    (c) => c.compare_set_id === compareSetId && c.contractor_id === contractorId
  );
  if (!targetContractor) return false;

  const targetReq = targetContractor.requirement_declarations.find(
    (r) => r.requirement_id === requirementId
  );
  if (!targetReq) return false;

  targetReq.clarification_status = status;
  saveCompareStore(store);
  return true;
}

export async function logCompareEvent(
  compareSetId: string,
  tenantId: string,
  userId: string,
  eventType: CompareEvent['event_type'],
  eventData: Record<string, unknown> = {}
): Promise<CompareEvent> {
  const store = loadCompareStore();
  const event: CompareEvent = {
    id: `cme_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    compare_set_id: compareSetId,
    tenant_id: tenantId,
    user_id: userId,
    event_type: eventType,
    event_data: eventData,
    created_at: new Date().toISOString(),
  };

  store.events.push(event);
  saveCompareStore(store);
  return event;
}

export async function getCompareEvents(
  compareSetId: string,
  tenantId: string
): Promise<CompareEvent[]> {
  const store = loadCompareStore();
  const set = store.sets[compareSetId];
  if (!set || set.tenant_id !== tenantId) return [];
  return store.events
    .filter((e) => e.compare_set_id === compareSetId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function invalidateCompareSetsByRequest(
  requestId: string,
  reason: string
): Promise<number> {
  const store = loadCompareStore();
  let count = 0;
  const now = new Date().toISOString();

  for (const set of Object.values(store.sets)) {
    if (set.request_id === requestId && !set.is_stale) {
      set.is_stale = true;
      set.stale_reason = reason;
      set.updated_at = now;
      count++;
      // Log event
      store.events.push({
        id: `cme_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        compare_set_id: set.id,
        tenant_id: set.tenant_id,
        user_id: 'system',
        event_type: 'compare_invalidated',
        event_data: { reason },
        created_at: now,
      });
    }
  }

  if (count > 0) {
    saveCompareStore(store);
  }
  return count;
}
