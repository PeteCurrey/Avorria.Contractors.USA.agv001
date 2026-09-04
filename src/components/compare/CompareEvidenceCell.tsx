'use client';

import React from 'react';
import { CompareContractorRequirementItem } from '@/lib/compare/types';

interface CompareEvidenceCellProps {
  item: CompareContractorRequirementItem;
  contractorId: string;
  requirementId: string;
  compareSetId: string;
  packId: string;
  onClarificationRequested?: (contractorId: string, requirementId: string) => void;
}

export function CompareEvidenceCell({
  item,
  contractorId,
  requirementId,
  compareSetId,
  packId,
  onClarificationRequested,
}: CompareEvidenceCellProps) {
  const [requesting, setRequesting] = React.useState(false);
  const [done, setDone] = React.useState(item.clarification_status === 'requested');

  async function handleClarify() {
    setRequesting(true);
    try {
      await fetch(`/api/client/requests/${packId}/compare/${compareSetId}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId, requirementId }),
      });
      setDone(true);
      onClarificationRequested?.(contractorId, requirementId);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="p-3 space-y-1.5 min-w-[160px]">
      {/* Response Status */}
      <ResponseStatusBadge status={item.response_status} />

      {/* Evidence State */}
      <EvidenceStateBadge state={item.evidence_state} reference={item.verification_reference} />

      {/* Contractor Comment */}
      {item.contractor_comment && (
        <p className="text-[10px] text-slate-600 italic border-l-2 border-slate-200 pl-2 leading-snug">
          "{item.contractor_comment}"
        </p>
      )}

      {/* Clarification CTA */}
      {item.response_status === 'requires_clarification' && (
        <div className="pt-0.5">
          {done ? (
            <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
              <span>🔔</span> Clarification flagged
            </span>
          ) : (
            <button
              type="button"
              onClick={handleClarify}
              disabled={requesting}
              className="text-[10px] text-amber-700 font-bold border border-amber-300 bg-amber-50 hover:bg-amber-100 rounded px-2 py-0.5 transition-colors"
            >
              {requesting ? 'Flagging...' : 'Flag Clarification'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResponseStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          ✓ Confirmed
        </span>
      );
    case 'cannot_confirm':
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          ✕ Cannot Confirm
        </span>
      );
    case 'requires_clarification':
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          🔍 Clarification Needed
        </span>
      );
    case 'not_applicable':
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
          — Not Applicable
        </span>
      );
    case 'unanswered':
    default:
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-200">
          ○ Unanswered
        </span>
      );
  }
}

function EvidenceStateBadge({
  state,
  reference,
}: {
  state: string;
  reference?: string;
}) {
  switch (state) {
    case 'VERIFIED':
      return (
        <div>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
            Layer 1 · Verified
          </span>
          {reference && (
            <div className="font-mono text-[9px] text-slate-400 mt-0.5">{reference}</div>
          )}
        </div>
      );
    case 'DECLARED':
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-100">
          Layer 2 · Passport
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          ⚠ Evidence Expired
        </span>
      );
    case 'NEEDS_CLARIFICATION':
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
          Evidence Needs Clarification
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100">
          N/A
        </span>
      );
    case 'MISSING':
    default:
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100">
          No Evidence
        </span>
      );
  }
}
