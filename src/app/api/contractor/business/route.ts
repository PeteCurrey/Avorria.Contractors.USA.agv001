import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { updateBusinessProfile } from '@/lib/tenant/repository';

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const payload = await request.json();
    const updated = await updateBusinessProfile(tenant.organisation.id, payload);
    return NextResponse.json({ success: true, workspace: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update business profile';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
