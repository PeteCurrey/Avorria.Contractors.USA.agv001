'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ContractorOpportunityFit,
  ComparisonDimension,
  DimensionEvaluation,
  OverallFitState,
  RequirementComparisonStatus,
  FitAlignment,
} from '@/lib/match/contractor-fit-types';
import { DiscoverOpportunity } from '@/lib/discover/types';

interface ExplainableMatchHubProps {
  fit: ContractorOpportunityFit;
  opportunity: DiscoverOpportunity;
  availableOpportunities: Array<{
    id: string;
    title: string;
    client_name: string;
    trade_label: string;
  }>;
}

const FIT_STATE_THEME: Record<OverallFitState, { color: string; border: string; bg: string }> = {
  'STRONG FIT': { color: '#10b981', border: '#064e3b', bg: '#041711' },
  'GOOD FIT': { color: '#3b82f6', border: '#1e3a8a', bg: '#081426' },
  'PARTIAL FIT': { color: '#f59e0b', border: '#78350f', bg: '#1c1005' },
  'LIMITED FIT': { color: '#94a3b8', border: '#334155', bg: '#0f172a' },
  'INSUFFICIENT DATA': { color: '#a8a29e', border: '#292524', bg: '#141211' },
};

const ALIGNMENT_BADGE: Record<FitAlignment, { label: string; color: string; border: string; bg: string }> = {
  STRONG: { label: 'STRONG', color: '#10b981', border: '#064e3b', bg: '#041711' },
  GOOD: { label: 'GOOD', color: '#3b82f6', border: '#1e3a8a', bg: '#081426' },
  PARTIAL: { label: 'PARTIAL', color: '#f59e0b', border: '#78350f', bg: '#1c1005' },
  LIMITED: { label: 'LIMITED', color: '#94a3b8', border: '#334155', bg: '#0f172a' },
  NOT_ALIGNED: { label: 'GAP / UNMET', color: '#ef4444', border: '#450a0a', bg: '#180808' },
  UNKNOWN: { label: 'UNRESTRICTED', color: '#6b7280', border: '#1f2937', bg: '#0b0f19' },
};

const STATUS_BADGE: Record<RequirementComparisonStatus, { label: string; color: string; border: string; bg: string }> = {
  MATCHED: { label: 'RECORD MATCHED', color: '#10b981', border: '#064e3b', bg: '#041711' },
  PARTIAL: { label: 'PARTIAL EVIDENCE', color: '#f59e0b', border: '#78350f', bg: '#1c1005' },
  'NOT FOUND': { label: 'NO RECORD FOUND', color: '#ef4444', border: '#450a0a', bg: '#180808' },
  'REQUIRES REVIEW': { label: 'REVIEW REQUIRED', color: '#ec4899', border: '#500724', bg: '#17050d' },
  UNKNOWN: { label: 'UNSPECIFIED', color: '#6b7280', border: '#1f2937', bg: '#0b0f19' },
};

export function ExplainableMatchHub({
  fit,
  opportunity,
  availableOpportunities,
}: ExplainableMatchHubProps) {
  const router = useRouter();
  const [selectedDimension, setSelectedDimension] = useState<ComparisonDimension | 'all'>('all');

  const overallTheme = FIT_STATE_THEME[fit.overallFitState] || FIT_STATE_THEME['LIMITED FIT'];
  const dimensionEntries = Object.entries(fit.dimensions) as [ComparisonDimension, DimensionEvaluation][];

  const filteredDimensions =
    selectedDimension === 'all'
      ? dimensionEntries
      : dimensionEntries.filter(([key]) => key === selectedDimension);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      padding: '32px 40px',
      fontFamily: 'Work Sans, sans-serif',
      color: '#f9fafb',
    }}>
      {/* ─── Top Breadcrumb Navigation ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#9ca3af' }}>
          <Link href="/workspace/win-work" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            WIN WORK
          </Link>
          <span>/</span>
          <Link href={`/workspace/win-work/${opportunity.id}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
            OPPORTUNITY DETAIL
          </Link>
          <span>/</span>
          <span style={{ color: '#f3f4f6', fontWeight: 500 }}>EXPLAINABLE FIT ENGINE (MATCH)</span>
        </div>

        {/* Opportunity Switcher */}
        {availableOpportunities.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Switch Opportunity:
            </span>
            <select
              value={opportunity.id}
              onChange={(e) => router.push(`/workspace/win-work/match?opportunityId=${e.target.value}`)}
              style={{
                background: '#070a12',
                border: '1px solid #1f2937',
                color: '#e5e7eb',
                fontSize: '0.7rem',
                padding: '4px 8px',
                borderRadius: 0,
                outline: 'none',
              }}
            >
              {availableOpportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title} ({o.client_name})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ─── Commercial Context Header ─── */}
      <div style={{
        background: '#070a12',
        border: '1px solid #111827',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{
            fontSize: '0.65rem',
            color: '#3b82f6',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '6px',
          }}>
            COMMERCIAL FIT EVALUATION · 1-TO-1 ASSESSMENT
          </div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 300,
            color: '#f9fafb',
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em',
          }}>
            {opportunity.title}
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>Buyer: <strong style={{ color: '#e5e7eb' }}>{opportunity.client_name}</strong></span>
            <span>·</span>
            <span>Trade: <strong style={{ color: '#e5e7eb' }}>{opportunity.trade_label || opportunity.trade}</strong></span>
            <span>·</span>
            <span>Location: <strong style={{ color: '#e5e7eb' }}>{opportunity.location.city}, {opportunity.location.state}</strong></span>
            {opportunity.estimated_value && (
              <>
                <span>·</span>
                <span>Estimate: <strong style={{ color: '#e5e7eb' }}>
                  {typeof opportunity.estimated_value === 'number'
                    ? `$${opportunity.estimated_value.toLocaleString()}`
                    : String(opportunity.estimated_value)}
                </strong></span>
              </>
            )}
          </div>
        </div>

        {/* Contractor Identity & Return Button */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Evaluated Contractor
          </div>
          <div style={{ fontSize: '0.9rem', color: '#f3f4f6', fontWeight: 500 }}>
            {fit.contractorName}
          </div>
          <div style={{ marginTop: '12px' }}>
            <Link
              href={`/workspace/win-work/${opportunity.id}`}
              style={{
                fontSize: '0.7rem',
                color: '#93c5fd',
                textDecoration: 'none',
                border: '1px solid #1f2937',
                padding: '6px 12px',
                display: 'inline-block',
              }}
            >
              ← Back to Opportunity Detail
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Top Overall Fit Banner ─── */}
      <div style={{
        background: overallTheme.bg,
        border: `1px solid ${overallTheme.border}`,
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '24px',
        alignItems: 'center',
      }}>
        {/* Status Badge & Title */}
        <div>
          <div style={{
            fontSize: '0.65rem',
            color: '#9ca3af',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            STRUCTURED FIT CLASSIFICATION
          </div>
          <div style={{
            display: 'inline-block',
            fontSize: '1.4rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: overallTheme.color,
            marginBottom: '4px',
          }}>
            {fit.overallFitState}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>
            Evidence-led determination derived from {Object.keys(fit.dimensions).length} verified and declared attributes.
          </div>
        </div>

        {/* Deterministic Weighted Score */}
        <div style={{ borderLeft: '1px solid #1f2937', paddingLeft: '24px' }}>
          <div style={{
            fontSize: '0.65rem',
            color: '#9ca3af',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            DETERMINISTIC FIT RATING
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 300, color: '#f9fafb' }}>
            {fit.fitScore} <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>/ 100 PTS</span>
          </div>
          <div style={{
            fontSize: '0.65rem',
            color: '#9ca3af',
            marginTop: '4px',
          }}>
            Zero AI speculation · Transparent additive weights
          </div>
        </div>

        {/* Data Coverage & Engine Provenance */}
        <div style={{ borderLeft: '1px solid #1f2937', paddingLeft: '24px' }}>
          <div style={{
            fontSize: '0.65rem',
            color: '#9ca3af',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            RECORD COVERAGE & VERSION
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 400, color: '#e5e7eb' }}>
            {fit.dataCoveragePercent}% Published Records
          </div>
          <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '4px' }}>
            Engine: {fit.engineVersion} · Evaluated: {new Date(fit.evaluatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* ─── Side-by-Side Explanation Columns ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '24px',
      }}>
        {/* Why This Matched */}
        <div style={{
          background: '#070a12',
          border: '1px solid #111827',
          padding: '24px',
        }}>
          <div style={{
            fontSize: '0.7rem',
            color: '#10b981',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>✓</span>
            <span>WHY THIS MATCHED ({fit.whyItMatched.length})</span>
          </div>

          {fit.whyItMatched.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
              No positive matching factors recorded for this scope.
            </div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {fit.whyItMatched.map((reason, idx) => (
                <li key={idx} style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.5 }}>
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Why It Did Not Match / Scale Gaps */}
        <div style={{
          background: '#070a12',
          border: '1px solid #111827',
          padding: '24px',
        }}>
          <div style={{
            fontSize: '0.7rem',
            color: '#f59e0b',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>!</span>
            <span>WHY IT DID NOT MATCH / SCALE GAPS ({fit.whyItDidNotMatch.length})</span>
          </div>

          {fit.whyItDidNotMatch.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
              No critical gaps identified. Stated criteria align with recorded passport data.
            </div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {fit.whyItDidNotMatch.map((reason, idx) => (
                <li key={idx} style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.5 }}>
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ─── 10-Dimension Comparison Breakdown ─── */}
      <div style={{
        background: '#070a12',
        border: '1px solid #111827',
        padding: '24px 28px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h2 style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: '0 0 4px 0',
            }}>
              10-DIMENSION FACTOR COMPARISON
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Detailed breakdown of stated opportunity requirements vs recorded contractor credentials.
            </div>
          </div>

          {/* Dimension Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedDimension('all')}
              style={{
                background: selectedDimension === 'all' ? '#1e3a8a' : '#090d16',
                border: '1px solid',
                borderColor: selectedDimension === 'all' ? '#3b82f6' : '#1f2937',
                color: selectedDimension === 'all' ? '#ffffff' : '#9ca3af',
                fontSize: '0.65rem',
                padding: '4px 10px',
                cursor: 'pointer',
                borderRadius: 0,
              }}
            >
              All Dimensions ({dimensionEntries.length})
            </button>
            {dimensionEntries.map(([key, dim]) => (
              <button
                key={key}
                onClick={() => setSelectedDimension(key)}
                style={{
                  background: selectedDimension === key ? '#1e3a8a' : '#090d16',
                  border: '1px solid',
                  borderColor: selectedDimension === key ? '#3b82f6' : '#1f2937',
                  color: selectedDimension === key ? '#ffffff' : '#9ca3af',
                  fontSize: '0.65rem',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderRadius: 0,
                }}
              >
                {dim.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredDimensions.map(([key, dim]) => {
            const badge = ALIGNMENT_BADGE[dim.alignment] || ALIGNMENT_BADGE.UNKNOWN;
            return (
              <div
                key={key}
                style={{
                  background: '#090d16',
                  border: '1px solid #1f2937',
                  padding: '18px 22px',
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: '#f9fafb',
                    }}>
                      {dim.label}
                    </span>
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      background: badge.bg,
                      padding: '2px 8px',
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#e5e7eb', fontWeight: 500 }}>
                    {dim.score} / {dim.maxScore} pts
                  </div>
                </div>

                {/* Stated vs Contractor Standing Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '14px',
                  fontSize: '0.75rem',
                }}>
                  <div style={{
                    background: '#070a12',
                    border: '1px solid #111827',
                    padding: '10px 14px',
                  }}>
                    <div style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '0.6rem', marginBottom: '4px' }}>
                      Opportunity Requirement
                    </div>
                    <div style={{ color: '#e5e7eb', fontWeight: 400 }}>
                      {dim.opportunityRequirement}
                    </div>
                  </div>

                  <div style={{
                    background: '#070a12',
                    border: '1px solid #111827',
                    padding: '10px 14px',
                  }}>
                    <div style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '0.6rem', marginBottom: '4px' }}>
                      Contractor Recorded Standing
                    </div>
                    <div style={{ color: '#e5e7eb', fontWeight: 400 }}>
                      {dim.contractorStanding}
                    </div>
                  </div>
                </div>

                {/* Reasons List */}
                {dim.positiveReasons.length > 0 && (
                  <div style={{ marginBottom: '8px', fontSize: '0.75rem', color: '#34d399' }}>
                    {dim.positiveReasons.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                        <span>•</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                )}

                {dim.negativeReasons.length > 0 && (
                  <div style={{ marginBottom: '8px', fontSize: '0.75rem', color: '#f87171' }}>
                    {dim.negativeReasons.map((n, i) => (
                      <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                        <span>•</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Commercial disclaimer (if scale gap) */}
                {dim.commercialDisclaimer && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                    borderTop: '1px dashed #1f2937',
                    paddingTop: '8px',
                    marginTop: '8px',
                  }}>
                    Note: {dim.commercialDisclaimer}
                  </div>
                )}

                {/* Source Records Badges */}
                {dim.sourceRecords.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid #111827',
                  }}>
                    <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase' }}>
                      Citing Records:
                    </span>
                    {dim.sourceRecords.map((rec) => (
                      <Link
                        key={rec.recordId}
                        href={rec.linkHref}
                        style={{
                          fontSize: '0.65rem',
                          color: '#60a5fa',
                          textDecoration: 'none',
                          border: '1px solid #1f2937',
                          background: '#070a12',
                          padding: '2px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{rec.recordTitle}</span>
                        {rec.verificationRef && (
                          <span style={{ color: '#10b981', fontWeight: 600 }}>[{rec.verificationRef}]</span>
                        )}
                        <span style={{ color: '#6b7280' }}>→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Factual Requirements Comparison Table ─── */}
      <div style={{
        background: '#070a12',
        border: '1px solid #111827',
        padding: '24px 28px',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '0.75rem',
          color: '#9ca3af',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: '0 0 16px 0',
        }}>
          EXPLICIT OPPORTUNITY REQUIREMENTS COMPARISON TABLE
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.75rem',
            textAlign: 'left',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2937', color: '#6b7280', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                <th style={{ padding: '10px 12px' }}>Requirement</th>
                <th style={{ padding: '10px 12px' }}>Stated Criterion</th>
                <th style={{ padding: '10px 12px' }}>Contractor Status</th>
                <th style={{ padding: '10px 12px' }}>Evidence / Finding Details</th>
                <th style={{ padding: '10px 12px' }}>Source Record</th>
              </tr>
            </thead>
            <tbody>
              {fit.requirementComparisons.map((req) => {
                const badge = STATUS_BADGE[req.contractorStatus] || STATUS_BADGE.UNKNOWN;
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid #111827' }}>
                    <td style={{ padding: '12px', fontWeight: 500, color: '#f3f4f6' }}>
                      {req.title}
                    </td>
                    <td style={{ padding: '12px', color: '#d1d5db' }}>
                      {req.opportunityCriterion}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        background: badge.bg,
                        padding: '2px 8px',
                        textTransform: 'uppercase',
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#9ca3af', maxWidth: '300px' }}>
                      {req.details}
                      {req.verificationRef && (
                        <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '2px' }}>
                          Reference: {req.verificationRef}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {req.sourceRecordHref ? (
                        <Link
                          href={req.sourceRecordHref}
                          style={{
                            color: '#60a5fa',
                            textDecoration: 'none',
                            fontSize: '0.7rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>{req.sourceRecordTitle || 'View Record'}</span>
                          <span>→</span>
                        </Link>
                      ) : (
                        <span style={{ color: '#4b5563' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Actionable Data Gaps Checklist ─── */}
      <div style={{
        background: '#070a12',
        border: '1px solid #111827',
        padding: '24px 28px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <h2 style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: '0 0 4px 0',
            }}>
              ACTIONABLE PROFILE IMPROVEMENTS ({fit.dataGaps.length})
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Resolving these gaps strengthens your commercial alignment for this opportunity and future buyer searches.
            </div>
          </div>
        </div>

        {fit.dataGaps.length === 0 ? (
          <div style={{
            padding: '16px 20px',
            background: '#041711',
            border: '1px solid #064e3b',
            color: '#10b981',
            fontSize: '0.8rem',
          }}>
            ✓ No data gaps identified. All required credentials, trade authorizations, and evidence items are on file.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {fit.dataGaps.map((gap) => (
              <div
                key={gap.id}
                style={{
                  background: '#090d16',
                  border: '1px solid #1f2937',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#f3f4f6', marginBottom: '2px' }}>
                    {gap.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {gap.description}
                  </div>
                </div>

                <Link
                  href={gap.actionHref}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: '#93c5fd',
                    background: '#172554',
                    border: '1px solid #2563eb',
                    padding: '6px 14px',
                    textDecoration: 'none',
                    borderRadius: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {gap.actionRecommendation} →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Mandatory Commercial Disclaimer Banner ─── */}
      <div style={{
        background: '#070a12',
        border: '1px solid #1f2937',
        padding: '16px 20px',
        fontSize: '0.7rem',
        color: '#6b7280',
        lineHeight: 1.5,
      }}>
        <div style={{ fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
          Commercial & Regulatory Disclaimer
        </div>
        {fit.commercialDisclaimer}
      </div>
    </div>
  );
}
