import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verification Center',
};

export default function VerificationPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-2xl font-bold text-white">Evidence-Based Verification Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit official documents for platform verification to unlock trust badges and public passport sharing.
        </p>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Verification Audits</h2>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Business Entity & Federal Tax ID (EIN)</div>
              <div className="text-slate-400 mt-0.5">Method: State Secretary of State registry cross-reference</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
              Verified
            </span>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Certificate of Insurance (General Liability)</div>
              <div className="text-slate-400 mt-0.5">Method: Document inspection & broker policy verification</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
              Verified
            </span>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Texas State Trade License (TDLR)</div>
              <div className="text-slate-400 mt-0.5">Method: TDLR public database query • Expiration: 28 Days</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
