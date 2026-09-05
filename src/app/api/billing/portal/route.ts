import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/workspace/context';
import { createCustomerPortalSession } from '@/lib/billing/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const body = await req.json().catch(() => ({}));

    const portal = await createCustomerPortalSession({
      orgId: session.organization.id,
      returnUrl: body.returnUrl,
    });

    return NextResponse.json({
      success: true,
      url: portal.url,
    });
  } catch (err: any) {
    console.error('Customer portal error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const returnUrl = searchParams.get('returnUrl') || undefined;

    const portal = await createCustomerPortalSession({
      orgId: session.organization.id,
      returnUrl,
    });

    return NextResponse.redirect(portal.url);
  } catch (err: any) {
    console.error('Customer portal GET error:', err);
    return NextResponse.redirect(new URL('/workspace/settings?error=portal_failed', req.url));
  }
}
