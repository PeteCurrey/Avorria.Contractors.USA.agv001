import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { createCompareSet, getCompareSetMatrix } from '@/lib/compare/service';
import { getCompareSetsByRequest } from '@/lib/compare/repository';

/**
 * GET /api/client/requests/[id]/compare
 * Returns existing comparison sets or evaluates requested compareSetId.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await getClientContext();
    const { id: requestId } = await params;
    const url = new URL(req.url);
    const compareSetId = url.searchParams.get('compareSetId');

    if (compareSetId) {
      const matrix = await getCompareSetMatrix(compareSetId, client.organisationId);
      return NextResponse.json({ matrix });
    }

    const sets = await getCompareSetsByRequest(requestId, client.organisationId);
    return NextResponse.json({ sets });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve comparison sets';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * POST /api/client/requests/[id]/compare
 * Creates a new comparison set from selected contractor responses (2 to 6 contractors).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await getClientContext();
    const { id: requestId } = await params;
    const body = await req.json();

    if (!body.contractor_ids || !Array.isArray(body.contractor_ids)) {
      return NextResponse.json(
        { error: 'contractor_ids array is required (2 to 6 contractors)' },
        { status: 400 }
      );
    }

    const result = await createCompareSet(client.organisationId, client.userId, {
      request_id: requestId,
      contractor_ids: body.contractor_ids,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create comparison set';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
