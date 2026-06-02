# Feature Checklist

## Source Repos
- Upstream: https://github.com/deangilmoreremix/Open-Higgsfield-AI
- Fork: local src/apps/ai-headshot-generator

## Required Screens
- [x] Main screen (index.jsx)
- [ ] Headshot generation screen
- [ ] History screen
- [ ] Settings screen

## Required Components
- [ ] Input/prompt area
- [x] Upload area (HeadshotPreview.jsx)
- [x] Presets/templates (headshot styles)
- [x] Generate/run button
- [x] Progress/status
- [x] Preview/result area
- [ ] Download/export
- [ ] Save to Library
- [ ] Handoff buttons if applicable

## Required Services
- [x] API/generation service (headshotService.js)
- [ ] Status/polling service if applicable
- [ ] Upload/storage service if applicable
- [ ] Supabase persistence if applicable
- [ ] MuAPI adapter if applicable
- [ ] OpenAI adapter if applicable
- [ ] Output handoff service if applicable

## Required Assets
- [ ] Thumbnail
- [ ] Icons
- [ ] Demo/sample images if applicable
- [ ] Demo/sample videos if applicable
- [ ] Template previews if applicable

## Definition of Done
- [ ] Not a shell
- [ ] Route loads
- [ ] Generate headshot works
- [ ] Result previews
- [ ] Build passes