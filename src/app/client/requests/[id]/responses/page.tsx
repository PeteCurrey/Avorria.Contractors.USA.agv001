import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import { getResponseCentre } from '@/lib/respond/service';
import { ClientResponseCentreClient } from './ClientResponseCentreClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Response Centre | Avorria Client',
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientResponseCentrePage({ params }: Props) {
  const { id } = await params;
  const client = await getClientContext();

  const pack = await getRequirementPackById(id, client.organisationId);
  if (!pack) {
    notFound();
  }

  const responseCentre = await getResponseCentre(id, client.organisationId);

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
            Response Centre: {pack.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review invitations and inspect contractor responses to your Requirement Pack.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/client/requests/${pack.id}/compare`}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <span>⚖️</span>
            <span>Compare Responses</span>
          </Link>
          <Link
            href={`/client/requests/${pack.id}/matches`}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <span>🔍</span>
            <span>Match Intelligence</span>
          </Link>
          <Link
            href={`/client/requests/${pack.id}`}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            Request Brief
          </Link>
        </div>
      </div>

      {/* Interactive Client Component */}
      <ClientResponseCentreClient pack={pack} initialData={responseCentre} />
    </div>
  );
}
