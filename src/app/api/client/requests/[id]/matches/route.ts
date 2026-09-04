import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getRequirementPackById } from '@/lib/request/repository';
import { getOrComputeMatchSet } from '@/lib/match/service';
import { MatchFilterOptions, MatchSortOption, OverallMatchStatus } from '@/lib/match/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await getClientContext();
    const pack = await getRequirementPackById(id, client.organisationId);

    if (!pack) {
      return NextResponse.json(
        { error: 'Requirement pack not found or unauthorized' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const verificationOnly = searchParams.get('verificationOnly') === 'true';
    const tradeSlug = searchParams.get('trade') || undefined;
    const territoryExactOnly = searchParams.get('territoryExactOnly') === 'true';
    const overallStatus = (searchParams.get('status') as OverallMatchStatus) || undefined;
    const evidenceVerifiedOnly = searchParams.get('evidenceVerifiedOnly') === 'true';
    const allRequiredAlignedOnly = searchParams.get('allRequiredAlignedOnly') === 'true';
    const sort = (searchParams.get('sort') as MatchSortOption) || 'verified_first';

    const filters: MatchFilterOptions = {
      verificationOnly: verificationOnly || undefined,
      tradeSlug,
      territoryExactOnly: territoryExactOnly || undefined,
      overallStatus,
      evidenceVerifiedOnly: evidenceVerifiedOnly || undefined,
      allRequiredAlignedOnly: allRequiredAlignedOnly || undefined,
    };

    const matchSet = await getOrComputeMatchSet(
      id,
      client.organisationId,
      client.userId,
      filters,
      sort
    );

    return NextResponse.json({
      packId: pack.id,
      packReference: pack.reference,
      engineVersion: matchSet.engine_version,
      isStale: matchSet.is_stale,
      staleReason: matchSet.stale_reason,
      totalContractorsEvaluated: matchSet.total_contractors_evaluated,
      eligibleContractorsCount: matchSet.eligible_contractors_count,
      verifiedContractorsCount: matchSet.verified_contractors_count,
      candidates: matchSet.candidates,
      matchSet,
      generatedAt: matchSet.generated_at,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve match intelligence';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
