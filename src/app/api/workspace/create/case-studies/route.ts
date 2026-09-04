import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listCaseStudies, saveCaseStudy } from '@/lib/create/evidence-store';
import { CaseStudy } from '@/lib/create/evidence-types';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const caseStudies = await listCaseStudies(organization.id);
    return NextResponse.json({ caseStudies });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list case studies';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await req.json();

    if (!body.title || !body.challenge) {
      return NextResponse.json({ error: 'Title and challenge are required' }, { status: 400 });
    }

    const newCaseStudy: CaseStudy = {
      id: `cs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      org_id: organization.id,
      project_id: body.project_id || '',
      title: body.title,
      client: body.client || 'Confidential Client',
      sector: body.sector || 'Commercial',
      location: body.location || 'Austin, TX',
      contract_value: Number(body.contract_value) || 0,
      completion_date: body.completion_date || new Date().getFullYear().toString(),
      challenge: body.challenge,
      scope: body.scope || '',
      delivery: body.delivery || '',
      outcome: body.outcome || '',
      key_metrics: Array.isArray(body.key_metrics) ? body.key_metrics : [],
      capabilities_exercised: Array.isArray(body.capabilities_exercised) ? body.capabilities_exercised : [],
      evidence_document_ids: Array.isArray(body.evidence_document_ids) ? body.evidence_document_ids : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveCaseStudy(newCaseStudy);
    return NextResponse.json({ caseStudy: saved }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save case study';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
