import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listCapabilities, saveCapability } from '@/lib/create/evidence-store';
import { ContractorCapability } from '@/lib/create/evidence-types';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const capabilities = await listCapabilities(organization.id);
    return NextResponse.json({ capabilities });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list capabilities';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await req.json();

    if (!body.name || !body.description) {
      return NextResponse.json({ error: 'Capability name and description are required' }, { status: 400 });
    }

    const newCap: ContractorCapability = {
      id: `cap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      org_id: organization.id,
      name: body.name,
      trade: body.trade || organization.primary_trade || 'Electrical Contracting',
      trade_slug: body.trade_slug || 'electrical-contracting',
      category: body.category || 'Core Distribution',
      specialism: body.specialism || '',
      description: body.description,
      sectors: Array.isArray(body.sectors) ? body.sectors : ['Commercial Office'],
      jurisdictions: Array.isArray(body.jurisdictions) ? body.jurisdictions : ['Texas (Statewide)'],
      years_experience: Number(body.years_experience) || 5,
      verification_status: body.verification_status || 'contractor_supplied',
      verification_provenance: body.verification_provenance || 'Supplied by Contractor',
      evidence_document_ids: Array.isArray(body.evidence_document_ids) ? body.evidence_document_ids : [],
      related_project_ids: Array.isArray(body.related_project_ids) ? body.related_project_ids : [],
      win_work_match_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveCapability(newCap);
    return NextResponse.json({ capability: saved }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save capability';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
