# Plan: Verify Open-Generative-AI studio feature parity

## Goal
Confirm all 13 studios shipped in `apps/open-generative-ai` match the upstream `external-repos/Open-Generative-AI` web version and that each studio is reachable from the sidebar with correct routing.

## Scope
- Hosted Next.js web build only (Electron excluded per user request).
- Repo: `apps/open-generative-ai`
- Upstream source: `external-repos/Open-Generative-AI`

## Verification steps

### 1. Environment bootstrap
- Run `git submodule update --init --recursive` inside `apps/open-generative-ai`.
- Run `npm install` inside `apps/open-generative-ai`.
- Run `npm run build:packages` inside `apps/open-generative-ai`.

### 2. Dev server health
- Run `npm run dev` in `apps/open-generative-ai`.
- Verify `http://localhost:3000/` redirects to `/studio`.
- Verify sidebar renders all 13 studio icons.

### 3. Studio route coverage
For each route, open it and verify shell/studio loads:
- `/studio` (default shell)
- `/studio/image`
- `/studio/video`
- `/studio/audio`
- `/studio/lipsync`
- `/studio/clipping`
- `/studio/vibe`
- `/studio/cinema`
- `/studio/marketing`
- `/studio/workflows`
- `/studio/agents`
- `/studio/design`

### 4. Component parity
- Compare `apps/open-generative-ai/packages/studio/src/components/*` against `external-repos/Open-Generative-AI/packages/studio/src/components/*` for missing files.
- Spot-check `models.js` and `muapi.js` for route/model coverage.

### 5. Wrapper app sanity
Confirm each `apps/open-*-studio/` directory has:
- `package.json`
- `vite.config.js`
- `index.html`
- `src/main.jsx`

### 6. Results
Produce a concise pass/fail list for each studio and call out any missing features.
