import React from 'react';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listReferences, listProjects } from '@/lib/create/evidence-store';
import { ReferencesClient } from './ReferencesClient';

export const dynamic = 'force-dynamic';

export default async function ReferencesPage() {
  const { organization } = await getWorkspaceContext();
  const [references, projects] = await Promise.all([
    listReferences(organization.id),
    listProjects(organization.id),
  ]);

  return <ReferencesClient references={references} projects={projects} />;
}
