import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documents & Safety Plans',
};

export default function DocumentsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Management & Creation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate, review, and export site-specific safety plans, JHAs, JSAs, and operational records.
          </p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          + New JHA / JSA
        </button>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Document History & Provenance</h2>
          <span className="text-xs text-slate-400 font-mono">Version Control Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 font-mono">
                <th className="pb-2">Document Title</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Version</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Provenance</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-300">
              <tr>
                <td className="py-3 font-medium text-white">480V Switchgear De-energization JHA</td>
                <td className="py-3">JHA</td>
                <td className="py-3 font-mono">v2.1</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Final Signed
                  </span>
                </td>
                <td className="py-3 text-slate-400">Human Reviewed & Approved</td>
                <td className="py-3 text-brand-400 hover:underline cursor-pointer">Download PDF</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Commercial HASP Safety Program Q3</td>
                <td className="py-3">Safety Plan</td>
                <td className="py-3 font-mono">v1.0</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800">
                    Active
                  </span>
                </td>
                <td className="py-3 text-slate-400">Platform Template</td>
                <td className="py-3 text-brand-400 hover:underline cursor-pointer">Download PDF</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Scissor Lift Aerial Work JSA (Draft)</td>
                <td className="py-3">JSA</td>
                <td className="py-3 font-mono">v1.0-draft</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    AI Draft
                  </span>
                </td>
                <td className="py-3 text-amber-400">AI Generated • Awaiting Review</td>
                <td className="py-3 text-brand-400 hover:underline cursor-pointer">Review & Sign</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
