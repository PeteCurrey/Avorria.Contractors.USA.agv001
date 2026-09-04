import { NextRequest, NextResponse } from 'next/server';
import { getCredential, updateCredential, deleteCredential } from '@/lib/workspace/credentials';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cred = await getCredential(id);
    if (!cred) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    return NextResponse.json({ credential: cred });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching credential';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateCredential(id, {
      type: body.type,
      carrier_or_authority: body.carrier_or_authority,
      policy_or_license_number: body.policy_or_license_number,
      coverage_amount: body.coverage_amount !== undefined ? Number(body.coverage_amount) : undefined,
      effective_date: body.effective_date,
      expiration_date: body.expiration_date,
      state: body.state,
      document_file_url: body.document_file_url,
      document_title: body.document_title,
    });

    return NextResponse.json({ credential: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating credential';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteCredential(id);
    if (!ok) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting credential';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
