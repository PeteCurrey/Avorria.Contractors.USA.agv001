import { cookies } from 'next/headers';
import { getClientProfile, saveClientProfile } from './repository';
import { ClientProfile } from './types';

export interface ClientContext {
  userId: string;
  userEmail: string;
  userRole: 'client_admin' | 'client_member';
  organisationId: string;
  profile: ClientProfile;
}

export const DEFAULT_CLIENT_ORG_ID = 'client-org-default-001';
export const DEFAULT_CLIENT_USER_ID = 'usr_client_admin_default';

/**
 * Resolves active client context from cookies or defaults to a hermetic client session.
 */
export async function getClientContext(): Promise<ClientContext> {
  const cookieStore = await cookies();
  const orgId = cookieStore.get('avorria_client_org')?.value || DEFAULT_CLIENT_ORG_ID;
  const userId = cookieStore.get('avorria_user_id')?.value || DEFAULT_CLIENT_USER_ID;

  let profile = await getClientProfile(orgId);
  if (!profile) {
    profile = {
      id: `client_prof_${orgId}`,
      organisation_id: orgId,
      organisation_name: 'Apex Commercial Facilities Management',
      organisation_type: 'facilities_management',
      contact_name: 'David Vance',
      job_title: 'Head of Facilities & Procurement',
      business_email: 'david.vance@apexfm.example.com',
      phone: '(512) 555-0199',
      operating_territory: {
        primaryState: 'TX',
        cities: ['Austin', 'San Antonio', 'Dallas'],
      },
      preferred_trades: ['electrical-contracting', 'commercial-roofing', 'hvac-mechanical'],
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveClientProfile(profile);
  }

  return {
    userId,
    userEmail: profile.business_email,
    userRole: 'client_admin',
    organisationId: orgId,
    profile,
  };
}
