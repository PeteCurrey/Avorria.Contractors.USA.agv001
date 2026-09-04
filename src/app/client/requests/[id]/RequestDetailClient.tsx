'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RequirementPack,
  RequirementPackStatus,
  RequestReadinessResult,
} from '@/lib/request/types';
import { RequestReadinessWidget } from '@/components/request/RequestReadinessWidget';

interface RequestDetailClientProps {
  initialPack: RequirementPack;
  initialReadiness: RequestReadinessResult;
}

export function RequestDetailClient({ initialPack, initialReadiness }: RequestDetailClientProps) {
  const router = useRouter();
  const [pack, setPack] = useState<RequirementPack>(initialPack);
  const [readiness, setReadiness] = useState<RequestReadinessResult>(initialReadiness);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStatusTransition(targetStatus: RequirementPackStatus) {
    setActionError(null);
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/client/requests/${pack.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setPack(data.pack);
      if (data.readiness) setReadiness(data.readiness);
      router.refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDuplicate() {
    setActionError(null);
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/client/requests/${pack.id}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to duplicate pack');

      router.push(`/client/requests/${data.pack.id}`);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error duplicating pack');
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/client/requests" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
              ← Project Requests
            </Link>
            <span className="text-xs text-slate-300">/</span>
            <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {pack.reference}
            </span>
            <StatusBadge status={pack.status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {pack.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Created on {new Date(pack.created_at).toLocaleDateString()} • {pack.city}, {pack.state}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href={`/client/requests/${pack.id}/matches`}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>🔍</span>
            <span>Preview Candidate Matches</span>
          </Link>

          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isUpdating}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            title="Duplicate as new draft"
          >
            📋 Duplicate
          </button>

          {/* Status Transitions */}
          {pack.status === 'draft' && (
            <button
              type="button"
              onClick={() => handleStatusTransition('ready')}
              disabled={isUpdating || !readiness.isReady}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
              title={!readiness.isReady ? 'Complete all readiness criteria to mark ready' : undefined}
            >
              ✓ Mark as Ready
            </button>
          )}

          {pack.status === 'ready' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusTransition('active')}
                disabled={isUpdating}
                className="px-3.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                🚀 Activate Request
              </button>
              <button
                type="button"
                onClick={() => handleStatusTransition('draft')}
                disabled={isUpdating}
                className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Edit Draft
              </button>
            </>
          )}

          {pack.status === 'active' && (
            <button
              type="button"
              onClick={() => handleStatusTransition('closed')}
              disabled={isUpdating}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              🔒 Close Request
            </button>
          )}

          {['draft', 'ready', 'active'].includes(pack.status) && (
            <button
              type="button"
              onClick={() => handleStatusTransition('cancelled')}
              disabled={isUpdating}
              className="px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
          ⚠️ {actionError}
        </div>
      )}

      {/* Deterministic Readiness Assessment */}
      <RequestReadinessWidget readiness={readiness} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Scope, Requirements, Attachments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Overview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
              Project Specification & Scope of Work
            </h2>

            {pack.description && (
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Summary
                </span>
                <p className="text-sm text-slate-800 mt-1 leading-relaxed">{pack.description}</p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Technical Scope
              </span>
              <div className="text-xs sm:text-sm text-slate-700 mt-1 whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                {pack.scope || 'No detailed scope provided.'}
              </div>
            </div>

            {/* Site & Logistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Site Location
                </span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {pack.city}, {pack.state}
                </div>
                {pack.site_address && (
                  <div className="text-xs text-slate-600 mt-0.5">{pack.site_address}</div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Logistics & Site Access
                </span>
                <div className="text-xs text-slate-700 mt-0.5">
                  {pack.site_access_notes || 'Standard commercial access.'}
                </div>
              </div>
            </div>
          </div>

          {/* Structured Requirements Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Structured Compliance & Qualification Pack
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Criteria cross-referenced against candidate contractor Passports.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-200 text-slate-700">
                {pack.requirements?.length || 0} Criteria
              </span>
            </div>

            {!pack.requirements || pack.requirements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No structured requirements added to this pack.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pack.requirements.map((req) => (
                  <div key={req.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{req.title}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            req.strength === 'required'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : req.strength === 'preferred'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {req.strength}
                        </span>
                        {req.evidence_required && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Evidence Required
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {req.category}
                        </span>
                      </div>
                      {req.description && (
                        <p className="text-xs text-slate-600 mb-1 leading-relaxed">{req.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                        {req.minimum_value && <span>Min: {req.minimum_value}</span>}
                        {req.jurisdiction && <span>Jurisdiction: {req.jurisdiction}</span>}
                        <span>Provenance: {req.provenance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Secure Attachments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Project Documentation & Drawings</h3>
            <p className="text-xs text-slate-500 mb-4">
              Private site documentation. Files remain restricted within your organization and are never broadcast publicly.
            </p>
            {!pack.attachments || pack.attachments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
                No site attachments linked. Drawings and specifications can be linked during direct contractor engagement.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {pack.attachments.map((att) => (
                  <div key={att.id} className="p-3 bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span className="font-medium text-slate-800">{att.file_name}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">Private Attachment</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Metadata & Audit Trail */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2.5">
              Project Parameters
            </h3>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono">Value Tier</span>
              <div className="font-bold text-slate-900 mt-0.5 capitalize">
                {pack.value_tier?.replace(/_/g, ' ') || 'Undefined'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono">Urgency / Timeline</span>
              <div className="font-bold text-slate-900 mt-0.5 capitalize">
                {pack.urgency?.replace(/_/g, ' ') || 'Flexible'}
              </div>
              {pack.target_start_date && (
                <div className="text-slate-500 mt-0.5">Target Start: {pack.target_start_date}</div>
              )}
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono">Schedule Flexibility</span>
              <div className="font-bold text-slate-900 mt-0.5 capitalize">
                {pack.flexibility || 'Negotiable'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-mono">Trade Classifications</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {pack.trades && pack.trades.length > 0 ? (
                  pack.trades.map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-800"
                    >
                      {t.trade_name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">None assigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Append-Only Audit Trail */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2.5">
              Append-Only Audit Trail
            </h3>

            {!pack.events || pack.events.length === 0 ? (
              <div className="text-xs text-slate-400">No events logged yet.</div>
            ) : (
              <div className="space-y-3">
                {pack.events.slice(0, 10).map((ev) => (
                  <div key={ev.id} className="text-xs flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-mono text-[11px] font-bold text-slate-800 capitalize">
                        {ev.event_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {new Date(ev.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RequirementPackStatus }) {
  switch (status) {
    case 'ready':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Ready
        </span>
      );
    case 'active':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
          Active
        </span>
      );
    case 'closed':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          Closed
        </span>
      );
    case 'cancelled':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          Draft
        </span>
      );
  }
}
