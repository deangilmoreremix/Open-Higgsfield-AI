# Current State Before Stack Migration

**Generated:** 2026-05-19  
**Branch:** feat/migrate-higgsfield-to-upstream-stack  
**Repository:** deangilmoreremix/Open-Higgsfield-AI

## Build Status

Currently using Vite build system. Build command: `npm run build` (vite build)

## Framework Analysis

### Current Framework
- **Primary**: Vite (React)
- **Partial Next.js**: `next.config.mjs` exists but minimal configuration
- **React Version**: 19.2.6
- **Package Manager**: pnpm

### Current Build Configuration
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "vite preview"
  }
}
```

### Workspace Configuration
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!apps/vimax/**'
  - 'modules/*'
```

**Issue**: Workspace config references many app paths that don't fully exist as proper packages.

## Current App Registry (src/apps)

### Shell Apps Detected (8 total)
All apps in `src/apps/` are detected as shell apps:

| App ID | Status | Missing Files/Folders |
|--------|--------|----------------------|
| agents | shell | FEATURE_CHECKLIST.md, services/handlers/output logic |
| ai-headshot-generator | shell | FEATURE_CHECKLIST.md, assets/, data/, services/handlers/output logic |
| design-agent | shell | FEATURE_CHECKLIST.md, services/handlers/output logic |
| marketing-studio | shell | FEATURE_CHECKLIST.md, services/handlers/output logic |
| open-pomelli | shell | FEATURE_CHECKLIST.md, assets/, data/, services/handlers/output logic |
| remix-go | shell | FEATURE_CHECKLIST.md, assets/, data/, services/handlers/output logic |
| vibe-workflow | shell | FEATURE_CHECKLIST.md, components/, assets/, hooks/, data/ |
| workflows | shell | routes.js, FEATURE_CHECKLIST.md, components/, services/, assets/, hooks/, data/ |

## Routing System

### Current Router Implementation
- **File**: `src/lib/router.js`
- **Type**: Hash-based client-side router
- **Pattern**: `#/route`
- **Navigation**: `history.pushState` with custom cleanup

### Current Routes (from ROUTE_MAP)
```javascript
const ROUTE_MAP = {
  'Explore': 'explore',
  'Image': 'image',
  'Video': 'video',
  'Storyboard': 'storyboard',
  'Edit': 'edit',
  'Character': 'character',
  'Vibe Motion': 'effects',
  'VFX': 'vfx',
  'AI-VFX': 'ai-vfx',
  'Cinema Studio': 'cinema',
  'AI Influencer': 'influencer',
  'Apps': 'apps',
  'Templates': 'templates',
  'Assist': 'assist',
  'Community': 'community',
  'Avatar': 'avatar',
  'Audio': 'audio',
  'Workflows': 'workflows',
  'Agents': 'agents',
  'Video Outreach': 'video-outreach',
  'Assistant': 'assistant',
  'Studio': 'studio'
};
```

## API & Service Layer

### MuAPI Client (`src/lib/muapi.js`)
- 140+ API functions for:
  - Image/Video generation
  - Workflow operations
  - Agent operations
  - File upload
  - Balance/status checks

### Base URL Logic
```javascript
const BASE_URL = (typeof window !== 'undefined' && window.location?.protocol?.startsWith('http'))
    ? '/api'  // Next.js API routes would go here
    : 'https://api.muapi.ai';
```

## External Apps Inventory

### Current Root `apps/` Directory
```
apps/
├── agents-app/          # React/Vite
├── ai-video-outreach/   # React/Vite
├── assistant-app/       # React/Vite
├── studio-app/          # React/Vite
├── vibe-workflow/       # React/Vite
└── workflow-app/        # React/Vite
```

### Current `packages/` Directory
```
packages/
└── studio/             # Copied from upstream structure
```

### Current `src/apps/` Directory (Shell Apps)
```
src/apps/
├── agents/
├── ai-headshot-generator/
├── design-agent/
├── marketing-studio/
├── open-pomelli/
├── remix-go/
├── vibe-workflow/
└── workflows/
```

## Key Problems Identified

### 1. Shell App Problem
- All 8 apps in `src/apps/` are shell apps missing real implementation
- Missing feature checklists, components, services, assets
- No real features implemented, just placeholders

### 2. Router Mismatch
- Custom hash-based router (`src/lib/router.js`)
- No Next.js App Router integration
- Components loaded dynamically via `import()` calls
- No server-side rendering support

### 3. Workspace Structure Mismatch
- Root `package.json` declares workspaces that don't match actual structure
- `apps/*/frontend` paths don't exist
- Missing proper package.json in subdirectories

### 4. React Import Issues
- Current Vite setup works but:
  - No module federation
  - Duplicate React instances when importing external apps
  - No shared package system

## Current Test/Validation Scripts

- `npm run apps:validate` - Validates app contracts
- `npm run apps:audit` - Audits for shell apps
- `npm run apps:validate:strict` - Strict validation mode

## Next Steps

1. Create Phase 1 audit docs comparing with upstream
2. Design migration target architecture
3. Create Next.js shell in parallel
4. Migrate apps one by one