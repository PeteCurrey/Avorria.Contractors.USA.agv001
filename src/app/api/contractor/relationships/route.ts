import { NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { getContractorRelationships } from '@/lib/connect/repository';

export async function GET() {
  try {
    const tenant = await getTenantContext();
    const relationships = await getContractorRelationships(tenant.organisation.id);
    return NextResponse.json({ relationships });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve contractor relationships';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
