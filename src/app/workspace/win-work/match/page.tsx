import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { evaluateContractorOpportunityFit } from '@/lib/match/contractor-fit-engine';
import { listDiscoverOpportunities, getDiscoverOpportunityById } from '@/lib/discover/repository';
import { ExplainableMatchHub } from './ExplainableMatchHub';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    opportunityId?: string;
  }>;
}

export default async function ContractorMatchPage({ searchParams }: PageProps) {
  const { organization } = await getWorkspaceContext();
  const { opportunityId } = await searchParams;

  // If no opportunityId supplied, fetch available open opportunities and auto-select or present selector
  const availableOppsResult = await listDiscoverOpportunities(organization.id, {
    limit: 20,
    status: 'open',
  });

  let selectedOppId = opportunityId;
  if (!selectedOppId && availableOppsResult.opportunities.length > 0) {
    selectedOppId = availableOppsResult.opportunities[0].id;
  }

  if (!selectedOppId) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        padding: '40px',
        color: '#f9fafb',
        fontFamily: 'Work Sans, sans-serif',
      }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 400, marginBottom: '12px' }}>
          Commercial Fit Engine (MATCH)
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
          No active opportunities available in Discover to evaluate.
        </p>
      </div>
    );
  }

  const [fit, opp] = await Promise.all([
    evaluateContractorOpportunityFit(selectedOppId, organization.id),
    getDiscoverOpportunityById(selectedOppId, organization.id),
  ]);

  if (!fit || !opp) {
    notFound();
  }

  return (
    <ExplainableMatchHub
      fit={fit}
      opportunity={opp}
      availableOpportunities={availableOppsResult.opportunities.map((o) => ({
        id: o.id,
        title: o.title,
        client_name: o.client_name,
        trade_label: o.trade_label || o.trade,
      }))}
    />
  );
}
