import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getCommercialProfile, saveCommercialProfile } from '@/lib/create/evidence-store';
import { CommercialProfile } from '@/lib/create/evidence-types';

export async function GET() {
  try {
    const { organization } = await getWorkspaceContext();
    const profile = await getCommercialProfile(organization.id);
    return NextResponse.json({ profile });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve commercial profile';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await req.json();

    const existing = await getCommercialProfile(organization.id);

    const updatedProfile: CommercialProfile = {
      id: existing?.id || `prof_${organization.id}`,
      org_id: organization.id,
      company_overview: body.company_overview || existing?.company_overview || '',
      core_services: Array.isArray(body.core_services) ? body.core_services : existing?.core_services || [],
      sectors_served: Array.isArray(body.sectors_served) ? body.sectors_served : existing?.sectors_served || [],
      typical_project_size_min: Number(body.typical_project_size_min) || existing?.typical_project_size_min || 100000,
      typical_project_size_max: Number(body.typical_project_size_max) || existing?.typical_project_size_max || 2500000,
      typical_project_size_sweet_spot: body.typical_project_size_sweet_spot || existing?.typical_project_size_sweet_spot || '$250k - $1M',
      geographic_coverage_states: Array.isArray(body.geographic_coverage_states) ? body.geographic_coverage_states : existing?.geographic_coverage_states || ['TX'],
      geographic_coverage_metros: Array.isArray(body.geographic_coverage_metros) ? body.geographic_coverage_metros : existing?.geographic_coverage_metros || [],
      differentiators: Array.isArray(body.differentiators) ? body.differentiators : existing?.differentiators || [],
      delivery_approach: body.delivery_approach || existing?.delivery_approach || '',
      safety_commitments: body.safety_commitments || existing?.safety_commitments || '',
      accreditations_memberships: Array.isArray(body.accreditations_memberships) ? body.accreditations_memberships : existing?.accreditations_memberships || [],
      bonding_capacity_single: body.bonding_capacity_single !== undefined ? Number(body.bonding_capacity_single) : existing?.bonding_capacity_single,
      bonding_capacity_aggregate: body.bonding_capacity_aggregate !== undefined ? Number(body.bonding_capacity_aggregate) : existing?.bonding_capacity_aggregate,
      emr_rating: body.emr_rating !== undefined ? Number(body.emr_rating) : existing?.emr_rating,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveCommercialProfile(updatedProfile);
    return NextResponse.json({ profile: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save commercial profile';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
