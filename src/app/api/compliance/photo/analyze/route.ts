/**
 * POST /api/compliance/photo/analyze
 *
 * Runs vision compliance analysis on an uploaded contractor photo:
 *   - Enforces multi-tenant ownership of storagePath (must belong to calling userId).
 *   - Injects contractor's trade, state, and license context.
 *   - Calls vision compliance model (Claude 3.5 Sonnet).
 *   - Writes audit record to Firestore: photoComplianceQueries/{queryId}
 *   - Returns answer, citations, queryId, and storagePath ready for workspace saving.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { getContractorWorkspace } from '@/lib/tenant/repository';
import { buildContractorContext, ClaudeServiceError } from '@/lib/compliance/claude-service';
import { analyzePhotoCompliance } from '@/lib/compliance/vision-service';
import { getContractorPhoto, StorageSecurityError } from '@/lib/firebase/storage';
import { addDocument } from '@/lib/firebase/firestore';
import { PhotoComplianceQuery } from '@/lib/firebase/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let tenant;
  try {
    tenant = await getTenantContext();
  } catch {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: { storagePath?: string; question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { storagePath, question } = body;

  if (!storagePath || typeof storagePath !== 'string') {
    return NextResponse.json(
      { error: 'storagePath is required.' },
      { status: 400 }
    );
  }

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return NextResponse.json(
      { error: 'question is required.' },
      { status: 400 }
    );
  }

  if (question.trim().length > 2000) {
    return NextResponse.json(
      { error: 'question must be 2000 characters or fewer.' },
      { status: 400 }
    );
  }

  // ── Retrieve photo with strict multi-tenant authorization ───────────────────
  let photo;
  try {
    photo = await getContractorPhoto(tenant.userId, storagePath);
  } catch (err) {
    if (err instanceof StorageSecurityError) {
      return NextResponse.json(
        { error: 'Access denied: You do not have permission to view this photo.' },
        { status: 403 }
      );
    }
    console.error('Error retrieving photo from storage:', err);
    return NextResponse.json(
      { error: 'Failed to access photo storage.' },
      { status: 500 }
    );
  }

  if (!photo) {
    return NextResponse.json(
      { error: 'Photo not found at specified storage path.' },
      { status: 404 }
    );
  }

  // ── Resolve workspace context ──────────────────────────────────────────────
  const workspace = await getContractorWorkspace(tenant.organisation.id);
  const contractorCtx = buildContractorContext({
    trades: workspace.trades,
    primaryState: workspace.serviceAreas.primaryState,
    onboardingData: workspace.profile.onboarding_data as Record<string, unknown> | undefined,
  });

  // ── Execute vision reasoning call ──────────────────────────────────────────
  let visionResult;
  try {
    visionResult = await analyzePhotoCompliance({
      question: question.trim(),
      imageBuffer: photo.buffer,
      mimeType: photo.mimeType,
      ctx: contractorCtx,
    });
  } catch (err) {
    if (err instanceof ClaudeServiceError) {
      if (err.code === 'NO_API_KEY') {
        return NextResponse.json(
          {
            error:
              'The vision compliance service is not configured. Please add ANTHROPIC_API_KEY to your environment.',
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
    console.error('Vision analysis error:', err);
    return NextResponse.json(
      { error: 'Vision compliance analysis failed. Please try again.' },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();

  // ── Persist query to Firestore collection photoComplianceQueries ───────────
  const queryRecord = await addDocument<PhotoComplianceQuery>(
    'photoComplianceQueries',
    {
      userId: tenant.userId,
      storagePath,
      question: question.trim(),
      tradeContext: contractorCtx.tradeContext,
      stateContext: contractorCtx.stateContext,
      modelUsed: visionResult.modelUsed,
      answer: visionResult.content,
      citedStandards: visionResult.citedStandards,
      createdAt: now,
    }
  );

  return NextResponse.json({
    queryId: queryRecord.id,
    answer: visionResult.content,
    citedStandards: visionResult.citedStandards,
    modelUsed: visionResult.modelUsed,
    storagePath,
    tradeContext: contractorCtx.tradeContext,
    stateContext: contractorCtx.stateContext,
    stateName: contractorCtx.stateName,
  });
}
