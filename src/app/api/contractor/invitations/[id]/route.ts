import { NextRequest, NextResponse } from 'next/server';
import { viewContractorInvitation, getContractorResponseRequirementsView } from '@/lib/respond/service';
import { getResponseByInvitation } from '@/lib/respond/repository';

const DEFAULT_CONTRACTOR_ORG_ID = 'org-default-workspace';

/**
 * GET /api/contractor/invitations/[id]
 * Contractor views their invitation — auto-advances sent → viewed.
 * Returns invitation + requirement views + current response if any.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contractorId = DEFAULT_CONTRACTOR_ORG_ID;
    const { id: invitation_id } = await params;

    // Auto-advance to viewed
    const invitation = await viewContractorInvitation(invitation_id, contractorId);

    // Load requirement views (evidence snapshot + current acknowledgements)
    const requirementViews = await getContractorResponseRequirementsView(invitation_id, contractorId);

    // Load current response if any
    const response = getResponseByInvitation(invitation_id);

    return NextResponse.json({ invitation, requirementViews, response: response ?? null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve invitation';
    const status = msg.includes('Access denied') ? 403 : msg.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
