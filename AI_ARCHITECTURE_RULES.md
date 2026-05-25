# Higgsfield AI Architecture Rules

## Purpose

This file tells every AI coding agent exactly how Higgsfield must be built, protected, and extended.

Higgsfield is the master application.

No upstream repo, imported app, React conversion, or new feature is allowed to replace, shrink, redesign, or take over Higgsfield.

---

## Core Rule

Do not rebuild Higgsfield as the upstream repo.

The upstream repo may be used for reference, components, layouts, or feature inspiration only.

Higgsfield must remain the parent shell.

---

## Current Higgsfield Stack

Use only:

- Vite
- React
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Edge Functions
- Netlify
- Netlify Functions
- MuAPI for image, video, audio, TTS, avatars, and media generation
- OpenAI/Gemini only for LLM logic

Do not add:

- Prisma
- NextAuth
- Clerk
- Firebase Auth
- MongoDB
- Express backend unless explicitly requested
- Upstream repo authentication
- Upstream repo database layer

---

## Master App Rule

Higgsfield controls:

- Routing
- Sidebar
- Header
- Layout
- App registry
- Settings modal
- API key modal
- Supabase client
- MuAPI client
- Media library
- Render handoff
- Director handoff
- Timeline handoff
- Video Agent handoff

Imported apps do not control the shell.

---

## Do Not Remove Existing Apps

Never remove, rename, hide, or overwrite existing Higgsfield apps unless explicitly instructed.

Protected apps include:

- Image
- Video
- Cinema
- Headshots
- AI Headshot
- Character
- AI-VFX
- Influencer
- Storyboard
- Effects
- VFX
- Edit
- Upscale
- Audio
- Avatar
- Training
- Video Tools
- Render
- Video Agent
- Outreach
- Director
- Timeline
- Motion
- TikTok
- Dubbing
- Chat
- Commercial
- Templates
- Explore
- Library
- Community
- Marketing
- Workflow
- Agents
- Design Agent
- Pomelli
- Assist
- Remix Go
- AI Video Outreach
- Settings

---

## Design Protection Rule

These apps have their own design and must not be redesigned to match the upstream repo:

- Render
- Video Agent
- Outreach
- Director
- Timeline
- Remix Go
- AI Video Outreach

Leave their UI, layout, styling, and app-specific design intact.

Only fix bugs, routing, build issues, and integration problems.

---

## Upstream Integration Rule

When adding an upstream app:

1. Place it inside:

```txt
src/apps/[app-id]/
```

2. It must export one main React component:

```jsx
export default function AppName() {
  return <div>...</div>;
}
```

3. It must be registered in the Higgsfield app registry.
4. It must use Higgsfield routing.
5. It must use Higgsfield layout.
6. It must use Higgsfield Supabase and MuAPI clients.
7. It must not bring its own router, auth, database, or global shell.

---

## App Registry Rule

All apps must be declared in one central registry.

Example:

```json
{
  "id": "ai-vfx",
  "name": "AI-VFX",
  "route": "/ai-vfx",
  "category": "Video",
  "thumbnail": "/thumbnails/ai-vfx.svg",
  "component": "AIVFXApp",
  "protectedDesign": true
}
```

The sidebar, app cards, search, routing, and launch buttons must use this registry.

---

## No Shell App Rule

An app is not complete unless it has:

- Real UI
- Real controls
- Real form inputs
- Working buttons
- Working state
- Working API connection
- Loading state
- Error state
- Output preview
- Save to Library option
- Handoff to Render/Director/Timeline where relevant

Placeholder cards, fake buttons, empty pages, mock-only screens, and "coming soon" pages are not acceptable.

---

## Media Handoff Rule

Any app that creates media must support handoff to:

- Library
- Render
- Director
- Timeline
- Video Agent

Generated media should include:

```json
{
  "id",
  "type",
  "sourceApp",
  "prompt",
  "url",
  "thumbnailUrl",
  "createdAt",
  "metadata"
}
```

---

## React Conversion Rule

When converting Vanilla JS to React:

Do not change the product behavior.

Preserve:

- Existing routes
- Existing app IDs
- Existing app names
- Existing thumbnails
- Existing controls
- Existing templates
- Existing categories
- Existing styling unless instructed
- Existing MuAPI workflows

Convert structure only.

Do not use the React conversion as an excuse to simplify the product.

---

## Validation Checklist

Before finishing, verify:

- Every old Higgsfield route still loads
- Every imported app loads
- No app is replaced by a shell
- Sidebar still contains all apps
- App registry includes every app
- Thumbnails still appear
- MuAPI calls work
- Supabase save works
- Netlify build passes
- No upstream auth/database was added
- Protected design apps were not redesigned

---

## Final Instruction

If a change conflicts with this file, stop and explain the conflict before editing.

This file is the source of truth.
