# Full-App Consolidation: Replace Shell Apps with Standalone Repo Clones

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** For each of the 9 GitHub repos, clone/fork it into `apps/<slug>/` as a standalone app, wire it via iframe + proxy + SPA redirects, and remove duplicate shell implementations and stale configs so the main SPA routes to the full app instead of a shell.

**Architecture:** Standalone Next.js/Vite apps cloned to `apps/<slug>/`, proxied via `vite.config.js` to localhost during dev, built to `public/apps/<slug>/` for production, and served via iframe `<Slug>Page.js` components. Router updated to route all aliases (e.g., `headshots`, `ai-headshot`) to the iframe page, never to shell components. `build:all` updated to include all 9 apps; dead scripts and duplicate shells removed.

**Tech Stack:** pnpm workspaces, Vite dev server, Next.js standalone exports, Netlify `_redirects` / `[[redirects]]`, Supabase edge functions, SPA iframe pattern.

---

## Pre-Check: Repository Audit

Before starting, verify which of the 9 repos are actually missing vs. present in `apps/`:

```bash
cd /workspace/0c85e0dc-1244-40ab-8f84-e11668f857da/sessions/agent_69c19383-fada-489b-b9c7-d387fa23f720

# Check which app dirs exist
for app in open-pomelli vibe-workflow videco_ai_platform ai-headshot-generator ai-vfx; do
  if [ -d "apps/$app" ]; then echo "EXISTS: apps/$app"; else echo "MISSING: apps/$app"; fi
done

# Check public/apps/ built artifacts
for app in open-pomelli vibe-workflow videco-ai-platform ai-headshot-generator ai-vfx; do
  if [ -d "public/apps/$app" ]; then echo "HAS BUILD: public/apps/$app"; else echo "NO BUILD: public/apps/$app"; fi
done
```

Document output for decision-making below.

---

## Decision Table: Canonical Source Per App

| # | App Name | Canonical GitHub URL (fork to use) | Reason |
|---|----------|-----------------------------------|--------|
| 1 | Open-Pomelli | `https://github.com/deangilmoreremix/Open-Pomelli.git` | Primary developer fork |
| 2 | Vibe-Workflow | `https://github.com/deangilmoreremix/Vibe-Workflow.git` | Primary developer fork |
| 3 | videco_ai_platform | `https://github.com/ZapDigits/videco_ai_platform.git` | ZapDigits is upstream; use as benchmark but deangilmoreremix fork for any local mods |
| 4 | ai-headshot-generator | `https://github.com/SamurAIGPT/ai-headshot-generator.git` | Has Vercel hosted live demo; used in AppsStudio.jsx |
| 5 | videoremixai-vfx (AI-VFX) | `https://github.com/deangilmoreremix/videoremixai-vfx.git` | Primary developer fork; avoids duplicate with SamurAIGPT/AI-VFX |

**Note on videco_ai_platform:** The plan doc says "treat as UX benchmark only" — if full integration is not needed, skip cloning `videco_ai_platform` and leave the dead shell `VidecoAIPlatformPage.js`. If full integration IS needed, clone `ZapDigits/videco_ai_platform`.

**Note on AI-VFX:** `deangilmoreremix/videoremixai-vfx` and `SamurAIGPT/AI-VFX` are different repos. Use deangilmoreremix (videoremixai-vfx) as canonical to match the `.gitmodules` history. Do NOT clone both.

---

## Task 1: Backup & Snapshot

**Files:**
- Create: `docs/superpowers/plans/YYYY-MM-DD-full-app-consolidation-backup.md`

- [ ] **Step 1: Document current state**

```bash
# Capture git status, submodule state, and all app references
git status > /tmp/pre-consolidation-git-status.txt
git submodule status >> /tmp/pre-consolidation-git-status.txt
echo "=== apps/ directory ===" >> /tmp/pre-consolidation-git-status.txt
ls -la apps/ >> /tmp/pre-consolidation-git-status.txt 2>/dev/null || echo "apps/ not found" >> /tmp/pre-consolidation-git-status.txt
echo "=== public/apps/ directory ===" >> /tmp/pre-consolidation-git-status.txt
ls -la public/apps/ >> /tmp/pre-consolidation-git-status.txt 2>/dev/null || echo "public/apps/ not found" >> /tmp/pre-consolidation-git-status.txt
```

- [ ] **Step 2: Commit any pending changes**

```bash
git add -A
git commit -m "chore: pre-consolidation snapshot before full-app shell replacement"
```

---

## Task 2: Clone Missing Apps

**Files:**
- Create: `apps/open-pomelli/` (from git)
- Create: `apps/vibe-workflow/` (already exists — verify contents)
- Create: `apps/ai-headshot-generator/` (from git — NEXT.js app)
- Create: `apps/ai-vfx/` (from git — may have partial content)
- Create: `apps/videco-ai-platform/` (conditionally — see decision table)

- [ ] **Step 1: Clone Open-Pomelli**

```bash
cd /workspace/0c85e0dc-1244-40ab-8f84-e11668f857da/sessions/agent_69c19383-fada-489b-b9c7-d387fa23f720
# Only clone if missing
if [ ! -d "apps/open-pomelli" ] || [ -z "$(ls -A apps/open-pomelli 2>/dev/null)" ]; then
  git clone https://github.com/deangilmoreremix/Open-Pomelli.git apps/open-pomelli
else
  echo "apps/open-pomelli already exists, skipping clone"
fi
```

- [ ] **Step 2: Clone Vibe-Workflow (if missing or empty)**

```bash
if [ ! -d "apps/vibe-workflow" ] || [ -z "$(ls -A apps/vibe-workflow 2>/dev/null)" ]; then
  git clone https://github.com/deangilmoreremix/Vibe-Workflow.git apps/vibe-workflow
else
  echo "apps/vibe-workflow already exists, checking for package.json..."
  if [ ! -f "apps/vibe-workflow/package.json" ]; then
    echo "Empty/incomplete, re-cloning"
    rm -rf apps/vibe-workflow
    git clone https://github.com/deangilmoreremix/Vibe-Workflow.git apps/vibe-workflow
  fi
fi
```

- [ ] **Step 3: Clone ai-headshot-generator**

```bash
if [ ! -d "apps/ai-headshot-generator" ] || [ -z "$(ls -A apps/ai-headshot-generator 2>/dev/null)" ]; then
  git clone https://github.com/SamurAIGPT/ai-headshot-generator.git apps/ai-headshot-generator
else
  echo "apps/ai-headshot-generator already exists, skipping clone"
fi
```

- [ ] **Step 4: Clone ai-vfx (videoremixai-vfx)**

```bash
if [ ! -d "apps/ai-vfx" ] || [ -z "$(ls -A apps/ai-vfx 2>/dev/null)" ]; then
  git clone https://github.com/deangilmoreremix/videoremixai-vfx.git apps/ai-vfx
else
  echo "apps/ai-vfx already exists, skipping clone"
fi
```

- [ ] **Step 5 (conditional): Clone videco_ai_platform**

```bash
# Only clone if the decision is to integrate fully
# If treating as benchmark only, skip this step and the videco tasks later
if [ CONDITION_FORK_NEEDED == "yes" ]; then
  if [ ! -d "apps/videco-ai-platform" ] || [ -z "$(ls -A apps/videco-ai-platform 2>/dev/null)" ]; then
    git clone https://github.com/ZapDigits/videco_ai_platform.git apps/videco-ai-platform
  fi
fi
```

- [ ] **Step 6: Commit cloned sources**

```bash
git add apps/open-pomelli apps/vibe-workflow apps/ai-headshot-generator apps/ai-vfx
git commit -m "feat: clone full app sources for Open-Pomelli, Vibe-Workflow, ai-headshot-generator, ai-vfx"
```

---

## Task 3: Fix Duplicate Supabase Migrations (Open-Pomelli)

**Files:**
- Modify: `supabase/migrations/20260511_open_pomelli_tables.sql`
- Modify: `supabase/migrations/20260518000000_pomelli_brand_studio_schema.sql`

**Decision:** Audit both schema files. Choose the newer schema (`pomelli_brand_studio_schema.sql`) as canonical. Drop the older `brand_dna`, `campaign`, `photoshoot`, `animation` tables in favor of `pomelli_brand_profiles`, `pomelli_campaigns`, `pomelli_assets`, `pomelli_generations`. Ensure edge functions reference only the newer schema.

- [ ] **Step 1: Read both migration files and compare table structures**

```bash
cat supabase/migrations/20260511_open_pomelli_tables.sql
echo "---"
cat supabase/migrations/20260518000000_pomelli_brand_studio_schema.sql
```

- [ ] **Step 2: Determine which schema to keep**

If newer schema covers all required features (brand DNA, campaigns, photoshoots, animations), keep only the newer one. Mark the older as superseded.

- [ ] **Step 3: If needed, create a migration to drop old tables**

```sql
-- Only if old tables conflict with new schema
DROP TABLE IF EXISTS brand_dna;
DROP TABLE IF EXISTS campaign;
DROP TABLE IF EXISTS photoshoot;
DROP TABLE IF EXISTS animation;
```

Save as `supabase/migrations/YYYYMMDD_consolidate_pomelli_schema.sql`.

- [ ] **Step 4: Verify edge functions use consistent schema**

```bash
grep -r "brand_dna\|campaign\|photoshoot\|animation" supabase/functions/
```

If found, update to use new table names.

- [ ] **Step 5: Commit schema consolidation**

```bash
git add supabase/migrations/
git commit -m "fix: consolidate Open-Pomelli DB schemas, keep only newer pomelli_* tables"
```

---

## Task 4: Update Root `package.json` Build Scripts

**Files:**
- Modify: `package.json:22-82`

**Goal:** Fix all broken `build:<slug>` scripts. The current issues:
- `build:vibe-workflow` targets `apps/vibe-workflow/client` + `out/` which doesn't exist
- `build:ai-headshot-generator` targets missing `apps/ai-headshot-generator/`
- `build:ai-vfx` referenced but not defined
- `build:videco-ai-platform` references missing dir

- [ ] **Step 1: Audit each app's build system**

```bash
# Check each cloned app's build system
for app in open-pomelli vibe-workflow ai-headshot-generator ai-vfx videco-ai-platform; do
  echo "=== $app ==="
  if [ -f "apps/$app/package.json" ]; then
    grep -E '"build"|"dev"|"scripts"' apps/$app/package.json | head -5
  else
    echo "No package.json"
  fi
done
```

- [ ] **Step 2: Categorize by framework**

| App | Framework | Build Command | Output Dir | Dev Port |
|-----|-----------|--------------|------------|----------|
| open-pomelli | Next.js | `next build` | `.next/standalone` | 3000 |
| vibe-workflow | Vite | `vite build` | `dist/` | 5173 |
| ai-headshot-generator | Next.js | `next build` | `.next/standalone` | 3003 |
| ai-vfx | Vite/React | `vite build` | `dist/` | 5174 |
| videco-ai-platform | Next.js | `next build` | `.next/standalone` | 3002 |

- [ ] **Step 3: Write corrected build scripts**

Replace the broken scripts in `package.json` with:

```json
"build:open-pomelli": "cd apps/open-pomelli && pnpm run build && mkdir -p ../../public/apps/open-pomelli && cp -r .next/standalone/* ../../public/apps/open-pomelli/ && cp server.js ../../public/apps/open-pomelli/ 2>/dev/null || true",
"build:vibe-workflow": "cd apps/vibe-workflow && pnpm run build && mkdir -p ../../public/apps/vibe-workflow && cp -r dist/* ../../public/apps/vibe-workflow/",
"build:ai-headshot-generator": "cd apps/ai-headshot-generator && pnpm run build && mkdir -p ../../public/apps/ai-headshot-generator && cp -r .next/standalone/* ../../public/apps/ai-headshot-generator/ && cp server.js ../../public/apps/ai-headshot-generator/ 2>/dev/null || true",
"build:ai-vfx": "cd apps/ai-vfx && pnpm run build && mkdir -p ../../public/apps/ai-vfx && cp -r dist/* ../../public/apps/ai-vfx/",
"build:videco-ai-platform": "cd apps/videco-ai-platform && pnpm run build && mkdir -p ../../public/apps/videco-ai-platform && cp -r .next/standalone/* ../../public/apps/videco-ai-platform/ && cp server.js ../../public/apps/videco-ai-platform/ 2>/dev/null || true",
```

- [ ] **Step 4: Update `build:all` script**

```json
"build:all": "npm run build:open-pomelli && npm run build:vibe-workflow && npm run build:ai-headshot-generator && npm run build:ai-vfx && npm run build:videco-ai-platform && npm run build:marketing-studio && npm run build:workflows && npm run build:agents && npm run build:assistant-app && npm run build:workflow-app && npm run build:agents-app && npm run build:studio-app && npm run build",
```

- [ ] **Step 5: Add dev scripts**

```json
"dev:open-pomelli": "cd apps/open-pomelli && pnpm run dev",
"dev:vibe-workflow": "cd apps/vibe-workflow && pnpm run dev",
"dev:ai-headshot-generator": "cd apps/ai-headshot-generator && pnpm run dev",
"dev:ai-vfx": "cd apps/ai-vfx && pnpm run dev",
"dev:videco-ai-platform": "cd apps/videco-ai-platform && pnpm run dev",
```

- [ ] **Step 6: Commit updated package.json**

```bash
git add package.json
git commit -m "fix: update build and dev scripts for all cloned full apps"
```

---

## Task 5: Fix Vite Proxies

**Files:**
- Modify: `vite.config.js:109-126`

**Goal:** Ensure all 5 apps have correct proxies. Update ports to match each app's dev server port.

- [ ] **Step 1: Read current proxies section**

```js
proxy: {
  "/api": { target: ..., rewrite: (path) => path.replace(/^\/api/, "") },
  "/apps/videco-ai-platform": { target: "http://localhost:3002", ... },
  "/apps/ai-headshot-generator": { target: "http://localhost:3003", ... }
}
```

- [ ] **Step 2: Add missing proxies**

Add entries for open-pomelli (3000), vibe-workflow (5173), ai-vfx (5174):

```js
"/apps/open-pomelli": {
  target: "http://localhost:3000",
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/apps\/open-pomelli/, "")
},
"/apps/vibe-workflow": {
  target: "http://localhost:5173",
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/apps\/vite-workflow/, "")
},
"/apps/ai-vfx": {
  target: "http://localhost:5174",
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/apps\/ai-vfx/, "")
},
```

Also fix the vibe-workflow proxy (currently missing).

- [ ] **Step 3: Commit**

```bash
git add vite.config.js
git commit -m "fix: add vite proxies for all full apps (open-pomelli, vibe-workflow, ai-vfx)"
```

---

## Task 6: Create Iframe Page Components (One Per App)

**Files:**
- Create: `src/components/OpenPomelliPage.js` (or verify existing is correct)
- Create: `src/components/VibeWorkflowPage.js` (or verify existing is correct)
- Create: `src/components/AIHeadshotPage.js`
- Create: `src/components/AIVFXPage.js`
- Create: `src/components/VidecoAIPlatformPage.js`

**Goal:** Every app must have exactly ONE iframe page component following the secure pattern. Remove orphaned duplicate shells.

### Pattern for all iframe pages:

```js
// src/components/<AppName>Page.js
import { createSecureIframe } from "../lib/security/index.js";

export function <AppName>Page() {
  const container = document.createElement('div');
  container.className = 'w-full h-full relative';
  container.style.overflow = 'hidden';

  // Loading state
  const loadingContainer = document.createElement('div');
  loadingContainer.className = 'absolute inset-0 flex items-center justify-center bg-gray-50 z-10';
  loadingContainer.innerHTML = `
    <div class="text-center">
      <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-secondary">Loading <AppName>...</p>
    </div>
  `;
  container.appendChild(loadingContainer);

  // Error state container
  const errorContainer = document.createElement('div');
  errorContainer.className = 'absolute inset-0 flex items-center justify-center bg-gray-50 z-10 hidden';
  errorContainer.innerHTML = `
    <div class="text-center max-w-md mx-auto p-6">
      <h3 class="text-lg font-semibold mb-2"><AppName> Unavailable</h3>
      <p class="text-secondary mb-4">The application is currently unavailable.</p>
      <button class="px-4 py-2 bg-primary text-white rounded-lg" onclick="location.reload()">Retry</button>
    </div>
  `;
  container.appendChild(errorContainer);

  // Create secure iframe
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';

  const appPath = '/apps/<slug>/';
  const isDev = import.meta.env.DEV;

  if (isDev) {
    // Dev: proxy through vite to localhost
    iframe.src = appPath;
  } else {
    // Prod: use the static build
    iframe.src = appPath;
  }

  iframe.onload = () => {
    loadingContainer.remove();
    errorContainer.remove();
  };

  iframe.onerror = () => {
    loadingContainer.remove();
    errorContainer.classList.remove('hidden');
  };

  container.appendChild(iframe);

  // DEV MODE: fallback retry to specific localhost port
  if (isDev) {
    setTimeout(() => {
      if (loadingContainer.parentNode) {
        // Try alternative dev port
        const altIframe = document.createElement('iframe');
        altIframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
        altIframe.src = 'http://localhost:<DEV_PORT>';
        altIframe.onload = () => {
          container.innerHTML = '';
          container.appendChild(altIframe);
        };
      }
    }, 5000);
  }

  return container;
}
```

- [ ] **Step 1: Verify/create OpenPomelliPage.js**

```bash
# Check if OpenPomelliPage.js exists
ls -la src/components/OpenPomelliPage.js 2>/dev/null || echo "MISSING"
```

If missing, create it following the pattern above. If it exists but is orphaned (never routed), verify it follows the secure pattern and has proper loading/error states, then keep it.

- [ ] **Step 2: Verify/create VibeWorkflowPage.js**

```bash
ls -la src/components/VibeWorkflowPage.js 2>/dev/null || echo "MISSING"
```

- [ ] **Step 3: Create AIHeadshotPage.js** (since no good iframe page exists)

Create `src/components/AIHeadshotPage.js` following the pattern above. Point to `/apps/ai-headshot-generator/`.

- [ ] **Step 4: Create AIVFXPage.js**

Create `src/components/AIVFXPage.js` following the pattern above. Point to `/apps/ai-vfx/`.

- [ ] **Step 5: Verify/create VidecoAIPlatformPage.js**

```bash
ls -la src/components/VidecoAIPlatformPage.js 2>/dev/null || echo "MISSING"
```

If it exists but is orphaned, verify correctness.

- [ ] **Step 6: Commit**

```bash
git add src/components/OpenPomelliPage.js src/components/VibeWorkflowPage.js src/components/AIHeadshotPage.js src/components/AIVFXPage.js src/components/VidecoAIPlatformPage.js
git commit -m "feat: add/update iframe page components for all full apps"
```

---

## Task 7: Update Router to Route All Aliases to Iframe Pages

**Files:**
- Modify: `src/lib/router.js:34-110`

**Goal:** Ensure all route aliases for each app point to the iframe page component, NOT to shell components. For example:
- `headshots`, `ai-headshot` → `AIHeadshotPage.js` (iframe, not HeadshotStudio)
- `pomelli-studio` → `OpenPomelliPage.js` (iframe, not PomelliStudio)
- `ai-vfx` → `AIVFXPage.js` (iframe, not AIVFXStudio)
- `vibe-workflow` → `VibeWorkflowPage.js`

**Important:** The current router has many entries that point to shell components. These must be updated to point to iframe pages instead.

- [ ] **Step 1: Read current router pageLoaders section**

```bash
cat src/lib/router.js | grep -n "headshot\|pomelli\|vibe-workflow\|ai-vfx\|videco"
```

- [ ] **Step 2: Update headshot routes**

Change:
```js
'headshots': () => import('../components/HeadshotStudio.js').then(m => m.HeadshotStudio()),
'headshots-generate': () => import('../components/HeadshotStudio.js').then(m => m.HeadshotStudio()),
'headshots-history': () => import('../components/HeadshotStudio.js').then(m => m.HeadshotStudio()),
'headshots-settings': () => import('../components/HeadshotStudio.js').then(m => m.HeadshotStudio()),
'ai-headshot': () => import('../components/HeadshotStudio.js').then(m => m.HeadshotStudio()),
```

To:
```js
'headshots': () => import('../components/AIHeadshotPage.js').then(m => m.AIHeadshotPage()),
'headshots-generate': () => import('../components/AIHeadshotPage.js').then(m => m.AIHeadshotPage()),
'headshots-history': () => import('../components/AIHeadshotPage.js').then(m => m.AIHeadshotPage()),
'headshots-settings': () => import('../components/AIHeadshotPage.js').then(m => m.AIHeadshotPage()),
'ai-headshot': () => import('../components/AIHeadshotPage.js').then(m => m.AIHeadshotPage()),
```

- [ ] **Step 3: Update pomelli routes**

Change:
```js
'pomelli-studio': () => import('../components/PomelliStudio.js').then(m => m.PomelliStudio()),
```

To:
```js
'pomelli-studio': () => import('../components/OpenPomelliPage.js').then(m => m.OpenPomelliPage()),
```

- [ ] **Step 4: Update ai-vfx routes**

Change:
```js
'ai-vfx': () => import('../components/AIVFXStudio.js').then(m => m.AIVFXStudio()),
```

To:
```js
'ai-vfx': () => import('../components/AIVFXPage.js').then(m => m.AIVFXPage()),
```

- [ ] **Step 5: Update workflow routes**

Change:
```js
'workflows': () => import('../components/WorkflowBuilderApp.js').then(m => m.WorkflowBuilderApp()),
```

To:
```js
'workflows': () => import('../components/VibeWorkflowPage.js').then(m => m.VibeWorkflowPage()),
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/router.js
git commit -m "refactor: route all app aliases to iframe page components, not shells"
```

---

## Task 8: Update Sidebar Navigation

**Files:**
- Modify: `src/components/Sidebar.js`

**Goal:** Ensure sidebar nav items route to the same iframe pages. Verify headshots, ai-headshot, pomelli-studio, ai-vfx, workflows all navigate to the correct route IDs.

- [ ] **Step 1: Read Sidebar.js and check nav items**

```bash
grep -n "headshots\|pomelli\|ai-headshot\|ai-vfx\|workflows" src/components/Sidebar.js
```

- [ ] **Step 2: Update any nav items that navigate to shell routes**

If sidebar has `{ id: 'headshots', ... }` with click handler calling `navigate('headshots')` — that will now work correctly since router is updated. But verify the sidebar click handler calls `navigate(page)` where page matches the router key.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.js
git commit -m "fix: sidebar navigation aligns with updated router routes"
```

---

## Task 9: Add Netlify SPA Redirects for All Apps

**Files:**
- Modify: `netlify.toml`
- Create: `public/apps/<slug>/_redirects` (one per app)

**Goal:** Ensure all `/apps/<slug>/*` paths serve the app's `index.html` (SPA fallback).

- [ ] **Step 1: Read current netlify.toml**

```bash
cat netlify.toml
```

- [ ] **Step 2: Add redirects for each app**

For each app, add a redirect rule in `netlify.toml`:

```toml
[[redirects]]
  from = "/apps/open-pomelli/*"
  to = "/apps/open-pomelli/index.html"
  status = 200

[[redirects]]
  from = "/apps/vibe-workflow/*"
  to = "/apps/vibe-workflow/index.html"
  status = 200

[[redirects]]
  from = "/apps/ai-headshot-generator/*"
  to = "/apps/ai-headshot-generator/index.html"
  status = 200

[[redirects]]
  from = "/apps/ai-vfx/*"
  to = "/apps/ai-vfx/index.html"
  status = 200

[[redirects]]
  from = "/apps/videco-ai-platform/*"
  to = "/apps/videco-ai-platform/index.html"
  status = 200
```

- [ ] **Step 3: Create `_redirects` files in public/apps/<slug>/ for each app**

For each `public/apps/<slug>/` directory:

```bash
# Example for open-pomelli
echo "/* /apps/open-pomelli/index.html 200" > public/apps/open-pomelli/_redirects
echo "/* /apps/vibe-workflow/index.html 200" > public/apps/vibe-workflow/_redirects
echo "/* /apps/ai-headshot-generator/index.html 200" > public/apps/ai-headshot-generator/_redirects
echo "/* /apps/ai-vfx/index.html 200" > public/apps/ai-vfx/_redirects
echo "/* /apps/videco-ai-platform/index.html 200" > public/apps/videco-ai-platform/_redirects
```

- [ ] **Step 4: Commit**

```bash
git add netlify.toml
git add public/apps/*/_redirects
git commit -m "feat: add SPA redirects for all full apps"
```

---

## Task 10: Remove Duplicate Shell Components

**Files to remove:**
- `src/components/HeadshotStudio.js` (replaced by AIHeadshotPage.js iframe)
- `src/components/HeadshotStudioPage.js` (duplicate iframe)
- `src/components/AIHeadshotGeneratorPage.js` (duplicate iframe)
- `src/components/PomelliStudio.js` (replaced by OpenPomelliPage.js iframe)
- `src/components/AIVFXStudio.js` (replaced by AIVFXPage.js iframe; keep -new.js and -final.js only if they have distinct useful code)
- `src/components/WorkflowBuilderApp.js` (replaced by VibeWorkflowPage.js iframe)
- `src/components/VidecoAIPlatformPage.js` (may keep if only one exists)

**Also clean up:**
- `src/apps/open-pomelli/index.js` (shell — remove if exists)
- `src/apps/vibe-workflow/index.js` (shell — remove if exists)

- [ ] **Step 1: List all potential shell files**

```bash
ls src/components/Headshot*.js src/components/AIHeadshot*.js src/components/PomelliStudio.js src/components/WorkflowBuilderApp.js 2>/dev/null
```

- [ ] **Step 2: Before deleting, verify each is replaced by iframe page**

For each shell file, confirm:
1. Router no longer references it
2. Sidebar doesn't navigate to it
3. The replacement iframe page exists and is routed

- [ ] **Step 3: Remove confirmed duplicate shells**

```bash
# Example — only run after verification
rm -f src/components/HeadshotStudio.js
rm -f src/components/HeadshotStudioPage.js
rm -f src/components/AIHeadshotGeneratorPage.js
rm -f src/components/AIHeadshotPage.js
rm -f src/components/PomelliStudio.js
rm -f src/components/WorkflowBuilderApp.js
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove duplicate shell components replaced by iframe pages"
```

---

## Task 11: Fix CSP for Iframe Loading

**Files:**
- Modify: `vite.config.js:50-78`

**Goal:** The CSP currently has `frame-src 'none'` which will block iframe loading in production. Update to allow the app's own iframe paths.

- [ ] **Step 1: Read current CSP**

```js
const PRODUCTION_CSP = [
  "frame-src 'none'",
  // ...
];
const DEVELOPMENT_CSP = [
  "frame-src 'none'",
  // ...
];
```

- [ ] **Step 2: Update to allow iframe loading**

Change `frame-src 'none'` to:
```js
"frame-src 'self'",
```

Or more permissive for dev:
```js
"frame-src 'self' https://localhost:*",
```

- [ ] **Step 3: Commit**

```bash
git add vite.config.js
git commit -m "fix: update CSP to allow iframe loading for full apps"
```

---

## Task 12: Update `src/apps/<slug>/manifest.js` Files

**Files:**
- Modify: `src/apps/open-pomelli/manifest.js`
- Modify: `src/apps/vibe-workflow/manifest.js`
- Modify: `src/apps/ai-headshot-generator/manifest.js`

**Goal:** Ensure manifests correctly describe the full app source location and route. These are used by AppsHub/AppsStudio to catalog apps.

- [ ] **Step 1: Verify each manifest has correct route and id**

```js
// Example: src/apps/ai-headshot-generator/manifest.js
{
  id: 'ai-headshot-generator',
  name: 'AI Headshot Generator',
  route: '/apps/ai-headshot-generator',
  stack: 'next-react',
  thumbnail: '/apps/ai-headshot-generator/assets/thumbnail.jpg'
}
```

- [ ] **Step 2: Commit**

```bash
git add src/apps/open-pomelli/manifest.js src/apps/vibe-workflow/manifest.js src/apps/ai-headshot-generator/manifest.js
git commit -m "fix: update app manifests to reflect full standalone sources"
```

---

## Task 13: Update Tests to Match New Architecture

**Files:**
- Modify: `tests/unit/module-loading.spec.ts`
- Modify: `tests/e2e/vibe-workflow-full.spec.js`
- Modify: `tests/e2e/open-pomelli-full.spec.js`
- Modify: `tests/e2e/videco-ai-platform-full.spec.js`

**Goal:** Tests should expect iframe pages, not shell components. Module loading tests should map routes to iframe components.

- [ ] **Step 1: Read module-loading.spec.ts**

```bash
grep -n "headshots\|pomelli\|ai-headshot\|ai-vfx\|vibe-workflow" tests/unit/module-loading.spec.ts | head -30
```

- [ ] **Step 2: Update module mapping**

```js
// Change from HeadshotStudioPage to AIHeadshotPage
'ai-headshot': '../../src/components/AIHeadshotPage.js',
'headshots': '../../src/components/AIHeadshotPage.js',
```

- [ ] **Step 3: Update e2e tests for iframe loading**

E2E tests for full apps should navigate to `/#/<route>` and expect the iframe to load, not a shell UI.

- [ ] **Step 4: Commit**

```bash
git add tests/
git commit -m "test: update tests to reflect full-app iframe architecture"
```

---

## Task 14: Run Build and Verify

**Files:**
- Modify: `public/apps/` (build outputs)

- [ ] **Step 1: Run build:all**

```bash
cd /workspace/0c85e0dc-1244-40ab-8f84-e11668f857da/sessions/agent_69c19383-fada-489b-b9c7-d387fa23f720
npm run build:all 2>&1 | tail -50
```

Expected: All 9 apps build without error. If any fail, fix the build script for that app.

- [ ] **Step 2: Verify public/apps/<slug>/ directories exist with content**

```bash
for app in open-pomelli vibe-workflow ai-headshot-generator ai-vfx videco-ai-platform; do
  if [ -f "public/apps/$app/index.html" ]; then
    echo "OK: public/apps/$app has index.html"
  else
    echo "MISSING: public/apps/$app/index.html"
  fi
done
```

- [ ] **Step 3: Run verify-all-apps.mjs**

```bash
node verify-all-apps.mjs
```

Expected: All routes return HTTP 200, content > 500 bytes, and app shell (`id="app"`) present.

- [ ] **Step 4: Commit build artifacts**

```bash
git add public/apps/
git commit -m "build: add production builds for all full apps"
```

---

## Task 15: Final Verification and Documentation

**Files:**
- Modify: `docs/superpowers/plans/YYYY-MM-DD-full-app-consolidation.md` (this plan)
- Create: `ALL_APPS_COMPLETE_DOCS.md` (update sections for consolidated apps)

- [ ] **Step 1: Update ALL_APPS_COMPLETE_DOCS.md**

For each app, update the repository field:
```markdown
### N. <App Name>
**Repository**: `apps/<slug>/` (full standalone from GitHub fork)
**APIs**: ...
**Features**: ...
```

- [ ] **Step 2: Run final smoke test**

```bash
npm run dev &
sleep 10
node verify-all-apps.mjs
```

- [ ] **Step 3: Commit all documentation changes**

```bash
git add ALL_APPS_COMPLETE_DOCS.md
git commit -m "docs: update app documentation to reflect full standalone sources"
```

---

## Summary of Key Changes

| Area | Before | After |
|------|--------|-------|
| **App sources** | Missing `apps/` dirs, stale `public/apps/` | Full clones in `apps/`, fresh builds in `public/apps/` |
| **Router** | Mixed shells + orphaned iframes | All routes → iframe `<App>Page.js` components |
| **Build scripts** | Broken (wrong dirs, missing apps) | Corrected to match actual framework + output dirs |
| **Vite proxies** | Only videco + ai-headshot | All 5 apps proxied with correct ports |
| **Sidebar** | Some routes to shells | All routes to iframe pages |
| **Shell components** | 4-5 overlapping per app | Removed; single iframe page per app |
| **DB schemas** | Duplicate Open-Pomelli tables | Consolidated to newer `pomelli_*` schema |
| **Netlify** | Missing redirects | SPA redirects for all `/apps/<slug>/*` |
| **CSP** | `frame-src 'none'` | `frame-src 'self'` (allows iframe loading) |
| **Tests** | Expect shells + missing modules | Updated to expect iframe pages |
| **Docs** | Outdated repo references | Updated with correct `apps/<slug>/` paths |

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/YYYY-MM-DD-full-app-consolidation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints

**Which approach?**