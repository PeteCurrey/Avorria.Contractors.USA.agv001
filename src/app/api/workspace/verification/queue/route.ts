import { NextRequest, NextResponse } from 'next/server';
import { listEvidence } from '@/lib/prove/prove-store';
import { getWorkspaceContext } from '@/lib/workspace/context';
import type { EvidenceItem, VerificationState } from '@/lib/prove/types';

/** States that represent evidence actively in — or needing — a verification workflow. */
const QUEUE_STATES: VerificationState[] = [
  'PENDING_VERIFICATION',
  'REVIEW_REQUIRED',
  'VERIFICATION_FAILED',
];

/**
 * GET /api/workspace/verification/queue
 *
 * Returns evidence items in actionable verification states for the authenticated org.
 *
 * Query params:
 *   ?state=PENDING_VERIFICATION,REVIEW_REQUIRED  — filter by specific states (comma-separated)
 *
 * Response:
 *   { items: EvidenceItem[], position: { pending, review_required, failed, total_queue } }
 */
export async function GET(request: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const { searchParams } = new URL(request.url);

    // Optional state filter
    const stateParam = searchParams.get('state');
    const filterStates: VerificationState[] = stateParam
      ? (stateParam.split(',').filter((s) =>
          QUEUE_STATES.includes(s as VerificationState)
        ) as VerificationState[])
      : QUEUE_STATES;

    const allItems: EvidenceItem[] = await listEvidence(organization.id);

    const queueItems = allItems.filter((item) =>
      filterStates.includes(item.verification_state)
    );

    // Sort: REVIEW_REQUIRED first (contractor has taken action), then PENDING, then FAILED
    const stateOrder: Record<VerificationState, number> = {
      REVIEW_REQUIRED: 0,
      PENDING_VERIFICATION: 1,
      VERIFICATION_FAILED: 2,
      CONTRACTOR_SUPPLIED: 3,
      DOCUMENT_SUPPORTED: 4,
      VERIFIED: 5,
    };
    queueItems.sort(
      (a, b) =>
        stateOrder[a.verification_state] - stateOrder[b.verification_state] ||
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    const position = {
      pending: allItems.filter((i) => i.verification_state === 'PENDING_VERIFICATION').length,
      review_required: allItems.filter((i) => i.verification_state === 'REVIEW_REQUIRED').length,
      failed: allItems.filter((i) => i.verification_state === 'VERIFICATION_FAILED').length,
      total_queue: queueItems.length,
    };

    return NextResponse.json({ items: queueItems, position });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : 'Failed to load verification queue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
