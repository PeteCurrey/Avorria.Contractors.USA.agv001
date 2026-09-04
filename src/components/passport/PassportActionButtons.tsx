'use client';

import React, { useState } from 'react';
import { PublicPassportDTO } from '@/lib/passport/types';
import { useShortlist } from '@/components/shortlist/ShortlistContext';
import { EnquireModal } from './EnquireModal';

interface Props {
  contractor: PublicPassportDTO;
}

export function PassportActionButtons({ contractor }: Props) {
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectResult, setConnectResult] = useState<string | null>(null);

  const { isInShortlist, toggleShortlist } = useShortlist();
  const shortlisted = isInShortlist(contractor.slug);

  const primaryTrade = contractor.trades[0]?.name || 'Contractor';

  const handleShortlistClick = () => {
    toggleShortlist({
      slug: contractor.slug,
      businessName: contractor.businessName,
      headline: contractor.headline,
      trade: primaryTrade,
      location: contractor.primaryLocation,
      isVerified: contractor.verification.isVerified,
      verificationStatus: contractor.verification.status,
      verificationReference: contractor.verification.referenceNumber,
      readinessScore: contractor.readinessScore?.score,
      hasInsurance: Boolean(contractor.credentials.insurance),
      insuranceVerified: contractor.credentials.insurance?.verified,
      hasLicense: Boolean(contractor.credentials.license),
      licenseVerified: contractor.credentials.license?.verified,
      hasSafetyProgram: Boolean(contractor.credentials.safetyProgram),
      safetyProgramVerified: contractor.credentials.safetyProgram?.verified,
    });
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectResult(null);

    try {
      const res = await fetch('/api/client/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorSlug: contractor.slug,
          message: connectMessage || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send connection request');
      }
      setConnectResult(data.message || 'Connection request delivered to contractor.');
    } catch (err: unknown) {
      setConnectResult(err instanceof Error ? err.message : 'Error sending request');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5 flex-wrap no-print">
        {/* Direct Enquiry Button */}
        <button
          type="button"
          onClick={() => setEnquireOpen(true)}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
        >
          <span>✉️</span>
          <span>Enquire with Contractor</span>
        </button>

        {/* Connect Action Button */}
        <button
          type="button"
          onClick={() => {
            setConnectResult(null);
            setConnectOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl border border-navy-800 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
        >
          <span>🤝</span>
          <span>Connect</span>
        </button>

        {/* Shortlist Toggle */}
        <button
          type="button"
          onClick={handleShortlistClick}
          className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
            shortlisted
              ? 'bg-brand-50 border-brand-300 text-brand-700'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>{shortlisted ? '★' : '☆'}</span>
          <span>{shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
        </button>

        {/* Print Button */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>🖨️</span>
          <span>Print / PDF</span>
        </button>
      </div>

      <EnquireModal
        contractorSlug={contractor.slug}
        contractorName={contractor.businessName}
        isOpen={enquireOpen}
        onClose={() => setEnquireOpen(false)}
      />

      {/* Connect Modal */}
      {connectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Client ↔ Contractor Network
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                  Connect with {contractor.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConnectOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              Connecting adds this contractor to your Avorria network and makes future project invitations easier to manage.
            </p>

            {connectResult ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-3">
                <div>{connectResult}</div>
                <button
                  type="button"
                  onClick={() => setConnectOpen(false)}
                  className="w-full py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Introduction / Project Types (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={connectMessage}
                    onChange={(e) => setConnectMessage(e.target.value)}
                    placeholder="e.g. We manage 12 commercial office properties in Austin and are looking to connect for upcoming tenant build-outs..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConnectOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isConnecting ? 'Sending Request...' : 'Send Connection Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

