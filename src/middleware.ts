import { NextResponse, type NextRequest } from 'next/server';
import { resolveRedirect } from '@/lib/redirects';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check Redirect Engine first (fast-path 301/308 redirects)
  const redirectMatch = resolveRedirect(pathname);
  if (redirectMatch && redirectMatch.shouldRedirect) {
    const redirectUrl = new URL(redirectMatch.targetUrl, request.url);
    return NextResponse.redirect(redirectUrl, redirectMatch.statusCode);
  }

  // 2. Security & Indexing Control for Authenticated Application Routes (/app/*)
  if (pathname.startsWith('/app')) {
    const response = NextResponse.next();
    
    // Strict crawler header directive
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');

    // Authentication Guard: In production with active Supabase session,
    // verify session cookie exists; if not, redirect to /sign-in
    const authCookie = request.cookies.get('sb-access-token') || request.cookies.get('sb-auth-token');
    
    // Note: In development or during initial setup without active Supabase credentials,
    // allow previewing the app shell layout.
    const isMockAuthEnabled = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!authCookie && !isMockAuthEnabled) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(signInUrl);
    }

    return response;
  }

  // 3. API Routes Security & Headers
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO manifests)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
