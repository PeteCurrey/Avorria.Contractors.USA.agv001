import React from 'react';
import { Metadata } from 'next';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getUserByOrg } from '@/lib/workspace/db';
import { TeamClient } from './TeamClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Team & User Roles | Avorria Contractor Workspace',
  robots: { index: false, follow: false },
};

export default async function WorkspaceTeamPage() {
  const { organization, user } = await getWorkspaceContext();
  const teamMembers = await getUserByOrg(organization.id);

  return (
    <div className="space-y-6">
      <div className="border border-slate-800 bg-[#090d16] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
            ORGANIZATION MEMBERS & ACCESS
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Team & User Roles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization owner, admins, office staff, and field crew.
          </p>
        </div>
      </div>

      <TeamClient organization={organization} currentUser={user} initialMembers={teamMembers} />
    </div>
  );
}
