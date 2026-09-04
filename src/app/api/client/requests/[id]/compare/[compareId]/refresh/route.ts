import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { refreshCompareSet } from '@/lib/compare/service';

/**
 * POST /api/client/requests/[id]/compare/[compareId]/refresh
 * Refreshes a stale comparison set by re-reading current submitted responses.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; compareId: string }> }
) {
  try {
    const client = await getClientContext();
    const { compareId } = await params;

    const matrix = await refreshCompareSet(
      compareId,
      client.organisationId,
      client.userId
    );

    return NextResponse.json({ matrix });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to refresh comparison set';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
