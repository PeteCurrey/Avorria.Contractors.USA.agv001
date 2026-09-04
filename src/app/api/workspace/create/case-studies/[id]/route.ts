import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getCaseStudy, saveCaseStudy, deleteCaseStudy } from '@/lib/create/evidence-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { organization } = await getWorkspaceContext();
    const caseStudy = await getCaseStudy(organization.id, id);
    if (!caseStudy) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }
    return NextResponse.json({ caseStudy });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve case study';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { organization } = await getWorkspaceContext();
    const existing = await getCaseStudy(organization.id, id);
    if (!existing) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated = await saveCaseStudy({
      ...existing,
      ...body,
      id: existing.id,
      org_id: organization.id,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ caseStudy: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update case study';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { organization } = await getWorkspaceContext();
    const ok = await deleteCaseStudy(organization.id, id);
    if (!ok) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete case study';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
