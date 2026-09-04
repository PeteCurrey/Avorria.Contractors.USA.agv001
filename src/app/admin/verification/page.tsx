'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { VerifiedBadge } from '@/components/passport/VerifiedBadge';
import {
  ContractorVerificationState,
  VerificationRecord,
  VerificationCriterion,
} from '@/lib/verification/types';

interface SubmissionQueueItem {
  organisationId: string;
  organisationName: string;
  slug: string;
  trades: string[];
  primaryLocation: string;
  readinessScore: number;
  passportVisibility: string;
  verificationStatus: string;
  submittedAt?: string;
  recordsCount: number;
  satisfiedCount: number;
}

export default function AdminVerificationPage() {
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<SubmissionQueueItem[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [verificationDetail, setVerificationDetail] = useState<ContractorVerificationState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check existing session on mount
  useEffect(() => {
    const saved = localStorage.getItem('avorria_reviewer_token');
    if (saved) {
      setToken(saved);
      setIsAuthenticated(true);
      fetchSubmissions(saved);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    localStorage.setItem('avorria_reviewer_token', token.trim());
    setIsAuthenticated(true);
    fetchSubmissions(token.trim());
  };

  const fetchSubmissions = async (activeToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/internal/verification/submissions', {
        headers: { 'x-avorria-reviewer-token': activeToken },
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        if (data.submissions?.length > 0 && !selectedOrgId) {
          loadOrgDetail(data.submissions[0].organisationId, activeToken);
        }
      } else {
        setIsAuthenticated(false);
        setFeedbackMessage({ type: 'error', text: '403 Forbidden: Invalid reviewer authorization token.' });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Failed to connect to reviewer API.' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrgDetail = async (orgId: string, activeToken?: string) => {
    setSelectedOrgId(orgId);
    setSelectedRecordId(null);
    setReviewNote('');
    setRejectionReason('');
    const t = activeToken || token;
    try {
      const res = await fetch(`/api/internal/verification/review?orgId=${orgId}`, {
        headers: { 'x-avorria-reviewer-token': t },
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationDetail(data);
      }
    } catch (err) {
      console.error('Failed to load org verification detail', err);
    }
  };

  const handleRecordDecision = async (
    recordId: string,
    decision: 'verify' | 'reject' | 'needs_clarification'
  ) => {
    if (!selectedOrgId) return;
    setActionLoading(recordId);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/internal/verification/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-avorria-reviewer-token': token,
        },
        body: JSON.stringify({
          orgId: selectedOrgId,
          verificationRecordId: recordId,
          decision,
          notes: reviewNote || undefined,
          rejectionReason: rejectionReason || (decision === 'reject' ? 'Document does not satisfy criterion requirements.' : undefined),
        }),
      });

      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: `Evidence decision "${decision}" recorded successfully.` });
        setReviewNote('');
        setRejectionReason('');
        setSelectedRecordId(null);
        await loadOrgDetail(selectedOrgId);
        await fetchSubmissions(token);
      } else {
        const data = await res.json();
        setFeedbackMessage({ type: 'error', text: data.error || 'Decision failed.' });
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Network error executing reviewer decision.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOverallDecision = async (decision: 'approve' | 'reject' | 'request_evidence' | 'suspend') => {
    if (!selectedOrgId) return;
    setActionLoading('overall');
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/internal/verification/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-avorria-reviewer-token': token,
        },
        body: JSON.stringify({
          orgId: selectedOrgId,
          action: 'overall_decision',
          overallDecision: decision,
          notes: reviewNote || undefined,
          reason: rejectionReason || undefined,
        }),
      });

      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: `Overall verification decision "${decision}" applied.` });
        await loadOrgDetail(selectedOrgId);
        await fetchSubmissions(token);
      } else {
        const data = await res.json();
        setFeedbackMessage({ type: 'error', text: data.error || 'Overall decision failed.' });
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Failed to record overall decision.' });
    } finally {
      setActionLoading(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. GATE: Authentication Prompt
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-page flex items-center justify-center p-4 text-left">
        <Card variant="elevated" className="max-w-md w-full p-8 space-y-6 border-slate-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Avorria Compliance Portal
              </span>
            </div>
            <CardTitle className="text-2xl text-white font-black">
              Internal Reviewer Workspace
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Restricted to authorized Avorria verification officers. Evidence review actions are cryptographically hashed and logged to immutable audit trails.
            </CardDescription>
          </div>

          {feedbackMessage && (
            <div className={`p-3 rounded-lg text-xs ${feedbackMessage.type === 'error' ? 'bg-rose-950/80 border border-rose-800 text-rose-300' : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'}`}>
              {feedbackMessage.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Reviewer Authorization Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter AVORRIA_REVIEWER_SECRET"
                className="w-full bg-surface-subtle border border-surface-border rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-500"
              />
              <p className="text-[11px] text-slate-500">
                Default local dev secret: <code className="text-brand-400">avorria-internal-reviewer-sec-key-2026</code>
              </p>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Authenticate as Reviewer →
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MAIN REVIEWER WORKSPACE
  // ─────────────────────────────────────────────────────────────
  const currentSub = submissions.find((s) => s.organisationId === selectedOrgId);

  return (
    <div className="min-h-screen bg-surface-page text-slate-200">
      {/* Top Reviewer Nav */}
      <header className="border-b border-surface-border bg-surface-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-brand-950 border border-brand-800 text-brand-300 font-mono text-xs font-bold">
            Avorria Verification Admin
          </span>
          <span className="text-sm font-bold text-white">Compliance & Audit Queue</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Reviewer: <strong className="text-white">Sarah Jenkins</strong> (Lead Auditor)</span>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('avorria_reviewer_token');
              setIsAuthenticated(false);
            }}
            className="text-xs text-rose-400 hover:underline ml-2"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className={`px-6 py-3 text-xs flex justify-between items-center ${feedbackMessage.type === 'error' ? 'bg-rose-950 text-rose-200 border-b border-rose-800' : 'bg-emerald-950 text-emerald-200 border-b border-emerald-800'}`}>
          <span>{feedbackMessage.text}</span>
          <button type="button" onClick={() => setFeedbackMessage(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* 2-Column Split: Queue on Left, Evidence Inspection on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-65px)]">
        {/* Left 4 Cols: Submissions Queue */}
        <div className="lg:col-span-4 border-r border-surface-border bg-surface-card/50 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Contractor Queue ({submissions.length})
            </h2>
            <button
              type="button"
              onClick={() => fetchSubmissions(token)}
              className="text-xs text-brand-400 hover:underline font-mono"
            >
              Refresh ⟳
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading queue...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No submissions found.</div>
          ) : (
            <div className="space-y-2.5">
              {submissions.map((sub) => {
                const isSelected = sub.organisationId === selectedOrgId;
                return (
                  <button
                    type="button"
                    key={sub.organisationId}
                    onClick={() => loadOrgDetail(sub.organisationId)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-brand-950/40 border-brand-500 ring-1 ring-brand-500'
                        : 'bg-surface-subtle border-surface-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{sub.organisationName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {sub.trades.map((t) => t.replace(/-/g, ' ')).join(', ')} • {sub.primaryLocation}
                        </div>
                      </div>
                      <Badge
                        variant={
                          sub.verificationStatus === 'verified'
                            ? 'current'
                            : sub.verificationStatus === 'verification_in_progress'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {sub.verificationStatus.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="mt-3 pt-3 border-t border-surface-border/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Readiness: <strong className="text-white">{sub.readinessScore}%</strong></span>
                      <span>Verified: <strong className="text-brand-400">{sub.satisfiedCount}/{sub.recordsCount}</strong></span>
                      <span>{sub.passportVisibility}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Detail & Evidence Inspection */}
        <div className="lg:col-span-8 p-6 sm:p-8 space-y-6 overflow-y-auto">
          {verificationDetail && currentSub ? (
            <>
              {/* Contractor Header */}
              <div className="bg-surface-card border border-surface-border p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-black text-white">{currentSub.organisationName}</h1>
                    <VerifiedBadge
                      status={verificationDetail.aggregateStatus}
                      referenceNumber={verificationDetail.verificationReference}
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {currentSub.trades.join(', ')} • Location: {currentSub.primaryLocation} • Passport: <span className="font-mono text-white">{currentSub.passportVisibility}</span>
                  </p>
                  {verificationDetail.verificationReference && (
                    <div className="text-xs font-mono text-brand-400">
                      Reference: {verificationDetail.verificationReference} · Criteria Version: {verificationDetail.criteriaVersion}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    href={`/contractors/${currentSub.slug}`}
                    target="_blank"
                  >
                    View Public Passport ↗
                  </Button>
                </div>
              </div>

              {/* Overall Decision Strip */}
              <div className="bg-surface-card border border-surface-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">Overall Status:</span> {verificationDetail.aggregateStatus.replace(/_/g, ' ').toUpperCase()} ({verificationDetail.satisfiedCriteriaCount}/{verificationDetail.totalCriteriaCount} satisfied)
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={actionLoading === 'overall'}
                    onClick={() => handleOverallDecision('approve')}
                  >
                    Approve Overall Verification
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading === 'overall'}
                    onClick={() => handleOverallDecision('request_evidence')}
                  >
                    Request Evidence
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-400 hover:text-rose-300"
                    disabled={actionLoading === 'overall'}
                    onClick={() => handleOverallDecision('suspend')}
                  >
                    Suspend
                  </Button>
                </div>
              </div>

              {/* Per-Criterion Evidence Inspection */}
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Evidence Inspection by Criterion ({verificationDetail.applicableCriteria.length})
                  </h3>
                  <span className="text-xs text-slate-400">Click a criterion to review or decide</span>
                </div>

                <div className="space-y-3">
                  {verificationDetail.applicableCriteria.map((crit) => {
                    const record = verificationDetail.records.find((r) => r.criterionSlug === crit.slug);
                    const isExpanded = selectedRecordId === record?.id;
                    const status = record?.status || 'not_submitted';

                    return (
                      <div
                        key={crit.id}
                        className={`rounded-xl border transition-all ${
                          status === 'verified'
                            ? 'bg-emerald-950/20 border-emerald-900/60'
                            : status === 'needs_clarification'
                            ? 'bg-amber-950/20 border-amber-900/60'
                            : status === 'submitted'
                            ? 'bg-blue-950/20 border-blue-900/60'
                            : 'bg-surface-card border-surface-border'
                        }`}
                      >
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer"
                          onClick={() => setSelectedRecordId(isExpanded ? null : record?.id || null)}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{crit.name}</span>
                              <Badge variant="neutral" size="sm">
                                {crit.requirementType.replace(/_/g, ' ')}
                              </Badge>
                              {crit.mandatory && (
                                <span className="text-[10px] font-mono text-rose-400 font-semibold uppercase">
                                  Mandatory
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 max-w-xl">{crit.description}</p>
                            <div className="text-[11px] font-mono text-slate-500">
                              Evidence: {record?.evidenceReference || 'None on file'}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                                status === 'verified'
                                  ? 'bg-emerald-900/80 text-emerald-300'
                                  : status === 'submitted'
                                  ? 'bg-blue-900/80 text-blue-300'
                                  : status === 'needs_clarification'
                                  ? 'bg-amber-900/80 text-amber-300'
                                  : status === 'rejected'
                                  ? 'bg-rose-900/80 text-rose-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-slate-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </div>

                        {/* Expanded Reviewer Drawer for this Record */}
                        {isExpanded && record && (
                          <div className="p-5 border-t border-surface-border bg-surface-subtle/70 space-y-4 rounded-b-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                              <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1">
                                <span className="text-slate-500 uppercase text-[10px]">Evidence Reference</span>
                                <div className="text-white font-semibold">{record.evidenceReference || 'None'}</div>
                                {record.evidenceHash && (
                                  <div className="text-[10px] text-slate-400 truncate">
                                    SHA-256: {record.evidenceHash}
                                  </div>
                                )}
                              </div>

                              <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1">
                                <span className="text-slate-500 uppercase text-[10px]">Audit Status</span>
                                <div className="text-white">
                                  Method: {record.verificationMethod} · Expiry: {record.expiresAt ? new Date(record.expiresAt).toLocaleDateString() : 'N/A'}
                                </div>
                                {record.reviewer && (
                                  <div className="text-[10px] text-brand-400">
                                    Reviewed by: {record.reviewer} on {record.reviewedAt ? new Date(record.reviewedAt).toLocaleDateString() : ''}
                                  </div>
                                )}
                              </div>
                            </div>

                            {record.clarificationResponse && (
                              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800 text-xs text-blue-200">
                                <span className="font-bold">Contractor Clarification Response:</span> {record.clarificationResponse}
                              </div>
                            )}

                            {record.rejectionReason && (
                              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-200">
                                <span className="font-bold">Rejection / Clarification Note:</span> {record.rejectionReason}
                              </div>
                            )}

                            {/* Action Form */}
                            <div className="space-y-3 pt-2">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-300">Auditor Notes / Comments</label>
                                <textarea
                                  rows={2}
                                  value={reviewNote}
                                  onChange={(e) => setReviewNote(e.target.value)}
                                  placeholder="Enter internal inspection findings or registry cross-reference notes..."
                                  className="w-full bg-surface-card border border-surface-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-300">Rejection Reason / Clarification Instructions</label>
                                <input
                                  type="text"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Specific instruction if rejecting or requesting clarification..."
                                  className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                                />
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="primary"
                                  disabled={actionLoading === record.id}
                                  onClick={() => handleRecordDecision(record.id, 'verify')}
                                >
                                  ✓ Approve Evidence
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={actionLoading === record.id}
                                  onClick={() => handleRecordDecision(record.id, 'needs_clarification')}
                                >
                                  ⚠ Request Additional Evidence
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-rose-400 hover:text-rose-300"
                                  disabled={actionLoading === record.id}
                                  onClick={() => handleRecordDecision(record.id, 'reject')}
                                >
                                  ✕ Reject Evidence
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a contractor from the queue on the left to begin evidence verification.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
