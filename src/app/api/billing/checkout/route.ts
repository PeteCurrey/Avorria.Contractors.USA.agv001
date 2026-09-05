import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/workspace/context';
import { createCheckoutSession } from '@/lib/billing/stripe';
import { CanonicalPlanTier } from '@/lib/billing/entitlements';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const body = await req.json().catch(() => ({}));

    const planId: CanonicalPlanTier = body.planId || 'professional';
    const interval = body.interval === 'annual' ? 'annual' : 'monthly';
    const returnUrl = body.returnUrl;
    const cancelUrl = body.cancelUrl;

    const checkout = await createCheckoutSession({
      orgId: session.organization.id,
      userEmail: session.user.email || 'billing@contractor.com',
      planId,
      interval,
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({
      success: true,
      url: checkout.url,
      sessionId: checkout.sessionId,
      immediate: checkout.immediate,
    });
  } catch (err: any) {
    console.error('Billing checkout session error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initiate checkout session' },
      { status: 500 }
    );
  }
}
