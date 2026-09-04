'use client';

import React from 'react';
import { MatchFilterOptions, MatchSortOption, OverallMatchStatus } from '@/lib/match/types';

interface MatchFiltersToolbarProps {
  filters: MatchFilterOptions;
  sort: MatchSortOption;
  totalMatches: number;
  onFilterChange: (newFilters: MatchFilterOptions) => void;
  onSortChange: (newSort: MatchSortOption) => void;
  onReset: () => void;
}

export function MatchFiltersToolbar({
  filters,
  sort,
  totalMatches,
  onFilterChange,
  onSortChange,
  onReset,
}: MatchFiltersToolbarProps) {
  const hasActiveFilters =
    Boolean(filters.verificationOnly) ||
    Boolean(filters.territoryExactOnly) ||
    Boolean(filters.overallStatus) ||
    Boolean(filters.evidenceVerifiedOnly);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">
            {totalMatches} Candidate Contractor{totalMatches === 1 ? '' : 's'}
          </span>
          <span className="text-xs text-slate-400 font-mono">• Evaluated Deterministically</span>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="match-sort" className="font-bold text-slate-500 shrink-0">
            Order By:
          </label>
          <select
            id="match-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as MatchSortOption)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="verified_first">Verified by Avorria First</option>
            <option value="alignment_highest">Most Aligned Criteria First</option>
            <option value="evidence_highest">Most Published Evidence First</option>
            <option value="alphabetical">Business Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Verified by Avorria Toggle */}
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, verificationOnly: !filters.verificationOnly })}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all border flex items-center gap-1.5 ${
            filters.verificationOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span>🛡️</span>
          <span>Verified Only</span>
        </button>

        {/* Territory Exact Toggle */}
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, territoryExactOnly: !filters.territoryExactOnly })}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all border flex items-center gap-1.5 ${
            filters.territoryExactOnly
              ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span>📍</span>
          <span>City Exact Coverage</span>
        </button>

        {/* Status Filter */}
        <select
          value={filters.overallStatus || ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              overallStatus: (e.target.value as OverallMatchStatus) || undefined,
            })
          }
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Match Alignments</option>
          <option value="aligned">Aligned (All Required Evidence Met)</option>
          <option value="partially_aligned">Partially Aligned (Some Declared)</option>
          <option value="needs_review">Needs Review (Clarifications Pending)</option>
          <option value="insufficient_information">Insufficient Information</option>
        </select>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-brand-600 hover:text-brand-800 font-bold ml-auto"
          >
            Clear Filters ✕
          </button>
        )}
      </div>
    </div>
  );
}
