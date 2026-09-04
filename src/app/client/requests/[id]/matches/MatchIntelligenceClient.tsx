'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RequirementPack } from '@/lib/request/types';
import {
  MatchSet,
  MatchFilterOptions,
  MatchSortOption,
} from '@/lib/match/types';
import { MatchTransparencyPanel } from '@/components/match/MatchTransparencyPanel';
import { MatchFiltersToolbar } from '@/components/match/MatchFiltersToolbar';
import { ContractorMatchCard } from '@/components/match/ContractorMatchCard';

interface MatchIntelligenceClientProps {
  pack: RequirementPack;
  initialMatchSet: MatchSet;
}

export function MatchIntelligenceClient({
  pack,
  initialMatchSet,
}: MatchIntelligenceClientProps) {
  const router = useRouter();
  const [matchSet, setMatchSet] = useState<MatchSet>(initialMatchSet);
  const [filters, setFilters] = useState<MatchFilterOptions>({});
  const [sort, setSort] = useState<MatchSortOption>('verified_first');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch(`/api/client/requests/${pack.id}/matches/refresh`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refresh matches');
      }
      setMatchSet(data.matchSet);
      router.refresh();
    } catch (err: unknown) {
      setRefreshError(err instanceof Error ? err.message : 'Error refreshing matches');
    } finally {
      setIsRefreshing(false);
    }
  }

  // Client-side filtering and sorting on current match set
  const filteredCandidates = matchSet.candidates.filter((c) => {
    if (filters.verificationOnly && c.verificationStatus !== 'verified') return false;
    if (filters.territoryExactOnly && c.territoryAlignment !== 'exact') return false;
    if (filters.overallStatus && c.overallStatus !== filters.overallStatus) return false;
    if (filters.evidenceVerifiedOnly && c.alignedCount === 0) return false;
    if (filters.allRequiredAlignedOnly && c.overallStatus !== 'aligned') return false;
    return true;
  });

  filteredCandidates.sort((a, b) => {
    switch (sort) {
      case 'alignment_highest':
        if (a.alignedCount !== b.alignedCount) return b.alignedCount - a.alignedCount;
        return a.businessName.localeCompare(b.businessName);
      case 'evidence_highest':
        const aTotal = a.alignedCount + a.declaredCount;
        const bTotal = b.alignedCount + b.declaredCount;
        if (aTotal !== bTotal) return bTotal - aTotal;
        return a.businessName.localeCompare(b.businessName);
      case 'alphabetical':
        return a.businessName.localeCompare(b.businessName);
      case 'verified_first':
      default:
        if (a.verificationStatus !== b.verificationStatus) {
          return a.verificationStatus === 'verified' ? -1 : 1;
        }
        if (a.alignedCount !== b.alignedCount) {
          return b.alignedCount - a.alignedCount;
        }
        return a.businessName.localeCompare(b.businessName);
    }
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href={`/client/requests/${pack.id}`}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Request Brief
            </Link>
            <span className="text-xs text-slate-300">/</span>
            <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {pack.reference}
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {matchSet.engine_version}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Contractor Match Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deterministic Requirement-to-Evidence evaluation for {pack.title} ({pack.city}, {pack.state}).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>{isRefreshing ? '⏳' : '🔄'}</span>
            <span>{isRefreshing ? 'Re-evaluating...' : 'Refresh Matches'}</span>
          </button>

          <Link
            href={`/client/requests/${pack.id}`}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            View Brief →
          </Link>
        </div>
      </div>

      {refreshError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
          ⚠️ {refreshError}
        </div>
      )}

      {/* Stale Invalidation Alert Banner */}
      {matchSet.is_stale && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0 mt-0.5">⚠️</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Match Results Stale — Requirements Have Changed
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {matchSet.stale_reason || 'Project scope or requirements were updated since matches were calculated.'} Refresh matches to evaluate contractors against your current requirements.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Matches Now'}
          </button>
        </div>
      )}

      {/* Strict Non-Marketplace & Privacy Banner */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="text-2xl shrink-0 mt-0.5">🔒</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-300 font-bold">
                Private Buyer Intelligence
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300">Strict Non-Marketplace Standard</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              Contractors Have Not Been Notified
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
              This intelligence set matches your structured Requirement Pack against published contractor Passport evidence. No contractors are notified of this evaluation. There is zero public bidding, pricing competition, or auction mechanism.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            Total Evaluated
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {matchSet.total_contractors_evaluated}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Published directory profiles</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            Eligible Candidates
          </span>
          <div className="text-2xl font-bold text-brand-600 mt-1">
            {matchSet.eligible_contractors_count}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Passed trade & territory gate</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            Verified by Avorria
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {matchSet.verified_contractors_count}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Audited criteria on record</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            Engine Version
          </span>
          <div className="text-sm font-mono font-bold text-slate-800 mt-2">
            {matchSet.engine_version}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Snapshot: {new Date(matchSet.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Match Transparency Panel */}
      <MatchTransparencyPanel />

      {/* Filter and Sort Toolbar */}
      <MatchFiltersToolbar
        filters={filters}
        sort={sort}
        totalMatches={filteredCandidates.length}
        onFilterChange={setFilters}
        onSortChange={setSort}
        onReset={() => setFilters({})}
      />

      {/* Candidate Contractor Cards List */}
      <div className="space-y-6">
        {filteredCandidates.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl mb-4">
              🔍
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching contractors found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No contractors match the current filter selection in {pack.city}, {pack.state}. Try resetting active filters or adjusting trade categories in the request brief.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setFilters({})}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-all shadow-xs"
              >
                Reset Filters
              </button>
              <Link
                href={`/client/requests/${pack.id}`}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
              >
                Edit Request Brief
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCandidates.map((candidate) => (
              <ContractorMatchCard key={candidate.contractorId} candidate={candidate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
