# Higgsfield React Migration Plan

This document defines the exact phased approach for converting Higgsfield to a React + TypeScript + Vite application, while preserving all existing functionality.

---

## Goals

1. Convert Higgsfield's main shell to React (not the upstream repo as main app)
2. Keep all existing vanilla JS studios/apps operating until fully converted
3. Preserve all routes, thumbnails, app names, routing paths, MuAPI integrations
4. Import upstream React apps as contained modules inside `src/apps/`
5. Build an app registry that controls sidebar, routing, and app cards
6. Keep Supabase + MuAPI + Netlify stack intact

---

## What NOT to Do

- Do NOT replace `index.html` / `src/main.js` with the upstream repo's entry point
- Do NOT delete `src/components/Sidebar.js` or `src/components/Header.js` to use upstream equivalents
- Do NOT replace `src/lib/router.js` with upstream routing
- Do NOT add upstream Prisma, NextAuth, or custom backend auth
- Do NOT move `src/components/` out of the root — it stays
- Do NOT collapse existing apps into a single "upstream shell"
- Do NOT import upstream global CSS or design system as the primary system

---

## Current Structure

```
src/
├── main.js              ← Main entry (vanilla IIFE)
├── router.js            ← Vanilla history API router
├── components/
│   ├── Sidebar.js       ← 40+ nav items, all routes
│   ├── Header.js
│   ├── ImageStudio.js
│   ├── VideoStudio.js
│   ├── CinemaStudio.js
│   └── [40+ more studios]
├── lib/
│   ├── muapi.js         ← Central API client
│   ├── supabase.js      ← Supabase client
│   └── [core services]
└── apps/                ← Upstream source (partially extracted)
    ├── remix-go/
    ├── vibe-workflow/
    └── [more]
```

---

## Migration Phases

### Phase 1: React Shell (PREREQUISITE for all other phases)

**Goal:** Replace `src/main.js` with a real React entry point using `createRoot`.

**Steps:**
1. Create `src/App.tsx` as the main React component
2. Create `src/main.tsx` using `ReactDOM.createRoot`
3. Convert `Header.js` → `Header.tsx` (React Function Component)
4. Convert `Sidebar.js` → `Sidebar.tsx` (React Function Component)
5. Replace vanilla `router.js` routing with `react-router-dom`
6. Keep `src/lib/router.js` for the transition period, but make it call React components

**Verification:**
- App loads at `/`
- Sidebar shows all 40+ apps
- Clicking each nav item navigates to the correct route
- Header active states update on navigation

**Files touched:**
- `index.html` (add `<div id="app">` remains)
- `src/main.tsx` (new)
- `src/App.tsx` (new)
- `src/components/Header.tsx` (new, converted from Header.js)
- `src/components/Sidebar.tsx` (new, converted from Sidebar.js)
- `package.json` (add react, react-dom, react-router-dom)

---

### Phase 2: App Registry

**Goal:** Create a centralized `src/lib/appRegistry.js` that powers the sidebar container renders.

**Steps:**
1. Document all 40+ existing apps in `appRegistry.js`
2. Generate sidebar nav items from the registry
3. Generate routing from the registry
4. Generate app cards from the registry

**Verification:**
- Registry is the single source of truth for sidebar items
- Adding an app to registry adds it to sidebar and routing automatically

**Files touched:**
- `src/lib/appRegistry.js` (new)

---

### Phase 3: Convert Core Studios to React

**Goal:** Convert existing vanilla JS studios to real React components, one at a time.

**Order (priority):**
1. `ImageStudio.js` → `ImageStudio.tsx`
2. `VideoStudio.js` → `VideoStudio.tsx`
3. `CinemaStudio.js` → `CinemaStudio.tsx`
4. `EffectsStudio.js` → `EffectsStudio.tsx`
5. Continue with remaining studios

**For each studio:**
- Convert the exported function to a React function component
- Replace `document.createElement` with JSX
- Replace custom event system with React `useState`/`useEffect`
- Replace `$element` DOM references with `useRef`
- Keep all form logic, API calls, MuAPI integration exactly the same
- Preserve all existing CSS class names

**Verification:**
- Each converted studio renders correctly
- Generation still works (images generate, video renders, etc.)
- Save to Library still works

---

### Phase 4: Import Upstream React Apps

**Goal:** Bring each upstream app into `src/apps/[app-id]/` as a contained module.

**For each upstream app:**
1. Place source in `src/apps/[app-id]/`
2. Export a single main component
3. Wire to Higgsfield routing via registry
4. Use Higgsfield's Supabase and MuAPI clients
5. Remove its own router, auth, and global shell dependencies
6. Register in app registry

**Apps to import:**
- src/apps/marketing-studio/ → MarketingStudioApp (already partly migrated)
- src/apps/workflows/ → WorkflowBuilderApp (already migrated)
- src/apps/agents/ → AIAgentApp (already migrated)
- src/apps/design-agent/ → DesignAgentApp (already migrated)
- src/apps/pomelli/ → PomelliStudio
- src/apps/ai-vfx/ → AIVFXStudio (already migrated)
- src/apps/headshots/ → HeadshotStudio
- src/apps/remix-go/ → existing but loads via iframe

**Verification:**
- Each imported app renders inside the Higgsfield shell (not as an iframe)
- Uses Higgsfield sidebar and header
- Uses Higgsfield Supabase/MuAPI clients
- No "Coming Soon" or placeholder content

---

### Phase 5: API Unification

**Goal:** Ensure all apps (native + imported) use the same API clients.

**Steps:**
1. All apps must import MuAPI client from `src/lib/muapi.js`
2. All apps must import Supabase client from `src/lib/supabase.js` or `src/lib/hybrid-supabase.js`
3. Remove any upstream API clients that were brought in with imported apps
4. Verify all API keys come from env vars set in Netlify

**Verification:**
- No app uses a different API client than the main Higgsfield app
- All MuAPI calls go through the same `muapi` service
- All media uploads go through the same Supabase storage

---

### Phase 6: Media Handoff

**Goal:** Ensure all apps can hand off generated media to Library, Render, Director, Timeline, Video Agent.

**Steps:**
1. Implement shared sessionStorage handoff keys (documented in APP_REGISTRY_CONTRACT.md)
2. Ensure every media-generating app supports all applicable handoffs
3. Test end-to-end: generate → handoff → other app receives media

**Verification:**
- Generate image in Image Studio → Send to Render works
- Generate video in Video Studio → Send to Timeline works
- Generate campaign in Marketing → Save to Library works

---

### Phase 7: Netlify Build & QA

**Goal:** Production-ready deployment on Netlify.

**Steps:**
1. `npm run build` passes with no errors
2. All routes handled by client-side routing (Netlify redirects setup)
3. All env vars configured in Netlify dashboard
4. No upstream-only dependencies in package.json
5. CSP headers correct
6. Build output under 10MB

**QA Checklist (per app):**
- [ ] Route loads correctly at `/[app-route]`
- [ ] App renders without error in console
- [ ] Primary generation/action works end-to-end
- [ ] Output is visible and accessible
- [ ] At least one handoff target works
- [ ] No "Coming Soon" or placeholder content
- [ ] Error states display meaningfully

---

## File-by-File Migration Map

| Original File | New File | Notes |
|---|---|---|
| `src/main.js` | `src/main.tsx` | React entry point with createRoot |
| n/a | `src/App.tsx` | Main React shell component |
| `src/components/Header.js` | `src/components/Header.tsx` | React functional component |
| `src/components/Sidebar.js` | `src/components/Sidebar.tsx` | React functional component; reads appRegistry |
| `src/lib/router.js` | React Router in `App.tsx` | Temporary overlap; replaced in Phase 1 |
| `src/components/ImageStudio.js` | `src/components/ImageStudio.tsx` | Phase 3 |
| `src/components/VideoStudio.js` | `src/components/VideoStudio.tsx` | Phase 3 |
| `src/components/CinemaStudio.js` | `src/components/CinemaStudio.tsx` | Phase 3 |
| `src/components/EffectsStudio.js` | `src/components/EffectsStudio.tsx` | Phase 3 |
| ... | ... | All remaining studios |
| n/a | `src/lib/appRegistry.js` | Phase 2, single source of truth |

---

## New Folder Structure

```
src/
├── main.tsx                   ← React entry (createRoot)
├── App.tsx                    ← Shell + routing
├── components/
│   ├── Header.tsx            ← React header
│   ├── Sidebar.tsx           ← React sidebar (reads registry)
│   ├── landing/              ← Landing page components
│   ├── modals/               ← Modal components
│   ├── timeline-editor/      ← Timeline components
│   └── studios/              ← STUDIO COMPONENTS HERE (not in apps/)
│       ├── ImageStudio.tsx
│       ├── VideoStudio.tsx
│       └── ...
├── lib/
│   ├── appRegistry.js        ← Central app registry
│   ├── muapi.js             ← API client
│   ├── supabase.js           ← Supabase client
│   └── ...
├── apps/                     ← UPSTREAM MODULES ONLY
│   ├── marketing-studio/
│   ├── workflows/
│   ├── agents/
│   └── design-agent/
├── hooks/                    ← React hooks
│   └── stores/               ← Zustand or React Context stores
└── routes/                   ← React Router routes
    └── index.tsx
```

**Note:** All native Higgsfield studios MUST remain in `src/components/` (or `src/components/studios/`), NOT in `src/apps/`. The `src/apps/` directory is strictly for upstream modules that are imported as-contained components. A studio is not an "app" in the upstream-import sense.

---

## Dependencies to Add

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0"
  }
}
```

Dev dependencies:
```json
{
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0"
  }
}
```

Dependencies NOT to add (ever):
- Prisma
- NextAuth
- Clerk
- Firebase Admin
- MongoDB drivers
- Custom upstream auth

---

## Conflict Resolution

If at any point an AI proposes changes that:

1. Delete or rename an existing app (`ImageStudio.js` → `ImageStudioOLD.js`)
2. Replace the main shell with an upstream equivalent
3. Add a new global router different from React Router
4. Change routing paths (e.g., `/image` → `/studio/image`)
5. Add upstream database/auth dependencies

→ Refer to `AI_ARCHITECTURE_RULES.md` and stop. Do not implement. Explain the conflict.

---

## How to Use This File

1. Any agent starting work on Higgsfield MUST read this file and `AI_ARCHITECTURE_RULES.md` before making any changes
2. Before starting a phase, review what files the phase touches
3. After completing a phase, update the migration status table in the app registry
4. Before marking an app "complete", verify using `APP_REGISTRY_CONTRACT.md`

## Current Migration Status

| Phase | Status |
|-------|--------|
| Phase 1: React Shell | ❌ NOT STARTED |
| Phase 2: App Registry | ❌ NOT STARTED |
| Phase 3: Convert Studios | ❌ NOT STARTED |
| Phase 4: Import Upstream Apps | ⚠️ PARTIAL (4 apps migrated, but via iframe) |
| Phase 5: API Unification | ⚠️ PARTIAL |
| Phase 6: Media Handoff | ⚠️ PARTIAL |
| Phase 7: Netlify Build & QA | ⚠️ PARTIAL |
