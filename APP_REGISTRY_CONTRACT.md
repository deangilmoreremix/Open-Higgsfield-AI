# App Registry Contract

This document defines what it means for an app to be "real" vs a "shell" placeholder, and the minimum bar every Higgsfield app must meet before it can be registered in the app registry and considered complete.

---

## Purpose

The App Registry Contract exists to prevent the creation of placeholder apps — empty shells that exist in the sidebar or routing but have no real functionality. Every app in Higgsfield must be a complete, working application.

This is a signed contract between the implementation and the product. An app is not "done" until all contracts are satisfied.

---

## Minimum Viable App Requirements

For any app to be considered real (not a shell), it MUST have ALL of the following:

### 1. Real UI Components
- [ ] A visible, styled page layout that matches the app's purpose
- [ ] App-specific header, controls, and content area
- [ ] No "Coming Soon", "TBD", or "Placeholder" text on the main page
- [ ] Proper loading skeleton or spinner while content loads

### 2. Real Controls
- [ ] Every button does something real (not disabled or logged only)
- [ ] Forms accept real input and validate it properly
- [ ] Dropdowns, tabs, toggles, and sliders all function
- [ ] No fake/mock-only controls that do not affect state

### 3. Real API Connection
- [ ] App connects to MuAPI or Supabase for its primary function
- [ ] API calls are wired to real endpoints with real API keys
- [ ] Loading states reflect actual API calls in flight
- [ ] Error states communicate real failure modes (not just "Error: error")

### 4. Real Output
- [ ] Generated media, created content, or computed results are visible
- [ ] Output is previewable/playable/viewable
- [ ] Output persists or can be saved to Library
- [ ] Thumbnails render for generated content

### 5. Working Navigation
- [ ] App route loads the app (not a redirect or error page)
- [ ] Navigation between sub-views within the app works
- [ ] Browser back/forward does not break the app
- [ ] Deep links to the app resolve correctly

### 6. Media Handoff (if applicable)
- [ ] Generated media can be sent to Library
- [ ] Generated media can be sent to Render (if video/image output)
- [ ] Generated media can be sent to Director (if video output)
- [ ] Generated media can be sent to Timeline (if video/audio output)
- [ ] Handoff uses shared `sessionStorage` keys documented in the system

### 7. State Management
- [ ] App maintains its own state correctly across navigation
- [ ] State persists within a session
- [ ] Loading/error/success states are managed properly
- [ ] No silent state failures (errors must be surfaced to the user)

### 8. Error Handling
- [ ] API failures show meaningful error messages to the user
- [ ] Network failures are caught and reported
- [ ] Invalid user input is validated and errors shown
- [ ] No uncaught JS errors in the console

---

## Verification Per App

For each app, before marking it complete, the implementing agent must answer:

```
App: [app-name]
Route: [route-path]

1. UI: What page layout does this app render? _______________
2. Controls: List the primary input controls (forms, buttons, etc.) and what each one does: _______________
3. API: What MuAPI/Supabase endpoint does this app call? _______________
4. Output: What does this app produce? (image, video, audio, text, etc.) _______________
5. Handoff: Which handoff targets does this app support? _______________
6. Navigation: What routes does this app use internally? _______________
7. State: What state does this app manage? _______________
8. Errors: What error states can occur and how are they shown? _______________

SHELL_CHECK: Is this a real app with all 8 sections filled out with real content? YES/NO
If NO, which contracts are not met? _______________
```

If any answer is "none", "mock", "N/A", or "placeholder", the app is NOT complete.

---

## Shared Handoff Storage Keys

Apps that generate media must use these shared storage keys for handoff:

```javascript
// Library handoff
sessionStorage.setItem('higgsfield.pendingLibraryOutput', JSON.stringify({ ... }))

// Render handoff
sessionStorage.setItem('higgsfield.pendingRenderOutput', JSON.stringify({ ... }))

// Director handoff
sessionStorage.setItem('higgsfield.pendingDirectorOutput', JSON.stringify({ ... }))

// Timeline handoff
sessionStorage.setItem('higgsfield.pendingTimelineOutput', JSON.stringify({ ... }))

// Video Agent handoff
sessionStorage.setItem('higgsfield.pendingVideoAgentOutput', JSON.stringify({ ... }))
```

Each handoff payload must include:

```json
{
  "id": "unique-id",
  "type": "image|video|audio|text",
  "sourceApp": "app-id",
  "prompt": "original prompt used",
  "url": "media-url-or-null",
  "thumbnailUrl": "thumbnail-url-or-null",
  "createdAt": "ISO-8601-timestamp",
  "metadata": {}
}
```

---

## App Registry Entry Template

Every app in the registry must have this structure:

```json
{
  "id": "unique-app-id",
  "name": "Display Name",
  "route": "/route-path",
  "category": "Core|Video|Image|Audio|Imported",
  "description": "One sentence description of what this app does",
  "thumbnail": "/thumbnails/app-id.svg",

  "component": {
    "file": "src/components/AppName.js",
    "type": "react|vanilla",
    "exports": ["default"]
  },

  "contracts": {
    "hasRealUI": true,
    "hasRealControls": true,
    "hasRealAPICall": true,
    "hasRealOutput": true,
    "hasWorkingNavigation": true,
    "hasMediaHandoff": false,
    "hasStateManagement": true,
    "hasErrorHandling": true
  },

  "handoffs": ["library", "render", "director", "director", "timeline"],

  "protectedDesign": false,

  "migrationStatus": "原生|converted|in-progress|pending"
}
```

---

## Shell App Rejection Criteria

An app will be rejected from the registry (or removed if added) if:

1. It shows placeholder/mock content without real API calls
2. All buttons are disabled or log to console without doing real work
3. It renders "Coming Soon" or similar instead of real UI
4. It has no output or the output cannot be accessed/saved
5. Navigation to its route shows an error or redirects to another app
6. It has no real controls — just static display content
7. It brings its own router, auth, or shell instead of using Higgsfield's

---

## Enforcement

Before any PR is merged that adds or modifies an app, the reviewer must:

1. Checkout the branch
2. Run the app by navigating to its route
3. Fill out the Verification Per App template above
4. Confirm SHELL_CHECK = YES
5. Test at least one real end-to-end flow (e.g., generate something and handoff to Library)

If SHELL_CHECK = NO, the PR is rejected with a comment listing which contracts are not met.

---

## Current App Registry

The authoritative list of all Higgsfield apps and their contract status:

| App ID | Route | Status | Real UI | Real API | Real Output | Handoffs |
|--------|-------|--------|---------|----------|-------------|----------|
| image | /image | ✅ | ✅ | ✅ | ✅ | Library |
| video | /video | ✅ | ✅ | ✅ | ✅ | Library, Render |
| cinema | /cinema | ✅ | ✅ | ✅ | ✅ | Library |
| effects | /effects | ✅ | ✅ | ✅ | ✅ | Library |
| ... | ... | ... | ... | ... | ... | ... |

Registry is maintained in `src/lib/appRegistry.js`.

---

## Final Rule

If an implementing agent claims an app is complete but the Verification Per App check reveals placeholder content, mock behavior, or missing contracts — the app is NOT complete. No amount of documentation or explanation replaces a working app.

An app exists to serve the user. If it doesn't do anything real, it is not an app.
