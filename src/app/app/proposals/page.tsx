import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commercial Proposals & Bids',
};

export default function ProposalsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Proposals & Pre-qualification Packs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Assemble client proposals bundled with your verified Contractor Passport, active COI, and safety plans.
          </p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          + New Proposal Pack
        </button>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Submitted Commercial Bids</h2>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Bid Package #P-2026-08: Downtown Austin Plaza Electrical Tender</div>
              <div className="text-slate-400 mt-0.5">General Contractor: DPR Construction • Value: $310,000.00</div>
            </div>
            <span className="text-amber-400 font-semibold">Under Evaluation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
