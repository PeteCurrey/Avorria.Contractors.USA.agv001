import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getUserByOrg, saveUser } from '@/lib/workspace/db';
import { WorkspaceUser, WorkspaceUserRole } from '@/lib/workspace/types';
import { Resend } from 'resend';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const members = await getUserByOrg(organization.id);
    return NextResponse.json({ members });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching team members';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization, user } = await getWorkspaceContext();
    if (user.role !== 'owner' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only owners or admins can invite team members' }, { status: 403 });
    }

    const body = await req.json();
    const { full_name, email, role, phone } = body;

    if (!full_name || !role) {
      return NextResponse.json({ error: 'Full name and role are required' }, { status: 400 });
    }

    const newMember: WorkspaceUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      org_id: organization.id,
      role: role as WorkspaceUserRole,
      full_name,
      email,
      phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveUser(newMember);

    // Send invite email via Resend if email is provided
    if (email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Avorria Workspace <invites@avorria.com>',
          to: email,
          subject: `You've been invited to ${organization.name} on Avorria`,
          text: `Hello ${full_name},\n\nYou have been invited to join ${organization.name} on Avorria Contractors USA as ${role}.\n\nLog in: https://avorria.com/workspace\n\nAvorria Contractors USA`,
        });
      } catch (e) {
        console.error('Failed to send invite email:', e);
      }
    }

    return NextResponse.json({ member: saved }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create team member';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
