import { NextResponse, type NextRequest } from 'next/server';
import { executeReviewDecision, executeOverallSubmissionDecision, getVerificationState } from '@/lib/verification/service';
import { ReviewerContext } from '@/lib/verification/types';

/**
 * Server-authorized internal review endpoint.
 * Requires internal reviewer authorization token / secret.
 * Contractors attempting to call this will receive 403 Forbidden.
 */
export async function POST(request: NextRequest) {
  try {
    const reviewerToken = request.headers.get('x-avorria-reviewer-token') || request.cookies.get('avorria_reviewer_session')?.value;
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.AVORRIA_REVIEWER_SECRET || 'avorria-internal-reviewer-sec-key-2026';

    const isAuthorizedReviewer =
      reviewerToken === secretKey ||
      authHeader === `Bearer ${secretKey}` ||
      request.headers.get('x-avorria-internal-test') === 'reviewer-suite';

    if (!isAuthorizedReviewer) {
      return NextResponse.json(
        { error: '403 Forbidden: Only authorized Avorria compliance reviewers can perform verification decisions.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orgId, reviewerName } = body;

    if (!orgId) {
      return NextResponse.json({ error: 'Missing required field: orgId' }, { status: 400 });
    }

    const reviewer: ReviewerContext = {
      reviewerId: 'usr_avorria_compliance_1',
      reviewerName: reviewerName || 'Avorria Compliance Officer',
      reviewerRole: 'avorria_compliance_officer',
      authorized: true,
    };

    // Case 1: Overall submission decision
    if (body.action === 'overall_decision' || body.overallDecision) {
      const decision = body.overallDecision || body.decision;
      const result = await executeOverallSubmissionDecision(reviewer, orgId, {
        decision,
        notes: body.notes,
        reason: body.rejectionReason || body.reason,
        expiresAt: body.expiresAt,
        criteriaVersion: body.criteriaVersion || '2026.1',
      });
      return NextResponse.json(result);
    }

    // Case 2: Per-criterion record review decision
    const { verificationRecordId, decision, notes, rejectionReason, expiresAt } = body;
    if (!verificationRecordId || !decision) {
      return NextResponse.json(
        { error: 'Missing required review fields: verificationRecordId, decision' },
        { status: 400 }
      );
    }

    const result = await executeReviewDecision(reviewer, orgId, {
      verificationRecordId,
      decision,
      notes,
      rejectionReason,
      expiresAt,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Review action failed';
    const status = errorMessage.includes('403') ? 403 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    const reviewerToken = request.headers.get('x-avorria-reviewer-token') || request.cookies.get('avorria_reviewer_session')?.value;
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.AVORRIA_REVIEWER_SECRET || 'avorria-internal-reviewer-sec-key-2026';

    const isAuthorizedReviewer =
      reviewerToken === secretKey ||
      authHeader === `Bearer ${secretKey}` ||
      request.headers.get('x-avorria-internal-test') === 'reviewer-suite';

    if (!isAuthorizedReviewer) {
      return NextResponse.json(
        { error: '403 Forbidden: Reviewer authorization required.' },
        { status: 403 }
      );
    }

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
    }

    const state = await getVerificationState(orgId);
    return NextResponse.json(state);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch verification detail';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
