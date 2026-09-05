/**
 * AVORRIA CONTRACTOR WORKSPACE — SBB OPERATOR DASHBOARD
 *
 * Light Editorial Operator UI (SBB rail-logistics reference):
 *   - Light neutral base (#ECEEEF)
 *   - Lufga display typeface for headings & numbers
 *   - Small-caps micro-labels with letter-spacing (0.14em)
 *   - Soft 16-20px rounded cards with 1px hairline borders
 *   - Single deliberate orange accent (#F97316)
 *   - Functional status colors: current (emerald), expiring (amber), expired (red)
 *   - Interactive multi-metric Radar Chart for Readiness Score breakdown
 *   - Horizontal filmstrip for rapid credential & asset browsing
 */

import React from 'react';
import Link from 'next/link';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { ReadinessScoreBreakdown } from '@/lib/workspace/types';
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
// SBB OPERATOR STATUS TAGS (FUNCTIONAL STATUS SYSTEM)
// ─────────────────────────────────────────────────────────────

function OperatorStatusTag({
  status,
  variant,
}: {
  status: string;
  variant: 'emerald' | 'amber' | 'red' | 'neutral' | 'orange';
}) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    red: 'bg-rose-50 text-rose-800 border-rose-200/80',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200/80',
    orange: 'bg-orange-50 text-orange-800 border-orange-200/80',
  };

  const dots = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-rose-500',
    neutral: 'bg-neutral-400',
    orange: 'bg-[#F97316]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-medium border rounded-md tracking-tight ${variants[variant]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[variant]}`} />
      <span>{status}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// SBB RADAR CHART — READINESS MULTI-METRIC BREAKDOWN
// ─────────────────────────────────────────────────────────────
// Renders an SVG radar graph for the 4 core dimensions:
// 1. Insurance Coverage (COIs)
// 2. State & Trade Licensing
// 3. OSHA Safety Plans & JHAs
// 4. Contractor Passport Completeness
function ReadinessRadarChart({
  scores,
}: {
  scores: {
    insurance: number;
    licensing: number;
    safety: number;
    passport: number;
  };
}) {
  const cx = 110;
  const cy = 110;
  const r = 70;

  // 4 Axes: Top (0°), Right (90°), Bottom (180°), Left (270°)
  // Angle radians
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

  // Normalized score points (clamped 15 to 100 for visual appeal)
  const normScores = [
    Math.max(15, scores.insurance),
    Math.max(15, scores.licensing),
    Math.max(15, scores.safety),
    Math.max(15, scores.passport),
  ];

  const points = normScores.map((score, i) => {
    const angle = angles[i];
    const dist = (score / 100) * r;
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Concentric ring levels
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        className="overflow-visible"
        aria-label="Readiness Breakdown Radar Chart"
      >
        {/* Concentric grid rings */}
        {rings.map((fraction, idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={r * fraction}
            fill="none"
            stroke="#E2E4E8"
            strokeWidth="1"
            strokeDasharray={idx < 3 ? '2 2' : 'none'}
          />
        ))}

        {/* Axis Crosshairs */}
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#E2E4E8" strokeWidth="1" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#E2E4E8" strokeWidth="1" />

        {/* Radar Filled Shape (Subtle Orange Accent Layer) */}
        <polygon
          points={polygonPath}
          fill="rgba(249, 115, 22, 0.12)"
          stroke="#F97316"
          strokeWidth="2"
          className="transition-all duration-700 ease-out"
        />

        {/* Vertex Data Marker Dots */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#F97316"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="transition-all duration-700 ease-out"
            />
          </g>
        ))}

        {/* Axis Micro-Labels in Small Caps */}
        <text
          x={cx}
          y={cy - r - 8}
          textAnchor="middle"
          className="font-mono text-[9px] font-bold fill-neutral-500 tracking-[0.14em]"
        >
          INSURANCE ({scores.insurance}%)
        </text>
        <text
          x={cx + r + 8}
          y={cy + 3}
          textAnchor="start"
          className="font-mono text-[9px] font-bold fill-neutral-500 tracking-[0.14em]"
        >
          LICENSING ({scores.licensing}%)
        </text>
        <text
          x={cx}
          y={cy + r + 14}
          textAnchor="middle"
          className="font-mono text-[9px] font-bold fill-neutral-500 tracking-[0.14em]"
        >
          SAFETY &amp; JHA ({scores.safety}%)
        </text>
        <text
          x={cx - r - 8}
          y={cy + 3}
          textAnchor="end"
          className="font-mono text-[9px] font-bold fill-neutral-500 tracking-[0.14em]"
        >
          PASSPORT ({scores.passport}%)
        </text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 01. OPERATIONAL TELEMETRY BAR & TICKER
// ─────────────────────────────────────────────────────────────

function OperatorTelemetryBar({
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
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E4E8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Operations Control Desk
            </h1>
            <span className="text-neutral-300">/</span>
            <span className="micro-label text-neutral-500">
              {organizationName}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            US Commercial contractor readiness standing, active credential coverage, and owner bid opportunities.
          </p>
        </div>

        {/* Primary Action Button (Single Orange Accent Rule) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/workspace/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl transition-colors shadow-xs"
          >
            <span>+ Create Document</span>
          </Link>
          <Link
            href="/workspace/passport"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-800 border border-[#E2E4E8] rounded-xl transition-colors shadow-2xs"
          >
            <span>Contractor Passport ↗</span>
          </Link>
        </div>
      </div>

      {/* Layered SBB Operator Ticker Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Readiness Standing */}
        <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="micro-label">READINESS SCORE</span>
            <span className={`w-2 h-2 rounded-full ${isWorkReady ? 'bg-emerald-500' : 'bg-[#F97316]'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-neutral-900">
              {readinessScore}
            </span>
            <span className="font-mono text-xs text-neutral-400">/ 100 PTS</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className={isWorkReady ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
              {isWorkReady ? 'Pre-Qualified Standard' : 'Credential Gaps Pending'}
            </span>
          </div>
        </div>

        {/* Metric 2: Attention Items */}
        <div
          className={`bg-white border rounded-[20px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between ${
            isActionNeeded ? 'border-orange-300 ring-1 ring-orange-200/50' : 'border-[#E2E4E8]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="micro-label">ACTION QUEUE</span>
            <span className={`w-2 h-2 rounded-full ${isActionNeeded ? 'bg-[#F97316]' : 'bg-emerald-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-display text-3xl font-bold tracking-tight ${isActionNeeded ? 'text-neutral-900' : 'text-neutral-900'}`}>
              {attentionCount}
            </span>
            <span className="font-mono text-xs text-neutral-400">ITEMS</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {isActionNeeded ? (attentionCount === 1 ? '1 requirement needs renewal' : `${attentionCount} actions require review`) : 'All requirements satisfied'}
          </div>
        </div>

        {/* Metric 3: Active Records */}
        <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="micro-label">COMPLIANCE VAULT</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-neutral-900">
              {recordCount}
            </span>
            <span className="font-mono text-xs text-neutral-400">ACTIVE</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">COIs, Policies &amp; Licenses</span>
            <Link href="/workspace/comply" className="text-[#F97316] font-mono hover:underline text-[10px]">
              Inspect →
            </Link>
          </div>
        </div>

        {/* Metric 4: Expiring Watchlist */}
        <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="micro-label">EXPIRES SOON (60D)</span>
            <span className={`w-2 h-2 rounded-full ${expiringCount > 0 ? 'bg-amber-500' : 'bg-neutral-300'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-display text-3xl font-bold tracking-tight ${expiringCount > 0 ? 'text-amber-800' : 'text-neutral-900'}`}>
              {expiringCount}
            </span>
            <span className="font-mono text-xs text-neutral-400">POLICIES</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {expiringCount > 0 ? 'Renewal notices dispatched' : 'Zero policies expiring soon'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 02. LEVEL 1 — ATTENTION DESK (ACTION REQUIRED QUEUE)
// ─────────────────────────────────────────────────────────────

function AttentionDesk({ items }: { items: DashboardAttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-[#E2E4E8] rounded-[20px] px-5 py-3.5 flex items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-neutral-900">
              Operational Attention Desk: Zero Flagged Gaps
            </span>
            <span className="text-xs text-neutral-500 ml-2 hidden sm:inline">
              All general liability, workers comp, state trade credentials, and safety records are in current standing.
            </span>
          </div>
        </div>
        <Link
          href="/workspace/comply"
          className="text-xs font-mono text-neutral-500 hover:text-neutral-900 shrink-0 font-medium"
        >
          Compliance Ledger →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E4E8] rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="px-5 py-3 bg-neutral-50/80 border-b border-[#E2E4E8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <h2 className="micro-label text-neutral-900 font-bold">
            ACTION REQUIRED ({items.length} ITEMS)
          </h2>
          <span className="text-neutral-400 text-xs hidden sm:inline">
            Resolve immediately to preserve institutional prequalification status.
          </span>
        </div>
        <Link
          href="/workspace/comply"
          className="text-xs font-mono text-[#F97316] hover:underline font-medium"
        >
          Open Comply Desk →
        </Link>
      </div>

      <div className="divide-y divide-[#E2E4E8]">
        {items.map((item) => {
          const isHigh = item.priority === 'HIGH';
          const isExpired = item.state === 'EXPIRED';

          return (
            <div
              key={item.id}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/60 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`mt-0.5 text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md shrink-0 uppercase ${
                    isHigh
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {item.priority}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900 truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      ({item.state.replace(/_/g, ' ')})
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {item.description || item.dueLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className={`text-xs font-mono ${isExpired ? 'text-rose-600 font-bold' : 'text-neutral-500'}`}>
                  {item.dueLabel}
                </span>
                <Link
                  href={item.href}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                    isHigh
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-transparent'
                      : 'bg-white hover:bg-neutral-50 text-neutral-800 border-[#E2E4E8]'
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
// 03. LEVEL 2 — WORK-READY STANDING & RADAR CHART
// ─────────────────────────────────────────────────────────────

function WorkReadyRadarPanel({
  score,
  calculatedAt,
  breakdown,
  areas,
}: {
  score: number;
  calculatedAt: string;
  breakdown: ComplianceBreakdown;
  areas: WorkReadyArea[];
}) {
  const isOptimal = score >= 80;

  // Radar axis scores: Insurance, Licensing, Safety, Passport (using overall/average or areas)
  const passportScore = areas.find((a) => a.label.toLowerCase().includes('passport'))?.isGood ? 100 : 70;

  const radarScores = {
    insurance: breakdown.insurance,
    licensing: breakdown.licenses,
    safety: breakdown.safety,
    passport: passportScore,
  };

  return (
    <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
        <div>
          <span className="micro-label">TELEMETRY</span>
          <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
            Work-Ready Radar Assessment
          </h2>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          {formatCheckedAt(calculatedAt)}
        </span>
      </div>

      {/* SVG Multi-Metric Radar Chart */}
      <div className="py-2">
        <ReadinessRadarChart scores={radarScores} />
      </div>

      {/* 4 Quadrant Summary Cards */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E4E8]">
        {areas.map((area) => (
          <Link
            key={area.label}
            href={area.href}
            className="group p-2.5 rounded-xl bg-neutral-50/70 border border-[#E2E4E8] hover:border-neutral-300 hover:bg-white transition-colors flex items-center justify-between"
          >
            <div>
              <div className="micro-label text-[9px] text-neutral-500">
                {area.label}
              </div>
              <div className="text-xs font-bold text-neutral-900 mt-0.5 group-hover:text-[#F97316] transition-colors">
                {area.status}
              </div>
            </div>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                area.isGood ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 04. LEVEL 2 — CONTRACT OPPORTUNITIES & BID PIPELINE TABLE
// ─────────────────────────────────────────────────────────────

function OpportunitiesTable({
  opportunities,
}: {
  opportunities: DashboardOpportunity[];
}) {
  return (
    <div className="bg-white border border-[#E2E4E8] rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border-[#E2E4E8] flex items-center justify-between bg-neutral-50/60">
        <div>
          <span className="micro-label">PIPELINE MATCHING</span>
          <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
            Owner Contract Opportunities &amp; RFPs
          </h2>
        </div>
        <Link
          href="/workspace/win-work"
          className="text-xs font-mono text-[#F97316] hover:underline font-medium shrink-0"
        >
          View Pipeline ({opportunities.length}) →
        </Link>
      </div>

      {opportunities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-[#E2E4E8] text-[9px] font-mono text-neutral-500 uppercase tracking-[0.14em]">
                <th className="py-2.5 px-4 font-semibold">Project Title</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">Trade</th>
                <th className="py-2.5 px-3 font-semibold">Est. Value</th>
                <th className="py-2.5 px-3 font-semibold">Match</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4E8]">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-neutral-900">
                    {opp.title}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 font-mono text-[11px]">
                    {opp.location}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 font-mono text-[11px]">
                    {opp.trade}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-900 font-mono font-bold">
                    {formatCurrency(opp.estimatedValueMin, opp.estimatedValueMax)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-xs font-bold text-[#F97316]">
                      {opp.matchScore}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <OperatorStatusTag
                      status={opp.status}
                      variant={opp.status === 'MATCHED' ? 'emerald' : 'orange'}
                    />
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <Link
                      href={opp.href}
                      className="text-xs font-semibold text-[#F97316] hover:underline"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center space-y-3 my-auto">
          <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-[#E2E4E8] flex items-center justify-center mx-auto text-neutral-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <div className="font-display text-sm font-bold text-neutral-900">
              No Active Project Matches
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Institutional projects and commercial RFPs matching your trade scope and jurisdiction surface here automatically.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2.5 text-xs">
            <Link
              href="/workspace/passport"
              className="px-3.5 py-1.5 bg-white border border-[#E2E4E8] text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors font-medium shadow-2xs"
            >
              Verify Passport Credentials
            </Link>
            <Link
              href="/workspace/win-work"
              className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-semibold"
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
// 05. LEVEL 3 — COMPLIANCE POSTURE & EXPIRATIONS
// ─────────────────────────────────────────────────────────────

function CompliancePosturePanel({
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
    <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
        <div>
          <span className="micro-label">AUDIT POSTURE</span>
          <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
            Credentials &amp; Expiration Watchlist
          </h2>
        </div>
        <Link href="/workspace/comply" className="text-xs font-mono text-[#F97316] hover:underline font-medium">
          Manage COIs →
        </Link>
      </div>

      {/* Breakdown progress meters */}
      <div className="space-y-2.5">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-700 font-medium">{cat.label}</span>
              <span className="font-mono text-xs font-bold text-neutral-900">
                {cat.value}%
              </span>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cat.value >= 80
                    ? 'bg-emerald-500'
                    : cat.value >= 50
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${cat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 90-Day Expiration Watchlist */}
      <div className="pt-3 border-t border-[#E2E4E8] space-y-2">
        <div className="flex items-center justify-between">
          <span className="micro-label">EXPIRATION TIMELINE (90D)</span>
          <span className="text-[10px] font-mono text-neutral-400">
            {timeline.length} Monitored
          </span>
        </div>

        {timeline.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {timeline.slice(0, 4).map((item) => {
              const isUrgent = item.daysRemaining <= 30;
              return (
                <Link
                  key={item.credentialId}
                  href={item.href}
                  className="flex items-center justify-between p-2 rounded-xl border border-[#E2E4E8] hover:bg-neutral-50 transition-colors text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-neutral-900 truncate text-[11px]">
                      {item.credentialTitle}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      {item.credentialType}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold shrink-0 ${
                      item.daysRemaining <= 0
                        ? 'text-rose-600'
                        : isUrgent
                        ? 'text-amber-600'
                        : 'text-neutral-600'
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
          <div className="py-3 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-[#E2E4E8]">
            Zero policies expiring within 90 days.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 06. STEP 6 — SBB FILMSTRIP / CAROUSEL BROWSER PATTERN
// ─────────────────────────────────────────────────────────────
// The reference's bottom filmstrip (browsing between flatcars)
// maps directly onto browsing credentials, documents, or assets
function OperatorFilmstrip({
  credentials,
}: {
  credentials: ComplianceTimelineItem[];
}) {
  return (
    <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="micro-label">FLEET &amp; CREDENTIAL FILMSTRIP</span>
          <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
            Browse Active Compliance Records
          </h2>
        </div>
        <Link href="/workspace/comply" className="text-xs font-mono text-[#F97316] hover:underline font-medium">
          View All Records →
        </Link>
      </div>

      {credentials.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {credentials.map((item, idx) => {
            const isUrgent = item.daysRemaining <= 30;
            return (
              <Link
                key={item.credentialId || idx}
                href={item.href}
                className="shrink-0 w-64 p-3.5 rounded-2xl bg-neutral-50/80 border border-[#E2E4E8] hover:border-neutral-400 hover:bg-white transition-all shadow-2xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="micro-label text-[9px]">
                      ID: {`CRD-${1000 + idx}`}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.daysRemaining <= 0
                          ? 'bg-rose-500'
                          : isUrgent
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="font-semibold text-neutral-900 text-xs mt-1.5 line-clamp-1 group-hover:text-[#F97316] transition-colors">
                    {item.credentialTitle}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    {item.credentialType}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E2E4E8] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Expires:</span>
                  <span className={`font-bold ${isUrgent ? 'text-amber-600' : 'text-neutral-800'}`}>
                    {item.daysRemaining <= 0 ? 'Expired' : `${item.daysRemaining} days`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-neutral-50/60 border border-dashed border-[#E2E4E8] space-y-3">
          <div className="w-9 h-9 mx-auto rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F97316]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-900">Zero Compliance Records Active</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-0.5">
              Add your general liability insurance, trade licenses, or safety certifications to populate your compliance ledger.
            </p>
          </div>
          <div>
            <Link
              href="/workspace/comply"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#F97316] hover:bg-[#EA580C] rounded-xl shadow-xs transition-colors"
            >
              <span>+ Add First Credential</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 06B. LEVEL 2 — DOCUMENTED READINESS CHECKLIST
// ─────────────────────────────────────────────────────────────
function DocumentedReadinessChecklist({
  breakdown,
  score,
}: {
  breakdown: ReadinessScoreBreakdown;
  score: number;
}) {
  const items = [
    {
      id: 'gl_coi',
      title: 'General Liability Insurance (COI)',
      weight: '20 PTS',
      met: breakdown.has_gl_coi,
      desc: breakdown.has_gl_coi ? 'ACORD 25 verified on record' : 'Mandatory for institutional prequalification',
      href: '/workspace/comply',
      cta: '+ Upload COI',
    },
    {
      id: 'workers_comp',
      title: "Workers' Compensation Policy",
      weight: '15 PTS',
      met: breakdown.has_workers_comp,
      desc: breakdown.has_workers_comp ? 'Statutory coverage verified active' : 'Required for onsite operational readiness',
      href: '/workspace/comply',
      cta: '+ Add Policy',
    },
    {
      id: 'trade_license',
      title: 'State Contractor Trade License',
      weight: '25 PTS',
      met: breakdown.has_trade_license,
      desc: breakdown.has_trade_license ? 'Valid state authority license on record' : 'Primary jurisdictional qualification',
      href: '/workspace/comply',
      cta: '+ Add License',
    },
    {
      id: 'safety_plan',
      title: 'Active JHA / Safety Plan (HASP)',
      weight: '15 PTS',
      met: breakdown.has_safety_plan,
      desc: breakdown.has_safety_plan ? 'Digitally executed safety document on file' : 'Generated via Claude AI Studio',
      href: '/workspace/create/jha',
      cta: '+ Generate JHA',
    },
    {
      id: 'toolbox_talk',
      title: 'Recent Toolbox Talk (Past 30 Days)',
      weight: '10 PTS',
      met: breakdown.has_recent_toolbox_talk,
      desc: breakdown.has_recent_toolbox_talk ? 'Active crew attendance logged within 30 days' : 'Weekly safety briefing log',
      href: '/workspace/create/toolbox_talk',
      cta: '+ Log Safety Talk',
    },
    {
      id: 'passport',
      title: 'Published Contractor Verification Passport',
      weight: '15 PTS',
      met: breakdown.has_passport,
      desc: breakdown.has_passport ? 'Public verification portal live for general contractors' : 'Shareable trust asset for bids',
      href: '/workspace/passport',
      cta: 'Publish Passport',
    },
  ];

  const metCount = items.filter((i) => i.met).length;

  return (
    <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
        <div>
          <span className="micro-label">READINESS SPECIFICATION</span>
          <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
            Documented Readiness Checklist
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500">
            {metCount} / {items.length} Fulfilled
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-neutral-100 text-neutral-800 border border-[#E2E4E8]">
            {score}/100 PTS
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#E2E4E8] my-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  item.met
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-600'
                    : 'bg-neutral-100 border border-neutral-300 text-neutral-400'
                }`}
              >
                {item.met ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold truncate ${item.met ? 'text-neutral-900' : 'text-neutral-700'}`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                    [{item.weight}]
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate">
                  {item.desc}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {item.met ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  MET
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="px-2.5 py-1 text-[11px] font-medium font-mono text-[#F97316] bg-orange-50/80 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  {item.cta} →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[#E2E4E8] flex items-center justify-between text-xs text-neutral-500">
        <span className="text-[11px]">
          Score criteria automatically calculate against live database records.
        </span>
        <Link
          href="/workspace/comply"
          className="text-xs font-mono text-[#F97316] hover:underline font-medium shrink-0 ml-2"
        >
          Compliance Matrix →
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 07. LEVEL 4 — OPERATIONAL ACTIVITY LEDGER
// ─────────────────────────────────────────────────────────────

function ActivityLedger({ activities }: { activities: DashboardActivity[] }) {
  return (
    <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
        <div>
          <span className="micro-label">LEDGER</span>
          <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
            Operational Activity Stream
          </h2>
        </div>
        <span className="text-xs font-mono text-neutral-400">Live</span>
      </div>

      {activities.length > 0 ? (
        <div className="divide-y divide-[#E2E4E8] max-h-56 overflow-y-auto">
          {activities.slice(0, 6).map((event) => (
            <div key={event.id} className="py-2.5 text-xs flex items-start gap-2.5">
              <span className="micro-label text-[8px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 shrink-0 mt-0.5">
                {event.eventType}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-neutral-900 font-medium leading-snug">
                  {event.description}
                </div>
                {event.reference && (
                  <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    REF: {event.reference}
                  </div>
                )}
              </div>

              <span className="text-[10px] font-mono text-neutral-400 shrink-0 mt-0.5">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-neutral-400 my-auto">
          Zero recent workspace events recorded.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 08. LEVEL 4 — VERIFIED BUSINESS IDENTITY MATRIX
// ─────────────────────────────────────────────────────────────

function BusinessIdentityMatrix({ snapshot }: { snapshot: BusinessSnapshot }) {
  function getTag(status: string) {
    if (status === 'VERIFIED' || status === 'ACTIVE') {
      return <OperatorStatusTag status={status} variant="emerald" />;
    }
    if (status === 'EXPIRED') {
      return <OperatorStatusTag status={status} variant="red" />;
    }
    return <OperatorStatusTag status={status} variant="amber" />;
  }

  return (
    <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
        <div>
          <span className="micro-label">CONTRACTOR PROFILE</span>
          <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
            Verified Contractor Identity Specification
          </h2>
        </div>
        <Link
          href="/workspace/settings"
          className="text-xs font-mono text-[#F97316] hover:underline font-medium"
        >
          Edit Business Entity →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Cell 1 */}
        <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-[#E2E4E8] space-y-1">
          <span className="micro-label">ENTITY &amp; STRUCTURE</span>
          <div className="font-semibold text-neutral-900 text-sm">
            {snapshot.name}
          </div>
          <div className="text-neutral-500 text-[11px]">
            {snapshot.entityType || 'Commercial Trade Contractor'}
          </div>
          {snapshot.legalName && snapshot.legalName !== snapshot.name && (
            <div className="text-[11px] font-mono text-neutral-400">
              Legal: {snapshot.legalName}
            </div>
          )}
        </div>

        {/* Cell 2 */}
        <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-[#E2E4E8] space-y-1">
          <span className="micro-label">TRADE &amp; JURISDICTION</span>
          <div className="font-semibold text-neutral-900">
            {snapshot.primaryTrade}
          </div>
          <div className="text-neutral-500 text-[11px]">
            HQ: {[snapshot.city, snapshot.state].filter(Boolean).join(', ') || 'United States'}
          </div>
          <div className="text-[11px] font-mono text-neutral-400">
            States: {snapshot.statesServed.length > 0 ? snapshot.statesServed.join(', ') : 'Single State'}
          </div>
        </div>

        {/* Cell 3 */}
        <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-[#E2E4E8] space-y-2">
          <span className="micro-label">VERIFICATION STANDING</span>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">License Verification</span>
            {getTag(snapshot.licenseStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Insurance (COI)</span>
            {getTag(snapshot.insuranceStatus)}
          </div>
        </div>

        {/* Cell 4 */}
        <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-[#E2E4E8] space-y-2 flex flex-col justify-between">
          <div>
            <span className="micro-label">PUBLIC CONTRACTOR PASSPORT</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  snapshot.passportStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold text-neutral-900">
                {snapshot.passportStatus === 'ACTIVE' ? 'Published' : 'Draft Mode'}
              </span>
            </div>
          </div>

          {snapshot.passportSlug ? (
            <Link
              href={`/contractors/${snapshot.passportSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F97316] bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-xl transition-colors"
            >
              <span>View Public Passport</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/workspace/passport"
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded-xl transition-colors"
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
    <div className="space-y-6">
      {/* 01. SBB Operational Header & Telemetry Ticker */}
      <OperatorTelemetryBar
        organizationName={organization.name}
        readinessScore={data.readinessScore}
        attentionCount={data.attentionItems.length}
        recordCount={data.complianceBreakdown.recordCount}
        expiringCount={expiringCount}
      />

      {/* 02. LEVEL 1 — Immediate Attention Queue */}
      <AttentionDesk items={data.attentionItems} />

      {/* 03. LEVEL 2 — Core Operational Grid (Radar Chart + Documented Readiness Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col (5 cols): Work-Ready Radar Assessment */}
        <div className="lg:col-span-5">
          <WorkReadyRadarPanel
            score={data.readinessScore}
            calculatedAt={data.calculatedAt}
            breakdown={data.complianceBreakdown}
            areas={data.workReadyAreas}
          />
        </div>

        {/* Right Col (7 cols): Documented Readiness Checklist */}
        <div className="lg:col-span-7">
          <DocumentedReadinessChecklist
            breakdown={data.breakdown}
            score={data.readinessScore}
          />
        </div>
      </div>

      {/* 04. Opportunities & Bid Pipeline Table */}
      <OpportunitiesTable opportunities={data.opportunities} />

      {/* 05. STEP 6 — SBB Filmstrip / Carousel Browser */}
      <OperatorFilmstrip credentials={data.complianceTimeline} />

      {/* 05. LEVEL 3 & 4 — Compliance Posture & Activity Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <CompliancePosturePanel
            breakdown={data.complianceBreakdown}
            timeline={data.complianceTimeline}
          />
        </div>

        <div className="lg:col-span-6">
          <ActivityLedger activities={data.recentActivity} />
        </div>
      </div>

      {/* 06. LEVEL 4 — Verified Contractor Identity Specification */}
      <BusinessIdentityMatrix snapshot={data.businessSnapshot} />
    </div>
  );
}
