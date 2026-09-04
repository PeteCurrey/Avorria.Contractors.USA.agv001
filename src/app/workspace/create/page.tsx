import React from 'react';
import { getWorkspaceContext } from '@/lib/workspace/context';
import {
  listProjects,
  listCapabilities,
  listCaseStudies,
  listReferences,
  getCommercialProfile,
  calculateCommercialReadiness,
} from '@/lib/create/evidence-store';
import { listCredentials, listDocuments } from '@/lib/workspace/db';
import { CreateHub } from './CreateHub';

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const { organization, user } = await getWorkspaceContext();
  const orgId = organization.id;

  const [
    projects,
    capabilities,
    caseStudies,
    references,
    profile,
    credentials,
    documents,
    readiness,
  ] = await Promise.all([
    listProjects(orgId),
    listCapabilities(orgId),
    listCaseStudies(orgId),
    listReferences(orgId),
    getCommercialProfile(orgId),
    listCredentials(orgId),
    listDocuments(orgId),
    calculateCommercialReadiness(orgId),
  ]);

  return (
    <CreateHub
      organization={organization}
      user={user}
      projects={projects}
      capabilities={capabilities}
      caseStudies={caseStudies}
      references={references}
      profile={profile}
      credentials={credentials}
      documents={documents}
      readiness={readiness}
    />
  );
}
