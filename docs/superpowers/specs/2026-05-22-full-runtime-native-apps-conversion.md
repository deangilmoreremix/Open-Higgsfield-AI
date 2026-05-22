# Design Spec: Converting External Repositories into Full Runtime-Native Higgsfield Applications (B Approach on Shell Foundation)

**Date**: 2026-05-22  
**Status**: Design Approved (Sections 1-3) — Awaiting User Review of this Doc  
**Author**: Kilo (following brainstorming + superpowers skills)  
**Scope**: videco_ai_platform, Vibe-Workflow, Open-Pomelli, ai-headshot-generator, videoremixai-vfx, AI-VFX (6 apps)  
**Canonical Sources**: deangilmoreremix/* forks (primary for consistency with submodules + prior remix work); ZapDigits/SamurAIGPT as fallbacks for specific features.  
**Approach**: B (Port core logic/features to native) + strictly building ON TOP of all previous shell work (additive only, zero deletions).  
**Goal**: Every repo becomes a FULLY NATIVE Higgsfield app inside the existing kernel (ExecutionRuntime, WorkflowEngine, OrchestrationEngine, ExecutionStateMachine, FailureRecovery, QueueSystem, AssetLifecycleManager, RealtimeExecutionTracker, RuntimeRouter, AppRegistry, PersistenceLayer, EventBus, ProviderRegistry, MuAPIGenerationPipeline, VibeWorkflowAdapter). No iframes, no separate embedding, no shell fallbacks for these 6.

## 1. Constraints & Invariants (Non-Negotiable)
- **Additive ONLY**: DO NOT remove, replace, overwrite, or downgrade any existing Higgsfield apps, routes, runtime systems, providers, workflows, assets, pipelines, components, tests, docs, or manifests.
  - All current /apps/* (6 existing), src/apps/* (4 shells + manifests/services), public/apps/*, components/*Studio/*Page, router.js entries, vite proxies (temp), build:* scripts, tests/e2e/*-full.spec + asset-pipeline-handoff, AGENTS.md 17 areas, ALL md docs, netlify.toml, CSP etc. remain untouched.
  - Previous shell UIs (PomelliStudio.js, HeadshotStudio.js, VibeWorkflowPage.js, AIVFXStudio.js, RemixGoApp etc. + their latest-commit vanilla UIs) become the **base layer** for new native pages/components/.
- **Reuse, Never Rebuild Kernel**: All listed systems (ExecutionRuntime etc.) ALREADY EXIST and MUST be extended (additive) via adapters. No duplicate runtime code.
- **No Shells for Target 6**: After completion, these 6 MUST be runtime-native (contract + pipeline + realtime + recovery + persistence + orchestration + workflow-aware). Old shell loading is legacy fallback only (toggleable, never primary).
- **Full Code from Repos**: Key logic (prompts, node defs, presets, AI pipelines, state machines, generation flows) extracted via raw fetch from canonical repos and ported/adapted into native structure (not copied wholesale Next.js).
- **Tests Must Pass**: `npm run test:run` (unit + integration + e2e + stress + orchestration + persistence + recovery + realtime + workflow) + all existing tests.
- **Unified OS Outcome**: Shared everything across all apps (including the new 6).

## Approved Technology Stack (Hard Lock — Non-Negotiable)
For **all 6 apps** (and any runtime adapters/providers/workflows created for them), the **only** allowed stack is:

- **LLM / Prompt Engineering / Intelligence**: OpenAI API (via existing `src/lib/openaiService.js`, `apps/*/src/ai/openai.js` patterns, and MuAPI chat proxy where used for consistency).
- **Image + Video Creation / Generation / Effects / Headshots / VFX / Scenes**: MuAPI API exclusively (https://api.muapi.ai — all calls go through existing `src/lib/muapi.js`, `MuapiClient`, `apps/*/src/ai/muapi.js`, and the MuAPIGenerationPipeline. No direct fal.ai, RunPod, Replicate, or other generators unless wrapped inside MuAPI).
- **Storage, Database, Auth, Realtime, Edge Functions, Persistence Snapshots, Assets, Execution History**: Supabase (via `src/lib/supabase.js`, `hybrid-supabase.js`, `src/lib/persistence*`, existing supabase/edge functions, and channels for RealtimeExecutionTracker).
- **Hosting / CDN / Serverless (main Higgsfield + built app artifacts)**: Netlify (netlify.toml, Netlify Functions for any additional proxies, `public/apps/` deploys, existing build:* scripts that copy artifacts).

**Explicitly forbidden for these 6 apps**:
- Any other LLM (Anthropic, Gemini, local models, etc.) unless routed through the approved OpenAI/MuAPI path.
- Any other generation provider (fal, Kling direct, Luma, Pika, etc.) — all must use MuAPI.
- Any other storage (S3 direct, Firebase, etc.).
- Any other hosting for the integrated native modules (they run inside the main Netlify-hosted Higgsfield Vite app).

All previous shell code already follows this stack (muapi + openai + supabase + netlify). The adapters will **only** call the existing clients/services. This guarantees consistency with the rest of Higgsfield and satisfies the user's explicit requirement.

## 2. Target Apps & Canonical Mapping
1. **videco-ai-platform** (features: AI Video Gen (text-to-video, image-to-video, cinematic, scene gen, AI transitions/effects/motion/camera, timeline/editing/layer/scene/clip/export, queued rendering, realtime progress, distributed orchestration, recovery, persistence, execution replay, workflow graph/node-based, render chaining, pipeline orchestration) — Source: deangilmoreremix/videco_ai_platform (ZapDigits origin)
2. **vibe-workflow** (Workflow Builder: visual node editor, drag/drop, graph exec, serialization/persistence/replay, async node, orchestration/queue/concurrent, AI pipeline chaining/prompt transform/multi-stage/provider routing/conditional/branching, snapshots/crash recovery/replay/deterministic) — Source: deangilmoreremix/Vibe-Workflow (enhance existing shell)
3. **open-pomelli** (AI Creative Studio: prompt eng, image gen, design system, composition/asset workflows, creative orchestration, asset library/tagging/metadata/project/version, execution tracking/provider/realtime/recovery, creative pipelines/reusable/generation chains/batch) — Source: deangilmoreremix/Open-Pomelli (enhance existing)
4. **ai-headshot-generator** (AI Headshot: portrait/professional/style/lighting/pose presets, facial enhance/bg/outfit, face correction/skin/retouch/realism/identity, queued gen/realtime progress/persistence/recovery checkpoints, batch/preset/multi-image pipelines) — Source: deangilmoreremix/ai-headshot-generator (enhance)
5. **ai-vfx** (primary; also covers videoremixai-vfx) (AI VFX Studio: effects gen, cinematic VFX, compositing, scene enhance, particles/explosions/transitions/motion/masking/green-screen, frame/timeline/layered/clip/realtime preview, distributed/GPU/queued/render orchestration/recovery, VFX node graphs/chained/compositing/reusable chains) — Source: deangilmoreremix/videoremixai-vfx (primary) + SamurAIGPT/AI-VFX (consolidate; single native "ai-vfx" app with aliases for old routes; no dup apps created)

No duplication: single entry per logical app in AppRegistry, Sidebar, search, routes, docs, tests. Old names (e.g. 'pomelli-studio') alias to new native.

## 3. Structure (Additive on Previous Shells)
For every forged app (new or enhanced):

```
/apps/{app-name}/                 # NEW or ENHANCED (e.g. /apps/vibe-workflow/ extends existing /apps/vibe-workflow/ + mirrors src/apps/vibe-workflow/)
  manifest.js                     # COPY from previous shell + extend (id, name, category, route, description, stack, outputTypes, handoffTargets, runtime: { native: true, adapter: 'runtime/adapter.js' })
  routes.js                       # COPY + extend (add runtime-aware paths)
  runtime/
    adapter.js                    # NEW (core — see Section 4)
    entry.runtime.js              # NEW (mount hook for RuntimeRouter/AppRegistry)
    pipeline.js                   # NEW (execution pipeline steps, reuse MuAPIGenerationPipeline)
    persistence.js                # NEW (Supabase + local snapshots, reuse PersistenceLayer)
    recovery.js                   # NEW (replay/checkpoints, reuse FailureRecovery)
    orchestration.js              # NEW (scheduling, reuse OrchestrationEngine + QueueSystem)
  components/                     # PORT/EXTEND previous shell UIs (from PomelliStudio.js etc.) + new native
  pages/                          # NEW native pages for required features (e.g. VideoGenPage, NodeEditorPage, HeadshotPresetsPage)
  workflows/                      # PORT node graphs/pipelines from repo (use/enhance existing WorkflowEngine + WorkflowNode)
  providers/                      # PORT/adapt AI calls (muapi, openai, fal) from previous services/ + register in ProviderRegistry
  assets/                         # FETCH presets, thumbnails, examples from repo raw; versioned
  tests/                          # NEW (unit for adapter/contract, integration for pipeline, e2e full loop + recovery)
```

- **src/apps/{name}/** : Keep previous shells intact as reference/base; optionally symlink or copy key services into new /apps/{name}/providers/ during port.
- **/apps/{name}/** for native source (pnpm workspace already includes "apps/*").
- **public/apps/{name}/** : Only for legacy build artifacts or static assets; primary is native JS module load (no more full Next.js standalone for these 6).
- Previous /apps/vibe-workflow/ (vanilla node editor) etc. stay; we layer runtime/ on top and update its main to optionally use adapter.

This exactly matches the 🔥 REQUIRED APPLICATION STRUCTURE in the task prompt.

## 4. Required Runtime Contract (Implemented in adapter.js)
Every app MUST implement (in class exported from runtime/adapter.js):

```js
// Example skeleton (full impl in execution phase)
export class VidecoRuntimeAdapter {
  constructor(context = {}) {
    this.executionId = null;
    this.state = 'idle';
    this.workflow = new WorkflowEngine(); // reuse existing
    // wire to shared: PersistenceLayer, RealtimeExecutionTracker, etc.
  }
  async execute(input, context) { /* full pipeline */ }
  async pause(executionId) {}
  async resume(executionId) {}
  async cancel(executionId) {}
  async recover(snapshot) {}
  serialize() {}
  deserialize(data) {}
  subscribe(events, cb) {}
  unsubscribe(events, cb) {}
  getExecutionState() { return { id: this.executionId, state: this.state, ... }; }
}
```

- **execute** MUST drive the exact 12+ stage pipeline (user action → creation → scheduling → provider → realtime → snapshots → workflow sync → assets → recovery → export/handoff → completion + EventBus).
- All methods delegate to / reuse existing kernel singletons where possible (additive extensions only).
- entry.runtime.js:
  ```js
  import { appManifest } from '../manifest.js';
  import { VidecoRuntimeAdapter } from './adapter.js';
  import { registerApp, mountApp } from '../../../src/lib/app-registry.js'; // (or extend existing)
  export function mountNative(container, options) {
    const adapter = new VidecoRuntimeAdapter(options);
    registerApp(appManifest, adapter);
    // render previous shell UI base + enhance with runtime controls (pause/resume buttons, execution status, handoff)
    // support session restore: adapter.deserialize( loadFromPersistence(executionId) )
    return adapter;
  }
  ```

## 5. Higgsfield Integrations & Execution Pipeline
- **All 9+ systems** wired in adapter + orchestration.js/pipeline.js (see Section 2 for list).
- **Global additions** (additive across ALL apps, not just 6): execution scheduler/graph, distributed orchestration, runtime snapshots, deterministic replay, Supabase persistence for execution history/workflow/session, websocket sync + multi-client + reconnect recovery, replay/interrupted/queue/provider-retry/failover.
- Pipeline is the single source of truth for every execution in the 6 (and eventually all).

## 6. UI / Navigation / Restoration / Launcher Integration
- **Sidebar + Apps Hub + Launcher + Search**: Extend existing (src/components/Sidebar.js, AppsStudio.jsx, AppsHub.js, search logic) — register via AppRegistry using the new manifests (additive entries only). Previous shell registrations remain.
- **Routes**: router.js stays; add/update loaders to:
  ```js
  'videco-ai-platform': () => import('/apps/videco-ai-platform/runtime/entry.runtime.js').then(m => m.mountNative(contentArea)),
  // similar for others; keep old 'pomelli-studio' etc. as aliases or legacy
  ```
- **Runtime Mounting & Session/State Restoration**: entry.runtime uses adapter for mount + deserialize on restore (from URL param, local, or Supabase session). Previous custom/iframe UIs in components/ become the visual base inside the mounted container (or legacy view).
- Handoff buttons (already added in recent commits) extended to use adapter.getExecutionState() + outputHandoff.

## 7. Testing Strategy (Must Pass npm run test:run)
- **Per-app tests/** dir + coverage for all 17 areas in AGENTS.md (Runtime & App Setup, Route Navigation, Timeline/Editing, State Mgmt, Media Ingest, Library, Settings, Modals, Image/Video Creative, Publisher, Animation, Multi-Cam, Transitions, Color/Scopes, Audio, + the new runtime/orchestration/persistence/recovery/realtime/workflow).
- **Unit** (vitest): adapter contract, each method, provider exec, WorkflowEngine usage, previous service logic.
- **Integration**: queue coordination, orchestration, PersistenceLayer snapshots, FailureRecovery, websocket sync (mock hybrid-supabase + muapi).
- **E2E** (playwright, extend existing *-full.spec.js + asset-pipeline-handoff + navigation-routing.e2e): full execution loop (start gen → realtime progress → complete + handoff), provider exec, crash/recovery replay, workflow replay, cross-app (pomelli → vibe → videco), session restore after refresh, concurrent, invalid routes.
- **Stress/Operational**: 10+ concurrent executions, memory, failover.
- CI: retries, headless, reports. All 6 must be green before claim complete.
- Existing tests untouched + new ones additive.

## 8. Implementation Phases (High-Level — Detailed Plan in Next Skill)
1. Exploration/fetch key logic from canonical raw files (prompts, node types, presets, service calls).
2. Create /apps/{name}/ skeleton + copy/extend manifests/services from previous shells (additive).
3. Implement runtime/* (adapter first — contract + pipeline wiring to shared systems).
4. Port UI: start with previous shell components/ as base inside new pages/, add runtime controls (execution status, pause/resume, state restore UI).
5. Wire integrations (ProviderRegistry registration, EventBus, router updates, Sidebar/launcher/search).
6. Add tests/ for each (unit first, then full loops).
7. Update globals (vite proxy removal for these, CSP if needed, docs, build scripts to skip Next for these or keep for assets).
8. Validation: full test:run, manual execution of all required features, no shell behavior for the 6, handoff works, restoration works.
9. No PR/commit of app code until tests pass + user sign-off.

## 9. Risks, Mitigations & Success Criteria
- **Risk**: Breaking existing shells during "on top" work → Mitigation: never touch old files; only add new runtime/ + new mounts; feature-flag native via env or registry.
- **Risk**: Duplication of apps → Mitigation: single canonical manifest id per logical app; alias old routes; audit grep for old names post-port.
- **Risk**: Test failures / kernel conflicts → Mitigation: strict reuse, mock everything, incremental (one app at a time), run test:run after each.
- **Risk**: Incomplete "full code" port → Mitigation: map every required feature bullet in task to specific ported function/file in design.
- **Success**: 
  - 6 apps appear as runtime-native in sidebar/search/launcher.
  - All execute via adapter + full pipeline + shared systems.
  - `npm run test:run` 100% green (incl. new runtime tests).
  - Session restore, realtime, recovery, handoff, workflow replay all work.
  - Zero iframes/proxies for these 6 in primary paths.
  - Higgsfield is now unified OS with these as native citizens.
  - Previous shell work fully preserved and visible in git history / legacy toggle.

## 10. Open Items for Implementation Plan (writing-plans)
- Exact file list per /apps/{name}/ (what to fetch from each repo).
- Detailed adapter impl + shared singleton access patterns (e.g. how to get global ExecutionRuntime instance).
- Changes to AppRegistry / RuntimeRouter (if new, or extend existing router.js + lib).
- Per-app feature-to-file mapping table.
- Exact test additions + coverage targets (80%+).
- Rollout order (easiest first: ai-headshot-generator, then vibe, etc.).
- Deprecation plan for old Next builds / proxies.

**This completes the design.** All sections approved in dialogue. Preservation of shells is guaranteed. Approach B on foundation delivers the required native runtime apps without violating any rules.

---

*Next step (after your review/approval of this doc): I will invoke writing-plans skill to produce the detailed, step-by-step, checkpointed implementation plan (with todos, verification commands, no premature code).*
