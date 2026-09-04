import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { addRequirement, removeRequirement } from '@/lib/request/service';
import { getRequirementPackById } from '@/lib/request/repository';
import { evaluateRequestReadiness } from '@/lib/request/readiness';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const body = await req.json();

    const { category, title, description, strength, minimum_value, jurisdiction, evidence_required, provenance, requirement_type } = body;

    if (!category || !title) {
      return NextResponse.json(
        { error: 'Category and Title are required to define a requirement.' },
        { status: 400 }
      );
    }

    const requirement = await addRequirement(
      id,
      client.organisationId,
      client.userId,
      {
        category,
        requirement_type,
        title,
        description,
        strength,
        minimum_value,
        jurisdiction,
        evidence_required,
        provenance,
      }
    );

    const pack = await getRequirementPackById(id, client.organisationId);
    const readiness = pack ? evaluateRequestReadiness(pack) : undefined;

    return NextResponse.json({
      success: true,
      requirement,
      readiness,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to add requirement';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const { searchParams } = new URL(req.url);
    const requirementId = searchParams.get('requirementId');

    if (!requirementId) {
      return NextResponse.json(
        { error: 'Query parameter requirementId is required.' },
        { status: 400 }
      );
    }

    const removed = await removeRequirement(requirementId, id, client.organisationId, client.userId);

    const pack = await getRequirementPackById(id, client.organisationId);
    const readiness = pack ? evaluateRequestReadiness(pack) : undefined;

    return NextResponse.json({
      success: removed,
      readiness,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to remove requirement';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
