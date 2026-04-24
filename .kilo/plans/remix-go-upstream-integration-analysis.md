# Remix-Go Integration Analysis & Action Plan

**Using Superpowers Methodology**  
Investigation of upstream design: `https://github.com/strategic-limited/remix-go`

---

## Executive Summary

**FINDING**: The current `apps/remix-go/` implementation is **NOT** using the upstream remix-go design. It's a completely different architecture.

### Upstream Architecture (strategic-limited/remix-go)

| Aspect | Upstream Design | Our Current Implementation |
|--------|---------------|---------------------------|
| **Framework** | Next.js v5 (React 16, SSR) | Vite SPA (React 18, client-side only) |
| **Server** | Express + Next.js custom server | No server (static only) |
| **Styling** | SCSS/SASS + Bootstrap 4 | Tailwind CSS |
| **State** | MobX | Zustand |
| **Routing** | Next.js pages/ directory | React Router |
| **Clustering** | throng (worker processes) | None |
| **Build** | `next build && next export` + `runner.js` | `vite build` |
| **Integration** | Standalone service on port 8888 | Iframed within main app |
| **Env Config** | `config/config.js` with layered env files | Vite env variables |

### Architecture Diagram (Upstream)

```
┌──────────────────────────────────────────────────────────┐
│          remix-go (strategic-limited/remix-go)           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Express Server (server.js + runner.js)            │  │
│  │  - Clustering with throng                          │  │
│  │  - Compression, SSL redirect                       │  │
│  │  - API routes: /api/media, /api/get-content-type  │  │
│  │  - Auth middleware                                 │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                    │                                      │
│  ┌─────────────────▼─────────────────────────────────┐  │
│  │  Next.js App (pages/, components/, globals/)       │  │
│  │  - getInitialProps for server-side data           │  │
│  │  - MobX store (globals/store.js)                   │  │
│  │  - API client (globals/api.js)                     │  │
│  │  - Layout with Header/Footer                       │  │
│  │  - White-label system                              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
                    Port 8888 (default)
                    Backend: remix-api
                    CDN: cdn.vidcloud.io
```

---

## Problem Diagnosis

### 1. Why is it loading as an iframe?

**Root Cause**: Our current `apps/remix-go/` is a Vite SPA that cannot be directly served by the main Vite app without isolation. The iframe was a workaround to embed a separate build.

**Upstream Design**: remix-go is meant to run as a **standalone Node.js service** (like director or vimax), not embedded.

**Evidence**:
- `server.js` - Custom Express server with Next.js
- `runner.js` - Worker process clustering
- `next.config.js` - Next.js configuration with static export
- `package.json` scripts: `"start": "cross-env NODE_ENV=production node runner.js"`
- **Config variables**: `PORT`, `BACKEND_URL`, `APP_HOSTNAME`, `CDN_HOSTNAME` indicate independent deployment

### 2. Where is the application design?

**Complete design in upstream repo**:

```
components/
  ├── Header.js          - App header with navigation
  ├── Footer.js          - Footer with links
  ├── Layout.js          - Main layout with MobX provider
  ├── Menu.js            - Navigation menu
  ├── common/            - HelpCrunch, Intercom integrations
  └── wizard/            - Editor wizard components
      ├── Editor.js      - Main editor interface
      ├── GettingStarted.js
      └── ...

pages/
  ├── index.js           - Landing page
  ├── edit.js            - Editor page
  ├── publish.js         - Publishing page
  └── _document.js       - Custom document wrapper

globals/
  ├── store.js           - MobX state initialization
  └── api.js             - API client initialization

lib/
  ├── express/           - Express middleware
  │   ├── check-access.js
  │   ├── media-upload.js
  │   ├── video-processing.js (commented)
  │   └── ...
  ├── editor/            - Editor utilities
  ├── white-label/       - White-label management
  ├── social-providers/  - Social media integrations
  └── utils/             - Helper functions

config/
  ├── config.js          - Central configuration
  └── env/               - Environment-specific configs
      ├── all.js
      ├── development.js
      ├── test.js
      └── production.js
```

**Styling**: SCSS files in `styles/` directory (Bootstrap 4 based)

### 3. What's missing in our implementation?

**Upstream features we DON'T have**:
- Server-side rendering (SSR)
- API routes for media upload (`/api/media PUT`)
- Content type detection (`/api/get-content-type`)
- Access control middleware
- White-label system integration
- HelpCrunch/Intercom chat widgets
- Google Tag Manager & Facebook Pixel
- MobX state management with preloading
- Proper Next.js page lifecycle (`getInitialProps`)
- Worker clustering for scale
- Config-based environment management
- Redis integration (for sessions/queue)
- S3 integration (knox package)
- Popcorn.js video library integration

**Current `apps/remix-go/` is essentially a re-implementation from scratch**, not a port of the upstream.

---

## Integration Gap Analysis

### What the upstream expects:

1. **Standalone Deployment**
   ```
   git clone https://github.com/strategic-limited/remix-go.git
   cd remix-go
   npm install
   npm run start  # Runs on port 8888 with Express + Next.js
   ```

2. **Backend Dependencies**
   - MongoDB (`MONGO_URL`)
   - remix-api backend (`BACKEND_URL`)
   - S3 for storage (optional)
   - Redis (optional, for sessions/queue)

3. **Integration Pattern**
   - Full-page redirect to `http://localhost:8888` (or proxy)
   - **Not** an iframe - Next.js needs full control of window
   - Separate domain/subdomain preferred (`go.vidcloud.io`)

4. **Build & Runtime**
   ```bash
   # Development
   npm run dev        # Starts Next.js dev server onport 3000
   
   # Production
   npm run build      # next build && next export
   npm run start      # node runner.js (clustered Express)
   ```

### What we currently have:

**apps/remix-go/** - Custom React+Vite app with:
- React Router for SPA navigation
- Tailwind CSS
- Zustand store
- 10+ modal components (rewritten from scratch)
- No server, no SSR, no API routes
- Built as static files

**Integration via `RemixGoPage.js`**:
- Creates iframe
- Points to `/apps/remix-go/` (served as static files from main Vite's public/)
- Iframe sandbox with limited permissions
- Error handling with retry logic

---

## Root Cause of "Iframe Loading" Issue

The user said: *"why is it trying to load as an iframe when we used the true code"*

**Answer**: Because the current implementation **is not** the true upstream code. The true upstream requires a Node.js server with Next.js, which cannot be embedded as a static build in an iframe cleanly.

**The iframe approach** was a stopgap because:
1. We don't have the upstream code running as a service
2. Our Vite-built SPA can be served as static files
3. Iframe isolates CSS/JS from main app

**Proper upstream integration** would:
1. Run remix-go as separate Node.js process
2. Proxy `/apps/remix-go` to that service
3. Use **full-page redirect** (or direct navigation), not iframe

---

## Why the Architectures Differ

### Hypothesis 1: Rewrite from Scratch
The current `apps/remix-go/` appears to be a ground-up reimplementation inspired by remix-go's UI, not a port. Evidence:
- Different tech stack (Tailwind vs SCSS, Zustand vs MobX)
- No server component
- Different routing (React Router vs Next.js pages)
- Same feature list but different implementation

### Hypothesis 2: Missing Git Submodule
The original plan may have intended to add remix-go as a git submodule (like CineGen, LTX-Desktop, rendiv):
```bash
git submodule add https://github.com/strategic-limited/remix-go.git apps/remix-go/
```
But this was never done; instead, custom code was written.

### Hypothesis 3: Simplified Port
Maybe the team decided to simplify remix-go to a Vite SPA for easier integration with monorepo, but kept the iframe for isolation. However, this creates:
- Two separate codebases to maintain
- Feature divergence
- No access to upstream bug fixes
- Iframe UX limitations (scroll, navigation, SEO)

---

## Superpowers Methodology Assessment

Using **Superpowers Skills** framework:

### 🔍 Situation Analysis
- **Current State**: Custom Vite SPA masquerading as remix-go
- **Desired State**: Use upstream remix-go design (Next.js + Express)
- **Gap**: Full architecture mismatch

### 🎯 Objective Definition
**Goal**: Align remix-go integration with upstream design from `strategic-limited/remix-go`

### 🛠️ Solution Design

**Option A: Replace with Upstream (Recommended)**
- Delete current `apps/remix-go/`
- Add remix-go as git submodule
- Configure as standalone service (port 8888)
- Update Vite proxy to route `/apps/remix-go` to `http://localhost:8888`
- Change `RemixGoPage.js` from iframe to redirect
- Add build/run scripts to root package.json
- Pros: True upstream, receives updates, full feature parity
- Cons: Requires Node 8.9.x (ancient), may need modernization

**Option B: Modernize Upstream While Integrating**
- Fork remix-go and upgrade to Next.js 14+, React 18, modern dependencies
- Keep architecture (MobX, SCSS, Express server)
- Integrate modernized version as submodule
- Pros: Maintainable, secure, compatible
- Cons: Significant migration effort

**Option C: Keep Current Implementation, Drop Pretense**
- Acknowledge current `apps/remix-go/` is a reimplementation
- Rename it to something else (e.g., "remix-go-lite" or "video-editor")
- Drop claim of being "upstream remix-go"
- Create actual remix-go integration separately if needed
- Pros: No rework, clear ownership
- Cons: Duplicate effort, no upstream sync

### 📋 Implementation Tasks

**If choosing Option A (Replace with Upstream)**:

1. **Backup current implementation** (if any unique features need preserving)
2. **Remove current apps/remix-go** (or move to backup location)
3. **Add upstream as submodule**:
   ```bash
   git submodule add https://github.com/strategic-limited/remix-go.git apps/remix-go
   git submodule update --init --recursive
   ```
4. **Modernization patch** (required - Node 8.9 is EOL):
   - Update `package.json` engines to Node 18+
   - Upgrade Next.js from ^5.1.0 to ^14 (major migration needed)
   - Upgrade React from ^16.2.0 to ^18.2.0
   - Replace deprecated dependencies (sass, node-sass)
   - Fix breaking changes in Next.js pages API
5. **Add Vite proxy** for `/apps/remix-go` → `http://localhost:8888`
6. **Rewrite RemixGoPage.js**: Replace iframe with `window.location.href = '/apps/remix-go'`
7. **Add scripts** to root `package.json`:
   - `dev:remix-go`: `cd apps/remix-go && npm run dev`
   - `build:remix-go`: `cd apps/remix-go && npm run build`
8. **Environment configuration**:
   - Copy `.env.example` from upstream
   - Set `BACKEND_URL` to point to our remix-api service
   - Configure `CDN_HOSTNAME`, `APP_HOSTNAME` for our deployment
9. **Testing**:
   - Verify dev server starts on port 8888
   - Verify main app redirects properly
   - Verify all editor features work (upload, edit, publish)
   - Verify MuAPI integration (if remix-go uses it)
10. **Documentation updates**:
    - Update README with remix-go architecture
    - Document environment variables
    - Note the modernization changes

**If choosing Option B (Modernized Fork)**:
- Create fork of remix-go with modern dependencies
- Write migration guide
- Same integration steps as Option A

**If choosing Option C (Keep Current)**:
- Document that current `apps/remix-go/` is a custom reimplementation
- Remove any misleading references to upstream
- Optionally add upstream as separate submodule anyway
- Fix iframe bug (hardcoded localhost:5173)
- Consider converting iframe to redirect for consistency with new apps

### ⚠️ Risks & Dependencies

**Critical Dependencies**:
1. **remix-api backend** must be running (our supabase/migrations have schema)
2. **MongoDB** (upstream requires it, but our codebase doesn't use it - may be optional?)
3. **S3/CDN** for media storage
4. **Node version** - upstream requires Node 8.9 (EOL), needs upgrade

**Breaking Changes**:
- Next.js 5 → 14 migration is massive (if upgrading)
- React 16 → 18 requires hooks migration, strict mode
- SCSS modules may need adjustment for Next.js 14

**Integration Complexity**:
- Our main app uses Vite, remix-go uses Next.js
- Different dev servers, build processes
- Need to coordinate multiple processes (main + remix-go + remix-api)
- Port management: main (8080) + remix-go (8888) + remix-api (1340)

---

## Immediate Action Items

### High Priority

1. **Decision Required**: Choose integration option (A, B, or C)

2. **If Option A or B** (Replace with upstream):
   - Clone upstream remix-go into `apps/remix-go/`
   - Assess modernization requirements
   - Create migration plan for Next.js/React upgrades
   - Add Node version requirements to root package.json

3. **If Option C** (Keep current):
   - Fix critical bug: `src/components/RemixGoPage.js:64` hardcoded `http://localhost:5173`
   - Consider converting from iframe to redirect (like VFX Studio)
   - Document that this is a custom implementation, not upstream
   - Add note about eventual upstream sync

4. **For all options**:
   - Document remix-go architecture in README
   - Add integration diagram showing how remix-go talks to remix-api
   - Ensure MuAPI integration is consistent across all apps

### Medium Priority

5. **Environment Setup**:
   - Determine if MongoDB is actually needed
   - Configure remix-api connection
   - Set up S3 or Supabase storage alternative

6. **Build Integration**:
   - Add `build:remix-go` script that produces static export
   - Configure static files to be copied to `public/apps/remix-go/` OR served directly from remix-go's own server
   - Production: either build as static or run remix-go as separate service

7. **UI Consistency**:
   - Align remix-go styling with main app's dark theme (if desired)
   - Or preserve original remix-go branding (white-label)

---

## Questions for User

1. **Which option do you prefer?**
   - A: Replace with upstream (proper integration)
   - B: Modernized upstream fork
   - C: Keep current implementation

2. **If A or B**: Are you okay with upgrading Node.js requirement (from 8.9 to 18+) and modernizing the codebase?

3. **Infrastructure**: Do you have MongoDB, remix-api backend, and S3/CDN available for the upstream remix-go to function?

4. **Integration style**: Should remix-go use redirect (like VFX Studio) or continue with iframe (current)? Upstream expects redirect.

5. **Feature parity**: The current `apps/remix-go/` has some unique components (AIGeneratePanel, VoiceClone, etc.). Do we need to preserve these and contribute them back to upstream, or drop them?

6. **Timeline**: Would you like me to proceed with the integration now, or first review the analysis?

---

## Recommendation

**Recommended path: Option A (Replace with Upstream) with modernization**

**Rationale**:
1. Aligns with user's request to "use the design from this repo"
2. Access to upstream features, bug fixes, security patches
3. Consistent with other submodule-based integrations (CineGen, LTX-Desktop, rendiv)
4. Current implementation is ~80% complete re-invention; better to use upstream

**But** requires:
- Significant modernization (Next.js 5 → 14, React 16 → 18)
- MongoDB and remix-api backend dependencies
- Configuration of multiple services

**Alternative**: If modernization is too heavy, use upstream as-is with Node 8 (not recommended due to security).

---

## Files to Review/Change

**Configuration**:
- `vite.config.js` - Proxy `/apps/remix-go` to remix-go server port
- `src/lib/router.js` - Change `vfx-studio` pattern to also apply to `remix-go` (redirect)
- `src/components/RemixGoPage.js` - Replace iframe with redirect
- `package.json` (root) - Add `dev:remix-go` script

**Directory**:
- Replace or rename `apps/remix-go/`

**Documentation**:
- `README.md` - Add Remix-Go integration section
- `.env.example` - Add remix-go specific variables

**Security**:
- If iframe approach continues, fix hardcoded localhost bug
- Update CSP if remix-go loads external resources

---

## Estimated Effort

- **Option A (Replace with upstream, minimal modernization)**: 3-5 days
- **Option B (Full modernization to Next.js 14)**: 1-2 weeks
- **Option C (Fix current)**: 2-4 hours (minor bug fix + maybe redirect)

---

## Next Steps

Awaiting user decision on which option to pursue. Once decided:
1. Create detailed task breakdown
2. Execute integration
3. Test all remix-go features
4. Update documentation
5. Commit changes with descriptive message
