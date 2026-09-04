import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import {
  getEvidencePosition,
  getEvidenceCompleteness,
  getUnsupportedRecords,
  getRecentlyVerified,
} from '@/lib/prove/prove-store';
import { ProveHub } from './ProveHub';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'PROVE • Contractor Evidence & Trust | Avorria Workspace',
  robots: { index: false, follow: false },
};

export default async function ProvePage() {
  const { organization } = await getWorkspaceContext();

  const [position, completeness, unsupportedRecords, recentlyVerified] = await Promise.all([
    getEvidencePosition(organization.id),
    getEvidenceCompleteness(organization.id),
    getUnsupportedRecords(organization.id),
    getRecentlyVerified(organization.id, 3),
  ]);

  return (
    <ProveHub
      organization={organization}
      position={position}
      completeness={completeness}
      unsupportedRecords={unsupportedRecords}
      recentlyVerified={recentlyVerified}
    />
  );
}
