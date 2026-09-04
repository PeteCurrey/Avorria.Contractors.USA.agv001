import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import { getOrComputeMatchSet } from '@/lib/match/service';
import { MatchIntelligenceClient } from './MatchIntelligenceClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contractor Match Intelligence',
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RequestMatchesPage({ params }: Props) {
  const { id } = await params;
  const client = await getClientContext();

  const pack = await getRequirementPackById(id, client.organisationId);
  if (!pack) {
    notFound();
  }

  // Load or compute deterministic match set using MATCH_ENGINE_V1
  const initialMatchSet = await getOrComputeMatchSet(
    id,
    client.organisationId,
    client.userId
  );

  return (
    <MatchIntelligenceClient
      pack={pack}
      initialMatchSet={initialMatchSet}
    />
  );
}
