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
    <div className="min-h-screen bg-surface-page py-16 px-4 sm:px-6 lg:px-8 text-navy-800">
      <div className="max-w-5xl mx-auto space-y-12 text-left">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-[4px] bg-brand-50 border border-brand-200 text-brand-700 font-mono text-xs font-medium">
              STANDARDS REGISTRY v2026.1
            </span>
            <span className="text-xs text-slate-500 font-mono">Governed by Avorria Standards Committee</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
            Published Verification Criteria
          </h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed font-extralight">
            Avorria evaluates commercial trade contractors exclusively against published, objective criteria. Below is the complete transparent registry of evidence benchmarks, requirement classifications, and review sources.
          </p>
        </div>

        {/* 4 Requirement Classifications Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Legal / Regulatory',
              badge: 'legal_regulatory',
              desc: 'Requirements originating from applicable federal, state, or municipal law (e.g. trade licensing, state filings).',
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
            <div key={item.badge} className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
              <Badge variant="primary" size="sm">
                {item.title}
              </Badge>
              <p className="text-slate-600 leading-relaxed font-extralight pt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Criteria List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-navy-900">Active Verification Standards ({criteria.length})</h2>
            <span className="text-xs font-mono text-slate-500">Review Cycle: Annual</span>
          </div>

          <div className="space-y-4">
            {criteria.map((crit) => (
              <div
                key={crit.id}
                className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-normal text-navy-900">{crit.name}</span>
                      <Badge variant="neutral" size="sm">
                        {crit.category.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {crit.requirementType.replace(/_/g, ' ')}
                      </Badge>
                      {crit.mandatory ? (
                        <span className="px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-mono font-medium uppercase">
                          Mandatory
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono font-medium uppercase">
                          Conditional
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl font-extralight pt-0.5">
                      {crit.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-right font-mono text-xs text-slate-600">
                    <div>Weight: <strong className="text-navy-900">{crit.verificationWeight} pts</strong></div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Code: {crit.slug}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Expected Evidence</span>
                    <span className="text-slate-800 font-medium">{crit.evidenceType.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Governing Authority / Source</span>
                    <span className="text-slate-800">{crit.sourceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Effective Date</span>
                    <span className="text-slate-800">{crit.effectiveDate} · Next Review: {crit.nextReviewDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center leading-relaxed font-extralight">
          Verification against these criteria does not imply government licensure, OSHA endorsement, legal representation, or a financial guarantee of contractor work. Avorria reviews evidence against published standards for professional clarity and operational trust.
        </div>
      </div>
    </div>
  );
}
