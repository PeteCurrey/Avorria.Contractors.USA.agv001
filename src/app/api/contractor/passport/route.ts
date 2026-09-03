import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { getPassportDetails, setPassportVisibility } from '@/lib/tenant/repository';

export async function GET() {
  try {
    const tenant = await getTenantContext();
    const details = await getPassportDetails(tenant.organisation.id);
    return NextResponse.json(details);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve passport details';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const body = await request.json();
    const { visibility } = body;

    if (!visibility) return NextResponse.json({ error: 'Missing visibility' }, { status: 400 });

    const result = await setPassportVisibility(tenant.organisation.id, visibility);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update passport visibility';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
