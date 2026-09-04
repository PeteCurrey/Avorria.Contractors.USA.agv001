'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { OpportunityInvitation } from '@/lib/connect/types';

export default function ContractorOpportunitiesPage() {
  const [invitations, setInvitations] = useState<OpportunityInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalInvitation, setActiveModalInvitation] = useState<OpportunityInvitation | null>(null);
  const [responseDecision, setResponseDecision] = useState<'accepted' | 'declined'>('accepted');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/contractor/opportunities');
      const data = await res.json();
      if (res.ok && data.invitations) {
        setInvitations(data.invitations);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleOpenModal = (inv: OpportunityInvitation, decision: 'accepted' | 'declined') => {
    setActiveModalInvitation(inv);
    setResponseDecision(decision);
    setResponseMessage('');
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalInvitation) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/contractor/opportunities/${activeModalInvitation.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: responseDecision,
          message: responseMessage,
        }),
      });
      if (res.ok) {
        setActiveModalInvitation(null);
        await fetchInvitations();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pending = invitations.filter((i) => i.status === 'pending');
  const accepted = invitations.filter((i) => i.status === 'accepted');
  const declined = invitations.filter((i) => i.status === 'declined');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
            <Link href="/app/dashboard" className="hover:text-slate-900 font-semibold">
              &larr; Contractor Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Project Opportunities & Invitations</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review private requirements sent directly to your contracting business by commercial clients.
          </p>
        </div>

        <Link
          href="/contractor/relationships"
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm shrink-0"
        >
          Manage Client Network &rarr;
        </Link>
      </div>

      {/* New Invitations Requiring Response */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>New Invitations</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
            {pending.length} New
          </span>
        </h2>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading invitations...</div>
        ) : pending.length === 0 ? (
          <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500">
            No pending opportunity invitations. Make sure your business profile and verification credentials are up to date in the directory.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                      Private Invitation
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700">{inv.client_name}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{inv.opportunity_title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    {inv.opportunity_location && (
                      <span>📍 {inv.opportunity_location.city}, {inv.opportunity_location.state}</span>
                    )}
                    <span>•</span>
                    <span>Received {new Date(inv.invited_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(inv, 'declined')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenModal(inv, 'accepted')}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Express Interest
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active (Accepted) Opportunities */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Active Opportunities ({accepted.length})</span>
        </h2>

        {accepted.length === 0 ? (
          <div className="rounded-xl bg-white border border-slate-200 p-6 text-center text-xs text-slate-400">
            No active opportunities in progress.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accepted.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl bg-white border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Interest Expressed
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {inv.responded_at ? new Date(inv.responded_at).toLocaleDateString() : ''}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{inv.opportunity_title}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">Client: {inv.client_name}</div>
                </div>
                {inv.response_message && (
                  <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-emerald-100">
                    Your note: &quot;{inv.response_message}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Declined Opportunities */}
      {declined.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Declined Invitations ({declined.length})
          </h3>
          <div className="space-y-2">
            {declined.map((inv) => (
              <div key={inv.id} className="text-xs text-slate-400 flex items-center justify-between">
                <span>{inv.opportunity_title} ({inv.client_name})</span>
                <span>Declined</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Modal */}
      {activeModalInvitation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 inline-block mb-1.5">
                {responseDecision === 'accepted' ? 'Confirm Interest' : 'Decline Opportunity'}
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeModalInvitation.opportunity_title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Client: {activeModalInvitation.client_name}
              </p>
            </div>

            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Note to Client
                </label>
                <textarea
                  rows={4}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={
                    responseDecision === 'accepted'
                      ? 'e.g. We have available capacity in Q4 and our master electricians are licensed for this scope...'
                      : 'e.g. Thank you for considering us. We currently lack capacity for this timeframe...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModalInvitation(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm ${
                    responseDecision === 'accepted'
                      ? 'bg-brand-600 hover:bg-brand-500'
                      : 'bg-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : responseDecision === 'accepted'
                    ? 'Submit Interest'
                    : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
