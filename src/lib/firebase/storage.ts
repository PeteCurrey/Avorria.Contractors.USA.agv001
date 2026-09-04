/**
 * AVORRIA — CONTRACTOR PHOTO STORAGE ADAPTER
 *
 * Implements private storage for contractor compliance photos:
 *   Storage path: /contractor-photos/{userId}/{uploadId}.{ext}
 *
 * Scoped strictly to the owning userId (mirroring Passport document privacy).
 * Dual-mode:
 *   - Writes to Firebase Storage if FIREBASE_STORAGE_BUCKET is configured.
 *   - Otherwise persists securely to .data/storage/contractor-photos/{userId}/
 *     with identical multi-tenant isolation and path semantics.
 *
 * Constraints enforced:
 *   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
 *   - Maximum size: 10MB (10,485,760 bytes)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ─── Constants & Constraints ──────────────────────────────────────────────────

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_PHOTO_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export class StorageValidationError extends Error {
  constructor(message: string, public readonly code: 'INVALID_TYPE' | 'EXCEEDS_SIZE') {
    super(message);
    this.name = 'StorageValidationError';
  }
}

export class StorageSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageSecurityError';
  }
}

export interface StoredPhotoResult {
  uploadId: string;
  storagePath: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
}

export interface RetrievedPhoto {
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
}

// ─── Local Storage Directory Helper ──────────────────────────────────────────

const LOCAL_STORAGE_ROOT = path.join(process.cwd(), '.data', 'storage', 'contractor-photos');

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validates and saves a contractor photo.
 *
 * @throws StorageValidationError if file type is unsupported or exceeds 10MB.
 */
export async function saveContractorPhoto(params: {
  userId: string;
  buffer: Buffer;
  mimeType: string;
  originalFilename?: string;
}): Promise<StoredPhotoResult> {
  const { userId, buffer, mimeType, originalFilename } = params;

  // 1. Validate MIME type
  const ext = ALLOWED_PHOTO_MIME_TYPES[mimeType.toLowerCase()];
  if (!ext) {
    const allowed = Object.keys(ALLOWED_PHOTO_MIME_TYPES).join(', ');
    throw new StorageValidationError(
      `Unsupported file type "${mimeType}". Allowed formats: JPEG, PNG, WebP, GIF.`,
      'INVALID_TYPE'
    );
  }

  // 2. Validate file size
  if (buffer.length > MAX_PHOTO_SIZE_BYTES) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
    throw new StorageValidationError(
      `File size (${sizeMb} MB) exceeds maximum permitted size of 10 MB.`,
      'EXCEEDS_SIZE'
    );
  }

  if (buffer.length === 0) {
    throw new StorageValidationError('File is empty (0 bytes).', 'INVALID_TYPE');
  }

  const uploadId = crypto.randomBytes(12).toString('hex');
  const filename = `${uploadId}.${ext}`;
  const storagePath = `/contractor-photos/${userId}/${filename}`;
  const now = new Date().toISOString();

  // If Firebase Storage is configured in production, write to bucket
  if (process.env.FIREBASE_STORAGE_BUCKET && process.env.FIREBASE_PROJECT_ID) {
    try {
      const { getApps, initializeApp, cert } = await import('firebase-admin/app');
      const { getStorage } = await import('firebase-admin/storage');

      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
      }

      const bucket = getStorage().bucket();
      // Remove leading slash for GCS path
      const gcsPath = storagePath.replace(/^\//, '');
      const file = bucket.file(gcsPath);

      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            ownerUserId: userId,
            originalFilename: originalFilename || filename,
            createdAt: now,
          },
        },
      });

      return {
        uploadId,
        storagePath,
        filename,
        sizeBytes: buffer.length,
        mimeType,
        createdAt: now,
      };
    } catch (err) {
      console.warn('Firebase Storage upload failed, falling back to local store:', err);
    }
  }

  // File-backed storage (.data/storage/contractor-photos/{userId}/{filename})
  const userDir = path.join(LOCAL_STORAGE_ROOT, userId);
  ensureDir(userDir);

  const localFilePath = path.join(userDir, filename);
  fs.writeFileSync(localFilePath, buffer);

  // Write metadata sidecar
  const metaFilePath = path.join(userDir, `${filename}.meta.json`);
  fs.writeFileSync(
    metaFilePath,
    JSON.stringify(
      {
        uploadId,
        storagePath,
        userId,
        mimeType,
        sizeBytes: buffer.length,
        originalFilename: originalFilename || filename,
        createdAt: now,
      },
      null,
      2
    )
  );

  return {
    uploadId,
    storagePath,
    filename,
    sizeBytes: buffer.length,
    mimeType,
    createdAt: now,
  };
}

/**
 * Retrieves a photo by its storage path, strictly enforcing multi-tenant isolation.
 *
 * @throws StorageSecurityError if caller's userId does not match storage path owner.
 */
export async function getContractorPhoto(
  requestingUserId: string,
  storagePath: string
): Promise<RetrievedPhoto | null> {
  // Normalize path
  const normalizedPath = storagePath.startsWith('/') ? storagePath : `/${storagePath}`;

  // Multi-tenant check: storagePath must start with /contractor-photos/{userId}/
  const pathPrefix = `/contractor-photos/${requestingUserId}/`;
  if (!normalizedPath.startsWith(pathPrefix)) {
    throw new StorageSecurityError(
      'Access denied: You do not have permission to access photos outside your workspace.'
    );
  }

  const filename = path.basename(normalizedPath);

  // Check Firebase Storage first if configured
  if (process.env.FIREBASE_STORAGE_BUCKET && process.env.FIREBASE_PROJECT_ID) {
    try {
      const { getStorage } = await import('firebase-admin/storage');
      const bucket = getStorage().bucket();
      const gcsPath = normalizedPath.replace(/^\//, '');
      const file = bucket.file(gcsPath);
      const [exists] = await file.exists();
      if (exists) {
        const [buffer] = await file.download();
        const [metadata] = await file.getMetadata();
        return {
          buffer,
          mimeType: metadata.contentType || 'image/jpeg',
          sizeBytes: buffer.length,
        };
      }
    } catch {
      // Fall through to local
    }
  }

  // Local storage lookup
  const localFilePath = path.join(LOCAL_STORAGE_ROOT, requestingUserId, filename);
  if (!fs.existsSync(localFilePath)) {
    return null;
  }

  const buffer = fs.readFileSync(localFilePath);
  const metaPath = path.join(LOCAL_STORAGE_ROOT, requestingUserId, `${filename}.meta.json`);

  let mimeType = 'image/jpeg';
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      mimeType = meta.mimeType || mimeType;
    } catch {
      // Use fallback mimeType
    }
  } else {
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    const entry = Object.entries(ALLOWED_PHOTO_MIME_TYPES).find(([, e]) => e === ext);
    if (entry) mimeType = entry[0];
  }

  return {
    buffer,
    mimeType,
    sizeBytes: buffer.length,
  };
}
