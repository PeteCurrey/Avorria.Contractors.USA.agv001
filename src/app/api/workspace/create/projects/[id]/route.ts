import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getProject, saveProject, deleteProject } from '@/lib/create/evidence-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { organization } = await getWorkspaceContext();
    const project = await getProject(organization.id, id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve project';
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
    const existing = await getProject(organization.id, id);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated = await saveProject({
      ...existing,
      ...body,
      id: existing.id,
      org_id: organization.id,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ project: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update project';
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
    const ok = await deleteProject(organization.id, id);
    if (!ok) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete project';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
