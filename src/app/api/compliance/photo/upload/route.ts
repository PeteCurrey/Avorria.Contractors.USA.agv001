/**
 * POST /api/compliance/photo/upload
 *
 * Uploads a job-site photo for compliance inspection:
 *   - Enforces file constraints: JPEG, PNG, WebP, GIF only.
 *   - Enforces maximum file size of 10MB.
 *   - Saves to private contractor path: /contractor-photos/{userId}/{uploadId}.{ext}
 *   - Returns clear, actionable user-facing error messages on rejection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import {
  saveContractorPhoto,
  StorageValidationError,
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
} from '@/lib/firebase/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let tenant;
  try {
    tenant = await getTenantContext();
  } catch {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request: multipart/form-data required.' },
      { status: 400 }
    );
  }

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'No image file provided. Please select a photo to upload.' },
      { status: 400 }
    );
  }

  const mimeType = file.type || 'application/octet-stream';
  const originalFilename = file instanceof File ? file.name : 'photo.jpg';

  // Quick pre-validation for friendly error message
  if (!ALLOWED_PHOTO_MIME_TYPES[mimeType.toLowerCase()]) {
    return NextResponse.json(
      {
        error: `Unsupported file type "${mimeType}". Allowed formats: JPEG, PNG, WebP, GIF.`,
        code: 'INVALID_TYPE',
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      {
        error: `File size (${sizeMb}MB) exceeds the maximum allowed limit of 10MB.`,
        code: 'EXCEEDS_SIZE',
      },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stored = await saveContractorPhoto({
      userId: tenant.userId,
      buffer,
      mimeType,
      originalFilename,
    });

    return NextResponse.json(
      {
        success: true,
        uploadId: stored.uploadId,
        storagePath: stored.storagePath,
        filename: stored.filename,
        sizeBytes: stored.sizeBytes,
        mimeType: stored.mimeType,
        createdAt: stored.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof StorageValidationError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 400 }
      );
    }
    console.error('Failed to save contractor photo:', err);
    return NextResponse.json(
      { error: 'Failed to process image upload. Please try again.' },
      { status: 500 }
    );
  }
}
