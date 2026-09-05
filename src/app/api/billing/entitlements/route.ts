import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/workspace/context';
import { getEntitlements } from '@/lib/billing/entitlements';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const entitlements = await getEntitlements(session.organization.id);

    return NextResponse.json({
      success: true,
      entitlements,
    });
  } catch (err: any) {
    console.error('Failed to get entitlements:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve plan entitlements' },
      { status: 500 }
    );
  }
}
