import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listReferences, saveReference } from '@/lib/create/evidence-store';
import { CommercialReference } from '@/lib/create/evidence-types';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const references = await listReferences(organization.id);
    return NextResponse.json({ references });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list references';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await req.json();

    if (!body.client_organization || !body.contact_name || !body.testimonial) {
      return NextResponse.json({ error: 'Client organization, contact name, and testimonial are required' }, { status: 400 });
    }

    const newRef: CommercialReference = {
      id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      org_id: organization.id,
      client_organization: body.client_organization,
      contact_name: body.contact_name,
      contact_title: body.contact_title || 'Procurement Executive',
      contact_email: body.contact_email || undefined,
      contact_phone: body.contact_phone || undefined,
      project_id: body.project_id || undefined,
      project_name: body.project_name || 'Commercial Contract',
      reference_type: body.reference_type || 'client',
      date_provided: body.date_provided || new Date().toISOString().slice(0, 10),
      status: body.status || 'verified',
      testimonial: body.testimonial,
      rating: Number(body.rating) || 5,
      is_private: true, // Always private by default
      supporting_document_id: body.supporting_document_id || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveReference(newRef);
    return NextResponse.json({ reference: saved }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save reference';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
