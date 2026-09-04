import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getPassportByOrg } from '@/lib/workspace/passport';
import { listCredentials } from '@/lib/workspace/credentials';
import { listDocuments, listPassportAccessLogs } from '@/lib/workspace/db';
import { ProveClient } from './ProveClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contractor Passport (Prove) | Avorria Contractor Workspace',
  robots: { index: false, follow: false },
};

export default async function ProvePage() {
  const { organization } = await getWorkspaceContext();
  const passport = await getPassportByOrg(organization.id);
  const credentials = await listCredentials(organization.id);
  const documents = await listDocuments(organization.id);
  const accessLogs = passport ? await listPassportAccessLogs(passport.id) : [];

  return (
    <div className="space-y-6">
      <div className="border border-slate-800 bg-[#090d16] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
            PROVE PILLAR • PUBLIC VERIFICATION
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Contractor Passport Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish an institutional proof-of-competence link. Live credentials, zero stale snapshots, and optional password protection.
          </p>
        </div>
      </div>

      <ProveClient
        organization={organization}
        initialPassport={passport}
        credentials={credentials}
        documents={documents}
        accessLogs={accessLogs}
      />
    </div>
  );
}
