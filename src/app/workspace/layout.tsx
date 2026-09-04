import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listNotifications } from '@/lib/workspace/notifications';
import { WorkspaceShell } from './WorkspaceShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contractor Workspace | Avorria Contractors USA',
  robots: { index: false, follow: false },
};

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getWorkspaceContext();
  const notifications = await listNotifications(context.organization.id, context.user.id);
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <WorkspaceShell
      organization={context.organization}
      user={context.user}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </WorkspaceShell>
  );
}
