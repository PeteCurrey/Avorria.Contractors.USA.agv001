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
          <Button href="/app/documents" size="sm" variant="primary">
            + Create Document
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
            <CardTitle className="text-base mb-3">Quick Create</CardTitle>
            <div className="space-y-2.5 text-xs">
              {[
                { href: '/app/documents/create/jha', label: 'Job Hazard Analysis (JHA)', sub: 'Task hazards, OSHA controls, PPE requirements', icon: '🦺', code: 'SAF-JHA' },
                { href: '/app/documents/create/quote', label: 'Contractor Quote', sub: 'Priced line items, tax, payment terms', icon: '💰', code: 'COM-QUO' },
                { href: '/app/documents/create/safety-plan', label: 'Site Safety Plan (HASP)', sub: 'Comprehensive site safety program', icon: '📋', code: 'SAF-HASP' },
                { href: '/app/documents/create/proposal', label: 'Bid Proposal', sub: 'Competitive full proposal with credentials', icon: '📑', code: 'COM-PRP' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-3 rounded-lg bg-surface-subtle border border-surface-border hover:border-brand-500 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{item.label}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.sub}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-600 group-hover:text-brand-400 transition-colors">{item.code}</span>
                    <span className="text-brand-400 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </Link>
              ))}

              <Link
                href="/app/documents"
                className="text-center block text-[11px] text-slate-500 hover:text-brand-400 transition-colors pt-1 pb-0.5"
              >
                View all document types →
              </Link>
            </div>
          </Card>

          {/* Recent Generated Documents */}
          <Card variant="default">
            <CardTitle className="text-base mb-3">Recent Documents</CardTitle>
            {ws?.generatedDocuments && ws.generatedDocuments.length > 0 ? (
              <div className="space-y-2">
                {ws.generatedDocuments.slice(0, 4).map((doc) => (
                  <Link key={doc.id} href={`/app/documents/${doc.id}`}>
                    <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer border border-transparent hover:border-surface-border">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{doc.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{new Date(doc.created_at).toLocaleDateString('en-US')} · v{doc.version_number}.0</div>
                      </div>
                      <Badge variant={doc.document_status === 'final' ? 'current' : 'primary'} size="sm">
                        {doc.document_status}
                      </Badge>
                    </div>
                  </Link>
                ))}
                <Link href="/app/documents" className="block text-center text-[11px] text-slate-500 hover:text-brand-400 transition-colors pt-1">
                  View all documents →
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 space-y-3">
                <span className="text-3xl block">📄</span>
                <p>No documents created yet. Use Quick Create above to generate your first professional document.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
