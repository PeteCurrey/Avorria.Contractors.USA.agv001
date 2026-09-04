import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { publishPassportSnapshot, getAssembledPassport } from '@/lib/passport/assembly';

export async function POST(req: NextRequest) {
  try {
    const { organization, user } = await getWorkspaceContext();
    const body = await req.json().catch(() => ({}));

    const authorName = user.full_name || 'Authorized Contractor';
    const note = body.note;

    const snapshot = await publishPassportSnapshot(organization.id, authorName, note);
    const assembly = await getAssembledPassport(organization.id);

    return NextResponse.json({
      snapshot,
      assembly,
      success: true,
      message: `Passport snapshot v${snapshot.version} successfully published.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to publish passport snapshot';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
