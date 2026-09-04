import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getAsset, saveAssetDocument } from '@/lib/assets/db';
import { validateStoragePath, buildStorageUrl } from '@/lib/firebase/admin';
import { runExtractionPipeline } from '@/lib/assets/extraction';
import { ASSET_DOCUMENT_TYPES, AssetDocument } from '@/lib/assets/types';
import { z } from 'zod';

const ConfirmSchema = z.object({
  assetId: z.string().uuid(),
  storagePath: z.string().min(1),
  documentType: z.enum(ASSET_DOCUMENT_TYPES),
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
});

/**
 * POST /api/assets/upload/confirm
 *
 * Step 2 of the upload flow — the ONLY route that writes to asset_documents.
 * Called by the client after the Firebase upload completes.
 *
 * Security:
 * - Validates storagePath starts with orgs/{orgId}/... to prevent spoofing
 * - Verifies asset belongs to authenticated org
 * - Server is sole writer of asset_documents
 *
 * After writing the record, kicks off the extraction pipeline as a
 * non-blocking background task (fire-and-forget with error logging).
 */
export async function POST(request: NextRequest) {
  try {
    const { organization, user } = await getWorkspaceContext();
    const body = await request.json();

    const parsed = ConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { assetId, storagePath, documentType, fileName, mimeType, fileSizeBytes } =
      parsed.data;

    // Validate the storage path belongs to this org — prevents spoofing another org's path
    const isValidPath =
      process.env.FIREBASE_STORAGE_BUCKET
        ? validateStoragePath(storagePath, organization.id)
        : storagePath.startsWith(`orgs/${organization.id}/assets/`); // Mock mode check

    if (!isValidPath) {
      return NextResponse.json(
        { error: 'Invalid storage path — path must belong to your organisation' },
        { status: 403 }
      );
    }

    // Verify asset belongs to this org
    const asset = await getAsset(assetId);
    if (!asset || asset.org_id !== organization.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Build the public Firebase Storage URL
    const firebaseStorageUrl =
      process.env.FIREBASE_STORAGE_BUCKET
        ? buildStorageUrl(storagePath)
        : `https://mock-firebase-storage.example.com/files/${encodeURIComponent(storagePath)}`;

    const now = new Date().toISOString();
    const assetDoc: AssetDocument = {
      id: crypto.randomUUID(),
      org_id: organization.id,
      asset_id: assetId,
      firebase_storage_url: firebaseStorageUrl,
      firebase_storage_path: storagePath,
      document_type: documentType,
      file_name: fileName,
      mime_type: mimeType,
      file_size_bytes: fileSizeBytes,
      uploaded_by_user_id: user.id,
      extraction_status: 'pending',
      uploaded_at: now,
      created_at: now,
      updated_at: now,
    };

    // This is the ONLY write to asset_documents — server-confirmed
    await saveAssetDocument(assetDoc);

    // Fire extraction pipeline as a non-blocking background task
    // We don't have the file buffer here in test mode, so skip in mock mode
    if (mimeType && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // In production: fetch the file from Firebase and run extraction
      // For now, the pipeline will be triggered with an empty buffer and fail gracefully
      const emptyBuffer = Buffer.alloc(0);
      runExtractionPipeline(assetDoc.id, organization.id, emptyBuffer, mimeType).catch(
        (err) => console.error('[confirm-upload] extraction pipeline error:', err)
      );
    }

    return NextResponse.json({ assetDocument: assetDoc }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/assets/upload/confirm]', err);
    return NextResponse.json(
      { error: 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}
