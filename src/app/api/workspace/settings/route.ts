import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { saveOrganization } from '@/lib/workspace/db';
import { PrimaryTrade } from '@/lib/workspace/types';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    return NextResponse.json({ organization });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { organization, user } = await getWorkspaceContext();
    if (user.role !== 'owner' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only owners or admins can modify organization settings' }, { status: 403 });
    }

    const body = await req.json();

    const updated = await saveOrganization({
      ...organization,
      name: body.name || organization.name,
      legal_name: body.legal_name !== undefined ? body.legal_name : organization.legal_name,
      entity_type: body.entity_type !== undefined ? body.entity_type : organization.entity_type,
      ein: body.ein !== undefined ? body.ein : organization.ein,
      primary_trade: (body.primary_trade as PrimaryTrade) || organization.primary_trade,
      states_licensed: Array.isArray(body.states_licensed) ? body.states_licensed : organization.states_licensed,
    });

    return NextResponse.json({ organization: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating settings';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
