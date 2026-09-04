import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPacksByTenant } from '@/lib/request/repository';
import { evaluateRequestReadiness } from '@/lib/request/readiness';
import { RequirementPackStatus } from '@/lib/request/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project Requests & Requirement Packs',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ClientRequestsPage() {
  const client = await getClientContext();
  const packs = await getRequirementPacksByTenant(client.organisationId);

  const packsWithReadiness = packs.map((pack) => ({
    ...pack,
    readiness: evaluateRequestReadiness(pack),
  }));

  const totalPacks = packs.length;
  const readyPacks = packsWithReadiness.filter((p) => p.status === 'ready' || p.status === 'active').length;
  const draftPacks = packs.filter((p) => p.status === 'draft').length;
  const closedPacks = packs.filter((p) => p.status === 'closed' || p.status === 'cancelled').length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Commercial Project Requests
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Requirement Packs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Project Requests & Requirement Packs
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            Define structured scopes, trade classifications, and documentary evidence criteria. Preview qualified contractors whose published Passports match your requirements before initiating invitations.
          </p>
        </div>

        <Link
          href="/client/requests/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <span>+</span>
          <span>New Project Request</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-mono font-medium text-slate-500 uppercase">Total Requests</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalPacks}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-mono font-medium text-slate-500 uppercase">Ready / Active</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{readyPacks}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-mono font-medium text-slate-500 uppercase">In Draft</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{draftPacks}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-mono font-medium text-slate-500 uppercase">Closed / Archived</div>
          <div className="text-2xl font-bold text-slate-500 mt-1">{closedPacks}</div>
        </div>
      </div>

      {/* Project Requests Table */}
      {packs.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl mb-4">
            📋
          </div>
          <h3 className="text-base font-bold text-slate-900">No project requests created yet</h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Turn your upcoming commercial project scopes into structured Requirement Packs. Establish required insurance levels, safety criteria, and licenses, and preview candidate trade contractors with published verification.
          </p>
          <Link
            href="/client/requests/new"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-all shadow-sm"
          >
            <span>+</span>
            <span>Create First Project Request</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-6">Reference & Title</th>
                  <th className="py-3.5 px-4">Trades</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Requirements</th>
                  <th className="py-3.5 px-4">Readiness</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {packsWithReadiness.map((pack) => {
                  const reqCount = pack.requirements?.length || 0;
                  const trades = pack.trades || [];

                  return (
                    <tr key={pack.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Reference & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                            {pack.reference}
                          </span>
                          {pack.project_type && (
                            <span className="text-[11px] text-slate-400 capitalize">
                              • {pack.project_type}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/client/requests/${pack.id}`}
                          className="font-bold text-slate-900 hover:text-brand-600 transition-colors text-sm"
                        >
                          {pack.title}
                        </Link>
                      </td>

                      {/* Trades */}
                      <td className="py-4 px-4">
                        {trades.length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {trades.slice(0, 2).map((t) => (
                              <span
                                key={t.id}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                              >
                                {t.trade_name}
                              </span>
                            ))}
                            {trades.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                                +{trades.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-slate-700 font-medium">
                        {pack.city}, {pack.state}
                      </td>

                      {/* Requirements */}
                      <td className="py-4 px-4 text-slate-600">
                        <span className="font-bold text-slate-900">{reqCount}</span> criteria
                      </td>

                      {/* Readiness */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                pack.readiness.isReady ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${pack.readiness.completionPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700">
                            {pack.readiness.completionPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <PackStatusBadge status={pack.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/client/requests/${pack.id}/matches`}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>🔍</span>
                            <span>Preview Matches</span>
                          </Link>
                          <Link
                            href={`/client/requests/${pack.id}`}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            Brief →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PackStatusBadge({ status }: { status: RequirementPackStatus }) {
  switch (status) {
    case 'ready':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Ready
        </span>
      );
    case 'active':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
          Active
        </span>
      );
    case 'closed':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          Closed
        </span>
      );
    case 'cancelled':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          Draft
        </span>
      );
  }
}
