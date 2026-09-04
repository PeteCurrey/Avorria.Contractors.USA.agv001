import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { duplicateRequirementPack } from '@/lib/request/service';
import { evaluateRequestReadiness } from '@/lib/request/readiness';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();

    const duplicated = await duplicateRequirementPack(
      id,
      client.organisationId,
      client.userId
    );

    const readiness = evaluateRequestReadiness(duplicated);

    return NextResponse.json({
      success: true,
      pack: duplicated,
      readiness,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to duplicate requirement pack';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
