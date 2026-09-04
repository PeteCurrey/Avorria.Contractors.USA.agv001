'use client';

import React from 'react';
import { EvaluatedComparisonMatrix, RequirementComparisonRow } from '@/lib/compare/types';
import { CompareContractorHeader } from './CompareContractorHeader';
import { CompareEvidenceCell } from './CompareEvidenceCell';

interface ComparisonMatrixProps {
  matrix: EvaluatedComparisonMatrix;
  packId: string;
}

export function ComparisonMatrix({ matrix, packId }: ComparisonMatrixProps) {
  const { contractors, rows, compareSetId } = matrix;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Evidence Layer Legend */}
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 flex flex-wrap items-center gap-4 text-[10px] text-slate-500">
        <span className="font-bold text-slate-600 uppercase tracking-wider font-mono">Evidence Layers:</span>
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider">Layer 1 · Verified</span>
          <span>Independently reviewed by Avorria</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 font-bold uppercase tracking-wider">Layer 2 · Passport</span>
          <span>Self-published, not independently verified</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold uppercase tracking-wider">Layer 3 · Response</span>
          <span>Contractor declaration in response</span>
        </span>
      </div>

      {/* Scrollable Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {/* Requirement column header */}
              <th className="text-left p-3 w-[220px] min-w-[220px] border-r border-slate-200 sticky left-0 bg-slate-50 z-10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Requirement
                </span>
              </th>

              {/* Contractor column headers */}
              {contractors.map((c) => (
                <th
                  key={c.contractorId}
                  className="border-r border-slate-200 last:border-r-0 align-top min-w-[200px]"
                >
                  <CompareContractorHeader contractor={c} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <ComparisonRow
                key={row.requirement.id}
                row={row}
                contractors={contractors.map((c) => c.contractorId)}
                packId={packId}
                compareSetId={compareSetId}
                isEven={rowIdx % 2 === 0}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {rows.length === 0 && (
        <div className="p-10 text-center text-slate-500 text-xs">
          No requirements found in the Requirement Pack.
        </div>
      )}
    </div>
  );
}

function ComparisonRow({
  row,
  contractors,
  packId,
  compareSetId,
  isEven,
}: {
  row: RequirementComparisonRow;
  contractors: string[];
  packId: string;
  compareSetId: string;
  isEven: boolean;
}) {
  const req = row.requirement;
  const rowBg = isEven ? 'bg-white' : 'bg-slate-50/50';

  return (
    <tr className={`border-b border-slate-100 last:border-b-0 ${rowBg}`}>
      {/* Requirement Label — sticky left column */}
      <td className={`border-r border-slate-200 p-3 align-top sticky left-0 z-10 ${rowBg}`}>
        <div className="space-y-1">
          <div className="font-bold text-slate-900 leading-snug">{req.title}</div>
          <div className="flex flex-wrap items-center gap-1">
            {/* Strength */}
            {req.strength === 'required' ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
                Mandatory
              </span>
            ) : req.strength === 'preferred' ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">
                Preferred
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-100">
                Optional
              </span>
            )}
            {/* Category */}
            {req.category && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100">
                {req.category}
              </span>
            )}
          </div>
          {req.description && (
            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{req.description}</p>
          )}
        </div>
      </td>

      {/* Contractor Evidence Cells */}
      {contractors.map((contractorId) => {
        const position = row.contractorPositions[contractorId];
        return (
          <td key={contractorId} className="border-r border-slate-100 last:border-r-0 align-top">
            {position ? (
              <CompareEvidenceCell
                item={position}
                contractorId={contractorId}
                requirementId={req.id}
                compareSetId={compareSetId}
                packId={packId}
              />
            ) : (
              <div className="p-3 text-[10px] text-slate-300 italic">No position</div>
            )}
          </td>
        );
      })}
    </tr>
  );
}
