import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quotes & Estimates',
};

export default function QuotesPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quotes & Estimates Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build accurate trade estimates with labor burden, overhead markups, and margin protection.
          </p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          + Create Quote
        </button>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Contractor Estimates</h2>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Estimate #Q-2026-104: Main Service Upgrade (1200A 480V)</div>
              <div className="text-slate-400 mt-0.5">Client: Endeavor Real Estate • Total: $148,900.00</div>
            </div>
            <span className="text-brand-400 font-semibold">Ready to Send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
