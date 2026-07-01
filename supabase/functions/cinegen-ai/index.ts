// cinegen-ai — Supabase Edge Function
// Server-side MuAPI submission for CineGen edit tools (gap-filler, clip-extender,
// music-generator). Holds MUAPI_API_KEY server-side (never shipped to client).
//
// S1 behavior: SUBMIT ONLY. Returns { requestId, status: "submitted" }.
// Long MuAPI video generation (up to ~30min) cannot block in an Edge Function.
// S2 adds job rows + Realtime + Storage so the client retrieves final output.
//
// CPU-only constraint: this function calls an external hosted API (MuAPI); it
// performs NO local GPU/CPU video compute.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { requireUser, jsonResponse, handleHandlerError } from "../_shared/auth.ts";

const MUAPI_BASE_URL = Deno.env.get("VITE_MUAPI_URL") ||
  Deno.env.get("MUAPI_API_URL") || "https://api.muapi.ai";
const MUAPI_API_KEY = Deno.env.get("MUAPI_API_KEY");

interface CinegenRequest {
  action: "gap-filler" | "clip-extender" | "music-generator";
  videoUrl?: string;
  options?: {
    model?: string;
    prompt?: string;
    duration?: number;
    direction?: string;
    moodAnalysis?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

function modelFor(action: string, override?: string): string {
  if (override) return override;
  const envKey =
    action === "music-generator"
      ? "CINEGEN_DEFAULT_AUDIO_MODEL"
      : "CINEGEN_DEFAULT_VIDEO_MODEL";
  const v = Deno.env.get(envKey);
  if (!v) {
    throw jsonResponse(503, {
      error: `${action} model not configured`,
      hint: `Set ${envKey} or pass options.model`,
    });
  }
  return v;
}

async function submitMuapi(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<{ requestId: string; status: string }> {
  const url = `${MUAPI_BASE_URL}/api/v1/${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MUAPI_API_KEY!,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw jsonResponse(502, {
      error: "MuAPI submission failed",
      status: response.status,
      detail: text.slice(0, 200),
    });
  }
  const data = await response.json();
  const requestId = data.request_id || data.id;
  if (!requestId) {
    throw jsonResponse(502, { error: "MuAPI returned no request id", data });
  }
  return { requestId: String(requestId), status: "submitted" };
}

async function handler(req: Request): Promise<Response> {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const user = await requireUser(req);
    const body: CinegenRequest = await req.json();
    const { action, videoUrl, options = {} } = body;

    if (!action) {
      return jsonResponse(400, { error: "action is required" });
    }
    if (!MUAPI_API_KEY) {
      return jsonResponse(503, { error: "MuAPI not configured (MUAPI_API_KEY missing)" });
    }

    let result: { requestId: string; status: string };

    if (action === "gap-filler" || action === "clip-extender") {
      if (!videoUrl) {
        return jsonResponse(400, { error: "videoUrl is required" });
      }
      const model = modelFor(action, options.model as string | undefined);
      const payload: Record<string, unknown> = {
        image_url: videoUrl,
        prompt: options.prompt || "seamless transition content maintaining visual continuity",
      };
      if (options.duration) payload.duration = options.duration;
      result = await submitMuapi(model, payload);
    } else if (action === "music-generator") {
      const model = modelFor(action, options.model as string | undefined);
      const prompt = options.prompt ||
        `cinematic music, ${options.moodAnalysis?.genre || "ambient"}, synced to video`;
      const payload: Record<string, unknown> = {
        prompt,
        duration: options.duration || (options.moodAnalysis?.duration as number) || 30,
      };
      result = await submitMuapi(model, payload);
    } else {
      return jsonResponse(400, {
        error: "Unknown action",
        supported: ["gap-filler", "clip-extender", "music-generator"],
      });
    }

    return jsonResponse(202, {
      ...result,
      action,
      userId: user.id,
      message: "Generation submitted to MuAPI",
    });
  } catch (error) {
    return await handleHandlerError(error);
  }
}

Deno.serve(handler);
