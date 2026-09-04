import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import {
  getVerificationState,
  requestVerification,
  submitEvidenceForCriterion,
  respondToClarification,
} from '@/lib/verification/service';

export async function GET() {
  try {
    const tenant = await getTenantContext();
    const state = await getVerificationState(tenant.organisation.id);
    return NextResponse.json(state);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve verification state';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const body = await request.json();
    const { action } = body;

    if (action === 'request') {
      const result = await requestVerification(tenant.organisation.id, tenant.userId);
      return NextResponse.json(result);
    }

    if (action === 'submit_evidence') {
      const { criterionSlug, evidenceDocId, notes } = body;
      if (!criterionSlug || !evidenceDocId) {
        return NextResponse.json({ error: 'Missing criterionSlug or evidenceDocId' }, { status: 400 });
      }
      const result = await submitEvidenceForCriterion(
        tenant.organisation.id,
        tenant.userId,
        criterionSlug,
        evidenceDocId,
        notes
      );
      return NextResponse.json(result);
    }

    if (action === 'respond_clarification') {
      const { verificationRecordId, responseMessage, replacementDocId } = body;
      if (!verificationRecordId || !responseMessage) {
        return NextResponse.json({ error: 'Missing verificationRecordId or responseMessage' }, { status: 400 });
      }
      const result = await respondToClarification(
        tenant.organisation.id,
        tenant.userId,
        verificationRecordId,
        responseMessage,
        replacementDocId
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Verification action failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
