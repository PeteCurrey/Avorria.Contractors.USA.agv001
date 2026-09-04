import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '@/lib/connect/context';
import { getClientOpportunities } from '@/lib/connect/repository';
import { createClientOpportunity } from '@/lib/connect/service';
import { findMatchingContractorsForOpportunity } from '@/lib/connect/matching';

export async function GET() {
  try {
    const client = await getClientContext();
    const opportunities = await getClientOpportunities(client.organisationId);
    return NextResponse.json({ opportunities });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve opportunities';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await getClientContext();
    const body = await req.json();
    const { title, trade, location, timeframe, scope, requirements, status, target_date } = body;

    if (!title || !trade || !location?.city || !location?.state || !scope) {
      return NextResponse.json(
        { error: 'Missing required opportunity fields (Title, Trade, Location, Scope).' },
        { status: 400 }
      );
    }

    const opportunity = await createClientOpportunity(client.organisationId, client.userId, {
      title: title.trim(),
      trade,
      location,
      timeframe: timeframe || 'flexible',
      target_date,
      scope: scope.trim(),
      requirements: requirements || {},
      status: status || 'open',
    });

    // Run deterministic matching signals to return instant context
    const matchingResult = await findMatchingContractorsForOpportunity({
      trade,
      state: location.state,
      city: location.city,
      requirements,
    });

    return NextResponse.json({
      success: true,
      opportunity,
      matching: matchingResult,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create opportunity';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
