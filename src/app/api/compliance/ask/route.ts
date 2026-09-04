/**
 * POST /api/compliance/ask
 *   Ask a compliance question. Thread is created or continued.
 *   Requires no explicit auth params — context is resolved from the active
 *   tenant session (avorria_active_org + avorria_user_id cookies).
 *
 *   Body: { question: string, threadId?: string }
 *
 *   Returns:
 *     { threadId, messageId, answer, citedStandards, modelUsed,
 *       tradeContext, stateContext }
 *
 * GET /api/compliance/ask?threadId={id}
 *   Returns all messages in a thread, ordered by createdAt ascending.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { getContractorWorkspace } from '@/lib/tenant/repository';
import {
  askComplianceQuestion,
  buildContractorContext,
  ClaudeServiceError,
} from '@/lib/compliance/claude-service';
import { sanitizePii } from '@/lib/compliance/pii-sanitizer';
import {
  addDocument,
  setDocument,
  getDocument,
  queryDocuments,
  getAllDocuments,
} from '@/lib/firebase/firestore';
import {
  AskAvorriaThread,
  AskAvorriaMessage,
  AskAvorriaAnalyticsRecord,
} from '@/lib/firebase/types';

// ─── POST — ask a question ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let tenant;
  try {
    tenant = await getTenantContext();
  } catch {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: { question?: string; threadId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { question, threadId: existingThreadId } = body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return NextResponse.json({ error: 'question is required.' }, { status: 400 });
  }
  if (question.trim().length > 2000) {
    return NextResponse.json(
      { error: 'question must be 2000 characters or fewer.' },
      { status: 400 }
    );
  }

  // ── Resolve workspace context ──────────────────────────────────────────────
  const workspace = await getContractorWorkspace(tenant.organisation.id);
  const contractorCtx = buildContractorContext({
    trades: workspace.trades,
    primaryState: workspace.serviceAreas.primaryState,
    onboardingData: workspace.profile.onboarding_data as Record<string, unknown> | undefined,
  });

  // ── Ensure thread exists ───────────────────────────────────────────────────
  let threadId = existingThreadId;
  const now = new Date().toISOString();

  if (!threadId) {
    const thread = await addDocument<AskAvorriaThread>('askAvorriaThreads', {
      userId: tenant.userId,
      tradeContext: contractorCtx.tradeContext,
      stateContext: contractorCtx.stateContext,
      createdAt: now,
      lastMessageAt: now,
    });
    threadId = thread.id;
  }

  // ── Write user message ─────────────────────────────────────────────────────
  await addDocument<AskAvorriaMessage>(
    `askAvorriaThreads/${threadId}/messages`,
    {
      role: 'user',
      content: question.trim(),
      modelUsed: '',
      citedStandards: [],
      createdAt: now,
    }
  );

  // ── Call Claude ────────────────────────────────────────────────────────────
  let answer;
  try {
    answer = await askComplianceQuestion(question.trim(), contractorCtx);
  } catch (err) {
    if (err instanceof ClaudeServiceError) {
      if (err.code === 'NO_API_KEY') {
        return NextResponse.json(
          {
            error:
              'The AI compliance service is not configured. Please add ANTHROPIC_API_KEY to your environment.',
            code: 'NO_API_KEY',
          },
          { status: 503 }
        );
      }
      if (err.code === 'RATE_LIMITED') {
        return NextResponse.json(
          { error: err.message, code: 'RATE_LIMITED' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: err.message, code: 'API_ERROR' },
        { status: 502 }
      );
    }
    console.error('[compliance/ask] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }

  const answerNow = new Date().toISOString();

  // ── Write assistant message ────────────────────────────────────────────────
  const assistantMessage = await addDocument<AskAvorriaMessage>(
    `askAvorriaThreads/${threadId}/messages`,
    {
      role: 'assistant',
      content: answer.content,
      modelUsed: answer.modelUsed,
      citedStandards: answer.citedStandards,
      createdAt: answerNow,
    }
  );

  // ── Update thread lastMessageAt ────────────────────────────────────────────
  const existingThread = await getDocument<AskAvorriaThread>(
    'askAvorriaThreads',
    threadId
  );
  await setDocument<AskAvorriaThread>('askAvorriaThreads', threadId, {
    ...(existingThread ?? {
      userId: tenant.userId,
      tradeContext: contractorCtx.tradeContext,
      stateContext: contractorCtx.stateContext,
      createdAt: now,
    }),
    id: threadId,
    lastMessageAt: answerNow,
  });

  // ── Write PII-sanitized analytics record ──────────────────────────────────
  await addDocument<AskAvorriaAnalyticsRecord>('askAvorriaAnalytics', {
    question: sanitizePii(question.trim()),
    tradeContext: contractorCtx.tradeContext,
    stateContext: contractorCtx.stateContext,
    timestamp: now,
  });

  return NextResponse.json({
    threadId,
    messageId: assistantMessage.id,
    answer: answer.content,
    citedStandards: answer.citedStandards,
    modelUsed: answer.modelUsed,
    tradeContext: contractorCtx.tradeContext,
    stateContext: contractorCtx.stateContext,
    stateName: contractorCtx.stateName,
  });
}

// ─── GET — retrieve thread messages ──────────────────────────────────────────

export async function GET(req: NextRequest) {
  let tenant;
  try {
    tenant = await getTenantContext();
  } catch {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const threadId = req.nextUrl.searchParams.get('threadId');
  if (!threadId) {
    return NextResponse.json({ error: 'threadId is required.' }, { status: 400 });
  }

  // Verify thread belongs to this user
  const thread = await getDocument<AskAvorriaThread>('askAvorriaThreads', threadId);
  if (!thread) {
    return NextResponse.json({ error: 'Thread not found.' }, { status: 404 });
  }
  if (thread.userId !== tenant.userId) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const messages = await getAllDocuments<AskAvorriaMessage>(
    `askAvorriaThreads/${threadId}/messages`
  );

  // Sort by createdAt ascending
  messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return NextResponse.json({ threadId, thread, messages });
}
