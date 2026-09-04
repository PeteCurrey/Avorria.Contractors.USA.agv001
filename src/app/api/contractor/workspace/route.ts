import { NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { getEvaluatedWorkspace, getPassportDetails } from '@/lib/tenant/repository';

export async function GET() {
  try {
    const tenant = await getTenantContext();
    const data = await getEvaluatedWorkspace(tenant.organisation.id);
    const passport = await getPassportDetails(tenant.organisation.id);
    return NextResponse.json({ ...data, passport });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve workspace data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
