import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listCredentials } from '@/lib/workspace/credentials';
import { ComplyClient } from './ComplyClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Comply Matrix | Avorria Contractor Workspace',
  robots: { index: false, follow: false },
};

export default async function ComplyPage() {
  const { organization } = await getWorkspaceContext();
  const credentials = await listCredentials(organization.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-slate-800 bg-[#090d16] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
            COMPLIANCE OPERATING SYSTEM
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Comply Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active credential ledger, automated 60/30/14-day threshold tracking, and verified insurance currencies.
          </p>
        </div>
      </div>

      <ComplyClient organization={organization} initialCredentials={credentials} />
    </div>
  );
}
