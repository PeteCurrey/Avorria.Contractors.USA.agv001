import React from 'react';
import { VerifiedBadge } from './VerifiedBadge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export function PassportPreviewCard() {
  return (
    <div className="rounded-xl bg-surface-card border border-surface-border p-6 space-y-6 shadow-xl text-left max-w-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-brand-600 flex items-center justify-center text-white font-black text-xs">
              AE
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Apex Electrical Solutions</h3>
              <p className="text-xs text-slate-400">Austin, Texas • Commercial Electrical</p>
            </div>
          </div>
        </div>
        <VerifiedBadge size="sm" />
      </div>

      {/* Share / Verification Badge Bar */}
      <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-surface-subtle border border-surface-border text-center text-xs">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-mono">Readiness</div>
          <div className="font-black text-white text-sm mt-0.5">92%</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-mono">Insurance</div>
          <div className="font-bold text-emerald-400 text-sm mt-0.5">Verified</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-mono">Trade License</div>
          <div className="font-bold text-emerald-400 text-sm mt-0.5">Verified</div>
        </div>
      </div>

      {/* Verified Records Included */}
      <div className="space-y-2.5 text-xs text-slate-300">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Audited Pre-Qualification Credentials
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-surface-subtle/70">
          <span>Certificate of Insurance (Travelers $2M Aggregate)</span>
          <StatusIndicator status="current" label="Active" />
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-surface-subtle/70">
          <span>Texas TDLR Master Electrician License (#34891)</span>
          <StatusIndicator status="current" label="Active" />
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-surface-subtle/70">
          <span>Site-Specific Safety Program (OSHA 1926 Aligned)</span>
          <StatusIndicator status="current" label="Current" />
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-surface-subtle/70">
          <span>Supervisory OSHA 30-Hour Cards (2 Certified Leads)</span>
          <StatusIndicator status="current" label="Recorded" />
        </div>
      </div>

      {/* Footer / Sharing Action */}
      <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs">
        <span className="text-slate-500 font-mono text-[10px]">
          Sample Passport • Public Verification Link
        </span>
        <span className="text-brand-400 font-semibold cursor-pointer hover:text-brand-300">
          avorria.com/contractors/apex ↗
        </span>
      </div>
    </div>
  );
}
