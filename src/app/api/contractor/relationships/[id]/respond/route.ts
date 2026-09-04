import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { respondToContractorConnection } from '@/lib/connect/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenant = await getTenantContext();
    const body = await req.json();
    const { action } = body;

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json({ error: "Action must be 'accept' or 'decline'" }, { status: 400 });
    }

    const updated = await respondToContractorConnection(id, tenant.organisation.id, action);
    return NextResponse.json({ success: true, relationship: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to respond to relationship';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
