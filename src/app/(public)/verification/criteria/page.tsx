import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllVerificationCriteria } from '@/lib/verification/criteria';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Published Verification Criteria Registry | Avorria',
  description:
    'Complete transparent registry of Avorria contractor verification criteria, evidence types, requirement classifications, and review standards.',
  alternates: {
    canonical: 'https://avorria.com/verification/criteria',
  },
};

export default function VerificationCriteriaPage() {
  const criteria = getAllVerificationCriteria();

  return (
    <div className="min-h-screen bg-surface-page py-16 px-4 sm:px-6 lg:px-8 text-slate-200">
      <div className="max-w-5xl mx-auto space-y-12 text-left">
        {/* Header */}
        <div className="space-y-4 border-b border-surface-border pb-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-300 font-mono text-xs font-semibold">
              Standards Registry v2026.1
            </span>
            <span className="text-xs text-slate-400 font-mono">Governed by Avorria Standards Committee</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Published Verification Criteria
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Avorria evaluates contractors exclusively against published, objective criteria. Below is the complete catalogue of evidence standards, requirement classifications, and governing sources.
          </p>
        </div>

        {/* 4 Requirement Classifications Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              title: 'Legal / Regulatory',
              badge: 'legal_regulatory',
              desc: 'Requirements originating from applicable federal, state, or municipal law (e.g. trade licensing, SOS filings).',
            },
            {
              title: 'Industry Standard',
              badge: 'industry_standard',
              desc: 'Recognized industry practices and safety management benchmarks (e.g. OSHA 1926 HASP alignment).',
            },
            {
              title: 'Client Prequalification',
              badge: 'client_prequal',
              desc: 'Commercial standards typically required by general contractors and project owners (e.g. COI, supervisory OSHA).',
            },
            {
              title: 'Avorria Readiness',
              badge: 'avorria_readiness',
              desc: 'Avorria operational criteria ensuring profile completeness and verified business coherence.',
            },
          ].map((item) => (
            <div key={item.badge} className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-2 text-xs">
              <Badge variant="primary" size="sm">
                {item.title}
              </Badge>
              <p className="text-slate-400 leading-relaxed pt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Criteria List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Active Verification Standards ({criteria.length})</h2>
            <span className="text-xs font-mono text-slate-400">Review Cycle: Annual</span>
          </div>

          <div className="space-y-4">
            {criteria.map((crit) => (
              <div
                key={crit.id}
                className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-600 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-bold text-white">{crit.name}</span>
                      <Badge variant="neutral" size="sm">
                        {crit.category.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {crit.requirementType.replace(/_/g, ' ')}
                      </Badge>
                      {crit.mandatory ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold uppercase">
                          Mandatory
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                          Conditional
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-1">
                      {crit.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-right font-mono text-xs text-slate-400">
                    <div>Weight: <strong className="text-white">{crit.verificationWeight} pts</strong></div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Code: {crit.slug}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Expected Evidence</span>
                    <span className="text-slate-300">{crit.evidenceType.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Governing Authority / Source</span>
                    <span className="text-slate-300">{crit.sourceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Effective Date</span>
                    <span className="text-slate-300">{crit.effectiveDate} · Next Review: {crit.nextReviewDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-slate-400 text-center leading-relaxed">
          Verification against these criteria does not imply government licensure, OSHA endorsement, legal representation, or a financial guarantee of contractor work. Avorria reviews evidence against published standards for professional clarity and operational trust.
        </div>
      </div>
    </div>
  );
}
