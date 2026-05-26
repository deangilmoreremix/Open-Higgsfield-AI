# Marketing Studio Migration Notes

## Source Repo
- **Upstream**: https://github.com/Anil-matcha/Open-Generative-AI
- **Main Component**: `packages/studio/src/components/MarketingStudio.jsx`

## Original Upstream File Locations

| Component | Upstream Path |
|-----------|---------------|
| MarketingStudio Component | `packages/studio/src/components/MarketingStudio.jsx` |
| MuAPI Client | `packages/studio/src/muapi.js` |
| Package Entry | `packages/studio/src/index.js` |
| Styles | `packages/studio/src/tailwind.css` |

## Marketing Studio Routes/Pages

The Marketing Studio is a single-page application. It does not have multiple routes within itself - it's a tabbed/studio view accessible from the main app navigation.

**Single Screen**: Main Marketing Studio interface for AI-powered video ad generation

## Marketing Studio Components

### Main Component
- `MarketingStudio.jsx` - Full-screen React component with state management

### Child Components (defined within MarketingStudio.jsx)
- `UploadSlot` - Circular upload button with progress indicator
- `Dropdown` - Grid-based media selector (3 columns) for avatar/UGC presets
- `SimpleDropdown` - Simple list dropdown for text options

### Icon Components
- `CheckSvg` - Checkmark icon
- `PlusSvg` - Plus icon
- `CloseSvg` - Close/X icon
- `ProductIcon` - Product image icon
- `AvatarIcon` - Avatar/person icon
- `RefIcon` - Reference image icon

## Forms/Inputs

1. **Prompt Textarea** - Multi-line text input for ad script/prompt
2. **Product Image Upload** - Single image upload slot
3. **Avatar Image Upload** - Single image upload slot
4. **Additional Images Upload** - Multiple reference images (up to 6)
5. **Format Dropdown** - UGC video style preset selection
6. **Avatar Preset Dropdown** - Pre-defined avatar selection
7. **Ratio Dropdown** - Aspect ratio selection (9:16, 3:4, etc.)
8. **Resolution Dropdown** - Video resolution (720p, 1080p)
9. **Duration Dropdown** - Video duration (4-15 seconds)
10. **Generate Button** - Submit/Launch generation

## Generation Workflows

1. **File Upload** → `uploadFile()` via XHR with progress tracking
2. **Video Generation** → `generateMarketingStudioAd()` 
3. **History Display** - Generated videos shown in grid with download option

## Prompt Templates / Data

### Avatar Presets (8 items)
| Name | URL |
|------|-----|
| Priya | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/Priya.webp` |
| Elena | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/Elena.webp` |
| Kai | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/Kai.webp` |
| Sora | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/Sora.webp` |
| Minji | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/Minji.webp` |
| Margot | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/Margot.webp` |
| Niko | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/Niko.webp` |
| Jin | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/Jin.webp` |

### UGC Video Presets (6 items)
| Name | URL |
|------|-----|
| UGC | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc.mp4` |
| Tutorial | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_how_to.mp4` |
| Unboxing | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/ugc_unboxing.mp4` |
| Hyper Motion | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/hyper-motion-mini.mp4` |
| Product Review | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/product_review.mp4` |
| TV Spot | `https://d3adwkbyhxyrtq.cloudfront.net/web-app/tv-spot-mini.mp4` |

## Model/API Calls

### From `muapi.js`:
- `uploadFile(apiKey, file, onProgress)` - POST `/api/v1/upload_file`
- `generateMarketingStudioAd(apiKey, params)` - Two-step polling pattern

### generateMarketingStudioAd Parameters:
```javascript
{
  prompt: string,
  aspect_ratio: string,      // e.g., "9:16"
  duration: number,          // 4-15
  images_list: string[],     // [productImage, avatarImage, ...additionalImages]
  video_files: string[],     // [selectedUgcUrl]
  resolution: string         // "720p" or "1080p"
}
```

### Endpoint Selection:
- `sd-2-vip-omni-reference-1080p` for 1080p
- `seedance-2-vip-omni-reference` for 720p

## Styling Dependencies

- Tailwind CSS v3
- Custom scrollbar styles (inline CSS)
- Glassmorphism dark theme
- Keyframe animations (`animate-fade-in-up`)

## Environment Variables

- `VITE_OPENAI_API_KEY` - Optional for prompt enhancement (not used in current upstream)
- `VITE_MUAPI_API_KEY` - Required for MuAPI generation

## Backend/Server Assumptions

The upstream Marketing Studio requires:
- MuAPI.ai API endpoint (`https://api.muapi.ai`)
- File upload endpoint
- Two-step generation pattern (submit → poll result)

## Features Found

### Complete Features:
- [x] Product image upload with drag/click
- [x] Avatar image upload with preset selection
- [x] Multiple reference image uploads (up to 6)
- [x] UGC video style presets
- [x] Aspect ratio selection
- [x] Resolution selection
- [x] Duration selection
- [x] Prompt input with auto-expanding textarea
- [x] Generation with loading state
- [x] History grid display
- [x] Video playback in history
- [x] Download generated videos
- [x] Fullscreen video preview
- [x] Clear/remove uploaded images

## Missing or Unclear Features

- No OpenAI integration for prompt enhancement in current version
- No campaign/project saving
- No template save/load
- No batch generation

## Files Copied

| File | Status |
|------|--------|
| MarketingStudio.jsx | Adapted |
| muapi.js functions | Reimplemented in adapters |

## Files Adapted

- Complete UI rewritten for standalone Vite app
- Service layer created for API abstraction
- Adapters created for OpenAI and MuAPI

## Files Replaced

- `muapi.js` → `adapters/muapiAdapter.js` + `services/marketingStudioService.js`

## Files Intentionally Excluded

- None - all meaningful features from upstream are included