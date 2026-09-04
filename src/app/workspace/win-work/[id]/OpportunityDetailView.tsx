'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DiscoverOpportunity, ClosingDateStatus } from '@/lib/discover/types';

interface OpportunityDetailViewProps {
  contractorOrgId: string;
  opportunity: DiscoverOpportunity;
}

const CLOSING_BADGE_STYLE: Record<ClosingDateStatus, { color: string; border: string; bg: string }> = {
  CLOSED: { color: '#ef4444', border: '#450a0a', bg: '#180808' },
  CLOSING_TODAY: { color: '#f59e0b', border: '#78350f', bg: '#1c1005' },
  CLOSING_SOON: { color: '#eab308', border: '#713f12', bg: '#1a1406' },
  OPEN: { color: '#10b981', border: '#064e3b', bg: '#041711' },
  NO_CLOSING_DATE: { color: '#6b7280', border: '#1f2937', bg: '#0b0f19' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OpportunityDetailView({
  contractorOrgId,
  opportunity: initialOpp,
}: OpportunityDetailViewProps) {
  const [opp, setOpp] = useState<DiscoverOpportunity>(initialOpp);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async () => {
    setIsSaving(true);
    const newSavedState = !opp.is_saved;

    // Optimistic update
    setOpp((prev) => ({
      ...prev,
      is_saved: newSavedState,
      saved_at: newSavedState ? new Date().toISOString() : undefined,
    }));

    try {
      const res = await fetch(`/api/workspace/win-work/discover/${opp.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newSavedState ? 'save' : 'unsave' }),
      });
      if (!res.ok) {
        // Rollback
        setOpp((prev) => ({
          ...prev,
          is_saved: !newSavedState,
        }));
      }
    } catch {
      setOpp((prev) => ({
        ...prev,
        is_saved: !newSavedState,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const badgeStyle = CLOSING_BADGE_STYLE[opp.closing_info.status];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      padding: '32px 40px',
      fontFamily: 'Work Sans, sans-serif',
    }}>
      {/* ─── Breadcrumbs & Navigation ─── */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          href="/workspace/win-work"
          style={{
            fontSize: '0.7rem',
            color: '#60a5fa',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          &larr; Back to Opportunity Discovery
        </Link>
      </div>

      {/* ─── Header Card ─── */}
      <div style={{
        background: '#070a12',
        border: '1px solid #111827',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#3b82f6',
              border: '1px solid #1d3d5c',
              padding: '2px 8px',
              background: '#081326',
            }}>
              {opp.trade_label}
            </span>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: opp.status === 'open' ? '#10b981' : '#6b7280',
              border: '1px solid #1f2937',
              padding: '2px 8px',
              background: '#090d16',
            }}>
              {opp.status}
            </span>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: badgeStyle.color,
              border: `1px solid ${badgeStyle.border}`,
              background: badgeStyle.bg,
              padding: '2px 8px',
            }}>
              {opp.closing_info.relativeText}
            </span>
          </div>

          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 300,
            color: '#f9fafb',
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em',
          }}>
            {opp.title}
          </h1>

          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Buyer: <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{opp.client_name}</span> · {opp.location.city}, {opp.location.state}
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            style={{
              background: opp.is_saved ? '#172554' : '#090d16',
              border: '1px solid',
              borderColor: opp.is_saved ? '#2563eb' : '#1f2937',
              color: opp.is_saved ? '#93c5fd' : '#e5e7eb',
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '8px 16px',
              cursor: 'pointer',
              borderRadius: 0,
            }}
          >
            {isSaving ? 'Updating...' : opp.is_saved ? '✓ Saved to Watchlist' : 'Save Opportunity'}
          </button>
        </div>
      </div>

      {/* ─── Detail Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
      }}>
        {/* Left Column: Scope, Project, Requirements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Scope and Description */}
          <div style={{
            background: '#070a12',
            border: '1px solid #111827',
            padding: '20px 24px',
          }}>
            <h2 style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4b5563',
              margin: '0 0 14px 0',
              paddingBottom: '8px',
              borderBottom: '1px solid #111827',
            }}>
              Project Scope & Work Specifications
            </h2>
            <div style={{
              fontSize: '0.85rem',
              color: '#d1d5db',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {opp.scope}
            </div>
            {opp.description && opp.description !== opp.scope && (
              <div style={{ marginTop: '14px', fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.5 }}>
                {opp.description}
              </div>
            )}
          </div>

          {/* Factual Requirements */}
          <div style={{
            background: '#070a12',
            border: '1px solid #111827',
            padding: '20px 24px',
          }}>
            <h2 style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4b5563',
              margin: '0 0 14px 0',
              paddingBottom: '8px',
              borderBottom: '1px solid #111827',
            }}>
              Stated Credential & Compliance Requirements
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ border: '1px solid #111827', padding: '12px', background: '#05070e' }}>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Trade License
                </div>
                <div style={{ fontSize: '0.8rem', color: opp.requirements.tradeLicenseRequired ? '#e5e7eb' : '#6b7280' }}>
                  {opp.requirements.tradeLicenseRequired ? 'Required by Buyer' : 'Not specified'}
                </div>
              </div>

              <div style={{ border: '1px solid #111827', padding: '12px', background: '#05070e' }}>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  General Liability Insurance
                </div>
                <div style={{ fontSize: '0.8rem', color: opp.requirements.generalLiabilityRequired ? '#e5e7eb' : '#6b7280' }}>
                  {opp.requirements.generalLiabilityRequired ? 'Required by Buyer' : 'Not specified'}
                </div>
              </div>

              <div style={{ border: '1px solid #111827', padding: '12px', background: '#05070e' }}>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Safety Program / Plan
                </div>
                <div style={{ fontSize: '0.8rem', color: opp.requirements.safetyPlanRequired ? '#e5e7eb' : '#6b7280' }}>
                  {opp.requirements.safetyPlanRequired ? 'Required by Buyer' : 'Not specified'}
                </div>
              </div>

              <div style={{ border: '1px solid #111827', padding: '12px', background: '#05070e' }}>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Verified Standing
                </div>
                <div style={{ fontSize: '0.8rem', color: opp.requirements.verificationRequired ? '#10b981' : '#6b7280' }}>
                  {opp.requirements.verificationRequired ? 'Avorria Verification Requested' : 'Standard Submission'}
                </div>
              </div>
            </div>

            {opp.requirements.notes && (
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
                Buyer notes: {opp.requirements.notes}
              </div>
            )}
          </div>

          {/* Future Commercial Handoff Placeholder */}
          <div style={{
            background: '#050811',
            border: '1px solid #1f2937',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#4b5563',
            }}>
              Commercial Engagement
            </div>
            <div style={{ fontSize: '0.85rem', color: '#d1d5db', fontWeight: 300 }}>
              Request & Response Workflow
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
              Request workflow will be available in a later commercial stage (Phase 11: MATCH / Phase 12: RESPOND).
              Save this opportunity to your watchlist to track deadline alerts and status changes.
            </p>
          </div>
        </div>

        {/* Right Column: Key Details, Dates, Provenance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Important Dates */}
          <div style={{
            background: '#070a12',
            border: '1px solid #111827',
            padding: '20px',
          }}>
            <h2 style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4b5563',
              margin: '0 0 14px 0',
              paddingBottom: '8px',
              borderBottom: '1px solid #111827',
            }}>
              Important Dates
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Target / Closing Date
                </div>
                <div style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                  {formatDate(opp.target_date)}
                </div>
                <div style={{ fontSize: '0.7rem', color: badgeStyle.color, marginTop: '2px' }}>
                  {opp.closing_info.relativeText}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #111827', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Published to Avorria
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  {formatDateTime(opp.created_at)}
                </div>
              </div>

              {opp.is_saved && opp.saved_at && (
                <div style={{ borderTop: '1px solid #111827', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                    Saved to Your Watchlist
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
                    {formatDateTime(opp.saved_at)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project & Commercial Details */}
          <div style={{
            background: '#070a12',
            border: '1px solid #111827',
            padding: '20px',
          }}>
            <h2 style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4b5563',
              margin: '0 0 14px 0',
              paddingBottom: '8px',
              borderBottom: '1px solid #111827',
            }}>
              Commercial Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Project Type
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                  {opp.project_type || 'Commercial Maintenance & Retrofit'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Sector
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                  {opp.sector || 'Commercial Property'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Timeframe
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                  {opp.timeframe.replace(/_/g, ' ')}
                </div>
              </div>

              {opp.estimated_value && (
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                    Estimated Value
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                    {typeof opp.estimated_value === 'number' ? `$${opp.estimated_value.toLocaleString()}` : opp.estimated_value}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Source Provenance */}
          <div style={{
            background: '#070a12',
            border: '1px solid #111827',
            padding: '20px',
          }}>
            <h2 style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4b5563',
              margin: '0 0 14px 0',
              paddingBottom: '8px',
              borderBottom: '1px solid #111827',
            }}>
              Source Provenance
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Source Origin
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {opp.source}
                </div>
              </div>

              {opp.source_reference && (
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                    Source Reference
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                    {opp.source_reference}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                  Opportunity ID
                </div>
                <div style={{ fontSize: '0.7rem', color: '#4b5563', fontFamily: 'monospace' }}>
                  {opp.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
