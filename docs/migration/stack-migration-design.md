# Stack Migration Design Document

**Target:** Migration to Next.js workspace architecture  
**Based on:** Anil-matcha/Open-Generative-AI upstream patterns  
**Date:** 2026-05-19

## Target Architecture

### 1. Next.js as Primary App Shell

**Primary Framework:** Next.js 15 with App Router

```
app/
├── layout.jsx           # Root layout with sidebar/header
├── page.jsx             # Dashboard/home page
├── apps/
│   ├── page.jsx         # App grid listing
│   └── [appId]/
│       └── page.jsx     # Dynamic app loader
└── api/
    └── muapi/           # API proxy routes
```

**Benefits:**
- Server-side rendering
- File-based routing (no custom router needed)
- API routes for secure MuAPI calls
- Image optimization built-in

### 2. React Components Everywhere

- All components use JSX/TSX
- Consistent with React 19
- Shared UI library in `components/`

### 3. Workspace Packages

```
packages/
├── studio/              # Core studio (copied from current)
├── workflow-builder/    # Workflow builder
├── agents/              # AI agents
├── design-agent/        # Design agent UI
├── shared-ui/           # Common components
├── shared-services/     # API adapters
└── shared-adapters/     # MuAPI, Supabase adapters
```

**package.json workspaces:**
```json
"workspaces": [
  "packages/*"
]
```

### 4. src/apps Retained as Module Layer

Keep `src/apps/` but with proper contract:
- Each app has `manifest.js`, `index.jsx`, `routes.js`
- App registry reads manifests for dynamic loading
- Apps export React components

### 5. Gradual App Migration

- Start with one complete app (AI-VFX)
- Migrate one app per PR
- Keep old Vite apps functional until migrated

## Shared Packages Structure

### packages/shared-adapters/
```
src/
├── muapiAdapter.js      # MuAPI client wrapper
├── openaiAdapter.js     # OpenAI client
├── supabaseAdapter.js   # Supabase client
└── outputHandoff.js     # Result handling
```

### packages/shared-ui/
```
src/
├── components/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── AppCard.jsx
│   └── LoadingSpinner.jsx
├── hooks/
│   ├── useApi.js
│   └── useLocalStorage.js
└── styles/
    └── globals.css
```

## Solving Key Problems

### React Import Issues
**Problem:** External Vite apps cause duplicate React  
**Solution:** 
- Use Next.js `transpilePackages` for workspace packages
- All packages share same React instance
- Remove separate Vite server for apps

### Shell App Problem
**Problem:** Apps in `src/apps/` are empty shells  
**Solution:**
- Enforce app contract with validation
- apps:validate blocks production builds with shell apps
- Auto-detection of missing required files

### Nested Route Problem
**Problem:** Custom router can't handle deep nesting  
**Solution:**
- Next.js App Router handles `/apps/[appId]/[...slug]`
- App manifest defines its own routes
- Dynamic route loader in `app/apps/[appId]/page.jsx`

### Workspace Package Problem
**Problem:** Workspace config doesn't match actual structure  
**Solution:**
- Clean up workspace declarations
- Add package.json to each workspace
- Use `file:./packages/...` for local dependencies

### Service/API Mismatch
**Problem:** MuAPI client uses browser proxy, needs server-side  
**Solution:**
- Create `/app/api/muapi/[...path]/route.js`
- MuAPI client detects server vs browser context
- Server-side routes use secret keys, browser uses user keys

### Asset Migration Problem
**Problem:** Assets referenced with relative paths  
**Solution:**
- Use Next.js `public/` for static assets
- Update import paths to use `@/` alias
- Copy app assets to respective package folders

### Duplicate App Problem
**Problem:** Same app exists in multiple places  
**Solution:**
- Single source of truth in `packages/[appId]/`
- Remove duplicate entries in `apps/` and `src/apps/`
- Update router to point to new locations

## Migration Phases

### Phase 1: Foundation (This PR)
- [x] Create migration branch
- [x] Audit current state
- [x] Create design document
- [ ] Create Next.js app shell in parallel
- [ ] Set up workspace packages

### Phase 2: First App Migration
- [ ] Migrate AI-VFX as proof of architecture
- [ ] Connect shared adapters
- [ ] Validate build and routing

### Phase 3: Upstream Package Integration
- [ ] Migrate workflow-builder
- [ ] Migrate agents
- [ ] Migrate design-agent

### Phase 4: Remaining Apps
- [ ] Migrate each remaining app one by one
- [ ] Remove old Vite builds
- [ ] Clean up shell apps

## Script Changes

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "dev:vite": "vite",                     // Temporary
    "apps:audit": "node scripts/audit-shell-apps.mjs",
    "apps:validate": "node scripts/validate-apps.mjs",
    "apps:validate:strict": "node scripts/validate-apps.mjs --strict"
  }
}
```

## Validation Gates

### Pre-commit
- `npm run apps:audit` must not show new shell apps
- `npm run lint` must pass

### Pre-merge
- `npm run apps:validate:strict` must pass
- `npm run build` must succeed
- No incomplete apps in `src/apps/`

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing apps | Keep Vite as fallback until verified |
| Duplicate React modules | Use transpilePackages strictly |
| Routing conflicts | Map old routes to new structure |
| Data loss during migration | Backup branch before each phase |

## Acceptance Criteria

1. ✅ Higgsfield runs on Next.js
2. ✅ React app modules import without errors
3. ✅ Workspace packages add cleanly
4. ✅ Existing Higgsfield apps preserved
5. ✅ AI-VFX works as full app
6. ✅ apps:audit detects incomplete apps
7. ✅ apps:validate reports accurate status
8. ✅ `npm run build` passes