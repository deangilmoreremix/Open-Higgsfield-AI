# Plan: Add Open-Generative-AI Studios as Standalone Sidebar Apps

## Current State (already partially implemented)

### What exists today:
- `src/components/Sidebar.js` lines 63-73: **already has all 11 studio icons** (`open-image-studio`, `open-video-studio`, `open-audio-studio`, `open-lip-sync`, `open-ai-clipping`, `open-vibe-motion`, `open-cinema`, `open-marketing`, `open-workflows`, `open-agents`, `open-design-agent`)
- `src/lib/router.js` lines 139-149: **already has all routes mapped** to `StandaloneAppPage('open-generative-ai', '<studio>')`
- `apps/open-generative-ai`: Next.js web app that loads all studios in one bundle
- Each sidebar click loads `apps/open-generative-ai` in an iframe with `?studio=<name>` query param to select the active tab

### How it works:
```
Sidebar click → navigate('open-image-studio')
  → router: StandaloneAppPage('open-generative-ai', 'image')
  → iframe src: /apps/open-generative-ai/?studio=image
  → Next.js app renders with ImageStudio tab active
```

## The Gap You're Identifying

The studios are **not truly standalone monorepo apps** yet. They all load from the single `apps/open-generative-ai` Next.js instance. Other apps like `agents-app`, `assistant-app`, `ai-headshot-generator` are separate `apps/<name>/` directories with their own `package.json`, dev server, and build output.

## Two Approaches

### Option A: Keep Current Architecture (already functional)
- No code changes needed
- All 11 studios already have sidebar icons and routes
- They load via iframe from the single Next.js app
- **Pros**: Simple, shared code, one dev server
- **Cons**: Not separate monorepo apps, one large bundle

### Option B: Extract Each Studio as a True Standalone Monorepo App
Create `apps/open-<studio-name>/` directories, each with its own Vite wrapper that embeds just that studio from `packages/studio`.

**Required changes:**
1. Create `apps/open-image-studio/`, `apps/open-video-studio/`, etc. (11 new dirs)
2. Each gets a minimal `package.json` with Vite + React, importing from `packages/studio`
3. Each gets a Vite config that resolves `studio` alias to `../../open-generative-ai/packages/studio` (or root `packages/studio`)
4. Update `router.js` to map each studio to its own `StandaloneAppPage('<app-name>')` instead of all going to `open-generative-ai`
5. Update `Sidebar.js` tooltip URLs from `/apps/open-generative-ai/` to `/apps/open-<studio-name>/`
6. Add build scripts or ensure vite can resolve the shared `packages/studio` dependency

**Tradeoffs:**
- 11 separate Vite dev servers to manage
- Shared `packages/studio` component library still built once
- Each studio page loads only its own code (smaller initial bundle)
- More complex monorepo structure

## Recommendation

**Option A is likely sufficient** — the studios already appear as independent sidebar entries with their own icons and routes. The iframe isolation already gives the UX of separate apps. The only difference is they share a single Next.js backend.

If you truly need each as a separate monorepo workspace (e.g., for independent deployment, separate CI, or per-studio dependency overrides), then Option B is the path.

## Clarifying Question

Do you want:
- **(A)** Just the current setup (already done, icons + routes exist) — confirm and use as-is
- **(B)** True extraction of each studio into its own `apps/open-<studio-name>/` monorepo package with separate Vite configs

Or is there a specific problem with the current implementation that needs fixing?
