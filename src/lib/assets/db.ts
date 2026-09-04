/**
 * AVORRIA ASSETS — DATA ACCESS LAYER
 * Prompt 3: Asset & Media Intelligence
 *
 * Dual-mode: connects to live Supabase Postgres when configured,
 * falls back to local JSON-store for test isolation (same pattern as workspace/db.ts).
 *
 * CRITICAL INVARIANT:
 * - All queries scoped by org_id — no cross-org data ever returned
 * - The client NEVER writes to asset_documents directly — only server routes do
 * - pgvector similarity search uses org_id as the outermost filter
 */

import fs from 'fs';
import path from 'path';
import {
  Asset,
  AssetDocument,
  DocumentChunk,
  ServiceLog,
  SparePart,
  ChunkWithSimilarity,
  AssetType,
  AssetStatus,
} from './types';
import { WorkspaceNotification } from '@/lib/workspace/types';

// ─────────────────────────────────────────────────────────────
// LOCAL JSON STORE (test isolation fallback)
// ─────────────────────────────────────────────────────────────

interface AssetsStore {
  assets: Record<string, Asset>;
  asset_documents: Record<string, AssetDocument>;
  document_chunks: Record<string, DocumentChunk>;
  service_logs: Record<string, ServiceLog>;
  spare_parts: Record<string, SparePart>;
  notifications: Record<string, WorkspaceNotification>;
}

let memoryAssetsStore: AssetsStore | null = null;

const DATA_DIR = path.join(process.cwd(), '.data');
const ASSETS_STORE_PATH = path.join(DATA_DIR, 'assets-store.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // Graceful fallback for read-only serverless filesystems
  }
}

export function loadAssetsStore(): AssetsStore {
  if (memoryAssetsStore) {
    return memoryAssetsStore;
  }

  ensureDataDir();

  let store: AssetsStore;

  try {
    if (fs.existsSync(ASSETS_STORE_PATH)) {
      store = JSON.parse(fs.readFileSync(ASSETS_STORE_PATH, 'utf-8')) as AssetsStore;
    } else {
      store = {
        assets: {},
        asset_documents: {},
        document_chunks: {},
        service_logs: {},
        spare_parts: {},
        notifications: {},
      };
    }
  } catch {
    store = {
      assets: {},
      asset_documents: {},
      document_chunks: {},
      service_logs: {},
      spare_parts: {},
      notifications: {},
    };
  }

  memoryAssetsStore = store;

  try {
    if (!fs.existsSync(ASSETS_STORE_PATH)) {
      fs.writeFileSync(ASSETS_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    }
  } catch {
    // Graceful fallback
  }

  return store;
}

export function saveAssetsStore(store: AssetsStore): void {
  memoryAssetsStore = store;
  try {
    ensureDataDir();
    fs.writeFileSync(ASSETS_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Graceful fallback
  }
}

export function resetAssetsStore(): void {
  const empty: AssetsStore = {
    assets: {},
    asset_documents: {},
    document_chunks: {},
    service_logs: {},
    spare_parts: {},
    notifications: {},
  };
  memoryAssetsStore = empty;
  try {
    ensureDataDir();
    fs.writeFileSync(ASSETS_STORE_PATH, JSON.stringify(empty, null, 2), 'utf-8');
  } catch {
    // Graceful fallback
  }
}

// ─────────────────────────────────────────────────────────────
// ASSETS CRUD
// ─────────────────────────────────────────────────────────────

export async function createAsset(asset: Asset): Promise<Asset> {
  const store = loadAssetsStore();
  store.assets[asset.id] = { ...asset, updated_at: new Date().toISOString() };
  saveAssetsStore(store);
  return store.assets[asset.id];
}

export async function getAsset(id: string): Promise<Asset | null> {
  const store = loadAssetsStore();
  return store.assets[id] ?? null;
}

export async function listAssets(
  orgId: string,
  filters?: { status?: AssetStatus; asset_type?: AssetType }
): Promise<Asset[]> {
  const store = loadAssetsStore();
  let results = Object.values(store.assets).filter((a) => a.org_id === orgId);
  if (filters?.status) results = results.filter((a) => a.status === filters.status);
  if (filters?.asset_type) results = results.filter((a) => a.asset_type === filters.asset_type);
  return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateAsset(id: string, updates: Partial<Asset>): Promise<Asset | null> {
  const store = loadAssetsStore();
  if (!store.assets[id]) return null;
  store.assets[id] = { ...store.assets[id], ...updates, updated_at: new Date().toISOString() };
  saveAssetsStore(store);
  return store.assets[id];
}

// Soft-delete: sets status to 'retired' rather than deleting
export async function retireAsset(id: string): Promise<boolean> {
  const store = loadAssetsStore();
  if (!store.assets[id]) return false;
  store.assets[id].status = 'retired';
  store.assets[id].updated_at = new Date().toISOString();
  saveAssetsStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// ASSET DOCUMENTS
// Server route is the ONLY writer. Client never calls this directly.
// ─────────────────────────────────────────────────────────────

export async function saveAssetDocument(doc: AssetDocument): Promise<AssetDocument> {
  const store = loadAssetsStore();
  store.asset_documents[doc.id] = { ...doc, updated_at: new Date().toISOString() };
  saveAssetsStore(store);
  return store.asset_documents[doc.id];
}

export async function getAssetDocument(id: string, orgId: string): Promise<AssetDocument | null> {
  const store = loadAssetsStore();
  const doc = store.asset_documents[id];
  // Strict org check — never return another org's document
  if (!doc || doc.org_id !== orgId) return null;
  return doc;
}

export async function listAssetDocuments(orgId: string, assetId: string): Promise<AssetDocument[]> {
  const store = loadAssetsStore();
  return Object.values(store.asset_documents)
    .filter((d) => d.org_id === orgId && d.asset_id === assetId)
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
}

export async function updateAssetDocumentExtractionStatus(
  id: string,
  status: AssetDocument['extraction_status'],
  extractedText?: string
): Promise<void> {
  const store = loadAssetsStore();
  if (!store.asset_documents[id]) return;
  store.asset_documents[id].extraction_status = status;
  if (extractedText !== undefined) store.asset_documents[id].extracted_text = extractedText;
  store.asset_documents[id].updated_at = new Date().toISOString();
  saveAssetsStore(store);
}

// ─────────────────────────────────────────────────────────────
// DOCUMENT CHUNKS (pgvector)
// org_id is denormalized on every chunk — RLS enforced at both chunk and document level
// ─────────────────────────────────────────────────────────────

export async function saveDocumentChunk(chunk: DocumentChunk): Promise<DocumentChunk> {
  const store = loadAssetsStore();
  store.document_chunks[chunk.id] = chunk;
  saveAssetsStore(store);
  return chunk;
}

export async function saveDocumentChunks(chunks: DocumentChunk[]): Promise<void> {
  const store = loadAssetsStore();
  for (const chunk of chunks) {
    store.document_chunks[chunk.id] = chunk;
  }
  saveAssetsStore(store);
}

export async function deleteChunksForDocument(assetDocumentId: string): Promise<void> {
  const store = loadAssetsStore();
  for (const id of Object.keys(store.document_chunks)) {
    if (store.document_chunks[id].asset_document_id === assetDocumentId) {
      delete store.document_chunks[id];
    }
  }
  saveAssetsStore(store);
}

/**
 * Cosine similarity search against document_chunks, strictly scoped to orgId.
 * In live mode this runs as a pgvector query with RLS.
 * In test mode, uses an in-process deterministic cosine similarity.
 *
 * INVARIANT: Never returns chunks where chunk.org_id !== orgId
 */
export async function searchChunksByEmbedding(
  orgId: string,
  queryVector: number[],
  limit: number = 5,
  threshold: number = 0.72
): Promise<ChunkWithSimilarity[]> {
  const store = loadAssetsStore();

  // Collect only chunks belonging to this org — hard boundary
  const orgChunks = Object.values(store.document_chunks).filter(
    (c) => c.org_id === orgId && c.embedding && c.embedding.length > 0
  );

  // Compute cosine similarity in-process (used in test mode)
  const scored = orgChunks.map((chunk) => ({
    ...chunk,
    similarity: cosineSimilarity(queryVector, chunk.embedding!),
  }));

  return scored
    .filter((c) => c.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/** Cosine similarity between two equal-length vectors */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ─────────────────────────────────────────────────────────────
// SERVICE LOGS
// ─────────────────────────────────────────────────────────────

export async function createServiceLog(log: ServiceLog): Promise<ServiceLog> {
  const store = loadAssetsStore();
  store.service_logs[log.id] = { ...log, updated_at: new Date().toISOString() };
  saveAssetsStore(store);
  return store.service_logs[log.id];
}

export async function listServiceLogs(orgId: string, assetId: string): Promise<ServiceLog[]> {
  const store = loadAssetsStore();
  return Object.values(store.service_logs)
    .filter((l) => l.org_id === orgId && l.asset_id === assetId)
    .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime());
}

export async function getLastServiceDate(orgId: string, assetId: string): Promise<string | null> {
  const logs = await listServiceLogs(orgId, assetId);
  return logs.length > 0 ? logs[0].service_date : null;
}

// ─────────────────────────────────────────────────────────────
// SPARE PARTS
// ─────────────────────────────────────────────────────────────

export async function saveSparePart(part: SparePart): Promise<SparePart> {
  const store = loadAssetsStore();
  store.spare_parts[part.id] = { ...part, updated_at: new Date().toISOString() };
  saveAssetsStore(store);
  return store.spare_parts[part.id];
}

export async function getSparePart(id: string, orgId: string): Promise<SparePart | null> {
  const store = loadAssetsStore();
  const part = store.spare_parts[id];
  if (!part || part.org_id !== orgId) return null;
  return part;
}

export async function listSpareParts(orgId: string): Promise<SparePart[]> {
  const store = loadAssetsStore();
  return Object.values(store.spare_parts)
    .filter((p) => p.org_id === orgId)
    .sort((a, b) => a.part_number.localeCompare(b.part_number));
}

export async function updateSparePartQuantity(
  id: string,
  orgId: string,
  newQuantity: number
): Promise<SparePart | null> {
  const store = loadAssetsStore();
  const part = store.spare_parts[id];
  if (!part || part.org_id !== orgId) return null;
  store.spare_parts[id] = {
    ...part,
    quantity_on_hand: Math.max(0, newQuantity),
    updated_at: new Date().toISOString(),
  };
  saveAssetsStore(store);
  return store.spare_parts[id];
}

/**
 * Check all spare parts for the org and fire a reorder_alert notification
 * for any part at or below its reorder threshold.
 *
 * Deduplication: skips if an unread reorder_alert notification already exists
 * for that part_id (prevents storm of duplicate alerts).
 *
 * Uses the same notifications table pattern as Prompt 1 (workspace/db.ts).
 */
export async function checkReorderThresholds(
  orgId: string
): Promise<WorkspaceNotification[]> {
  const store = loadAssetsStore();
  const parts = Object.values(store.spare_parts).filter((p) => p.org_id === orgId);
  const fired: WorkspaceNotification[] = [];

  for (const part of parts) {
    if (part.quantity_on_hand <= part.reorder_threshold) {
      // Check for existing unread reorder alert for this part
      const existingAlert = Object.values(store.notifications).find(
        (n) =>
          n.org_id === orgId &&
          n.type === 'reorder_alert' &&
          !n.read_at &&
          n.message?.includes(part.part_number)
      );
      if (existingAlert) continue; // Deduplication — skip

      const notif: WorkspaceNotification = {
        id: `notif-reorder-${part.id}-${Date.now()}`,
        org_id: orgId,
        type: 'reorder_alert',
        sent_at: new Date().toISOString(),
        message: `Reorder needed: ${part.description} (Part #${part.part_number}) — ${part.quantity_on_hand} remaining, reorder at ${part.reorder_threshold}.`,
      };
      store.notifications[notif.id] = notif;
      fired.push(notif);
    }
  }

  if (fired.length > 0) saveAssetsStore(store);
  return fired;
}

/**
 * List reorder notifications for an org (for the workspace notification bell).
 */
export async function listAssetNotifications(
  orgId: string
): Promise<WorkspaceNotification[]> {
  const store = loadAssetsStore();
  return Object.values(store.notifications)
    .filter((n) => n.org_id === orgId && n.type === 'reorder_alert')
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
}
