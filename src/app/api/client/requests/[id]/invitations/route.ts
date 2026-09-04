import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import {
  createContractorInvitation,
  listPackInvitations,
} from '@/lib/respond/service';

/**
 * GET /api/client/requests/[id]/invitations
 * Returns all invitations for a requirement pack.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await getClientContext();
    const { id: pack_id } = await params;
    const invitations = listPackInvitations(pack_id, client.organisationId);
    return NextResponse.json({ invitations });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve invitations';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/client/requests/[id]/invitations
 * Creates a new invitation for a contractor from the match set.
 *
 * Body: { contractor_id, contractor_slug?, contractor_name?, match_set_id,
 *         invitation_message?, expires_at? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await getClientContext();
    const { id: pack_id } = await params;
    const body = await req.json();

    const { contractor_id, contractor_slug, contractor_name, match_set_id, invitation_message, expires_at } = body;

    if (!contractor_id) {
      return NextResponse.json({ error: 'contractor_id is required' }, { status: 400 });
    }
    if (!match_set_id) {
      return NextResponse.json({ error: 'match_set_id is required' }, { status: 400 });
    }

    const invitation = await createContractorInvitation(
      client.organisationId,
      client.userId,
      {
        pack_id,
        contractor_id,
        contractor_slug,
        contractor_name,
        match_set_id,
        invitation_message,
        expires_at,
      }
    );

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create invitation';
    const status = msg.includes('stale') || msg.includes('not found as an eligible') ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
