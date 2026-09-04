import React from 'react';
import { notFound } from 'next/navigation';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getDiscoverOpportunityById } from '@/lib/discover/repository';
import { OpportunityDetailView } from './OpportunityDetailView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { organization } = await getWorkspaceContext();
  const { id } = await params;

  const opportunity = await getDiscoverOpportunityById(id, organization.id);
  if (!opportunity) {
    notFound();
  }

  return (
    <OpportunityDetailView
      contractorOrgId={organization.id}
      opportunity={opportunity}
    />
  );
}
