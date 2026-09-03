import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { saveOnboardingStep, completeOnboarding } from '@/lib/tenant/repository';

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const body = await request.json();
    const { step, data, isComplete } = body;

    if (step && data) {
      await saveOnboardingStep(tenant.organisation.id, Number(step), data);
    }

    if (isComplete) {
      await completeOnboarding(tenant.organisation.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to save onboarding progress';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
