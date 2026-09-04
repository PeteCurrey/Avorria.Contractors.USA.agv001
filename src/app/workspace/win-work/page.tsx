import React from 'react';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listDiscoverOpportunities } from '@/lib/discover/repository';
import { getPassportByOrg } from '@/lib/workspace/db';
import { DiscoverHub } from './DiscoverHub';

export const dynamic = 'force-dynamic';

export default async function WinWorkPage() {
  const { organization } = await getWorkspaceContext();
  const initialData = await listDiscoverOpportunities(organization.id, {
    page: 1,
    limit: 20,
    status: 'all',
  });

  const passport = await getPassportByOrg(organization.id);

  const profileContext = {
    organizationName: organization.name,
    primaryTrade: organization.primary_trade,
    additionalTrades: organization.additional_trades || [],
    statesLicensed: organization.states_licensed || [],
    passportPublished: Boolean(passport?.published_version || passport?.status === 'CURRENT'),
    passportVersion: passport?.version ? `v${passport.version}` : null,
  };

  return (
    <DiscoverHub
      contractorOrgId={organization.id}
      profileContext={profileContext}
      initialData={initialData}
    />
  );
}
