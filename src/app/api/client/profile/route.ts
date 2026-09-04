import { NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getConnectNotifications } from '@/lib/connect/repository';

export async function GET() {
  try {
    const client = await getClientContext();
    const notifications = await getConnectNotifications(client.organisationId);
    return NextResponse.json({
      profile: client.profile,
      userId: client.userId,
      userRole: client.userRole,
      notifications,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve client profile';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
