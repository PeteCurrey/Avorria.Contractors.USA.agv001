import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getClientContext } from '@/lib/connect/context';
import {
  getSavedContractors,
  getClientRelationships,
  getClientOpportunities,
  getConnectNotifications,
} from '@/lib/connect/repository';
import { VerifiedByAvorriaBadge } from '@/components/passport/VerifiedByAvorriaBadge';

export const metadata: Metadata = {
  title: 'Client Dashboard',
};

export default async function ClientDashboardPage() {
  const client = await getClientContext();
  const [saved, relationships, opportunities, notifications] = await Promise.all([
    getSavedContractors(client.organisationId),
    getClientRelationships(client.organisationId),
    getClientOpportunities(client.organisationId),
    getConnectNotifications(client.organisationId),
  ]);

  const connectedCount = relationships.filter((r) => r.status === 'connected').length;
  const pendingRequestsCount = relationships.filter((r) => r.status === 'pending').length;
  const activeOpportunities = opportunities.filter((o) => o.status === 'open');
  const totalInvitations = opportunities.reduce((acc, o) => acc + (o.invitationsCount || 0), 0);
  const totalAccepted = opportunities.reduce((acc, o) => acc + (o.acceptedCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Commercial Buyer Account
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 capitalize">
              {client.profile.organisation_type.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {client.profile.organisation_name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome back, {client.profile.contact_name}. Manage your verified contractor network and project opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/contractors"
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>🔍</span>
            <span>Discover Contractors</span>
          </Link>
          <Link
            href="/client/opportunities/new"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Create Opportunity</span>
          </Link>
        </div>
      </div>

      {/* Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: My Network */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            CONNECTED CONTRACTORS
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{connectedCount}</span>
            <span className="text-xs text-slate-500">active relationships</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{pendingRequestsCount} pending request{pendingRequestsCount === 1 ? '' : 's'}</span>
            <Link href="/client/contractors" className="text-brand-600 font-semibold hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 2: Saved / Bookmarked */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            SAVED CONTRACTORS
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{saved.length}</span>
            <span className="text-xs text-slate-500">bookmarked</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ready for invitation</span>
            <Link href="/client/contractors?tab=saved" className="text-brand-600 font-semibold hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 3: Active Opportunities */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            ACTIVE OPPORTUNITIES
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{activeOpportunities.length}</span>
            <span className="text-xs text-slate-500">open projects</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{opportunities.length} total created</span>
            <Link href="/client/opportunities" className="text-brand-600 font-semibold hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 4: Responses */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            INVITATION RESPONSES
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">{totalAccepted}</span>
            <span className="text-xs text-slate-500">interested ({totalInvitations} invited)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Controlled routing</span>
            <Link href="/client/opportunities" className="text-brand-600 font-semibold hover:underline">
              Review &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Active Opportunities & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Active Project Opportunities</h2>
            <Link
              href="/client/opportunities"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              View All ({opportunities.length}) &rarr;
            </Link>
          </div>

          {activeOpportunities.length === 0 ? (
            <div className="rounded-xl bg-white border border-slate-200 p-8 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm font-bold text-slate-900">No active opportunities yet</div>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Create your first project opportunity to invite verified contractors directly.
              </p>
              <Link
                href="/client/opportunities/new"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-colors"
              >
                + Create Project Opportunity
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOpportunities.slice(0, 4).map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-xl bg-white border border-slate-200 p-5 hover:border-slate-300 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {opp.status}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-600 capitalize">
                        {opp.trade.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <Link
                      href={`/client/opportunities/${opp.id}`}
                      className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors block"
                    >
                      {opp.title}
                    </Link>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>📍 {opp.location.city}, {opp.location.state}</span>
                      <span>•</span>
                      <span>⏱️ {opp.timeframe.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:border-l sm:pl-4 sm:border-slate-100">
                    <div className="text-center sm:text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {opp.acceptedCount || 0} / {opp.invitationsCount || 0}
                      </div>
                      <div className="text-[10px] text-slate-400">Responses</div>
                    </div>
                    <Link
                      href={`/client/opportunities/${opp.id}`}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Activity Feed & Network Overview */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Recent Activity</span>
              <span className="text-[10px] font-mono font-normal text-slate-400">Live Feed</span>
            </h3>

            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent activity recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <div className="font-semibold text-slate-800">{n.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-gradient-to-br from-navy-950 to-navy-900 p-6 text-white shadow-sm space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#38bdf8]">
              DISCOVER & EXPAND
            </div>
            <h4 className="text-base font-bold">Need licensed contractors?</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Browse Avorria&apos;s verified public directory to find qualified commercial contractors across Texas and the US.
            </p>
            <Link
              href="/contractors"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-navy-950 text-xs font-bold transition-colors"
            >
              Browse Directory &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
