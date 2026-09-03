import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contractor Operating Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="max-w-6xl space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contractor Operating Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Tenant Overview • Apex Electrical Solutions LLC • Austin, TX</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/app/documents"
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
          >
            + Create Document
          </Link>
          <Link
            href="/app/passport"
            className="bg-surface-card hover:bg-surface-elevated text-slate-200 border border-surface-border text-xs font-medium px-4 py-2 rounded-md transition-colors"
          >
            Share Passport
          </Link>
        </div>
      </div>

      {/* Top Metric Cards: 5 Pillars Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Readiness Score */}
        <div className="p-5 rounded-lg bg-surface-card border border-surface-border space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contractor Readiness</div>
          <div className="text-3xl font-black text-white">92%</div>
          <div className="text-xs text-emerald-400 font-medium">Verified Evidence on File</div>
        </div>

        {/* 2. Insurance COI Status */}
        <div className="p-5 rounded-lg bg-surface-card border border-surface-border space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Insurance</div>
          <div className="text-3xl font-black text-white">$2.0M</div>
          <div className="text-xs text-emerald-400 font-medium">GL Active • Exp Dec 2026</div>
        </div>

        {/* 3. Compliance Items */}
        <div className="p-5 rounded-lg bg-surface-card border border-surface-border space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Compliance Items</div>
          <div className="text-3xl font-black text-white">14 / 15</div>
          <div className="text-xs text-amber-400 font-medium">1 Expiring in 28 Days</div>
        </div>

        {/* 4. Active Bids & Documents */}
        <div className="p-5 rounded-lg bg-surface-card border border-surface-border space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Documents</div>
          <div className="text-3xl font-black text-white">28</div>
          <div className="text-xs text-brand-400 font-medium">6 JHAs • 2 Proposals Sent</div>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Documents & Creation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Documents</h2>
              <Link href="/app/documents" className="text-xs text-brand-400 hover:text-brand-300">
                View All →
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">JHA: 480V Switchgear De-energization & Lockout</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Commercial Project #402 • Austin Tech Center</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                  Final Signed
                </span>
              </div>

              <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Site-Specific Construction Safety Plan (HASP)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Annual Company Safety Manual Q3 Revision</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800 font-medium">
                  Active
                </span>
              </div>

              <div className="p-3 rounded bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Commercial Proposal: Downtown Plaza Lighting Retrofit</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Bid Total: $84,500 • Sent to Turner Construction</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-medium">
                  Under Review
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Quick Document Generators</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <Link
                href="/app/documents?create=jha"
                className="p-3 rounded bg-surface-subtle border border-surface-border hover:border-brand-600/60 transition-colors block text-center"
              >
                <div className="text-lg mb-1">⚡</div>
                <div className="font-semibold text-white">New JHA</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Task Hazard Plan</div>
              </Link>
              <Link
                href="/app/documents?create=safety_plan"
                className="p-3 rounded bg-surface-subtle border border-surface-border hover:border-brand-600/60 transition-colors block text-center"
              >
                <div className="text-lg mb-1">📋</div>
                <div className="font-semibold text-white">Safety Plan</div>
                <div className="text-[10px] text-slate-400 mt-0.5">OSHA 1926 Aligned</div>
              </Link>
              <Link
                href="/app/quotes?create=quote"
                className="p-3 rounded bg-surface-subtle border border-surface-border hover:border-brand-600/60 transition-colors block text-center"
              >
                <div className="text-lg mb-1">💵</div>
                <div className="font-semibold text-white">New Quote</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Labor & Margin</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: Compliance Status & Alerts */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Compliance Monitor</h2>
              <Link href="/app/compliance" className="text-xs text-brand-400 hover:text-brand-300">
                View All →
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">General Liability COI</span>
                <span className="text-emerald-400 font-semibold">Current (210d)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Workers’ Compensation</span>
                <span className="text-emerald-400 font-semibold">Current (180d)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Master Electrician License</span>
                <span className="text-amber-400 font-semibold">Expiring in 28d</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Toolbox Talk (Monthly)</span>
                <span className="text-emerald-400 font-semibold">Completed (7d ago)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Supervisory OSHA 30</span>
                <span className="text-emerald-400 font-semibold">2 Active Records</span>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border">
              <Link
                href="/app/compliance"
                className="block text-center py-2 rounded bg-surface-subtle hover:bg-surface-elevated text-xs font-medium text-slate-200 border border-surface-border transition-colors"
              >
                Manage Compliance Records
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
