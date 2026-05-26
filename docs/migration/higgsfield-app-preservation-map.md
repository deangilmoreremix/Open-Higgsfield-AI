# Higgsfield App Preservation Map

**Purpose:** Document every existing app to ensure none are lost during migration  
**Date:** 2026-05-19

## Apps by Status

### Complete Apps (Implementation Exists)
These apps have working implementations in `src/components/`:

| App Name | Route | Component File | Status | Action |
|----------|-------|----------------|--------|--------|
| Image Studio | /image | src/components/ImageStudio.js | Complete | Migrate to Next.js |
| Video Studio | /video | src/components/VideoStudio.js | Complete | Migrate to Next.js |
| Cinema Studio | /cinema | src/components/CinemaStudio.js | Complete | Migrate to Next.js |
| Effects Studio | /effects, /vfx | src/components/EffectsStudio.js | Complete | Migrate to Next.js |
| AI-VFX Studio | /ai-vfx | src/components/AIVFXStudio.js | Complete | **First migration target** |
| Edit Studio | /edit | src/components/EditStudio.js | Complete | Migrate to Next.js |
| Upscale Studio | /upscale | src/components/UpscaleStudio.js | Complete | Migrate to Next.js |
| Library | /library | src/components/LibraryPage.js | Complete | Migrate to Next.js |
| Character Studio | /character | src/components/CharacterStudio.js | Complete | Migrate to Next.js |
| Influencer Studio | /influencer | src/components/InfluencerStudio.js | Complete | Migrate to Next.js |
| Avatar Studio | /avatar | src/components/AvatarStudio.js | Complete | Migrate to Next.js |
| Audio Studio | /audio | src/components/AudioStudio.js | Complete | Migrate to Next.js |
| Training Studio | /training | src/components/TrainingStudio.js | Complete | Migrate to Next.js |
| Video Tools | /videotools | src/components/VideoToolsStudio.js | Complete | Migrate to Next.js |
| Chat Studio | /chat | src/components/ChatStudio.js | Complete | Migrate to Next.js |
| Lip Sync Studio | /lipsync | src/components/LipSyncStudio.js | Complete | Migrate to Next.js |
| Workflow Builder | /workflows | src/components/WorkflowBuilderApp.js | Complete | Migrate to Next.js |
| Agent Studio | /agents | src/components/AgentStudio.js | Complete | Migrate to Next.js |
| Assistant Studio | /assistant | src/components/AssistantStudio.js | Complete | Migrate to Next.js |
| Studio App | /studio | src/components/StudioApp.js | Complete | Migrate to Next.js |
| AI Agent App | /ai-agent | src/components/AIAgentApp.js | Complete | Migrate to Next.js |
| Design Agent App | /design-agent | src/components/DesignAgentApp.js | Complete | Migrate to Next.js |
| Marketing Studio App | /marketing-studio | src/components/MarketingStudioApp.js | Complete | Migrate to Next.js |
| Apps Studio App | /apps-studio | src/components/AppsStudioApp.js | Complete | Migrate to Next.js |
| MCP CLI | /mcp-cli | src/components/McpCliStudio.js | Complete | Migrate to Next.js |
| Video Outreach | /video-outreach | src/components/VideoOutreachStudio.js | Complete | Migrate to Next.js |
| Explore | /explore | src/components/ExplorePage.js | Complete | Migrate to Next.js |
| Assist | /assist | src/components/AssistPage.js | Complete | Migrate to Next.js |
| Community | /community | src/components/CommunityPage.js | Complete | Migrate to Next.js |
| Storyboard | /storyboard | src/components/StoryboardStudio.js | Complete | Migrate to Next.js |
| Text-to-Image | /text-to-image | src/components/TextToImagePage.js | Complete | Migrate to Next.js |
| Image-to-Image | /image-to-image | src/components/ImageToImagePage.js | Complete | Migrate to Next.js |
| Text-to-Video | /text-to-video | src/components/TextToVideoPage.js | Complete | Migrate to Next.js |
| Image-to-Video | /image-to-video | src/components/ImageToVideoPage.js | Complete | Migrate to Next.js |
| Video-to-Video | /video-to-video | src/components/VideoToVideoPage.js | Complete | Migrate to Next.js |
| Video Watermark | /video-watermark | src/components/VideoWatermarkPage.js | Complete | Migrate to Next.js |
| Storyboard Page | /storyboard-page | src/components/StoryboardPage.js | Complete | Migrate to Next.js |
| Character Page | /character-page | src/components/CharacterPage.js | Complete | Migrate to Next.js |
| Effects Page | /effects-page | src/components/EffectsPage.js | Complete | Migrate to Next.js |
| Cinema Page | /cinema-page | src/components/CinemaPage.js | Complete | Migrate to Next.js |
| Influencer Page | /influencer-page | src/components/InfluencerPage.js | Complete | Migrate to Next.js |
| Commercial Page | /commercial-page | src/components/CommercialPage.js | Complete | Migrate to Next.js |
| Upscale Page | /upscale-page | src/components/UpscalePage.js | Complete | Migrate to Next.js |
| Render Page | /render | src/components/RenderPage.js | Complete | Migrate to Next.js |
| Video Agent | /video-agent | src/components/VideoAgentPage.js | Complete | Migrate to Next.js |
| Director | /director | src/components/DirectorPage.js | Complete | Migrate to Next.js |
| Timeline | /timeline | src/components/PlaceholderPage.js | Placeholder | Keep as-is temporarily |
| Remix Go | /remix-go | src/apps/remix-go/index.jsx | Partial | Migrate to proper structure |
| AI Video Outreach | /ai-video-outreach | src/components/AIVideoOutreachPage.js | Complete | Migrate to Next.js |
| Headshot Studio | /ai-headshot, /headshots | src/components/HeadshotStudio.js | Complete | Migrate to Next.js |
| Runway Motion | /runway-motion | src/components/RunwayMotionStudio.js | Complete | Migrate to Next.js |
| TikTok Carousel | /tiktok-carousel | src/components/TikTokCarouselStudio.js | Complete | Migrate to Next.js |
| Advanced Dubbing | /advanced-dubbing | src/components/AdvancedDubbingStudio.js | Complete | Migrate to Next.js |
| Documentation | /documentation | src/components/DocumentationPage.js | Complete | Migrate to Next.js |
| Landing | /landing | src/components/landing/LandingPage.jsx | Complete | Migrate to Next.js |
| Sign In | /signin | src/components/landing/SignInPage.jsx | Complete | Migrate to Next.js |
| Personalizer | /personalizer | src/components/PlaceholderPage.js | Placeholder | Keep as-is temporarily |
| Pomelli Studio | /pomelli-studio | src/components/PomelliStudio.js | Complete | Migrate to Next.js |
| Workflow Studio | /workflow-studio | src/components/WorkflowStudioApp.js | Complete | Migrate to Next.js |

### Shell Apps (Incomplete - src/apps/)
These apps are detected as shells and need proper implementation:

| App ID | Status | Missing | Priority |
|--------|--------|---------|----------|
| agents | shell | FEATURE_CHECKLIST.md, services | High |
| ai-headshot-generator | shell | FEATURE_CHECKLIST.md, assets/, data/ | High |
| design-agent | shell | FEATURE_CHECKLIST.md, services | High |
| marketing-studio | shell | FEATURE_CHECKLIST.md, services | High |
| open-pomelli | shell | FEATURE_CHECKLIST.md, assets/, data/ | Medium |
| remix-go | shell | FEATURE_CHECKLIST.md, assets/, data/ | Medium |
| vibe-workflow | shell | FEATURE_CHECKLIST.md, components/, assets/, hooks/, data/ | High |
| workflows | shell | FEATURE_CHECKLIST.md, components/, services/, assets/, hooks/, data/ | High |

### External Apps (apps/ directory)
These are separate Vite apps that run on different ports:

| App | Location | Status | Migration Path |
|-----|----------|--------|----------------|
| agents-app | apps/agents-app | Complete | Consolidate into main app |
| ai-video-outreach | apps/ai-video-outreach | Complete | Consolidate into main app |
| assistant-app | apps/assistant-app | Complete | Consolidate into main app |
| studio-app | apps/studio-app | Complete | Consolidate into main app |
| vibe-workflow | apps/vibe-workflow | Complete | Consolidate into main app |
| workflow-app | apps/workflow-app | Complete | Consolidate into main app |

## Preservation Strategy

### Phase 1: Foundation
1. Create Next.js shell
2. Set up workspace packages
3. Migrate AI-VFX first (closest to complete React)

### Phase 2: Core Apps
Migrate apps that have complete implementations:
1. Image Studio
2. Video Studio
3. Cinema Studio
4. Effects Studio
5. AI-VFX Studio (first)
6. Edit Studio
7. Upscale Studio

### Phase 3: Upstream Packages
1. workflow-builder (from upstream)
2. agents (from upstream)
3. design-agent (from upstream)

### Phase 4: Remaining Apps
1. All remaining /apps routes
2. Consolidate external apps
3. Remove shell apps from src/apps/

## Verification Checklist

Before each phase:
- [ ] Backup branch created
- [ ] List of apps to preserve documented
- [ ] Migration notes for each app
- [ ] Validation script updated

After each phase:
- [ ] All routes accessible
- [ ] No broken imports
- [ ] Build passes
- [ ] apps:validate passes