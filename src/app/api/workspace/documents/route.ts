import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listDocuments, saveDocument, saveToolboxTalk } from '@/lib/workspace/db';
import { calculateReadinessScore } from '@/lib/workspace/readiness';
import { WorkspaceDocument, WorkspaceDocumentType } from '@/lib/workspace/types';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const documents = await listDocuments(organization.id);
    return NextResponse.json({ documents });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching documents';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization, user } = await getWorkspaceContext();
    const body = await req.json();

    if (!body.title || !body.type) {
      return NextResponse.json({ error: 'Title and document type are required' }, { status: 400 });
    }

    const doc: WorkspaceDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      org_id: organization.id,
      type: body.type as WorkspaceDocumentType,
      title: body.title,
      file_url: body.file_url,
      version: body.version || 1,
      generated_by: body.generated_by || 'uploaded',
      created_by_user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveDocument(doc);

    // If it's a toolbox talk, also record toolbox talk attendance
    if (body.type === 'toolbox_talk') {
      await saveToolboxTalk({
        id: `tb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        org_id: organization.id,
        topic: body.title,
        date: body.date || new Date().toISOString().split('T')[0],
        attendee_names: Array.isArray(body.attendee_names) ? body.attendee_names : ['Field Crew'],
        document_id: saved.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Recalculate readiness score
    await calculateReadinessScore(organization.id);

    return NextResponse.json({ document: saved }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error saving document';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
