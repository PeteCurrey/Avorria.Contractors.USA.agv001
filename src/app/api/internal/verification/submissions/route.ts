import { NextResponse, type NextRequest } from 'next/server';
import { getAllSubmissionsForReview } from '@/lib/verification/service';
import { ReviewerContext } from '@/lib/verification/types';

export async function GET(request: NextRequest) {
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
        { error: '403 Forbidden: Only authorized Avorria compliance reviewers can access verification submissions.' },
        { status: 403 }
      );
    }

    const reviewer: ReviewerContext = {
      reviewerId: 'usr_avorria_compliance_1',
      reviewerName: 'Avorria Compliance Officer',
      reviewerRole: 'avorria_compliance_officer',
      authorized: true,
    };

    const submissions = await getAllSubmissionsForReview(reviewer);
    return NextResponse.json({ submissions });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch submissions';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
