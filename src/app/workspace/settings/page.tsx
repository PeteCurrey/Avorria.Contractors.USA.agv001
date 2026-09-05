import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { SettingsClient } from './SettingsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Organization Settings | Avorria Contractor Workspace',
  robots: { index: false, follow: false },
};

export default async function WorkspaceSettingsPage() {
  const { organization, user } = await getWorkspaceContext();

  return (
    <div className="space-y-6">
      <div className="border border-slate-800 bg-[#090d16] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
            ORGANIZATION PROFILE & PREFERENCES
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Organization Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Commercial contractor details, tax identification, and subscription configuration.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="border border-slate-800 bg-[#090d16] p-8 text-xs font-mono text-slate-500">Loading settings…</div>}>
        <SettingsClient organization={organization} currentUser={user} />
      </Suspense>
    </div>
  );
}
