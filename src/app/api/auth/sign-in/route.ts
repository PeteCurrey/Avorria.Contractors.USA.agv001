import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getUser, saveUser } from '@/lib/workspace/db';
import { DEMO_ORG_ID } from '@/lib/workspace/context';

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const rawEmail = body?.email;
    const password = body?.password;

    if (!rawEmail || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const email = String(rawEmail).trim().toLowerCase();

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://feczarnbiptpxrrovkir.supabase.co';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlY3phcm5iaXB0cHhycm92a2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDk0NTQsImV4cCI6MjEwNDA4NTQ1NH0.XuVbQPCIJphqpZ_fOcrrubHcvOHp0MxkYrDzp9SeyUg';

    const response = NextResponse.json({ success: true, redirectTo: '/workspace' });

    // Create Supabase SSR client tied to request/response cookies using modern getAll/setAll
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: authError?.message || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const supaUser = authData.user;
    let userId = supaUser.id;
    let orgId = DEMO_ORG_ID;

    try {
      let workspaceUser = await getUser(supaUser.id);
      if (!workspaceUser) {
        workspaceUser = await saveUser({
          id: supaUser.id,
          org_id: DEMO_ORG_ID,
          role: 'owner',
          full_name: supaUser.user_metadata?.full_name || email.split('@')[0],
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      if (workspaceUser) {
        userId = workspaceUser.id;
        orgId = workspaceUser.org_id;
      }
    } catch (storeErr) {
      console.warn('Workspace store sync skipped:', storeErr);
    }

    // Set workspace tenant cookies on the response
    response.cookies.set('avorria_workspace_user', userId, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set('avorria_workspace_org', orgId, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    if (authData.session?.access_token) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: authData.session.expires_in || 3600,
      });
    }

    return response;
  } catch (err: any) {
    console.error('Sign-in API error:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
