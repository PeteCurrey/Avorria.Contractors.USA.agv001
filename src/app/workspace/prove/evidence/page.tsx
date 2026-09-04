import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listEvidence } from '@/lib/prove/prove-store';
import { listCredentials, listDocuments } from '@/lib/workspace/db';
import { listProjects, listCapabilities, listReferences } from '@/lib/create/evidence-store';
import { EvidenceRegisterClient } from './EvidenceRegisterClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Evidence Register • PROVE | Avorria Workspace',
  robots: { index: false, follow: false },
};

export default async function EvidenceRegisterPage() {
  const { organization } = await getWorkspaceContext();

  const [evidenceList, documents, credentials, projects, capabilities, references] =
    await Promise.all([
      listEvidence(organization.id),
      listDocuments(organization.id),
      listCredentials(organization.id),
      listProjects(organization.id),
      listCapabilities(organization.id),
      listReferences(organization.id),
    ]);

  return (
    <EvidenceRegisterClient
      organization={organization}
      initialEvidence={evidenceList}
      documents={documents}
      credentials={credentials}
      projects={projects}
      capabilities={capabilities}
      references={references}
    />
  );
}
