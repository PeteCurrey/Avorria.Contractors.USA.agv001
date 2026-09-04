import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import {
  createAsset,
  listAssets,
} from '@/lib/assets/db';
import { CreateAssetInputSchema, AssetType, AssetStatus } from '@/lib/assets/types';
import { z } from 'zod';

/** GET /api/assets — list assets for the authenticated org */
export async function GET(request: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AssetStatus | null;
    const asset_type = searchParams.get('asset_type') as AssetType | null;

    const assets = await listAssets(organization.id, {
      ...(status ? { status } : {}),
      ...(asset_type ? { asset_type } : {}),
    });

    return NextResponse.json({ assets });
  } catch (err) {
    console.error('[GET /api/assets]', err);
    return NextResponse.json({ error: 'Failed to list assets' }, { status: 500 });
  }
}

/** POST /api/assets — create a new asset (3 required fields: name, asset_type, manufacturer) */
export async function POST(request: NextRequest) {
  try {
    const { organization, user } = await getWorkspaceContext();
    const body = await request.json();

    const parsed = CreateAssetInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const asset = await createAsset({
      id: crypto.randomUUID(),
      org_id: organization.id,
      ...parsed.data,
      status: 'active',
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/assets]', err);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}
