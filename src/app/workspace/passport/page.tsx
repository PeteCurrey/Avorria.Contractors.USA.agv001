import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getAssembledPassport } from '@/lib/passport/assembly';
import { listPassportAccessLogs } from '@/lib/workspace/db';
import { PassportHub } from './PassportHub';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contractor Passport • Verified Commercial Identity | Avorria Workspace',
  description:
    'Authoritative, reusable commercial identity assembled from structured business, capability, experience, compliance, and evidence records.',
  robots: { index: false, follow: false },
};

export default async function WorkspacePassportPage() {
  const { organization, user } = await getWorkspaceContext();
  const assembly = await getAssembledPassport(organization.id);
  const logs = assembly.passport ? await listPassportAccessLogs(assembly.passport.id) : [];

  return (
    <PassportHub
      organization={organization}
      user={user}
      assembly={assembly}
      logs={logs}
    />
  );
}
