import { NextRequest, NextResponse } from 'next/server';
import { declineInvitation } from '@/lib/respond/service';

const DEFAULT_CONTRACTOR_ORG_ID = 'org-default-workspace';

/**
 * POST /api/contractor/invitations/[id]/decline
 * Contractor declines to respond to an invitation.
 * Body: { reason: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contractorId = DEFAULT_CONTRACTOR_ORG_ID;
    const { id: invitation_id } = await params;
    const body = await req.json();

    if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
      return NextResponse.json({ error: 'A reason is required when declining an invitation' }, { status: 400 });
    }

    const updated = await declineInvitation(invitation_id, contractorId, { reason: body.reason });
    return NextResponse.json({ invitation: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to decline invitation';
    const status = msg.includes('Access denied') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
