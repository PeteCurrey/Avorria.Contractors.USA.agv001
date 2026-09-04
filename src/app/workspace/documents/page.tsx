import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listDocuments } from '@/lib/workspace/db';
import { DocumentsClient } from './DocumentsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Documents & Safety Vault | Avorria Contractor Workspace',
  robots: { index: false, follow: false },
};

export default async function WorkspaceDocumentsPage() {
  const { organization } = await getWorkspaceContext();
  const documents = await listDocuments(organization.id);

  return (
    <div className="space-y-6">
      <div className="border border-slate-800 bg-[#090d16] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
            SAFETY & OPERATIONAL ARCHIVE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Documents Archive
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Job Hazard Analyses (JHAs), Safety Plans, Toolbox Talks, and certificates on file.
          </p>
        </div>
      </div>

      <DocumentsClient organization={organization} initialDocuments={documents} />
    </div>
  );
}
