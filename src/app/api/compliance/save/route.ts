/**
 * POST /api/compliance/save
 *
 * Saves a single assistant answer to the shared workspaceSavedItems
 * collection. This is the shared save target for both Ask Avorria
 * (type: ask_avorria_answer) and Photo Compliance (type: photo_compliance_answer).
 *
 * Body (required fields):
 *   {
 *     type:            'ask_avorria_answer' | 'photo_compliance_answer',
 *     question:        string,
 *     answer:          string,
 *     citedStandards:  string[],
 *     tradeContext:    string,
 *     stateContext:    string,
 *     modelUsed:       string,
 *     sourceThreadId:  string,
 *     storagePath?:    string   // Photo Compliance only
 *   }
 *
 * Returns: { savedItemId, createdAt }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { addDocument } from '@/lib/firebase/firestore';
import { WorkspaceSavedItem } from '@/lib/firebase/types';
import { z } from 'zod';

const SaveSchema = z.object({
  type: z.enum(['ask_avorria_answer', 'photo_compliance_answer']),
  question: z.string().min(1).max(2000),
  answer: z.string().min(1),
  citedStandards: z.array(z.string()),
  tradeContext: z.string().min(1),
  stateContext: z.string().min(1),
  modelUsed: z.string().min(1),
  sourceThreadId: z.string().min(1),
  storagePath: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let tenant;
  try {
    tenant = await getTenantContext();
  } catch {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const savedItem = await addDocument<WorkspaceSavedItem>('workspaceSavedItems', {
    userId: tenant.userId,
    type: data.type,
    question: data.question,
    answer: data.answer,
    citedStandards: data.citedStandards,
    tradeContext: data.tradeContext,
    stateContext: data.stateContext,
    modelUsed: data.modelUsed,
    sourceThreadId: data.sourceThreadId,
    ...(data.storagePath ? { storagePath: data.storagePath } : {}),
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    { savedItemId: savedItem.id, createdAt: savedItem.createdAt },
    { status: 201 }
  );
}
