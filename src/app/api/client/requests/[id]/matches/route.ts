import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import { previewContractorMatchesForPack } from '@/lib/request/matching-preview';

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

    const preview = await previewContractorMatchesForPack(pack);

    return NextResponse.json(preview);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to preview matching contractors';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
