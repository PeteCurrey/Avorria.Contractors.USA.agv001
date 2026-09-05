import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/workspace/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { user } = await getWorkspaceContext();
    const prefs = await getNotificationPreferences(user.id);
    return NextResponse.json({ preferences: prefs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch preferences';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await getWorkspaceContext();
    const body = await req.json().catch(() => ({}));

    const allowed = [
      'expiry_alerts_email',
      'expiry_alerts_inapp',
      'billing_alerts_email',
      'digest_mode',
      'digest_day',
    ];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    const updated = await saveNotificationPreferences(user.id, patch as any);
    return NextResponse.json({ preferences: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update preferences';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
