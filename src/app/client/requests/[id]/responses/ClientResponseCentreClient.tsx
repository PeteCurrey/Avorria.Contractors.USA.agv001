'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RequirementPack } from '@/lib/request/types';
import {
  ResponseCentreSummary,
  RequestInvitation,
  RequestResponse,
} from '@/lib/respond/types';

interface ClientResponseCentreClientProps {
  pack: RequirementPack;
  initialData: ResponseCentreSummary;
}

export function ClientResponseCentreClient({
  pack,
  initialData,
}: ClientResponseCentreClientProps) {
  const router = useRouter();
  const [data, setData] = useState<ResponseCentreSummary>(initialData);
  const [activeTab, setActiveTab] = useState<'responses' | 'invitations' | 'all'>('responses');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalInvited = data.invitations.length;
  const submittedResponses = data.invitations.filter((i) => i.response?.status === 'submitted');
  const activeInvitations = data.invitations.filter(
    (i) => ['sent', 'viewed', 'interested'].includes(i.invitation.status) && i.response?.status !== 'submitted'
  );
  const declinedOrClosed = data.invitations.filter(
    (i) => ['declined', 'withdrawn', 'expired'].includes(i.invitation.status)
  );

  async function handleWithdraw(invitationId: string) {
    setIsWithdrawing(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/client/invitations/${invitationId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: withdrawReason || 'Withdrawn by client' }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to withdraw invitation');
      }

      // Refresh data
      const refreshRes = await fetch(`/api/client/requests/${pack.id}/responses`);
      if (refreshRes.ok) {
        const fresh = await refreshRes.json();
        setData(fresh);
      }
      setWithdrawingId(null);
      setWithdrawReason('');
      router.refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error withdrawing invitation');
    } finally {
      setIsWithdrawing(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Total Invitations
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalInvited}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dispatched from Match Set</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">
            Responses Submitted
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {submittedResponses.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for review</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-600">
            Awaiting Response
          </span>
          <div className="text-2xl font-bold text-brand-700 mt-1">
            {activeInvitations.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Contractors reviewing</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Declined / Withdrawn
          </span>
          <div className="text-2xl font-bold text-slate-700 mt-1">
            {declinedOrClosed.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Closed opportunities</div>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
          {actionError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('responses')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'responses'
              ? 'bg-brand-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Responses Received ({submittedResponses.length})
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'invitations'
              ? 'bg-brand-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Invitations ({activeInvitations.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Activity ({totalInvited})
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'responses' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
            <span className="text-base">⚖️</span>
            <div>
              <div className="font-bold text-slate-800">Controlled Response Review</div>
              <div>
                Contractor responses represent structured confirmations against your Requirement Pack.
                Responses are shown side-by-side for factual comparison. Avorria does not rank or score responses.
              </div>
            </div>
          </div>

          {/* Compare CTA — only when 2+ responses exist */}
          {submittedResponses.length >= 2 && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-brand-900">
                  {submittedResponses.length} responses ready for comparison
                </div>
                <div className="text-xs text-brand-700 mt-0.5">
                  Open the Compare workspace to view contractor positions requirement-by-requirement with full evidence context.
                </div>
              </div>
              <Link
                href={`/client/requests/${pack.id}/compare`}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1.5"
              >
                <span>⚖️</span>
                <span>Open Compare Workspace</span>
              </Link>
            </div>
          )}

          {submittedResponses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
              <span className="text-3xl">📥</span>
              <h3 className="text-base font-bold text-slate-800 mt-2">No Submitted Responses Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                When invited contractors review your Requirement Pack and submit their structured declarations,
                their responses will appear here for comparison.
              </p>
              <div className="mt-4">
                <Link
                  href={`/client/requests/${pack.id}/matches`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>🔍</span>
                  <span>Invite Contractors from Match Set</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedResponses.map((item) => (
                <ResponseSummaryCard
                  key={item.invitation.id}
                  packId={pack.id}
                  invitation={item.invitation}
                  response={item.response!}
                  confirmedCount={item.confirmedCount}
                  cannotConfirmCount={item.cannotConfirmCount}
                  requiresClarificationCount={item.requiresClarificationCount}
                  notApplicableCount={item.notApplicableCount}
                  unansweredCount={item.unansweredCount}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="space-y-4">
          {activeInvitations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
              <span className="text-3xl">✉️</span>
              <h3 className="text-base font-bold text-slate-800 mt-2">No Active Invitations Pending</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                You do not have any pending invitations awaiting response from contractors.
              </p>
              <div className="mt-4">
                <Link
                  href={`/client/requests/${pack.id}/matches`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>🔍</span>
                  <span>Discover & Invite Contractors</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvitations.map((item) => (
                <div
                  key={item.invitation.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.invitation.contractor_name || item.invitation.contractor_id}
                      </h4>
                      <InvitationStatusBadge status={item.invitation.status} />
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Invited: {new Date(item.invitation.created_at).toLocaleDateString()}</span>
                      {item.invitation.viewed_at && (
                        <span>Viewed: {new Date(item.invitation.viewed_at).toLocaleDateString()}</span>
                      )}
                      {item.invitation.expires_at && (
                        <span>Expires: {new Date(item.invitation.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    {item.invitation.invitation_message && (
                      <p className="text-xs text-slate-600 italic mt-1">
                        "{item.invitation.invitation_message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.invitation.contractor_slug && (
                      <Link
                        href={`/contractors/${item.invitation.contractor_slug}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                      >
                        View Passport ↗
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => setWithdrawingId(item.invitation.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="space-y-3">
          {data.invitations.map((item) => (
            <div
              key={item.invitation.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.invitation.contractor_name || item.invitation.contractor_id}
                  </h4>
                  <InvitationStatusBadge status={item.invitation.status} />
                  {item.response && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Response {item.response.status}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Invited {new Date(item.invitation.created_at).toLocaleString()}
                  {item.invitation.declined_reason && (
                    <span className="text-rose-700 font-medium block mt-0.5">
                      Declined Reason: {item.invitation.declined_reason}
                    </span>
                  )}
                  {item.invitation.withdrawn_reason && (
                    <span className="text-slate-500 italic block mt-0.5">
                      Withdrawn Reason: {item.invitation.withdrawn_reason}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.response?.status === 'submitted' && (
                  <Link
                    href={`/client/requests/${pack.id}/responses/${item.response.id}`}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-2xs"
                  >
                    View Response →
                  </Link>
                )}
                {item.invitation.contractor_slug && (
                  <Link
                    href={`/contractors/${item.invitation.contractor_slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                  >
                    Passport ↗
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Withdraw Invitation</h3>
            <p className="text-xs text-slate-500">
              Withdrawing will revoke the contractor's invitation to respond. You can provide an optional explanation.
            </p>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Reason for Withdrawal (Optional)
              </label>
              <textarea
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="e.g., Requirement pack updated, scope changed, or project postponed"
                className="w-full text-xs rounded-xl border border-slate-300 p-3 h-20 resize-none focus:outline-brand-600"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawingId(null)}
                disabled={isWithdrawing}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleWithdraw(withdrawingId)}
                disabled={isWithdrawing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-2xs"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResponseSummaryCard({
  packId,
  invitation,
  response,
  confirmedCount,
  cannotConfirmCount,
  requiresClarificationCount,
  notApplicableCount,
}: {
  packId: string;
  invitation: RequestInvitation;
  response: RequestResponse;
  confirmedCount: number;
  cannotConfirmCount: number;
  requiresClarificationCount: number;
  notApplicableCount: number;
  unansweredCount: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {invitation.contractor_name || invitation.contractor_id}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Response Submitted
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
            <span>
              Submitted {response.submitted_at ? new Date(response.submitted_at).toLocaleDateString() : 'Recently'}
            </span>
            {invitation.contractor_slug && (
              <Link
                href={`/contractors/${invitation.contractor_slug}`}
                target="_blank"
                className="text-brand-600 hover:underline"
              >
                View Avorria Passport ↗
              </Link>
            )}
          </div>
        </div>

        <Link
          href={`/client/requests/${packId}/responses/${response.id}`}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 shrink-0"
        >
          <span>Inspect Full Response</span>
          <span>→</span>
        </Link>
      </div>

      {/* Availability & Proposed Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Declared Availability
          </span>
          <div className="font-bold text-slate-800 mt-0.5 capitalize">
            {response.availability_status?.replace(/_/g, ' ') || 'Not stated'}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Proposed Schedule
          </span>
          <div className="font-bold text-slate-800 mt-0.5">
            {response.proposed_start_date ? (
              <span>Start: {response.proposed_start_date}</span>
            ) : (
              <span className="text-slate-400">Date flexible</span>
            )}
            {response.proposed_completion_date && (
              <span className="text-slate-500 block text-[11px]">
                Target End: {response.proposed_completion_date}
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Requirement Alignment
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-bold text-emerald-700">{confirmedCount} Confirmed</span>
            {cannotConfirmCount > 0 && (
              <span className="font-bold text-rose-700">{cannotConfirmCount} Unconfirmed</span>
            )}
            {requiresClarificationCount > 0 && (
              <span className="font-bold text-amber-700">{requiresClarificationCount} Clarification</span>
            )}
          </div>
        </div>
      </div>

      {/* Requirement Breakdown Bar */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
          ✓ {confirmedCount} Confirmed by contractor
        </span>
        {cannotConfirmCount > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-medium">
            ✕ {cannotConfirmCount} Cannot confirm
          </span>
        )}
        {requiresClarificationCount > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            🔍 {requiresClarificationCount} Requires clarification
          </span>
        )}
        {notApplicableCount > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            — {notApplicableCount} Marked N/A
          </span>
        )}
      </div>

      {response.response_notes && (
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
          "{response.response_notes}"
        </div>
      )}
    </div>
  );
}

function InvitationStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'sent':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
          Sent
        </span>
      );
    case 'viewed':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
          Viewed
        </span>
      );
    case 'interested':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Interested
        </span>
      );
    case 'declined':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          Declined
        </span>
      );
    case 'withdrawn':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          Withdrawn
        </span>
      );
    case 'expired':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          Expired
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
          Draft
        </span>
      );
  }
}
