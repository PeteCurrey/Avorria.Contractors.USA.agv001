import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listProjects, saveProject } from '@/lib/create/evidence-store';
import { ProjectExperience } from '@/lib/create/evidence-types';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const projects = await listProjects(organization.id);
    return NextResponse.json({ projects });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list projects';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await req.json();

    if (!body.name || !body.client) {
      return NextResponse.json({ error: 'Project name and client are required' }, { status: 400 });
    }

    const newProject: ProjectExperience = {
      id: `prj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      org_id: organization.id,
      name: body.name,
      client: body.client,
      client_type: body.client_type || 'Commercial',
      location_city: body.location_city || organization.hq_address?.city || 'Austin',
      location_state: body.location_state || organization.hq_address?.state || 'TX',
      sector: body.sector || 'Commercial Office',
      project_type: body.project_type || 'Renovation / Retrofit',
      contract_type: body.contract_type || 'Lump Sum',
      start_date: body.start_date || new Date().toISOString().slice(0, 7),
      completion_date: body.completion_date || undefined,
      contract_value: Number(body.contract_value) || 0,
      status: body.status || 'completed',
      description: body.description || '',
      scope: body.scope || '',
      services_delivered: Array.isArray(body.services_delivered) ? body.services_delivered : [],
      challenges: body.challenges || '',
      delivery_methodology: body.delivery_methodology || '',
      outcomes: body.outcomes || '',
      evidence_document_ids: Array.isArray(body.evidence_document_ids) ? body.evidence_document_ids : [],
      evidence_summary: body.evidence_summary || '',
      win_work_opportunity_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveProject(newProject);
    return NextResponse.json({ project: saved }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save project';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
