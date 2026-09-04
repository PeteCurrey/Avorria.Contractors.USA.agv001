import React from 'react';
import { notFound } from 'next/navigation';
import { getSessionContext } from '@/lib/workspace/context';
import {
  getAsset,
  listAssetDocuments,
  listServiceLogs,
  listSpareParts,
} from '@/lib/assets/db';
import { AssetDetailClient } from './AssetDetailClient';

export const dynamic = 'force-dynamic';

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionContext();
  const { id } = await params;

  const asset = await getAsset(id);
  if (!asset || asset.org_id !== session.organization.id) {
    notFound();
  }

  const [documents, serviceLogs, allParts] = await Promise.all([
    listAssetDocuments(session.organization.id, id),
    listServiceLogs(session.organization.id, id),
    listSpareParts(session.organization.id),
  ]);

  // Filter compatible parts for this asset
  const compatibleParts = allParts.filter(
    (p) =>
      p.compatible_asset_ids.includes(asset.id) ||
      p.compatible_asset_ids.includes(asset.name)
  );

  return (
    <AssetDetailClient
      organization={session.organization}
      user={session.user}
      asset={asset}
      initialDocuments={documents}
      initialServiceLogs={serviceLogs}
      compatibleParts={compatibleParts}
      allParts={allParts}
    />
  );
}
