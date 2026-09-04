import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { refreshMatchSet } from '@/lib/match/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();

    const matchSet = await refreshMatchSet(
      id,
      client.organisationId,
      client.userId
    );

    return NextResponse.json({
      success: true,
      matchSet,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to refresh matches';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
