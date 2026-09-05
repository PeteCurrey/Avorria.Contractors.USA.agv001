import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listNotifications } from '@/lib/workspace/notifications';
import { NotificationsClient } from './NotificationsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Notifications | Avorria Contractor Workspace',
  robots: { index: false, follow: false },
};

export default async function WorkspaceNotificationsPage() {
  const { organization, user } = await getWorkspaceContext();
  const notifications = await listNotifications(organization.id, user.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border border-[#E2E4E8] bg-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="micro-label text-neutral-500 mb-1">
            ALERT CENTER & NOTIFICATIONS
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Compliance & Renewal Alerts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Automated credential monitoring, escalation alerts, and direct action items for {organization.name}.
          </p>
        </div>
      </div>

      <NotificationsClient
        initialNotifications={notifications}
        organization={organization}
        user={user}
      />
    </div>
  );
}
