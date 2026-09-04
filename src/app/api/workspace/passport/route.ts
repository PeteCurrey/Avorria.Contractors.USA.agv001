import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getPassportByOrg, savePassport } from '@/lib/workspace/passport';
import { listPassportAccessLogs } from '@/lib/workspace/db';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const passport = await getPassportByOrg(organization.id);
    const logs = passport ? await listPassportAccessLogs(passport.id) : [];

    return NextResponse.json({ passport, logs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch passport';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await req.json();

    if (!body.slug || !body.slug.trim()) {
      return NextResponse.json({ error: 'Passport URL segment (slug) is required.' }, { status: 400 });
    }

    const saved = await savePassport(organization.id, {
      slug: body.slug,
      is_password_protected: Boolean(body.is_password_protected),
      password: body.password,
      included_credential_ids: body.included_credential_ids,
      included_document_ids: body.included_document_ids,
    });

    return NextResponse.json({ passport: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save passport';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
