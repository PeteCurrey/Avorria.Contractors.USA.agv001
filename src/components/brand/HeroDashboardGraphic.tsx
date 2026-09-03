import React from 'react';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { VerifiedBadge } from './VerifiedBadge';

export function HeroDashboardGraphic() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Decorative subtle ambient glow behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-600/20 via-sky-500/10 to-indigo-600/20 rounded-2xl blur-xl opacity-70" />

      {/* Main Mock Workspace Container */}
      <div className="relative rounded-xl bg-surface-card border border-surface-border shadow-2xl overflow-hidden text-left">
        {/* Top Window Bar with Sample Disclaimer Notice */}
        <div className="px-4 py-3 bg-surface-subtle border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="text-[11px] font-mono text-slate-400 ml-2">
              avorria.app/workspace/overview
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-elevated text-slate-400 border border-surface-border">
            Illustrative Platform Preview
          </span>
        </div>

        {/* Dashboard Body */}
        <div className="p-6 space-y-6">
          {/* Top Profile Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
            <div>
              <div className="text-xs text-slate-400 font-mono">ACTIVE CONTRACTOR PROFILE</div>
              <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                Apex Electrical Solutions LLC
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  TX
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Commercial Electrical & Industrial Power Distribution
              </div>
            </div>
            <VerifiedBadge size="sm" />
          </div>

          {/* Core Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Readiness Gauge Card */}
            <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border flex flex-col items-center justify-center text-center">
              <ReadinessGauge score={87} size="sm" showLabel={false} />
              <div className="text-xs font-bold text-white mt-2">87% Ready</div>
              <span className="text-[10px] text-slate-400">Pre-qualification Criteria</span>
            </div>

            {/* Insurance Overview Card */}
            <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">General Liability</span>
              <div className="text-sm font-bold text-white">$2,000,000</div>
              <StatusIndicator status="current" label="Active COI on File" />
              <div className="text-[10px] text-slate-500 font-mono">Exp: Dec 31, 2026</div>
            </div>

            {/* License & OSHA Overview Card */}
            <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">Master License</span>
              <div className="text-sm font-bold text-white">TDLR #34891</div>
              <StatusIndicator status="current" label="Active Verified" />
              <div className="text-[10px] text-slate-500 font-mono">State Board Verified</div>
            </div>
          </div>

          {/* Active Requirements Live Stream */}
          <div className="space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Documented Readiness Checklist
            </div>

            <div className="p-2.5 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Site-Specific Construction Safety Plan (OSHA 1926 Aligned)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Current</span>
            </div>

            <div className="p-2.5 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Job Hazard Analysis: 480V Switchgear De-energization</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Signed</span>
            </div>

            <div className="p-2.5 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-amber-400 font-bold">⚠</span>
                <span>Toolbox Talk Attendance: Weekly Ground Fault Protection</span>
              </div>
              <span className="text-[10px] text-amber-400 font-medium">Due in 5 Days</span>
            </div>
          </div>
        </div>

        {/* Bottom Status Ticker */}
        <div className="px-6 py-3 bg-surface-subtle/80 border-t border-surface-border flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Digital Pre-qualification Pack Generated</span>
          </span>
          <span className="font-mono text-slate-400">Sample Demonstration Data</span>
        </div>
      </div>
    </div>
  );
}
