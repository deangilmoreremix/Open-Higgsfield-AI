# Higgsfield Hybrid Architecture Migration Plan

## CRITICAL VIOLATIONS DETECTED (Must Fix Before Migration)

### Violation 1: IFRAME ARCHITECTURE EXISTS
Per master prompt rules: **"DO NOT introduce iframe-based embedding"** and **"No iframe usage anywhere in codebase"**

**Found iframe pages (MUST BE REMOVED)**:
- `src/components/AiVfxPage.js` - iframe loading `/apps/ai-vfx/`
- `src/components/VibeWorkflowPage.js` - iframe loading `/apps/vibe-workflow/`  
- `src/components/RemixGoPage.js` - iframe loading `/apps/remix-go/`
- `src/components/OpenPomelliPage.js` - iframe loading `/apps/open-pomelli/`
- `src/components/AIHeadshotPage.js` - iframe loading `/apps/ai-headshot-generator/`
- `src/components/AIHeadshotGeneratorPage.js` - iframe loading `/apps/ai-headshot-generator/`
- `src/components/VidecoAIPlatformPage.js` - iframe loading `/apps/videco-ai-platform/`
- `src/components/WorkflowEmbedPage.js` - iframe in content
- `src/components/MarketingStudioPage.js` - iframe in content

### Violation 2: Shell Apps Are Unused Placeholders
Per master prompt: **"Each module must... NOT control routing... NOT assume global app ownership"**

The `src/apps/` directories export React components but router.js uses DIFFERENT entry points:
- `src/apps/vibe-workflow/index.jsx` NOT used - router uses `VibeWorkflowStudio()` instead
- `src/apps/open-pomelli/index.jsx` NOT used - router uses `OpenPomelliStudio()` instead
- `src/apps/ai-headshot-generator/index.jsx` NOT used - router uses `HeadshotStudio()` instead

---

## Current System State Analysis

### Architecture Overview
- **Type**: Vanilla JS + React hybrid (with iframe violations)
- **Router**: `src/lib/router.js` (vanilla JS, dynamic imports, hash-based routing) - **DO NOT MODIFY**
- **App Registry**: `src/lib/appRegistry.js` (loads manifests from `src/apps/*/manifest.js`)
- **Entry Point**: `src/main.js` (vanilla JS bootstrap)

### Existing Apps Structure
```
src/apps/
├── agents/           # Shell placeholder (React JSX) - NOT USED by router
├── ai-headshot-generator/  # Shell placeholder + services - NOT USED by router
├── design-agent/     # Shell placeholder + services - NOT USED
├── marketing-studio/ # Shell placeholder + services - NOT USED
├── open-pomelli/     # Shell placeholder + services/hooks/components - NOT USED
├── remix-go/         # Shell placeholder + hooks/components - NOT USED
├── vibe-workflow/    # Shell placeholder + services - NOT USED
└── workflows/        # Shell placeholder - NOT USED
```

### Missing App Directories
- **ai-vfx** - route exists in router.js but no `src/apps/ai-vfx/` directory
- **videco-ai-platform** - route exists in router.js but no `src/apps/videco-ai-platform/` directory

### Working Router Entry Points (Vanilla JS Studios)
| Route | Component | Status |
|-------|-----------|--------|
| ai-vfx | `AIVFXStudio.js` | ✅ Working vanilla |
| vibe-workflow | `VibeWorkflowStudio.js` | ✅ Working vanilla |
| ai-headshot | `HeadshotStudio.js` | ✅ Working vanilla |
| open-pomelli-studio | `OpenPomelliStudio.js` | ✅ Working vanilla |
| remix-go | `src/apps/remix-go/index.jsx` | ⚠️ Shell placeholder |

---

## Phase 1: Required Remediation (Before Implementation)

### Step 1.1: Remove All Iframe-Based Pages
These violate master prompt: **"No iframe usage exists anywhere"** is acceptance criteria

| File | Action | Replacement |
|------|--------|-------------|
| `src/components/AiVfxPage.js` | DELETE | Router uses `AIVFXStudio.js` |
| `src/components/VibeWorkflowPage.js` | DELETE | Router uses `VibeWorkflowStudio.js` |
| `src/components/RemixGoPage.js` | DELETE | Route points to shell (needs implementation) |
| `src/components/OpenPomelliPage.js` | DELETE | Router uses `OpenPomelliStudio.js` |
| `src/components/AIHeadshotPage.js` | DELETE | Router uses `HeadshotStudio.js` |
| `src/components/AIHeadshotGeneratorPage.js` | DELETE | Duplicate, unused |
| `src/components/VidecoAIPlatformPage.js` | DELETE | Route needs implementation |
| `src/components/WorkflowEmbedPage.js` | DELETE | Iframe-based |
| `src/components/MarketingStudioPage.js` | DELETE | Iframe-based placeholder |

### Step 1.2: Create Missing App Directories
Two apps missing from `src/apps/`:

**Create: `src/apps/ai-vfx/`**
```bash
src/apps/ai-vfx/
├── index.jsx    # React shell placeholder (matching other apps)
├── manifest.js  # { id: 'ai-vfx', route: '/ai-vfx', status: 'complete' }
```

**Create: `src/apps/videco-ai-platform/`**
```bash
src/apps/videco-ai-platform/
├── index.jsx    # React shell placeholder
├── manifest.js  # { id: 'videco-ai-platform', route: '/videco-ai-platform', status: 'shell' }
```

### Step 1.3: Update App Registry
Add missing apps to `SHELL_APP_DIRS` in `src/lib/appRegistry.js`:
```js
const SHELL_APP_DIRS = [
  'ai-headshot-generator',
  'ai-vfx',              // ADD
  'design-agent',
  'marketing-studio',
  'open-pomelli',
  'remix-go',
  'vibe-workflow',
  'videco-ai-platform',  // ADD
  'workflows',
  'agents',              // ADD (currently missing!)
];
```

---

## Phase 2: Migration Path Options

### Option A: Strip Shell Apps (Recommended)
Since `src/apps/*/index.jsx` are NOT used by router, remove them entirely:
- Shell apps serve no purpose currently
- Vanillas JS studios in `src/components/*Studio.js` ARE used
- Reduce codebase bloat

### Option B: Complete Shell Integrations
Convert shell React components to use existing vanilla studios:
- Shell `index.jsx` imports + wraps corresponding `*Studio()` function
- Requires creating bridge to mount React in vanilla system

---

## Phase 3: Acceptance Criteria (Post-Remediation)

### MUST PASS (Non-Negotiable)
- [ ] All existing routes in `src/lib/router.js` load successfully
- [ ] No modifications to `src/lib/router.js`
- [ ] No modifications to `src/lib/supabase.ts` or `supabase-client.ts`
- [ ] No iframe usage anywhere in codebase
- [ ] No second frontend architecture
- [ ] Vanilla apps (ImageStudio, VideoStudio, etc.) work unchanged
- [ ] App registry loads all 10 apps

### Verification Commands
```bash
npm run dev      # All routes should work
npm run build    # Bundle should include all apps
npm run lint     # No errors
```

### Output Format
When complete, report:
1. What was extracted (nothing - all stripped)
2. What was converted into modules (shell apps remain placeholders)
3. What was registered (ai-vfx, videco-ai-platform added to registry)
4. What was NOT changed (router.js, supabase.ts, vanilla studios)
5. Any risks (shell apps are disconnected from routing)