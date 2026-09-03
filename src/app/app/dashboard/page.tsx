import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';

export const metadata: Metadata = {
  title: 'Contractor Operating Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="max-w-6xl space-y-8 text-left">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">Contractor Workspace</h1>
            <VerifiedBadge size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Apex Electrical Solutions LLC • Austin, TX • Active Tenant
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button href="/app/documents" size="sm" variant="primary">
            + Create Document
          </Button>
          <Button href="/app/passport" size="sm" variant="outline">
            Share Passport ↗
          </Button>
        </div>
      </div>

      {/* Top Metric Cards: 5 Pillars Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Readiness Score */}
        <Card variant="default" className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Readiness</span>
            <div className="text-2xl font-black text-white">92% Ready</div>
            <StatusIndicator status="current" label="Verified Evidence" />
          </div>
          <ReadinessGauge score={92} size="sm" showLabel={false} />
        </Card>

        {/* 2. Insurance COI Status */}
        <Card variant="default" className="p-5 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase">
            <span>Insurance (COI)</span>
            <Badge variant="current" size="sm">Active</Badge>
          </div>
          <div className="text-2xl font-black text-white">$2,000,000</div>
          <div className="text-xs text-slate-400">Travelers GL • Exp Dec 2026</div>
        </Card>

        {/* 3. Trade Licensing */}
        <Card variant="default" className="p-5 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase">
            <span>Trade License</span>
            <Badge variant="expiring" size="sm">28 Days</Badge>
          </div>
          <div className="text-2xl font-black text-white">TDLR #34891</div>
          <div className="text-xs text-amber-400">Master Electrician Renewal Due</div>
        </Card>

        {/* 4. Active Documents */}
        <Card variant="default" className="p-5 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase">
            <span>Documents</span>
            <Badge variant="neutral" size="sm">28 Records</Badge>
          </div>
          <div className="text-2xl font-black text-white">6 JHAs</div>
          <div className="text-xs text-slate-400">2 Active Proposals Out for Review</div>
        </Card>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Documents & Quick Creation */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default">
            <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-4">
              <CardTitle className="text-base">Recent Field & Safety Documents</CardTitle>
              <Link href="/app/documents" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
                All Documents →
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">480V Switchgear De-energization & Lockout</div>
                  <div className="text-slate-400 mt-0.5">Project #402 • Austin Tech Campus • Task JHA</div>
                </div>
                <Badge variant="current" size="sm">Final Signed</Badge>
              </div>

              <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Commercial HASP Site Safety Plan Q3</div>
                  <div className="text-slate-400 mt-0.5">Annual Company Manual • OSHA 1926 Aligned</div>
                </div>
                <Badge variant="primary" size="sm">Active Manual</Badge>
              </div>

              <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Downtown Plaza Lighting Retrofit Proposal</div>
                  <div className="text-slate-400 mt-0.5">Bid Total: $84,500 • Submitted to DPR Construction</div>
                </div>
                <Badge variant="expiring" size="sm">Pending Award</Badge>
              </div>
            </div>
          </Card>

          {/* Quick Generator Launchers */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <Link
              href="/app/documents"
              className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-500/50 hover:shadow-glow transition-all block text-center space-y-1"
            >
              <div className="text-xl">⚡</div>
              <div className="font-bold text-white">New JHA</div>
              <div className="text-[10px] text-slate-400">Task Hazard Plan</div>
            </Link>

            <Link
              href="/app/documents"
              className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-500/50 hover:shadow-glow transition-all block text-center space-y-1"
            >
              <div className="text-xl">📋</div>
              <div className="font-bold text-white">Safety Plan</div>
              <div className="text-[10px] text-slate-400">OSHA 1926 Manual</div>
            </Link>

            <Link
              href="/app/quotes"
              className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-500/50 hover:shadow-glow transition-all block text-center space-y-1"
            >
              <div className="text-xl">💵</div>
              <div className="font-bold text-white">New Quote</div>
              <div className="text-[10px] text-slate-400">Margin Calculation</div>
            </Link>
          </div>
        </div>

        {/* Right Col: Compliance Monitor & Expiration Alerts */}
        <div className="space-y-6">
          <Card variant="default" className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <CardTitle className="text-base">Compliance Monitor</CardTitle>
              <Link href="/app/compliance" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
                Manage →
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                <span className="text-slate-300">Travelers GL COI</span>
                <StatusIndicator status="current" label="Active (210d)" />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                <span className="text-slate-300">Texas Mutual WC</span>
                <StatusIndicator status="current" label="Active (180d)" />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-amber-950/30 border border-amber-800/40">
                <span className="text-amber-200">Master Electrician License</span>
                <StatusIndicator status="expiring" label="28 Days Left" />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                <span className="text-slate-300">Monthly Toolbox Talk</span>
                <StatusIndicator status="current" label="Logged 7d Ago" />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                <span className="text-slate-300">OSHA 30 Supervisor Cards</span>
                <StatusIndicator status="current" label="2 Verified" />
              </div>
            </div>

            <Button href="/app/compliance" size="sm" variant="outline" className="w-full mt-2">
              View Full Compliance Matrix
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
