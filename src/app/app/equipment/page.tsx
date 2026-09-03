import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equipment & Safety Inspections',
};

export default function EquipmentPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipment & Inspection Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Log machinery, heavy equipment, daily pre-operation checklists, and mandatory inspection schedules.
          </p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          + Add Equipment
        </button>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tracked Fleet & Tools</h2>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Genie GS-1930 Scissor Lift (Electric 19ft)</div>
              <div className="text-slate-400 mt-0.5">Serial #GS1912-4029 • Last Annual Inspection: July 2026</div>
            </div>
            <span className="text-emerald-400 font-semibold">Operational</span>
          </div>
          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Greenlee 555 Electric Conduit Bender</div>
              <div className="text-slate-400 mt-0.5">Serial #CB-9941 • Monthly Safety Inspection Passed</div>
            </div>
            <span className="text-emerald-400 font-semibold">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
