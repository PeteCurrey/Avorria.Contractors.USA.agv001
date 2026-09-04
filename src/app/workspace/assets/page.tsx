import React from 'react';
import { getSessionContext } from '@/lib/workspace/context';
import { listAssets, listSpareParts } from '@/lib/assets/db';
import { AssetsHubClient } from './AssetsHubClient';

export const dynamic = 'force-dynamic';

export default async function AssetsPage() {
  const session = await getSessionContext();
  const [assets, parts] = await Promise.all([
    listAssets(session.organization.id),
    listSpareParts(session.organization.id),
  ]);

  const lowStockCount = parts.filter(
    (p) => p.quantity_on_hand <= p.reorder_threshold
  ).length;

  return (
    <AssetsHubClient
      organization={session.organization}
      user={session.user}
      initialAssets={assets}
      lowStockCount={lowStockCount}
    />
  );
}
