import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listSpareParts, saveSparePart } from '@/lib/assets/db';
import { CreateSparePartInputSchema, SparePart } from '@/lib/assets/types';

/** GET /api/assets/spare-parts — list all spare parts for the org */
export async function GET(request: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const parts = await listSpareParts(organization.id);
    return NextResponse.json({ parts });
  } catch (err) {
    console.error('[GET /api/assets/spare-parts]', err);
    return NextResponse.json({ error: 'Failed to list parts' }, { status: 500 });
  }
}

/** POST /api/assets/spare-parts — create a spare part */
export async function POST(request: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await request.json();

    const parsed = CreateSparePartInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const part: SparePart = {
      id: crypto.randomUUID(),
      org_id: organization.id,
      ...parsed.data,
      created_at: now,
      updated_at: now,
    };

    await saveSparePart(part);
    return NextResponse.json({ part }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/assets/spare-parts]', err);
    return NextResponse.json({ error: 'Failed to create part' }, { status: 500 });
  }
}
