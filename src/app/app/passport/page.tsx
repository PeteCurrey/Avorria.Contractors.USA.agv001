'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { VerifiedBadge } from '@/components/passport/VerifiedBadge';
import { SharePassportModal } from '@/components/passport/SharePassportModal';
import { ContractorWorkspaceData } from '@/lib/tenant/repository';
import { DynamicReadinessResult } from '@/lib/scoring/readiness-service';
import {
  PassportCompletionResult,
  PublicationEligibilityResult,
  PassportPublicSettings,
} from '@/lib/passport/types';
import { ContractorVerificationState } from '@/lib/verification/types';

export default function PassportManagerPage() {
  const [data, setData] = useState<{
    workspace: ContractorWorkspaceData;
    readiness: DynamicReadinessResult;
    completionPercentage: number;
    completionResult: PassportCompletionResult;
    eligibilityResult: PublicationEligibilityResult;
    checks: { label: string; satisfied: boolean }[];
    isEligibleForPublication: boolean;
    visibility: string;
    isPublished: boolean;
    verification: ContractorVerificationState;
    passportSettings: PassportPublicSettings;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPassport = async () => {
    try {
      const res = await fetch('/api/contractor/passport');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load passport details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, []);

  const handleToggleVisibility = async (newVis: 'private' | 'published') => {
    setIsToggling(true);
    setMessage(null);

    try {
      const res = await fetch('/api/contractor/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVis }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setMessage({ type: 'success', text: json.message });
        await fetchPassport();
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to update visibility.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error updating passport visibility.' });
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleSetting = async (key: keyof PassportPublicSettings) => {
    if (!data) return;
    setIsSavingSettings(true);
    try {
      const updated = {
        ...data.passportSettings,
        [key]: !data.passportSettings[key],
      };
      const res = await fetch('/api/contractor/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updated }),
      });
      if (res.ok) {
        await fetchPassport();
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono">Loading Contractor Passport...</p>
      </div>
    );
  }

  const ws = data?.workspace;
  const org = ws?.organisation;
  const isPublished = data?.isPublished;
  const isEligible = data?.isEligibleForPublication;
  const completion = data?.completionPercentage || 0;
  const missing = data?.completionResult?.missingItems || [];
  const verification = data?.verification;
  const settings = data?.passportSettings;

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="primary" size="sm">Evidence-Backed Identity</Badge>
            <VerifiedBadge
              status={verification?.aggregateStatus || 'not_verified'}
              referenceNumber={verification?.verificationReference}
              size="sm"
            />
            <span className="text-xs text-slate-500 font-mono">
              Status: {isPublished ? 'Published' : 'Private'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Contractor Passport
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your consolidated, evidence-backed public credential for commercial clients, general contractors, and prequalification review.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isPublished && (
            <Button size="sm" variant="outline" onClick={() => setShowShareModal(true)}>
              🔗 Share Link
            </Button>
          )}

          {isPublished ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleToggleVisibility('private')}
              isLoading={isToggling}
            >
              Make Private
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleToggleVisibility('published')}
              isLoading={isToggling}
              disabled={!isEligible}
            >
              Publish Passport →
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 4 Core Independent States Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500">1. Created</div>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span>
            <span>Record Initialized</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500">2. Completeness</div>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className={completion >= 90 ? 'text-emerald-400' : 'text-amber-400'}>
              {completion >= 90 ? '✓' : '•'}
            </span>
            <span>{completion}% Complete</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500">3. Visibility</div>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className={isPublished ? 'text-emerald-400' : 'text-slate-400'}>
              {isPublished ? '✓' : '○'}
            </span>
            <span>{isPublished ? 'Published' : 'Private'}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-500">4. Verification</div>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className={verification?.isVerified ? 'text-brand-400' : 'text-slate-400'}>
              {verification?.isVerified ? '✓' : '○'}
            </span>
            <span>{verification?.isVerified ? 'Verified' : 'Unverified'}</span>
          </div>
        </div>
      </div>

      {/* Publication Blockers or Missing Items Banner */}
      {!isEligible && data?.eligibilityResult && (
        <Card variant="default" className="border-amber-500/40 bg-amber-950/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
            <span>⚠️ Publication Eligibility Incomplete</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
            {data.eligibilityResult.blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </Card>
      )}

      {missing.length > 0 && (
        <Card variant="default" className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Actionable Items to Complete Passport</CardTitle>
            <span className="text-[11px] text-slate-400 font-mono">{missing.length} missing</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {missing.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.description}</div>
                </div>
                <Link href={item.actionUrl}>
                  <Button size="sm" variant="outline">{item.actionLabel} →</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Field / Category Visibility Controls */}
      <Card variant="default" className="space-y-4">
        <div>
          <CardTitle className="text-sm">Public Field & Category Controls</CardTitle>
          <CardDescription className="text-xs">
            Choose which credential categories to present publicly on your Passport. Private documents and policy PDFs are never exposed.
          </CardDescription>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { key: 'showInsurance', label: 'Commercial General Liability Status' },
            { key: 'showLicense', label: 'State Trade License Status' },
            { key: 'showSafetyProgram', label: 'Safety Program / JHA Summary' },
            { key: 'showReadinessScore', label: 'Operational Readiness Score' },
            { key: 'showWorkforceSummary', label: 'Workforce & Headcount Summary' },
          ].map((item) => {
            const isChecked = Boolean(settings?.[item.key as keyof PassportPublicSettings]);
            return (
              <label
                key={item.key}
                className="p-3 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between cursor-pointer hover:border-surface-borderLight transition-all"
              >
                <span className="text-slate-200 font-medium">{item.label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleSetting(item.key as keyof PassportPublicSettings)}
                  disabled={isSavingSettings}
                  className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </Card>

      {/* Live Passport Preview */}
      <Card variant="elevated" className="border-brand-500/50 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-surface-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white">{org?.name}</h2>
              <Badge variant="trade" size="sm">{ws?.serviceAreas.primaryState || 'US'}</Badge>
              {verification?.isVerified && (
                <VerifiedBadge
                  status="verified"
                  referenceNumber={verification.verificationReference}
                  size="sm"
                  showLink={false}
                />
              )}
            </div>
            {ws?.profile.dba_name && (
              <div className="text-xs text-slate-400 font-mono">DBA: {ws.profile.dba_name}</div>
            )}
            <p className="text-xs text-slate-300 pt-1">
              Primary Trade: <strong className="text-white">{ws?.trades.map((t) => t.replace(/-/g, ' ')).join(', ')}</strong>
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              Operating Radius: {ws?.serviceAreas.radiusMiles} Miles • {org?.phone || 'No phone recorded'} • {org?.email}
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <ReadinessGauge score={data?.readiness.score || 0} size="sm" showLabel={false} />
            <div className="text-xs font-bold text-white mt-1">
              {data?.readiness.label || 'Readiness in Progress'}
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Platform Verification:</span>
              <span className={verification?.isVerified ? 'text-brand-400' : 'text-slate-400'}>
                {verification?.isVerified ? 'Verified by Avorria' : 'Unverified'}
              </span>
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              {verification?.isVerified
                ? `Evidence verified against Avorria criteria. Reference: ${verification.verificationReference}`
                : 'Submit your uploaded credentials for official Avorria review.'}
            </div>
          </div>
          <Link href="/app/verification">
            <Button size="sm" variant={verification?.isVerified ? 'outline' : 'primary'}>
              {verification?.isVerified ? 'View Verification →' : 'Request Verification →'}
            </Button>
          </Link>
        </div>

        {/* Supporting Vault Files */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Backed by {ws?.documents.filter((d) => d.status === 'active').length || 0} active records in your Document Vault.
          </span>
          <Link href="/app/documents" className="text-brand-400 hover:underline font-semibold">
            Open Document Vault →
          </Link>
        </div>
      </Card>

      {/* Share Modal */}
      {showShareModal && org && (
        <SharePassportModal
          slug={org.slug}
          businessName={org.name}
          isPublished={Boolean(isPublished)}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
