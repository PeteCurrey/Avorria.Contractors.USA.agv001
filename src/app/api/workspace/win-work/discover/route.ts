import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { listDiscoverOpportunities } from '@/lib/discover/repository';
import { DiscoverQueryInput, DiscoverSortOption } from '@/lib/discover/types';

/**
 * GET /api/workspace/win-work/discover
 *
 * Surfaces structured commercial opportunities for the authenticated contractor workspace.
 * Supports server-side search, filtering, deterministic sorting, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const { organization } = await getWorkspaceContext();
    const { searchParams } = new URL(request.url);

    const query: DiscoverQueryInput = {
      search: searchParams.get('search') || undefined,
      trade: searchParams.get('trade') || undefined,
      state: searchParams.get('state') || undefined,
      status: searchParams.get('status') || undefined,
      project_type: searchParams.get('project_type') || undefined,
      sector: searchParams.get('sector') || undefined,
      closing_filter: (searchParams.get('closing_filter') as DiscoverQueryInput['closing_filter']) || undefined,
      sort_by: (searchParams.get('sort_by') as DiscoverSortOption) || undefined,
      sort_direction: (searchParams.get('sort_direction') as 'asc' | 'desc') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    };

    const result = await listDiscoverOpportunities(organization.id, query);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to query opportunities';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
