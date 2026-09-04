import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPacksByTenant } from '@/lib/request/repository';
import { createRequirementPack } from '@/lib/request/service';
import { evaluateRequestReadiness } from '@/lib/request/readiness';

export async function GET() {
  try {
    const client = await getClientContext();
    const packs = await getRequirementPacksByTenant(client.organisationId);

    // Attach readiness summary to each pack for the client workspace list view
    const packsWithReadiness = packs.map((p) => ({
      ...p,
      readiness: evaluateRequestReadiness(p),
    }));

    return NextResponse.json({ packs: packsWithReadiness });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve project requests';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await getClientContext();
    const body = await req.json();
    const {
      title,
      project_type,
      description,
      scope,
      state,
      city,
      site_address,
      site_access_notes,
      target_start_date,
      target_completion_date,
      urgency,
      flexibility,
      value_tier,
      trades,
      requirements,
    } = body;

    if (!title || !city || !state) {
      return NextResponse.json(
        { error: 'Missing essential project fields: Title, City, and State are required.' },
        { status: 400 }
      );
    }

    const pack = await createRequirementPack(
      client.organisationId,
      client.userId,
      {
        title,
        project_type,
        description,
        scope,
        state,
        city,
        site_address,
        site_access_notes,
        target_start_date,
        target_completion_date,
        urgency,
        flexibility,
        value_tier,
      },
      trades,
      requirements
    );

    const readiness = evaluateRequestReadiness(pack);

    return NextResponse.json({
      success: true,
      pack,
      readiness,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create project request';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
