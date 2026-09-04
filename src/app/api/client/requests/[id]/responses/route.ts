import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getResponseCentre } from '@/lib/respond/service';

/**
 * GET /api/client/requests/[id]/responses
 * Client response centre — all invitations + their responses for a pack.
 * Informational only — no ranking, no scoring, no award actions.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await getClientContext();
    const { id: pack_id } = await params;
    const summary = await getResponseCentre(pack_id, client.organisationId);
    return NextResponse.json(summary);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve response centre';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
