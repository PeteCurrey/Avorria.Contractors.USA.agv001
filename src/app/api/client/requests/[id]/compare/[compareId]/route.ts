import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getCompareSetMatrix } from '@/lib/compare/service';

/**
 * GET /api/client/requests/[id]/compare/[compareId]
 * Retrieves evaluated comparison matrix for a specific comparison set.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; compareId: string }> }
) {
  try {
    const client = await getClientContext();
    const { compareId } = await params;
    const matrix = await getCompareSetMatrix(compareId, client.organisationId);
    return NextResponse.json({ matrix });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve comparison matrix';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
