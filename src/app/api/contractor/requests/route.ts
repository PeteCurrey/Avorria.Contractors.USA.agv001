import { NextResponse } from 'next/server';
import { getContractorInbox } from '@/lib/respond/service';

// Hermetic contractor context — uses the default contractor org from the tenant store
const DEFAULT_CONTRACTOR_ORG_ID = 'org-default-workspace';

/**
 * GET /api/contractor/requests
 * Contractor's invitation inbox.
 */
export async function GET() {
  try {
    // In the hermetic environment the contractor ID comes from the session / cookie.
    // For the testing layer, we use the default workspace org ID.
    const contractorId = DEFAULT_CONTRACTOR_ORG_ID;
    const inbox = await getContractorInbox(contractorId);
    return NextResponse.json({ inbox });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve contractor inbox';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
