/**
 * AVORRIA — FIREBASE CLIENT SDK INITIALISER
 * Client-side only. Uses only public environment variables.
 *
 * Exports uploadFileToSignedUrl() — the browser uploads directly
 * to Firebase Storage using a pre-signed URL from the server.
 * No Supabase write happens during the upload phase.
 */

'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage';

let clientApp: FirebaseApp | null = null;

function getFirebaseClientApp(): FirebaseApp {
  if (clientApp) return clientApp;

  const existing = getApps().find((a) => a.name === 'avorria-client');
  if (existing) {
    clientApp = existing;
    return clientApp;
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // If not configured, the upload UI will use a mock flow
  if (!config.apiKey || !config.storageBucket) {
    throw new Error(
      'Firebase client config is missing. Set NEXT_PUBLIC_FIREBASE_* env vars.'
    );
  }

  clientApp = initializeApp(config, 'avorria-client');
  return clientApp;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

/**
 * Upload a file directly to Firebase Storage using a server-issued signed URL.
 *
 * The client calls this AFTER receiving { signedUrl, storagePath } from
 * /api/assets/upload/request-url. Firebase receives the file blob directly —
 * no Supabase write occurs here.
 *
 * After this resolves, the client must call /api/assets/upload/confirm to
 * write the asset_documents record in Supabase.
 */
export async function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          bytesTransferred: event.loaded,
          totalBytes: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Firebase upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Firebase upload failed: network error'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Firebase upload aborted'));
    });

    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  });
}

/**
 * Check whether Firebase client config is available.
 * Used by the upload UI to decide between real upload and mock flow.
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  );
}
