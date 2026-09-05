import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { markNotificationRead, loadWorkspaceStore } from '@/lib/workspace/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await context.params;

    const store = loadWorkspaceStore();
    const notif = store.notifications[id];
    if (!notif) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    if (notif.org_id !== organization.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ok = await markNotificationRead(id);
    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to mark notification read';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
