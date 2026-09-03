import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliance & Insurance Tracking',
};

export default function CompliancePage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance & Insurance Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Proactive tracking of Certificates of Insurance (COI), state trade licenses, and regulatory requirements.
          </p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          + Upload COI / Document
        </button>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 rounded bg-surface-card border border-surface-border text-center">
          <div className="text-slate-400">Current</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">12</div>
        </div>
        <div className="p-3 rounded bg-surface-card border border-surface-border text-center">
          <div className="text-slate-400">Expiring Soon</div>
          <div className="text-xl font-bold text-amber-400 mt-1">1</div>
        </div>
        <div className="p-3 rounded bg-surface-card border border-surface-border text-center">
          <div className="text-slate-400">Expired</div>
          <div className="text-xl font-bold text-rose-400 mt-1">0</div>
        </div>
        <div className="p-3 rounded bg-surface-card border border-surface-border text-center">
          <div className="text-slate-400">Missing</div>
          <div className="text-xl font-bold text-slate-400 mt-1">1</div>
        </div>
        <div className="p-3 rounded bg-surface-card border border-surface-border text-center">
          <div className="text-slate-400">Not Applicable</div>
          <div className="text-xl font-bold text-slate-600 mt-1">4</div>
        </div>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Insurance Policies & COIs</h2>
        
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Commercial General Liability ($1M Occ / $2M Agg)</div>
              <div className="text-slate-400 mt-0.5">Carrier: Travelers Indemnity • Policy #GL-8942918</div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-semibold">Active</span>
              <div className="text-[10px] text-slate-400 mt-0.5">Expires Dec 31, 2026 (210 Days)</div>
            </div>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Workers’ Compensation & Employers’ Liability ($1M Limit)</div>
              <div className="text-slate-400 mt-0.5">Carrier: Texas Mutual Insurance • Policy #WC-449102</div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-semibold">Active</span>
              <div className="text-[10px] text-slate-400 mt-0.5">Expires Oct 15, 2026 (180 Days)</div>
            </div>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Texas TDLR Master Electrician Trade License</div>
              <div className="text-slate-400 mt-0.5">License #34891 • Holder: Marcus Vance</div>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-semibold">Expiring Soon</span>
              <div className="text-[10px] text-amber-400 mt-0.5">Expires in 28 Days (Renewal Pending)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
