/**
 * Environment variable validation.
 *
 * Validates required configuration at startup and provides
 * typed access to environment variables. Never exposes
 * service-role keys to client bundles.
 */

/** Public variables (safe for client bundles) */
export function getPublicEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  };
}

/** Server-only variables (never import on client) */
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv must only be called on the server');
  }

  return {
    ...getPublicEnv(),
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  };
}

/** Check if Supabase is configured */
export function isSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}

/**
 * Validate that all required environment variables are set.
 * Call this during build/startup to fail early with helpful messages.
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Supabase is optional — the app can run in a limited mode without it
  // but we warn if partially configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if ((url && !anonKey) || (!url && anonKey)) {
    errors.push(
      'Supabase is partially configured. Set both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or neither.',
    );
  }

  if (url && !url.startsWith('https://') && !url.startsWith('http://localhost')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL should be an https URL (or http://localhost for development).');
  }

  return { valid: errors.length === 0, errors };
}

