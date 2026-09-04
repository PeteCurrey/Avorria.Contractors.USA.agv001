import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getSavedContractors, saveContractor, removeSavedContractor } from '@/lib/connect/repository';
import { getContractorWorkspaceBySlug } from '@/lib/tenant/repository';
import { trackEvent } from '@/lib/analytics/events';

export async function GET() {
  try {
    const client = await getClientContext();
    const saved = await getSavedContractors(client.organisationId);
    return NextResponse.json({ saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve saved contractors';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await getClientContext();
    const body = await req.json();
    const { contractorSlug, notes } = body;

    if (!contractorSlug) {
      return NextResponse.json({ error: 'contractorSlug is required' }, { status: 400 });
    }

    const ws = await getContractorWorkspaceBySlug(contractorSlug);
    if (!ws || ws.profile.visibility !== 'published') {
      return NextResponse.json({ error: 'Contractor not found or not published' }, { status: 404 });
    }

    const record = await saveContractor(
      client.organisationId,
      ws.organisation.id,
      ws.organisation.slug,
      ws.organisation.name,
      ws.trades[0],
      `${ws.serviceAreas.cities?.[0] || 'Operating Territory'}, ${ws.serviceAreas.primaryState || 'TX'}`,
      notes
    );

    trackEvent('contractor_saved', client.organisationId, {
      contractorSlug,
      contractorOrgId: ws.organisation.id,
    });

    return NextResponse.json({ success: true, saved: record });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save contractor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const client = await getClientContext();
    const { searchParams } = new URL(req.url);
    const contractorOrgId = searchParams.get('contractorOrgId');

    if (!contractorOrgId) {
      return NextResponse.json({ error: 'contractorOrgId parameter required' }, { status: 400 });
    }

    const removed = await removeSavedContractor(client.organisationId, contractorOrgId);

    trackEvent('contractor_unsaved', client.organisationId, {
      contractorOrgId,
    });

    return NextResponse.json({ success: removed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to remove saved contractor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
