# MISSING_ASSETS.md

## Overview
This document tracks assets that may be referenced in the upstream Workflows app but not yet migrated to this standalone version.

## Potentially Missing Assets

### External CDN Assets
The upstream app uses several external CDN resources for thumbnails and effects. These are referenced but not bundled locally:
- Effect thumbnails from `d3adwkbyhxyrtq.cloudfront.net`
- Motion control thumbnails from CDN
- AI effects preview images

### How These Are Handled
1. **Demo Mode**: When API keys are not configured, the app uses placeholder images from `picsum.photos` for generated content
2. **External URLs**: Templates can reference external thumbnail URLs - these will load when internet available
3. **Lazy Loading**: Assets load on-demand rather than being pre-bundled

## Assets Successfully Migrated
- Node type icons (via react-icons)
- UI icons (via react-icons)
- Workflow thumbnails (via picsum.photos placeholders)

## Future Asset Additions
If you want to add custom thumbnails:
1. Place image files in `src/assets/`
2. Update template definitions in `src/data/workflowTemplates.js`
3. Import images using relative paths

## Implementation Notes
The app works fully without bundled assets by using:
- Placeholder services (picsum.photos)
- Icon libraries (react-icons)
- External URLs where applicable