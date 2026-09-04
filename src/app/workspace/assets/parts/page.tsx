import React from 'react';
import { getSessionContext } from '@/lib/workspace/context';
import { listSpareParts, listAssets } from '@/lib/assets/db';
import { PartsClient } from './PartsClient';

export const dynamic = 'force-dynamic';

export default async function PartsPage() {
  const session = await getSessionContext();
  const [parts, assets] = await Promise.all([
    listSpareParts(session.organization.id),
    listAssets(session.organization.id),
  ]);

  return (
    <PartsClient
      organization={session.organization}
      user={session.user}
      initialParts={parts}
      assets={assets}
    />
  );
}
