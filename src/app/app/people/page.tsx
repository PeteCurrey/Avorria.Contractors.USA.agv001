import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workforce & OSHA Training',
};

export default function PeoplePage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Workforce & Safety Training Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track employee qualifications, OSHA 10/30 cards, trade certifications, and toolbox talk attendance.
          </p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          + Add Employee / Record
        </button>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Supervisory Personnel & Safety Credentials</h2>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Marcus Vance (Master Electrician & Site Safety Lead)</div>
              <div className="text-slate-400 mt-0.5">OSHA 30-Hour Construction Card • NFPA 70E Arc Flash Certified</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              Verified
            </span>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Carlos Gomez (Journeyman Electrician)</div>
              <div className="text-slate-400 mt-0.5">OSHA 10-Hour Construction Card • First Aid / CPR</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
