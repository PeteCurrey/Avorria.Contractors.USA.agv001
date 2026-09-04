import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getDiscoverOpportunityById } from '@/lib/discover/repository';

/**
 * GET /api/workspace/win-work/discover/[id]
 *
 * Retrieves a single opportunity with saved status for the authenticated contractor.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await params;

    const opportunity = await getDiscoverOpportunityById(id, organization.id);
    if (!opportunity) {
      return NextResponse.json(
        { error: `Opportunity ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ opportunity });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve opportunity';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
