'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RequestInvitation,
  RequestResponse,
  ContractorResponseRequirementView,
  AvailabilityStatus,
  RequirementResponseStatus,
} from '@/lib/respond/types';

// ─────────────────────────────────────────────────────────────
// TYPES & HELPERS
// ─────────────────────────────────────────────────────────────

type Step = 'overview' | 'availability' | 'requirements' | 'notes' | 'review' | 'submitted';

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; description: string }[] = [
  { value: 'available', label: 'Available', description: 'We are available and can accommodate this project.' },
  { value: 'available_with_conditions', label: 'Available with Conditions', description: 'We are available subject to schedule or resource conditions.' },
  { value: 'limited_availability', label: 'Limited Availability', description: 'We have limited capacity and would need to discuss scheduling.' },
  { value: 'unavailable', label: 'Unavailable', description: 'We are not available for this project at this time.' },
  { value: 'to_be_confirmed', label: 'To Be Confirmed', description: 'We need to verify our availability internally before confirming.' },
];

const REQUIREMENT_STATUS_OPTIONS: { value: RequirementResponseStatus; label: string; color: string }[] = [
  { value: 'confirmed', label: 'Confirmed', color: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
  { value: 'cannot_confirm', label: 'Cannot Confirm', color: 'bg-red-50 border-red-300 text-red-800' },
  { value: 'requires_clarification', label: 'Requires Clarification', color: 'bg-amber-50 border-amber-300 text-amber-800' },
  { value: 'not_applicable', label: 'Not Applicable', color: 'bg-slate-50 border-slate-300 text-slate-700' },
];

function evidenceBadge(state: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    VERIFIED: { label: 'Avorria Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    DECLARED: { label: 'Self-Declared', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    EXPIRED: { label: 'Expired', color: 'bg-red-50 text-red-700 border-red-200' },
    MISSING: { label: 'Not Found', color: 'bg-slate-100 text-slate-500 border-slate-200' },
    NEEDS_CLARIFICATION: { label: 'Needs Clarification', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    NOT_APPLICABLE: { label: 'Not Applicable', color: 'bg-slate-100 text-slate-400 border-slate-200' },
  };
  return map[state] ?? { label: state, color: 'bg-slate-100 text-slate-500 border-slate-200' };
}

function strengthBadge(strength: string): string {
  if (strength === 'required') return 'bg-red-50 text-red-700 border-red-200';
  if (strength === 'preferred') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-500 border-slate-200';
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default function ContractorRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;

  const [invitation, setInvitation] = useState<RequestInvitation | null>(null);
  const [requirementViews, setRequirementViews] = useState<ContractorResponseRequirementView[]>([]);
  const [response, setResponse] = useState<RequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('overview');

  // Response draft state
  const [availability, setAvailability] = useState<AvailabilityStatus | ''>('');
  const [proposedStart, setProposedStart] = useState('');
  const [proposedCompletion, setProposedCompletion] = useState('');
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [responseNotes, setResponseNotes] = useState('');
  const [ackMap, setAckMap] = useState<Record<string, { status: RequirementResponseStatus; comment: string; ref: string }>>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadInvitation = useCallback(async () => {
    try {
      const res = await fetch(`/api/contractor/invitations/${invitationId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load invitation');
      setInvitation(data.invitation);
      setRequirementViews(data.requirementViews ?? []);
      if (data.response) {
        setResponse(data.response);
        setAvailability(data.response.availability_status ?? '');
        setProposedStart(data.response.proposed_start_date ?? '');
        setProposedCompletion(data.response.proposed_completion_date ?? '');
        setAvailabilityNotes(data.response.availability_notes ?? '');
        setResponseNotes(data.response.response_notes ?? '');
        if (data.response.status === 'submitted') setCurrentStep('submitted');
      }
      // Initialise ack map from existing acknowledgements
      const newAckMap: typeof ackMap = {};
      for (const view of (data.requirementViews ?? []) as ContractorResponseRequirementView[]) {
        if (view.acknowledgement) {
          newAckMap[view.requirementId] = {
            status: view.acknowledgement.response_status,
            comment: view.acknowledgement.contractor_comment ?? '',
            ref: view.acknowledgement.evidence_reference ?? '',
          };
        }
      }
      setAckMap(newAckMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  useEffect(() => { loadInvitation(); }, [loadInvitation]);

  const handleExpressInterest = async () => {
    setIsExpressingInterest(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/contractor/invitations/${invitationId}/interest`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setInvitation(data.invitation);
      setResponse(data.response);
      setCurrentStep('availability');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsExpressingInterest(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) return;
    setIsDeclining(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/contractor/invitations/${invitationId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setInvitation(data.invitation);
      setShowDeclineModal(false);
      router.push('/contractor/requests');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to decline');
    } finally {
      setIsDeclining(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!response) return;
    await fetch(`/api/contractor/invitations/${invitationId}/response`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        availability_status: availability || undefined,
        proposed_start_date: proposedStart || undefined,
        proposed_completion_date: proposedCompletion || undefined,
        availability_notes: availabilityNotes || undefined,
        response_notes: responseNotes || undefined,
      }),
    });
    setCurrentStep('requirements');
  };

  const handleSaveAck = async (requirementId: string) => {
    const ack = ackMap[requirementId];
    if (!ack) return;
    await fetch(`/api/contractor/invitations/${invitationId}/response/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement_id: requirementId,
        response_status: ack.status,
        contractor_comment: ack.comment || undefined,
        evidence_reference: ack.ref || undefined,
      }),
    });
  };

  const handleSubmit = async () => {
    if (!availability) { setSubmitError('Availability status is required.'); return; }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const acks = requirementViews.map((view) => {
        const ack = ackMap[view.requirementId];
        return {
          requirement_id: view.requirementId,
          response_status: ack?.status ?? 'requires_clarification',
          contractor_comment: ack?.comment || undefined,
          evidence_reference: ack?.ref || undefined,
        };
      });

      const res = await fetch(`/api/contractor/invitations/${invitationId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability_status: availability,
          proposed_start_date: proposedStart || undefined,
          proposed_completion_date: proposedCompletion || undefined,
          availability_notes: availabilityNotes || undefined,
          response_notes: responseNotes || undefined,
          requirement_acknowledgements: acks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit');
      setResponse(data.response);
      setCurrentStep('submitted');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          Loading invitation…
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error ?? 'Invitation not found'}</p>
          <Link href="/contractor/requests" className="mt-4 inline-block text-sm text-slate-500 hover:text-slate-700">
            ← Back to inbox
          </Link>
        </div>
      </div>
    );
  }

  const isActive = ['sent', 'viewed', 'interested'].includes(invitation.status);
  const canRespond = invitation.status === 'interested' && response?.status === 'draft';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-900 bg-slate-900 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/contractor/requests" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-4 w-fit">
            ← Project Requests
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">Private Invitation</p>
              <h1 className="text-xl font-semibold text-white">Respond to Project Request</h1>
              <p className="text-sm text-slate-400 mt-1">
                Invitation {invitation.id.slice(0, 12)}… · {invitation.match_engine_version}
              </p>
            </div>
            <InvitationStatusBadge status={invitation.status} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Submitted state */}
        {currentStep === 'submitted' && (
          <SubmittedView response={response} invitationId={invitationId} />
        )}

        {/* Overview step — first view of invitation */}
        {currentStep === 'overview' && (
          <OverviewStep
            invitation={invitation}
            requirementViews={requirementViews}
            isActive={isActive}
            isExpressingInterest={isExpressingInterest}
            onExpressInterest={handleExpressInterest}
            onDecline={() => setShowDeclineModal(true)}
            submitError={submitError}
          />
        )}

        {/* Availability step */}
        {currentStep === 'availability' && canRespond && (
          <AvailabilityStep
            availability={availability}
            proposedStart={proposedStart}
            proposedCompletion={proposedCompletion}
            availabilityNotes={availabilityNotes}
            onAvailabilityChange={setAvailability}
            onProposedStartChange={setProposedStart}
            onProposedCompletionChange={setProposedCompletion}
            onAvailabilityNotesChange={setAvailabilityNotes}
            onNext={handleSaveAvailability}
            onBack={() => setCurrentStep('overview')}
          />
        )}

        {/* Requirements step */}
        {currentStep === 'requirements' && canRespond && (
          <RequirementsStep
            requirementViews={requirementViews}
            ackMap={ackMap}
            onAckChange={(reqId, field, value) => {
              setAckMap((prev) => ({
                ...prev,
                [reqId]: { ...prev[reqId], [field]: value },
              }));
            }}
            onSaveAck={handleSaveAck}
            onNext={() => setCurrentStep('notes')}
            onBack={() => setCurrentStep('availability')}
          />
        )}

        {/* Notes step */}
        {currentStep === 'notes' && canRespond && (
          <NotesStep
            responseNotes={responseNotes}
            onResponseNotesChange={setResponseNotes}
            onNext={() => setCurrentStep('review')}
            onBack={() => setCurrentStep('requirements')}
          />
        )}

        {/* Review step */}
        {currentStep === 'review' && canRespond && (
          <ReviewStep
            invitation={invitation}
            requirementViews={requirementViews}
            ackMap={ackMap}
            availability={availability as AvailabilityStatus}
            proposedStart={proposedStart}
            proposedCompletion={proposedCompletion}
            availabilityNotes={availabilityNotes}
            responseNotes={responseNotes}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep('notes')}
          />
        )}
      </div>

      {/* Decline modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Decline Invitation</h2>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a brief reason. This will be shared with the client.
            </p>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
              rows={3}
              placeholder="e.g. Outside our current service area, project timeline doesn't align with our schedule…"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            {submitError && <p className="text-red-600 text-xs mt-2">{submitError}</p>}
            <div className="flex items-center gap-3 mt-4 justify-end">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={isDeclining || !declineReason.trim()}
                className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeclining ? 'Declining…' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function InvitationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    sent: { label: 'Awaiting Review', color: 'bg-amber-500 text-white' },
    viewed: { label: 'Viewed', color: 'bg-blue-500 text-white' },
    interested: { label: 'Responding', color: 'bg-indigo-500 text-white' },
    declined: { label: 'Declined', color: 'bg-slate-500 text-white' },
    withdrawn: { label: 'Withdrawn', color: 'bg-slate-500 text-white' },
    expired: { label: 'Expired', color: 'bg-red-600 text-white' },
  };
  const badge = map[status] ?? { label: status, color: 'bg-slate-500 text-white' };
  return (
    <span className={`text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full ${badge.color}`}>
      {badge.label}
    </span>
  );
}

function OverviewStep({
  invitation,
  requirementViews,
  isActive,
  isExpressingInterest,
  onExpressInterest,
  onDecline,
  submitError,
}: {
  invitation: RequestInvitation;
  requirementViews: ContractorResponseRequirementView[];
  isActive: boolean;
  isExpressingInterest: boolean;
  onExpressInterest: () => void;
  onDecline: () => void;
  submitError: string | null;
}) {
  const required = requirementViews.filter((r) => r.requirementStrength === 'required');
  const preferred = requirementViews.filter((r) => r.requirementStrength === 'preferred');

  return (
    <div className="space-y-6">
      {/* Invitation message */}
      {invitation.invitation_message && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Message from Client</p>
          <p className="text-sm text-slate-700 leading-relaxed italic">"{invitation.invitation_message}"</p>
        </div>
      )}

      {/* Evidence notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-800 mb-1">Evidence State Notice</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          The evidence states shown below reflect your published Passport at the time this invitation was issued.
          Your declarations in this response are separate from Avorria's published evidence and from formal Avorria verification.
        </p>
      </div>

      {/* Requirements overview */}
      {requirementViews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Requirement Overview</p>
            <p className="text-sm text-slate-600 mt-0.5">
              {requirementViews.length} requirement{requirementViews.length !== 1 ? 's' : ''} ·{' '}
              {required.length} required · {preferred.length} preferred
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {requirementViews.slice(0, 6).map((view) => {
              const evidence = evidenceBadge(view.evidenceStateAtInvitation);
              const strength = strengthBadge(view.requirementStrength);
              return (
                <div key={view.requirementId} className="px-6 py-3 flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{view.requirementTitle}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{view.requirementCategory}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${strength}`}>
                      {view.requirementStrength}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${evidence.color}`}>
                      {evidence.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {requirementViews.length > 6 && (
              <div className="px-6 py-3 text-xs text-slate-400">
                + {requirementViews.length - 6} more requirements
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      {isActive && invitation.status !== 'interested' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          {submitError && <p className="text-red-600 text-sm mb-4">{submitError}</p>}
          <p className="text-sm font-medium text-slate-800 mb-1">How would you like to proceed?</p>
          <p className="text-xs text-slate-500 mb-4">
            Expressing interest creates a draft response. You can build and review your response before submitting.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onExpressInterest}
              disabled={isExpressingInterest}
              className="bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {isExpressingInterest ? 'Starting…' : 'Invite to Respond → Begin Response'}
            </button>
            <button
              onClick={onDecline}
              className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2.5 border border-slate-200 rounded-lg hover:border-slate-300"
            >
              Decline Invitation
            </button>
          </div>
        </div>
      )}

      {invitation.status === 'interested' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <p className="text-sm font-medium text-indigo-800 mb-3">You have expressed interest. Continue building your response.</p>
          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); }}
            className="text-sm text-indigo-700 font-medium hover:text-indigo-900"
          >
            Continue → Availability
          </Link>
        </div>
      )}
    </div>
  );
}

function AvailabilityStep({
  availability, proposedStart, proposedCompletion, availabilityNotes,
  onAvailabilityChange, onProposedStartChange, onProposedCompletionChange, onAvailabilityNotesChange,
  onNext, onBack,
}: {
  availability: AvailabilityStatus | '';
  proposedStart: string;
  proposedCompletion: string;
  availabilityNotes: string;
  onAvailabilityChange: (v: AvailabilityStatus) => void;
  onProposedStartChange: (v: string) => void;
  onProposedCompletionChange: (v: string) => void;
  onAvailabilityNotesChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <StepHeader step={2} total={5} title="Availability" description="Declare your availability for this project." />

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
            Availability Status <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  availability === opt.value
                    ? 'border-slate-700 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="availability"
                  value={opt.value}
                  checked={availability === opt.value}
                  onChange={() => onAvailabilityChange(opt.value)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Proposed Start Date
            </label>
            <input
              type="date"
              value={proposedStart}
              onChange={(e) => onProposedStartChange(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Proposed Completion Date
            </label>
            <input
              type="date"
              value={proposedCompletion}
              onChange={(e) => onProposedCompletionChange(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
            Availability Notes <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={availabilityNotes}
            onChange={(e) => onAvailabilityNotesChange(e.target.value)}
            placeholder="Any scheduling conditions, lead times, or resource constraints…"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <StepNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!availability}
        nextLabel="Save & Continue → Requirements"
      />
    </div>
  );
}

function RequirementsStep({
  requirementViews, ackMap, onAckChange, onSaveAck, onNext, onBack,
}: {
  requirementViews: ContractorResponseRequirementView[];
  ackMap: Record<string, { status: RequirementResponseStatus; comment: string; ref: string }>;
  onAckChange: (reqId: string, field: string, value: string) => void;
  onSaveAck: (reqId: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const addressedCount = requirementViews.filter((v) => ackMap[v.requirementId]?.status).length;

  return (
    <div className="space-y-6">
      <StepHeader
        step={3}
        total={5}
        title="Requirements"
        description={`Address each requirement. ${addressedCount}/${requirementViews.length} addressed.`}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <strong>Important:</strong> Your responses here represent your own declarations.
        They do not modify your published Passport evidence or Avorria verification status.
      </div>

      <div className="space-y-4">
        {requirementViews.map((view) => {
          const evidence = evidenceBadge(view.evidenceStateAtInvitation);
          const strength = strengthBadge(view.requirementStrength);
          const ack = ackMap[view.requirementId];
          const isAddressed = !!ack?.status;

          return (
            <div
              key={view.requirementId}
              className={`bg-white border rounded-xl overflow-hidden ${
                isAddressed ? 'border-slate-200' : 'border-amber-200'
              }`}
            >
              {/* Requirement header */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{view.requirementTitle}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{view.requirementCategory}</p>
                    {view.evidenceExplanation && (
                      <p className="text-xs text-slate-500 mt-1">{view.evidenceExplanation}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${strength}`}>
                      {view.requirementStrength}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${evidence.color}`}>
                      {evidence.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Response controls */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Your Response <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {REQUIREMENT_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onAckChange(view.requirementId, 'status', opt.value);
                          setTimeout(() => onSaveAck(view.requirementId), 50);
                        }}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          ack?.status === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-slate-400' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                      Comment <span className="text-slate-300">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={ack?.comment ?? ''}
                      onChange={(e) => onAckChange(view.requirementId, 'comment', e.target.value)}
                      onBlur={() => onSaveAck(view.requirementId)}
                      placeholder="Additional context…"
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                      Document / Reference <span className="text-slate-300">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={ack?.ref ?? ''}
                      onChange={(e) => onAckChange(view.requirementId, 'ref', e.target.value)}
                      onBlur={() => onSaveAck(view.requirementId)}
                      placeholder="e.g. Policy #GL-2024-0432"
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <StepNav
        onBack={onBack}
        onNext={onNext}
        nextLabel="Continue → Notes"
      />
    </div>
  );
}

function NotesStep({
  responseNotes, onResponseNotesChange, onNext, onBack,
}: {
  responseNotes: string;
  onResponseNotesChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <StepHeader step={4} total={5} title="Cover Note" description="Optional narrative to accompany your response." />

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
          Response Notes <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={6}
          value={responseNotes}
          onChange={(e) => onResponseNotesChange(e.target.value)}
          placeholder="Provide any additional context about your company's capabilities, relevant project experience, or qualifications for this specific project…"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <p className="text-xs text-slate-400 mt-2">
          This note is optional. Do not include commercial pricing or bid amounts in this response.
        </p>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Review & Submit →" />
    </div>
  );
}

function ReviewStep({
  invitation, requirementViews, ackMap, availability, proposedStart, proposedCompletion,
  availabilityNotes, responseNotes, isSubmitting, submitError, onSubmit, onBack,
}: {
  invitation: RequestInvitation;
  requirementViews: ContractorResponseRequirementView[];
  ackMap: Record<string, { status: RequirementResponseStatus; comment: string; ref: string }>;
  availability: AvailabilityStatus;
  proposedStart: string;
  proposedCompletion: string;
  availabilityNotes: string;
  responseNotes: string;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const confirmedCount = Object.values(ackMap).filter((a) => a.status === 'confirmed').length;
  const cannotConfirmCount = Object.values(ackMap).filter((a) => a.status === 'cannot_confirm').length;
  const clarificationCount = Object.values(ackMap).filter((a) => a.status === 'requires_clarification').length;
  const notApplicableCount = Object.values(ackMap).filter((a) => a.status === 'not_applicable').length;
  const availabilityOption = AVAILABILITY_OPTIONS.find((o) => o.value === availability);

  return (
    <div className="space-y-6">
      <StepHeader step={5} total={5} title="Review & Submit" description="Review your response before submitting to the client." />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Availability Declaration</p>
        </div>
        <div className="px-6 py-4 space-y-1">
          <p className="text-sm font-semibold text-slate-900">{availabilityOption?.label ?? availability}</p>
          {proposedStart && <p className="text-xs text-slate-500">Proposed Start: {proposedStart}</p>}
          {proposedCompletion && <p className="text-xs text-slate-500">Proposed Completion: {proposedCompletion}</p>}
          {availabilityNotes && <p className="text-xs text-slate-500 mt-1 italic">{availabilityNotes}</p>}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Requirement Summary</p>
        </div>
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div><p className="text-2xl font-bold text-emerald-700">{confirmedCount}</p><p className="text-xs text-slate-400">Confirmed</p></div>
          <div><p className="text-2xl font-bold text-red-600">{cannotConfirmCount}</p><p className="text-xs text-slate-400">Cannot Confirm</p></div>
          <div><p className="text-2xl font-bold text-amber-600">{clarificationCount}</p><p className="text-xs text-slate-400">Needs Clarification</p></div>
          <div><p className="text-2xl font-bold text-slate-400">{notApplicableCount}</p><p className="text-xs text-slate-400">Not Applicable</p></div>
        </div>
      </div>

      {responseNotes && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Cover Note</p>
          <p className="text-sm text-slate-700 italic">{responseNotes}</p>
        </div>
      )}

      <div className="bg-slate-900 rounded-xl p-5">
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          By submitting, you confirm your declarations are accurate to the best of your knowledge.
          This response does not constitute a binding contract or an accepted appointment.
          Your response will be visible to the client in their response centre.
        </p>
        {submitError && <p className="text-red-400 text-xs mb-3">{submitError}</p>}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2"
          >
            ← Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-white text-slate-900 text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-100 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Response'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmittedView({ response, invitationId }: { response: RequestResponse | null; invitationId: string }) {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="text-4xl mb-4">✅</div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Response Submitted</h2>
      <p className="text-sm text-slate-500 mb-1">
        Your response has been submitted and is now visible to the client in their response centre.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        No appointment or award has been made. The client will review all responses and may follow up through Avorria Connect.
      </p>
      {response?.submitted_at && (
        <p className="text-xs text-slate-400 mb-6">
          Submitted {new Date(response.submitted_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      )}
      <Link
        href="/contractor/requests"
        className="inline-block bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-800"
      >
        Return to Inbox
      </Link>
    </div>
  );
}

function StepHeader({ step, total, title, description }: { step: number; total: number; title: string; description: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Step {step} of {total}</p>
      <h2 className="text-lg font-semibold text-slate-900 mt-0.5">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

function StepNav({ onBack, onNext, nextDisabled = false, nextLabel }: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </div>
  );
}
