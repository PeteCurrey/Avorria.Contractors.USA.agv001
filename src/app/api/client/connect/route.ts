import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { initiateContractorConnection } from '@/lib/connect/service';

export async function POST(req: NextRequest) {
  try {
    const client = await getClientContext();
    const body = await req.json();
    const { contractorSlug, message } = body;

    if (!contractorSlug) {
      return NextResponse.json({ error: 'contractorSlug is required' }, { status: 400 });
    }

    const result = await initiateContractorConnection(
      client.organisationId,
      contractorSlug,
      client.userId,
      message
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send connection request';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
