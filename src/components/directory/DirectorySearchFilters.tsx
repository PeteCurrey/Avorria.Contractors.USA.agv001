'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { STANDARD_TRADES } from '@/lib/trades/registry';

interface Props {
  initialQuery?: string;
  initialTrade?: string;
  initialLocation?: string;
  initialVerificationStatus?: string;
  initialSort?: string;
  totalResults: number;
}

export function DirectorySearchFilters({
  initialQuery = '',
  initialTrade = '',
  initialLocation = '',
  initialVerificationStatus = 'all',
  initialSort = 'relevance',
  totalResults,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [trade, setTrade] = useState(initialTrade);
  const [location, setLocation] = useState(initialLocation);
  const [verificationStatus, setVerificationStatus] = useState(initialVerificationStatus);
  const [sort, setSort] = useState(initialSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const applyFilters = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();

    const q = overrides?.query !== undefined ? overrides.query : query;
    const t = overrides?.trade !== undefined ? overrides.trade : trade;
    const l = overrides?.location !== undefined ? overrides.location : location;
    const v = overrides?.verificationStatus !== undefined ? overrides.verificationStatus : verificationStatus;
    const s = overrides?.sort !== undefined ? overrides.sort : sort;

    if (q.trim()) params.set('q', q.trim());
    if (t && t !== 'all') params.set('trade', t);
    if (l.trim()) params.set('location', l.trim());
    if (v && v !== 'all') params.set('verification', v);
    if (s && s !== 'relevance') params.set('sort', s);

    const queryString = params.toString();
    router.push(queryString ? `/contractors?${queryString}` : '/contractors');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleReset = () => {
    setQuery('');
    setTrade('');
    setLocation('');
    setVerificationStatus('all');
    setSort('relevance');
    router.push('/contractors');
  };

  const hasActiveFilters = Boolean(
    query.trim() || (trade && trade !== 'all') || location.trim() || (verificationStatus && verificationStatus !== 'all') || (sort && sort !== 'relevance')
  );

  return (
    <div className="space-y-4">
      {/* Primary Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch"
      >
        {/* Keyword Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-xs">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search contractor name or services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-slate-50/50"
          />
        </div>

        {/* Trade Select */}
        <div className="w-full md:w-56">
          <select
            value={trade}
            onChange={(e) => {
              setTrade(e.target.value);
              applyFilters({ trade: e.target.value });
            }}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-slate-50/50"
          >
            <option value="">All Trades & Specialties</option>
            {STANDARD_TRADES.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Input */}
        <div className="w-full md:w-48 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-xs">
            📍
          </div>
          <input
            type="text"
            placeholder="City or State (e.g. TX)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-slate-50/50"
          />
        </div>

        {/* Search CTA */}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors shadow-sm shrink-0"
        >
          Search
        </button>
      </form>

      {/* Filter Chips & Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Verification Status Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => {
              setVerificationStatus('all');
              applyFilters({ verificationStatus: 'all' });
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
              verificationStatus === 'all'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            All Contractors
          </button>
          <button
            type="button"
            onClick={() => {
              setVerificationStatus('verified');
              applyFilters({ verificationStatus: 'verified' });
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
              verificationStatus === 'verified'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <span>Verified by Avorria</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>
        </div>

        {/* Sort & Result Counter */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-xs text-slate-500 font-medium">
            <strong>{totalResults}</strong> {totalResults === 1 ? 'contractor' : 'contractors'} available
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                applyFilters({ sort: e.target.value });
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="verified_first">Verified First</option>
              <option value="readiness">Readiness Score</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
