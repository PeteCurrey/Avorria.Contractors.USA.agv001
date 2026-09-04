import React from 'react';
import { getSessionContext } from '@/lib/workspace/context';
import { listDocuments } from '@/lib/workspace/db';
import { CreateHubClient } from './CreateHubClient';

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const session = await getSessionContext();
  const allDocs = await listDocuments(session.organization.id);
  // Filter to AI-generated documents
  const aiDocs = allDocs.filter((d) => d.generated_by === 'ai');

  return (
    <CreateHubClient
      organization={session.organization}
      user={session.user}
      documents={aiDocs}
    />
  );
}
