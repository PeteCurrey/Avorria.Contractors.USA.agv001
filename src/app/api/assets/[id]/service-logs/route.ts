import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { getAsset, createServiceLog, listServiceLogs } from '@/lib/assets/db';
import { indexServiceLogText } from '@/lib/assets/extraction';
import { CreateServiceLogInputSchema, ServiceLog } from '@/lib/assets/types';

/** GET /api/assets/[id]/service-logs — list service history for an asset */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await params;

    const asset = await getAsset(id);
    if (!asset || asset.org_id !== organization.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const logs = await listServiceLogs(organization.id, id);
    return NextResponse.json({ logs });
  } catch (err) {
    console.error('[GET /api/assets/[id]/service-logs]', err);
    return NextResponse.json({ error: 'Failed to list service logs' }, { status: 500 });
  }
}

/**
 * POST /api/assets/[id]/service-logs — add a service log entry.
 * Also triggers background indexing of work_performed text into document_chunks
 * so search queries like "when was Generator Unit 3 last serviced" return an answer.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await params;

    const asset = await getAsset(id);
    if (!asset || asset.org_id !== organization.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = CreateServiceLogInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const log: ServiceLog = {
      id: crypto.randomUUID(),
      org_id: organization.id,
      asset_id: id,
      ...parsed.data,
      created_at: now,
      updated_at: now,
    };

    await createServiceLog(log);

    // Index work_performed text for search — fire-and-forget
    indexServiceLogText(log.id, organization.id, log.work_performed, asset.name).catch(
      (err) => console.error('[service-log] indexing error:', err)
    );

    return NextResponse.json({ log }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/assets/[id]/service-logs]', err);
    return NextResponse.json({ error: 'Failed to create service log' }, { status: 500 });
  }
}
