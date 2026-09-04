import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getAssembledPassport, updatePassportAssembly } from '@/lib/passport/assembly';
import { listPassportAccessLogs } from '@/lib/workspace/db';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const assembly = await getAssembledPassport(organization.id);
    const logs = assembly.passport ? await listPassportAccessLogs(assembly.passport.id) : [];

    return NextResponse.json({
      passport: assembly.passport,
      assembly,
      logs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch passport assembly';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await req.json();

    const updated = await updatePassportAssembly(organization.id, {
      slug: body.slug,
      headline: body.headline,
      summary_override: body.summary_override,
      is_password_protected: body.is_password_protected,
      password: body.password,
      included_capability_ids: body.included_capability_ids,
      included_project_ids: body.included_project_ids,
      included_case_study_ids: body.included_case_study_ids,
      included_reference_ids: body.included_reference_ids,
      included_credential_ids: body.included_credential_ids,
      included_evidence_ids: body.included_evidence_ids,
      included_document_ids: body.included_document_ids,
      show_identity: body.show_identity,
      show_capabilities: body.show_capabilities,
      show_experience: body.show_experience,
      show_case_studies: body.show_case_studies,
      show_references: body.show_references,
      show_compliance: body.show_compliance,
      show_evidence: body.show_evidence,
    });

    const assembly = await getAssembledPassport(organization.id);

    return NextResponse.json({
      passport: updated,
      assembly,
      success: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save passport assembly';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
