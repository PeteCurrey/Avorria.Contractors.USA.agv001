'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { EvaluatedRequirement } from '@/lib/compliance/engine';
import { DynamicReadinessResult } from '@/lib/scoring/readiness-service';
import { ContractorWorkspaceData } from '@/lib/tenant/repository';

export default function DashboardPage() {
  const [data, setData] = useState<{
    workspace: ContractorWorkspaceData;
    requirements: EvaluatedRequirement[];
    readiness: DynamicReadinessResult;
    passport?: {
      isPublished: boolean;
      completionPercentage: number;
      verification: {
        isVerified: boolean;
        status: string;
        referenceNumber?: string;
        verifiedAt?: string;
      };
    };
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
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-500">Loading contractor operations workspace...</p>
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

  const passport = data?.passport;
  const isPassportPublished = passport?.isPublished || ws?.profile.visibility === 'published';
  const passportCompletion = passport?.completionPercentage ?? (isOnboardingComplete ? 100 : 60);
  const isVerified = passport?.verification?.isVerified || false;
  const verificationStatus = passport?.verification?.status || 'not_started';
  const verificationRef = passport?.verification?.referenceNumber;

  let nextActionLabel = 'Prepare verification';
  let nextActionCta = 'Begin Review';
  let nextActionHref = '/app/verification';

  if (!isOnboardingComplete) {
    nextActionLabel = 'Complete business profile';
    nextActionCta = 'Resume Profile';
    nextActionHref = '/app/onboarding';
  } else if (!isPassportPublished) {
    nextActionLabel = 'Publish Contractor Passport';
    nextActionCta = 'Publish';
    nextActionHref = '/app/passport';
  } else if (verificationStatus === 'verification_in_progress' || verificationStatus === 'under_review') {
    nextActionLabel = 'Review in progress by Avorria';
    nextActionCta = 'View Status';
    nextActionHref = '/app/verification';
  } else if (verificationStatus === 'attention_required' || verificationStatus === 'needs_clarification') {
    nextActionLabel = 'Provide requested evidence';
    nextActionCta = 'Respond';
    nextActionHref = '/app/verification';
  } else if (isVerified) {
    nextActionLabel = 'Verified credentials active';
    nextActionCta = 'Share Passport';
    nextActionHref = '/app/passport';
  }

  return (
    <div className="max-w-6xl space-y-6 text-left antialiased font-sans">
      {/* Top Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {ws?.organisation.name || 'Contractor Workspace'}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-surface-elevated text-slate-400 border border-surface-border uppercase">
              {ws?.serviceAreas.primaryState || 'US'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {ws?.trades.map((t) => t.replace('-', ' ')).join(', ')} • {ws?.profile.employee_count || 1} Workforce Personnel
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button href="/app/documents" size="sm" variant="primary">
            + Create Document
          </Button>
          <Button href="/app/passport" size="sm" variant="outline">
            Passport ↗
          </Button>
        </div>
      </div>

      {/* Onboarding Notice if Applicable */}
      {!isOnboardingComplete && (
        <div className="p-3.5 rounded bg-surface-card border border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-amber-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Contractor Onboarding Incomplete</span>
            </div>
            <p className="text-xs text-slate-400">
              Complete your business profile and existing credentials baseline to calculate your verified readiness score.
            </p>
          </div>
          <Button href="/app/onboarding" size="sm" variant="secondary" className="shrink-0 text-xs">
            Resume Onboarding →
          </Button>
        </div>
      )}

      {/* 3 Core Operational Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Panel 1: Readiness Standing */}
        <Card variant="dark" className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              OPERATIONAL STATUS
            </span>
            <div className="text-sm font-semibold text-white">Contractor Readiness</div>
          </div>

          <div className="my-4 flex flex-col items-center justify-center">
            {readiness?.status === 'assessment_in_progress' ? (
              <div className="text-center py-4 space-y-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto" />
                <div className="text-xs font-semibold text-amber-400">Assessment in Progress</div>
                <div className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
                  Upload evidence or complete onboarding to calculate readiness.
                </div>
              </div>
            ) : (
              <ReadinessGauge score={readiness?.score || 0} size="md" showLabel />
            )}
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center">
            Evaluated against Avorria prequalification standards
          </div>
        </Card>

        {/* Panel 2: Action Queue */}
        <Card variant="dark" className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              ACTION QUEUE
            </span>
            <div className="text-sm font-semibold text-white">
              {missingReqs.length + expiringReqs.length} Attention Items
            </div>
          </div>

          <div className="my-3 space-y-1.5 text-xs">
            {readiness?.outstandingItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-2 rounded bg-surface-subtle border border-surface-border flex items-center justify-between"
              >
                <div className="truncate pr-2 text-slate-300 font-medium text-[11px]">{item.title}</div>
                <Link
                  href={item.actionHref}
                  className="text-[10px] font-mono font-medium text-brand-400 hover:text-brand-300 shrink-0"
                >
                  {item.actionLabel} →
                </Link>
              </div>
            ))}
            {(!readiness?.outstandingItems || readiness.outstandingItems.length === 0) && (
              <div className="py-6 text-center text-xs text-slate-500">
                All current operational criteria satisfied.
              </div>
            )}
          </div>

          <Link href="/app/compliance" className="text-xs text-brand-400 hover:underline font-mono text-center block">
            View Requirements Matrix →
          </Link>
        </Card>

        {/* Panel 3: Active Records */}
        <Card variant="dark" className="p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              COMPLIANCE VAULT
            </span>
            <div className="text-sm font-semibold text-white">
              {activeDocs.length} Active Records
            </div>
          </div>

          <div className="my-3 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-surface-border text-slate-300">
              <span>Document Vault Files</span>
              <span className="font-mono font-semibold text-white">{activeDocs.length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-border text-slate-300">
              <span>Finalized Safety JHAs</span>
              <span className="font-mono font-semibold text-white">
                {ws?.generatedDocuments.filter((d) => d.document_status === 'final').length || 0}
              </span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Expiring Credentials (60d)</span>
              <span className={`font-mono font-semibold ${expiringReqs.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {expiringReqs.length}
              </span>
            </div>
          </div>

          <Link href="/app/documents" className="text-xs text-brand-400 hover:underline font-mono text-center block">
            Open Document Vault →
          </Link>
        </Card>
      </div>

      {/* Verified Passport Standing Section */}
      <div className="bg-surface-card border border-surface-border rounded p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                Avorria Contractor Passport Standing
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified digital credentials presented to project owners, institutional buyers, and general contractors.
            </p>
          </div>
          <Link
            href="/app/passport"
            className="text-xs font-mono text-brand-400 hover:text-brand-300 font-medium shrink-0"
          >
            Manage Passport →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-surface-border">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Passport Completion</div>
            <div className="text-sm font-semibold text-white mt-1">
              {passportCompletion >= 100 ? '100% Satisfied' : `${passportCompletion}% Satisfied`}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {passportCompletion >= 100 ? 'Baseline fulfilled' : 'Requires profile info'}
            </div>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Public Profile</div>
            <div className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isPassportPublished ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{isPassportPublished ? 'Published' : 'Private'}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isPassportPublished ? 'Accessible to clients' : 'Hidden from public index'}
            </div>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Avorria Verification</div>
            <div className="text-sm font-semibold text-white mt-1">
              {isVerified ? 'Verified by Avorria' : verificationStatus.replace(/_/g, ' ')}
            </div>
            <div className="text-[10px] text-brand-400 font-mono mt-0.5 truncate">
              {isVerified ? verificationRef : 'Human evidence review'}
            </div>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-brand-400 uppercase font-medium">Recommended Action</div>
              <div className="text-xs font-semibold text-white mt-0.5">{nextActionLabel}</div>
            </div>
            <Link
              href={nextActionHref}
              className="mt-2 text-center py-1 text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-[3px] transition-colors"
            >
              {nextActionCta} →
            </Link>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Document Vault Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Category Readiness Breakdown */}
        <div className="lg:col-span-7">
          <Card variant="dark" className="h-full">
            <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Operational Readiness Breakdown
            </CardTitle>
            {readiness?.categoryBreakdown && readiness.categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {readiness.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                      <span>{cat.label}</span>
                      <span className="font-mono text-white">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden border border-surface-border">
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

        {/* Right 5 Cols: Quick Launchers & Recent Documents */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="dark">
            <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Standard Creation Tools
            </CardTitle>
            <div className="space-y-1.5 text-xs">
              {[
                { href: '/app/documents/create/jha', label: 'Job Hazard Analysis (JHA)', sub: 'OSHA compliance & PPE controls', code: 'SAF-JHA' },
                { href: '/app/documents/create/quote', label: 'Contractor Estimate & Quote', sub: 'Priced line items & payment terms', code: 'COM-QUO' },
                { href: '/app/documents/create/safety-plan', label: 'Site Safety Plan (HASP)', sub: 'Site safety and hazardous material plan', code: 'SAF-HASP' },
                { href: '/app/documents/create/proposal', label: 'Formal Bid Proposal', sub: 'Turnkey bid proposal with verified passport', code: 'COM-PRP' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-2.5 rounded bg-surface-subtle border border-surface-border hover:border-slate-600 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-white text-xs truncate group-hover:text-brand-300 transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{item.sub}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-brand-400 shrink-0">
                    {item.code} →
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Recent Generated Documents */}
          <Card variant="dark">
            <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Recent Documents
            </CardTitle>
            {ws?.generatedDocuments && ws.generatedDocuments.length > 0 ? (
              <div className="space-y-1.5">
                {ws.generatedDocuments.slice(0, 3).map((doc) => (
                  <Link key={doc.id} href={`/app/documents/${doc.id}`}>
                    <div className="flex items-center justify-between p-2 rounded hover:bg-surface-subtle transition-colors border border-surface-border">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-medium text-white truncate">{doc.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(doc.created_at).toLocaleDateString('en-US')} · v{doc.version_number}.0
                        </div>
                      </div>
                      <Badge variant={doc.document_status === 'final' ? 'success' : 'info'} size="sm">
                        {doc.document_status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                No documents generated yet. Use creation tools above.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
