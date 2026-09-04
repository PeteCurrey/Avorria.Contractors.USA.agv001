import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import {
  saveOpportunityForContractor,
  unsaveOpportunityForContractor,
  isOpportunitySavedByContractor,
} from '@/lib/discover/repository';

/**
 * POST /api/workspace/win-work/discover/[id]/save
 *
 * Toggles or explicitly sets saved status of an opportunity for the authenticated contractor.
 * Body: { action?: 'save' | 'unsave' | 'toggle', notes?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization, user } = await getWorkspaceContext();
    const { id } = await params;

    let body: { action?: 'save' | 'unsave' | 'toggle'; notes?: string } = {};
    try {
      body = await request.json();
    } catch {
      // default to toggle if no body provided
    }

    const currentSaved = await isOpportunitySavedByContractor(organization.id, id);
    const action = body.action || (currentSaved ? 'unsave' : 'save');

    if (action === 'save') {
      const record = await saveOpportunityForContractor(
        organization.id,
        id,
        user.id,
        body.notes
      );
      return NextResponse.json({
        success: true,
        is_saved: true,
        saved_at: record.created_at,
        record,
      });
    } else {
      await unsaveOpportunityForContractor(organization.id, id);
      return NextResponse.json({
        success: true,
        is_saved: false,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update saved state';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
