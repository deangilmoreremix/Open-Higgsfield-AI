// render-callback — Supabase Edge Function
// Receives completion callbacks from the external render worker (S4 Render.com
// FFmpeg service) and durably updates render_jobs. Auth is a shared secret
// (RENDER_CALLBACK_SECRET), NOT a user JWT, since the worker (not a browser)
// calls this endpoint.
//
// Idempotent: a callback for a job that already reached a terminal state
// ('completed' or 'failed') is ignored (WHERE status NOT IN terminal states).
//
// S1 ships the function + unit tests (mocked supabase). Live end-to-end
// (worker -> callback -> completed row) is verified in S4.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { jsonResponse, handleHandlerError } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/supabaseClient.ts";

const CALLBACK_SECRET = Deno.env.get("RENDER_CALLBACK_SECRET");

interface CallbackRequest {
  jobId?: string;
  status?: string;
  progress?: number;
  outputUrl?: string;
  error?: string;
}

const TERMINAL_STATES = new Set(["completed", "failed"]);

async function handler(req: Request): Promise<Response> {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    // Verify shared secret (worker auth, not user JWT)
    if (!CALLBACK_SECRET) {
      return jsonResponse(503, { error: "render-callback not configured (RENDER_CALLBACK_SECRET missing)" });
    }
    const secret = req.headers.get("X-Callback-Secret");
    if (!secret || secret !== CALLBACK_SECRET) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    const body: CallbackRequest = await req.json();
    const { jobId, status, progress, outputUrl, error } = body;

    if (!jobId) {
      return jsonResponse(400, { error: "jobId is required" });
    }
    if (!status) {
      return jsonResponse(400, { error: "status is required" });
    }

    const supabase = serviceClient();

    // Idempotent update: never reopen a terminal job; ignore stale callbacks.
    const updates: Record<string, unknown> = { status };
    if (typeof progress === "number") {
      updates.progress = Math.max(0, Math.min(100, Math.round(progress)));
    }
    if (outputUrl) updates.output_url = outputUrl;
    if (error) updates.error_message = error;
    if (status === "completed") updates.completed_at = new Date().toISOString();
    if (status === "failed" && !error) updates.error_message = "Render failed (no detail provided)";

    const { data, error: dbError } = await supabase
      .from("render_jobs")
      .update(updates)
      .eq("id", jobId)
      .not("status", "in", '("completed","failed")')
      .select("id, status, progress, output_url")
      .maybeSingle();

    if (dbError) {
      console.error("[render-callback] db error:", dbError.message);
      return jsonResponse(500, { error: "Failed to update job", detail: dbError.message });
    }

    if (!data) {
      // Job already terminal or not found — still 200 so worker doesn't retry forever.
      return jsonResponse(200, { ok: true, ignored: true, reason: "job already terminal or not found" });
    }

    return jsonResponse(200, { ok: true, job: data });
  } catch (error) {
    return await handleHandlerError(error);
  }
}

Deno.serve(handler);
