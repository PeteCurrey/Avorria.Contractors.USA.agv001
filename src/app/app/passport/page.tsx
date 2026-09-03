import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contractor Passport Management',
};

export default function PassportPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Contractor Passport & Credibility Profile</h1>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated digital credential record demonstrating verified insurance, licensing, and safety programs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contractors/apex-electrical-solutions"
            target="_blank"
            className="bg-surface-card hover:bg-surface-elevated text-slate-200 border border-surface-border text-xs font-medium px-4 py-2 rounded-md transition-colors"
          >
            Preview Public View ↗
          </Link>
          <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
            Generate Share Link
          </button>
        </div>
      </div>

      <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono">PASSPORT STATUS</span>
            <div className="text-xl font-bold text-white flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Verified & Published
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono">READINESS SCORE</span>
            <div className="text-2xl font-black text-emerald-400">95% Ready</div>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded bg-surface-subtle border border-surface-border space-y-2">
            <div className="text-slate-400 font-semibold uppercase tracking-wider">Visibility Settings</div>
            <p className="text-slate-300 leading-relaxed">
              Profile is currently <strong>Published</strong> and visible to commercial clients. Public search indexing is active based on verified credentials.
            </p>
          </div>
          <div className="p-4 rounded bg-surface-subtle border border-surface-border space-y-2">
            <div className="text-slate-400 font-semibold uppercase tracking-wider">Verified Evidence Included</div>
            <ul className="text-slate-300 space-y-1">
              <li>✓ Travelers General Liability COI ($2M)</li>
              <li>✓ Texas TDLR Master Electrician License #34891</li>
              <li>✓ Site Specific Safety Plan (OSHA 1926 Aligned)</li>
              <li>✓ 2 OSHA 30 Verified Crew Leaders</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
