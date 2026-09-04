'use client';

import React from 'react';
import Link from 'next/link';
import {
  ContractorMatchPreviewResult,
  RequirementMatrixRow,
  EvidenceAlignmentStatus,
} from '@/lib/request/types';
import { VerifiedByAvorriaBadge } from '@/components/passport/VerifiedByAvorriaBadge';
import { ShieldCheck } from 'lucide-react';

interface RequirementEvidenceMatrixProps {
  candidate: ContractorMatchPreviewResult;
  showPassportLink?: boolean;
}

export function RequirementEvidenceMatrix({
  candidate,
  showPassportLink = true,
}: RequirementEvidenceMatrixProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Contractor Header Bar */}
      <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-base font-bold text-slate-900">{candidate.businessName}</h3>
            {candidate.isVerified && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Verified by Avorria</span>
                {candidate.verificationReference && (
                  <span className="font-mono text-[10px] text-emerald-700">({candidate.verificationReference})</span>
                )}
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">• {candidate.primaryTrade}</span>
            <span className="text-xs text-slate-400">• {candidate.location}</span>
          </div>

          {/* Transparent Match Reasons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {candidate.matchReasons.map((reason, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium"
              >
                ✓ {reason}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">
                {candidate.alignedCount} / {candidate.requirementMatrix.length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Evidence Aligned</div>
            </div>
          </div>

          {showPassportLink && (
            <Link
              href={`/contractors/${candidate.slug}`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>Inspect Passport</span>
              <span>↗</span>
            </Link>
          )}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/50 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-5">Requirement & Category</th>
              <th className="py-3 px-4">Threshold / Level</th>
              <th className="py-3 px-4">Enforcement</th>
              <th className="py-3 px-4">Alignment Status</th>
              <th className="py-3 px-5">Published Evidence Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {candidate.requirementMatrix.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No structured requirements were specified in this pack.
                </td>
              </tr>
            ) : (
              candidate.requirementMatrix.map((row) => (
                <tr key={row.requirementId} className="hover:bg-slate-50/50 transition-colors">
                  {/* Title & Category */}
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-900">{row.requirementTitle}</div>
                    <div className="text-[11px] font-mono text-slate-500 capitalize">{row.category}</div>
                  </td>

                  {/* Threshold */}
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {row.minimumValue || '—'}
                  </td>

                  {/* Strength */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        row.strength === 'required'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : row.strength === 'preferred'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {row.strength}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={row.evidenceAlignmentStatus} />
                  </td>

                  {/* Evidence Analysis */}
                  <td className="py-3.5 px-5 text-slate-600 leading-relaxed">
                    <div>{row.evidenceSummary}</div>
                    {row.publishedDocumentRef && (
                      <div className="text-[11px] font-mono text-brand-600 mt-0.5">
                        📎 Ref: {row.publishedDocumentRef}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Non-Marketplace Notice */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <span>🔒</span>
          <span>Private Preliminary Match Preview — The contractor has NOT been notified.</span>
        </div>
        <div className="text-slate-400">
          Evaluated strictly against published contractor Passport evidence.
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: EvidenceAlignmentStatus }) {
  switch (status) {
    case 'aligned':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span>✓</span>
          <span>Aligned</span>
        </span>
      );
    case 'declared':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <span>💬</span>
          <span>Declared</span>
        </span>
      );
    case 'needs_review':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span>🔍</span>
          <span>Needs Review</span>
        </span>
      );
    case 'not_applicable':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span>—</span>
          <span>N/A</span>
        </span>
      );
    case 'not_found':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
          <span>✕</span>
          <span>Not Found</span>
        </span>
      );
  }
}
