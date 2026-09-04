'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DiscoverOpportunity,
  DiscoverSummaryCounts,
  DiscoverQueryResult,
  DiscoverQueryInput,
  ClosingDateStatus,
} from '@/lib/discover/types';

interface ProfileContext {
  organizationName: string;
  primaryTrade: string;
  additionalTrades: string[];
  statesLicensed: string[];
  passportPublished: boolean;
  passportVersion: string | null;
}

interface DiscoverHubProps {
  contractorOrgId: string;
  profileContext: ProfileContext;
  initialData: DiscoverQueryResult;
}

const CLOSING_BADGE_STYLE: Record<ClosingDateStatus, { color: string; border: string; bg: string }> = {
  CLOSED: { color: '#ef4444', border: '#450a0a', bg: '#180808' },
  CLOSING_TODAY: { color: '#f59e0b', border: '#78350f', bg: '#1c1005' },
  CLOSING_SOON: { color: '#eab308', border: '#713f12', bg: '#1a1406' },
  OPEN: { color: '#10b981', border: '#064e3b', bg: '#041711' },
  NO_CLOSING_DATE: { color: '#6b7280', border: '#1f2937', bg: '#0b0f19' },
};

export function DiscoverHub({
  contractorOrgId,
  profileContext,
  initialData,
}: DiscoverHubProps) {
  const router = useRouter();
  const [data, setData] = useState<DiscoverQueryResult>(initialData);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [closingFilter, setClosingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('published_date');
  const [page, setPage] = useState<number>(1);

  // Saving in-flight indicator map
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  // Fetch opportunities matching current filter parameters
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (tradeFilter !== 'all') params.set('trade', tradeFilter);
      if (stateFilter !== 'all') params.set('state', stateFilter);
      if (closingFilter !== 'all') params.set('closing_filter', closingFilter);
      if (sortBy) params.set('sort_by', sortBy);
      params.set('page', page.toString());
      params.set('limit', '20');

      const res = await fetch(`/api/workspace/win-work/discover?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        startTransition(() => {
          setData(json);
        });
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, tradeFilter, stateFilter, closingFilter, sortBy, page]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Handle Save / Watchlist Toggle
  const handleToggleSave = async (oppId: string, currentSaved: boolean) => {
    setSavingMap((prev) => ({ ...prev, [oppId]: true }));

    // Optimistic UI update
    setData((prev) => {
      const updatedOpps = prev.opportunities.map((o) =>
        o.id === oppId ? { ...o, is_saved: !currentSaved } : o
      );
      const delta = currentSaved ? -1 : 1;
      return {
        ...prev,
        opportunities: updatedOpps,
        summary: {
          ...prev.summary,
          saved: Math.max(0, prev.summary.saved + delta),
        },
      };
    });

    try {
      const res = await fetch(`/api/workspace/win-work/discover/${oppId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: currentSaved ? 'unsave' : 'save' }),
      });
      if (!res.ok) {
        // Rollback if failed
        setData((prev) => ({
          ...prev,
          opportunities: prev.opportunities.map((o) =>
            o.id === oppId ? { ...o, is_saved: currentSaved } : o
          ),
          summary: {
            ...prev.summary,
            saved: Math.max(0, prev.summary.saved + (currentSaved ? 1 : -1)),
          },
        }));
      }
    } catch {
      // Rollback
      setData((prev) => ({
        ...prev,
        opportunities: prev.opportunities.map((o) =>
          o.id === oppId ? { ...o, is_saved: currentSaved } : o
        ),
      }));
    } finally {
      setSavingMap((prev) => ({ ...prev, [oppId]: false }));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTradeFilter('all');
    setStateFilter('all');
    setClosingFilter('all');
    setSortBy('published_date');
    setPage(1);
  };

  const { opportunities, summary, total, totalPages } = data;

  const summaryTabs = [
    { key: 'all', label: 'All Opportunities', count: summary.all },
    { key: 'open', label: 'Open', count: summary.open },
    { key: 'closing_soon', label: 'Closing Soon', count: summary.closing_soon },
    { key: 'new', label: 'New (7d)', count: summary.new },
    { key: 'saved', label: 'Saved Watchlist', count: summary.saved },
    { key: 'closed', label: 'Closed', count: summary.closed },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      padding: '32px 40px',
      fontFamily: 'Work Sans, sans-serif',
    }}>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#4b5563',
          marginBottom: '6px',
        }}>
          Win Work · Commercial Intelligence
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 300,
          color: '#f9fafb',
          margin: '0 0 4px 0',
          letterSpacing: '-0.01em',
        }}>
          DISCOVER
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, fontWeight: 300 }}>
          Find commercial opportunities relevant to your business. Factual intelligence without arbitrary scoring.
        </p>
      </div>

      {/* ─── Factual Profile Context Strip ("YOUR PROFILE") ─── */}
      <div style={{
        background: '#050811',
        border: '1px solid #111827',
        padding: '12px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '2px' }}>
              Your Business
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#e5e7eb' }}>
              {profileContext.organizationName}
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#1f2937' }} />
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '2px' }}>
              Primary Trade
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#9ca3af' }}>
              {profileContext.primaryTrade}
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#1f2937' }} />
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '2px' }}>
              Territory
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#9ca3af' }}>
              {profileContext.statesLicensed.length > 0 ? profileContext.statesLicensed.join(', ') : 'TX'}
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#1f2937' }} />
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '2px' }}>
              Passport Standing
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, color: profileContext.passportPublished ? '#10b981' : '#6b7280' }}>
              {profileContext.passportPublished ? `Published (${profileContext.passportVersion || 'Active'})` : 'Unpublished Draft'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.65rem', color: '#4b5563', fontStyle: 'italic' }}>
          * Factual discovery profile. Match criteria will be assessed in Phase 11.
        </div>
      </div>

      {/* ─── Clickable Summary Count Strip ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '1px',
        background: '#111827',
        border: '1px solid #111827',
        marginBottom: '24px',
      }}>
        {summaryTabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              style={{
                background: isActive ? '#0d1322' : '#090d16',
                border: 'none',
                borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                padding: '14px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 0,
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 300,
                color: isActive ? '#60a5fa' : '#e5e7eb',
                lineHeight: 1,
                marginBottom: '4px',
              }}>
                {tab.count}
              </div>
              <div style={{
                fontSize: '0.6rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isActive ? '#93c5fd' : '#4b5563',
              }}>
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Search and Filtering Toolbar ─── */}
      <div style={{
        background: '#070a12',
        border: '1px solid #111827',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Search Input */}
        <div style={{ flex: '1 1 260px', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search opportunities, buyers, scopes, trades, cities..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              background: '#090d16',
              border: '1px solid #1f2937',
              padding: '8px 12px',
              color: '#f3f4f6',
              fontSize: '0.75rem',
              fontFamily: 'Work Sans, sans-serif',
              borderRadius: 0,
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Trade Filter */}
          <select
            value={tradeFilter}
            onChange={(e) => {
              setTradeFilter(e.target.value);
              setPage(1);
            }}
            style={{
              background: '#090d16',
              border: '1px solid #1f2937',
              color: '#9ca3af',
              fontSize: '0.7rem',
              padding: '7px 10px',
              fontFamily: 'Work Sans, sans-serif',
              borderRadius: 0,
              outline: 'none',
            }}
          >
            <option value="all">All Trades</option>
            <option value="electrical-contracting">Electrical Contracting</option>
            <option value="hvac-mechanical">HVAC & Mechanical</option>
            <option value="commercial-plumbing">Commercial Plumbing</option>
            <option value="commercial-roofing">Commercial Roofing</option>
            <option value="general-contracting">General Contracting</option>
            <option value="concrete-masonry">Concrete & Masonry</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setPage(1);
            }}
            style={{
              background: '#090d16',
              border: '1px solid #1f2937',
              color: '#9ca3af',
              fontSize: '0.7rem',
              padding: '7px 10px',
              fontFamily: 'Work Sans, sans-serif',
              borderRadius: 0,
              outline: 'none',
            }}
          >
            <option value="all">All States</option>
            <option value="TX">Texas (TX)</option>
            <option value="NM">New Mexico (NM)</option>
            <option value="OK">Oklahoma (OK)</option>
            <option value="LA">Louisiana (LA)</option>
          </select>

          {/* Closing Window Filter */}
          <select
            value={closingFilter}
            onChange={(e) => {
              setClosingFilter(e.target.value);
              setPage(1);
            }}
            style={{
              background: '#090d16',
              border: '1px solid #1f2937',
              color: '#9ca3af',
              fontSize: '0.7rem',
              padding: '7px 10px',
              fontFamily: 'Work Sans, sans-serif',
              borderRadius: 0,
              outline: 'none',
            }}
          >
            <option value="all">All Deadlines</option>
            <option value="today">Closing Today</option>
            <option value="this_week">Closing This Week (≤7d)</option>
            <option value="this_month">Closing This Month (≤30d)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            style={{
              background: '#090d16',
              border: '1px solid #1f2937',
              color: '#9ca3af',
              fontSize: '0.7rem',
              padding: '7px 10px',
              fontFamily: 'Work Sans, sans-serif',
              borderRadius: 0,
              outline: 'none',
            }}
          >
            <option value="published_date">Sort: Newest First</option>
            <option value="closing_date">Sort: Closing Date</option>
            <option value="buyer">Sort: Buyer Name</option>
            <option value="title">Sort: Title</option>
          </select>

          {(search || statusFilter !== 'all' || tradeFilter !== 'all' || stateFilter !== 'all' || closingFilter !== 'all' || sortBy !== 'published_date') && (
            <button
              onClick={clearFilters}
              style={{
                background: 'transparent',
                border: '1px solid #374151',
                color: '#9ca3af',
                fontSize: '0.65rem',
                padding: '7px 10px',
                cursor: 'pointer',
                fontFamily: 'Work Sans, sans-serif',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderRadius: 0,
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ─── Opportunity Register Table ─── */}
      <div style={{
        background: '#070a12',
        border: '1px solid #111827',
        overflowX: 'auto',
        marginBottom: '20px',
      }}>
        {loading && (
          <div style={{
            padding: '8px 16px',
            background: '#0e1626',
            color: '#60a5fa',
            fontSize: '0.7rem',
            borderBottom: '1px solid #1e293b',
          }}>
            Refreshing opportunity register...
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937', background: '#05070f' }}>
              <th style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563' }}>
                Opportunity
              </th>
              <th style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563' }}>
                Buyer
              </th>
              <th style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563' }}>
                Location
              </th>
              <th style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563' }}>
                Trade
              </th>
              <th style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563' }}>
                Closes
              </th>
              <th style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563' }}>
                Status
              </th>
              <th style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563' }}>
                Source
              </th>
              <th style={{ padding: '10px 14px', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 400, color: '#e5e7eb', marginBottom: '6px' }}>
                    NO OPPORTUNITIES AVAILABLE
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 auto 16px auto', maxWidth: '420px', lineHeight: 1.5 }}>
                    There are currently no commercial opportunities matching your selected criteria. Reset your filters or broaden your trade and territory selections.
                  </p>
                  <button
                    onClick={clearFilters}
                    style={{
                      background: '#1f2937',
                      border: 'none',
                      color: '#f3f4f6',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      borderRadius: 0,
                    }}
                  >
                    Clear Filters
                  </button>
                </td>
              </tr>
            ) : (
              opportunities.map((opp) => {
                const badgeStyle = CLOSING_BADGE_STYLE[opp.closing_info.status];
                const isSaving = savingMap[opp.id];

                return (
                  <tr
                    key={opp.id}
                    style={{
                      borderBottom: '1px solid #111827',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    {/* Title & Project Type */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', maxWidth: '300px' }}>
                      <Link
                        href={`/workspace/win-work/${opp.id}`}
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 400,
                          color: '#f3f4f6',
                          textDecoration: 'none',
                          display: 'block',
                          marginBottom: '3px',
                        }}
                      >
                        {opp.title}
                      </Link>
                      <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                        {opp.project_type || 'Commercial Requirement'}
                      </div>
                    </td>

                    {/* Buyer */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '0.75rem', color: '#d1d5db' }}>
                        {opp.client_name}
                      </div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {opp.location.city}, {opp.location.state}
                      </div>
                    </td>

                    {/* Trade */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        letterSpacing: '0.06em',
                        color: '#9ca3af',
                        border: '1px solid #1f2937',
                        padding: '1px 6px',
                        background: '#090d16',
                      }}>
                        {opp.trade_label}
                      </span>
                    </td>

                    {/* Closing info */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.6rem',
                          fontWeight: 500,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                          background: badgeStyle.bg,
                          padding: '1px 6px',
                          alignSelf: 'flex-start',
                        }}>
                          {opp.closing_info.relativeText}
                        </span>
                        {opp.closing_info.formattedClosingDate && (
                          <span style={{ fontSize: '0.65rem', color: '#4b5563' }}>
                            {opp.closing_info.formattedClosingDate}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: opp.status === 'open' ? '#10b981' : '#6b7280',
                      }}>
                        {opp.status}
                      </span>
                    </td>

                    {/* Source */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                        {opp.source}
                      </div>
                      {opp.source_reference && (
                        <div style={{ fontSize: '0.6rem', color: '#374151', fontFamily: 'monospace' }}>
                          {opp.source_reference}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleToggleSave(opp.id, opp.is_saved)}
                          disabled={isSaving}
                          title={opp.is_saved ? 'Remove from Watchlist' : 'Save to Watchlist'}
                          style={{
                            background: opp.is_saved ? '#172554' : 'transparent',
                            border: '1px solid',
                            borderColor: opp.is_saved ? '#2563eb' : '#1f2937',
                            color: opp.is_saved ? '#93c5fd' : '#9ca3af',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            borderRadius: 0,
                          }}
                        >
                          {isSaving ? '...' : opp.is_saved ? 'Saved' : 'Save'}
                        </button>

                        <Link
                          href={`/workspace/win-work/match?opportunityId=${opp.id}`}
                          title="Evaluate Explainable Fit"
                          style={{
                            background: '#172554',
                            border: '1px solid #1e40af',
                            color: '#93c5fd',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '4px 8px',
                            textDecoration: 'none',
                          }}
                        >
                          Fit
                        </Link>

                        <Link
                          href={`/workspace/win-work/${opp.id}`}
                          style={{
                            background: '#111827',
                            border: '1px solid #1f2937',
                            color: '#e5e7eb',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            textDecoration: 'none',
                          }}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination Footer ─── */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.7rem',
          color: '#6b7280',
          marginTop: '12px',
        }}>
          <div>
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} opportunities
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                background: '#090d16',
                border: '1px solid #1f2937',
                color: page === 1 ? '#374151' : '#d1d5db',
                padding: '4px 10px',
                fontSize: '0.65rem',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                borderRadius: 0,
              }}
            >
              Previous
            </button>
            <span style={{ padding: '4px 8px', color: '#9ca3af' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                background: '#090d16',
                border: '1px solid #1f2937',
                color: page === totalPages ? '#374151' : '#d1d5db',
                padding: '4px 10px',
                fontSize: '0.65rem',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                borderRadius: 0,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
