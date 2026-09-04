import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getCapability, saveCapability, deleteCapability } from '@/lib/create/evidence-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { organization } = await getWorkspaceContext();
    const capability = await getCapability(organization.id, id);
    if (!capability) {
      return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
    }
    return NextResponse.json({ capability });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve capability';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { organization } = await getWorkspaceContext();
    const existing = await getCapability(organization.id, id);
    if (!existing) {
      return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated = await saveCapability({
      ...existing,
      ...body,
      id: existing.id,
      org_id: organization.id,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ capability: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update capability';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { organization } = await getWorkspaceContext();
    const ok = await deleteCapability(organization.id, id);
    if (!ok) {
      return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete capability';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
