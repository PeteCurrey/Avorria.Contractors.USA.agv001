import { NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listNotifications } from '@/lib/workspace/notifications';
import { loadWorkspaceStore, saveWorkspaceStore } from '@/lib/workspace/db';

export async function GET() {
  try {
    const { organization, user } = await getWorkspaceContext();
    const notifs = await listNotifications(organization.id, user.id);
    return NextResponse.json({ notifications: notifs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const { organization, user } = await getWorkspaceContext();
    const store = loadWorkspaceStore();
    const now = new Date().toISOString();

    for (const id of Object.keys(store.notifications)) {
      const n = store.notifications[id];
      if (n.org_id === organization.id && (!n.user_id || n.user_id === user.id)) {
        store.notifications[id].read_at = now;
      }
    }
    saveWorkspaceStore(store);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update notifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
