import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { requestClarification } from '@/lib/compare/service';

/**
 * POST /api/client/requests/[id]/compare/[compareId]/clarify
 * Flags a clarification request against a specific contractor requirement from within Compare.
 *
 * Body: { contractorId: string; requirementId: string; questionNote?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; compareId: string }> }
) {
  try {
    const client = await getClientContext();
    const { compareId } = await params;

    const body = await req.json();
    const { contractorId, requirementId, questionNote } = body as {
      contractorId: string;
      requirementId: string;
      questionNote?: string;
    };

    if (!contractorId || !requirementId) {
      return NextResponse.json(
        { error: 'contractorId and requirementId are required.' },
        { status: 400 }
      );
    }

    const result = await requestClarification(
      compareId,
      client.organisationId,
      client.userId,
      contractorId,
      requirementId,
      questionNote
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to request clarification';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
