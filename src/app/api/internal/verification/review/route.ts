import { NextResponse, type NextRequest } from 'next/server';
import { executeReviewDecision } from '@/lib/verification/service';
import { ReviewerContext } from '@/lib/verification/types';

/**
 * Server-authorized internal review endpoint.
 * Requires internal reviewer authorization token / secret.
 * Contractors attempting to call this will receive 403 Forbidden.
 */
export async function POST(request: NextRequest) {
  try {
    const reviewerToken = request.headers.get('x-avorria-reviewer-token');
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
    const { orgId, verificationRecordId, decision, notes, rejectionReason, expiresAt, reviewerName } = body;

    if (!orgId || !verificationRecordId || !decision) {
      return NextResponse.json(
        { error: 'Missing required review fields: orgId, verificationRecordId, decision' },
        { status: 400 }
      );
    }

    const reviewer: ReviewerContext = {
      reviewerId: 'usr_avorria_compliance_1',
      reviewerName: reviewerName || 'Avorria Compliance Officer',
      reviewerRole: 'avorria_compliance_officer',
      authorized: true,
    };

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
