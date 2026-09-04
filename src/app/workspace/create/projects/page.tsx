import React from 'react';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listProjects } from '@/lib/create/evidence-store';
import { ProjectsClient } from './ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const { organization } = await getWorkspaceContext();
  const projects = await listProjects(organization.id);

  return <ProjectsClient projects={projects} />;
}
