import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { withdrawInvitation } from '@/lib/respond/service';

/**
 * POST /api/client/invitations/[invId]/withdraw
 * Client withdraws a sent invitation.
 * Body: { reason? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invId: string }> }
) {
  try {
    const client = await getClientContext();
    const { invId } = await params;
    const body = await req.json().catch(() => ({}));

    const updated = await withdrawInvitation(invId, client.organisationId, client.userId, {
      reason: body.reason,
    });

    return NextResponse.json({ invitation: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to withdraw invitation';
    const status = msg.includes('Access denied') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
