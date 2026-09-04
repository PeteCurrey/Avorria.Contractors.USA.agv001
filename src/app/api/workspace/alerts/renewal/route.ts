import { NextResponse } from 'next/server';
import { runRenewalAlertCheck } from '@/lib/workspace/notifications';

export async function POST() {
  try {
    const result = await runRenewalAlertCheck();
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Renewal alert run failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
