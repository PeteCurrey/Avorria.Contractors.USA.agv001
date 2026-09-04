import React from 'react';
import { notFound } from 'next/navigation';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getProject } from '@/lib/create/evidence-store';
import { listDocuments } from '@/lib/workspace/db';
import { ProjectDetailClient } from './ProjectDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organization } = await getWorkspaceContext();
  const [project, allDocuments] = await Promise.all([
    getProject(organization.id, id),
    listDocuments(organization.id),
  ]);

  if (!project) {
    notFound();
  }

  const linkedDocs = allDocuments.filter((d) =>
    (project.evidence_document_ids || []).includes(d.id)
  );

  return (
    <ProjectDetailClient
      project={project}
      linkedDocuments={linkedDocs}
    />
  );
}
