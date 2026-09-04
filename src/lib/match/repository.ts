/**
 * AVORRIA MATCH REPOSITORY
 * Phase 10: Hermetic persistence for Match Sets and immutable contractor snapshots.
 */

import fs from 'fs';
import path from 'path';
import { MatchSet } from './types';

export interface MatchesStoreData {
  matchSets: Record<string, MatchSet>; // keyed by pack_id
}

const DATA_DIR = path.join(process.cwd(), '.data');
const MATCHES_FILE = path.join(DATA_DIR, 'matches-store.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadMatchesStore(): MatchesStoreData {
  ensureDataDir();
  if (!fs.existsSync(MATCHES_FILE)) {
    return { matchSets: {} };
  }
  try {
    const raw = fs.readFileSync(MATCHES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { matchSets: parsed.matchSets || {} };
  } catch {
    return { matchSets: {} };
  }
}

export function saveMatchesStore(store: MatchesStoreData): void {
  ensureDataDir();
  fs.writeFileSync(MATCHES_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export async function getMatchSetByPackId(
  packId: string,
  tenantId?: string
): Promise<MatchSet | null> {
  const store = loadMatchesStore();
  const set = store.matchSets[packId];
  if (!set) return null;

  if (tenantId && set.tenant_id !== tenantId) {
    return null; // Strict tenant isolation
  }

  return set;
}

export async function saveMatchSetWithSnapshots(matchSet: MatchSet): Promise<MatchSet> {
  const store = loadMatchesStore();
  const now = new Date().toISOString();

  store.matchSets[matchSet.pack_id] = {
    ...matchSet,
    updated_at: now,
  };

  saveMatchesStore(store);
  return store.matchSets[matchSet.pack_id];
}

export async function invalidateMatchSet(
  packId: string,
  tenantId: string,
  reason: string
): Promise<boolean> {
  const store = loadMatchesStore();
  const set = store.matchSets[packId];
  if (!set) return false;

  if (set.tenant_id !== tenantId) {
    throw new Error('Unauthorized: Tenant does not own this match set');
  }

  set.is_stale = true;
  set.status = 'stale';
  set.stale_reason = reason;
  set.updated_at = new Date().toISOString();

  saveMatchesStore(store);
  return true;
}

export async function deleteMatchSetsForPack(packId: string, tenantId: string): Promise<boolean> {
  const store = loadMatchesStore();
  const set = store.matchSets[packId];
  if (!set || set.tenant_id !== tenantId) return false;

  delete store.matchSets[packId];
  saveMatchesStore(store);
  return true;
}
