import React from 'react';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listCaseStudies, listProjects } from '@/lib/create/evidence-store';
import { CaseStudiesClient } from './CaseStudiesClient';

export const dynamic = 'force-dynamic';

export default async function CaseStudiesPage() {
  const { organization } = await getWorkspaceContext();
  const [caseStudies, projects] = await Promise.all([
    listCaseStudies(organization.id),
    listProjects(organization.id),
  ]);

  return <CaseStudiesClient caseStudies={caseStudies} projects={projects} />;
}
