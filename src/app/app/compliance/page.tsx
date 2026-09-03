'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { EvaluatedRequirement } from '@/lib/compliance/engine';
import { DynamicReadinessResult } from '@/lib/scoring/readiness-service';

export default function ComplianceWorkspacePage() {
  const [requirements, setRequirements] = useState<EvaluatedRequirement[]>([]);
  const [readiness, setReadiness] = useState<DynamicReadinessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    async function loadRequirements() {
      try {
        const res = await fetch('/api/contractor/workspace');
        if (res.ok) {
          const json = await res.json();
          setRequirements(json.requirements || []);
          setReadiness(json.readiness || null);
        }
      } catch (err) {
        console.error('Failed to load compliance requirements', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRequirements();
  }, []);

  const categories = [
    { id: 'all', label: 'All Requirements' },
    { id: 'legal_regulatory', label: 'Statutory & Regulatory' },
    { id: 'client_prequal', label: 'Client Prequalification' },
    { id: 'industry_standard', label: 'Industry Safety Standards' },
    { id: 'avorria_readiness', label: 'Avorria Readiness' },
  ];

  const filteredReqs = requirements.filter((r) => {
    if (activeTab === 'all') return true;
    return r.type === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Compliance & Requirements</h1>
          <p className="text-xs text-slate-400 mt-1">
            Contextual evaluation of statutory mandates, consensus safety standards, client insurance covenants, and Avorria readiness criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/documents">
            <Button size="sm" variant="primary">
              + Upload Evidence COI
            </Button>
          </Link>
          <Link href="/app/documents/create/jha">
            <Button size="sm" variant="secondary">
              ⚡ Create JHA
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-lg bg-surface-card border border-surface-border space-y-1">
          <div className="text-slate-500 uppercase font-mono text-[10px]">Readiness Score</div>
          <div className="text-xl font-black text-white">{readiness?.label || 'Assessment in progress'}</div>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-card border border-surface-border space-y-1">
          <div className="text-slate-500 uppercase font-mono text-[10px]">Current Evidence</div>
          <div className="text-xl font-bold text-emerald-400">
            {requirements.filter((r) => r.state === 'current').length} Verified
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-card border border-amber-900/40 space-y-1">
          <div className="text-slate-500 uppercase font-mono text-[10px]">Expiring Soon</div>
          <div className="text-xl font-bold text-amber-400">
            {requirements.filter((r) => r.state === 'expiring').length} Within 60d
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-card border border-surface-border space-y-1">
          <div className="text-slate-500 uppercase font-mono text-[10px]">Missing Actions</div>
          <div className="text-xl font-bold text-slate-300">
            {requirements.filter((r) => r.state === 'missing').length} Gaps
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === cat.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-surface-subtle text-slate-400 hover:text-white border border-surface-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Requirements Matrix List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Evaluating contextual requirements...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReqs.map((req) => {
            const isNotApplicable = req.state === 'not_applicable';

            return (
              <Card
                key={req.id}
                variant="default"
                className={`p-5 space-y-3 ${isNotApplicable ? 'opacity-60 bg-surface-subtle/50' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{req.title}</span>
                      <Badge variant="trade" size="sm">
                        {req.requirementCode}
                      </Badge>
                      <Badge
                        variant={
                          req.type === 'legal_regulatory'
                            ? 'primary'
                            : req.type === 'client_prequal'
                            ? 'neutral'
                            : 'trade'
                        }
                        size="sm"
                      >
                        {req.type === 'legal_regulatory'
                          ? 'Statutory Law'
                          : req.type === 'client_prequal'
                          ? 'Client Prequalification'
                          : req.type === 'industry_standard'
                          ? 'Industry Standard'
                          : 'Avorria Criterion'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {req.description}
                    </p>

                    {req.sourceName && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono pt-1">
                        <span>Authority: {req.sourceName}</span>
                        {req.sourceUrl && (
                          <a
                            href={req.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-400 hover:underline"
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Operational Status Pill */}
                  <div className="shrink-0 flex items-center gap-3">
                    {req.state === 'current' && <StatusIndicator status="current" label="Current" />}
                    {req.state === 'expiring' && (
                      <StatusIndicator
                        status="expiring"
                        label={req.daysRemaining ? `Expiring (${req.daysRemaining}d)` : 'Expiring Soon'}
                      />
                    )}
                    {req.state === 'expired' && <StatusIndicator status="expired" label="Expired" />}
                    {req.state === 'missing' && <StatusIndicator status="missing" label="Missing Evidence" />}
                    {req.state === 'needs_review' && (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Needs Review
                      </span>
                    )}
                    {req.state === 'not_applicable' && (
                      <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-surface-elevated border border-surface-border">
                        Not Applicable
                      </span>
                    )}
                  </div>
                </div>

                {/* Next Action Link Bar */}
                {!isNotApplicable && (
                  <div className="pt-3 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400 text-[11px]">
                      {req.evidenceName ? (
                        <span className="text-emerald-400">Supporting Evidence on File: {req.evidenceName}</span>
                      ) : (
                        <span>Next Step: {req.actionDescription}</span>
                      )}
                    </div>
                    <Link href={req.actionHref} className="shrink-0">
                      <Button size="sm" variant={req.state === 'current' ? 'outline' : 'primary'}>
                        {req.actionLabel} →
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Explicit Legal Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-xs text-slate-400 space-y-1.5 leading-relaxed">
        <strong className="text-slate-300 block uppercase font-mono text-[10px]">
          Regulatory & Legal Notice
        </strong>
        <p>
          Requirements displayed above are derived from authoritative jurisdictional bodies (OSHA, state licensing commissions), consensus standards, and common commercial prequalification covenants. Avorria is an operational management platform and does not issue legal advice or guarantee regulatory certification.
        </p>
      </div>
    </div>
  );
}
