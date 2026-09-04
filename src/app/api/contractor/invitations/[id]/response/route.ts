import { NextRequest, NextResponse } from 'next/server';
import { submitContractorResponse, updateResponseDraft } from '@/lib/respond/service';
import { getResponseByInvitation } from '@/lib/respond/repository';

const DEFAULT_CONTRACTOR_ORG_ID = 'org-default-workspace';

/**
 * GET /api/contractor/invitations/[id]/response
 * Returns the current response (with requirement acknowledgements) for an invitation.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invitation_id } = await params;
    const response = getResponseByInvitation(invitation_id);
    return NextResponse.json({ response: response ?? null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve response';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/contractor/invitations/[id]/response
 * Updates a draft response (availability, dates, notes).
 * Body: UpdateResponseDraftInput
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contractorId = DEFAULT_CONTRACTOR_ORG_ID;
    const { id: invitation_id } = await params;
    const body = await req.json();

    const response = getResponseByInvitation(invitation_id);
    if (!response) {
      return NextResponse.json({ error: 'No draft response found for this invitation' }, { status: 404 });
    }

    const updated = await updateResponseDraft(response.id, contractorId, {
      availability_status: body.availability_status,
      proposed_start_date: body.proposed_start_date,
      proposed_completion_date: body.proposed_completion_date,
      availability_notes: body.availability_notes,
      response_notes: body.response_notes,
    });

    return NextResponse.json({ response: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update response';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * POST /api/contractor/invitations/[id]/response
 * Submits the contractor response.
 * Body: SubmitResponseInput
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contractorId = DEFAULT_CONTRACTOR_ORG_ID;
    const { id: invitation_id } = await params;
    const body = await req.json();

    if (!body.availability_status) {
      return NextResponse.json({ error: 'availability_status is required to submit' }, { status: 400 });
    }

    const submitted = await submitContractorResponse(invitation_id, contractorId, {
      availability_status: body.availability_status,
      proposed_start_date: body.proposed_start_date,
      proposed_completion_date: body.proposed_completion_date,
      availability_notes: body.availability_notes,
      response_notes: body.response_notes,
      requirement_acknowledgements: body.requirement_acknowledgements ?? [],
    });

    return NextResponse.json({ response: submitted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit response';
    const status = msg.includes('Access denied') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
