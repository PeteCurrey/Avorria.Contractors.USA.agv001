'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { ContractorWorkspaceData } from '@/lib/tenant/repository';
import { DynamicReadinessResult } from '@/lib/scoring/readiness-service';

export default function PassportManagerPage() {
  const [data, setData] = useState<{
    workspace: ContractorWorkspaceData;
    readiness: DynamicReadinessResult;
    completionPercentage: number;
    checks: { label: string; satisfied: boolean }[];
    isEligibleForPublication: boolean;
    visibility: string;
    isPublished: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">Flagship Credibility Standard</Badge>
            <span className="text-xs text-slate-500 font-mono">
              Status: {isPublished ? 'Published & Shareable' : 'Private Workspace'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Contractor Passport
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your consolidated, verified digital profile for commercial pre-qualification, general contractor review, and bid submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isPublished && (
            <Link
              href={`/contractors/${org?.slug || 'preview'}`}
              target="_blank"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              View Public Passport ↗
            </Link>
          )}
          {isPublished ? (
            <Button
              size="sm"
              variant="outline"
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
              Publish Passport
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

      {/* Passport States Explanation Strip */}
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
            <span className={completion >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
              {completion >= 80 ? '✓' : '•'}
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
          <div className="font-bold text-slate-400 flex items-center gap-1.5">
            <span>○</span>
            <span>Not Yet Verified</span>
          </div>
        </div>
      </div>

      {/* Main Passport Preview Card */}
      <Card variant="elevated" className="border-brand-500/50 p-6 sm:p-8 space-y-6">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-surface-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-white">{org?.name}</h2>
              <Badge variant="trade" size="sm">{ws?.serviceAreas.primaryState || 'US'}</Badge>
            </div>
            {ws?.profile.dba_name && (
              <div className="text-xs text-slate-400 font-mono">DBA: {ws.profile.dba_name}</div>
            )}
            <p className="text-xs text-slate-300 pt-1">
              Primary Trade: <strong className="text-white">{ws?.trades.map((t) => t.replace('-', ' ')).join(', ')}</strong>
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

        {/* Aggregated Credentials Matrix */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Consolidated Credential Records
          </div>

          <div className="space-y-2 text-xs">
            {data?.checks.map((chk, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className={chk.satisfied ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                    {chk.satisfied ? '✓' : '✕'}
                  </span>
                  <span className={chk.satisfied ? 'text-slate-200' : 'text-slate-400'}>{chk.label}</span>
                </div>
                <Badge variant={chk.satisfied ? 'current' : 'missing'} size="sm">
                  {chk.satisfied ? 'Satisfied' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Document Vault Linkage */}
        <div className="pt-4 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Backed by {ws?.documents.filter((d) => d.status === 'active').length || 0} active records in your Document Vault.
          </span>
          <Link href="/app/documents" className="text-brand-400 hover:underline font-semibold">
            Manage Supporting Files →
          </Link>
        </div>
      </Card>

      {/* Verification Transparency Notice */}
      <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-slate-400 space-y-1.5 leading-relaxed">
        <strong className="text-slate-300 block uppercase font-mono text-[10px]">
          Passport Verification Policy
        </strong>
        <p>
          Publishing your Contractor Passport provides clients with a clean digital presentation of your uploaded documents and operational readiness. Official "Verified Contractor" status is an independent review milestone and is not automatically granted by creating or publishing a profile.
        </p>
      </div>
    </div>
  );
}
