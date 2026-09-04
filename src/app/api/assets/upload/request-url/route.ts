import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getAsset } from '@/lib/assets/db';
import { generateSignedUploadUrl } from '@/lib/firebase/admin';
import { z } from 'zod';

const RequestSchema = z.object({
  assetId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
});

/**
 * POST /api/assets/upload/request-url
 *
 * Step 1 of the upload flow.
 * Generates a Firebase Storage signed upload URL scoped to orgs/{orgId}/assets/{assetId}/...
 * The client uses this URL to PUT the file directly to Firebase — no Supabase write here.
 *
 * After the browser upload completes, the client calls /api/assets/upload/confirm
 * to write the asset_documents record.
 */
export async function POST(request: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await request.json();

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { assetId, fileName, mimeType } = parsed.data;

    // Verify asset belongs to this org
    const asset = await getAsset(assetId);
    if (!asset || asset.org_id !== organization.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // In test/offline mode (no Firebase config), return a mock signed URL
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON || !process.env.FIREBASE_STORAGE_BUCKET) {
      const mockStoragePath = `orgs/${organization.id}/assets/${assetId}/mock-${Date.now()}-${fileName}`;
      return NextResponse.json({
        signedUrl: `https://mock-firebase-storage.example.com/upload?path=${encodeURIComponent(mockStoragePath)}`,
        storagePath: mockStoragePath,
      });
    }

    const { signedUrl, storagePath } = await generateSignedUploadUrl(
      organization.id,
      assetId,
      fileName,
      mimeType
    );

    return NextResponse.json({ signedUrl, storagePath });
  } catch (err) {
    console.error('[POST /api/assets/upload/request-url]', err);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
