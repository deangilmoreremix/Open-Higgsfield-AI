// Deno unit tests for video-analysis Edge Function.
// Run: deno test --no-check --allow-env --allow-read --allow-net supabase/functions/video-analysis/index.test.ts
//
// Mocks global fetch with a URL router: GoTrue auth + VideoDB endpoints.
// Proves output is derived from real VideoDB scene data (different scenes ->
// different output), not hardcoded.

import { describe, it, beforeEach, afterEach, afterAll } from "jsr:@std/testing@1/bdd";
import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1";

let capturedHandler: ((req: Request) => Promise<Response>) | null = null;
const realServe = (globalThis.Deno as any).serve;
const realEnv = (globalThis.Deno as any).env;
(globalThis.Deno as any).serve = (h: any) => { capturedHandler = h; return {} as any; };

// Env MUST be stubbed before import: the module reads VIDEO_DB_API_KEY and the
// poll budget into consts at load time.
const envMap: Record<string, string> = {
  VIDEO_DB_API_KEY: "test-vdb-key",
  VIDEO_DB_BASE_URL: "https://api.videodb.io",
  VIDEO_DB_COLLECTION_ID: "default",
  SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_ANON_KEY: "anon",
  INDEX_POLL_MAX_ATTEMPTS: "2",
  INDEX_POLL_INTERVAL_MS: "0",
};
(globalThis.Deno as any).env = { get: (k: string) => envMap[k] };

let realFetch: typeof fetch;
let scenesResponse: any = { scenes: [] };
let uploadResponse: any = { video_id: "vid-1" };
let authOk = true;

function jsonOk(body: any) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    text: () => Promise.resolve(JSON.stringify(body)),
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  realFetch = globalThis.fetch;
  scenesResponse = { scenes: [] };
  uploadResponse = { video_id: "vid-1" };
  authOk = true;
  globalThis.fetch = ((url: string) => {
    const u = String(url);
    if (u.includes("/auth/v1/user")) {
      return authOk
        ? Promise.resolve(jsonOk({ id: "u1", email: "u@x.com", aud: "authenticated", role: "authenticated" }))
        : Promise.resolve({ ok: false, status: 401, headers: { get: () => "application/json" }, text: () => Promise.resolve("{}") });
    }
    if (u.includes("/collection/default/upload")) return Promise.resolve(jsonOk(uploadResponse));
    if (u.includes("/index")) return Promise.resolve(jsonOk({ status: "indexing" }));
    if (u.includes("/scenes")) return Promise.resolve(jsonOk(scenesResponse));
    return Promise.resolve(jsonOk({}));
  }) as any;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

afterAll(() => {
  (globalThis.Deno as any).serve = realServe;
  (globalThis.Deno as any).env = realEnv;
});

async function call(action: string, videoUrl = "https://example.com/v.mp4") {
  const req = new Request("https://x/v", {
    method: "POST",
    headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
    body: JSON.stringify({ action, videoUrl }),
  });
  const res = await capturedHandler!(req);
  return { status: res.status, body: await res.json() };
}

await import("./index.ts");

describe("video-analysis — real (non-hardcoded) VideoDB output", () => {
  it("scene-detection returns the scenes VideoDB reported (not hardcoded)", async () => {
    scenesResponse = { scenes: [{ start: 0, end: 4 }, { start: 4, end: 9 }] };
    const { status, body } = await call("scene-detection");
    assertEquals(status, 200);
    assertEquals(body.count, 2);
    assertEquals(body.scenes[0].start, 0);
    assertEquals(body.scenes[1].end, 9);
    assertEquals(body.videoId, "vid-1");
  });

  it("different input scenes -> different scene-detection output (non-hardcoded proof)", async () => {
    scenesResponse = { scenes: [{ start: 0, end: 2 }, { start: 2, end: 5 }] };
    uploadResponse = { video_id: "vid-a" };
    const a = await call("scene-detection", "https://ex/a.mp4");
    scenesResponse = { scenes: [{ start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 12 }] };
    uploadResponse = { video_id: "vid-b" };
    const b = await call("scene-detection", "https://ex/b.mp4");
    assert(a.body.count !== b.body.count, "counts must differ");
    assert(a.body.scenes[1].end !== b.body.scenes[1].end, "scene boundaries must differ");
  });

  it("pacing-optimizer derives real numbers from scenes (non-hardcoded)", async () => {
    scenesResponse = { scenes: [{ start: 0, end: 10 }, { start: 10, end: 11 }, { start: 11, end: 60 }] };
    const { status, body } = await call("pacing-optimizer");
    assertEquals(status, 200);
    assertEquals(body.pacingAnalysis.currentPacing.averageClipLength, 20);
    assertEquals(body.pacingAnalysis.currentPacing.cutsPerMinute, 3);
    assertEquals(body.pacingAnalysis.optimizedTimeline.suggestedCuts, [0, 10, 11]);
    assert(body.pacingAnalysis.optimizedTimeline.rhythmScore >= 0 && body.pacingAnalysis.optimizedTimeline.rhythmScore <= 10);
    assert(body.pacingAnalysis.recommendations.some((r: any) => r.action === "shorten"));
  });

  it("different scenes -> different pacing numbers (non-hardcoded proof)", async () => {
    scenesResponse = { scenes: [{ start: 0, end: 5 }, { start: 5, end: 10 }] };
    const even = await call("pacing-optimizer", "https://ex/even.mp4");
    scenesResponse = { scenes: [{ start: 0, end: 1 }, { start: 1, end: 50 }] };
    const uneven = await call("pacing-optimizer", "https://ex/uneven.mp4");
    assert(
      even.body.pacingAnalysis.currentPacing.averageClipLength !== uneven.body.pacingAnalysis.currentPacing.averageClipLength,
      "averageClipLength must differ for different scenes",
    );
    assert(
      even.body.pacingAnalysis.optimizedTimeline.rhythmScore !== uneven.body.pacingAnalysis.optimizedTimeline.rhythmScore,
      "rhythm score must differ",
    );
  });

  it("scene-analyzer returns scenes derived from VideoDB (not the old canned 3-scene object)", async () => {
    scenesResponse = { scenes: [{ start: 0, end: 3 }, { start: 3, end: 7 }] };
    const { status, body } = await call("scene-analyzer");
    assertEquals(status, 200);
    assertEquals(body.analysis.scenes.length, 2);
    assert(body.analysis.scenes.length !== 3 || body.analysis.scenes[0].start !== 0 || body.analysis.scenes[1].start !== 15, "must not be the old canned 0/15/35 scene set");
  });

  it("returns 202 indexing status when scenes are not ready within poll budget", async () => {
    scenesResponse = { scenes: [] };
    const { status, body } = await call("scene-detection");
    assertEquals(status, 202);
    assertEquals(body.status, "indexing");
    assert(!!body.videoId);
  });

  it("rejects missing videoUrl with 400", async () => {
    const req = new Request("https://x/v", {
      method: "POST",
      headers: { Authorization: "Bearer jwt", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "scene-detection" }),
    });
    const res = await capturedHandler!(req);
    assertEquals(res.status, 400);
    assertStringIncludes(await res.text(), "videoUrl is required");
  });

  it("rejects unknown action with 400", async () => {
    scenesResponse = { scenes: [{ start: 0, end: 1 }] };
    const { status } = await call("bogus");
    assertEquals(status, 400);
  });

  it("rejects unauthenticated requests with 401", async () => {
    authOk = false;
    scenesResponse = { scenes: [{ start: 0, end: 1 }] };
    const { status } = await call("scene-detection");
    assertEquals(status, 401);
  });
});

describe("video-analysis — source contract", () => {
  it("holds VIDEO_DB_API_KEY server-side; reads no client-side import.meta.env", async () => {
    const src = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
    assertStringIncludes(src, "VIDEO_DB_API_KEY");
    assert(!src.includes("import.meta.env"), "must not use client-side import.meta.env");
  });
});
