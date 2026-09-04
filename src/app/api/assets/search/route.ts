import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { answerAssetQuery } from '@/lib/assets/search';
import { z } from 'zod';

const SearchSchema = z.object({
  query: z.string().min(1).max(500),
});

/**
 * POST /api/assets/search
 *
 * Embeds the query, runs pgvector similarity search scoped to the authenticated org,
 * and returns a Claude-generated answer with source document citations.
 *
 * If no chunks meet the similarity threshold, returns answered:false — Claude is NOT called.
 * Every answer includes the source documents it was drawn from.
 */
export async function POST(request: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const body = await request.json();

    const parsed = SearchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await answerAssetQuery(parsed.data.query, organization.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[POST /api/assets/search]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
