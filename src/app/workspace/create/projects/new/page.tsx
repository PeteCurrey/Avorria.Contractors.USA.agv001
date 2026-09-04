import React from 'react';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listDocuments } from '@/lib/workspace/db';
import { NewProjectForm } from './NewProjectForm';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const { organization } = await getWorkspaceContext();
  const documents = await listDocuments(organization.id);

  return (
    <NewProjectForm
      documents={documents}
      defaultCity={organization.hq_address?.city || 'Austin'}
      defaultState={organization.hq_address?.state || 'TX'}
    />
  );
}
