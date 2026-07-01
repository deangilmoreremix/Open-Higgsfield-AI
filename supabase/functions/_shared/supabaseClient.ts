// Service-role Supabase client for Edge Functions (server-side only).
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("Supabase service-role credentials not configured");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
