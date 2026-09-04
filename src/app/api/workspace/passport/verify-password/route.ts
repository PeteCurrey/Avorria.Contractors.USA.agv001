import { NextRequest, NextResponse } from 'next/server';
import { verifyPassportPassword } from '@/lib/workspace/passport';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, password } = body;

    if (!slug || !password) {
      return NextResponse.json({ error: 'Slug and password are required' }, { status: 400 });
    }

    const isValid = await verifyPassportPassword(slug, password);

    if (!isValid) {
      return NextResponse.json({ valid: false, error: 'Incorrect password' }, { status: 401 });
    }

    const res = NextResponse.json({ valid: true });
    // Set unlocked cookie for this slug for 24h
    res.cookies.set(`avorria_pass_${slug}`, 'unlocked', {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
