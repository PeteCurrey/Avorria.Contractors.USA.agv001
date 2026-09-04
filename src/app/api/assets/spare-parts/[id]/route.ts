import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import {
  getSparePart,
  updateSparePartQuantity,
  saveSparePart,
  checkReorderThresholds,
} from '@/lib/assets/db';
import { z } from 'zod';

const UpdateSchema = z.object({
  quantity_on_hand: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  unit_cost: z.number().nonnegative().optional(),
  reorder_threshold: z.number().int().nonnegative().optional(),
  compatible_asset_ids: z.array(z.string()).optional(),
});

/**
 * PATCH /api/assets/spare-parts/[id]
 * Update spare part fields. On quantity_on_hand change, runs reorder threshold check
 * and fires notifications for any part at or below threshold.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await getWorkspaceContext();
    const { id } = await params;

    const part = await getSparePart(id, organization.id);
    if (!part) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Update quantity if provided
    let updatedPart = part;
    if (parsed.data.quantity_on_hand !== undefined) {
      const result = await updateSparePartQuantity(id, organization.id, parsed.data.quantity_on_hand);
      if (result) updatedPart = result;
    }

    // Update other fields
    const otherUpdates = { ...parsed.data };
    delete otherUpdates.quantity_on_hand;
    if (Object.keys(otherUpdates).length > 0) {
      await saveSparePart({
        ...updatedPart,
        ...otherUpdates,
        updated_at: new Date().toISOString(),
      });
    }

    // Run reorder check — fires notification if at/below threshold
    const firedNotifications = await checkReorderThresholds(organization.id);

    return NextResponse.json({
      part: updatedPart,
      reorderAlerts: firedNotifications.length,
    });
  } catch (err) {
    console.error('[PATCH /api/assets/spare-parts/[id]]', err);
    return NextResponse.json({ error: 'Failed to update part' }, { status: 500 });
  }
}
