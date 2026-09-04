'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Opportunity,
  OpportunityInvitation,
  ClientSavedContractor,
  ContractorRelationship,
  ContractorMatchResult,
} from '@/lib/connect/types';
import { VerifiedByAvorriaBadge } from '@/components/passport/VerifiedByAvorriaBadge';

interface Props {
  opportunity: Opportunity;
  invitations: OpportunityInvitation[];
  savedContractors: ClientSavedContractor[];
  relationships: ContractorRelationship[];
  matching: {
    matches: ContractorMatchResult[];
    totalMatches: number;
    verifiedMatchesCount: number;
    summaryText: string;
  };
}

export function OpportunityManagementClient({
  opportunity,
  invitations: initialInvitations,
  matching,
}: Props) {
  const router = useRouter();
  const [invitations, setInvitations] = useState<OpportunityInvitation[]>(initialInvitations);
  const [status, setStatus] = useState(opportunity.status);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const invitedOrgIds = new Set(invitations.map((i) => i.contractor_organisation_id));

  const handleUpdateStatus = async (newStatus: 'open' | 'closed' | 'cancelled') => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/client/opportunities/${opportunity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleInvite = async (contractorOrgId: string) => {
    setInvitingId(contractorOrgId);
    try {
      const res = await fetch(`/api/client/opportunities/${opportunity.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorOrgId }),
      });
      const data = await res.json();
      if (res.ok && data.invitation) {
        setInvitations((prev) => [data.invitation, ...prev]);
        router.refresh();
      }
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
            <Link href="/client/opportunities" className="hover:text-slate-900 font-semibold">
              &larr; Back to Opportunities
            </Link>
            <span>•</span>
            <span className="font-mono uppercase text-slate-400">{opportunity.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{opportunity.title}</h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {status === 'open' ? (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus('closed')}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              Close Opportunity
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleUpdateStatus('open')}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition-colors shadow-sm"
            >
              Re-open Opportunity
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Invite Contractors</span>
          </button>
        </div>
      </div>

      {/* Opportunity Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-500">
              Project Specification
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                status === 'open'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-mono">TRADE</span>
              <span className="font-bold text-slate-800 capitalize">{opportunity.trade.replace(/-/g, ' ')}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">LOCATION</span>
              <span className="font-bold text-slate-800">{opportunity.location.city}, {opportunity.location.state}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">TIMEFRAME</span>
              <span className="font-bold text-slate-800 capitalize">{opportunity.timeframe.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">CREATED</span>
              <span className="font-bold text-slate-800">{new Date(opportunity.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-slate-400 text-xs block font-mono mb-1">SCOPE DESCRIPTION</span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              {opportunity.scope}
            </p>
          </div>

          {/* Requirements Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px] mr-1">CREDENTIALS:</span>
            {opportunity.requirements?.generalLiabilityRequired && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                ✓ General Liability COI
              </span>
            )}
            {opportunity.requirements?.tradeLicenseRequired && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                ✓ Trade Contractor License
              </span>
            )}
            {opportunity.requirements?.safetyPlanRequired && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                ✓ Site Safety Plan (HASP)
              </span>
            )}
            {opportunity.requirements?.verificationRequired && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-[11px]">
                ★ Verified by Avorria
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Matching Insights */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Matching Signals
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Deterministic
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {matching.totalMatches} <span className="text-xs font-normal text-slate-500">Matches Found</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {matching.summaryText}
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="font-semibold text-slate-700 text-[11px]">How Avorria Matches:</div>
              <div className="text-[11px]">• Matches stated trade specialization</div>
              <div className="text-[11px]">• Matches active service territory / radius</div>
              <div className="text-[11px]">• Checks published status and verified standing</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full py-2.5 rounded-xl border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors text-center"
          >
            Review & Invite Matching Contractors &rarr;
          </button>
        </div>
      </div>

      {/* Invited Contractors & Responses Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Invited Contractors ({invitations.length})
          </h2>
          <div className="text-xs text-slate-500">
            {invitations.filter((i) => i.status === 'accepted').length} Interested •{' '}
            {invitations.filter((i) => i.status === 'pending').length} Pending •{' '}
            {invitations.filter((i) => i.status === 'declined').length} Declined
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="rounded-xl bg-white border border-slate-200 p-10 text-center space-y-3">
            <div className="text-2xl">✉️</div>
            <div className="text-sm font-bold text-slate-800">No contractors invited yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Invite Contractors&quot; to choose trade partners from your saved list or matching directory contractors.
            </p>
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-colors inline-block"
            >
              Invite Contractors Now
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Contractor</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Response Message</th>
                  <th className="px-6 py-3.5">Timeline</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{inv.contractor_name}</div>
                      <div className="text-xs text-slate-500 capitalize">
                        {inv.opportunity_trade ? inv.opportunity_trade.replace(/-/g, ' ') : 'Trade Contractor'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          inv.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'declined'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status === 'accepted' ? '✓ Interested in Project' : inv.status === 'declined' ? 'Declined' : 'Pending Response'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {inv.response_message ? (
                        <span className="italic">&quot;{inv.response_message}&quot;</span>
                      ) : (
                        <span className="text-slate-400">No message provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div>Invited: {new Date(inv.invited_at).toLocaleDateString()}</div>
                      {inv.responded_at && (
                        <div className="text-[11px] text-slate-400">
                          Responded: {new Date(inv.responded_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.contractor_slug ? (
                        <Link
                          href={`/contractors/${inv.contractor_slug}`}
                          className="text-xs font-bold text-brand-600 hover:underline"
                        >
                          View Passport &rarr;
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs">Passport</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invitation Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Invite Contractors to Opportunity</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select matching commercial contractors to receive private invitations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto divide-y divide-slate-100 space-y-4">
              {matching.matches.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No matching contractors found for this trade and location in the directory yet.
                </div>
              ) : (
                matching.matches.map((c) => {
                  const alreadyInvited = invitedOrgIds.has(c.contractorId);
                  return (
                    <div
                      key={c.contractorId}
                      className="pt-4 first:pt-0 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{c.businessName}</span>
                          <VerifiedByAvorriaBadge
                            status={c.verificationStatus}
                            referenceNumber={c.verificationReference}
                            size="sm"
                          />
                        </div>
                        <div className="text-xs text-slate-500">
                          {c.trade} • {c.location}
                        </div>
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                          {c.matchReasons.map((r, i) => (
                            <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {alreadyInvited ? (
                          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold">
                            ✓ Invited
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={invitingId === c.contractorId}
                            onClick={() => handleInvite(c.contractorId)}
                            className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {invitingId === c.contractorId ? 'Sending...' : 'Invite'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
