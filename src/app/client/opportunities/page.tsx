import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getClientContext } from '@/lib/connect/context';
import { getClientOpportunities } from '@/lib/connect/repository';

export const metadata: Metadata = {
  title: 'Project Opportunities',
};

export default async function ClientOpportunitiesListPage() {
  const client = await getClientContext();
  const opportunities = await getClientOpportunities(client.organisationId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Opportunities</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Create private requirements and invite selected verified trade contractors to consider them.
          </p>
        </div>

        <Link
          href="/client/opportunities/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <span>+</span>
          <span>Create New Opportunity</span>
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <div className="rounded-xl bg-white border border-slate-200 p-12 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-base font-bold text-slate-900">No opportunities created yet</div>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Opportunities are private requirements shared exclusively with the contractors you choose to invite.
          </p>
          <Link
            href="/client/opportunities/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-colors"
          >
            + Create First Opportunity
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Opportunity</th>
                  <th className="px-6 py-3.5">Trade</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Timeframe</th>
                  <th className="px-6 py-3.5">Responses</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/client/opportunities/${opp.id}`}
                        className="font-bold text-slate-900 hover:text-brand-600 transition-colors block"
                      >
                        {opp.title}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        Created {new Date(opp.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 capitalize">
                      {opp.trade.replace(/-/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {opp.location.city}, {opp.location.state}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 capitalize">
                      {opp.timeframe.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-900">
                        <span className="text-emerald-600">{opp.acceptedCount || 0} interested</span>
                        <span className="text-slate-400 font-normal"> / {opp.invitationsCount || 0} invited</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          opp.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : opp.status === 'closed'
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/client/opportunities/${opp.id}`}
                        className="text-xs font-bold text-brand-600 hover:underline"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
