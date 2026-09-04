import { NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { getContractorInvitations } from '@/lib/connect/repository';

export async function GET() {
  try {
    const tenant = await getTenantContext();
    const invitations = await getContractorInvitations(tenant.organisation.id);
    return NextResponse.json({ invitations });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve contractor invitations';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
