/**
 * AVORRIA CONTRACTOR WORKSPACE — DASHBOARD
 *
 * Six sections answering the contractor's four core questions:
 *   01. WORK-READY STATUS   — Is my business ready?
 *   02. YOUR ATTENTION      — What requires my attention?
 *   03. WIN WORK            — What opportunities can I pursue?
 *   04. COMPLIANCE POSITION — What is my compliance standing?
 *   05. RECENT ACTIVITY     — Operational ledger
 *   06. BUSINESS SNAPSHOT   — Verified identity record
 */

import React from 'react';
import Link from 'next/link';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getDashboardData, DashboardAttentionItem, DashboardActivity } from '@/lib/workspace/dashboard';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (entryDay.getTime() === today.getTime()) return time;
  if (entryDay.getTime() === yesterday.getTime()) return `Yesterday ${time}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
}

function formatCheckedAt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  if (entryDay.getTime() === today.getTime()) return `Today, ${time}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + time;
}

function formatCurrency(min?: number, max?: number): string {
  if (!min && !max) return '—';
  function fmt(n: number) {
    if (n >= 1_000_000) return `\$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `\$${Math.round(n / 1_000)}k`;
    return `\$${n}`;
  }
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return fmt(max!);
}

// ─────────────────────────────────────────────────────────────
// SECTION COMPONENTS
// ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-mono font-bold tracking-[0.18em] text-slate-400 uppercase mb-0.5">
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-mono font-bold tracking-[0.08em] text-slate-800 uppercase">
      {children}
    </h2>
  );
}

function SectionSubtext({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 mt-0.5">{children}</p>;
}

function StatusBadge({
  status,
  variant,
}: {
  status: string;
  variant: 'green' | 'amber' | 'red' | 'blue' | 'slate';
}) {
  const variants = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-[0.1em] border ${variants[variant]}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const map = {
    HIGH: 'bg-red-600 text-white',
    MEDIUM: 'bg-amber-500 text-white',
    LOW: 'bg-slate-400 text-white',
  };
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-[0.1em] ${map[priority]} shrink-0`}
    >
      {priority}
    </span>
  );
}

function ActionButton({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-block px-3 py-1 text-[10px] font-mono font-bold tracking-[0.08em] border border-brand-600 text-brand-700 hover:bg-brand-600 hover:text-white transition-colors"
    >
      {label}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 01 — WORK-READY STATUS
// ─────────────────────────────────────────────────────────────

type WorkReadyArea = {
  label: string;
  status: string;
  isGood: boolean;
  href: string;
};

function WorkReadySection({
  score,
  calculatedAt,
  areas,
}: {
  score: number;
  calculatedAt: string;
  areas: WorkReadyArea[];
}) {
  const scoreLabel = score >= 80 ? 'WORK-READY' : score >= 50 ? 'IN PROGRESS' : 'ATTENTION REQUIRED';
  const scoreColor =
    score >= 80 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-red-700';
  const barColor =
    score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="bg-white border border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Score column */}
        <div className="lg:col-span-4 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
          <SectionLabel>SECTION 01</SectionLabel>
          <SectionHeading>WORK-READY STATUS</SectionHeading>

          <div className="mt-5 space-y-1">
            <div className={`font-mono text-5xl font-bold tracking-tight ${scoreColor}`}>
              {score}
              <span className="text-2xl text-slate-300 ml-0.5">/100</span>
            </div>
            <div className={`text-[10px] font-mono font-bold tracking-[0.15em] ${scoreColor}`}>
              {scoreLabel}
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-4 w-full bg-slate-100 h-1">
            <div
              className={`${barColor} h-full transition-all duration-700`}
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="mt-4 text-[10px] font-mono text-slate-400">
            Last checked: {formatCheckedAt(calculatedAt)}
          </div>
        </div>

        {/* Sub-areas column */}
        <div className="lg:col-span-8 p-6 sm:p-8">
          <div className="text-[10px] font-mono font-bold tracking-[0.12em] text-slate-400 mb-4">
            CONTRIBUTING AREAS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {areas.map((area) => (
              <Link
                key={area.label}
                href={area.href}
                className="group block p-4 border border-slate-100 hover:border-slate-300 transition-colors"
              >
                <div className="text-[9px] font-mono font-bold tracking-[0.15em] text-slate-400 mb-2">
                  {area.label.toUpperCase()}
                </div>
                <div
                  className={`text-sm font-mono font-bold ${
                    area.isGood ? 'text-emerald-600' : 'text-slate-400'
                  } group-hover:text-slate-800 transition-colors`}
                >
                  {area.status}
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block w-1.5 h-1.5 ${
                      area.isGood ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-5 text-[11px] text-slate-400 leading-relaxed">
            Score calculated server-side from active insurance coverage, trade licensing, safety
            documentation, and Contractor Passport completeness. Click any area to review the
            underlying records.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 02 — YOUR ATTENTION
// ─────────────────────────────────────────────────────────────

function AttentionSection({ items }: { items: DashboardAttentionItem[] }) {
  const actionLabel: Record<string, string> = {
    RENEW: 'RENEW',
    COMPLETE: 'COMPLETE',
    REVIEW: 'REVIEW',
    UPLOAD: 'UPLOAD',
    PUBLISH: 'PUBLISH',
  };

  return (
    <div className="bg-white border border-slate-200">
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <SectionLabel>SECTION 02</SectionLabel>
          <SectionHeading>YOUR ATTENTION</SectionHeading>
          {items.length > 0 ? (
            <SectionSubtext>
              {items.length === 1
                ? 'One item needs your attention.'
                : `${
                    items.length === 2
                      ? 'Two'
                      : items.length === 3
                      ? 'Three'
                      : items.length === 4
                      ? 'Four'
                      : items.length === 5
                      ? 'Five'
                      : items.length
                  } items need your attention.`}
            </SectionSubtext>
          ) : (
            <SectionSubtext>You are clear. Nothing requires your attention.</SectionSubtext>
          )}
        </div>
        <Link
          href="/workspace/comply"
          className="text-[10px] font-mono text-brand-600 hover:underline shrink-0"
        >
          VIEW COMPLY →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 border border-emerald-200 bg-emerald-50 mb-4">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-sm font-mono font-bold text-slate-700">ALL CLEAR</div>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You are clear. Nothing requires your attention right now. Keep your credentials current
            to maintain your readiness score.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-6 sm:px-8 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              <PriorityBadge priority={item.priority} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-slate-800">{item.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">{item.dueLabel}</div>
              </div>
              <div className="hidden md:block shrink-0">
                <StatusBadge
                  status={item.state}
                  variant={
                    item.state === 'EXPIRED'
                      ? 'red'
                      : item.state === 'EXPIRING SOON'
                      ? 'red'
                      : item.state === 'MISSING'
                      ? 'amber'
                      : item.state === 'DRAFT'
                      ? 'slate'
                      : 'slate'
                  }
                />
              </div>
              <ActionButton label={actionLabel[item.action] ?? item.action} href={item.href} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 03 — WIN WORK (STUB)
// ─────────────────────────────────────────────────────────────

type DashboardOpportunity = {
  id: string;
  title: string;
  location: string;
  trade: string;
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  matchScore: number;
  status: string;
  href: string;
};

function WinWorkSection({
  opportunities,
  matchedCount,
  awaitingCount,
}: {
  opportunities: DashboardOpportunity[];
  matchedCount: number;
  awaitingCount: number;
}) {
  return (
    <div className="bg-white border border-slate-200">
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <SectionLabel>SECTION 03</SectionLabel>
          <SectionHeading>WIN WORK</SectionHeading>
          {opportunities.length > 0 ? (
            <SectionSubtext>Opportunities relevant to your business.</SectionSubtext>
          ) : (
            <SectionSubtext>Your profile is ready. Opportunities will surface as they become available.</SectionSubtext>
          )}
        </div>
        <Link
          href="/workspace/win-work"
          className="text-[10px] font-mono text-brand-600 hover:underline shrink-0"
        >
          VIEW ALL →
        </Link>
      </div>

      {opportunities.length > 0 ? (
        <>
          {/* Metrics bar */}
          <div className="px-6 sm:px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-6">
            <div className="text-[11px] font-mono text-slate-600">
              <span className="font-bold text-slate-800">{matchedCount}</span> matched opportunities
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="text-[11px] font-mono text-slate-600">
              <span className="font-bold text-amber-600">{awaitingCount}</span> responses awaiting review
            </div>
          </div>

          {/* Opportunity table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  {['OPPORTUNITY', 'LOCATION', 'TRADE', 'EST. VALUE', 'MATCH', 'STATUS', ''].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 sm:px-6 py-3 text-left text-[9px] font-mono font-bold tracking-[0.12em] text-slate-400"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 font-medium text-slate-800">{opp.title}</td>
                    <td className="px-4 sm:px-6 py-3 font-mono text-slate-500">{opp.location}</td>
                    <td className="px-4 sm:px-6 py-3 font-mono text-slate-500">{opp.trade}</td>
                    <td className="px-4 sm:px-6 py-3 font-mono text-slate-600">
                      {formatCurrency(opp.estimatedValueMin, opp.estimatedValueMax)}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className="font-mono font-bold text-brand-700">{opp.matchScore}%</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <StatusBadge status={opp.status} variant="blue" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <ActionButton label="VIEW" href={opp.href} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="px-8 py-10 text-center">
          <div className="text-[11px] font-mono font-bold text-slate-600 mb-2">
            NO ACTIVE OPPORTUNITIES
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your profile is ready. Avorria will surface relevant opportunities as they become
            available. Keep your credentials and passport current to maximise your match quality.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/workspace/settings"
              className="inline-block px-4 py-2 text-[10px] font-mono font-bold tracking-[0.08em] border border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
            >
              REVIEW BUSINESS PROFILE
            </Link>
            <Link
              href="/workspace/prove"
              className="inline-block px-4 py-2 text-[10px] font-mono font-bold tracking-[0.08em] border border-brand-600 text-brand-700 hover:bg-brand-600 hover:text-white transition-colors"
            >
              UPDATE PASSPORT
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 04 — COMPLIANCE POSITION
// ─────────────────────────────────────────────────────────────

type ComplianceBreakdown = {
  overall: number;
  licenses: number;
  insurance: number;
  safety: number;
  certifications: number;
  recordCount: number;
};

type ComplianceTimelineItem = {
  credentialId: string;
  credentialTitle: string;
  credentialType: string;
  expirationDate: string;
  bucket: string;
  daysRemaining: number;
  href: string;
};

function ComplianceBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 90 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-400' : 'bg-red-500';
  const textColor =
    value >= 90 ? 'text-emerald-700' : value >= 60 ? 'text-amber-700' : 'text-red-700';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold tracking-[0.1em] text-slate-500">
          {label}
        </span>
        <span className={`text-[11px] font-mono font-bold ${textColor}`}>{value}%</span>
      </div>
      <div className="w-full bg-slate-100 h-0.5">
        <div
          className={`${color} h-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const TIMELINE_LABELS: Record<string, string> = {
  TODAY: 'TODAY',
  '14_DAYS': '14 DAYS',
  '30_DAYS': '30 DAYS',
  '60_DAYS': '60 DAYS',
  '90_DAYS': '90 DAYS',
  CURRENT: 'CURRENT',
};

function ComplianceSection({
  breakdown,
  timeline,
}: {
  breakdown: ComplianceBreakdown;
  timeline: ComplianceTimelineItem[];
}) {
  const overallColor =
    breakdown.overall >= 80
      ? 'text-emerald-700'
      : breakdown.overall >= 50
      ? 'text-amber-700'
      : 'text-red-700';

  return (
    <div className="bg-white border border-slate-200">
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <SectionLabel>SECTION 04</SectionLabel>
          <SectionHeading>COMPLIANCE POSITION</SectionHeading>
          <SectionSubtext>
            Based on {breakdown.recordCount} active{' '}
            {breakdown.recordCount === 1 ? 'record' : 'records'}.
          </SectionSubtext>
        </div>
        <Link href="/workspace/comply" className="text-[10px] font-mono text-brand-600 hover:underline shrink-0">
          OPEN COMPLY →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: breakdown */}
        <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 space-y-6">
          <div className="flex items-baseline gap-3">
            <span className={`font-mono text-4xl font-bold tracking-tight ${overallColor}`}>
              {breakdown.overall}%
            </span>
            <span className="text-[10px] font-mono font-bold tracking-[0.12em] text-slate-400">
              READY
            </span>
          </div>

          <div className="space-y-4">
            <ComplianceBar label="LICENSES" value={breakdown.licenses} />
            <ComplianceBar label="INSURANCE" value={breakdown.insurance} />
            <ComplianceBar label="SAFETY" value={breakdown.safety} />
            <ComplianceBar label="CERTIFICATIONS" value={breakdown.certifications} />
          </div>
        </div>

        {/* Right: expiry timeline */}
        <div className="p-6 sm:p-8">
          <div className="text-[10px] font-mono font-bold tracking-[0.12em] text-slate-400 mb-4">
            EXPIRATION TIMELINE
          </div>

          {timeline.length === 0 ? (
            <div className="py-6 text-center">
              <div className="text-[11px] font-mono font-bold text-emerald-700 mb-1">ALL CLEAR</div>
              <p className="text-[11px] text-slate-400">
                No credentials expiring within 90 days.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Bucket headers */}
              {['TODAY', '14_DAYS', '30_DAYS', '60_DAYS', '90_DAYS'].map((bucket) => {
                const items = timeline.filter((t) => t.bucket === bucket);
                if (items.length === 0) return null;
                const bucketColor: Record<string, string> = {
                  TODAY: 'text-red-700 border-red-300 bg-red-50',
                  '14_DAYS': 'text-red-600 border-red-200 bg-red-50',
                  '30_DAYS': 'text-amber-700 border-amber-200 bg-amber-50',
                  '60_DAYS': 'text-amber-600 border-amber-100 bg-amber-50',
                  '90_DAYS': 'text-slate-600 border-slate-200 bg-slate-50',
                };
                return (
                  <div key={bucket}>
                    <div
                      className={`text-[9px] font-mono font-bold tracking-[0.12em] px-2 py-0.5 border inline-block mb-1.5 ${bucketColor[bucket]}`}
                    >
                      {TIMELINE_LABELS[bucket]}
                    </div>
                    {items.map((item) => (
                      <Link
                        key={item.credentialId}
                        href={item.href}
                        className="flex items-center justify-between py-1.5 px-3 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors mb-1 group"
                      >
                        <span className="text-[11px] text-slate-700 truncate group-hover:text-slate-900">
                          {item.credentialTitle}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                          {item.daysRemaining <= 0
                            ? 'EXPIRED'
                            : `${item.daysRemaining}d`}
                        </span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 05 — RECENT ACTIVITY
// ─────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<string, string> = {
  VERIFICATION: 'VERIFICATION',
  DOCUMENT: 'DOCUMENT',
  COMPLIANCE: 'COMPLIANCE',
  SUBMISSION: 'SUBMISSION',
  PASSPORT: 'PASSPORT',
  SYSTEM: 'SYSTEM',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  VERIFICATION: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  DOCUMENT: 'text-brand-700 bg-blue-50 border-blue-200',
  COMPLIANCE: 'text-amber-700 bg-amber-50 border-amber-200',
  SUBMISSION: 'text-slate-700 bg-slate-100 border-slate-200',
  PASSPORT: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  SYSTEM: 'text-slate-500 bg-slate-50 border-slate-200',
};

function ActivitySection({ activities }: { activities: DashboardActivity[] }) {
  return (
    <div className="bg-white border border-slate-200">
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100">
        <SectionLabel>SECTION 05</SectionLabel>
        <SectionHeading>ACTIVITY</SectionHeading>
        <SectionSubtext>Operational ledger — chronological record of workspace events.</SectionSubtext>
      </div>

      {activities.length === 0 ? (
        <div className="px-8 py-10 text-center">
          <div className="text-[11px] font-mono font-bold text-slate-500 mb-1">
            NO ACTIVITY RECORDED
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Workspace events will appear here as you add credentials, documents, and records.
          </p>
        </div>
      ) : (
        <div className="px-6 sm:px-8 py-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-slate-100" aria-hidden="true" />

            <div className="space-y-0">
              {activities.map((event, i) => (
                <div key={event.id} className="flex gap-4 py-2.5 relative">
                  {/* Timestamp */}
                  <div className="w-[72px] shrink-0 text-right">
                    <span className="text-[10px] font-mono text-slate-400 leading-tight block">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>

                  {/* Dot */}
                  <div className="flex items-start pt-1 shrink-0 relative z-10">
                    <div className="w-1.5 h-1.5 border border-slate-300 bg-white -ml-[3px]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-1 py-0 text-[9px] font-mono font-bold tracking-[0.08em] border ${
                          EVENT_TYPE_COLORS[event.eventType] ?? 'text-slate-500 bg-slate-50 border-slate-200'
                        }`}
                      >
                        {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                      </span>
                      {event.reference && (
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          {event.reference}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-slate-700 mt-0.5 leading-snug">
                      {event.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 06 — BUSINESS SNAPSHOT
// ─────────────────────────────────────────────────────────────

type BusinessSnapshot = {
  name: string;
  legalName?: string;
  primaryTrade: string;
  city?: string;
  state?: string;
  statesServed: string[];
  licenseStatus: string;
  insuranceStatus: string;
  passportStatus: string;
  passportSlug?: string;
  entityType?: string;
};

function SnapshotRow({ label, value, variant }: { label: string; value: string; variant?: 'green' | 'amber' | 'red' | 'slate' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[10px] font-mono font-bold tracking-[0.1em] text-slate-400">{label}</span>
      {variant ? (
        <StatusBadge status={value} variant={variant} />
      ) : (
        <span className="text-[12px] font-semibold text-slate-800">{value || '—'}</span>
      )}
    </div>
  );
}

function BusinessSnapshotSection({ snapshot }: { snapshot: BusinessSnapshot }) {
  function licenseVariant(s: string): 'green' | 'amber' | 'red' | 'slate' {
    if (s === 'VERIFIED' || s === 'ACTIVE') return 'green';
    if (s === 'EXPIRED') return 'red';
    return 'amber';
  }

  return (
    <div className="bg-white border border-slate-200">
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <SectionLabel>SECTION 06</SectionLabel>
          <SectionHeading>BUSINESS SNAPSHOT</SectionHeading>
          <SectionSubtext>Verified corporate identity record.</SectionSubtext>
        </div>
        <Link
          href="/workspace/settings"
          className="text-[10px] font-mono text-brand-600 hover:underline shrink-0"
        >
          VIEW BUSINESS PROFILE →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Identity */}
        <div className="px-6 sm:px-8 py-5">
          <div className="text-[9px] font-mono font-bold tracking-[0.15em] text-slate-400 mb-3">
            IDENTITY
          </div>
          <SnapshotRow label="COMPANY" value={snapshot.name} />
          {snapshot.legalName && snapshot.legalName !== snapshot.name && (
            <SnapshotRow label="LEGAL NAME" value={snapshot.legalName} />
          )}
          {snapshot.entityType && (
            <SnapshotRow label="ENTITY TYPE" value={snapshot.entityType} />
          )}
          <SnapshotRow label="PRIMARY TRADE" value={snapshot.primaryTrade} />
          <SnapshotRow
            label="LOCATION"
            value={[snapshot.city, snapshot.state].filter(Boolean).join(', ') || '—'}
          />
          <SnapshotRow
            label="STATES SERVED"
            value={snapshot.statesServed.length > 0 ? snapshot.statesServed.join(', ') : '—'}
          />
        </div>

        {/* Status */}
        <div className="px-6 sm:px-8 py-5">
          <div className="text-[9px] font-mono font-bold tracking-[0.15em] text-slate-400 mb-3">
            STATUS
          </div>
          <SnapshotRow
            label="LICENSE"
            value={snapshot.licenseStatus}
            variant={licenseVariant(snapshot.licenseStatus)}
          />
          <SnapshotRow
            label="INSURANCE"
            value={snapshot.insuranceStatus}
            variant={licenseVariant(snapshot.insuranceStatus)}
          />
          <SnapshotRow
            label="CONTRACTOR PASSPORT"
            value={snapshot.passportStatus}
            variant={
              snapshot.passportStatus === 'ACTIVE'
                ? 'green'
                : snapshot.passportStatus === 'DRAFT'
                ? 'amber'
                : 'slate'
            }
          />

          {snapshot.passportSlug && (
            <div className="mt-4 pt-3 border-t border-slate-50">
              <Link
                href={`/contractors/${snapshot.passportSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-600 hover:underline"
              >
                VIEW PUBLIC PASSPORT
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

export default async function WorkspaceDashboardPage() {
  const { organization } = await getWorkspaceContext();
  const data = await getDashboardData(organization);

  return (
    <div className="space-y-5">
      {/* Section 01: Work-Ready Status */}
      <WorkReadySection
        score={data.readinessScore}
        calculatedAt={data.calculatedAt}
        areas={data.workReadyAreas}
      />

      {/* Section 02: Your Attention */}
      <AttentionSection items={data.attentionItems} />

      {/* Section 03: Win Work */}
      <WinWorkSection
        opportunities={data.opportunities}
        matchedCount={data.opportunities.length}
        awaitingCount={data.opportunities.filter((o) => o.status === 'REVIEWING').length}
      />

      {/* Sections 04 + 05: Compliance + Activity side by side on lg */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ComplianceSection
          breakdown={data.complianceBreakdown}
          timeline={data.complianceTimeline}
        />
        <ActivitySection activities={data.recentActivity} />
      </div>

      {/* Section 06: Business Snapshot */}
      <BusinessSnapshotSection snapshot={data.businessSnapshot} />
    </div>
  );
}
