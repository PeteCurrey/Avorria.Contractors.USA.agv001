import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import {
  getAsset,
  updateAsset,
  retireAsset,
  listAssetDocuments,
  listServiceLogs,
} from '@/lib/assets/db';

/** GET /api/assets/[id] — single asset with documents and service logs */
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

    const [documents, serviceLogs] = await Promise.all([
      listAssetDocuments(organization.id, id),
      listServiceLogs(organization.id, id),
    ]);

    return NextResponse.json({ asset, documents, serviceLogs });
  } catch (err) {
    console.error('[GET /api/assets/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
  }
}

/** PATCH /api/assets/[id] — update asset fields */
export async function PATCH(
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

    const body = await request.json();
    const updated = await updateAsset(id, body);
    return NextResponse.json({ asset: updated });
  } catch (err) {
    console.error('[PATCH /api/assets/[id]]', err);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

/** DELETE /api/assets/[id] — soft delete (retire) */
export async function DELETE(
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

    await retireAsset(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/assets/[id]]', err);
    return NextResponse.json({ error: 'Failed to retire asset' }, { status: 500 });
  }
}
