import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  saveOrganization,
  saveUser,
  savePassport,
} from '@/lib/workspace/db';
import { createCredential } from '@/lib/workspace/credentials';
import { calculateReadinessScore } from '@/lib/workspace/readiness';
import { Organization, WorkspaceUser, PrimaryTrade } from '@/lib/workspace/types';
import { Resend } from 'resend';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      legalName,
      entityType,
      ein,
      primaryTrade,
      statesOfOperation,
      // Step 2: Insurance
      insurance,
      // Step 3: Licensing
      licensing,
      // Step 4: Team invites
      teamInvites,
      // Owner user info
      userFullName,
      userEmail,
      userPhone,
    } = body;

    if (!companyName || !primaryTrade) {
      return NextResponse.json(
        { error: 'Company name and primary trade are required.' },
        { status: 400 }
      );
    }

    const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Create Organization
    const organization: Organization = {
      id: orgId,
      name: companyName,
      legal_name: legalName || companyName,
      entity_type: entityType || 'LLC',
      ein: ein || undefined,
      primary_trade: primaryTrade as PrimaryTrade,
      additional_trades: [],
      states_licensed: Array.isArray(statesOfOperation) ? statesOfOperation : ['TX'],
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveOrganization(organization);

    // 2. Create Owner User
    const ownerUser: WorkspaceUser = {
      id: userId,
      org_id: orgId,
      role: 'owner',
      full_name: userFullName || 'Company Owner',
      email: userEmail || undefined,
      phone: userPhone || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveUser(ownerUser);

    // 3. Create Initial Passport
    const baseSlug = slugify(companyName) || `contractor-${Math.random().toString(36).substring(2, 6)}`;
    const passportSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    await savePassport({
      id: `psp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      org_id: orgId,
      slug: passportSlug,
      is_password_protected: false,
      included_credential_ids: [],
      included_document_ids: [],
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 4. Save Optional Initial Credentials
    const addedCredentialIds: string[] = [];

    // General Liability
    if (insurance?.glCarrier || insurance?.glPolicyNumber || insurance?.glExpirationDate) {
      const gl = await createCredential({
        org_id: orgId,
        type: 'general_liability_coi',
        carrier_or_authority: insurance.glCarrier,
        policy_or_license_number: insurance.glPolicyNumber,
        coverage_amount: insurance.glCoverageAmount ? Number(insurance.glCoverageAmount) : 1000000,
        expiration_date: insurance.glExpirationDate,
      });
      addedCredentialIds.push(gl.id);
    }

    // Workers' Comp
    if (insurance?.wcCarrier || insurance?.wcPolicyNumber || insurance?.wcExpirationDate) {
      const wc = await createCredential({
        org_id: orgId,
        type: 'workers_comp',
        carrier_or_authority: insurance.wcCarrier,
        policy_or_license_number: insurance.wcPolicyNumber,
        coverage_amount: insurance.wcCoverageAmount ? Number(insurance.wcCoverageAmount) : 500000,
        expiration_date: insurance.wcExpirationDate,
      });
      addedCredentialIds.push(wc.id);
    }

    // Trade License
    if (licensing?.licenseNumber || licensing?.issuingBoard) {
      const lic = await createCredential({
        org_id: orgId,
        type: 'trade_license',
        carrier_or_authority: licensing.issuingBoard || 'State Licensing Board',
        policy_or_license_number: licensing.licenseNumber,
        state: licensing.state || 'TX',
        expiration_date: licensing.expirationDate,
      });
      addedCredentialIds.push(lic.id);
    }

    // 5. Send Team Invitations via Resend if provided
    if (Array.isArray(teamInvites) && teamInvites.length > 0) {
      const resendKey = process.env.RESEND_API_KEY;
      const resend = resendKey && resendKey !== 'placeholder-resend-key' ? new Resend(resendKey) : null;

      for (const invite of teamInvites) {
        if (!invite.email) continue;
        const invitedUser: WorkspaceUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          org_id: orgId,
          role: invite.role === 'field' ? 'field' : 'office_staff',
          full_name: invite.name || invite.email.split('@')[0],
          email: invite.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await saveUser(invitedUser);

        if (resend) {
          try {
            await resend.emails.send({
              from: 'Avorria Workspace <invites@avorria.com>',
              to: invite.email,
              subject: `You've been invited to join ${companyName} on Avorria`,
              text: `Hello,\n\nYou have been invited to join the ${companyName} workspace on Avorria as ${invitedUser.role}.\n\nSign in to get started:\nhttps://avorria.com/workspace\n\nAvorria Contractors USA`,
            });
          } catch (e) {
            console.error(`Failed to send invite email to ${invite.email}:`, e);
          }
        }
      }
    }

    // 6. Compute initial server-side readiness score
    await calculateReadinessScore(orgId);

    // 7. Set cookies for session persistence
    const cookieStore = await cookies();
    cookieStore.set('avorria_workspace_org', orgId, { path: '/', httpOnly: true, sameSite: 'lax' });
    cookieStore.set('avorria_workspace_user', userId, { path: '/', httpOnly: true, sameSite: 'lax' });

    return NextResponse.json({
      success: true,
      orgId,
      userId,
      passportSlug,
      redirectUrl: '/workspace',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Onboarding setup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
