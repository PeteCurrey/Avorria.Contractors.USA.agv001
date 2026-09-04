import { NextRequest, NextResponse } from 'next/server';
import { saveRequirementAcknowledgement } from '@/lib/respond/service';
import { getResponseByInvitation } from '@/lib/respond/repository';

const DEFAULT_CONTRACTOR_ORG_ID = 'org-default-workspace';

/**
 * POST /api/contractor/invitations/[id]/response/requirements
 * Saves or updates a single requirement acknowledgement on the draft response.
 *
 * Body: UpsertRequirementAcknowledgementInput
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contractorId = DEFAULT_CONTRACTOR_ORG_ID;
    const { id: invitation_id } = await params;
    const body = await req.json();

    if (!body.requirement_id) {
      return NextResponse.json({ error: 'requirement_id is required' }, { status: 400 });
    }
    if (!body.response_status) {
      return NextResponse.json({ error: 'response_status is required' }, { status: 400 });
    }

    const validStatuses = ['confirmed', 'cannot_confirm', 'requires_clarification', 'not_applicable'];
    if (!validStatuses.includes(body.response_status)) {
      return NextResponse.json(
        { error: `response_status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const response = getResponseByInvitation(invitation_id);
    if (!response) {
      return NextResponse.json({ error: 'No draft response found. Express interest first.' }, { status: 404 });
    }

    const ack = await saveRequirementAcknowledgement(response.id, contractorId, {
      requirement_id: body.requirement_id,
      response_status: body.response_status,
      contractor_comment: body.contractor_comment,
      evidence_reference: body.evidence_reference,
    });

    return NextResponse.json({ acknowledgement: ack });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save acknowledgement';
    const status = msg.includes('Access denied') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
