// video-analysis — Supabase Edge Function
// Real VideoDB-backed scene analysis for RenderPage's Scene Analyzer, Pacing
// Optimizer, and Scene Detection AI. Replaces the hardcoded analysis objects
// that previously returned the same data for every video.
//
// Holds VIDEO_DB_API_KEY server-side (never shipped to client). RenderPage calls
// this function with a user JWT; it never calls VideoDB directly.
//
// Flow: upload videoUrl to VideoDB -> index -> bounded poll for scenes ->
// derive real, per-video output. Output differs for different input videos
// because it is computed from the actual detected scenes.
//
// If indexing is still in progress when the poll budget is exhausted, returns
// { status: 'indexing', videoId } so the client can retry honestly (no fake
// data).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleOptions, corsHeaders } from "../_shared/cors.ts";
import { requireUser, jsonResponse, handleHandlerError } from "../_shared/auth.ts";

const VIDEO_DB_BASE_URL =
  Deno.env.get("VIDEO_DB_BASE_URL") || "https://api.videodb.io";
const VIDEO_DB_API_KEY = Deno.env.get("VIDEO_DB_API_KEY");
const VIDEO_DB_COLLECTION_ID =
  Deno.env.get("VIDEO_DB_COLLECTION_ID") || "default";

const INDEX_POLL_INTERVAL_MS = Number(Deno.env.get("INDEX_POLL_INTERVAL_MS") || 5000);
const INDEX_POLL_MAX_ATTEMPTS = Number(Deno.env.get("INDEX_POLL_MAX_ATTEMPTS") || 18); // ~90s budget

interface Scene {
  start: number;
  end: number;
  [key: string]: unknown;
}

async function vdb(path: string, init?: RequestInit): Promise<any> {
  if (!VIDEO_DB_API_KEY) {
    throw jsonResponse(503, { error: "VideoDB not configured (VIDEO_DB_API_KEY missing)" });
  }
  const res = await fetch(`${VIDEO_DB_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-access-token": VIDEO_DB_API_KEY,
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!res.ok) {
    const detail = body?.message || body?.error || body?.detail || text.slice(0, 200);
    throw jsonResponse(502, {
      error: "VideoDB request failed",
      status: res.status,
      detail,
    });
  }
  return body;
}

// Normalize VideoDB scene response (GET /video/{id}/scenes/) into a flat Scene[].
function normalizeScenes(body: any): Scene[] {
  if (!body) return [];
  const arr = body.data || body.scenes || (Array.isArray(body) ? body : []);
  if (!Array.isArray(arr)) return [];
  return arr
    .map((s: any) => ({
      start: Number(s.start_time ?? s.start ?? s.startTime ?? 0),
      end: Number(s.end_time ?? s.end ?? s.endTime ?? (s.start_time ?? 0)),
      confidence: typeof s.confidence === "number" ? s.confidence : undefined,
      description: s.description || s.text || undefined,
    }))
    .filter((s: Scene) => Number.isFinite(s.start) && Number.isFinite(s.end))
    .sort((a: Scene, b: Scene) => a.start - b.start);
}

async function ensureIndexedAndScenes(videoUrl: string): Promise<{ scenes: Scene[]; videoId: string; indexing: boolean }> {
  // 1. Upload by URL to the configured collection.
  const uploadPath = `/collection/${encodeURIComponent(VIDEO_DB_COLLECTION_ID)}/upload`;
  const uploaded = await vdb(uploadPath, {
    method: "POST",
    body: JSON.stringify({ url: videoUrl, media_type: "video" }),
  });

  const videoId =
    uploaded?.data?.id ||
    uploaded?.data?.video_id ||
    uploaded?.id ||
    uploaded?.video_id;

  if (!videoId) {
    const raw = JSON.stringify(uploaded);
    throw jsonResponse(502, {
      error: "VideoDB upload returned no video id",
      detail: raw.slice(0, 400),
    });
  }

  // 2. Trigger scene extraction (shot-based, server-side async).
  try {
    const extracted = await vdb(`/video/${encodeURIComponent(videoId)}/scenes/`, {
      method: "POST",
      body: JSON.stringify({ scene_type: "shot" }),
    });
    if (extracted?.status === "processing") {
      const jobId = extracted.data?.id || extracted.data?.output_url || videoId;
      const scenes = await pollScenes(videoId, jobId);
      return { scenes, videoId, indexing: false };
    }
  } catch {
    // Upstream may already have scenes; fall through to poll.
  }

  // 3. Bounded poll for scenes.
  const scenes = await pollScenes(videoId, videoId);
  return { scenes, videoId, indexing: false };
}

async function pollScenes(videoId: string, jobId: string): Promise<Scene[]> {
  for (let attempt = 0; attempt < INDEX_POLL_MAX_ATTEMPTS; attempt++) {
    const body = await vdb(`/video/${encodeURIComponent(videoId)}/scenes/`);
    const scenes = normalizeScenes(body);
    if (scenes.length > 0) {
      return scenes;
    }
    await new Promise((r) => setTimeout(r, INDEX_POLL_INTERVAL_MS));
  }

  return [];
}

function derivePacing(scenes: Scene[], totalDuration: number) {
  if (scenes.length === 0) {
    return {
      currentPacing: { averageClipLength: 0, cutsPerMinute: 0, attentionCurve: [] },
      recommendations: [],
      optimizedTimeline: { totalDuration, suggestedCuts: [], rhythmScore: 0 },
    };
  }
  const lengths = scenes.map((s) => Math.max(0, s.end - s.start));
  const averageClipLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const span = totalDuration > 0 ? totalDuration : scenes[scenes.length - 1].end;
  const cutsPerMinute = span > 0 ? (scenes.length / (span / 60)) : 0;
  const maxLen = Math.max(...lengths, 1);
  const attentionCurve = lengths.map((l) => Number((l / maxLen).toFixed(2)));

  const recommendations: { timestamp: number; action: string; reason: string }[] = [];
  scenes.forEach((s, i) => {
    const len = s.end - s.start;
    if (len > averageClipLength * 1.6) {
      recommendations.push({ timestamp: Math.round(s.start), action: "shorten", reason: "scene runs long relative to average" });
    } else if (len < averageClipLength * 0.4 && len > 0) {
      recommendations.push({ timestamp: Math.round(s.start), action: "extend or merge", reason: "very short scene" });
    }
    if (i > 0) {
      const gap = s.start - scenes[i - 1].end;
      if (gap > 1) recommendations.push({ timestamp: Math.round(scenes[i - 1].end), action: "add transition", reason: "gap between scenes" });
    }
  });

  const suggestedCuts = scenes.map((s) => Math.round(s.start));
  // Rhythm heuristic: more even scene lengths => higher score.
  const variance = lengths.reduce((a, l) => a + Math.pow(l - averageClipLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const rhythmScore = averageClipLength > 0 ? Number(Math.max(0, Math.min(10, 10 - (stdDev / averageClipLength) * 5)).toFixed(1)) : 0;

  return {
    currentPacing: {
      averageClipLength: Number(averageClipLength.toFixed(2)),
      cutsPerMinute: Number(cutsPerMinute.toFixed(2)),
      attentionCurve,
    },
    recommendations,
    optimizedTimeline: { totalDuration: span, suggestedCuts, rhythmScore },
  };
}

function deriveSceneAnalysis(scenes: Scene[], totalDuration: number) {
  const analyzedScenes = scenes.map((s) => {
    const len = s.end - s.start;
    const pacing = len > 8 ? "slow" : len < 3 ? "fast" : "medium";
    const suggestions: string[] = [];
    if (len > averageOf(scenes)) suggestions.push("Consider trimming for tighter pacing");
    if (pacing === "slow") suggestions.push("Add B-roll or tighten cuts");
    if (pacing === "fast") suggestions.push("Let the moment breathe");
    return {
      start: s.start,
      end: s.end,
      description: s.description || `Scene ${Math.round(s.start)}s–${Math.round(s.end)}s`,
      pacing,
      suggestions,
    };
  });
  const recommendations: string[] = [];
  if (scenes.length > 0) {
    const longest = scenes.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
    recommendations.push(`Longest scene at ${Math.round(longest.start)}s (${Math.round(longest.end - longest.start)}s) — consider splitting`);
    recommendations.push(`${scenes.length} scenes detected across ${Math.round(totalDuration || scenes[scenes.length - 1].end)}s`);
    recommendations.push(`Average scene length ${averageOf(scenes).toFixed(1)}s`);
  }
  return {
    scenes: analyzedScenes,
    recommendations,
    narrative: { structure: scenes.length > 4 ? "multi-act" : "simple", sceneCount: scenes.length },
  };
}

function averageOf(scenes: Scene[]): number {
  if (scenes.length === 0) return 0;
  return scenes.reduce((a, s) => a + (s.end - s.start), 0) / scenes.length;
}

async function handler(req: Request): Promise<Response> {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const user = await requireUser(req);
    const body = await req.json();
    const { action, videoUrl } = body as { action: string; videoUrl?: string };

    if (!action) return jsonResponse(400, { error: "action is required" });
    if (!videoUrl) return jsonResponse(400, { error: "videoUrl is required" });
    if (!VIDEO_DB_API_KEY) return jsonResponse(503, { error: "VideoDB not configured (VIDEO_DB_API_KEY missing)" });

    const supported = ["scene-analyzer", "pacing-optimizer", "scene-detection"];
    if (!supported.includes(action)) {
      return jsonResponse(400, { error: "Unknown action", supported });
    }

    const { scenes, videoId } = await ensureIndexedAndScenes(videoUrl);

    if (scenes.length === 0) {
      return jsonResponse(202, {
        status: "indexing",
        videoId,
        message: "Video scenes are not ready yet. Retry in a few seconds.",
      });
    }

    const totalDuration = scenes.length ? scenes[scenes.length - 1].end : 0;

    if (action === "scene-detection") {
      return jsonResponse(200, {
        status: "completed",
        videoId,
        scenes: scenes.map((s) => ({
          start: s.start,
          end: s.end,
          confidence: s.confidence,
        })),
        count: scenes.length,
      });
    }

    if (action === "scene-analyzer") {
      const analysis = deriveSceneAnalysis(scenes, totalDuration);
      return jsonResponse(200, {
        status: "completed",
        videoId,
        analysis,
        type: "scene-analysis",
        message: `Analyzed ${analysis.scenes.length} scenes with ${analysis.recommendations.length} editing suggestions`,
      });
    }

    // pacing-optimizer
    const pacing = derivePacing(scenes, totalDuration);
    return jsonResponse(200, {
      status: "completed",
      videoId,
      pacingAnalysis: pacing,
      type: "pacing-optimization",
      message: `Optimized pacing with ${pacing.recommendations.length} timing adjustments (rhythm score: ${pacing.optimizedTimeline.rhythmScore}/10)`,
    });
  } catch (error) {
    return await handleHandlerError(error);
  }
}

Deno.serve(handler);
