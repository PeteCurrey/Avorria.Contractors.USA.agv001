'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequirementPack } from '@/lib/request/types';
import { ResponseCentreSummary } from '@/lib/respond/types';
import { EvaluatedComparisonMatrix } from '@/lib/compare/types';
import { ComparisonMatrix } from '@/components/compare/ComparisonMatrix';
import { CompareAttentionPanel } from '@/components/compare/CompareAttentionPanel';

interface CompareWorkspaceClientProps {
  pack: RequirementPack;
  responseCentre: ResponseCentreSummary;
  initialMatrix?: EvaluatedComparisonMatrix | null;
}

export function CompareWorkspaceClient({
  pack,
  responseCentre,
  initialMatrix,
}: CompareWorkspaceClientProps) {
  const router = useRouter();

  const submittedResponses = responseCentre.invitations.filter(
    (i) => i.response?.status === 'submitted'
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<EvaluatedComparisonMatrix | null>(initialMatrix || null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleContractor(contractorId: string) {
    setSelectedIds((prev) =>
      prev.includes(contractorId)
        ? prev.filter((id) => id !== contractorId)
        : [...prev, contractorId]
    );
  }

  async function handleCreateComparison() {
    if (selectedIds.length < 2) {
      setError('Select at least 2 contractors to compare.');
      return;
    }
    if (selectedIds.length > 6) {
      setError('You can compare a maximum of 6 contractors at a time.');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch(`/api/client/requests/${pack.id}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create comparison');

      setMatrix(data.matrix);
      // Update URL to reflect the compare set without full navigation
      router.replace(`/client/requests/${pack.id}/compare?compareId=${data.matrix.compareSetId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create comparison');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRefresh() {
    if (!matrix) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/client/requests/${pack.id}/compare/${matrix.compareSetId}/refresh`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refresh comparison');
      setMatrix(data.matrix);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to refresh comparison');
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleNewComparison() {
    setMatrix(null);
    setSelectedIds([]);
    router.replace(`/client/requests/${pack.id}/compare`);
  }

  // ─────────────────────────────────────────────────────────
  // If matrix is loaded → show comparison workspace
  // ─────────────────────────────────────────────────────────
  if (matrix) {
    return (
      <div className="space-y-6">
        {/* Stale Banner */}
        {matrix.isStale && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>⚠</span>
                <span>This comparison is stale</span>
              </div>
              {matrix.staleReason && (
                <p className="text-[11px] text-amber-700 mt-0.5">{matrix.staleReason}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold shrink-0"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Comparison'}
            </button>
          </div>
        )}

        {/* Engine Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
            <span>Engine: {matrix.engineVersion}</span>
            <span>·</span>
            <span>Generated: {new Date(matrix.generatedAt).toLocaleString()}</span>
            <span>·</span>
            <span>
              {matrix.contractors.length} contractor{matrix.contractors.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!matrix.isStale && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
            <button
              type="button"
              onClick={handleNewComparison}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold"
            >
              ← New Comparison
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Evidence Architecture Notice */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-xs text-slate-600 flex items-start gap-3">
          <span className="text-base mt-0.5">⚖️</span>
          <div>
            <div className="font-bold text-slate-800 mb-1">Evidence-Led Factual Comparison</div>
            <div>
              This workspace presents contractor positions requirement-by-requirement against three evidence layers.
              Avorria does not rank contractors, assign suitability scores, or indicate a preferred selection.
              The client remains responsible for selecting a contractor based on the factual evidence presented.
            </div>
          </div>
        </div>

        {/* Attention Panel */}
        <CompareAttentionPanel
          items={matrix.attentionSummary.items}
          totalClarificationsNeeded={matrix.attentionSummary.totalClarificationsNeeded}
          totalEvidenceGaps={matrix.attentionSummary.totalEvidenceGaps}
          verifiedContractorsCount={matrix.attentionSummary.verifiedContractorsCount}
          unverifiedContractorsCount={matrix.attentionSummary.unverifiedContractorsCount}
        />

        {/* Comparison Matrix */}
        <ComparisonMatrix matrix={matrix} packId={pack.id} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Contractor Selection UI
  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Explainer */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-xs text-slate-600 flex items-start gap-3">
        <span className="text-base mt-0.5">🔎</span>
        <div>
          <div className="font-bold text-slate-800 mb-1">Evidence-Led Contractor Comparison</div>
          <div>
            Select 2–6 contractors with submitted responses to generate a structured side-by-side comparison
            against your Requirement Pack. Avorria exposes the underlying evidence and response states.
            No rankings, scores, or recommendations are generated.
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Submitted Responses List */}
      {submittedResponses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
          <span className="text-3xl">📋</span>
          <h3 className="text-base font-bold text-slate-800 mt-2">No Submitted Responses</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Comparison requires at least 2 contractor responses. No contractors have submitted responses yet.
          </p>
        </div>
      ) : submittedResponses.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-white">
          <span className="text-3xl">📋</span>
          <h3 className="text-base font-bold text-slate-800 mt-2">Only 1 Response Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Comparison requires at least 2 submitted responses. Invite more contractors from the Match Set.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Select Contractors to Compare</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedIds.length} of {submittedResponses.length} selected
                {selectedIds.length > 0 && ` · minimum 2, maximum 6`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateComparison}
              disabled={selectedIds.length < 2 || selectedIds.length > 6 || isCreating}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all flex items-center gap-1.5"
            >
              {isCreating ? (
                <>
                  <span className="animate-pulse">⚙</span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>⚖️</span>
                  <span>Compare Selected ({selectedIds.length})</span>
                </>
              )}
            </button>
          </div>

          {submittedResponses.map((item) => {
            const cId = item.invitation.contractor_id;
            const isSelected = selectedIds.includes(cId);
            const atLimit = selectedIds.length >= 6 && !isSelected;

            return (
              <label
                key={item.invitation.id}
                className={`flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all shadow-2xs ${
                  isSelected
                    ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300'
                    : atLimit
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={atLimit}
                  onChange={() => !atLimit && toggleContractor(cId)}
                  className="mt-0.5 accent-brand-600 w-4 h-4 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {item.invitation.contractor_name || cId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Response Submitted
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    {item.response?.submitted_at && (
                      <span>
                        Submitted {new Date(item.response.submitted_at).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-emerald-700 font-medium">
                      {item.confirmedCount} confirmed
                    </span>
                    {item.cannotConfirmCount > 0 && (
                      <span className="text-rose-700 font-medium">
                        {item.cannotConfirmCount} cannot confirm
                      </span>
                    )}
                    {item.requiresClarificationCount > 0 && (
                      <span className="text-amber-700 font-medium">
                        {item.requiresClarificationCount} clarification
                      </span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}

          {selectedIds.length >= 6 && (
            <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              Maximum of 6 contractors selected. Deselect one to change your selection.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
