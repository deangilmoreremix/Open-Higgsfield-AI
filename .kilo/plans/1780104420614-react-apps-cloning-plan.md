# React Apps Integration Plan - No Shells Allowed

## Objective
Integrate the specified repositories as FULL React applications (not shells) into the Higgsfield monorepo using existing service layers where available.

## Current State (Verified)

### Already Complete - No Changes
| Location | App | Lines | Status |
|----------|-----|-------|--------|
| `packages/studio/src/components/LipSyncStudio.jsx` | LipSync Studio | 1086 | FULL - complete React implementation |

### Shell Apps with Existing Service Layers (UI Only Needed)
| Location | App ID | Service Lines | UI Lines | Routes |
|----------|--------|---------------|----------|--------|
| `/src/apps/open-pomelli/` | open-pomelli | 196 | 42 (placeholder) | Yes (5 routes) |
| `/src/apps/ai-headshot-generator/` | ai-headshot-generator | 116 | 42 (placeholder) | Yes (5 routes) |

### Vanilla JS (React Conversion)
| Location | App | Lines | Features |
|----------|-----|-------|----------|
| `/src/components/AIVFXStudio.js` | AI-VFX Studio | 471 | 37 effects + 50+ camera moves |
| `/apps/vibe-workflow/src/main.js` | Vibe Workflow | 171 | Node-based editor |

### Standalone Apps (Integration Needed)
| Location | App | Framework | Status |
|----------|-----|-----------|--------|
| `/apps/assistant-app/` | assistant-app | React/Vite | Complete - needs menu integration |
| `/apps/studio-app/` | studio-app | React/Vite | Complete - needs menu integration |
| `/apps/workflow-app/` | workflow-app | React/Vite | Complete - needs menu integration |

## Execution Order

### Phase 0: LipSync Studio Integration (1 update)
- Update manifest to `status: 'complete'`
- Add route `/lipsync` pointing to existing LipSyncStudio
- Connect to appRegistry

### Phase 1: AI-Headshot-Generator UI Build (~200 lines)
- Build `HeadshotStudio.jsx` using existing `headshotService.js`
- Components: upload, preset selector, generate, result gallery
- Connect to `/headshots` route

### Phase 2: Open-Pomelli UI Build (~350 lines)
- Build `BrandDNAPanel.jsx` using existing `pomelliService.js`
- Components: URL input, DNA display, campaigns, photo studio, animate
- Connect to `/pomelli-studio` route

### Phase 3: AI-VFX React Conversion (~470 lines)
- Convert `/src/components/AIVFXStudio.js` to React
- Preserve all 37 effects + camera moves
- Connect to `/vfx` route

### Phase 4: Standalone Apps Integration (~200 lines)
- Integrate assistant-app, studio-app, workflow-app into sidebar menu

## Total Work: ~1200 Lines (NOT Shells)

## Critical Constraints
1. **No auth flows** - Remove any auth/OAuth/Stripe code
2. **No placeholder states** - Full functionality required
3. **Use existing services** - Don't rebuild service layers
4. **Supabase only** - No auth, anonymous data storage
5. **Netlify compatible** - Serverless-ready implementations

## Success Metrics
- All apps show full UI with all features
- No "Coming Soon" placeholders
- Apps accessible from sidebar navigation
- Works with MuAPI API keys
- Ready for Netlify deployment