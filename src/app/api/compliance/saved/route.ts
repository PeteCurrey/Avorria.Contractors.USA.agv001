/**
 * GET /api/compliance/saved
 *
 * Returns all workspaceSavedItems for the authenticated user.
 * Supports filtering by type via query param.
 *
 * Query params:
 *   userId?  — explicit user ID (falls back to session; used for test scripts)
 *   type?    — 'ask_avorria_answer' | 'photo_compliance_answer'
 *
 * Returns: { items: WorkspaceSavedItem[], count: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { queryDocuments } from '@/lib/firebase/firestore';
import { WorkspaceSavedItem } from '@/lib/firebase/types';

export async function GET(req: NextRequest) {
  let tenant;
  try {
    tenant = await getTenantContext();
  } catch {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  // Allow explicit userId override for test scripts (same value as session is fine)
  const queryUserId = req.nextUrl.searchParams.get('userId') ?? tenant.userId;

  // Security: only allow accessing your own saved items
  if (queryUserId !== tenant.userId) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const typeFilter = req.nextUrl.searchParams.get('type');

  let items = await queryDocuments<WorkspaceSavedItem>(
    'workspaceSavedItems',
    'userId',
    queryUserId
  );

  if (
    typeFilter === 'ask_avorria_answer' ||
    typeFilter === 'photo_compliance_answer'
  ) {
    items = items.filter((i) => i.type === typeFilter);
  }

  // Sort newest first
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ items, count: items.length });
}
