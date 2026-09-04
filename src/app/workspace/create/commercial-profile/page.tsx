import React from 'react';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getCommercialProfile } from '@/lib/create/evidence-store';
import { CommercialProfileClient } from './CommercialProfileClient';

export const dynamic = 'force-dynamic';

export default async function CommercialProfilePage() {
  const { organization } = await getWorkspaceContext();
  const profile = await getCommercialProfile(organization.id);

  return (
    <CommercialProfileClient
      organization={organization}
      profile={profile}
    />
  );
}
