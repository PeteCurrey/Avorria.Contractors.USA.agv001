'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ContractorInboxItem } from '@/lib/respond/types';

function statusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    sent: { label: 'Awaiting Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    viewed: { label: 'Viewed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    interested: { label: 'Response In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    declined: { label: 'Declined', color: 'bg-slate-100 text-slate-500 border-slate-200' },
    withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-400 border-slate-200' },
    expired: { label: 'Expired', color: 'bg-red-50 text-red-600 border-red-200' },
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-500 border-slate-200' },
  };
  return map[status] ?? { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200' };
}

function responseStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: 'Response Draft', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    submitted: { label: 'Response Submitted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    withdrawn: { label: 'Response Withdrawn', color: 'bg-slate-100 text-slate-500 border-slate-200' },
  };
  return map[status] ?? { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200' };
}

export default function ContractorRequestsPage() {
  const [inbox, setInbox] = useState<ContractorInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/contractor/requests')
      .then((r) => r.json())
      .then((d) => {
        if (d.inbox) setInbox(d.inbox);
        else setError(d.error ?? 'Failed to load inbox');
      })
      .catch(() => setError('Network error'))
      .finally(() => setIsLoading(false));
  }, []);

  const activeItems = inbox.filter((i) => ['sent', 'viewed', 'interested'].includes(i.invitation.status));
  const closedItems = inbox.filter((i) => !['sent', 'viewed', 'interested'].includes(i.invitation.status));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Avorria Contractor</p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Project Requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Private invitations from clients who have reviewed your Passport and selected you for their structured requirement process.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex items-center gap-3 text-slate-500 text-sm py-12 justify-center">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            Loading invitations…
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
        )}

        {!isLoading && !error && inbox.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-slate-600 font-medium">No invitations yet</p>
            <p className="text-sm mt-1">When a client selects you from a match set, your invitation will appear here.</p>
          </div>
        )}

        {!isLoading && !error && activeItems.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4">Active Invitations</h2>
            <div className="space-y-3">
              {activeItems.map((item) => (
                <InboxCard key={item.invitation.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {!isLoading && !error && closedItems.length > 0 && (
          <section>
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4">Past Invitations</h2>
            <div className="space-y-3 opacity-70">
              {closedItems.map((item) => (
                <InboxCard key={item.invitation.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function InboxCard({ item }: { item: ContractorInboxItem }) {
  const inv = item.invitation;
  const invStatus = statusLabel(inv.status);
  const responseStatus = item.response ? responseStatusLabel(item.response.status) : null;
  const sentAt = inv.sent_at ? new Date(inv.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <Link
      href={`/contractor/requests/${inv.id}`}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${invStatus.color}`}>
              {invStatus.label}
            </span>
            {responseStatus && (
              <span className={`inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${responseStatus.color}`}>
                {responseStatus.label}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-slate-700">
            {item.packTitle}
          </h3>
          {item.packDescription && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{item.packDescription}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
            {item.packTrades.length > 0 && (
              <span>
                {item.packTrades.slice(0, 2).map((t) => (
                  <span key={t} className="mr-1 capitalize">{t.replace(/-/g, ' ')}</span>
                ))}
                {item.packTrades.length > 2 && <span>+{item.packTrades.length - 2} more</span>}
              </span>
            )}
            {item.packTerritory && <span>📍 {item.packTerritory}</span>}
            <span>{item.requirementCount} requirement{item.requirementCount !== 1 ? 's' : ''}</span>
            {sentAt && <span>Received {sentAt}</span>}
          </div>
        </div>
        <div className="shrink-0 text-slate-300 group-hover:text-slate-400 text-lg">→</div>
      </div>

      {inv.invitation_message && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500 italic line-clamp-2">
          "{inv.invitation_message}"
        </div>
      )}
    </Link>
  );
}
