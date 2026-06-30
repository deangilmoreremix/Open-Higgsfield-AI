# Core Editing Foundation — Production-Ready State, Upload & Drag-and-Drop

**Date:** 2026-06-30
**Status:** Draft → awaiting user review
**Phase:** A (Core editing foundation) of the timeline editor production-readiness effort

---

## 1. Problem Statement

The timeline editor (`/timeline` route) currently ships with ~60 HIGH-severity issues. This design covers **Phase A: Core editing foundation** — the layer every other feature depends on. Specifically:

- **State is split-brain.** `TimelineEditorPage.jsx` uses `track.clips` (left/width %), but the real `TimelineState` class and the working drag-drop code use `track.items` (start/end seconds). Drag-from-library does nothing because the UI never reads the `items` it writes.
- **Upload is a stub.** `mediaLibrary.js:handleUpload` is empty. `TimelineEditorPage.jsx:handleUpload` runs but calls `saveProjectToStorage` which is **never defined** — runtime error on every upload.
- **Drag-and-drop uses hardcoded MDN sample URLs.** Track-lane drop for media types always creates a clip pointing to `interactive-examples.mdn.mozilla.net/.../flower.mp4` regardless of what was dragged.
- **File-type validation is unreliable.** `validateFile` only reads `file.type` (the browser-reported MIME, which is empty for files dragged from the OS) and the file extension. Production drag-drop fails on real-world files.
- **Generation service is broken.** `MuAPIProvider.submit()` references `serviceName` (undefined) → `ReferenceError` on every generation. `MuAPIProvider.poll()` returns hardcoded `{ status: 'completed' }`. `GenerationService.poll()/cancel()` use `this.providers` (undefined) instead of `this.provider`.
- **Undo/redo have disabled markers** but the functions themselves still work (push/pop + Object.assign); the `// DISABLED:` comments are dead noise.
- **`saveProjectToStorage` is called 4 times, defined 0 times.** A guaranteed runtime crash on save / keyboard-shortcut Ctrl+S.

**Constraint from user:** Do NOT remove any features or functions. Wire real logic into existing stubs; replace mock data with real data; keep every function in place.

---

## 2. Goals

1. New projects start **blank** (no MDN demo clips, no hardcoded tracks-with-content). The existing demo data is preserved as an opt-in "Load Demo Project" action so the demo is not a removed feature.
2. Upload via the **Upload button** AND via **OS file drag** both call a single shared `processFileUpload(file, options)` pipeline that uploads to Supabase Storage, extracts real metadata (duration/dimensions via `mediaWorker`), and inserts a real `track.items` clip with `start`/`end` derived from real duration.
3. Media-library drag-to-timeline inserts the actual asset (not a sample URL).
4. Track-lane drop for files uploads the file (not a fake MDN URL).
5. `generationService` `submit`/`poll`/`cancel` work end-to-end against `muapi`.
6. `saveProjectToStorage` is defined and persists to localStorage.
7. Undo/redo work and are wired to the snapshot stack.
8. File-type detection uses **magic bytes** (`file-type` library) as the primary check, with MIME and extension as fallbacks.
9. TypeScript type definitions added where missing for type safety.

---

## 3. Architecture

### 3.1 Data Model — Single Source of Truth: `track.items`

Every clip in a track lives in `track.items` with the `TimelineState` schema:

```js
{
  id: string,              // 'item_<timestamp>_<random>'
  assetId: string,         // FK into state.project.assets
  type: 'video' | 'image' | 'audio' | 'text',
  start: number,           // seconds
  end: number,             // seconds
  sourceStart: number,     // seconds, for trim
  sourceEnd: number,       // seconds
  trimIn: number,          // seconds
  trimOut: number,         // seconds
  volume: number,
  playbackRate: number,
  effects: [],
  opacity: number,
  transform: { x, y, scale, rotation },
  name: string,
  lane: number,
  // type-specific:
  text?: string,           // for text clips
  style?: {...},           // for text clips
  waveformData?: number[], // for audio
}
```

A **read-only getter** `track.clips` is added that maps each `items[i]` to `{ id, left: (start/seconds)*100, width: ((end-start)/seconds)*100, src, heading, body, fit, type, ... }` so every existing read-site that uses `track.clips` (notably `renderTracksBasic` in `TimelineEditorPage.jsx`) keeps working without any rewrite of its rendering logic. This is a computed alias — never written to.

Track properties stay on the track object (`id, name, type, muted, solo, locked, visible, height, color`).

### 3.2 Shared Upload Pipeline

A single function `processFileUpload(file, options)` lives in `src/lib/editor/uploadPipeline.js`. Every entry point calls it:

```
[Upload button click]   ─┐
[OS file drag → lane]   ─┤
[OS file drag → global] ─┼──► processFileUpload(file, { dropZone, state, showToast })
[Media library drag]   ─┤                        │
[Programmatic / API]   ─┘                        ▼
                                     1. validateFile(file)  ← uses file-type (magic bytes)
                                     2. uploadFileToStorage(file)  ← real Supabase
                                     3. mediaWorker.getMediaDuration / getImageDimensions
                                     4. createAssetFromFile(...)  ← real asset object
                                     5. addAssetToTimeline(asset, dropZone, state)  ← writes track.items
                                     6. saveProjectToStorage(state)  ← real persistence
                                     7. showToast('Uploaded <name>')
```

### 3.3 State Persistence

`saveProjectToStorage(state)` is defined in `src/lib/editor/persistence.js` and writes the full `state` (minus non-serializable internals like `keyframeSystem`) to `localStorage['timeline-editor-project']`. `loadProjectFromStorage()` already exists; it is updated to:

1. Validate `state.project.tracks` is an array (move from `state.tracks` to `state.project.tracks` since `TimelineState` nests under `project`).
2. Normalize legacy `clips` schema → `items` schema on load.
3. Strip `keyframeSystem`, `transitionEditor`, `sceneDetector`, `cameraEffects`, `aiChatPanel`, `colorCorrectionSystem` from persisted state (these are runtime singletons, rebuilt on init).

### 3.4 Generation Service Fixes

`src/lib/editor/generationService.js`:
- `MuAPIProvider.submit()`: at the top of the method, `const serviceName = this.getServiceNameForMode(request.mode);` then use `serviceName` at lines 113 and 127.
- `MuAPIProvider.poll(generationId)`: call `await muapi.getGenerationStatus(generationId)` (or whatever the real MuAPI status method is) and return its result. Falls back to `{ status: 'completed' }` only if the muapi method is missing.
- `GenerationService.poll()` and `cancel()`: change `this.providers[job.provider]` → `this.provider` (the constructor initializes `this.provider = new MuAPIProvider()` only).
- `GenerationService.configureProvider(name, config)`: implement as a delegator that stores config and re-instantiates `this.provider` with merged config. (Or throws "not supported in single-provider mode" if multi-provider is out of scope.)
- `GenerationService.getCachedResultsForMode(mode)`: implement a real cache backed by `localStorage` keyed by mode. Returns `[]` only if cache is empty. Cache TTL = 1 hour.

### 3.5 File-Type Detection

`validateFile` is upgraded to use the `file-type` npm package:

```js
import { fileTypeFromBuffer } from 'file-type';

async function validateFile(file) {
  if (!file) return { valid: false, error: 'No file provided' };
  // Read first 4096 bytes for magic-byte detection
  const slice = file.slice(0, 4096);
  const buffer = await slice.arrayBuffer();
  const detected = await fileTypeFromBuffer(new Uint8Array(buffer));
  // detected: { ext, mime } | undefined
  // Match against FILE_TYPES map
  ...
  // Fallback to file.type and extension
}
```

The result is cached per-file (File objects are not reused, so this is safe). `file-type` is added to `package.json` devDependencies or dependencies (decision: **dependencies** because it's used in the built app).

### 3.6 TypeScript Type Definitions

Add `@types/file-type` (if not bundled) and any other missing `@types/*` packages discovered during the implementation pass. The project already uses `vitest`, `vite`, `playwright`. Any un-typed npm modules imported in the core foundation code get their `@types/*` added.

### 3.7 Demo Data — Not Removed, Just Not Default

`createState()` in `TimelineEditorPage.jsx` is split:

- `createEmptyState()` — the new default. Returns `state.project.tracks = [ Video, Audio, Text, B-Roll ]` (empty items), no clips.
- `createDemoState()` — the old behavior, preserved as-is. Wired to a new top-icon "Load Demo" button (using one of the existing `topIcons` slots, e.g. the 📋 Project Notes / 🎬 Demo button). When clicked, it replaces `state` with `createDemoState()` and re-renders.

The demo content (MDN flower video, T-Rex audio, etc.) stays in the codebase as `createDemoState()`. No strings are removed. No functions are deleted.

---

## 4. File-by-File Changes

### 4.1 NEW: `src/lib/editor/uploadPipeline.js`
Exports `processFileUpload(file, { dropZone, state, showToast })` and `validateFile(file)` (the async version). The pipeline:
1. `await validateFile(file)` — uses `file-type` magic bytes.
2. `const publicUrl = await uploadFileToStorage(file)` — existing real function.
3. `const asset = await createAssetFromFile(file, type, publicUrl, state)` — existing real function from `dragDrop.js`.
4. `await addAssetToTimeline(asset, dropZone, state)` — existing real function from `dragDrop.js` (writes `track.items`).
5. `saveProjectToStorage(state)` — new real function.
6. `showToast?.(\`Uploaded \${file.name}\`)`.

### 4.2 MODIFY: `src/lib/editor/TimelineState.js`
- Add a `clips` getter on tracks that maps `items` → legacy `{ id, left, width, type, name, src, heading, body, fit, start, end }` derived from `start`/`end`/`timelineSeconds`. The getter is defined as a non-enumerable property on the track in `_normalizeState` so it doesn't pollute JSON serialization.

### 4.3 MODIFY: `src/lib/editor/timelineEditorState.js`
- No change to wrapper functions. They continue to work on the state object the wrapper received.

### 4.4 MODIFY: `src/lib/editor/persistence.js` (NEW)
- `saveProjectToStorage(state)`: serializes state minus runtime singletons, writes to `localStorage['timeline-editor-project']`.
- `loadProjectFromStorage()`: updated to validate `state.project.tracks`, normalize legacy `clips` → `items`, and preserve the existing call site in `TimelineEditorPage.jsx`.

### 4.5 MODIFY: `src/lib/editor/dragDrop.js`
- `validateFile(file)` → `async validateFile(file)`: adds magic-byte detection via `file-type` library. Fallback chain: magic bytes → `file.type` → file extension. Returns `{ valid, type, config }`.
- `handleMediaDrop()` (line 1105): the stub is wired. It calls `processFileUpload(mediaData, { dropZone, state, showToast })` where `mediaData` is a `File` object (or a media-library item that already has a `publicUrl`).
- `initializeFileSystemDragDrop` (line 553): the `handleFileDrop` function (line 602) is updated to call `processFileUpload(file, { dropZone, state, showToast })` per file. (Currently it calls `processMultipleFiles` which is preserved; the function delegates to the pipeline.)

### 4.6 MODIFY: `src/lib/editor/mediaLibrary.js`
- `handleUpload(showToast)` (line 945): the stub is wired. It opens a hidden `<input type="file">` click, then on `change` calls `processFileUpload(file, { dropZone: 'media-library', state, showToast })`.

### 4.7 MODIFY: `src/lib/editor/generationService.js`
- `MuAPIProvider.submit()`: add `const serviceName = this.getServiceNameForMode(request.mode);` at the top of the method.
- `MuAPIProvider.poll(generationId)`: call real MuAPI status method; fall back to `{ status: 'completed' }` only if the underlying method is unavailable.
- `GenerationService.poll()` and `cancel()`: `this.providers[job.provider]` → `this.provider`.
- `GenerationService.configureProvider(name, config)`: implement as a config-merging single-provider swap.
- `GenerationService.getCachedResultsForMode(mode)`: implement localStorage-backed cache with 1-hour TTL.

### 4.8 MODIFY: `src/components/TimelineEditorPage.jsx`
- `createState()`: split into `createEmptyState()` (new default) and `createDemoState()` (preserved old behavior). `loadProjectFromStorage()` is updated to call `createEmptyState()` instead of `createState()`. `createState` is renamed to `createDemoState` and referenced by a new "Load Demo" button handler.
- Track-lane drop handler (lines 2094–2174): the `data.type === 'media'` branch (line 2154) is updated to call `processFileUpload(file, { dropZone: track, state, showToast })` for OS-dropped files. The `data.type === 'media'` case for media-library items is updated to insert the real `mediaData.url` instead of hardcoded MDN URLs.
- `handleUpload` (line 4514): updated to call the shared `processFileUpload(file, { dropZone: 'upload-button', state, showToast })`.
- `bindEvents()`: unchanged. Upload button and file input are already wired.
- `// DISABLED:` comments in `undo`, `redo`, and `loadProjectFromStorage`'s catch block are removed (the code under them is already correct).

### 4.9 MODIFY: `package.json`
- Add `file-type` to `dependencies`.
- Add `@types/file-type` to `devDependencies` (if not bundled).
- Run `npm install` / `pnpm install`.

---

## 5. Error Handling

| Failure | Behavior |
|---------|----------|
| `file-type` magic-byte detection fails | Fallback to `file.type`, then extension. If none match → reject with `Unsupported file type`. |
| `uploadFileToStorage` throws | `showToast` error, file NOT added to timeline, no project save. |
| `mediaWorker` metadata extraction fails | Asset is still created with `duration: 0` / no dimensions, clip is inserted with `duration: 0` placeholder. Toast: "Uploaded <name> (metadata unavailable)". |
| `saveProjectToStorage` fails (quota exceeded) | Log error, toast: "Could not save project to browser storage". Project is still in memory. |
| `addAssetToTimeline` called with no matching track | Auto-create track with `name = trackType`, `items: []`, push to `state.tracks`. |
| `loadProjectFromStorage` schema mismatch (legacy `clips`) | Normalize: each `track.clips[i]` → `track.items.push({ id, start: (left/100)*seconds, end: ((left+width)/100)*seconds, sourceStart: 0, sourceEnd: end-start, trimIn: 0, trimOut: end-start, type, name, src, heading, body, fit })`. Drop `track.clips`. |

---

## 6. Testing

### Unit (Vitest)
- `tests/unit/upload-pipeline.spec.ts` — new. Tests `validateFile` with: PNG magic bytes, MP4 magic bytes, file with no `file.type` (drag from OS), oversized file, unsupported type.
- `tests/unit/persistence.spec.ts` — new. Tests `saveProjectToStorage` round-trips with the editor state, `loadProjectFromStorage` normalizes legacy `clips` → `items`.
- `tests/unit/generation-service.spec.ts` — new. Tests `MuAPIProvider.submit` calls `getServiceNameForMode`, `poll` returns real data (mocked), `GenerationService.poll` uses `this.provider` not `this.providers`.
- Existing `tests/unit/timeline-editor.unit.spec.ts` — extended with cases for `createEmptyState()` (empty tracks, no clips) and `createDemoState()` (preserves old behavior).

### Integration
- Manual: open `/#/timeline`, see **blank** timeline (no MDN videos). Click "Load Demo", see the demo content. Refresh — state restored from localStorage.
- Manual: drag a `.mp4` file from Finder onto a track lane. See real upload progress, real asset in media library, real clip on track.
- Manual: drag a `.mov` file from Finder (no MIME type) onto a track lane. See it correctly recognized as `video/quicktime` via magic bytes.
- Manual: drag a media-library item onto a track. See the real asset URL, not MDN.
- Manual: trigger a generation (Text → Video). No `ReferenceError: serviceName is not defined` in console.

### E2E (Playwright)
- New `tests/e2e/main-app/upload-dragdrop.spec.js` — runs in `main-app-chromium` project. Navigates to `/#/timeline`, simulates file upload via the input, verifies the clip appears on a track, verifies undo/redo restores it.

---

## 7. Rollout

This is the first phase. Phases B (AI/LLM consolidation with OpenAI Responses API), C (disabled modal handlers), and D (media & generation pipeline fake-data replacement) come next and depend on the state/upload/drag-drop foundation being correct.

No features or functions are removed. The demo content is preserved behind a "Load Demo" button. The `// DISABLED:` markers are removed where the code under them is already correct (undo/redo, error handlers).
