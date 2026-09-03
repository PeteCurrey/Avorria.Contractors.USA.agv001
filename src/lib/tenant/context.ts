import { cookies } from 'next/headers';
import { Organisation, ContractorProfile, UserRole } from '@/types/database';
import { getContractorWorkspace } from './repository';

export interface TenantContext {
  userId: string;
  userEmail: string;
  userRole: UserRole;
  organisation: Organisation;
  profile: ContractorProfile;
}

const DEFAULT_ORG_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DEFAULT_USER_ID = 'usr_owner_default';

/**
 * Resolves active tenant context for server components & server actions.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const cookieStore = await cookies();
  const sessionOrgId = cookieStore.get('avorria_active_org')?.value || DEFAULT_ORG_ID;
  const sessionUserId = cookieStore.get('avorria_user_id')?.value || DEFAULT_USER_ID;

  // Retrieve workspace state from repository
  const workspace = await getContractorWorkspace(sessionOrgId);

  return {
    userId: sessionUserId,
    userEmail: workspace.organisation.email || 'contractor@avorria-test.com',
    userRole: 'contractor_owner',
    organisation: workspace.organisation,
    profile: workspace.profile,
  };
}
