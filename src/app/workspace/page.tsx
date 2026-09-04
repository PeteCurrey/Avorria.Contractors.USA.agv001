/**
 * AVORRIA CONTRACTOR WORKSPACE — OPERATIONS CONTROL CENTER
 *
 * Enterprise Operations Platform for US Commercial & Industrial Contractors.
 * Art-directed, high-density, restrained operational UI.
 *
 * Information Hierarchy:
 *   LEVEL 1 — Immediate Attention Queue (Urgent actions, expirations, gaps)
 *   LEVEL 2 — Operational State (Work-Ready Standing, Pipeline & Opportunities)
 *   LEVEL 3 — Compliance Posture & Expiration Watchlist
 *   LEVEL 4 — Operational Ledger (Recent Events) & Verified Identity Snapshot
 */

import React from 'react';
import Link from 'next/link';
import { getWorkspaceContext } from '@/lib/workspace/context';
import {
  getDashboardData,
  DashboardAttentionItem,
  DashboardActivity,
  DashboardOpportunity,
  ComplianceBreakdown,
  ComplianceTimelineItem,
  WorkReadyArea,
  BusinessSnapshot,
} from '@/lib/workspace/dashboard';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - entryDay.getTime()) / 86400000);

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCheckedAt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatCurrency(min?: number, max?: number): string {
  if (!min && !max) return '—';
  function fmt(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
    return `$${n}`;
  }
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return fmt(max!);
}

// ─────────────────────────────────────────────────────────────
// COMPACT OPERATIONAL COMPONENTS
// ─────────────────────────────────────────────────────────────

function OperationalStatusTag({
  status,
  variant,
}: {
  status: string;
  variant: 'emerald' | 'amber' | 'red' | 'sky' | 'slate';
}) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    sky: 'bg-sky-50 text-sky-800 border-sky-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dots = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    sky: 'bg-sky-500',
    slate: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium border rounded-[2px] tracking-tight ${variants[variant]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[variant]}`} />
      <span>{status}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// 01. OPERATIONAL HEADER & TICKER
// ─────────────────────────────────────────────────────────────

function OperationalControlHeader({
  organizationName,
  readinessScore,
  attentionCount,
  recordCount,
  expiringCount,
}: {
  organizationName: string;
  readinessScore: number;
  attentionCount: number;
  recordCount: number;
  expiringCount: number;
}) {
  const isWorkReady = readinessScore >= 80;
  const isActionNeeded = attentionCount > 0;

  return (
    <div className="space-y-3">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Operations Control Center
            </h1>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-xs font-mono text-slate-500">
              {organizationName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance posture, verified credentials, and active contract pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/workspace/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] transition-colors shadow-xs"
          >
            <span>+ Create Document</span>
          </Link>
          <Link
            href="/workspace/passport"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-[4px] transition-colors"
          >
            <span>Contractor Passport ↗</span>
          </Link>
        </div>
      </div>

      {/* Operational Ticker Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Metric 1: Readiness Standing */}
        <div className="bg-white border border-slate-200 rounded-[4px] px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Work-Ready Standing
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">
                {readinessScore}%
              </span>
              <span className={`text-[11px] font-medium ${isWorkReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isWorkReady ? 'Pre-Qualified' : 'Pending Gaps'}
              </span>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${isWorkReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>

        {/* Metric 2: Attention Items */}
        <div className={`bg-white border rounded-[4px] px-3.5 py-2.5 flex items-center justify-between ${
          isActionNeeded ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
        }`}>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Immediate Attention
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-bold font-mono ${isActionNeeded ? 'text-amber-900' : 'text-slate-900'}`}>
                {attentionCount}
              </span>
              <span className={`text-[11px] font-medium ${isActionNeeded ? 'text-amber-700' : 'text-emerald-700'}`}>
                {isActionNeeded ? (attentionCount === 1 ? 'Action Required' : 'Actions Required') : 'All Clear'}
              </span>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${isActionNeeded ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        </div>

        {/* Metric 3: Active Records */}
        <div className="bg-white border border-slate-200 rounded-[4px] px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Compliance Vault
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">
                {recordCount}
              </span>
              <span className="text-[11px] text-slate-500">
                Active Records
              </span>
            </div>
          </div>
          <Link href="/workspace/comply" className="text-[10px] font-mono text-brand-600 hover:underline">
            View →
          </Link>
        </div>

        {/* Metric 4: Expiring Watchlist */}
        <div className="bg-white border border-slate-200 rounded-[4px] px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Expiring (60d)
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-bold font-mono ${expiringCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {expiringCount}
              </span>
              <span className="text-[11px] text-slate-500">
                Credentials
              </span>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${expiringCount > 0 ? 'bg-amber-400' : 'bg-slate-300'}`} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 02. LEVEL 1 — ATTENTION DESK (URGENT OPERATIONAL ITEMS)
// ─────────────────────────────────────────────────────────────

function AttentionDesk({ items }: { items: DashboardAttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800">
              Operational Attention: All Requirements Satisfied
            </span>
            <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
              No immediate credential expirations, documentation lapses, or passport gaps found.
            </span>
          </div>
        </div>
        <Link
          href="/workspace/comply"
          className="text-xs font-mono text-slate-500 hover:text-slate-800 shrink-0"
        >
          Audit Ledger →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
            Action Required ({items.length})
          </h2>
          <span className="text-slate-400 text-xs hidden sm:inline">
            Resolve these items to maintain verified tier and owner RFP eligibility.
          </span>
        </div>
        <Link
          href="/workspace/comply"
          className="text-[11px] font-mono text-brand-600 hover:text-brand-700 font-medium"
        >
          View All Requirements →
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const isHigh = item.priority === 'HIGH';
          const isExpired = item.state === 'EXPIRED';

          return (
            <div
              key={item.id}
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`mt-0.5 text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-[2px] shrink-0 uppercase ${
                    isHigh
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {item.priority}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({item.state.replace(/_/g, ' ')})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.description || item.dueLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className={`text-[11px] font-mono ${isExpired ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                  {item.dueLabel}
                </span>
                <Link
                  href={item.href}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[3px] border transition-colors ${
                    isHigh
                      ? 'bg-red-600 hover:bg-red-700 text-white border-transparent'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  {item.action} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 03. LEVEL 2 — WORK-READY ASSESSMENT PANEL
// ─────────────────────────────────────────────────────────────

function WorkReadyPanel({
  score,
  calculatedAt,
  areas,
}: {
  score: number;
  calculatedAt: string;
  areas: WorkReadyArea[];
}) {
  const isOptimal = score >= 80;
  const isModerate = score >= 50 && score < 80;

  const scoreColor = isOptimal
    ? 'text-emerald-700'
    : isModerate
    ? 'text-amber-700'
    : 'text-red-700';

  const barColor = isOptimal
    ? 'bg-emerald-500'
    : isModerate
    ? 'bg-amber-500'
    : 'bg-red-500';

  const statusDescription = isOptimal
    ? 'Verified Contractor Standard — All core compliance thresholds satisfied for institutional procurement.'
    : isModerate
    ? 'In Progress — Essential trade licenses or insurance documents require submission.'
    : 'Action Required — Critical credentials missing or expired.';

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
            Work-Ready Standing & Verification
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Algorithmically evaluated against federal, state, and general contractor criteria.
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Audited {formatCheckedAt(calculatedAt)}
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Score & Progress Metric */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono tracking-tight ${scoreColor}`}>
                {score}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100 PTS</span>
            </div>
            <span
              className={`text-xs font-mono font-semibold tracking-wide uppercase px-2 py-0.5 rounded-[2px] ${
                isOptimal
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isOptimal ? 'Work-Ready Tier' : 'Provisional Tier'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500 rounded-full`}
              style={{ width: `${score}%` }}
            />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {statusDescription}
          </p>
        </div>

        {/* Contributing Operational Sub-Areas */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Prequalification Framework
          </div>

          <div className="grid grid-cols-2 gap-2">
            {areas.map((area) => (
              <Link
                key={area.label}
                href={area.href}
                className="group p-2.5 rounded-[3px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    {area.label}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5 group-hover:text-brand-600 transition-colors">
                    {area.status}
                  </div>
                </div>
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    area.isGood ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 04. LEVEL 2 — CONTRACT OPPORTUNITIES & BID PIPELINE
// ─────────────────────────────────────────────────────────────

function OpportunitiesTable({
  opportunities,
}: {
  opportunities: DashboardOpportunity[];
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
            Contract Opportunities & Bid Pipeline
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Projects and RFPs matched against your trade scope, service area, and passport standing.
          </p>
        </div>
        <Link
          href="/workspace/win-work"
          className="text-xs font-mono text-brand-600 hover:text-brand-700 font-medium shrink-0"
        >
          View Pipeline ({opportunities.length}) →
        </Link>
      </div>

      {opportunities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-medium">Project / Opportunity</th>
                <th className="py-2.5 px-3 font-medium">Location</th>
                <th className="py-2.5 px-3 font-medium">Trade Scope</th>
                <th className="py-2.5 px-3 font-medium">Est. Value</th>
                <th className="py-2.5 px-3 font-medium">Match</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    {opp.title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {opp.location}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {opp.trade}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-mono font-medium">
                    {formatCurrency(opp.estimatedValueMin, opp.estimatedValueMax)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-xs font-bold text-brand-700">
                      {opp.matchScore}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <OperationalStatusTag
                      status={opp.status}
                      variant={opp.status === 'MATCHED' ? 'emerald' : 'sky'}
                    />
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <Link
                      href={opp.href}
                      className="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center space-y-3 my-auto">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <div className="text-xs font-semibold text-slate-800">
              No Active Project Matches
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Commercial projects and owner requests matching your trade scope will surface here automatically as clients post opportunities.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2 text-xs">
            <Link
              href="/workspace/passport"
              className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-[3px] transition-colors"
            >
              Verify Passport Criteria
            </Link>
            <Link
              href="/workspace/win-work"
              className="px-3 py-1 bg-slate-900 text-white rounded-[3px] hover:bg-slate-800 transition-colors"
            >
              Open Win Work Desk
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 05. LEVEL 3 — COMPLIANCE POSTURE & EXPIRATION WATCHLIST
// ─────────────────────────────────────────────────────────────

function CompliancePosture({
  breakdown,
  timeline,
}: {
  breakdown: ComplianceBreakdown;
  timeline: ComplianceTimelineItem[];
}) {
  const categories = [
    { label: 'Trade Licenses', value: breakdown.licenses },
    { label: 'Commercial Insurance (COIs)', value: breakdown.insurance },
    { label: 'Safety Programs & JHA', value: breakdown.safety },
    { label: 'Workforce Certifications', value: breakdown.certifications },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
            Compliance Posture
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Audited across {breakdown.recordCount} active credentials & policies.
          </p>
        </div>
        <Link
          href="/workspace/comply"
          className="text-xs font-mono text-brand-600 hover:text-brand-700 font-medium"
        >
          Manage COIs →
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Category Breakdown Bars */}
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">{cat.label}</span>
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {cat.value}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cat.value >= 80
                      ? 'bg-emerald-500'
                      : cat.value >= 50
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${cat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 90-Day Expiration Timeline */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Upcoming Expirations (90d)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {timeline.length} Monitored
            </span>
          </div>

          {timeline.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {timeline.slice(0, 5).map((item) => {
                const isUrgent = item.daysRemaining <= 30;
                return (
                  <Link
                    key={item.credentialId}
                    href={item.href}
                    className="flex items-center justify-between p-2 rounded-[3px] border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-slate-800 truncate">
                        {item.credentialTitle}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.credentialType}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-semibold shrink-0 ${
                        item.daysRemaining <= 0
                          ? 'text-red-600'
                          : isUrgent
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.daysRemaining <= 0
                        ? 'EXPIRED'
                        : `${item.daysRemaining}d`}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-3 text-center text-xs text-slate-400 bg-slate-50/50 rounded-[3px] border border-dashed border-slate-200">
              No credentials expiring within the next 90 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 06. LEVEL 4 — OPERATIONAL TIMELINE & RECENT ACTIVITY
// ─────────────────────────────────────────────────────────────

function ActivityLedger({ activities }: { activities: DashboardActivity[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
            Operational Activity Ledger
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Immutable audit record of documents, credentials, and verification checks.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">Live</span>
      </div>

      {activities.length > 0 ? (
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {activities.slice(0, 8).map((event) => {
            const eventTags: Record<string, string> = {
              VERIFICATION: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              DOCUMENT: 'bg-blue-50 text-blue-800 border-blue-200',
              COMPLIANCE: 'bg-amber-50 text-amber-800 border-amber-200',
              SUBMISSION: 'bg-slate-100 text-slate-700 border-slate-200',
              PASSPORT: 'bg-sky-50 text-sky-800 border-sky-200',
              SYSTEM: 'bg-slate-50 text-slate-600 border-slate-200',
            };

            return (
              <div key={event.id} className="p-3 text-xs flex items-start gap-2.5 hover:bg-slate-50/60 transition-colors">
                <span
                  className={`text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded-[2px] border shrink-0 mt-0.5 ${
                    eventTags[event.eventType] || eventTags.SYSTEM
                  }`}
                >
                  {event.eventType}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="text-slate-800 font-medium leading-snug">
                    {event.description}
                  </div>
                  {event.reference && (
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      REF: {event.reference}
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-400 my-auto">
          No recent workspace activity recorded yet.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 07. LEVEL 4 — VERIFIED BUSINESS IDENTITY RECORD
// ─────────────────────────────────────────────────────────────

function BusinessIdentityMatrix({ snapshot }: { snapshot: BusinessSnapshot }) {
  function getTag(status: string) {
    if (status === 'VERIFIED' || status === 'ACTIVE') {
      return <OperationalStatusTag status={status} variant="emerald" />;
    }
    if (status === 'EXPIRED') {
      return <OperationalStatusTag status={status} variant="red" />;
    }
    return <OperationalStatusTag status={status} variant="amber" />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
            Verified Contractor Identity Record
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            US State licensing, commercial insurance standing, and public verification profile.
          </p>
        </div>
        <Link
          href="/workspace/settings"
          className="text-xs font-mono text-brand-600 hover:text-brand-700 font-medium"
        >
          Edit Business Entity →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
        {/* Cell 1: Entity Name & Legal Structure */}
        <div className="p-4 space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Entity & Structure
          </div>
          <div className="font-semibold text-slate-900 text-sm">
            {snapshot.name}
          </div>
          <div className="text-slate-500 text-[11px]">
            {snapshot.entityType || 'Commercial Contractor'}
          </div>
          {snapshot.legalName && snapshot.legalName !== snapshot.name && (
            <div className="text-[11px] font-mono text-slate-400">
              Legal: {snapshot.legalName}
            </div>
          )}
        </div>

        {/* Cell 2: Trade & Geographic Scope */}
        <div className="p-4 space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Trade & Operating Scope
          </div>
          <div className="font-medium text-slate-800">
            {snapshot.primaryTrade}
          </div>
          <div className="text-slate-500 text-[11px]">
            HQ: {[snapshot.city, snapshot.state].filter(Boolean).join(', ') || 'United States'}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            States: {snapshot.statesServed.length > 0 ? snapshot.statesServed.join(', ') : 'Single State'}
          </div>
        </div>

        {/* Cell 3: Verification Standing */}
        <div className="p-4 space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Verification Standing
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-600">License Verification</span>
            {getTag(snapshot.licenseStatus)}
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-600">Insurance (COI)</span>
            {getTag(snapshot.insuranceStatus)}
          </div>
        </div>

        {/* Cell 4: Passport Link & Sharing */}
        <div className="p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Public Contractor Passport
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${
                snapshot.passportStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-400'
              }`} />
              <span className="font-medium text-slate-900">
                {snapshot.passportStatus === 'ACTIVE' ? 'Published' : 'Draft Mode'}
              </span>
            </div>
          </div>

          {snapshot.passportSlug ? (
            <Link
              href={`/contractors/${snapshot.passportSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-[3px] transition-colors"
            >
              <span>View Public Passport</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/workspace/passport"
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[3px] transition-colors"
            >
              Configure Passport
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPOSITION
// ─────────────────────────────────────────────────────────────

export default async function WorkspaceDashboardPage() {
  const { organization } = await getWorkspaceContext();
  const data = await getDashboardData(organization);

  const expiringCount = data.complianceTimeline.filter(
    (t) => t.daysRemaining <= 60
  ).length;

  return (
    <div className="space-y-4">
      {/* 01. Operational Header & Metrics Ticker */}
      <OperationalControlHeader
        organizationName={organization.name}
        readinessScore={data.readinessScore}
        attentionCount={data.attentionItems.length}
        recordCount={data.complianceBreakdown.recordCount}
        expiringCount={expiringCount}
      />

      {/* 02. LEVEL 1 — Immediate Attention Queue */}
      <AttentionDesk items={data.attentionItems} />

      {/* 03. LEVEL 2 — Core Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Col (5 of 12 cols on desktop): Work-Ready Assessment */}
        <div className="lg:col-span-5">
          <WorkReadyPanel
            score={data.readinessScore}
            calculatedAt={data.calculatedAt}
            areas={data.workReadyAreas}
          />
        </div>

        {/* Right Col (7 of 12 cols on desktop): Opportunities & Pipeline */}
        <div className="lg:col-span-7">
          <OpportunitiesTable opportunities={data.opportunities} />
        </div>
      </div>

      {/* 04. LEVEL 3 & 4 — Compliance Posture & Activity Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Compliance Posture & Expiration Watchlist */}
        <div className="lg:col-span-6">
          <CompliancePosture
            breakdown={data.complianceBreakdown}
            timeline={data.complianceTimeline}
          />
        </div>

        {/* Right: Operational Activity Ledger */}
        <div className="lg:col-span-6">
          <ActivityLedger activities={data.recentActivity} />
        </div>
      </div>

      {/* 05. LEVEL 4 — Verified Business Identity Matrix */}
      <BusinessIdentityMatrix snapshot={data.businessSnapshot} />
    </div>
  );
}
