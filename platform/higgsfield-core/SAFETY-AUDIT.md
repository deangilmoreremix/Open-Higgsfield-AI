# Pre-Migration Safety Baseline — 2026-05-23

## Validation Results
```
npm warn Unknown project config "always-auth". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> open-generative-ai@1.0.0 apps:validate
> node scripts/validate-apps.mjs

Validating 5 apps in src/apps/...

❌ agents: shell
   Issues: Missing FEATURE_CHECKLIST.md, Detected as shell app (placeholder, missing services/handlers/output logic)
❌ ai-vfx: shell
   Issues: Missing FEATURE_CHECKLIST.md, Missing required folder: components/, Missing required folder: services/, Missing required folder: assets/, Detected as shell app (placeholder, missing services/handlers/output logic)
❌ design-agent: shell
   Issues: Missing FEATURE_CHECKLIST.md, Detected as shell app (placeholder, missing services/handlers/output logic)
❌ marketing-studio: shell
   Issues: Missing FEATURE_CHECKLIST.md, Missing required folder: components/, Missing required folder: services/, Missing required folder: assets/, Detected as shell app (placeholder, missing services/handlers/output logic)
❌ workflows: shell
   Issues: Missing FEATURE_CHECKLIST.md, Missing required folder: components/, Missing required folder: services/, Missing required folder: assets/, Detected as shell app (placeholder, missing services/handlers/output logic)
```
**Exit code: 0** (script completed; reports current state of placeholder apps)

## Audit Results
```
npm warn Unknown project config "always-auth". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> open-generative-ai@1.0.0 apps:audit
> node scripts/audit-shell-apps.mjs

Audit complete. Reports written to shell-app-audit.md and .json
```
**Exit code: 0**

**Note:** This run created `shell-app-audit.md` and `shell-app-audit.json` in the project root (pre-existing behavior of the audit script). These document 5 apps as "partial" status.

## Test Results (`npm run test:run -- --passWithNoTests`)
Command was executed but produced extremely large output (862+ lines captured before truncation) and was terminated by the execution environment after 120s timeout.

**Key observations from captured output:**
- Vitest discovered and executed tests from `node_modules` inside subdirectories (e.g. `modules/CineGen/node_modules/zod/...`, `apps/ai-headshot-generator/node_modules/...`) despite `exclude: ['node_modules/**']` in vitest.config.js. This is a pre-existing configuration/performance issue causing slow runs and timeouts.
- Multiple test failures visible:
  - `tests/unit/multi-clip-drag-feedback.unit.spec.ts`: `module2.MultiClipDragFeedback is not a constructor` (multiple tests)
  - `tests/unit/muapi-edge-cases.spec.js`: 26 failed (JSON parse errors in SecurityService, "MuAPI key not configured", expectation mismatches on error messages, etc.)
  - Various other unit tests in timeline, router, etc. showed issues in the partial run.
- Many passing tests from dependencies (zod, etc.) and some project tests.
- No final summary (numPassed/numFailed) was reached due to timeout and kill.
- The `--passWithNoTests` flag was passed but irrelevant as tests were found.

**Conclusion:** The full `npm run test:run` does not complete cleanly in reasonable time and the suite contains pre-existing failures. This is documented as part of the baseline.

## Running Processes (at time of audit - 2026-05-23)
- **Next.js dev (npm run dev)**: http://localhost:3000 (marketing + legacy routes)
  - Was already running (PID 48581, next-server v15.5.18)
  - `curl http://localhost:3000/` → 200 OK (healthy)
- **Vite dev (npm run dev:vite)**: http://localhost:8080 (current hash-router shell)
  - Started during this audit in background (main PID 76033, node child 76049)
  - `curl http://localhost:8080/` → 200 OK
  - Startup: "VITE v7.3.3 ready in 2118 ms"
  - **⚠️ Non-fatal startup error logged**:
    ```
    (!) Failed to run dependency scan. Skipping dependency pre-bundling.
    ✘ [ERROR] Missing "./all" specifier in "react-icons" package
      src/components/VidecoOutreachApp.tsx:34:108
    ```
  - Server still serves successfully despite the esbuild/vite dep-scan error (pre-existing code issue in VidecoOutreachApp).

**Note:** Per instructions, no running processes were killed. The Vite instance was started via `nohup` + background for verification and left running (PID noted in /tmp logs if needed).

## Critical Paths That Must Remain Untouched
- `/app/**` (Next.js app router)
- `/src/**` (legacy Vite components & router)
- root `vite.config.js`, `next.config.mjs`, `package.json` scripts
- All `apps/` subdirectories
- `tests/`, `components/`, `packages/`, etc. (any existing app code)

**Any task that would modify the above is FORBIDDEN in this plan.**

## Additional Safety Audit Findings
- All 5 "apps" under `src/apps/` (agents, ai-vfx, design-agent, marketing-studio, workflows) are currently identified by validation tools as **shell/placeholder** implementations:
  - Missing `FEATURE_CHECKLIST.md`
  - Missing key folders (`components/`, `services/`, `assets/`, `index.js`)
  - Status: "partial" per audit report
- The `shell-app-audit.*` reports were generated by the audit script (now present in root).
- Vite dev server has a broken import (`react-icons/all` which no longer exists in recent react-icons).
- Test infrastructure has discovery bloat and multiple failing tests (pre-existing, not introduced by this task).
- No files outside `platform/higgsfield-core/` were created or modified by the Implementer except for the expected side-effect files from `apps:audit` script and the temporary `/tmp/vite-dev-startup.log`.
- `.gitignore` was inspected — no changes needed or made (new platform/ dir should be tracked).

## Directory Created
```
platform/higgsfield-core/
├── README.md          # Sentinel: "# Higgsfield Core 2.0 — DO NOT DELETE THIS DIRECTORY"
└── SAFETY-AUDIT.md    # This file (created after successful validation runs)
```

This document captures the **irrefutable pre-migration baseline** of the entire Higgsfield application state as of 2026-05-23 before any work begins in `platform/higgsfield-core/`.

## Git Working Tree State at Time of Baseline (Critical)
**WARNING: The repository working tree was NOT clean at the start of Task 0.**

- `git status --short` showed 79 changed files (2613 insertions, 2106 deletions)
- 413 untracked files
- Examples of modifications/deletions (pre-dating this audit):
  - Deleted: `app/apps/[appId]/...` pages, `src/apps/ai-headshot-generator/*` (entire old app), `src/apps/open-pomelli/*`, `src/apps/remix-go/*`, `src/apps/vibe-workflow/*`, public/apps/*/assets/*.js.map
  - Modified: `app/layout.js`, `app/page.js`, `app/studio/...`, `app/workflow/...`, `package.json`, `vite.config.js`, `src/apps/agents/index.jsx`, `src/apps/marketing-studio/*`, `src/components/*` (many), `src/lib/*` (many), `src/main.js`, `src/lib/router.js`, etc.
  - Also: `modules/CineGen` (submodule?), `pnpm-lock.yaml`, `.devcontainer/...`
- New untracked include: many in `src/forge/`, `src/kernel/`, `src/lib/execution-*`, `tests/operational/`, `tests/forge/`, `apps/ai-video-outreach/`, `apps/studio-app/`, `apps/videco-ai-platform/`, `platform/` (ours), docs, netlify/functions, etc.

**Interpretation:**
This indicates the repository was already in an advanced state of refactoring/migration (e.g., extracting apps to top-level `apps/` directory, removing old stubs from `src/apps/` and `app/apps/`, adding new runtime/kernel/forge code, etc.) *before* this official "Task 0: Safety Audit" was executed.

The validation/audit/test commands were run against this dirty state. The SAFETY-AUDIT.md and the two shell-app-audit reports are the *only* files created/modified *by this task's actions* (the shell reports are intentional side-effects of `npm run apps:audit`).

No source code in critical paths was edited by the Implementer during Task 0. All observed changes pre-existed.

**Recommendation for migration plan:** The "baseline" here is a snapshot of an *already evolving* codebase. Future tasks must be extra careful; consider committing or stashing the current dirty state before proceeding with Core 2.0 work to have a truly clean diff baseline.

## Final Status
**Status of this Task 0:** DONE_WITH_CONCERNS

- Validations ran and outputs captured (apps:validate/audit exit 0; tests have pre-existing failures + discovery bloat).
- Dev servers verified (both respond 200; one pre-existing, one started in bg with noted non-fatal error).
- `platform/higgsfield-core/` created cleanly with README + this SAFETY-AUDIT.md.
- **Major concern:** Dirty git tree with substantial prior uncommitted changes means this is not a "pristine pre-migration" snapshot. The user directive "make sure we do not break any of the apps that are already on higgsfield" must account for the fact that the "already on higgsfield" state itself appears mid-refactor.
- No violations of "never touch existing code" occurred in this task.
