import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import {
  getResponseWithAcknowledgements,
  getInvitation,
  getInvitationEvents,
} from '@/lib/respond/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Inspect Contractor Response | Avorria Client',
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  params: Promise<{ id: string; responseId: string }>;
}

export default async function ClientInspectResponsePage({ params }: Props) {
  const { id: packId, responseId } = await params;
  const client = await getClientContext();

  const pack = await getRequirementPackById(packId, client.organisationId);
  if (!pack) {
    notFound();
  }

  const response = getResponseWithAcknowledgements(responseId);
  if (!response || response.pack_id !== packId) {
    notFound();
  }

  const invitation = getInvitation(response.invitation_id);
  if (!invitation || invitation.tenant_id !== client.organisationId) {
    notFound();
  }

  const auditEvents = getInvitationEvents(invitation.id);

  // Map snapshot items and contractor acknowledgements together
  const snapshotMap = new Map((invitation.evidence_snapshot || []).map((s) => [s.requirementId, s]));
  const ackMap = new Map((response.requirement_acknowledgements || []).map((a) => [a.requirement_id, a]));

  const requirementsList = (pack.requirements || []).map((req) => {
    const snapshot = snapshotMap.get(req.id);
    const ack = ackMap.get(req.id);
    return {
      requirement: req,
      snapshot,
      ack,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href={`/client/requests/${pack.id}/responses`}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Response Centre
            </Link>
            <span className="text-xs text-slate-300">/</span>
            <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {pack.reference}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Contractor Response: {invitation.contractor_name || invitation.contractor_id}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submitted on{' '}
            {response.submitted_at
              ? new Date(response.submitted_at).toLocaleString()
              : 'Recently'}{' '}
            • Match Snapshot: {invitation.match_engine_version}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {invitation.contractor_slug && (
            <Link
              href={`/contractors/${invitation.contractor_slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>Open Public Passport ↗</span>
            </Link>
          )}
          <Link
            href={`/client/requests/${pack.id}/responses`}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            All Responses
          </Link>
        </div>
      </div>

      {/* Institutional Evidence Notice */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 text-xs text-sky-950 space-y-1 shadow-2xs">
        <div className="font-bold flex items-center gap-1.5 text-sky-900">
          <span>ℹ️</span>
          <span>Three-Layer Evidence Model</span>
        </div>
        <p className="text-sky-800 leading-relaxed">
          Avorria maintains a strict separation of facts:
          <strong> (1) Verified Evidence</strong> is independently confirmed by Avorria with a permanent reference number.
          <strong> (2) Published Evidence</strong> reflects documents on the contractor's Passport at invitation time.
          <strong> (3) Contractor Declarations</strong> reflect the contractor's statements below and do not alter verification status.
        </p>
      </div>

      {/* Availability & Scheduling Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Declared Availability & Proposed Schedule
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Availability Status
            </span>
            <div className="font-bold text-slate-900 mt-1 capitalize text-sm">
              {response.availability_status?.replace(/_/g, ' ') || 'Not stated'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Proposed Start Date
            </span>
            <div className="font-bold text-slate-900 mt-1 text-sm">
              {response.proposed_start_date || 'Flexible / To be confirmed'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Proposed Completion Date
            </span>
            <div className="font-bold text-slate-900 mt-1 text-sm">
              {response.proposed_completion_date || 'Flexible / To be confirmed'}
            </div>
          </div>
        </div>

        {response.availability_notes && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Availability Details & Constraints
            </span>
            <div className="text-slate-700">{response.availability_notes}</div>
          </div>
        )}

        {response.response_notes && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Contractor Cover Note / Scope Commentary
            </span>
            <div className="text-slate-700 whitespace-pre-wrap">{response.response_notes}</div>
          </div>
        )}
      </div>

      {/* Structured Requirements Breakdown */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Structured Requirement Alignment</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare the evidence state captured at invitation against the contractor's specific response declarations.
          </p>
        </div>

        <div className="space-y-3">
          {requirementsList.map(({ requirement, snapshot, ack }) => (
            <div
              key={requirement.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{requirement.title}</h3>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                        requirement.strength === 'required'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : requirement.strength === 'preferred'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {requirement.strength}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {requirement.category}
                    </span>
                  </div>
                  {requirement.description && (
                    <p className="text-xs text-slate-500">{requirement.description}</p>
                  )}
                </div>

                {/* Evidence State at Invitation vs Contractor Declaration */}
                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
                      Evidence At Invitation
                    </span>
                    <SnapshotEvidenceBadge state={snapshot?.evidenceStateAtInvitation || 'MISSING'} />
                  </div>

                  <div className="text-right mt-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
                      Contractor Declaration
                    </span>
                    <ContractorAckBadge status={ack?.response_status || 'unanswered'} />
                  </div>
                </div>
              </div>

              {/* Contractor Comment & Evidence Reference */}
              {(ack?.contractor_comment || ack?.evidence_reference) && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  {ack.contractor_comment && (
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                        Contractor Comment
                      </span>
                      <p className="text-slate-800 italic mt-0.5">"{ack.contractor_comment}"</p>
                    </div>
                  )}
                  {ack.evidence_reference && (
                    <div className="pt-1 text-[11px] text-slate-600">
                      <span className="font-medium text-slate-500">Document Reference: </span>
                      <span className="font-mono">{ack.evidence_reference}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Append-Only Lifecycle Audit Trail */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Invitation & Response Audit Trail
        </h3>

        <div className="space-y-3">
          {auditEvents.map((ev) => (
            <div key={ev.id} className="text-xs flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-600 mt-1 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 capitalize">
                    {ev.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-500 uppercase">
                    {ev.actor_role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {new Date(ev.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SnapshotEvidenceBadge({ state }: { state: string }) {
  switch (state) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span>✓</span>
          <span>Verified Evidence</span>
        </span>
      );
    case 'DECLARED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <span>💬</span>
          <span>Declared</span>
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span>⌛</span>
          <span>Expired</span>
        </span>
      );
    case 'NEEDS_CLARIFICATION':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span>🔍</span>
          <span>Clarification</span>
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span>—</span>
          <span>N/A</span>
        </span>
      );
    case 'MISSING':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
          <span>✕</span>
          <span>Evidence Not Found</span>
        </span>
      );
  }
}

function ContractorAckBadge({ status }: { status: string }) {
  switch (status) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span>✓</span>
          <span>Confirmed by Contractor</span>
        </span>
      );
    case 'cannot_confirm':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <span>✕</span>
          <span>Cannot Confirm</span>
        </span>
      );
    case 'requires_clarification':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <span>?</span>
          <span>Requires Clarification</span>
        </span>
      );
    case 'not_applicable':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span>—</span>
          <span>N/A</span>
        </span>
      );
    case 'unanswered':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
          <span>○</span>
          <span>Unanswered</span>
        </span>
      );
  }
}
