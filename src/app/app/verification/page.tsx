'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/components/passport/VerifiedBadge';
import {
  ContractorVerificationState,
  VerificationRecord,
  VerificationCriterion,
} from '@/lib/verification/types';

export default function VerificationCenterPage() {
  const [data, setData] = useState<ContractorVerificationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clarification modal
  const [activeClarificationRecord, setActiveClarificationRecord] = useState<VerificationRecord | null>(null);
  const [clarificationText, setClarificationText] = useState('');
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/contractor/verification');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load verification state', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleRequestVerification = async () => {
    setIsRequesting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/contractor/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessage({ type: 'success', text: json.message });
        await fetchState();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to submit verification request.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error submitting verification request.' });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSendClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClarificationRecord) return;
    setIsSubmittingClarification(true);
    try {
      const res = await fetch('/api/contractor/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond_clarification',
          verificationRecordId: activeClarificationRecord.id,
          responseMessage: clarificationText,
        }),
      });
      if (res.ok) {
        setActiveClarificationRecord(null);
        setClarificationText('');
        setMessage({ type: 'success', text: 'Clarification submitted. Returned to reviewer queue.' });
        await fetchState();
      }
    } finally {
      setIsSubmittingClarification(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono">Loading Verification Center...</p>
      </div>
    );
  }

  const statusVariant = (status: string) => {
    if (status === 'verified') return 'current' as const;
    if (status === 'under_review' || status === 'submitted') return 'primary' as const;
    if (status === 'needs_clarification') return 'expiring' as const;
    if (status === 'rejected' || status === 'revoked' || status === 'expired') return 'expired' as const;
    return 'neutral' as const;
  };

  const statusExplanation = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Evidence reviewed against Avorria criteria.';
      case 'under_review':
      case 'submitted':
        return 'Submitted and queued for human reviewer inspection.';
      case 'needs_clarification':
        return 'Reviewer requested additional documentation or policy endorsements.';
      case 'expired':
        return 'Underlying evidence has expired. Renew to restore status.';
      case 'revoked':
        return 'Evidence was changed or removed. Re-review required.';
      case 'rejected':
        return 'Evidence did not meet publication criteria.';
      default:
        return 'Not yet submitted for review.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">Evidence Review Standard</Badge>
            <span className="text-xs text-slate-500 font-mono">
              Status: {data?.aggregateStatus?.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Verification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official human review of your business credentials, commercial insurance, licenses, and safety programs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={handleRequestVerification}
            isLoading={isRequesting}
          >
            Request Verification Review →
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Aggregate Verification Status Banner */}
      <Card variant="elevated" className="border-brand-500/50 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Aggregate Contractor Standing
            </span>
            <div className="flex items-center gap-3 pt-1">
              <VerifiedBadge
                status={data?.aggregateStatus || 'not_verified'}
                referenceNumber={data?.verificationReference}
                size="lg"
                showLink={false}
              />
            </div>
            {data?.verificationReference && (
              <div className="text-xs text-slate-400 font-mono mt-1">
                Official Reference: <strong className="text-brand-400">{data.verificationReference}</strong>
                {data.expiresAt && ` · Valid until ${new Date(data.expiresAt).toLocaleDateString('en-US')}`}
              </div>
            )}
          </div>

          <div className="text-right shrink-0 text-xs">
            <div className="font-mono text-2xl font-black text-white">
              {data?.satisfiedCriteriaCount} / {data?.totalCriteriaCount}
            </div>
            <div className="text-slate-400 text-[11px]">Criteria Verified</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border text-xs text-slate-400 space-y-1 leading-relaxed">
          <span className="text-slate-300 font-bold">Avorria Verification Policy:</span> Verification records that Avorria has reviewed specified evidence against defined Avorria verification criteria. It does not constitute government licensing, OSHA approval, legal certification, or a guarantee of compliance.
        </div>
      </Card>

      {/* Dynamic Criteria Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Applicable Verification Criteria</h2>
          <span className="text-[11px] text-slate-500 font-mono">
            {data?.applicableCriteria.length} criteria evaluated for your trade & state
          </span>
        </div>

        <div className="space-y-3">
          {data?.applicableCriteria.map((crit) => {
            const record = data.records.find((r) => r.criterionSlug === crit.slug);
            const status = record?.status || 'not_submitted';

            return (
              <Card key={crit.slug} variant="default" className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs sm:text-sm">{crit.name}</span>
                      {crit.mandatory && <Badge variant="trade" size="sm">Mandatory</Badge>}
                      <Badge variant={statusVariant(status)} size="sm">
                        {status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{crit.description}</p>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      Governing Standard: {crit.sourceName}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {status === 'needs_clarification' && record && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setActiveClarificationRecord(record);
                          setClarificationText('');
                        }}
                      >
                        Respond to Clarification
                      </Button>
                    )}
                  </div>
                </div>

                {/* Evidence & Review Feedback */}
                {record?.evidenceReference && (
                  <div className="p-2.5 rounded bg-surface-subtle border border-surface-border text-xs flex items-center justify-between">
                    <span className="text-slate-300">
                      Evidence: <strong>{record.evidenceReference}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {statusExplanation(status)}
                    </span>
                  </div>
                )}

                {record?.rejectionReason && (
                  <div className="p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                    <strong>Reviewer Feedback:</strong> {record.rejectionReason}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Clarification Modal */}
      {activeClarificationRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-md w-full space-y-4 text-left border-brand-500/50">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <CardTitle className="text-base">Provide Review Clarification</CardTitle>
              <button
                type="button"
                onClick={() => setActiveClarificationRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendClarification} className="space-y-4 text-xs">
              <div className="p-3 rounded bg-amber-950/40 border border-amber-800 text-amber-200">
                <strong>Reviewer Note:</strong> {activeClarificationRecord.rejectionReason || 'Please clarify policy limits or provide updated endorsements.'}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 uppercase">
                  Your Response / Explanation
                </label>
                <textarea
                  rows={4}
                  required
                  value={clarificationText}
                  onChange={(e) => setClarificationText(e.target.value)}
                  placeholder="Explain the update or provide relevant reference numbers..."
                  className="w-full bg-surface-subtle border border-surface-border rounded-lg p-3 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
                <Button size="sm" variant="ghost" onClick={() => setActiveClarificationRecord(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmittingClarification}>
                  Submit Clarification →
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
