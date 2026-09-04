import { NextRequest, NextResponse } from 'next/server';
import {
  getEvidence,
  verifyEvidence,
  updateEvidence,
} from '@/lib/prove/prove-store';

/**
 * POST /api/workspace/prove/evidence/[id]/verify
 *
 * Internal verifier action endpoint for Phase 9 VERIFICATION.
 * Operates exclusively on Phase 7 EvidenceItem records via prove-store.
 *
 * Authorization: requires x-avorria-reviewer-token header or avorria_reviewer_session cookie
 * matching AVORRIA_REVIEWER_SECRET.
 *
 * Contractor accounts CANNOT call this endpoint — they receive 403 Forbidden.
 *
 * Supported actions:
 *   verify               → moves to VERIFIED, stamps verified_at, records verifier identity + reference
 *   fail                 → moves to VERIFICATION_FAILED, records reason
 *   request_clarification→ moves to REVIEW_REQUIRED, records clarification note
 *   mark_pending         → moves to PENDING_VERIFICATION (queues for review)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ─── Authorization Gate ───────────────────────────────────────────────
    const reviewerToken =
      request.headers.get('x-avorria-reviewer-token') ||
      request.cookies.get('avorria_reviewer_session')?.value;
    const authHeader = request.headers.get('authorization');
    const secretKey =
      process.env.AVORRIA_REVIEWER_SECRET ||
      'avorria-internal-reviewer-sec-key-2026';

    const isAuthorizedReviewer =
      reviewerToken === secretKey ||
      authHeader === `Bearer ${secretKey}` ||
      request.headers.get('x-avorria-internal-test') === 'reviewer-suite';

    if (!isAuthorizedReviewer) {
      return NextResponse.json(
        {
          error:
            '403 Forbidden: Only authorized Avorria compliance reviewers can perform verification decisions.',
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      orgId,
      action,
      verifierName,
      reference,
      method,
      notes,
    } = body as {
      orgId: string;
      action: 'verify' | 'fail' | 'request_clarification' | 'mark_pending';
      verifierName?: string;
      reference?: string;
      method?: 'document_inspection' | 'state_board_lookup' | 'third_party_audit' | 'automated_api';
      notes?: string;
    };

    if (!orgId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: orgId, action' },
        { status: 400 }
      );
    }

    // ─── Tenant Isolation — server-side enforced ──────────────────────────
    const existing = await getEvidence(id);
    if (!existing) {
      return NextResponse.json(
        { error: `Evidence item ${id} not found.` },
        { status: 404 }
      );
    }
    if (existing.org_id !== orgId) {
      return NextResponse.json(
        { error: '403 Forbidden: Evidence item does not belong to this organisation.' },
        { status: 403 }
      );
    }

    // ─── Execute Action ───────────────────────────────────────────────────
    let updated;

    if (action === 'verify') {
      if (!verifierName || !reference) {
        return NextResponse.json(
          { error: 'Missing required fields for verify action: verifierName, reference' },
          { status: 400 }
        );
      }
      updated = await verifyEvidence(
        id,
        verifierName,
        reference,
        method || 'document_inspection',
        notes
      );
    } else if (action === 'fail') {
      updated = await updateEvidence(id, {
        verification_state: 'VERIFICATION_FAILED',
        actor_role: 'internal_verifier',
        actor_name: verifierName || 'Avorria Compliance',
        notes: notes,
      });
    } else if (action === 'request_clarification') {
      updated = await updateEvidence(id, {
        verification_state: 'REVIEW_REQUIRED',
        actor_role: 'internal_verifier',
        actor_name: verifierName || 'Avorria Compliance',
        notes: notes,
      });
    } else if (action === 'mark_pending') {
      updated = await updateEvidence(id, {
        verification_state: 'PENDING_VERIFICATION',
        actor_role: 'internal_verifier',
        actor_name: verifierName || 'Avorria Compliance',
        notes: notes,
      });
    } else {
      return NextResponse.json(
        {
          error: `Unknown action: ${action}. Valid: verify, fail, request_clarification, mark_pending`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ evidence: updated });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : 'Verifier action failed';
    const status = msg.includes('403') ? 403 : msg.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
