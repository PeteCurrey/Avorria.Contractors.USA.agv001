import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { sendInvitation, withdrawInvitation, getInvitationWithResponse } from '@/lib/respond/service';
import { getInvitation } from '@/lib/respond/repository';

/**
 * GET /api/client/requests/[id]/invitations/[invId]
 * Returns a single invitation with its response summary for the client.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; invId: string }> }
) {
  try {
    const client = await getClientContext();
    const { invId } = await params;
    const result = getInvitationWithResponse(invId, client.organisationId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve invitation';
    const status = msg.includes('Access denied') ? 403 : msg.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/**
 * PATCH /api/client/requests/[id]/invitations/[invId]
 * Send a draft invitation (action: "send") or update message.
 *
 * Body: { action: "send", invitation_message?, expires_at? }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; invId: string }> }
) {
  try {
    const client = await getClientContext();
    const { invId } = await params;
    const body = await req.json();

    const inv = getInvitation(invId);
    if (!inv) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    if (inv.tenant_id !== client.organisationId) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    if (body.action === 'send') {
      const updated = await sendInvitation(invId, client.organisationId, client.userId, {
        invitation_message: body.invitation_message,
        expires_at: body.expires_at,
      });
      return NextResponse.json({ invitation: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update invitation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
