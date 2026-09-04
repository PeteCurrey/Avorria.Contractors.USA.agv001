import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getOpportunityById, updateOpportunityStatus, getOpportunityInvitations } from '@/lib/connect/repository';
import { findMatchingContractorsForOpportunity } from '@/lib/connect/matching';
import { OpportunityStatus } from '@/lib/connect/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const opportunity = await getOpportunityById(id, client.organisationId);

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found or access denied' }, { status: 404 });
    }

    const invitations = await getOpportunityInvitations(id, client.organisationId);

    // Matching suggestions for remaining invitation
    const matching = await findMatchingContractorsForOpportunity({
      trade: opportunity.trade,
      state: opportunity.location.state,
      city: opportunity.location.city,
      requirements: opportunity.requirements,
    });

    return NextResponse.json({
      opportunity,
      invitations,
      matching,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve opportunity';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const body = await req.json();
    const { status } = body;

    if (!status || !['draft', 'open', 'closed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Valid status required' }, { status: 400 });
    }

    const updated = await updateOpportunityStatus(id, client.organisationId, status as OpportunityStatus);
    return NextResponse.json({ success: true, opportunity: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update opportunity';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
