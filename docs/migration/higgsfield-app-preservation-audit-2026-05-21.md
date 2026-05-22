# Higgsfield App Preservation Audit Report

**Generated:** 2026-05-21  
**Branch:** feat/migrate-higgsfield-to-upstream-stack  
**Repository:** deangilmoreremix/Open-Higgsfield-AI  
**Auditor:** Kilo (migration architect)

## Executive Summary

This report verifies that **none of the existing Higgsfield applications** listed by the user have been removed or deleted during the ongoing stack migration to a Next.js + workspace architecture.

**Key Finding:** All 40+ apps from the user's preservation list remain fully present in the codebase under `src/components/` and `src/apps/`. The original routing system (`src/lib/router.js`) is untouched in terms of app definitions.

The migration work completed so far has been **strictly additive**:
- New Next.js `app/` directory (parallel migration layer)
- New `packages/` workspace structure
- New shell entries under `src/apps/` (only for 8 upstream-inspired apps that were already incomplete)

No files were deleted from the original Higgsfield implementation.

## Audit Methodology

- Source of truth: `src/lib/router.js` (ROUTE_MAP + pageLoaders)
- Component inventory: `src/components/` directory
- App dashboard: `src/components/AppsStudioApp.js` and `src/components/AppsHub.js`
- Additional locations: `src/apps/`, `app/` (Next.js layer — for migration only)

## Complete App Inventory

| App Name                  | Primary Route(s)                  | Main Component File(s)                          | Additional Routes / Notes                          | Status          | Migration Notes |
|---------------------------|-----------------------------------|-------------------------------------------------|----------------------------------------------------|-----------------|-----------------|
| Image Studio              | `image`                           | `src/components/ImageStudio.js`                 | -                                                  | Complete        | Core studio |
| Video Studio              | `video`                           | `src/components/VideoStudio.js`                 | -                                                  | Complete        | Core studio |
| Cinema Studio             | `cinema`                          | `src/components/CinemaStudio.js`                | `cinema-page`                                      | Complete        | Core studio |
| Character Studio          | `character`                       | `src/components/CharacterStudio.js`             | `character-page`                                   | Complete        | - |
| Influencer Studio         | `influencer`                      | `src/components/InfluencerStudio.js`            | `influencer-page`                                  | Complete        | - |
| Storyboard Studio         | `storyboard`                      | `src/components/StoryboardStudio.js`            | `storyboard-page`                                  | Complete        | - |
| Effects Studio            | `effects`, `vfx`                  | `src/components/EffectsStudio.js`               | `effects-page`, `effects/template/*`               | Complete        | - |
| Edit Studio               | `edit`                            | `src/components/EditStudio.js`                  | -                                                  | Complete        | - |
| Upscale Studio            | `upscale`                         | `src/components/UpscaleStudio.js`               | `upscale-page`                                     | Complete        | - |
| Audio                     | `audio`                           | `src/components/AudioStudio.js`                 | -                                                  | Complete        | - |
| Avatar                    | `avatar`                          | `src/components/AvatarStudio.js`                | -                                                  | Complete        | - |
| Training                  | `training`                        | `src/components/TrainingStudio.js`              | -                                                  | Complete        | - |
| Video Tools               | `videotools`                      | `src/components/VideoToolsStudio.js`            | -                                                  | Complete        | - |
| Render                    | `render`                          | `src/components/RenderPage.js`                  | -                                                  | Complete        | - |
| Video Agent               | `video-agent`                     | `src/components/VideoAgentPage.js`              | -                                                  | Complete        | - |
| Outreach                  | `video-outreach`                  | `src/components/VideoOutreachStudio.js`         | -                                                  | Complete        | - |
| AI Video Outreach         | `ai-video-outreach`               | `src/components/AIVideoOutreachPage.js`         | -                                                  | Complete        | - |
| Director                  | `director`                        | `src/components/DirectorPage.js`                | -                                                  | Complete        | - |
| Timeline                  | `timeline`, `timeline-test`       | `src/components/PlaceholderPage.js`, `TimelineTestPage.jsx` | Marked as placeholder                              | Partial (Placeholder) | Needs implementation |
| Motion                    | `runway-motion`                   | `src/components/RunwayMotionStudio.js`          | -                                                  | Complete        | - |
| TikTok                    | `tiktok-carousel`                 | `src/components/TikTokCarouselStudio.js`        | -                                                  | Complete        | - |
| Dubbing                   | `advanced-dubbing`                | `src/components/AdvancedDubbingStudio.js`       | -                                                  | Complete        | - |
| Chat                      | `chat`                            | `src/components/ChatStudio.js`                  | -                                                  | Complete        | - |
| Commercial                | `commercial`                      | `src/components/CommercialStudio.js`            | `commercial-page`                                  | Complete        | - |
| Templates                 | `templates`                       | `src/components/TemplatesPage.js`               | `template/*`, `effects/template/*`                 | Complete        | - |
| Explore                   | `explore`                         | `src/components/ExplorePage.js`                 | -                                                  | Complete        | - |
| Library                   | `library`                         | `src/components/LibraryPage.js`                 | -                                                  | Complete        | - |
| Community                 | `community`                       | `src/components/CommunityPage.js`               | -                                                  | Complete        | - |
| Assist                    | `assist`                          | `src/components/AssistPage.js`                  | -                                                  | Complete        | - |
| Settings                  | (via shell)                       | Settings modal inside main shell                | -                                                  | Complete        | Part of main shell |
| AI-VFX                    | `ai-vfx`                          | `src/components/AIVFXStudio.js`                 | -                                                  | Complete        | **Priority migration target** |
| Remix Go                  | `remix-go`                        | `src/apps/remix-go/index.jsx`                   | -                                                  | Partial         | Already partially structured |
| Marketing                 | `marketing-studio`                | `src/components/MarketingStudioApp.js`          | -                                                  | Complete        | - |
| Workflow                  | `workflows`, `workflow-builder`   | `src/components/WorkflowBuilderApp.js`, `WorkflowReactBridge.jsx` | `workflows/editor`, `workflows/history`, `workflows/settings` | Complete | Multiple entry points |
| Agents                    | `agents`, `ai-agent`              | `src/components/AgentStudio.js`, `AIAgentApp.js` | `agents/create`, `agents/edit`                     | Complete        | - |
| Design Agent              | `design-agent`                    | `src/components/DesignAgentApp.js`              | -                                                  | Complete        | - |
| Pomelli                   | `pomelli-studio`                  | `src/components/PomelliStudio.js`               | -                                                  | Complete        | - |
| Headshots                 | `headshots`, `ai-headshot`        | `src/components/HeadshotStudio.js`              | `headshots-generate`, `headshots-history`, `headshots-settings` | Complete | - |
| MCP & CLI                 | `mcp-cli`                         | `src/components/McpCliStudio.js`                | -                                                  | Complete        | - |
| Assistant                 | `assistant`                       | `src/components/AssistantStudio.js`             | -                                                  | Complete        | - |
| Studio (Unified)          | `studio`                          | `src/components/StudioApp.js`                   | `apps-studio`                                      | Complete        | - |
| Workflow Studio           | `workflow-studio`                 | `src/components/WorkflowStudioApp.js`           | -                                                  | Complete        | - |

### Additional Apps / Routes Found in Code (Not Explicitly Listed by User)

- Text-to-Image / Image-to-Image / Text-to-Video / Image-to-Video / Video-to-Video / Video-Watermark
- Documentation
- Landing Page + Sign In
- Personalizer (Placeholder)
- `apps-studio` (entry point to AppsStudioApp)

## Apps Dashboard (User's Primary Concern)

The main "Apps" experience the user refers to is implemented in:

- **Primary Apps Hub**: `src/components/AppsHub.js` (loaded via router `apps`)
- **Studio Apps View**: `src/components/AppsStudioApp.js` (loaded via `apps-studio`)

Both files remain complete and untouched.

## Conclusion

**No apps have been removed.**

Every application the user listed above still exists with its original component implementation and routing definition. The original Higgsfield application experience (Vite + custom router + `src/components/`) is fully preserved.

All migration work to date has respected the rule: **"My Higgsfield product remains the master product."**

---

**Next Recommended Action:**  
Proceed with integrating the new Next.js + workspace architecture *around* the existing `AppsHub.js` / `AppsStudioApp.js` experience rather than creating parallel dashboards.

Report generated by Kilo on 2026-05-21.