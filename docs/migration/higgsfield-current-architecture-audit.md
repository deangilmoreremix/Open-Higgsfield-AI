# Higgsfield Current Architecture Audit

**Repository:** deangilmoreremix/Open-Higgsfield-AI  
**Audited:** 2026-05-19

## Current Framework

### Build System
- **Primary**: Vite 7.0.0
- **Partial Next.js**: Minimal `next.config.mjs`
- **React**: 19.2.6 (in dependencies)
- **Package Manager**: pnpm 10.18.3

### Entry Point
- `index.html` → `src/main.js`
- Vite dev server on port 8080

## Current App Routing

### Router Implementation (`src/lib/router.js`)
- **Type**: Custom hash-based SPA router
- **Pattern**: `#/route-name`
- **Mechanism**: `history.pushState()`, dynamic imports

### Route Registration (ROUTE_MAP excerpt)
```javascript
const ROUTE_MAP = {
  'Explore': 'explore',
  'Image': 'image',
  'Video': 'video',
  'Storyboard': 'storyboard',
  'Edit': 'edit',
  'Character': 'character',
  'VFX': 'vfx',
  'AI-VFX': 'ai-vfx',
  'Cinema Studio': 'cinema',
  'AI Influencer': 'influencer',
  'Apps': 'apps',
  'Templates': 'templates',
  'Workflows': 'workflows',
  'Agents': 'agents'
};
```

### Page Loaders
Components loaded via dynamic import:
```javascript
const pageLoaders = {
  image: () => import('../components/ImageStudio.js').then(m => m.ImageStudio()),
  video: () => import('../components/VideoStudio.js').then(m => m.VideoStudio()),
  'ai-vfx': () => import('../components/AIVFXStudio.js').then(m => m.AIVFXStudio()),
  workflows: () => import('../components/WorkflowBuilderApp.js').then(m => m.WorkflowBuilderApp()),
  agents: () => import('../components/AIAgentApp.js').then(m => m.AIAgentApp()),
  // ... 50+ routes
};
```

## Current App Registry

### Shell Apps in `src/apps/` (All Incomplete)
| App ID | Status | Missing |
|--------|--------|---------|
| agents | shell | FEATURE_CHECKLIST.md, services |
| ai-headshot-generator | shell | FEATURE_CHECKLIST.md, assets/, data/ |
| design-agent | shell | FEATURE_CHECKLIST.md, services |
| marketing-studio | shell | FEATURE_CHECKLIST.md, services |
| open-pomelli | shell | FEATURE_CHECKLIST.md, assets/, data/ |
| remix-go | shell | FEATURE_CHECKLIST.md, assets/, data/ |
| vibe-workflow | shell | FEATURE_CHECKLIST.md, components/, assets/, hooks/, data/ |
| workflows | shell | FEATURE_CHECKLIST.md, components/, services/, assets/, hooks/, data/ |

### External Apps in `apps/` (React/Vite)
| App | Location | Tech |
|-----|----------|------|
| agents-app | apps/agents-app | React/Vite |
| ai-video-outreach | apps/ai-video-outreach | React/Vite |
| assistant-app | apps/assistant-app | React/Vite |
| studio-app | apps/studio-app | React/Vite |
| vibe-workflow | apps/vibe-workflow | React/Vite |
| workflow-app | apps/workflow-app | React/Vite |

## Shell App Problem

### Current State
All apps in `src/apps/` are detected as shell apps:
- Missing `index.js` or `index.jsx`
- Missing `manifest.js`
- Missing `FEATURE_CHECKLIST.md`
- Missing `components/`, `services/`, `assets/`, `hooks/`, `data/` folders

### Root Cause
1. Apps were added to `src/apps/` for registration but never fully implemented
2. Actual implementations exist as separate Vite apps in `apps/` and `src/components/`
3. No clear contract enforcement during creation

### Missing Validation
- apps:validate runs but allows shell apps to exist
- No CI check blocks merge of incomplete apps

## Current Apps Analysis

### Complete/Hybrid Apps (in src/components)
**Note**: These exist as components but require migration analysis:

| Component | Route | Status |
|-----------|-------|--------|
| ImageStudio.js | /image | Implementation exists |
| VideoStudio.js | /video | Implementation exists |
| CinemaStudio.js | /cinema | Implementation exists |
| EffectsStudio.js | /effects, /vfx | Implementation exists |
| AIVFXStudio.js | /ai-vfx | Implementation exists |
| EditStudio.js | /edit | Implementation exists |
| UpscaleStudio.js | /upscale | Implementation exists |
| LibraryPage.js | /library | Implementation exists |
| CharacterStudio.js | /character | Implementation exists |
| InfluencerStudio.js | /influencer | Implementation exists |
| AvatarStudio.js | /avatar | Implementation exists |
| AudioStudio.js | /audio | Implementation exists |
| WorkflowBuilderApp.js | /workflows | Implementation exists |
| AIAgentApp.js | /agents | Implementation exists |
| StudioApp.js | /studio | Implementation exists |
| MarketingStudioApp.js | /marketing-studio | Implementation exists |
| PomelliStudio.js | /pomelli-studio | Implementation exists |
| WorkflowStudioApp.js | /workflow-studio | Implementation exists |

## Where Current Architecture Blocks React Integration

### 1. No Module Federation
- Each external `apps/*` runs its own Vite server
- No shared React instance
- Duplicate React in browser

### 2. Router Mismatch
- Next.js would use file-based routing
- Current is hash-based with manual route config
- No server-side rendering

### 3. Workspace Package Gaps
- `package.json` declares workspaces that don't exist
- Missing proper package.json in subdirs
- No transpilePackages for external apps

### 4. Asset Resolution Issues
- Components use relative paths like `../components/X`
- No module aliases
- Vite vs Next.js public folder differences

### 5. Data Fetching Mismatch
- MuAPI client expects `/api` proxy in browser
- Next.js needs API routes for server-side calls
- No clear pattern for secrets vs user keys

## Recommended Architecture Changes

### Before (Current)
```
higgsfield/
├── index.html
├── vite.config.js
├── src/
│   ├── components/     # All components here
│   ├── apps/           # Shell apps (incomplete)
│   └── lib/
│       └── router.js   # Custom router
└── apps/               # Separate Vite apps
```

### After (Target)
```
higgsfield/
├── app/                # Next.js App Router
│   ├── layout.jsx
│   ├── page.jsx
│   └── apps/
│       └── [appId]/
├── components/         # Shared UI
├── packages/           # Workspace packages
│   ├── studio/
│   ├── workflow-builder/
│   ├── agents/
│   ├── design-agent/
│   └── ...
└── src/                # Keep existing during transition
```