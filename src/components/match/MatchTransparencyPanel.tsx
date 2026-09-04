'use client';

import React, { useState } from 'react';

export function MatchTransparencyPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">ℹ️</span>
          <div>
            <span className="text-xs font-bold text-slate-800">
              How Matching & Requirement Alignment Works
            </span>
            <span className="text-[11px] text-slate-500 block sm:inline sm:ml-2">
              (Deterministic evaluation principles & non-recommendation standard)
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-400">
          {isOpen ? '▲ Hide' : '▼ Read Details'}
        </span>
      </button>

      {isOpen && (
        <div className="p-5 sm:p-6 border-t border-slate-200 text-xs text-slate-600 space-y-3.5 leading-relaxed bg-white">
          <p>
            <strong className="text-slate-900">Deterministic Evidence Comparison:</strong> Avorria compares your project's stated trade, operating territory, and structured compliance requirements against contractor information and documentary records published on Avorria Passports.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">What Matching Determines:</strong>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Whether the contractor operates in the required trade or related cluster.</li>
                <li>Whether the contractor serves the project city or state.</li>
                <li>Whether published documents (e.g. COI, licenses) align with requested thresholds and validity dates.</li>
                <li>Whether verification criteria have been independently audited by Avorria (<span className="font-mono text-[11px]">AV-VER-XXXXXX</span>).</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">What Matching Does NOT Do:</strong>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Does not provide subjective quality scores or fake AI rankings.</li>
                <li>Does not constitute a legal, insurance, or OSHA regulatory determination.</li>
                <li>Does not guarantee contractor suitability or project performance.</li>
                <li>Does not notify contractors or initiate public price bidding.</li>
              </ul>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic pt-1">
            Avorria acts as an evidence-aware verification and intelligence infrastructure. Commercial buyers remain responsible for exercising independent due diligence prior to contract execution.
          </p>
        </div>
      )}
    </div>
  );
}
