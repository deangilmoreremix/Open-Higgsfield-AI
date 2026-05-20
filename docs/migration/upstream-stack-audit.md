# Upstream Stack Audit: Open-Generative-AI

**Source:** https://github.com/Anil-matcha/Open-Generative-AI  
**Audited:** 2026-05-19

## Upstream Framework

### Primary Framework
- **Next.js 15.0.0** (App Router)
- **React 19.0.0**
- **Vite 5.4.0** (for Electron builds)
- **Electron** (desktop app support)

### Package Manager
- pnpm with workspaces

## Workspace Structure

```
packages/
├── studio/                                    # Main studio package
├── Vibe-Workflow/                            # Git submodule
│   └── packages/workflow-builder/            # Workflow builder package
├── Open-Poe-AI/                              # Git submodule
│   └── packages/agents/                      # AI agents package
└── Open-AI-Design-Agent/                     # Git submodule
    └── packages/design-agent/                  # Design agent package
```

### Workspace Configuration (from package.json)
```json
"workspaces": [
  "packages/studio",
  "packages/Vibe-Workflow/packages/workflow-builder",
  "packages/Open-Poe-AI/packages/agents",
  "packages/Open-AI-Design-Agent/packages/design-agent"
]
```

## Key Upstream Patterns

### 1. Next.js App Router Structure
- Uses `app/` directory for routes
- `app/layout.jsx` - Root layout
- `app/page.jsx` - Home page
- Dynamic routes via `[appId]` folders

### 2. Package Transpilation
In `next.config.mjs`:
```javascript
const nextConfig = {
  transpilePackages: ['studio', 'ai-agent', 'workflow-builder', 'design-agent'];
};
```

### 3. Local Package References
```json
"dependencies": {
  "studio": "*",
  "workflow-builder": "file:./packages/Vibe-Workflow/packages/workflow-builder",
  "ai-agent": "file:./packages/Open-Poe-AI/packages/agents"
}
```

## What Should Be Copied

### 1. Next.js Configuration
- `next.config.mjs` with transpilePackages
- App Router structure pattern
- API route pattern for MuAPI proxy

### 2. Workspace Pattern
- Use `file:./packages/...` references for local packages
- Git submodules for external packages (optional)

### 3. Package Structure Template
Each package should have:
```
packages/<name>/
├── package.json
├── README.md
└── src/
    ├── index.js
    ├── components/
    └── ...
```

### 4. Shared UI Components
- Header component
- Sidebar component
- App grid component
- Dark theme styling

## What Should Be Adapted

### 1. Workspace Paths
Current Higgsfield has many more apps than upstream. Should extend:
```
packages/
├── studio/
├── workflow-builder/
├── agents/
├── design-agent/
├── marketing-studio/
├── open-pomelli/
└── vibe-workflow/
```

### 2. Routing Strategy
- Convert hash-based router to Next.js App Router
- Keep app manifests for dynamic loading
- Map `/apps/[appId]` to registered modules

### 3. MuAPI Integration
- Keep existing `src/lib/muapi.js` but adapt for server-side API routes
- Create `/app/api/muapi/[...path]/route.js` for proxy

## What Should NOT Be Copied

### 1. Electron Configuration
- Higgsfield is web-only, no desktop app
- Remove electron-builder config

### 2. External Git Submodules
- Submodule references create complexity
- Use direct copies or npm packages instead

### 3. Vite for Main Build
- Keep Vite only for Electron (not applicable)
- Use Next.js for main web app

## Risks & Mitigations

### Risk 1: Breaking Existing Apps
- **Mitigation**: Create parallel Next.js shell first
- Keep Vite build until migration complete

### Risk 2: Duplicate React Instances
- **Mitigation**: Use Next.js transpilePackages
- Shared package for UI components

### Risk 3: Routing Conflicts
- **Mitigation**: Map old routes to new structure
- Maintain backward compatibility during transition

### Risk 4: Workspace Package Dependencies
- **Mitigation**: Each package must be self-contained
- No hardcoded paths to parent app

## Recommended Migration Path

1. Create `app/` directory for Next.js
2. Set up `next.config.mjs` with proper transpilePackages
3. Create `packages/` structure matching upstream
4. Migrate apps one by one from `src/components/*` to `packages/*/`
5. Replace custom router with Next.js App Router
6. Remove Vite once Next.js shell is stable

## Upstream Dependencies (Relevant)

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^15.0.0 | Core framework |
| react | ^19.0.0 | UI library |
| react-dom | ^19.0.0 | DOM rendering |
| axios | ^1.7.0 | HTTP client |
| react-hot-toast | ^2.4.1 | Notifications |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| eslint | ^9 | Linting |
| eslint-config-next | ^15.0.0 | Next.js linting |
| tailwindcss | ^3.4.0 | CSS framework |
| postcss | ^8.5.6 | CSS processing |
| autoprefixer | ^10.4.24 | CSS prefixing |