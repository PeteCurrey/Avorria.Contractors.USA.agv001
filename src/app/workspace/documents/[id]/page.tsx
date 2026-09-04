import React from 'react';
import { notFound } from 'next/navigation';
import { getSessionContext } from '@/lib/workspace/context';
import { getDocument, listDocuments } from '@/lib/workspace/db';
import { DocumentDetailClient } from './DocumentDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const session = await getSessionContext();
  const { id } = await params;

  const doc = await getDocument(id);
  if (!doc || doc.org_id !== session.organization.id) {
    notFound();
  }

  // Fetch all documents in the org to trace version lineage
  const allDocs = await listDocuments(session.organization.id);
  // Find related versions (same title/parent chain)
  const relatedVersions = allDocs
    .filter((d) => d.id === doc.id || d.parent_document_id === doc.id || (doc.parent_document_id && (d.id === doc.parent_document_id || d.parent_document_id === doc.parent_document_id)))
    .sort((a, b) => b.version - a.version);

  return (
    <DocumentDetailClient
      document={doc}
      organization={session.organization}
      user={session.user}
      versionHistory={relatedVersions}
    />
  );
}
