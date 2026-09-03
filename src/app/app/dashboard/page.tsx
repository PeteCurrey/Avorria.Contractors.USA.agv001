'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { EvaluatedRequirement } from '@/lib/compliance/engine';
import { DynamicReadinessResult } from '@/lib/scoring/readiness-service';
import { ContractorWorkspaceData } from '@/lib/tenant/repository';

export default function DashboardPage() {
  const [data, setData] = useState<{
    workspace: ContractorWorkspaceData;
    requirements: EvaluatedRequirement[];
    readiness: DynamicReadinessResult;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch('/api/contractor/workspace');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspace();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono">Loading active contractor workspace...</p>
      </div>
    );
  }

  const ws = data?.workspace;
  const readiness = data?.readiness;
  const requirements = data?.requirements || [];
  const activeDocs = ws?.documents.filter((d) => d.status === 'active') || [];
  const expiringReqs = requirements.filter((r) => r.state === 'expiring');
  const missingReqs = requirements.filter((r) => r.state === 'missing');
  const isOnboardingComplete = ws?.profile.onboarding_status === 'completed';

  return (
    <div className="max-w-6xl space-y-8 text-left">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {ws?.organisation.name || 'Contractor Workspace'}
            </h1>
            <Badge variant="neutral" size="sm">
              {ws?.serviceAreas.primaryState || 'US'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {ws?.trades.map((t) => t.replace('-', ' ')).join(', ')} • {ws?.profile.employee_count || 1} Personnel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button href="/app/documents/create/jha" size="sm" variant="primary">
            + Create JHA Document
          </Button>
          <Button href="/app/passport" size="sm" variant="outline">
            Contractor Passport ↗
          </Button>
        </div>
      </div>

      {/* Onboarding Incomplete Banner if Applicable */}
      {!isOnboardingComplete && (
        <div className="p-4 rounded-xl bg-brand-950/80 border border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              <span>Contractor Onboarding Incomplete</span>
            </div>
            <p className="text-xs text-slate-300">
              Complete your business profile and existing credentials baseline to unlock your verified readiness score.
            </p>
          </div>
          <Button href="/app/onboarding" size="sm" variant="primary">
            Resume Onboarding →
          </Button>
        </div>
      )}

      {/* 3 Core Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. WHERE AM I? (Readiness Gauge) */}
        <Card variant="default" className="p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">01 / WHERE AM I?</span>
            <div className="text-xl font-bold text-white">Contractor Readiness</div>
          </div>
          <div className="my-4 flex flex-col items-center justify-center">
            {readiness?.status === 'assessment_in_progress' ? (
              <div className="text-center py-4 space-y-2">
                <span className="text-2xl">⏳</span>
                <div className="text-xs font-bold text-amber-400">Assessment in Progress</div>
                <div className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed">
                  Upload evidence or complete onboarding to calculate verified readiness.
                </div>
              </div>
            ) : (
              <ReadinessGauge score={readiness?.score || 0} size="md" showLabel />
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-mono text-center">
            Measures completion against Avorria criteria.
          </div>
        </Card>

        {/* 2. WHAT DO I NEED TO DO? (Priority Actions) */}
        <Card variant="default" className="p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">02 / WHAT DO I NEED TO DO?</span>
            <div className="text-xl font-bold text-white">
              {missingReqs.length + expiringReqs.length} Action Items
            </div>
          </div>

          <div className="my-3 space-y-2 text-xs">
            {readiness?.outstandingItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded bg-surface-subtle border border-surface-border flex items-center justify-between"
              >
                <div className="truncate pr-2 text-slate-300 font-medium">{item.title}</div>
                <Link
                  href={item.actionHref}
                  className="text-[11px] font-bold text-brand-400 hover:text-brand-300 shrink-0"
                >
                  {item.actionLabel} →
                </Link>
              </div>
            ))}
            {(!readiness?.outstandingItems || readiness.outstandingItems.length === 0) && (
              <div className="p-4 text-center text-xs text-slate-500">
                No immediate action required. All current criteria satisfied.
              </div>
            )}
          </div>

          <Link href="/app/compliance" className="text-xs text-brand-400 hover:underline font-semibold block text-center">
            View All Requirements Matrix →
          </Link>
        </Card>

        {/* 3. WHAT DO I HAVE? (Active Document Records) */}
        <Card variant="default" className="p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">03 / WHAT DO I HAVE?</span>
            <div className="text-xl font-bold text-white">
              {activeDocs.length} Active Records
            </div>
          </div>

          <div className="my-3 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-surface-border text-slate-300">
              <span>Document Vault Files</span>
              <span className="font-mono font-bold text-white">{activeDocs.length}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-surface-border text-slate-300">
              <span>Finalized Safety JHAs</span>
              <span className="font-mono font-bold text-white">
                {ws?.generatedDocuments.filter((d) => d.document_status === 'final').length || 0}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-300">
              <span>Expiring Credentials (60d)</span>
              <span className="font-mono font-bold text-amber-400">{expiringReqs.length}</span>
            </div>
          </div>

          <Link href="/app/documents" className="text-xs text-brand-400 hover:underline font-semibold block text-center">
            Open Document Vault →
          </Link>
        </Card>
      </div>

      {/* Category Breakdown & Document Vault Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Category Readiness Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <Card variant="default">
            <CardTitle className="text-base mb-4">Operational Readiness Breakdown</CardTitle>
            {readiness?.categoryBreakdown && readiness.categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {readiness.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{cat.label}</span>
                      <span className="font-mono text-white">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden border border-surface-border">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <p>Readiness categories will populate as you upload evidence and create safety documents.</p>
                <Button href="/app/onboarding" size="sm" variant="outline">
                  Configure Baseline
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right 5 Cols: Quick Launchers */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="default">
            <CardTitle className="text-base mb-3">Quick Document Actions</CardTitle>
            <div className="space-y-2.5 text-xs">
              <Link
                href="/app/documents/create/jha"
                className="p-3 rounded-lg bg-surface-subtle border border-surface-border hover:border-brand-500 transition-all flex items-center justify-between block"
              >
                <div>
                  <div className="font-bold text-white">Create Job Hazard Analysis (JHA)</div>
                  <div className="text-[11px] text-slate-400">Site-specific task hazards & OSHA controls</div>
                </div>
                <span className="text-brand-400 font-bold">⚡</span>
              </Link>

              <Link
                href="/app/documents"
                className="p-3 rounded-lg bg-surface-subtle border border-surface-border hover:border-brand-500 transition-all flex items-center justify-between block"
              >
                <div>
                  <div className="font-bold text-white">Upload Certificate of Insurance</div>
                  <div className="text-[11px] text-slate-400">General Liability or Workers’ Comp COI</div>
                </div>
                <span className="text-brand-400 font-bold">📄</span>
              </Link>

              <Link
                href="/app/passport"
                className="p-3 rounded-lg bg-surface-subtle border border-surface-border hover:border-brand-500 transition-all flex items-center justify-between block"
              >
                <div>
                  <div className="font-bold text-white">Review Contractor Passport</div>
                  <div className="text-[11px] text-slate-400">Client prequalification identity & sharing</div>
                </div>
                <span className="text-brand-400 font-bold">🛡️</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
