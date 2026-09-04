import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getAsset, listAssetDocuments } from '@/lib/assets/db';

/** GET /api/assets/[id]/documents — list documents for an asset */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await params;

    const asset = await getAsset(id);
    if (!asset || asset.org_id !== organization.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const documents = await listAssetDocuments(organization.id, id);
    return NextResponse.json({ documents });
  } catch (err) {
    console.error('[GET /api/assets/[id]/documents]', err);
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}
