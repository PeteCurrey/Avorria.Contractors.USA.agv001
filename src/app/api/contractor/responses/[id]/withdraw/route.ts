import { NextRequest, NextResponse } from 'next/server';
import { withdrawContractorResponse } from '@/lib/respond/service';

const DEFAULT_CONTRACTOR_ORG_ID = 'org-default-workspace';

/**
 * POST /api/contractor/responses/[id]/withdraw
 * Contractor withdraws their submitted response.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contractorId = DEFAULT_CONTRACTOR_ORG_ID;
    const { id: response_id } = await params;
    const updated = await withdrawContractorResponse(response_id, contractorId);
    return NextResponse.json({ response: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to withdraw response';
    const status = msg.includes('Access denied') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
