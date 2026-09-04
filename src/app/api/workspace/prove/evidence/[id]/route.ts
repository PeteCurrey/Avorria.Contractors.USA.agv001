import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getEvidence, updateEvidence, deleteEvidence } from '@/lib/prove/prove-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await params;
    const item = await getEvidence(id);

    if (!item || item.org_id !== organization.id) {
      return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 });
    }

    return NextResponse.json({ evidence: item });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get evidence';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await params;
    const existing = await getEvidence(id);

    if (!existing || existing.org_id !== organization.id) {
      return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated = await updateEvidence(id, {
      title: body.title,
      document_id: body.document_id,
      document_title: body.document_title,
      document_file_url: body.document_file_url,
      issued_date: body.issued_date,
      effective_date: body.effective_date,
      expiry_date: body.expiry_date,
      verification_state: body.verification_state,
      related_record_state: body.related_record_state,
      notes: body.notes,
      actor_role: 'contractor',
      actor_name: 'Contractor User',
    });

    return NextResponse.json({ evidence: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update evidence';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await params;
    const existing = await getEvidence(id);

    if (!existing || existing.org_id !== organization.id) {
      return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 });
    }

    const ok = await deleteEvidence(id);
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete evidence';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
