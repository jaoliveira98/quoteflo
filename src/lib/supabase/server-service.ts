import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service role key. Does not use cookies.
 * Use only in non-dynamic contexts (e.g. inside unstable_cache) where the
 * cookie-based server client cannot be used. RLS is bypassed: callers must
 * scope every query by user_id (or tenant id). Only pass the authenticated
 * user's id (e.g. profile.id from requireAuthWithProfile()), never from URL/body.
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
