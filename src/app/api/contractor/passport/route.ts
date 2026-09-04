import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { getPassportDetails, setPassportVisibility, updatePassportSettings } from '@/lib/tenant/repository';

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
    const { visibility, settings } = body;

    let visibilityResult;
    if (visibility) {
      visibilityResult = await setPassportVisibility(tenant.organisation.id, visibility);
      if (!visibilityResult.success) {
        return NextResponse.json(visibilityResult, { status: 400 });
      }
    }

    let updatedSettings;
    if (settings) {
      updatedSettings = await updatePassportSettings(tenant.organisation.id, settings);
    }

    const updatedPassport = await getPassportDetails(tenant.organisation.id);

    return NextResponse.json({
      success: true,
      message: visibilityResult?.message || 'Passport settings updated.',
      passport: updatedPassport,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update passport';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
