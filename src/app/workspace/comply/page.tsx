import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listComplyRecords, computeOverview, buildAttentionQueue } from '@/lib/comply/state-engine';
import { ComplyHub } from './ComplyHub';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Comply | Avorria Contractor Workspace',
  robots: { index: false, follow: false },
};

export default async function ComplyPage() {
  const { organization } = await getWorkspaceContext();
  const records = await listComplyRecords(organization.id);
  const overview = computeOverview(records);
  const attentionQueue = buildAttentionQueue(records);

  return (
    <ComplyHub
      organization={organization}
      records={records}
      overview={overview}
      attentionQueue={attentionQueue}
    />
  );
}
