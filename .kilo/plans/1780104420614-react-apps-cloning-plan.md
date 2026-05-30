# React Apps Cloning Plan - No Shells Allowed

## Objective
Clone and integrate the following repositories as FULL React applications (not shells) into the Higgsfield monorepo:

### Target Repositories
1. `https://github.com/deangilmoreremix/Open-Pomelli`
2. `https://github.com/deangilmoreremix/Vibe-Workflow` 
3. `https://github.com/deangilmoreremix/ai-headshot-generator`
4. `https://github.com/deangilmoreremix/videoremixai-vfx`
5. Apps from `https://github.com/Anil-matcha/Open-Generative-AI` (Image, Video, LipSync, Cinema, Workflow studios)

## Current State Analysis

### Existing Shell Apps (Need Full Implementation)
| Location | App ID | Current Status | Needed Changes |
|----------|--------|---------------|----------------|
| `/src/apps/open-pomelli/` | open-pomelli | Shell (42-line React placeholder) | Full Brand DNA, Campaign, Photo Studio, Animate features |
| `/src/apps/vibe-workflow/` | vibe-workflow | Shell (42-line React placeholder) | Full node-based workflow editor |
| `/src/apps/ai-headshot-generator/` | ai-headshot-generator | Shell (has some components but marked incomplete) | Full headshot generation studio |
| `/src/apps/workflows/` | workflows | Shell (42-line React placeholder) | Full workflow management |
| `/src/apps/agents/` | agents | Shell | Full AI agents interface |
| `/src/apps/design-agent/` | design-agent | Shell | Full brand design tools |
| `/src/apps/remix-go/` | remix-go | Shell | Full Remix-based editor |
| `/src/apps/marketing-studio/` | marketing-studio | Shell | Full marketing automation |

### Standalone Apps (Already React but Need Integration)
| Location | App | Framework | Status |
|----------|-----|-----------|--------|
| `/apps/assistant-app/` | assistant-app | React/Vite | Complete - needs integration |
| `/apps/studio-app/` | studio-app | React/Vite | Complete - needs integration |
| `/apps/workflow-app/` | workflow-app | React/Vite | Complete - needs integration |
| `/apps/ai-video-outreach/` | ai-video-outreach | ? | Partial - needs check |
| `/apps/vimax/` | vimax | ? | Minimal placeholder |

## Architecture Requirements

### Tech Stack (Mandatory - No Auth)
- **Supabase** (no authentication) - for data storage only
- **OpenAI** - for LLM features (prompt enhancement, chat)
- **MuAPI** - for all AI generation (image, video, VFX)
- **Netlify** - for main app hosting

### Integration Pattern
Each app must:
1. Be a complete React component with full features
2. Use the unified layout system from `@higgsfield/layout`
3. Be accessible via Next.js route `/apps/{appId}` or `/{route}`
4. Have proper manifest with `status: 'complete'`
5. Integrate with shared UI package

## Implementation Phases

### Phase 1: Open-Pomelli Integration (Brand DNA + Campaign Studio)
**Source**: Next.js 16 → Higgsfield Next.js + Vite monorepo

**Features to Clone**:
- Brand DNA extraction via URL scraping
- Editable brand profile (colors, fonts, tone chips)
- Campaign generation (6 goals → 4 concepts)
- Platform-specific asset generation (8 formats)
- In-browser canvas editor (9-position grid)
- AI Photo Studio (6 categories × 5 styles = 30 presets)
- Image-to-video animation (seedance-lite-i2v)

**Changes Required**:
- Replace SQLite with Supabase storage (no auth)
- Adapt scraping to work in serverless (Edge Functions)
- Use shared MuAPI adapter from `packages/shared-adapters`
- Integrate unified layout
- Remove Playwright SSR blocking for serverless

### Phase 2: Vibe-Workflow Integration (Node-Based Editor)
**Source**: Monorepo (Next.js + FastAPI) → React/Vue/Vanilla in studio

**Features to Clone**:
- Node-based workflow editor canvas
- Drag-and-drop node positioning
- Node type library (AI providers)
- Workflow execution engine
- Results display and download

**Changes Required**:
- Convert Python backend to Vite-compatible React hooks
- Use shared MuAPI/OpenAI adapters
- Integrate into unified layout system
- No auth - use localStorage for workflow persistence

### Phase 3: AI-Headshot-Generator Integration (Portrait Studio)
**Source**: Next.js 15 + Prisma + Auth → No-auth React

**Features to Clone**:
- Multi-image reference generation
- Style selection (Business, Creative, Glamour, etc.)
- Resolution options (1K, 2K, 4K)
- Headshots gallery/archive
- Download/export functionality

**Changes Required**:
- Remove NextAuth/Google OAuth
- Remove Stripe/paywall features
- Replace PostgreSQL with Supabase (no auth)
- Use shared MuAPI adapter
- Integrate unified layout

### Phase 4: VideoRemixAI-VFX Integration (37 VFX Effects)
**Source**: Next.js → React/Vite monorepo

**Features to Clone**:
- 37 cinematic VFX effects
- 50+ camera movements
- 30+ special effects
- Aspect ratio selection
- Resolution controls (480p, 720p)
- Duration settings (3-12s)
- Video preview and download

**Changes Required**:
- Remove auth/key management
- Use shared MuAPI adapter
- Integrate unified layout
- Connect to existing VFX infrastructure in `packages/ai-vfx`

### Phase 5: Open-Generative-AI Studios Integration
**Source**: Next.js monorepo → Higgsfield monorepo

**Studios to Integrate**:
- **Image Studio** - Already partially exists (extend)
- **Video Studio** - Already partially exists (extend)
- **LipSync Studio** - New integration
- **Cinema Studio** - Already partially exists (extend)
- **Workflow Studio** - Combine with Vibe-Workflow

## Detailed Implementation Steps

### Step 1: Repository Cloning
```bash
# Clone each repo to /apps directory as baseline
git clone https://github.com/deangilmoreremix/Open-Pomelli apps/open-pomelli-full
git clone https://github.com/deangilmoreremix/Vibe-Workflow apps/vibe-workflow-full
git clone https://github.com/deangilmoreremix/ai-headshot-generator apps/ai-headshot-full
git clone https://github.com/SamurAIGPT/AI-VFX apps/ai-vfx-full
```

### Step 2: Clean Each Repo (No Auth Rules)
- Delete all auth-related files (NextAuth, OAuth configs)
- Remove Stripe/payment components
- Remove user-specific database schemas
- Replace with Supabase-only storage

### Step 3: Component Conversion
- Convert all Vue components to React (for consistency)
- Convert class components to function components
- Use hooks from `packages/shared-adapters`
- Ensure all API calls go through shared adapters

### Step 4: Layout Integration
- Wrap each app with `AppShell` from `@higgsfield/layout`
- Apply appropriate theme (`theme-violet`, `theme-cinematic`, etc.)
- Connect to main navigation sidebar

### Step 5: Route Registration
- Update `src/lib/appRegistry.js` to mark apps as `status: 'complete'`
- Ensure routes work with hash navigation (`#/{appId}`)
- Add loading states with proper ErrorBoundary

### Step 6: Testing
- Verify each app loads without errors
- Test AI generation flows end-to-end
- Ensure no auth prompts appear
- Validate responsive design

## Tech Stack Mapping

| Original | Higgsfield Replacement |
|----------|---------------------|
| SQLite | Supabase (no auth) |
| NextAuth | None |
| Prisma | Direct Supabase client |
| Stripe | None |
| Playwright (browser) | Edge Functions proxy for SSR |
| FastAPI | React hooks + Supabase |

## File Structure After Integration

```
src/
  apps/
    open-pomelli/
      manifest.js (update status to 'complete')
      components/
        BrandDNAPanel.jsx (full implementation)
        CampaignGenerator.jsx
        AssetEditor.jsx
        PhotoStudio.jsx
        AnimatePanel.jsx
      hooks/
        useBrandDNA.js
        useCampaignGeneration.js
        useAssetEditor.js
    ai-headshot-generator/
      manifest.js (update status to 'complete')
      components/
        HeadshotStudio.jsx (full implementation)
        StyleSelector.jsx
        MultiImagePicker.jsx
      hooks/
        useHeadshotGeneration.js
    ai-vfx/
      manifest.js (update status to 'complete')
      components/
        VFXStudio.jsx (full implementation)
        VFXPanel.jsx
        EffectSelector.jsx
      hooks/
        useVFXGeneration.js
    lipsync/
      manifest.js
      components/
        LipSyncStudio.jsx
      hooks/
        useLipSync.js
hpackages/
  studio/
    src/
      components/
        # Reuse existing studio components where possible
      muapi.js (shared adapter)
      openai.js (shared adapter)
```

## Restrictions (NO SHELLS ALLOWED)
1. **NO placeholder components** - Every app must have full functionality
2. **NO authentication** - Remove all auth flows entirely
3. **NO payment/subscription code** - Remove Stripe/Paywall logic
4. **NO user-specific features** - All data stored anonymously in Supabase
5. **All API calls through shared adapters** - Use `packages/shared-adapters`

## Success Criteria
- Each app shows full UI with all features visible
- No "Coming Soon" or placeholder states
- All AI generation works with MuAPI keys
- Apps accessible from main sidebar navigation
- No login/auth prompts anywhere
- Works with Netlify deployment

## Execution Order
1. Open-Pomelli (Brand DNA + Photo Studio)
2. AI-Headshot-Generator (Portrait Studio)
3. AI-VFX (37 VFX Effects)
4. Vibe-Workflow (Node Editor)
5. LipSync Studio
6. Workflow Studio consolidation