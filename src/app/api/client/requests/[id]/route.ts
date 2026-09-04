import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import { updateRequirementPack } from '@/lib/request/service';
import { evaluateRequestReadiness } from '@/lib/request/readiness';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const pack = await getRequirementPackById(id, client.organisationId);

    if (!pack) {
      return NextResponse.json(
        { error: 'Requirement pack not found or unauthorized' },
        { status: 404 }
      );
    }

    const readiness = evaluateRequestReadiness(pack);

    return NextResponse.json({
      pack,
      readiness,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve requirement pack';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const body = await req.json();

    const updated = await updateRequirementPack(
      id,
      client.organisationId,
      client.userId,
      body
    );

    const readiness = evaluateRequestReadiness(updated);

    return NextResponse.json({
      success: true,
      pack: updated,
      readiness,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update requirement pack';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
