'use client';

import React, { useState, useTransition, useCallback } from 'react';
import type { EvidenceItem, VerificationState } from '@/lib/prove/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'status' | 'events' | 'explained';

interface VerificationHubProps {
  orgId: string;
  orgName: string;
  evidenceItems: EvidenceItem[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATE_LABELS: Record<VerificationState, string> = {
  CONTRACTOR_SUPPLIED: 'Contractor Supplied',
  DOCUMENT_SUPPORTED: 'Document Supported',
  PENDING_VERIFICATION: 'Pending Verification',
  VERIFIED: 'Verified',
  VERIFICATION_FAILED: 'Verification Failed',
  REVIEW_REQUIRED: 'Review Requested',
};

const STATE_STYLE: Record<VerificationState, string> = {
  CONTRACTOR_SUPPLIED: 'color: #6b7280;',
  DOCUMENT_SUPPORTED: 'color: #9ca3af;',
  PENDING_VERIFICATION: 'color: #f59e0b;',
  VERIFIED: 'color: #22c55e;',
  VERIFICATION_FAILED: 'color: #ef4444;',
  REVIEW_REQUIRED: 'color: #60a5fa;',
};

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  business: 'Business',
  licence: 'Licence',
  insurance: 'Insurance',
  credential: 'Credential',
  safety: 'Safety',
  project: 'Project',
  capability: 'Capability',
  reference: 'Reference',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function canRequestReview(state: VerificationState): boolean {
  return state === 'CONTRACTOR_SUPPLIED' || state === 'DOCUMENT_SUPPORTED';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StateIndicator({ state }: { state: VerificationState }) {
  return (
    <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', ...Object.fromEntries(STATE_STYLE[state].split(';').filter(Boolean).map(s => { const [k, v] = s.split(':').map(x => x.trim()); return [k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v]; })) }}>
      {STATE_LABELS[state]}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'Work Sans, sans-serif',
      fontSize: '0.65rem',
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#6b7280',
      border: '1px solid #1f2937',
      padding: '1px 6px',
    }}>
      {EVIDENCE_TYPE_LABELS[type] || type}
    </span>
  );
}

// ─── Evidence Status Tab ──────────────────────────────────────────────────────

function EvidenceStatusTab({
  items,
  onRequestReview,
  requestingId,
}: {
  items: EvidenceItem[];
  onRequestReview: (id: string) => void;
  requestingId: string | null;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queueItems = items.filter((i) =>
    ['PENDING_VERIFICATION', 'REVIEW_REQUIRED', 'VERIFICATION_FAILED'].includes(i.verification_state)
  );
  const otherItems = items.filter(
    (i) => !['PENDING_VERIFICATION', 'REVIEW_REQUIRED', 'VERIFICATION_FAILED'].includes(i.verification_state)
  );

  function renderRow(item: EvidenceItem) {
    const isExpanded = expandedId === item.id;
    const lastEvent = item.events[item.events.length - 1];

    return (
      <React.Fragment key={item.id}>
        <tr
          style={{
            borderBottom: '1px solid #111827',
            cursor: 'default',
          }}
        >
          {/* Title */}
          <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
            <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.8rem', fontWeight: 400, color: '#e5e7eb', lineHeight: '1.4' }}>
              {item.title}
            </div>
            <div style={{ marginTop: '2px' }}>
              <TypeBadge type={item.evidence_type} />
            </div>
          </td>

          {/* State */}
          <td style={{ padding: '10px 12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
            <StateIndicator state={item.verification_state} />
          </td>

          {/* Key timestamp */}
          <td style={{ padding: '10px 12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
            {item.verification_state === 'VERIFIED' && item.verified_at ? (
              <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#6b7280' }}>
                Verified {formatDate(item.verified_at)}
              </span>
            ) : item.verification_state === 'VERIFICATION_FAILED' && item.verification_failed_at ? (
              <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#6b7280' }}>
                Failed {formatDate(item.verification_failed_at)}
              </span>
            ) : item.verification_requested_at ? (
              <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#6b7280' }}>
                Requested {formatDate(item.verification_requested_at)}
              </span>
            ) : (
              <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#374151' }}>
                —
              </span>
            )}
          </td>

          {/* Verifier / Reference */}
          <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
            {item.verification_state === 'VERIFIED' ? (
              <div>
                <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#9ca3af' }}>
                  {item.verifier_name}
                </div>
                {item.verification_reference && (
                  <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4b5563', marginTop: '2px' }}>
                    {item.verification_reference}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#374151' }}>—</span>
            )}
          </td>

          {/* Actions */}
          <td style={{ padding: '10px 12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {canRequestReview(item.verification_state) && (
                <button
                  onClick={() => onRequestReview(item.id)}
                  disabled={requestingId === item.id}
                  style={{
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: requestingId === item.id ? '#4b5563' : '#60a5fa',
                    background: 'none',
                    border: '1px solid',
                    borderColor: requestingId === item.id ? '#1f2937' : '#1d3d5c',
                    padding: '3px 8px',
                    cursor: requestingId === item.id ? 'not-allowed' : 'pointer',
                    borderRadius: 0,
                  }}
                >
                  {requestingId === item.id ? 'Requesting…' : 'Request Review'}
                </button>
              )}
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '0.65rem',
                  fontWeight: 400,
                  color: '#4b5563',
                  background: 'none',
                  border: 'none',
                  padding: '3px 0',
                  cursor: 'pointer',
                }}
              >
                {isExpanded ? 'Hide' : `Events (${item.events.length})`}
              </button>
            </div>
          </td>
        </tr>

        {/* Expanded events row */}
        {isExpanded && (
          <tr style={{ borderBottom: '1px solid #111827', background: '#030712' }}>
            <td colSpan={5} style={{ padding: '0 12px 12px 12px' }}>
              <div style={{ borderLeft: '2px solid #1f2937', paddingLeft: '12px', marginTop: '8px' }}>
                <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '8px' }}>
                  Audit Events
                </div>
                {item.events.map((evt) => (
                  <div key={evt.id} style={{ display: 'flex', gap: '16px', marginBottom: '6px', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#374151', whiteSpace: 'nowrap', minWidth: '160px' }}>
                      {formatTimestamp(evt.timestamp)}
                    </span>
                    <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {evt.action.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#4b5563' }}>
                      {evt.actor} · {evt.actor_role}
                    </span>
                    {evt.notes && (
                      <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#374151', fontStyle: 'italic' }}>
                        {evt.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  }

  return (
    <div>
      {/* Queue section */}
      {queueItems.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#4b5563',
            marginBottom: '8px',
            paddingBottom: '8px',
            borderBottom: '1px solid #111827',
          }}>
            In Verification Queue — {queueItems.length} item{queueItems.length !== 1 ? 's' : ''}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f2937' }}>
                  {['Evidence', 'State', 'Date', 'Verifier / Ref', 'Actions'].map((h) => (
                    <th key={h} style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#374151',
                      textAlign: 'left',
                      padding: '6px 12px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queueItems.map(renderRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All evidence section */}
      <div>
        <div style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4b5563',
          marginBottom: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid #111827',
        }}>
          All Evidence — {items.length} item{items.length !== 1 ? 's' : ''}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                {['Evidence', 'State', 'Date', 'Verifier / Ref', 'Actions'].map((h) => (
                  <th key={h} style={{
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#374151',
                    textAlign: 'left',
                    padding: '6px 12px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(renderRow)}
            </tbody>
          </table>
        </div>
      </div>

      {items.length === 0 && (
        <div style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '0.8rem',
          color: '#374151',
          padding: '24px 0',
          textAlign: 'center',
        }}>
          No evidence items. Add evidence in PROVE to begin the verification workflow.
        </div>
      )}
    </div>
  );
}

// ─── Verification Events Tab ──────────────────────────────────────────────────

function VerificationEventsTab({ items }: { items: EvidenceItem[] }) {
  type FlatEvent = {
    timestamp: string;
    evidenceId: string;
    evidenceTitle: string;
    action: string;
    actor: string;
    actorRole: string;
    notes?: string;
  };

  const allEvents: FlatEvent[] = items
    .flatMap((item) =>
      item.events.map((evt) => ({
        timestamp: evt.timestamp,
        evidenceId: item.id,
        evidenceTitle: item.title,
        action: evt.action,
        actor: evt.actor,
        actorRole: evt.actor_role,
        notes: evt.notes,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (allEvents.length === 0) {
    return (
      <div style={{
        fontFamily: 'Work Sans, sans-serif',
        fontSize: '0.8rem',
        color: '#374151',
        padding: '24px 0',
        textAlign: 'center',
      }}>
        No verification events recorded yet.
      </div>
    );
  }

  return (
    <div>
      <div style={{
        fontFamily: 'Work Sans, sans-serif',
        fontSize: '0.65rem',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#4b5563',
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #111827',
      }}>
        Audit Ledger — {allEvents.length} event{allEvents.length !== 1 ? 's' : ''} across {items.length} evidence item{items.length !== 1 ? 's' : ''}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937' }}>
              {['Timestamp', 'Evidence', 'Action', 'Actor', 'Notes'].map((h) => (
                <th key={h} style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#374151',
                  textAlign: 'left',
                  padding: '6px 12px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allEvents.map((evt, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #0d1117' }}>
                <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4b5563' }}>
                    {formatTimestamp(evt.timestamp)}
                  </span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.75rem', color: '#9ca3af', maxWidth: '280px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {evt.evidenceTitle}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#6b7280' }}>
                    {evt.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#6b7280' }}>
                    {evt.actor}
                  </div>
                  <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.65rem', color: '#374151' }}>
                    {evt.actorRole}
                  </div>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.7rem', color: '#374151', fontStyle: 'italic' }}>
                    {evt.notes || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Verification Explained Tab ───────────────────────────────────────────────

function VerificationExplainedTab() {
  const states: { state: VerificationState; label: string; description: string }[] = [
    {
      state: 'CONTRACTOR_SUPPLIED',
      label: 'Contractor Supplied',
      description:
        'The contractor has entered this information or uploaded a document. No independent check has been performed. This state does not imply the information is correct or the document is valid.',
    },
    {
      state: 'DOCUMENT_SUPPORTED',
      label: 'Document Supported',
      description:
        'A supporting document is attached to this evidence item. The document has not been independently verified. Avorria has not confirmed the document is authentic, current, or accurately represents the claim.',
    },
    {
      state: 'PENDING_VERIFICATION',
      label: 'Pending Verification',
      description:
        'This evidence item has been placed in the verification queue. It is awaiting review by an authorised Avorria compliance reviewer. No verification determination has been made yet.',
    },
    {
      state: 'REVIEW_REQUIRED',
      label: 'Review Requested',
      description:
        'The contractor has requested that this evidence be reviewed, or a previous verification was invalidated by a material change to the evidence. The item is in the verification queue pending auditor action.',
    },
    {
      state: 'VERIFIED',
      label: 'Verified',
      description:
        'An authorised Avorria compliance reviewer has independently reviewed this evidence using a supported verification method and confirmed it is accurate and current. The verifier name and reference are recorded in the audit log.',
    },
    {
      state: 'VERIFICATION_FAILED',
      label: 'Verification Failed',
      description:
        'A compliance reviewer reviewed this evidence and concluded it does not satisfy verification criteria. The reason is recorded in the audit log. The contractor may supply updated or corrected evidence and request review again.',
    },
  ];

  const notVerification = [
    'Uploading a document',
    'Entering a licence number or policy number',
    'Contractor self-attestation',
    'Having a current expiry date',
    'Paying a subscription fee',
    'Completing a profile',
    'Being listed on Avorria',
  ];

  const notVerified = [
    'CONTRACTOR SUPPLIED ≠ VERIFIED',
    'DOCUMENT SUPPORTED ≠ VERIFIED',
    'VERIFIED evidence ≠ fully compliant contractor',
    'One VERIFIED record ≠ a verified contractor',
  ];

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* What verification is */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4b5563',
          margin: '0 0 16px 0',
          paddingBottom: '8px',
          borderBottom: '1px solid #111827',
        }}>
          What Verification Is
        </h3>
        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.8rem', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 12px 0' }}>
          Verification is a determination made by an authorised Avorria compliance reviewer about a specific piece of evidence. It is a separate event from evidence supply.
        </p>
        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.8rem', color: '#9ca3af', lineHeight: '1.6', margin: '0' }}>
          When evidence is verified, it means a reviewer has independently confirmed — using a documented method such as document inspection, state board lookup, or third-party audit — that the evidence accurately substantiates the claim. The verifier's identity, method, and a unique reference are recorded in the immutable audit log.
        </p>
      </section>

      {/* What it is not */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4b5563',
          margin: '0 0 16px 0',
          paddingBottom: '8px',
          borderBottom: '1px solid #111827',
        }}>
          What Verification Is Not
        </h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {notVerification.map((item) => (
            <li key={item} style={{
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '0.8rem',
              color: '#6b7280',
              lineHeight: '1.6',
              paddingLeft: '16px',
              position: 'relative',
              marginBottom: '4px',
            }}>
              <span style={{ position: 'absolute', left: 0, color: '#374151' }}>—</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Important distinctions */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4b5563',
          margin: '0 0 16px 0',
          paddingBottom: '8px',
          borderBottom: '1px solid #111827',
        }}>
          Important Distinctions
        </h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {notVerified.map((item) => (
            <li key={item} style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#4b5563',
              lineHeight: '1.8',
              borderBottom: '1px solid #0d1117',
              padding: '4px 0',
            }}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* State definitions */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4b5563',
          margin: '0 0 16px 0',
          paddingBottom: '8px',
          borderBottom: '1px solid #111827',
        }}>
          Verification States
        </h3>
        {states.map(({ state, label, description }) => (
          <div key={state} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #0d1117' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
              <StateIndicator state={state} />
            </div>
            <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.78rem', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              {description}
            </p>
          </div>
        ))}
      </section>

      {/* Material change note */}
      <section>
        <h3 style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '0.65rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4b5563',
          margin: '0 0 16px 0',
          paddingBottom: '8px',
          borderBottom: '1px solid #111827',
        }}>
          Material Change Protection
        </h3>
        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '0.8rem', color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
          If a VERIFIED evidence item is materially changed — for example, if the supporting document is replaced, or the policy dates are updated — the verification is automatically invalidated. The item returns to REVIEW REQUIRED and must be re-verified. This prevents a contractor from changing the underlying evidence after it has been verified without triggering a new review. All invalidation events are recorded in the immutable audit log.
        </p>
      </section>
    </div>
  );
}

// ─── Main Hub ─────────────────────────────────────────────────────────────────

export function VerificationHub({ orgId, orgName, evidenceItems: initialItems }: VerificationHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [items, setItems] = useState<EvidenceItem[]>(initialItems);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [, startTransition] = useTransition();

  // Position counts
  const position = {
    pending: items.filter((i) => i.verification_state === 'PENDING_VERIFICATION').length,
    reviewRequired: items.filter((i) => i.verification_state === 'REVIEW_REQUIRED').length,
    failed: items.filter((i) => i.verification_state === 'VERIFICATION_FAILED').length,
    verified: items.filter((i) => i.verification_state === 'VERIFIED').length,
  };
  const queueCount = position.pending + position.reviewRequired + position.failed;

  const handleRequestReview = useCallback(async (id: string) => {
    setRequestingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/workspace/prove/evidence/${id}/request-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Contractor requested auditor verification review' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to request review');
      }
      const data = await res.json();
      // Update local state
      startTransition(() => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? data.evidence : item))
        );
      });
      setMessage({ type: 'success', text: 'Review requested. The item has moved to the verification queue.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to request review',
      });
    } finally {
      setRequestingId(null);
    }
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'status', label: 'Evidence Status' },
    { id: 'events', label: 'Verification Events' },
    { id: 'explained', label: 'Verification Explained' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      padding: '32px 40px',
      fontFamily: 'Work Sans, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '0.6rem',
          fontWeight: 400,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#374151',
          marginBottom: '6px',
        }}>
          {orgName}
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 300,
          color: '#f9fafb',
          margin: '0 0 4px 0',
          letterSpacing: '-0.01em',
        }}>
          Verification
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0, fontWeight: 300 }}>
          Evidence verification workflow. Evidence is supplied. Verification is a separate event.
        </p>
      </div>

      {/* Position strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px',
        background: '#111827',
        marginBottom: '32px',
        border: '1px solid #111827',
      }}>
        {[
          { label: 'In Queue', value: queueCount, highlight: queueCount > 0 },
          { label: 'Review Requested', value: position.reviewRequired, highlight: false },
          { label: 'Pending', value: position.pending, highlight: false },
          { label: 'Verified', value: position.verified, highlight: false },
        ].map(({ label, value, highlight }) => (
          <div key={label} style={{
            background: '#090d16',
            padding: '16px 20px',
          }}>
            <div style={{
              fontSize: highlight && value > 0 ? '1.4rem' : '1.4rem',
              fontWeight: 300,
              color: highlight && value > 0 ? '#60a5fa' : '#e5e7eb',
              lineHeight: 1,
              marginBottom: '4px',
            }}>
              {value}
            </div>
            <div style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#374151',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback message */}
      {message && (
        <div style={{
          marginBottom: '20px',
          padding: '10px 16px',
          background: message.type === 'success' ? '#0a1f10' : '#1f0a0a',
          border: `1px solid ${message.type === 'success' ? '#14532d' : '#450a0a'}`,
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '0.8rem',
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid #111827',
        marginBottom: '24px',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '0.7rem',
              fontWeight: activeTab === tab.id ? 500 : 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: activeTab === tab.id ? '#e5e7eb' : '#4b5563',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #e5e7eb' : '2px solid transparent',
              padding: '8px 16px',
              cursor: 'pointer',
              marginBottom: '-1px',
              borderRadius: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'status' && (
        <EvidenceStatusTab
          items={items}
          onRequestReview={handleRequestReview}
          requestingId={requestingId}
        />
      )}
      {activeTab === 'events' && <VerificationEventsTab items={items} />}
      {activeTab === 'explained' && <VerificationExplainedTab />}
    </div>
  );
}
