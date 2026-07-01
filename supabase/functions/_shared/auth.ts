// Shared auth helper for Supabase Edge Functions.
// Verifies a user Bearer JWT against Supabase Auth and returns the user,
// or throws a 401 Response. The service-role client bypasses RLS, so callers
// must still scope DB writes by the returned user.id when user-scoping matters.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthResult {
  user: { id: string; email?: string } | null;
}

export function jsonResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

// Returns the authenticated user or throws a 401 Response.
export async function requireUser(
  req: Request,
): Promise<{ id: string; email?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey) {
    throw jsonResponse(500, { error: "Server not configured" });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw jsonResponse(401, { error: "Unauthorized" });
  }
  const token = authHeader.substring(7);

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw jsonResponse(401, { error: "Invalid token" });
  }
  return { id: data.user.id as string, email: data.user.email as string | undefined };
}

// Helper to catch thrown Response objects (auth helpers) or other errors
// and return a uniform JSON response.
export async function handleHandlerError(
  error: unknown,
  fallbackStatus = 500,
): Promise<Response> {
  if (error instanceof Response) return error;
  const message = error instanceof Error ? error.message : "Internal server error";
  console.error("[edge] handler error:", message);
  return jsonResponse(fallbackStatus, { error: message });
}
