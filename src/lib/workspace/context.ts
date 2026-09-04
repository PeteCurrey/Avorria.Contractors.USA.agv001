/**
 * AVORRIA WORKSPACE AUTHENTICATION CONTEXT
 *
 * Resolves current user and organization context for Server Components and API routes.
 * Integrates with Supabase Auth session with reliable multi-tenant fallback.
 */

import { cookies } from 'next/headers';
import { Organization, WorkspaceUser } from './types';
import {
  getOrganization,
  saveOrganization,
  getUser,
  saveUser,
  getUserByOrg,
} from './db';
import { createClient } from '@/lib/supabase/server';

export interface WorkspaceContext {
  user: WorkspaceUser;
  organization: Organization;
}

export const DEMO_ORG_ID = 'org_vance_electric_01';
export const DEMO_USER_ID = 'usr_marcus_vance_01';

/**
 * Initializes default contractor organization if store is empty.
 */
async function ensureDefaultOrg(): Promise<{ org: Organization; user: WorkspaceUser }> {
  let org = await getOrganization(DEMO_ORG_ID);
  if (!org) {
    org = await saveOrganization({
      id: DEMO_ORG_ID,
      name: 'Vance Commercial Electric LLC',
      legal_name: 'Vance Commercial Electric LLC',
      entity_type: 'LLC',
      ein: 'XX-XXX4022',
      primary_trade: 'Electrical',
      additional_trades: ['Low Voltage & Security'],
      states_licensed: ['TX'],
      hq_address: {
        street: '1500 Red River St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
      subscription_tier: 'pro',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  let user = await getUser(DEMO_USER_ID);
  if (!user) {
    user = await saveUser({
      id: DEMO_USER_ID,
      org_id: org.id,
      role: 'owner',
      full_name: 'Marcus Vance',
      email: 'marcus@vanceelectric.com',
      phone: '(512) 555-4022',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return { org, user };
}

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  const cookieStore = await cookies();
  const cookieOrgId = cookieStore.get('avorria_workspace_org')?.value;
  const cookieUserId = cookieStore.get('avorria_workspace_user')?.value;

  // Try Supabase Auth session
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const supaUser = data.user;
      const existingUser = await getUser(supaUser.id);
      if (existingUser) {
        const org = await getOrganization(existingUser.org_id);
        if (org) {
          return { user: existingUser, organization: org };
        }
      }
    }
  } catch {
    // Supabase auth check fallback
  }

  // Check cookie-based org/user
  if (cookieOrgId && cookieUserId) {
    const org = await getOrganization(cookieOrgId);
    const user = await getUser(cookieUserId);
    if (org && user) {
      return { user, organization: org };
    }
  }

  // Fallback to primary organization
  const defaultContext = await ensureDefaultOrg();
  return {
    organization: defaultContext.org,
    user: defaultContext.user,
  };
}

export const getSessionContext = getWorkspaceContext;
