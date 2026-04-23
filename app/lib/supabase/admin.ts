import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service role key.
 * Bypassa RLS — usar SOMENTE em API routes server-side.
 * Nunca expor no cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
