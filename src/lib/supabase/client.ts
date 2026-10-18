/**
 * Supabase client for browser/client components.
 *
 * Uses the anon key (safe for client bundles).
 * Returns null if Supabase is not configured.
 */

import { createBrowserClient } from '@supabase/ssr';
import { getPublicEnv, isSupabaseConfigured } from '@/lib/config/env';

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

