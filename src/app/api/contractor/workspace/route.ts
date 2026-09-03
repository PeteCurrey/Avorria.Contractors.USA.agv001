import { NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { getEvaluatedWorkspace } from '@/lib/tenant/repository';

export async function GET() {
  try {
    const tenant = await getTenantContext();
    const data = await getEvaluatedWorkspace(tenant.organisation.id);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve workspace data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
