import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { transitionPackStatus } from '@/lib/request/service';
import { evaluateRequestReadiness } from '@/lib/request/readiness';
import { RequirementPackStatus } from '@/lib/request/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const body = await req.json();
    const { status } = body;

    if (!status || !['draft', 'ready', 'active', 'closed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status required: draft, ready, active, closed, or cancelled.' },
        { status: 400 }
      );
    }

    const updated = await transitionPackStatus(
      id,
      client.organisationId,
      client.userId,
      status as RequirementPackStatus
    );

    const readiness = evaluateRequestReadiness(updated);

    return NextResponse.json({
      success: true,
      pack: updated,
      readiness,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to transition requirement pack status';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
