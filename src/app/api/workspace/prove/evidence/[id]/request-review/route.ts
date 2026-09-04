import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getEvidence, requestReview } from '@/lib/prove/prove-store';

export async function POST(
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

    let notes: string | undefined;
    try {
      const body = await req.json();
      notes = body.notes;
    } catch {
      // Empty body allowed
    }

    const updated = await requestReview(id, notes);
    return NextResponse.json({ evidence: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to request review';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
