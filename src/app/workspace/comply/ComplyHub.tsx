'use client';

import React from 'react';
import Link from 'next/link';
import { Organization } from '@/lib/workspace/types';
import {
  ComplyRecord,
  ComplyOverview,
  AttentionItem,
  ExpiryState,
  AttentionPriority,
} from '@/lib/comply/types';

interface ComplyHubProps {
  organization: Organization;
  records: ComplyRecord[];
  overview: ComplyOverview;
  attentionQueue: AttentionItem[];
}

// ─── Expiry State Badge ───────────────────────────────────────────────────────

function ExpiryBadge({ state, daysRemaining }: { state: ExpiryState; daysRemaining: number | null }) {
  const config: Record<ExpiryState, { label: string; classes: string }> = {
    EXPIRED: {
      label: 'EXPIRED',
      classes: 'bg-rose-950/30 border border-rose-500/60 text-rose-300',
    },
    EXPIRING_CRITICAL: {
      label: daysRemaining !== null ? `${daysRemaining}D` : 'EXPIRING',
      classes: 'bg-rose-950/20 border border-rose-400/50 text-rose-300',
    },
    EXPIRING_HIGH: {
      label: daysRemaining !== null ? `${daysRemaining}D` : 'EXPIRING',
      classes: 'bg-amber-950/30 border border-amber-500/60 text-amber-300',
    },
    EXPIRING_UPCOMING: {
      label: daysRemaining !== null ? `${daysRemaining}D` : 'UPCOMING',
      classes: 'bg-amber-950/20 border border-amber-400/40 text-amber-400',
    },
    CURRENT: {
      label: 'CURRENT',
      classes: 'bg-emerald-950/20 border border-emerald-500/40 text-emerald-400',
    },
    NO_EXPIRY: {
      label: 'NO EXPIRY',
      classes: 'bg-slate-900 border border-slate-700 text-slate-400',
    },
  };

  const { label, classes } = config[state];
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider ${classes}`}>
      {label}
    </span>
  );
}

// ─── Priority Indicator ───────────────────────────────────────────────────────

function PriorityDot({ priority }: { priority: AttentionPriority }) {
  const colors: Record<AttentionPriority, string> = {
    CRITICAL: 'bg-rose-500',
    HIGH: 'bg-rose-400',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-amber-400',
    NONE: 'bg-slate-600',
  };
  return <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${colors[priority]}`} />;
}

// ─── Category Nav Card ────────────────────────────────────────────────────────

function CategoryNavCard({
  href,
  label,
  description,
  count,
  attentionCount,
}: {
  href: string;
  label: string;
  description: string;
  count: { total: number; current: number; attention: number };
  attentionCount: number;
}) {
  const hasAttention = attentionCount > 0;
  return (
    <Link
      href={href}
      className="block border border-slate-800 bg-[#090d16] hover:border-slate-600 p-5 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
            {description}
          </div>
          <div className="font-bold text-white text-sm mt-0.5 tracking-tight group-hover:text-sky-200 transition-colors">
            {label}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[11px] font-mono">
            <span className="text-slate-400">{count.total} RECORDS</span>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400">{count.current} CURRENT</span>
            {hasAttention && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-rose-400">{attentionCount} ATTENTION</span>
              </>
            )}
          </div>
        </div>
        <div className="text-slate-600 group-hover:text-slate-400 font-mono text-lg transition-colors mt-1">
          →
        </div>
      </div>

      {hasAttention && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">
              {attentionCount} item{attentionCount !== 1 ? 's' : ''} require attention
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}

// ─── Attention Queue Item ─────────────────────────────────────────────────────

function AttentionQueueRow({ item }: { item: AttentionItem }) {
  const { record, priority, reason } = item;

  const categoryHref = {
    licence: '/workspace/comply/licences',
    insurance: '/workspace/comply/insurance',
    credential: '/workspace/comply/credentials',
    safety: '/workspace/comply/safety',
  }[record.category];

  return (
    <div className="flex items-start gap-4 py-3 border-b border-slate-900 last:border-0">
      <PriorityDot priority={priority} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-white">{record.display_label}</span>
          {record.carrier_or_authority && (
            <span className="text-[11px] text-slate-500 font-mono">
              — {record.carrier_or_authority}
            </span>
          )}
          <ExpiryBadge state={record.expiry_state} daysRemaining={record.days_remaining} />
        </div>
        <p className="text-[11px] text-slate-400 font-mono">{reason}</p>
      </div>
      <div className="shrink-0">
        <Link
          href={categoryHref}
          className="text-[10px] font-mono text-sky-400 hover:text-sky-300 uppercase tracking-wider"
        >
          VIEW →
        </Link>
      </div>
    </div>
  );
}

// ─── Overview Strip ───────────────────────────────────────────────────────────

function OverviewStrip({ overview }: { overview: ComplyOverview }) {
  const cells = [
    { label: 'TOTAL RECORDS', value: overview.total, color: 'text-white' },
    { label: 'CURRENT', value: overview.current, color: 'text-emerald-400' },
    { label: 'EXPIRING ≤14D', value: overview.expiring_critical, color: overview.expiring_critical > 0 ? 'text-rose-400' : 'text-slate-500' },
    { label: 'EXPIRING ≤30D', value: overview.expiring_high, color: overview.expiring_high > 0 ? 'text-amber-400' : 'text-slate-500' },
    { label: 'EXPIRING ≤90D', value: overview.expiring_upcoming, color: overview.expiring_upcoming > 0 ? 'text-amber-500' : 'text-slate-500' },
    { label: 'EXPIRED', value: overview.expired, color: overview.expired > 0 ? 'text-rose-500 font-bold' : 'text-slate-500' },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 border border-slate-800 divide-x divide-slate-800">
      {cells.map((cell) => (
        <div key={cell.label} className="px-4 py-3 bg-[#090d16]">
          <div className={`text-xl font-bold font-mono ${cell.color}`}>{cell.value}</div>
          <div className="text-[9px] font-mono uppercase text-slate-600 tracking-wider mt-0.5">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Hub ─────────────────────────────────────────────────────────────────

export function ComplyHub({ organization, records, overview, attentionQueue }: ComplyHubProps) {
  const totalAttention = attentionQueue.length;
  const criticalCount = attentionQueue.filter((i) => i.priority === 'CRITICAL').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border border-slate-800 bg-[#090d16] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
              COMPLIANCE OPERATING CENTRE
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Comply
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Your active compliance record ledger. Dynamic expiry state, document evidence
              and provenance — computed from your actual records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                {organization.name}
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                {organization.states_licensed.join(', ')} · {organization.primary_trade}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview strip */}
      <OverviewStrip overview={overview} />

      {/* Attention Queue */}
      {totalAttention > 0 && (
        <div className="border border-slate-800 bg-[#090d16]">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {criticalCount > 0 && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Attention Queue
              </h2>
              <span className="text-[10px] font-mono text-slate-500">
                {totalAttention} item{totalAttention !== 1 ? 's' : ''}
              </span>
            </div>
            {criticalCount > 0 && (
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">
                {criticalCount} CRITICAL
              </span>
            )}
          </div>
          <div className="px-5">
            {attentionQueue.map((item) => (
              <AttentionQueueRow key={item.record.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {totalAttention === 0 && overview.total > 0 && (
        <div className="border border-emerald-800/30 bg-emerald-950/10 px-5 py-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs font-mono text-emerald-300">
            All {overview.total} records are current. No items require immediate attention.
          </span>
        </div>
      )}

      {/* Category navigation */}
      <div>
        <div className="text-[10px] font-mono uppercase text-slate-600 tracking-wider mb-3">
          COMPLIANCE CATEGORIES
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CategoryNavCard
            href="/workspace/comply/licences"
            label="Licences"
            description="State trade licences & contractor registration"
            count={overview.by_category.licences}
            attentionCount={overview.by_category.licences.attention}
          />
          <CategoryNavCard
            href="/workspace/comply/insurance"
            label="Insurance"
            description="COIs, policies & coverage records"
            count={overview.by_category.insurance}
            attentionCount={overview.by_category.insurance.attention}
          />
          <CategoryNavCard
            href="/workspace/comply/credentials"
            label="Credentials"
            description="OSHA, certifications & professional credentials"
            count={overview.by_category.credentials}
            attentionCount={overview.by_category.credentials.attention}
          />
          <CategoryNavCard
            href="/workspace/comply/safety"
            label="Safety"
            description="Safety plans, toolbox talks & compliance records"
            count={overview.by_category.safety}
            attentionCount={overview.by_category.safety.attention}
          />
        </div>
      </div>

      {/* Provenance note */}
      <div className="border-t border-slate-900 pt-4">
        <p className="text-[10px] font-mono text-slate-700">
          STATUS NOTE · All record states are computed dynamically from expiration dates at page load.
          {' '}CURRENT · CONTRACTOR SUPPLIED means the contractor has provided this record — it has not been independently verified.
          {' '}EXPIRED ≠ non-compliant; context of work requirements is assessed separately.
        </p>
      </div>

    </div>
  );
}
