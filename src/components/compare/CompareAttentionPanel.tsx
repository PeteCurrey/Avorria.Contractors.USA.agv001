'use client';

import React from 'react';
import { AttentionItem } from '@/lib/compare/types';

interface CompareAttentionPanelProps {
  items: AttentionItem[];
  totalClarificationsNeeded: number;
  totalEvidenceGaps: number;
  verifiedContractorsCount: number;
  unverifiedContractorsCount: number;
}

export function CompareAttentionPanel({
  items,
  totalClarificationsNeeded,
  totalEvidenceGaps,
  verifiedContractorsCount,
  unverifiedContractorsCount,
}: CompareAttentionPanelProps) {
  if (items.length === 0 && unverifiedContractorsCount === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
        <div className="font-bold text-slate-800 mb-1">No attention items identified</div>
        <div>All contractors have confirmed project requirements and evidence states are current.</div>
      </div>
    );
  }

  const clarificationItems = items.filter((i) => i.type === 'clarification_required');
  const evidenceGapItems = items.filter((i) => i.type === 'evidence_gap');
  const unconfirmedItems = items.filter((i) => i.type === 'unconfirmed_criteria');
  const scheduleItems = items.filter((i) => i.type === 'schedule_divergence');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Attention Summary</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Factual items identified across all contractor positions. Avorria does not rank or assess these items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalClarificationsNeeded > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              {totalClarificationsNeeded} Clarification{totalClarificationsNeeded !== 1 ? 's' : ''}
            </span>
          )}
          {totalEvidenceGaps > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              {totalEvidenceGaps} Evidence Gap{totalEvidenceGaps !== 1 ? 's' : ''}
            </span>
          )}
          {verifiedContractorsCount > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              {verifiedContractorsCount} Avorria Verified
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Clarifications Needed */}
        {clarificationItems.length > 0 && (
          <AttentionGroup
            title="Contractor Clarifications Required"
            description="The following contractors indicated that one or more requirements need clarification before they can confirm."
            icon="🔍"
            colorClass="amber"
            items={clarificationItems}
          />
        )}

        {/* Unconfirmed Mandatory Criteria */}
        {unconfirmedItems.length > 0 && (
          <AttentionGroup
            title="Mandatory Requirements Not Confirmed"
            description="The following contractors stated they cannot confirm one or more mandatory project requirements."
            icon="✕"
            colorClass="rose"
            items={unconfirmedItems}
          />
        )}

        {/* Evidence Gaps */}
        {evidenceGapItems.length > 0 && (
          <AttentionGroup
            title="Evidence Gaps Identified"
            description="The following contractors have expired or missing Avorria Passport evidence relevant to project requirements."
            icon="⚠"
            colorClass="amber"
            items={evidenceGapItems}
          />
        )}

        {/* Schedule Conditions */}
        {scheduleItems.length > 0 && (
          <AttentionGroup
            title="Availability Conditions Noted"
            description="The following contractors declared conditional or limited availability."
            icon="📅"
            colorClass="slate"
            items={scheduleItems}
          />
        )}

        {/* Unverified notice */}
        {unverifiedContractorsCount > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
            <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <span>ℹ</span>
              <span>{unverifiedContractorsCount} contractor{unverifiedContractorsCount !== 1 ? 's have' : ' has'} not been independently verified by Avorria</span>
            </div>
            <div>
              Their evidence is self-published to their Avorria Passport (Layer 2) and has not been independently reviewed.
              Avorria Verified contractors carry a reference number (e.g. AV-VER-XXXXXX).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AttentionGroup({
  title,
  description,
  icon,
  colorClass,
  items,
}: {
  title: string;
  description: string;
  icon: string;
  colorClass: 'amber' | 'rose' | 'slate';
  items: AttentionItem[];
}) {
  const borderColor = {
    amber: 'border-amber-200',
    rose: 'border-rose-200',
    slate: 'border-slate-200',
  }[colorClass];

  const bgColor = {
    amber: 'bg-amber-50',
    rose: 'bg-rose-50',
    slate: 'bg-slate-50',
  }[colorClass];

  const textColor = {
    amber: 'text-amber-800',
    rose: 'text-rose-800',
    slate: 'text-slate-700',
  }[colorClass];

  const labelColor = {
    amber: 'text-amber-700',
    rose: 'text-rose-700',
    slate: 'text-slate-600',
  }[colorClass];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h4 className={`text-xs font-bold ${textColor}`}>{title}</h4>
      </div>
      <p className="text-[11px] text-slate-500 mb-2">{description}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-xl border ${borderColor} ${bgColor} px-4 py-3 text-xs`}
          >
            <div className={`font-bold ${labelColor} mb-0.5`}>{item.contractorName}</div>
            {item.requirementTitle && (
              <div className="text-slate-500 text-[10px] uppercase tracking-wider font-mono mb-1">
                Requirement: {item.requirementTitle}
              </div>
            )}
            <div className="text-slate-700 leading-snug">{item.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
