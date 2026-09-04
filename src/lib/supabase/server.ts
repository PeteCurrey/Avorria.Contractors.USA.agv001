import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_FALLBACK_URL = 'https://feczarnbiptpxrrovkir.supabase.co';
const SUPABASE_FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlY3phcm5iaXB0cHhycm92a2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDk0NTQsImV4cCI6MjEwNDA4NTQ1NH0.XuVbQPCIJphqpZ_fOcrrubHcvOHp0MxkYrDzp9SeyUg';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_FALLBACK_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_FALLBACK_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if middleware is refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Service role client for server-only trusted operations (e.g. background webhooks, migrations)
 * NEVER expose this to client components or public API responses!
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not configured.');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    serviceRoleKey,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}
