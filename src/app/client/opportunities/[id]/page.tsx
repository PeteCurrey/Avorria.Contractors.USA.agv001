import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClientContext } from '@/lib/connect/context';
import { getOpportunityById, getOpportunityInvitations, getSavedContractors, getClientRelationships } from '@/lib/connect/repository';
import { findMatchingContractorsForOpportunity } from '@/lib/connect/matching';
import { OpportunityManagementClient } from './OpportunityManagementClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientOpportunityDetailPage({ params }: Props) {
  const { id } = await params;
  const client = await getClientContext();

  const opportunity = await getOpportunityById(id, client.organisationId);
  if (!opportunity) {
    notFound();
  }

  const [invitations, saved, relationships, matching] = await Promise.all([
    getOpportunityInvitations(id, client.organisationId),
    getSavedContractors(client.organisationId),
    getClientRelationships(client.organisationId),
    findMatchingContractorsForOpportunity({
      trade: opportunity.trade,
      state: opportunity.location.state,
      city: opportunity.location.city,
      requirements: opportunity.requirements,
    }),
  ]);

  return (
    <OpportunityManagementClient
      opportunity={opportunity}
      invitations={invitations}
      savedContractors={saved}
      relationships={relationships}
      matching={matching}
    />
  );
}
