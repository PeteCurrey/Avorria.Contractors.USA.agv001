import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { syncLocalShortlistToClient } from '@/lib/connect/service';

export async function POST(req: NextRequest) {
  try {
    const client = await getClientContext();
    const body = await req.json();
    const { slugs } = body;

    const result = await syncLocalShortlistToClient(client.organisationId, slugs || []);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to sync shortlist';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
