'use client';

import React from 'react';
import { ComparisonContractorSummary } from '@/lib/compare/types';

interface CompareContractorHeaderProps {
  contractor: ComparisonContractorSummary;
}

export function CompareContractorHeader({ contractor }: CompareContractorHeaderProps) {
  return (
    <div className="space-y-2 p-3">
      {/* Business Name */}
      <div className="font-bold text-sm text-slate-900 leading-tight">
        {contractor.businessName}
      </div>

      {/* Verification Badge */}
      {contractor.verificationStatus === 'verified' ? (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Avorria Verified
          </span>
          {contractor.verificationReference && (
            <div className="font-mono text-[9px] text-slate-500 pt-0.5">
              {contractor.verificationReference}
            </div>
          )}
        </div>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          Passport Published
        </span>
      )}

      {/* Availability */}
      <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
        <div>
          <span className="font-mono uppercase tracking-wider text-slate-400">Availability: </span>
          <span className="capitalize font-medium text-slate-700">
            {contractor.availabilityStatus.replace(/_/g, ' ')}
          </span>
        </div>
        {contractor.proposedStartDate && (
          <div>
            <span className="font-mono uppercase tracking-wider text-slate-400">Start: </span>
            <span className="font-medium text-slate-700">{contractor.proposedStartDate}</span>
          </div>
        )}
        {contractor.proposedCompletionDate && (
          <div>
            <span className="font-mono uppercase tracking-wider text-slate-400">End: </span>
            <span className="font-medium text-slate-700">{contractor.proposedCompletionDate}</span>
          </div>
        )}
      </div>

      {/* Declaration Summary */}
      <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
        <div className="bg-emerald-50 rounded px-1.5 py-1 text-center">
          <div className="font-bold text-emerald-700">{contractor.confirmedCount}</div>
          <div className="text-emerald-600 uppercase tracking-wider font-mono">Confirmed</div>
        </div>
        <div className="bg-rose-50 rounded px-1.5 py-1 text-center">
          <div className="font-bold text-rose-700">{contractor.cannotConfirmCount}</div>
          <div className="text-rose-600 uppercase tracking-wider font-mono">Cannot</div>
        </div>
        {contractor.clarificationCount > 0 && (
          <div className="bg-amber-50 rounded px-1.5 py-1 text-center">
            <div className="font-bold text-amber-700">{contractor.clarificationCount}</div>
            <div className="text-amber-600 uppercase tracking-wider font-mono">Clarify</div>
          </div>
        )}
        {contractor.unansweredCount > 0 && (
          <div className="bg-slate-50 rounded px-1.5 py-1 text-center">
            <div className="font-bold text-slate-600">{contractor.unansweredCount}</div>
            <div className="text-slate-500 uppercase tracking-wider font-mono">Unanswered</div>
          </div>
        )}
      </div>
    </div>
  );
}
