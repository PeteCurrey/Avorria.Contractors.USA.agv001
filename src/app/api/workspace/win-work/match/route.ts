import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { evaluateContractorOpportunityFit } from '@/lib/match/contractor-fit-engine';

/**
 * GET /api/workspace/win-work/match?opportunityId=[id]
 *
 * Computes an explainable, deterministic fit evaluation between the authenticated
 * contractor's assembled passport and the specified opportunity.
 */
export async function GET(request: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: opportunityId' },
        { status: 400 }
      );
    }

    const fit = await evaluateContractorOpportunityFit(opportunityId, organization.id);
    if (!fit) {
      return NextResponse.json(
        { error: 'Opportunity not found or inaccessible' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, fit });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to evaluate opportunity fit';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
