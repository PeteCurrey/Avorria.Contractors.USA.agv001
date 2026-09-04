/**
 * AVORRIA — FIRESTORE DUAL-MODE ADAPTER
 *
 * Writes to Google Cloud Firestore when Firebase Admin credentials are
 * present in env; otherwise persists to .data/firestore/ with identical
 * collection/document/subcollection semantics.
 *
 * Supported environment variables (all required for live Firestore):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (newlines as \n)
 *
 * When running without credentials the file-based adapter is used
 * automatically — no configuration change needed.
 *
 * Collection path examples:
 *   Top-level:    'askAvorriaThreads'
 *   Subcollection: 'askAvorriaThreads/{threadId}/messages'
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ─── Types ───────────────────────────────────────────────────────────────────

type DocData = Record<string, any>;

export interface FirestoreDocument<T extends DocData = DocData> {
  id: string;
  data: T;
}

// ─── Firebase Admin (lazy, only instantiated when credentials exist) ──────────

let _firestoreDb: import('firebase-admin/firestore').Firestore | null = null;

function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

async function getFirestoreDb(): Promise<import('firebase-admin/firestore').Firestore> {
  if (_firestoreDb) return _firestoreDb;

  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    });
  }

  _firestoreDb = getFirestore();
  return _firestoreDb;
}

/**
 * Parse a slash-delimited collection path into alternating collection/doc
 * segments and return the final Firestore CollectionReference.
 *
 * 'askAvorriaThreads'                   -> db.collection('askAvorriaThreads')
 * 'askAvorriaThreads/abc/messages'      -> db.collection('askAvorriaThreads').doc('abc').collection('messages')
 */
async function resolveFirestoreCollection(collectionPath: string) {
  const db = await getFirestoreDb();
  const parts = collectionPath.split('/');

  if (parts.length === 1) {
    return db.collection(parts[0]);
  }
  if (parts.length === 3) {
    return db.collection(parts[0]).doc(parts[1]).collection(parts[2]);
  }
  throw new Error(`Unsupported Firestore collection path depth: ${collectionPath}`);
}

// ─── File-based adapter ───────────────────────────────────────────────────────

const STORE_ROOT = path.join(process.cwd(), '.data', 'firestore');

function collectionDir(collectionPath: string): string {
  // 'askAvorriaThreads/abc123/messages'
  //   -> .data/firestore/askAvorriaThreads/abc123/messages/
  return path.join(STORE_ROOT, ...collectionPath.split('/'));
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateId(): string {
  return crypto.randomBytes(10).toString('hex');
}

function fileReadDoc<T>(dir: string, docId: string): T | null {
  const filePath = path.join(dir, `${docId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function fileWriteDoc(dir: string, docId: string, data: DocData): void {
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${docId}.json`), JSON.stringify(data, null, 2));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Add a new document with a generated ID.
 */
export async function addDocument<T extends DocData>(
  collectionPath: string,
  data: Omit<T, 'id'>
): Promise<T & { id: string }> {
  const id = generateId();
  const doc = { ...data, id } as T & { id: string };

  if (isFirebaseConfigured()) {
    const col = await resolveFirestoreCollection(collectionPath);
    await col.doc(id).set(doc);
    return doc;
  }

  const dir = collectionDir(collectionPath);
  fileWriteDoc(dir, id, doc as DocData);
  return doc;
}

/**
 * Write (upsert) a document at a specific ID.
 */
export async function setDocument<T extends DocData>(
  collectionPath: string,
  docId: string,
  data: T
): Promise<void> {
  const doc = { ...data, id: docId };

  if (isFirebaseConfigured()) {
    const col = await resolveFirestoreCollection(collectionPath);
    await col.doc(docId).set(doc, { merge: true });
    return;
  }

  const dir = collectionDir(collectionPath);
  const existing = fileReadDoc<DocData>(dir, docId) ?? {};
  fileWriteDoc(dir, docId, { ...existing, ...doc });
}

/**
 * Retrieve a single document by ID. Returns null if not found.
 */
export async function getDocument<T extends DocData>(
  collectionPath: string,
  docId: string
): Promise<T | null> {
  if (isFirebaseConfigured()) {
    const col = await resolveFirestoreCollection(collectionPath);
    const snap = await col.doc(docId).get();
    if (!snap.exists) return null;
    return snap.data() as T;
  }

  const dir = collectionDir(collectionPath);
  return fileReadDoc<T>(dir, docId);
}

/**
 * Query a collection for documents where field === value.
 */
export async function queryDocuments<T extends DocData>(
  collectionPath: string,
  field: string,
  value: unknown
): Promise<T[]> {
  if (isFirebaseConfigured()) {
    const col = await resolveFirestoreCollection(collectionPath);
    const snapshot = await (col as import('firebase-admin/firestore').CollectionReference)
      .where(field, '==', value)
      .get();
    return snapshot.docs.map((d) => d.data() as T);
  }

  const dir = collectionDir(collectionPath);
  if (!fs.existsSync(dir)) return [];

  const results: T[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    try {
      const doc = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as Record<string, unknown>;
      if (doc[field] === value) results.push(doc as T);
    } catch {
      // Skip corrupted files
    }
  }
  return results;
}

/**
 * Return all documents in a collection (no filter).
 */
export async function getAllDocuments<T extends DocData>(
  collectionPath: string
): Promise<T[]> {
  if (isFirebaseConfigured()) {
    const col = await resolveFirestoreCollection(collectionPath);
    const snapshot = await (col as import('firebase-admin/firestore').CollectionReference).get();
    return snapshot.docs.map((d) => d.data() as T);
  }

  const dir = collectionDir(collectionPath);
  if (!fs.existsSync(dir)) return [];

  const results: T[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    try {
      results.push(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as T);
    } catch {
      // Skip corrupted files
    }
  }
  return results;
}

/** Expose which backend is active (for logging / diagnostics). */
export function getBackendMode(): 'firebase' | 'file' {
  return isFirebaseConfigured() ? 'firebase' : 'file';
}
