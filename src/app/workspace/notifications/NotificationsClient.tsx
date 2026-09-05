'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Organization, WorkspaceUser, WorkspaceNotification } from '@/lib/workspace/types';

interface NotificationsClientProps {
  initialNotifications: WorkspaceNotification[];
  organization: Organization;
  user: WorkspaceUser;
}

type FilterTab = 'all' | 'unread' | 'critical' | 'warnings';

export function NotificationsClient({
  initialNotifications,
  organization,
  user,
}: NotificationsClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const criticalCount = notifications.filter((n) => {
    const urgency =
      n.urgency ||
      (n.type === 'expired' || n.type === 'expiring_14'
        ? 'critical'
        : n.type === 'expiring_30'
        ? 'warning'
        : 'info');
    return urgency === 'critical';
  }).length;

  const filteredNotifications = notifications.filter((n) => {
    const urgency =
      n.urgency ||
      (n.type === 'expired' || n.type === 'expiring_14'
        ? 'critical'
        : n.type === 'expiring_30'
        ? 'warning'
        : 'info');

    if (activeTab === 'unread') return !n.read_at;
    if (activeTab === 'critical') return urgency === 'critical';
    if (activeTab === 'warnings') return urgency === 'warning' || urgency === 'info';
    return true;
  });

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await fetch('/api/workspace/notifications', { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      router.refresh();
    } catch {
      // Ignored
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkSingleRead(id: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setMarkingId(id);
    try {
      await fetch(`/api/workspace/notifications/${id}`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      router.refresh();
    } catch {
      // Ignored
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E2E4E8] rounded-2xl p-3 shadow-2xs">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'critical', label: `Critical (${criticalCount})` },
              { id: 'warnings', label: 'Warnings & Info' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-neutral-900 text-white font-bold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right action CTAs */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={markingAll}
              onClick={handleMarkAllRead}
              className="text-xs font-mono font-medium text-[#F97316] hover:text-[#EA580C] hover:underline disabled:opacity-50"
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          )}

          <Link
            href="/workspace/settings?tab=notifications"
            className="text-xs font-mono text-neutral-500 hover:text-neutral-900 flex items-center gap-1 border border-[#E2E4E8] px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <span>Preferences</span>
            <span>⚙</span>
          </Link>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="border border-[#E2E4E8] bg-white rounded-2xl p-12 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-xl text-neutral-400 mb-3">
              ✓
            </div>
            <h3 className="text-sm font-bold text-neutral-800">
              No notifications in this view
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              All compliance items, renewal warnings, and operator actions have been reviewed.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const urgency =
              n.urgency ||
              (n.type === 'expired' || n.type === 'expiring_14'
                ? 'critical'
                : n.type === 'expiring_30'
                ? 'warning'
                : 'info');
            const isRead = !!n.read_at;

            const cardBorder = isRead
              ? 'border-[#E2E4E8] bg-white text-neutral-600'
              : urgency === 'critical'
              ? 'border-red-300 bg-red-50/70 text-neutral-900 shadow-2xs'
              : urgency === 'warning'
              ? 'border-amber-300 bg-amber-50/70 text-neutral-900 shadow-2xs'
              : 'border-orange-200 bg-[#FFF7ED]/80 text-neutral-900 shadow-2xs';

            const badgeBg = isRead
              ? 'bg-neutral-100 text-neutral-500 border-neutral-200'
              : urgency === 'critical'
              ? 'bg-red-500 text-white border-red-600 font-bold'
              : urgency === 'warning'
              ? 'bg-amber-500 text-neutral-950 border-amber-600 font-bold'
              : 'bg-orange-500 text-white border-orange-600 font-bold';

            const urgencyIcon = isRead
              ? '✓'
              : urgency === 'critical'
              ? '🔴'
              : urgency === 'warning'
              ? '⚠'
              : 'ℹ';

            const actionUrl =
              n.action_url ||
              (n.related_credential_id
                ? `/workspace/comply?credential=${n.related_credential_id}`
                : '/workspace/comply');

            return (
              <div
                key={n.id}
                className={`border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${cardBorder}`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">{urgencyIcon}</span>
                    <span className="micro-label text-[10px]">
                      {n.type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${badgeBg}`}
                    >
                      {isRead ? 'READ' : urgency.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {new Date(n.sent_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-neutral-900 leading-snug">
                    {n.message}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  {!isRead && (
                    <button
                      type="button"
                      disabled={markingId === n.id}
                      onClick={(e) => handleMarkSingleRead(n.id, e)}
                      className="px-3 py-1.5 text-xs font-mono text-neutral-600 hover:text-neutral-900 border border-[#E2E4E8] bg-white rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                      {markingId === n.id ? 'Marking...' : 'Mark read'}
                    </button>
                  )}

                  <Link
                    href={actionUrl}
                    className="px-3.5 py-1.5 text-xs font-mono font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <span>View Record</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
