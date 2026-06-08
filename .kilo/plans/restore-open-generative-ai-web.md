# Plan: Build Web Version of Open-Generative-AI & Integrate as Standalone Monorepo Apps

## Goal
We are building the **web version** of Open-Generative-AI (not Electron). The upstream repository (`external-repos/Open-Generative-AI`, which is a git submodule of `apps/open-generative-ai`) has its workspace submodules uninitialized, so Next.js dev cannot start. We need to fix this and wire the app into the Higgsfield monorepo so all 13 featured studios (Image, Video, Audio, LipSync, Cinema, Workflows, Agents, Design, MCP/CLI, Marketing, etc.) run as standalone apps.

---

## Current State (read-only audit)

### `apps/open-generative-ai` — broken / incomplete
| File | Status |
|---|---|
| `package.json` | **WRONG** — manually changed to Vite + React 18 + Chakra. Upstream is Next.js + workspaces. |
| `node_modules` | Present but built for wrong config |
| `app/` directory | Present (Next.js App Router source), but not wired up |
| `packages/studio` | Present; exists at root `packages/studio` too |
| `packages/Vibe-Workflow` | **EMPTY** (git submodule not initialized) |
| `packages/Open-Poe-AI` | **EMPTY** (git submodule not initialized) |
| `packages/Open-AI-Design-Agent` | **EMPTY** (git submodule not initialized) |
| `next.config.mjs` | Present but with wrong workspace names |
| `vite.config.mjs` | Present (from wrong Vite config) |
| `electron/` | Present but excluded from web plan |

### Other relevant apps (already working standalone-ish)
| App | Tech | Notes |
|---|---|---|
| `apps/studio-app` | Vite + React 18 + Chakra | Local `ImageStudio`, `VideoStudio`, `LipSyncStudio`, `CinemaStudio` in `src/components/` |
| `apps/workflow-app` | Vite + React 18 | Standalone workflow UI |
| `apps/agents-app` | Vite + React 18 | Standalone agents UI |
| `apps/vibe-workflow` | Vite + React 18 + Chakra + Supabase | Hosts workflow engine |
| `apps/marketing-studio` | Vite + React 18 + Chakra + Supabase | Marketing Studio |
| `packages/studio` (root) | Custom local package | Root-level studio package with its own `src/models.js`, `src/muapi.js` |

### Upstream `Open-Generative-AI` architecture (from `external-repos/`)
```
Open-Generative-AI/
├── app/                   # Next.js App Router
│   └── studio/[[...slug]]/page.js   # Multiplexes studios via slug
├── packages/
│   └── studio/
│       └── src/
│           ├── index.js                    # Exports ImageStudio, VideoStudio, LipSyncStudio...
│           ├── models.js                   # 200+ model definitions (single source of truth)
│           ├── muapi.js                    # API client
│           └── components/
│               ├── ImageStudio.jsx         # Dual-mode t2i/i2i
│               ├── VideoStudio.jsx         # Dual-mode t2v/i2v
│               ├── LipSyncStudio.jsx       # Portrait/video + audio → talking video
│               ├── CinemaStudio.jsx        # Pro camera controls
│               ├── AudioStudio.jsx         # Audio generation
│               ├── WorkflowStudio.jsx      # Node-based workflow builder & playground
│               └── McpCliStudio.jsx        # MCP & CLI
└── next.config.mjs        # transpilePackages: ['studio','workflow-builder','ai-agent','design-agent']
```

### Mapping upstream apps → Higgsfield monorepo apps
| Upstream Feature | Higgsfield App |
|---|---|
| Image Studio, Video Studio, Lip Sync Studio, Cinema Studio, Audio Studio | `apps/open-generative-ai` (via `packages/studio`) + `apps/studio-app` (local mirrors) |
| Workflow Studio | `apps/open-generative-ai` (via `packages/Vibe-Workflow`) |


| Agents, Design Agent | `apps/open-generative-ai` (via `packages/Open-Poe-AI`, `packages/Open-AI-Design-Agent`) |
| Marketing Studio | `apps/marketing-studio` (existing) |
| Vibe Motion | `apps/vibe-workflow` (existing) |
| MCP & CLI | `apps/open-generative-ai` (via `McpCliStudio.jsx`) |
| AI Clipping | `apps/studio-app` / `apps/workflow-app` |

---

## Plan Steps

### Step 1: Restore `apps/open-generative-ai/package.json` to upstream Next.js config
Replace the wrong Vite config with upstream's Next.js config, but adapted for this monorepo context:
- Use `workspaces: ["./packages/studio", "./packages/Vibe-Workflow/packages/workflow-builder", "./packages/Open-Poe-AI/packages/agents", "./packages/Open-AI-Design-Agent/packages/design-agent"]`
- Scripts: `dev` → `next dev`, `build` → `next build`, `setup` → submodule init + npm install + build:packages
- Add `electron:dev` script (kept as reference, not recommended)
- Include Electron deps (`electron`, `electron-builder`) as devDependencies for parity with upstream
- Add workspace deps: `studio`, `workflow-builder`, `ai-agent`, `design-agent`

### Step 2: Fix `apps/open-generative-ai/next.config.mjs`
Update to transpile the correct workspace packages and add webpack fallbacks for the studio library:
```js
transpilePackages: ['studio', 'workflow-builder', 'ai-agent', 'design-agent']
```
Add polyfills/fallbacks for `fs`, `net`, `tls` (client-side only) and alias any lib paths.

### Step 3: Initialize git submodules in `apps/open-generative-ai`
Run `git submodule update --init --recursive` inside `apps/open-generative-ai/` to checkout:
- `packages/Vibe-Workflow` (from `https://github.com/SamurAIGPT/Vibe-Workflow.git`)
- `packages/Open-Poe-AI` (from `https://github.com/Anil-matcha/Open-Poe-AI.git`)
- `packages/Open-AI-Design-Agent` (from `https://github.com/Anil-matcha/Open-AI-Design-Agent.git`)

### Step 4: Restore root-level `packages/studio` compatibility
The `apps/open-generative-ai` upstream references its **own** `packages/studio` (different content than root `packages/studio`). We need both to coexist:
- Keep `packages/studio` at root as-is (used by the main Higgsfield app)
- Ensure `apps/open-generative-ai/packages/studio` builds independently
- Add monorepo-level config if needed (pnpm workspace layout)

### Step 5: Add root-level workspace config for `apps/open-generative-ai`
Update `pnpm-workspace.yaml` to include `!apps/open-generative-ai/packages/Vibe-Workflow/**` etc. as nested workspace members, OR document that `apps/open-generative-ai` runs as an **isolated workspace** with its own npm workspaces (like upstream — option B recommended for isolation).

**Recommended: Isolated workspace approach**  
Run `apps/open-generative-ai` as an independent npm workspace (like upstream monolithic repo). This avoids PNPM dedupe conflicts between root workspace packages and upstream submodule packages. The Higgsfield `package.json` already excludes `apps/vimax/**` — we can add workspace-run scripts that delegate into the subdirectory.

### Step 6: Add root-level convenience scripts
Add to root `package.json`:
```json
{
  "scripts": {
    "openai:setup": "cd apps/open-generative-ai && git submodule update --init --recursive && npm install && npm run build:packages",
    "openai:dev": "cd apps/open-generative-ai && npm run dev",
    "openai:build": "cd apps/open-generative-ai && npm run build",
    "openai:electron:dev": "cd apps/open-generative-ai && npm run electron:dev"
  }
}
```

### Step 7: Document the 13-app monorepo structure
Write `docs/OPEN-GENERATIVE-AI-APPS.md` describing each app, its entrypoint, dev command, and relationship to Open Generative AI upstream:
- `apps/open-generative-ai` → full web build (Image, Video, Audio, LipSync, Cinema, Workflows, Agents, Design, MCP)
- `apps/studio-app` → standalone local studio
- `apps/workflow-app` → standalone local workflow
- `apps/agents-app` → standalone local agents
- `apps/marketing-studio` → standalone marketing
- `apps/vibe-workflow` → standalone vibe workflow engine

---

## Out of Scope
- Electron build/packaging (user explicitly excluded)
- Changing root `packages/studio` internals
- Migrating other apps to Next.js

---

## Verification Plan
1. `cd apps/open-generative-ai && git submodule update --init --recursive && npm install && npm run build:packages`
2. `cd apps/open-generative-ai && npm run dev` → should open on `http://localhost:3000`
3. Navigate to `/studio` → should render StandaloneShell with Image, Video, LipSync, Cinema, Workflow tabs
4. Root-level: `npm run openai:dev` should proxy into `apps/open-generative-ai`
