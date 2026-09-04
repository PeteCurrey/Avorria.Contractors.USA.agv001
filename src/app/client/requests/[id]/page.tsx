import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import { evaluateRequestReadiness } from '@/lib/request/readiness';
import { RequestDetailClient } from './RequestDetailClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project Request Detail',
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const client = await getClientContext();

  const pack = await getRequirementPackById(id, client.organisationId);
  if (!pack) {
    notFound();
  }

  const readiness = evaluateRequestReadiness(pack);

  return (
    <RequestDetailClient
      initialPack={pack}
      initialReadiness={readiness}
    />
  );
}
