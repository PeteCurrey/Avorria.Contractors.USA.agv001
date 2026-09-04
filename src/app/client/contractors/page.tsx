import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getClientContext } from '@/lib/connect/context';
import { getSavedContractors, getClientRelationships } from '@/lib/connect/repository';
import { getAllPublishedContractors } from '@/lib/tenant/repository';
import { evaluateContractorVerification } from '@/lib/verification/engine';
import { VerifiedByAvorriaBadge } from '@/components/passport/VerifiedByAvorriaBadge';

export const metadata: Metadata = {
  title: 'My Contractors',
};

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ClientContractorsPage({ searchParams }: Props) {
  const { tab = 'connected' } = await searchParams;
  const client = await getClientContext();

  const [saved, relationships, published] = await Promise.all([
    getSavedContractors(client.organisationId),
    getClientRelationships(client.organisationId),
    getAllPublishedContractors(),
  ]);

  // Build lookup map for published contractor data
  const contractorMap = new Map();
  for (const ws of published) {
    const ver = evaluateContractorVerification(ws, ws.verificationRecords || []);
    contractorMap.set(ws.organisation.id, {
      ...ws,
      verification: ver,
    });
  }

  const connectedList = relationships.filter((r) => r.status === 'connected');
  const pendingList = relationships.filter((r) => r.status === 'pending');
  const archivedList = relationships.filter((r) => r.status === 'archived');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contractor Network</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage your connected commercial trade partners, bookmarked contractors, and relationship requests.
          </p>
        </div>

        <Link
          href="/contractors"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <span>🔍</span>
          <span>Find More Contractors</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Link
          href="/client/contractors?tab=connected"
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'connected'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Connected ({connectedList.length})
        </Link>
        <Link
          href="/client/contractors?tab=pending"
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'pending'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Requests ({pendingList.length})
        </Link>
        <Link
          href="/client/contractors?tab=saved"
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'saved'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Saved Bookmarks ({saved.length})
        </Link>
        <Link
          href="/client/contractors?tab=archived"
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'archived'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Archived ({archivedList.length})
        </Link>
      </div>

      {/* Tab Content: Connected */}
      {tab === 'connected' && (
        <div className="space-y-4">
          {connectedList.length === 0 ? (
            <div className="rounded-xl bg-white border border-slate-200 p-12 text-center">
              <div className="text-3xl mb-2">🤝</div>
              <div className="text-sm font-bold text-slate-900">No connected contractors yet</div>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Discover licensed contractors in the Avorria directory and request connection to add them to your operational network.
              </p>
              <Link
                href="/contractors"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-colors"
              >
                Browse Directory &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedList.map((rel) => {
                const contractor = contractorMap.get(rel.contractor_organisation_id);
                return (
                  <div
                    key={rel.id}
                    className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-bold text-slate-900">
                            {rel.contractor_name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {contractor ? contractor.trades.join(', ') : 'Commercial Contractor'}
                          </div>
                        </div>

                        {contractor && (
                          <VerifiedByAvorriaBadge
                            status={contractor.verification.aggregateStatus}
                            referenceNumber={contractor.verification.verificationReference}
                            size="sm"
                          />
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <span>Connected since: {rel.connected_at ? new Date(rel.connected_at).toLocaleDateString() : 'Active'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={rel.contractor_slug ? `/contractors/${rel.contractor_slug}` : '#'}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        View Passport &rarr;
                      </Link>

                      <Link
                        href={`/client/opportunities/new?contractorId=${rel.contractor_organisation_id}`}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                      >
                        + Create Opportunity
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Pending */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {pendingList.length === 0 ? (
            <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
              No pending connection requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingList.map((rel) => (
                <div
                  key={rel.id}
                  className="rounded-xl bg-white border border-amber-200 bg-amber-50/20 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-base font-bold text-slate-900">{rel.contractor_name}</div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                      Pending Contractor Acceptance
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    &quot;{rel.message || 'Connection request pending response from contractor.'}&quot;
                  </p>
                  <div className="text-[10px] text-slate-400">
                    Requested on {new Date(rel.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Saved */}
      {tab === 'saved' && (
        <div className="space-y-4">
          {saved.length === 0 ? (
            <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
              No saved contractors yet. Use the star icon on any contractor card in the directory to bookmark them.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {saved.map((s) => {
                const contractor = contractorMap.get(s.contractor_organisation_id);
                return (
                  <div
                    key={s.id}
                    className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-bold text-slate-900">
                            {s.contractor_name || 'Contractor'}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {s.trade ? s.trade.replace(/-/g, ' ') : 'Commercial Trade'}
                          </div>
                        </div>

                        {contractor && (
                          <VerifiedByAvorriaBadge
                            status={contractor.verification.aggregateStatus}
                            referenceNumber={contractor.verification.verificationReference}
                            size="sm"
                          />
                        )}
                      </div>

                      <div className="mt-2 text-xs text-slate-500">
                        📍 {s.location || 'Texas'}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/contractors/${s.contractor_slug}`}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        View Passport &rarr;
                      </Link>

                      <Link
                        href={`/client/opportunities/new?contractorId=${s.contractor_organisation_id}`}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                      >
                        Invite to Opportunity
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Archived */}
      {tab === 'archived' && (
        <div className="space-y-4">
          {archivedList.length === 0 ? (
            <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
              No archived contractor relationships.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archivedList.map((rel) => (
                <div key={rel.id} className="rounded-xl bg-white border border-slate-200 p-5 opacity-75">
                  <div className="font-bold text-slate-800">{rel.contractor_name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Archived on {rel.archived_at ? new Date(rel.archived_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
