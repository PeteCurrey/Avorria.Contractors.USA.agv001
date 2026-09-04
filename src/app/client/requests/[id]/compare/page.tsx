import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import { getResponseCentre } from '@/lib/respond/service';
import { getCompareSetMatrix } from '@/lib/compare/service';
import { CompareWorkspaceClient } from '@/components/compare/CompareWorkspaceClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Compare Responses | Avorria Client',
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ compareId?: string }>;
}

export default async function ClientComparePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { compareId } = await searchParams;

  const client = await getClientContext();

  const pack = await getRequirementPackById(id, client.organisationId);
  if (!pack) {
    notFound();
  }

  const responseCentre = await getResponseCentre(id, client.organisationId);

  // If a compareId is provided in the query string, load the matrix server-side
  let initialMatrix = null;
  if (compareId) {
    try {
      initialMatrix = await getCompareSetMatrix(compareId, client.organisationId);
    } catch {
      // If not found / stale, we just show selector
    }
  }

  const submittedCount = responseCentre.invitations.filter(
    (i) => i.response?.status === 'submitted'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
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
            Compare Responses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evidence-led factual comparison of contractor positions against your Requirement Pack.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/client/requests/${pack.id}/responses`}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Response Centre ({submittedCount})</span>
          </Link>
          <Link
            href={`/client/requests/${pack.id}/matches`}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <span>🔍</span>
            <span>Match Intelligence</span>
          </Link>
        </div>
      </div>

      {/* Pack Context */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-wrap items-center gap-4 text-xs shadow-2xs">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Pack</span>
          <div className="font-bold text-slate-900 mt-0.5">{pack.title}</div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Location</span>
          <div className="font-medium text-slate-700 mt-0.5">{pack.city}, {pack.state}</div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Requirements</span>
          <div className="font-bold text-slate-900 mt-0.5">{pack.requirements?.length ?? 0}</div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Responses Available</span>
          <div className="font-bold text-emerald-700 mt-0.5">{submittedCount}</div>
        </div>
      </div>

      {/* Main Compare Workspace */}
      <CompareWorkspaceClient
        pack={pack}
        responseCentre={responseCentre}
        initialMatrix={initialMatrix}
      />
    </div>
  );
}
