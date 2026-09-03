import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace Settings',
};

export default function SettingsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-2xl font-bold text-white">Workspace & Security Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Organization isolation, role-based access, and audit preferences.</p>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Tenant Organization Configuration</h2>
        <div className="space-y-3 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block">Organization ID (Tenant UUID)</span>
            <span className="font-mono text-white">e4c1945a-93be-49b8-b80c-e2f754df9201</span>
          </div>
          <div>
            <span className="text-slate-400 block">Assigned Role</span>
            <span className="text-white font-medium">Contractor Owner (Full Administrative Access)</span>
          </div>
          <div>
            <span className="text-slate-400 block">Audit Logging</span>
            <span className="text-emerald-400 font-medium">Enabled (All changes recorded to audit_logs)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
