import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import { previewContractorMatchesForPack } from '@/lib/request/matching-preview';
import { RequirementEvidenceMatrix } from '@/components/request/RequirementEvidenceMatrix';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Preliminary Candidate Match Preview',
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RequestMatchesPreviewPage({ params }: Props) {
  const { id } = await params;
  const client = await getClientContext();

  const pack = await getRequirementPackById(id, client.organisationId);
  if (!pack) {
    notFound();
  }

  const preview = await previewContractorMatchesForPack(pack);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href={`/client/requests/${pack.id}`}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Request Brief
            </Link>
            <span className="text-xs text-slate-300">/</span>
            <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {pack.reference}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Preliminary Contractor Match Preview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deterministic Requirement-to-Evidence analysis for {pack.title} ({pack.city}, {pack.state}).
          </p>
        </div>

        <Link
          href={`/client/requests/${pack.id}`}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs shrink-0"
        >
          View Request Brief →
        </Link>
      </div>

      {/* Strict Non-Marketplace & Privacy Banner */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="text-2xl shrink-0 mt-0.5">🔒</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-300 font-bold">
                Private Buyer Preview
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300">Strict Non-Marketplace Engine</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              Contractors Have Not Been Notified
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
              This preview matches your structured Requirement Pack against published contractor Passport evidence. No contractors are informed of this search. There is no public bidding, price competition, or auction mechanism.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            Contractors Evaluated
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {preview.totalContractorsEvaluated}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active published directory profiles</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            Eligible Candidates
          </span>
          <div className="text-2xl font-bold text-brand-600 mt-1">
            {preview.eligibleContractorsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Matched trade classification & territory</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            Verified by Avorria
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {preview.verifiedContractorsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Audited against published criteria</p>
        </div>
      </div>

      {/* Candidates List with Requirement-to-Evidence Matrix */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Candidate Contractors & Evidence Breakdown ({preview.candidates.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Sorted deterministically by eligibility & verification
          </span>
        </div>

        {preview.candidates.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl mb-4">
              🔍
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching contractors found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No published contractors currently match the selected trade classifications in {pack.city}, {pack.state}. Consider expanding trade classifications or operating territory in the request brief.
            </p>
            <Link
              href={`/client/requests/${pack.id}`}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all shadow-sm"
            >
              Edit Request Scope →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {preview.candidates.map((candidate) => (
              <RequirementEvidenceMatrix key={candidate.contractorId} candidate={candidate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
