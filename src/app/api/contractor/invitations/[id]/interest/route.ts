import { NextRequest, NextResponse } from 'next/server';
import { expressContractorInterest } from '@/lib/respond/service';

const DEFAULT_CONTRACTOR_ORG_ID = 'org-default-workspace';

/**
 * POST /api/contractor/invitations/[id]/interest
 * Contractor expresses interest in responding.
 * Initialises a draft response record if one does not exist.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contractorId = DEFAULT_CONTRACTOR_ORG_ID;
    const { id: invitation_id } = await params;
    const result = await expressContractorInterest(invitation_id, contractorId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to express interest';
    const status = msg.includes('Access denied') ? 403 : msg.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
