import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listEvidence, createEvidence } from '@/lib/prove/prove-store';
import { CreateEvidenceInput } from '@/lib/prove/types';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const items = await listEvidence(organization.id);
    return NextResponse.json({ evidence: items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list evidence';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization, user } = await getWorkspaceContext();
    const body = await req.json();

    if (!body.title || !body.evidence_type || !body.related_record_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, evidence_type, related_record_id' },
        { status: 400 }
      );
    }

    const input: CreateEvidenceInput = {
      org_id: organization.id,
      title: body.title,
      evidence_type: body.evidence_type,
      related_record_id: body.related_record_id,
      related_record_type: body.related_record_type || 'credential',
      related_record_title: body.related_record_title || 'Related Record',
      related_record_state: body.related_record_state,
      document_id: body.document_id,
      document_title: body.document_title,
      document_file_url: body.document_file_url,
      source: body.source,
      source_label: body.source_label,
      issued_date: body.issued_date,
      effective_date: body.effective_date,
      expiry_date: body.expiry_date,
      verification_state: body.verification_state,
      notes: body.notes,
      created_by: user.full_name || 'Contractor Staff',
      is_internal_verifier: false, // Standard contractor session
    };

    const item = await createEvidence(input);
    return NextResponse.json({ evidence: item }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create evidence item';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
