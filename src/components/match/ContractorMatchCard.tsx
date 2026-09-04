'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  EvaluatedContractorMatch,
  CanonicalEvidenceState,
  OverallMatchStatus,
} from '@/lib/match/types';

interface ContractorMatchCardProps {
  candidate: EvaluatedContractorMatch;
}

export function ContractorMatchCard({ candidate }: ContractorMatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
      {/* Top Header */}
      <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{candidate.businessName}</h3>

              {candidate.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span>🛡️</span>
                  <span>Verified by Avorria</span>
                  {candidate.verificationReference && (
                    <span className="font-mono text-[10px] text-emerald-700">
                      ({candidate.verificationReference})
                    </span>
                  )}
                </span>
              )}

              <OverallStatusBadge status={candidate.overallStatus} />
            </div>

            {/* Alignment Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`px-2.5 py-0.5 rounded-lg border font-medium ${
                  candidate.tradeAlignment === 'exact'
                    ? 'bg-brand-50 border-brand-200 text-brand-800 font-bold'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Trade: {candidate.primaryTrade} ({candidate.tradeAlignment})
              </span>

              <span
                className={`px-2.5 py-0.5 rounded-lg border font-medium ${
                  candidate.territoryAlignment === 'exact'
                    ? 'bg-brand-50 border-brand-200 text-brand-800 font-bold'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Territory: {candidate.location} ({candidate.territoryAlignment})
              </span>
            </div>

            {/* Deterministic Match Reasons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {candidate.matchExplanations.map((exp, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${
                    exp.isPositive
                      ? 'bg-white border-slate-200 text-slate-600'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <span>{exp.isPositive ? '✓' : '⚠️'}</span>
                  <span>{exp.message}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action & Metric Toolbar */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {candidate.alignedCount} / {candidate.requirementResults.length}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Criteria Aligned
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/contractors/${candidate.slug}`}
                target="_blank"
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
              >
                <span>Inspect Passport</span>
                <span>↗</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>{isExpanded ? 'Hide Matrix' : 'Audit Matrix'}</span>
                <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Requirement-to-Evidence Matrix */}
      {isExpanded && (
        <div>
          {/* Desktop View Table (hidden on small screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-5">Requirement</th>
                  <th className="py-3 px-4">Stated Minimum</th>
                  <th className="py-3 px-4">Published Evidence & Authority</th>
                  <th className="py-3 px-4">Validity / Expiry</th>
                  <th className="py-3 px-4">Evidence State</th>
                  <th className="py-3 px-5">Deterministic Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidate.requirementResults.map((row) => (
                  <tr key={row.requirementId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{row.requirementTitle}</div>
                      <div className="text-[10px] font-mono text-slate-400 capitalize">
                        {row.category} • {row.strength}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {row.statedMinimum || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-800">
                      {row.publishedEvidenceRef ? (
                        <div>
                          <div className="font-semibold text-brand-700">{row.publishedEvidenceRef}</div>
                          {row.issuingAuthority && (
                            <div className="text-[10px] text-slate-500">{row.issuingAuthority}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not published</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {row.expiryDate ? (
                        <span className={row.isExpired ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {row.expiryDate} {row.isExpired ? '(Expired)' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <CanonicalEvidenceBadge state={row.evidenceState} />
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 leading-relaxed max-w-xs">
                      {row.publishedInformationSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive View: Stacked Cards (hidden on desktop) */}
          <div className="md:hidden divide-y divide-slate-100 p-4 space-y-3">
            {candidate.requirementResults.map((row) => (
              <div key={row.requirementId} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900">{row.requirementTitle}</div>
                    <div className="text-[10px] font-mono text-slate-400 capitalize">
                      {row.category} • {row.strength}
                    </div>
                  </div>
                  <CanonicalEvidenceBadge state={row.evidenceState} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Threshold</span>
                    <span>{row.statedMinimum || '—'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Validity</span>
                    <span>{row.expiryDate || '—'}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {row.publishedInformationSummary}
                </div>
              </div>
            ))}
          </div>

          {/* Non-Marketplace Disclaimer Footer */}
          <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Evaluated against published Passport data</span>
            <span>Contractor not notified</span>
          </div>
        </div>
      )}
    </div>
  );
}

function OverallStatusBadge({ status }: { status: OverallMatchStatus }) {
  switch (status) {
    case 'aligned':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
          Aligned
        </span>
      );
    case 'partially_aligned':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
          Partially Aligned
        </span>
      );
    case 'needs_review':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
          Needs Review
        </span>
      );
    case 'insufficient_information':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-300">
          Insufficient Info
        </span>
      );
    case 'not_aligned':
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
          Not Aligned
        </span>
      );
  }
}

function CanonicalEvidenceBadge({ state }: { state: CanonicalEvidenceState }) {
  switch (state) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span>✓</span>
          <span>Verified Evidence</span>
        </span>
      );
    case 'DECLARED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <span>💬</span>
          <span>Declared</span>
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span>⌛</span>
          <span>Evidence Expired</span>
        </span>
      );
    case 'NEEDS_CLARIFICATION':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span>🔍</span>
          <span>Needs Clarification</span>
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span>—</span>
          <span>N/A</span>
        </span>
      );
    case 'MISSING':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
          <span>✕</span>
          <span>Evidence Not Found</span>
        </span>
      );
  }
}
