import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { runDigestSend } from '@/lib/workspace/notifications';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 'placeholder-resend-key') {
      return NextResponse.json({ success: true, sent: 0, failed: 0, note: 'No Resend key configured' });
    }
    const resend = new Resend(apiKey);
    const result = await runDigestSend(resend);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Digest send failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
