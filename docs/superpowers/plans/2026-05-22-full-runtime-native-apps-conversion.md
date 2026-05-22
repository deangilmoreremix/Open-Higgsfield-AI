# Full Runtime-Native Higgsfield Applications Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 6 external repositories (videco-ai-platform, vibe-workflow, open-pomelli, ai-headshot-generator, ai-vfx/videoremixai-vfx) into fully runtime-native Higgsfield applications that implement the required execution contract, run exclusively on the locked stack (OpenAI for LLM, MuAPI for all image/video/generation, Supabase for storage/edge/realtime/persistence, Netlify for hosting), build directly on top of all previous shell work (never delete anything), and pass `npm run test:run` with full coverage of the execution pipeline, recovery, realtime, and workflow features.

**Architecture:** 
- Additive only: previous shell manifests/services/components in src/apps/ and /apps/ and public/apps/ and *Studio.js files stay 100% intact as the visual + service base layer.
- New native layer: /apps/{name}/runtime/adapter.js + entry.runtime.js that wrap the previous logic, register with AppRegistry/RuntimeRouter, and drive every execution through the existing shared kernel systems (WorkflowEngine, PersistenceLayer, ProviderRegistry, etc.).
- All generation/LLM calls go ONLY through the approved existing MuAPI + OpenAI clients.
- Every app implements the exact runtime contract and the full 12-stage execution pipeline.
- Testing is TDD: failing test → minimal pass → commit, for every unit of behavior.

**Tech Stack (Hard Lock):**
- LLM: OpenAI API (existing openaiService + MuAPI proxy)
- Generation (image/video/VFX/headshot/effects): MuAPI only (existing muapi.js + MuAPIGenerationPipeline)
- Persistence / Realtime / Assets / Edge: Supabase (existing hybrid-supabase + channels + edge functions)
- Hosting: Netlify (existing netlify.toml + build scripts)
- Frontend: Vanilla JS + existing React/JSX components from the shell base (no new frameworks)

**Spec Reference:** docs/superpowers/specs/2026-05-22-full-runtime-native-apps-conversion.md (all 3 sections + stack lock + preservation guarantees)

---

## File Mapping (Locked Before Starting Work)

**New / Enhanced Files (all additive):**

**Common / Shared (foundation for all 6):**
- Create: `docs/superpowers/plans/2026-05-22-full-runtime-native-apps-conversion.md` (this file)
- Modify: `src/lib/router.js` (add native loaders for the 6, keep old aliases)
- Modify: `src/components/Sidebar.js` + `src/components/AppsHub.js` (register via AppRegistry)
- Create: `src/lib/runtime/AppRegistry.js` (if not exists — extend or create thin registry on top of existing router patterns)
- Create: `src/lib/runtime/ExecutionRuntime.js` (thin facade if missing — reuse existing WorkflowEngine + Persistence)
- Modify: `netlify.toml` and `vite.config.js` (remove proxies for these 6 after native works)
- Create: `src/lib/runtime/RuntimeAdapterBase.js` (abstract base class for all 6 adapters)

**Per-App (example for ai-headshot-generator — repeat pattern for others):**
- Enhance: `/apps/ai-headshot-generator/` (new or extend if partial)
  - manifest.js (copy from src/apps/ai-headshot-generator/manifest.js + add runtime: true)
  - routes.js (copy + extend)
  - runtime/adapter.js (implements contract using previous services + shared kernel)
  - runtime/entry.runtime.js (mounts previous HeadshotStudio UI + runtime controls)
  - providers/headshotProvider.js (adapts previous headshotService + forces MuAPI/OpenAI)
  - workflows/headshotPipeline.js (uses existing WorkflowEngine)
  - tests/adapter.test.js + integration.test.js + e2e.spec.ts
- Enhance: `src/components/HeadshotStudio.js` (add runtime status bar, pause/resume, state restore — never delete old code)
- Enhance: `src/apps/ai-headshot-generator/services/headshotService.js` (keep as-is, import from providers/)
- Add tests in `tests/unit/` and `tests/e2e/`

Same pattern for:
- vibe-workflow (build on existing /apps/vibe-workflow/ + src/apps/vibe-workflow/ + WorkflowBuilderApp.js)
- open-pomelli (build on PomelliStudio.js + src/apps/open-pomelli/)
- videco-ai-platform (new under /apps/videco-ai-platform/)
- ai-vfx (build on AIVFXStudio.js + public/apps/ai-vfx/)
- videoremixai-vfx (consolidated into ai-vfx)

**Never touch (preservation):**
- Any existing file content that was part of the "shell" work (only append new functions/exports at the end or in new runtime/ subdirs).

---

## Phase 0: Foundation (Do This First — Shared by All 6 Apps)

### Task 0.1: Confirm Locked Stack Clients Are Available and Used

**Files:**
- Verify: `src/lib/muapi.js`, `src/lib/openaiService.js`, `src/lib/hybrid-supabase.js`, `src/lib/workflow/WorkflowEngine.ts`

- [ ] **Step 1: Run existing smoke test for stack**
  ```bash
  node -e "
    import('./src/lib/muapi.js').then(m => console.log('MuAPI OK'));
    import('./src/lib/openaiService.js').then(m => console.log('OpenAI OK'));
    import('./src/lib/hybrid-supabase.js').then(m => console.log('Supabase OK'));
  "
  ```
  Expected: All three "OK" printed, no errors.

- [ ] **Step 2: Commit**
  ```bash
  git commit -m "chore: confirm locked stack clients (OpenAI + MuAPI + Supabase) available for native adapters" --allow-empty
  ```

### Task 0.2: Create Runtime Adapter Base Class (Reusable by All 6)

**Files:**
- Create: `src/lib/runtime/RuntimeAdapterBase.js`

- [ ] **Step 1: Write failing test for base adapter contract**
  ```bash
  # tests/unit/runtime-adapter-base.test.js
  import { RuntimeAdapterBase } from '../../src/lib/runtime/RuntimeAdapterBase.js';
  test('must implement full contract', () => {
    const base = new RuntimeAdapterBase();
    expect(typeof base.execute).toBe('function');
    expect(typeof base.pause).toBe('function');
    // ... all 9 methods
  });
  ```

- [ ] **Step 2: Run test — must fail**
  Run: `npm run test:run tests/unit/runtime-adapter-base.test.js -t "must implement full contract"`
  Expected: FAIL (file or class not found)

- [ ] **Step 3: Write minimal base class**
  ```js
  // src/lib/runtime/RuntimeAdapterBase.js
  import { WorkflowEngine } from '../workflow/WorkflowEngine.ts';
  // import other shared singletons (PersistenceLayer, ProviderRegistry, etc.)

  export class RuntimeAdapterBase {
    constructor(options = {}) {
      this.executionId = null;
      this.state = 'idle';
      this.workflow = new WorkflowEngine();
      this.stack = { llm: 'openai', generation: 'muapi', storage: 'supabase' };
    }
    async execute(input, context) { throw new Error('Must implement in subclass'); }
    async pause(executionId) { this.state = 'paused'; }
    async resume(executionId) { this.state = 'running'; }
    async cancel(executionId) { this.state = 'cancelled'; }
    async recover(snapshot) {}
    serialize() { return { id: this.executionId, state: this.state }; }
    deserialize(data) { Object.assign(this, data); }
    subscribe(events, cb) {}
    unsubscribe(events, cb) {}
    getExecutionState() { return { id: this.executionId, state: this.state, stack: this.stack }; }
  }
  ```

- [ ] **Step 4: Run test — must pass**
  Run the same test command. Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/lib/runtime/RuntimeAdapterBase.js tests/unit/runtime-adapter-base.test.js
  git commit -m "feat(runtime): add RuntimeAdapterBase with full contract + stack lock"
  ```

### Task 0.3: Update Router to Support Native Runtime Mounting (Additive)

**Files:**
- Modify: `src/lib/router.js` (around the 'ai-headshot', 'pomelli-studio', 'workflow-studio' entries)

- [ ] **Step 1: Add test for new native route loader**
  (Create or extend `tests/unit/router.unit.spec.ts`)

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Add the loader (example)**
  ```js
  // in pageLoaders object — additive, never remove old entries
  'ai-headshot-generator': () => import('/apps/ai-headshot-generator/runtime/entry.runtime.js')
    .then(m => m.mountNative(contentArea, { legacyFallback: () => import('../components/HeadshotStudio.js') })),
  'videco-ai-platform': () => import('/apps/videco-ai-platform/runtime/entry.runtime.js').then(m => m.mountNative(contentArea)),
  // repeat for the other 4
  ```

- [ ] **Step 4: Run router tests — all pass**

- [ ] **Step 5: Commit**

(Repeat similar additive pattern for Sidebar.js and AppsHub.js registration using the manifests.)

---

## Phase 1: ai-headshot-generator (Easiest — Start Here)

**Builds directly on:**
- `src/apps/ai-headshot-generator/manifest.js`
- `src/apps/ai-headshot-generator/services/headshotService.js`
- `src/components/HeadshotStudio.js`
- Existing headshot presets in `src/lib/headshotPresets.js` and `src/lib/headshotPromptBuilder.js`

### Task 1.1: Create /apps/ai-headshot-generator/ Structure + Manifest (Copy + Extend)

- [ ] Copy manifest + extend with runtime flag
- [ ] Create runtime/adapter.js that extends RuntimeAdapterBase and calls the previous headshotService through MuAPI only
- [ ] Create runtime/entry.runtime.js that mounts the previous HeadshotStudio UI + adds execution status + pause/resume buttons + session restore
- Write TDD tests for the adapter (execute headshot gen → MuAPI call → realtime progress → persistence snapshot → handoff)

(Each step has failing test → run → implement minimal using previous service → run → commit)

### Task 1.2: Full Execution Pipeline + Recovery Test for Headshots

- Implement the 12-stage pipeline in the adapter using existing muapi + supabase + WorkflowEngine for batch presets.
- Add recovery test: kill mid-generation, recover from Supabase snapshot, continue.

---

## Phase 2–6: Repeat the Exact Same Pattern for the Other 5 Apps

**Order (easiest to hardest):**
2. vibe-workflow (already has good node editor in /apps/vibe-workflow/src/main.js + services)
3. open-pomelli (build on PomelliStudio.js + previous services)
4. ai-vfx (build on AIVFXStudio.js + effects logic)
5. videco-ai-platform (new — port video gen + timeline features using existing timeline-editor components)
6. videoremixai-vfx (consolidated into ai-vfx)

For each:
- Same file structure
- Adapter that forces locked stack (OpenAI + MuAPI + Supabase)
- UI starts from the previous shell component as the visual base
- Full TDD for contract + pipeline + recovery + handoff to timeline/library
- E2E test extending the existing *-full.spec.js files

---

## Phase 7: Global Integration & Validation

### Task 7.1: Remove Proxies for the 6 (After Native Works)

- Modify vite.config.js proxy section — comment out the 6 entries (additive comment)
- Update netlify.toml if needed
- Run full `npm run test:run`
- Manual verification in browser: navigate to each, start execution, see realtime, pause, refresh, restore state, handoff asset.

### Task 7.2: Final Cross-App Handoff Test (pomelli → vibe → videco)

Use/extend the existing `tests/e2e/asset-pipeline-handoff.e2e.spec.ts`

### Task 7.3: Documentation + Cleanup

- Update APP_INTEGRATION_DOCS.md and ALL_APPS_COMPLETE_DOCS.md (additive sections)
- Update AGENTS.md testing coverage table if needed
- Final commit with message referencing the spec

---

## Validation Gates (Must Pass Before Any Claim of Completion)

1. `npm run test:run` — zero failures (unit + integration + e2e + stress)
2. All 6 apps load via native runtime mount (no iframe in primary path)
3. Every execution for the 6 uses ONLY OpenAI + MuAPI + Supabase (verify in network tab + logs)
4. Session restore + recovery + realtime progress work for at least one complex flow per app
5. Zero deletions in git diff of previous shell files
6. `npm run build` succeeds
7. Manual end-to-end of the required features listed in the original task for each app

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-22-full-runtime-native-apps-conversion.md`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** — I will dispatch a fresh subagent per task (or per app), review output between tasks, use the subagent-driven-development skill for fast safe iteration.

2. **Inline Execution** — Execute the tasks in this session using the executing-plans skill with checkpoints.

**Which approach do you want me to use to complete the work?** (Reply with 1 or 2, or "start with foundation then ask per phase") 

I will not write any app code until you choose and I load the corresponding execution skill. All changes will be TDD, committed frequently, and always on top of the preserved shell foundation. The locked stack will be enforced in every provider/adapter. 

Ready to execute when you give the word.