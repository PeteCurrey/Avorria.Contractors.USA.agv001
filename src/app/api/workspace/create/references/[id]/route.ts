import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getReference, saveReference, deleteReference } from '@/lib/create/evidence-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { organization } = await getWorkspaceContext();
    const reference = await getReference(organization.id, id);
    if (!reference) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 });
    }
    return NextResponse.json({ reference });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve reference';
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
    const existing = await getReference(organization.id, id);
    if (!existing) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated = await saveReference({
      ...existing,
      ...body,
      id: existing.id,
      org_id: organization.id,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ reference: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update reference';
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
    const ok = await deleteReference(organization.id, id);
    if (!ok) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete reference';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
