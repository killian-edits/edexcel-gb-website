/**
 * Supabase client for server-side usage (Server Components, Route Handlers, Server Actions).
 *
 * Uses the anon key by default. Service role key only for admin operations.
 * Returns null if Supabase is not configured.
 */

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getPublicEnv, getServerEnv, isSupabaseConfigured } from '@/lib/config/env';

/**
 * Server client with cookie handling for user-session-dependent requests.
 * Uses cookies() from next/headers. Do NOT use inside generateStaticParams or static contexts.
 */
export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll can be called from a Server Component where cookies
          // cannot be set. This is expected and can be safely ignored
          // if you have middleware refreshing sessions.
        }
      },
    },
  });
}

/**
 * Stateless Supabase client for public/static queries (e.g., generateStaticParams, public data reading).
 * Does NOT access cookies() or headers, allowing safe execution at build time or during prerendering.
 */
export function createStaticSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Admin client with service role — use only for trusted server operations.
 * Never expose to client code.
 */
export async function createAdminSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv();

  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Safe to ignore in Server Components
        }
      },
    },
  });
}
