import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { replyToOpportunityInvitation } from '@/lib/connect/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenant = await getTenantContext();
    const body = await req.json();
    const { decision, message } = body;

    if (decision !== 'accepted' && decision !== 'declined') {
      return NextResponse.json({ error: "Decision must be 'accepted' or 'declined'" }, { status: 400 });
    }

    const updated = await replyToOpportunityInvitation(
      id,
      tenant.organisation.id,
      decision,
      message
    );

    return NextResponse.json({ success: true, invitation: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to respond to opportunity invitation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
