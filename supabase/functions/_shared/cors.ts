// Shared CORS helper for Supabase Edge Functions.
// Allowed origins are configurable via ALLOWED_ORIGENS env (comma-separated).
// Falls back to a permissive default for local/dev; S4 (Render) tightens this.

const DEFAULT_ORIGINS = "*";

export function getAllowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGENS") || DEFAULT_ORIGINS;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowed = getAllowedOrigins();
  const allow = allowed.includes("*") || allowed.includes(origin)
    ? origin || (allowed.includes("*") ? "*" : allowed[0])
    : allowed[0] || "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Client-Info, Apikey, X-Callback-Secret",
    "Access-Control-Max-Age": "86400",
  };
}

// Handle OPTIONS preflight. Returns null if not a preflight (caller proceeds).
export function handleOptions(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}
