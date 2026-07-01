# S1 — Stop the Bleeding (RenderPage Phase 1) — Design Spec

> **Status:** Draft, awaiting user review. Do NOT implement until this spec is approved.
> **Verification mode:** LIVE (cumulative across S1–S4). S1 itself is verified by unit/integration tests only — no live infra required. Live click-verification of the actions S1 enables accumulates in S2 (keys) and S4 (worker).
> **Constraint:** CPU-only, no GPU anywhere. GPU-claiming tiles/tooltips removed or rewritten.

---

## 1. Goal

Stop RenderPage from crashing, silently no-op'ing, and shipping fake data:
- Eliminate the `muapiClient` `ReferenceError` in the three CineGen `execute*` functions.
- Eliminate the action-name mismatch that sends every `executeRepositoryTask` call to `videoagent`'s `default: "Unknown agent"` branch.
- Fix `rendiv-render`'s broken schema write (`external_job_id`) and missing `render-callback` so a render job can actually be marked complete.
- Strip every GPU/CUDA claim from the UI; delete pure-decoration tiles that have no backend and no planned backend.
- Add the regression tests that would have caught all of the above.

S1 does **not** make every tile produce a final playable output — that is the cumulative S1→S4 result. S1 makes the *enabled* tiles do real, non-fake work (real MuAPI submission, real Whisper, real vision) and *disables* (with honest labels) the tiles whose real backends land in S2/S4. No tile ships returning hardcoded data or throwing on first use.

---

## 2. Corrections to the original prompt's ground truth

These were verified by reading the code, and change the plan:

1. **"Two near-identical `render_jobs` migrations" — false.** `ls supabase/migrations` shows exactly one: `20260414140000_add_render_jobs_table.sql`. There is nothing to de-duplicate. S1 adds the missing `external_job_id` column via one **new** migration and leaves the historical one untouched.
2. **`videoagent` is an LLM *text* assistant, not a video processor.** `executeAgent` (`videoagent/index.ts:1284–1605`) returns `{ message: string }`. Its fallback switch (lines 1368–1604) emits canned strings for ~22 agents; its 6 "real" OpenAI-Responses handlers (`summarize_video`, `search_media`, `generate_subtitles`, `extract_highlights`, `detect_scenes`, `stabilize_video`) return text, never video files. Line 1279 `return map[action] || action.replace(/-/g, "_")` is why RenderPage's hyphenated actions fall through to `default: "Unknown agent"` (line 1599). **Implication:** routing RenderPage's *output-producing* actions (export, shorts, dub, render) to `videoagent` was architecturally wrong even if the names matched. The only genuine real-handler overlaps with RenderPage's intent are `generate_subtitles` (real Whisper) and `extract_highlights` (real OpenAI vision) — and both are currently unreachable because RenderPage sends `add-subtitles`/`highlight-detection`, not the map keys `generate-subtitles`/`extract-highlights`.
3. **`ExportPipeline` (`src/lib/editor/exportPipeline.js`) is a browser UI panel** (`document.createElement('div')`, export forms, progress DOM), not an encoder. It does not provide a server export backend. "Export Video"-class actions therefore belong to the S4 CPU FFmpeg worker, not to `ExportPipeline`.

---

## 3. Canonical MuAPI client (audit result — locked decision)

Audited all `src/lib/muapi*` files and `src/lib/muapi/`:

| File | Verdict | Reason |
|---|---|---|
| `src/lib/muapi.js` | **CANONICAL — keep** | 808 lines; 38+ standalone `fn(apiKey, params)` exports; imported by ~30 files; key always passed explicitly (correct separation). |
| `src/lib/muapi-lazy.js` | **keep** | 4-line code-split shim for `local-ai.js` dynamic import. |
| `src/lib/muapiEnhanced.js` | **keep** | 4 active importers; distinct enhancement layer (TikTok carousel, dubbing, Pixverse/Veo/Runway). |
| `src/lib/muapiConfig.js` | **keep** | 3 active importers; pure config/feature-flag data, no overlap with call surface. |
| `src/lib/muapi-key-manager.js` | **keep (flagged)** | 0 importers (dead), but holds encrypted-key + legacy-migration pattern. Keep for now; do not wire in S1. |
| `src/lib/muapiWorkflowClient.js` | **delete after migrating 1 importer** | `WorkflowRunnerPage.js:4` is the only importer; all functions duplicated by `muapi.js`'s `executeWorkflow(apiKey, workflowId, inputs)` (which polls internally). |
| `src/lib/muapiAdapter.js` | **delete** | 14 lines; only importer (`outputHandoff.js:2`) imports a name (`uploadFile`) that doesn't exist here — already broken. |
| `src/lib/muapi/` (6 files, ~3,600 lines) | **delete** | Zero external importers; fully orphaned dead code. |

**Decision:** `src/lib/muapi.js` is the single canonical client. Document this in `AGENTS.md` so future agents stop importing half-duplicates. S1 deletes the dead files and migrates the one live importer.

**Important:** because `MUAPI_API_KEY` is **not** `VITE_`-prefixed in `.env.example`, Vite never exposes it to the client. Per the "service keys stay server-side" rule, RenderPage must **not** call MuAPI directly. The three CineGen actions instead call a new server-side Edge Function `cinegen-ai`, which holds `MUAPI_API_KEY` and makes the real MuAPI call. This is strategy (b) and it is the correct home for the key.

---

## 4. Action routing table (strategy b — the core of S1)

RenderPage's current `actionMap` (`RenderPage.js:1452–1482`) sends hyphenated strings to `videoagent`. S1 replaces it with a routing table mapping each action to `(targetFunction, targetAction, status)`.

| # | RenderPage action (current label) | S1 target | targetAction | S1 status | Real backend lands in |
|---|---|---|---|---|---|
| 1 | AI Gap Filler | `cinegen-ai` | `gap-filler` | **enabled** | S1 (submit) → S2 (real inputs + result) |
| 2 | Clip Extender | `cinegen-ai` | `clip-extender` | **enabled** | S1 (submit) → S2 |
| 3 | AI Music Generator | `cinegen-ai` | `music-generator` | **enabled** | S1 (submit) → S2 |
| 4 | Add Subtitles | `videoagent` | `generate-subtitles` | **enabled** | already real (Whisper) — name fixed in S1 |
| 5 | Generate Highlights | `videoagent` | `extract-highlights` | **enabled** | already real (vision) — name fixed in S1 |
| 6 | Copy Prompt | client-side | — | **enabled** | n/a (no backend) |
| 7 | Duplicate Render | client-side | — | **enabled** | S3 persists |
| 8 | Save as Template | client-side (localStorage) | — | **enabled** | S3 persists |
| 9 | Send to Storyboard | `navigate(...)` | — | **enabled** | n/a (navigation) |
| 10 | Agentic Editor | `navigate(...)` | — | **enabled** | n/a (opens editor) |
| 11 | Full Editor | `navigate(...)` | — | **enabled** | n/a (opens editor) |
| 12 | Scene Analyzer | `video-analysis` | `scene-analyzer` | **disabled** (label "Phase 2") | S2 (VideoDB) |
| 13 | Pacing Optimizer | `video-analysis` | `pacing-optimizer` | **disabled** | S2 (VideoDB) |
| 14 | Scene Detection AI | `video-analysis` | `scene-detection` | **disabled** (remove TransNet V2 claim) | S2 (VideoDB) |
| 15 | Export Video | `rendiv-render` | `export-video` | **disabled** (label "Phase 4") | S4 (FFmpeg worker) |
| 16 | Export Variations | `rendiv-render` | `export-variations` | **disabled** | S4 |
| 17 | Parallel Render | `rendiv-render` | `parallel-render` | **disabled** | S4 |
| 18 | Frame Control | `rendiv-render` | `frame-control` | **disabled** | S4 |
| 19 | Quality Encode | `rendiv-render` | `quality-encode` | **disabled** | S4 |
| 20 | Queue Render | `rendiv-render` | `queue-render` | **disabled** | S4 |
| 21 | Download Frame | `rendiv-render` | `download-frame` | **disabled** | S4 (FFmpeg frame grab) |
| 22 | Create Shorts | — | — | **disabled** (label "Phase 4") | S4 (reframe pipeline) |
| 23 | Trailer Cut | — | — | **disabled** (label "Phase 2/4") | S2/S4 |
| 24 | Social Resize | — | — | **disabled** | S4 |
| 25 | Dub / Voiceover | — | — | **disabled** (label "Phase 2") | S2 (muapiEnhanced dub) |
| 26 | Remix Scene | — | — | **disabled** (label "Phase 2/4") | S2/S4 |
| 27 | Publish / Deliver | — | — | **disabled** (label "Phase 3") | S3 |
| 28 | AI Auto-Edit | — | — | **disabled** (label "Phase 2") | S2 (multi-step) |

**Deleted tiles (no backend, none planned in S2–S4, pure decoration):**
- **GPU Accelerated Render** (claims CUDA via LTX-Desktop) — delete.
- **Model Weight Streaming** (local GPU model loading) — delete.
- **MLLM Quality Check** — delete.
- **Reference Asset Picker** — delete.
- **Keyframe Animation** — delete.

**Disabled vs deleted:** "Disabled" = tile remains in the DOM, visually greyed out, with an honest tooltip like "Available in Phase 2 (VideoDB scene analysis)"; clicking it shows a toast with that same message and performs **no** action — never a fake success. "Deleted" = tile removed entirely from the DOM and its config, including event listeners.

**Tooltip/preset corrections (no GPU claims):**
- `CINEGEN_EXPORT_PRESETS` "4K Cinema Master" tooltip: remove "GPU-accelerated FFmpeg rendering" → "CPU-encoded H.264 master (libx264)".
- `RENDIV_RENDER_OPTIONS.profiling.metrics.gpuUtilization` → rename to `cpuUtilization`; update the Performance Profiling panel copy to CPU metrics only.
- Audit `RENDIV_RENDER_OPTIONS.advancedEncoding` (`videoEncoder: 'libx264'` already CPU — good) and `CINEGEN_EXPORT_PRESETS` codecs; confirm none imply NVENC/CUDA. Correct any found.

---

## 5. Files touched (with current line references)

### Modify
- `src/components/RenderPage.js`
  - Remove the undefined `muapiClient.*` calls in `executeGapFiller` (`:1277`), `executeClipExtender` (`:1314`), `executeMusicGenerator` (`:1352`).
  - Replace `executeRepositoryTask`'s `actionMap` (`:1452–1482`) with the routing table in §4.
  - Replace the fake `setTimeout` progress loop (`:1552–1574`, comment `// Simulate step processing`) with an honest indeterminate "Processing…" indicator tied to the real `supabase.functions.invoke` promise. (Granular real progress via Realtime is S2.)
  - Remove the hardcoded analysis objects in `executeSceneAnalyzer` (`:1382–1398`) and `executePacingOptimizer` (`:1414–1430`) only insofar as their tiles are disabled in S1; the real VideoDB replacement is S2. (Leave the functions but stop them from being reachable; S2 rewrites them.)
  - Delete the GPU/decoration tiles and their config + event listeners.
  - Strip GPU claims from tooltips/presets (see §4).
- `src/components/WorkflowRunnerPage.js:4` — migrate import from `muapiWorkflowClient.js` to `muapi.js`'s `executeWorkflow`.
- `supabase/functions/rendiv-render/index.ts`
  - The `.update({ external_job_id })` (`:118–124`) becomes valid once the column exists (migration below).
  - Make `DIRECTOR_API_BASE_URL` already env-driven (`:15`) — keep; S4 sets it to the worker URL. Add a guard so that when no worker URL/key is configured, `export-video` returns an honest 503 "render worker not configured" instead of calling the dead `api.director.ai/v1`.
  - `callback_url` (`:114`) points to `render-callback` — implemented as a new function below so the URL resolves.
  - (CORS hardcoded origin `:5` and Render port/`/health` are left to S4, which aligns `rendiv-render` with the Render worker. S1 does not touch them.)
- `AGENTS.md` — add a "Canonical MuAPI client" note: `src/lib/muapi.js` is the source of truth; do not import from `src/lib/muapi/` (deleted) or `muapiAdapter.js` (deleted).

### Create
- `supabase/migrations/20260630140000_add_external_job_id_to_render_jobs.sql` — `ALTER TABLE public.render_jobs ADD COLUMN IF NOT EXISTS external_job_id TEXT;` (no edit to the historical migration). Mirror the existing RLS pattern (table is already RLS-enabled; column inherits policies).
- `supabase/functions/_shared/cors.ts` — `corsHeaders` + `handleOptions(req)` + permissive-but-env-configurable origin.
- `supabase/functions/_shared/auth.ts` — `requireUser(req, supabase)` → verifies Bearer JWT via `supabase.auth.getUser`, returns `{ user }` or throws a 401 Response.
- `supabase/functions/_shared/supabaseClient.ts` — service-role client from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-side only).
- `supabase/functions/_shared/errors.ts` — `jsonError(status, message)` helper.
- `supabase/functions/cinegen-ai/index.ts` — MuAPI-backed; actions `gap-filler` | `clip-extender` | `music-generator`. Validates auth, **submits** to MuAPI (does not block on long poll), returns `{ requestId, status: "submitted" }` (real submission). Full result retrieval + Storage write is S2/S3.
- `supabase/functions/render-callback/index.ts` — receives worker callbacks; verifies job id, updates `render_jobs.status` / `progress` / `output_url` / `completed_at` / `error_message`. Auth via a shared callback secret (env `RENDER_CALLBACK_SECRET`) rather than user JWT, since the worker calls it.

### Delete
- `src/lib/muapi/` (entire directory, 6 files)
- `src/lib/muapiAdapter.js`
- `src/lib/muapiWorkflowClient.js` (after migrating `WorkflowRunnerPage.js`)

---

## 6. cinegen-ai contract (S1)

Request: `{ action, videoUrl, options }` with `Authorization: Bearer <jwt>`.

- `gap-filler` / `clip-extender`: `POST {MUAPI base}/api/v1/<model endpoint>` with `MUAPI_API_KEY` (server-side), `prompt`/`image_url`/`duration` derived from `options` + `videoUrl`. Return `{ requestId, status: "submitted" }`. Model id is read from `options.model`, falling back to env `CINEGEN_DEFAULT_VIDEO_MODEL` (S2 sets a concrete value; S1 leaves the env unset → function returns 503 "model not configured" if unset, which is honest, not fake).
- `music-generator`: `POST {MUAPI base}/api/v1/text-to-audio` with prompt from `options`; model from `options.model` or env `CINEGEN_DEFAULT_AUDIO_MODEL` (same honest-503-if-unset rule). Return `{ requestId, status: "submitted" }`.

Rationale for submit-only (not poll): MuAPI video generation polls up to ~30 min; a Supabase Edge Function cannot block that long. Submitting and returning a real `requestId` is real, non-fake work. S2 adds job rows + Realtime + Storage so the client retrieves the final output. S1's client (RenderPage) shows "Generation submitted (request …)" — honest.

---

## 7. render-callback contract (S1)

Request: `{ jobId, status, progress, outputUrl, error }` with header `X-Callback-Secret: <RENDER_CALLBACK_SECRET>`.

- Verify secret; reject 401 if mismatch. (The worker does not send a user JWT, so auth is the shared secret, not `auth.uid()`. The service-role client bypasses RLS, so the update is scoped by `id` only.)
- `UPDATE render_jobs SET status=?, progress=?, output_url=?, completed_at=NOW() WHERE status<>'completed' AND id=?` — idempotent (never reopen a completed job). The `WHERE status<>'completed'` guard prevents a late/stale callback from clobbering a job that already reached a terminal state via another path.
- Returns 200 `{ ok: true }`.

S1 ships the function + a unit test (mock supabase). Live end-to-end (worker → callback → completed row) is S4.

---

## 8. Testing plan

### Unit (Vitest, `tests/unit/`)
- `renderpage-cinegen.unit.spec.ts` — for each of the 3 CineGen `execute*` functions: mock `supabase.functions.invoke`, assert the correct `(function:'cinegen-ai', action, videoUrl, options)` payload is sent and that **no `muapiClient` symbol is referenced** (grep the module source for `muapiClient` → 0 hits). This test fails immediately if someone reintroduces the undefined client.
- `renderpage-routing.unit.spec.ts` — import the new routing table; for every **enabled** action assert it resolves to a `(targetFunction, targetAction)` that the target actually handles: `videoagent` actions must be keys in its `actionToAgentName` map; `cinegen-ai` actions must be in its handled set; client-side actions are marked as such. This single test would have caught the entire outage.
- `renderpage-progress.unit.spec.ts` — assert the `executeRepositoryTask` path contains no `setTimeout(...1000)` "simulate" loop (grep the function source for `Simulate step processing` → 0 hits) and instead drives the indicator from the invoke promise.
- `renderpage-gpu-claims.unit.spec.ts` — assert the rendered RenderPage HTML/config contains no `CUDA`, no `gpu acceleration` (case-insensitive) claims, and that the deleted tiles' ids are absent from the DOM.
- `workflowrunner-migration.unit.spec.ts` — assert `WorkflowRunnerPage.js` imports `executeWorkflow` from `muapi.js` and no longer references `muapiWorkflowClient`.

### Deno unit (edge functions, `supabase/functions/*/test/*.test.ts`)
- `cinegen-ai` — mock `fetch` to MuAPI; assert correct submit payload + `MUAPI_API_KEY` header; assert 401 without JWT; assert 400 for unknown action.
- `render-callback` — mock supabase client; assert idempotent update (completed job not reopened), 401 without secret, correct column writes.

### Migration
- Validate the new SQL parses and is idempotent (`ADD COLUMN IF NOT EXISTS`). (Apply to live Supabase in S3/S4 verification; S1 just ships valid SQL.)

### Out of scope for S1 verification
- Live click of CineGen/Subtitles/Highlights (needs `MUAPI_API_KEY` / OpenAI key on videoagent) — happens in S2.
- Live `rendiv-render` end-to-end (needs S4 worker) — S4.

---

## 9. Acceptance criteria for S1

1. `grep -rn "muapiClient" src/components/RenderPage.js` → 0 hits.
2. `grep -rn "Simulate step processing" src/components/RenderPage.js` → 0 hits.
3. `grep -rin "cuda\|gpu acceleration\|gpu-accelerated" src/components/RenderPage.js` → 0 hits; deleted-tile ids absent from rendered DOM.
4. `src/lib/muapi/`, `src/lib/muapiAdapter.js`, `src/lib/muapiWorkflowClient.js` deleted; `WorkflowRunnerPage.js` migrated; `grep -rn "muapiWorkflowClient\|muapiAdapter\|lib/muapi/" src/` → 0 hits.
5. New migration `20260630140000_add_external_job_id_to_render_jobs.sql` present and idempotent.
6. `render-callback` and `cinegen-ai` functions present with `_shared/` helpers; both have passing Deno unit tests.
7. The routing integration test passes: every enabled action resolves to a real handler; every disabled action is marked disabled (not fake-enabled).
8. `npm run test` and `npm run test:e2e` (existing suites) still pass — no regressions from the deletes/migrations.
9. `AGENTS.md` documents `muapi.js` as canonical.

---

## 10. Explicitly deferred to later specs

- **S2:** real VideoDB-driven Scene Analyzer / Pacing / Scene Detection; real input derivation for CineGen; Dub via `muapiEnhanced`; real granular progress via Supabase Realtime; AI Auto-Edit multi-step; Trailer/Remix.
- **S3:** Supabase Storage writes for all outputs; `cinegen_edits` table for gap-fill/extend/music history; `render_jobs` persistence for all jobs; RLS verification; `Save as Template` / `Duplicate Render` / `Publish-Deliver` persisted.
- **S4:** `render.yaml` fixes (port `Deno.env.get('PORT')`, `/health` route in `rendiv-render`, remove orphaned `director-db`); CPU-only FFmpeg worker on Render; wire `rendiv-render` → worker; enable the S4-disabled export/render/shorts/resize/frame tiles; live end-to-end render-callback verification.

---

## 11. What S1 needs from the user

Nothing for code/tests. The only S1 *optional* live check (not required to mark S1 done) is clicking Add Subtitles / Generate Highlights against a deployed `videoagent` that has `OPENAI_API_KEY` set — if you want that live confirmation now, provide the key placement; otherwise it rolls into S2.
