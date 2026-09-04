import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { sendOpportunityInvitation } from '@/lib/connect/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const body = await req.json();
    const { contractorOrgId } = body;

    if (!contractorOrgId) {
      return NextResponse.json({ error: 'contractorOrgId is required' }, { status: 400 });
    }

    const invitation = await sendOpportunityInvitation(
      id,
      contractorOrgId,
      client.organisationId,
      client.userId
    );

    return NextResponse.json({ success: true, invitation });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send opportunity invitation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
