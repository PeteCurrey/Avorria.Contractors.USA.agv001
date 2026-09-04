import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listCredentials, createCredential } from '@/lib/workspace/credentials';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const credentials = await listCredentials(organization.id);
    return NextResponse.json({ credentials });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list credentials';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await req.json();

    const cred = await createCredential({
      org_id: organization.id,
      type: body.type,
      title: body.title,
      carrier_or_authority: body.carrier_or_authority,
      policy_or_license_number: body.policy_or_license_number,
      coverage_amount: body.coverage_amount ? Number(body.coverage_amount) : undefined,
      effective_date: body.effective_date,
      expiration_date: body.expiration_date,
      review_date: body.review_date,
      holder: body.holder,
      issue_date: body.issue_date,
      notes: body.notes,
      verification_state: body.verification_state,
      state: body.state,
      document_file_url: body.document_file_url,
      document_title: body.document_title,
    });

    return NextResponse.json({ credential: cred }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create credential';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
