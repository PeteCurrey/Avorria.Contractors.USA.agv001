import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { completeClientOnboarding, CompleteClientOnboardingInput } from '@/lib/connect/service';

export async function POST(req: NextRequest) {
  try {
    const client = await getClientContext();
    const body: CompleteClientOnboardingInput = await req.json();

    if (!body.organisationName || !body.organisationType || !body.contactName || !body.businessEmail) {
      return NextResponse.json(
        { error: 'Missing required onboarding fields (Organisation Name, Type, Contact Name, Email).' },
        { status: 400 }
      );
    }

    const updated = await completeClientOnboarding(client.organisationId, body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to complete client onboarding';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
