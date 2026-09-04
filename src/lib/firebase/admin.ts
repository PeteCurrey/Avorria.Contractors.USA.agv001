/**
 * AVORRIA — FIREBASE ADMIN SDK INITIALISER
 * Server-side only. Never imported by client components.
 *
 * Reads FIREBASE_SERVICE_ACCOUNT_JSON (base64-encoded service account JSON)
 * and FIREBASE_STORAGE_BUCKET env vars.
 *
 * Lazily initialised — safe for Next.js serverless/edge cold starts.
 */

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App | null = null;

function getFirebaseAdminApp(): App {
  if (app) return app;

  const existing = getApps().find((a) => a.name === 'avorria-admin');
  if (existing) {
    app = existing;
    return app;
  }

  const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!serviceAccountB64 || !bucket) {
    // In test/offline mode, return a mock app reference.
    // The admin SDK methods are not called in test mode — the mock db layer handles everything.
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON and FIREBASE_STORAGE_BUCKET must be set for Firebase Admin SDK. ' +
        'In test environments, use the mock upload flow in src/lib/assets/db.ts.'
    );
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountB64, 'base64').toString('utf-8')
  );

  app = initializeApp(
    {
      credential: cert(serviceAccount),
      storageBucket: bucket,
    },
    'avorria-admin'
  );

  return app;
}

/**
 * Returns the Firebase Admin Storage bucket.
 * Scoped upload URLs are generated from this bucket reference.
 */
export function getFirebaseAdminStorage(): Storage {
  return getStorage(getFirebaseAdminApp());
}

/**
 * Generate a signed upload URL for a specific org/asset path.
 * The client uses this URL to upload directly to Firebase Storage.
 * The path is validated server-side in the confirm route.
 *
 * @param orgId   - Organisation UUID (used to scope the path)
 * @param assetId - Asset UUID
 * @param fileName - Sanitised file name (no user-controlled path traversal)
 * @param mimeType - e.g. 'application/pdf', 'image/jpeg'
 * @returns { signedUrl, storagePath }
 */
export async function generateSignedUploadUrl(
  orgId: string,
  assetId: string,
  fileName: string,
  mimeType: string
): Promise<{ signedUrl: string; storagePath: string }> {
  const storage = getFirebaseAdminStorage();
  const bucket = storage.bucket();

  // Sanitise file name — strip path separators
  const safeName = fileName.replace(/[/\\]/g, '_');
  const uuid = crypto.randomUUID();
  const storagePath = `orgs/${orgId}/assets/${assetId}/${uuid}-${safeName}`;

  const file = bucket.file(storagePath);
  const expiresMs = Date.now() + 15 * 60 * 1000; // 15 minutes

  const [signedUrl] = await file.getSignedUrl({
    action: 'write',
    expires: expiresMs,
    contentType: mimeType,
  });

  return { signedUrl, storagePath };
}

/**
 * Validate that a storagePath belongs to the expected org.
 * Prevents a client from spoofing a path from another org on the confirm call.
 */
export function validateStoragePath(storagePath: string, orgId: string): boolean {
  return storagePath.startsWith(`orgs/${orgId}/assets/`);
}

/**
 * Build the public or authenticated download URL from a storage path.
 * Uses Firebase Storage download URL format.
 */
export function buildStorageUrl(storagePath: string): string {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET ?? 'BUCKET_NOT_SET';
  const encoded = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media`;
}
