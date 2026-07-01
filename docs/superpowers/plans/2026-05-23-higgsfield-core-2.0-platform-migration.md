# Higgsfield Core 2.0 Platform Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Higgsfield into a **Modern React + Vite AI Studio Platform** (the creative runtime) while keeping the existing Next.js 15 app **only** for marketing, SEO, docs, and landing pages. The new foundation uses React 19 + Vite + TypeScript + Tailwind + Zustand + Framer Motion + shadcn/ui + Supabase with a modular App Registry, shared Workspace Engine, centralized Providers, and a cinematic Design System — exactly the architecture that powers successful multi-app AI creative platforms.

**Target Architecture (This Is What We Are Building)**

- **Creative Platform Runtime**: React + Vite + TypeScript (recommended over full Next.js App Router for this use case)
- **Marketing / SEO / Docs surface**: Existing Next.js 15 (app router) — **do not move studios here**
- **Core principles**:
  - React + Vite is **better** for multi-app platforms, app registries, plugin ecosystems, workspace UIs, importing upstream React apps, and AI-generated code compatibility.
  - We are building a **modular AI creative operating system** (like Open Generative AI, Leonardo, Runway, Krea, Cursor-style ecosystems), **not** a traditional website.

**What We COPY from Open-Generative-AI (and similar modern platforms)**
- React architecture & component structure
- Modular studios & app organization
- Workspace layouts & shared UI packages
- Design language, Tailwind patterns, cinematic UX
- Provider structure (Auth, Theme, Media, Workspace, AI, Generation)
- Studio UX, animation system, prompt bars, glass panels, floating controls
- Registry-driven app loading

**What We DO NOT COPY**
- Electron (unless desktop apps are explicitly requested later)
- Monolithic routing
- App ownership / CLI / MCP / desktop packaging

**Architecture:** Parallel co-existence model (the only safe path). A brand-new, clean React + Vite application lives at `platform/higgsfield-core/` (pnpm workspace package `@higgsfield/core`). It never mutates `app/`, `src/`, `next.config.mjs`, or the current root `vite.config.js`. All legacy studios continue to work via safe `<LegacyAppWrapper>`. The existing Next.js app stays untouched for marketing. The current Vite hash-router shell (`src/main.js`) is treated as transitional. The new Core becomes the permanent single source of truth for every creative workspace.

**Final Vision**
You are building a centralized runtime + modular React apps + shared providers + workspace architecture + design system + registry-driven apps. This is the correct evolution path.

**Tech Stack (New Core Only):**
- React 19 + TypeScript
- Vite 7
- React Router v6 (data router + loaders where appropriate)
- Zustand (global + per-app slices)
- Tailwind CSS v4 + PostCSS
- shadcn/ui + Radix UI primitives (Button, Dialog, Tabs, Resizable, etc.)
- Framer Motion (cinematic transitions, layout animations)
- @supabase/supabase-js (Auth + Realtime + Storage)
- Lucide-react icons
- Optional later: TanStack Query, React Hook Form + Zod

**Safety Rules (Never Violate):**
- No file deletions in `app/`, `src/`, `components/`, `packages/`
- No changes to root `package.json` scripts that would break `npm run dev` or `npm run dev:vite`
- New platform must be runnable completely independently (`pnpm --filter @higgsfield/core dev`)
- All legacy apps must continue to function exactly as before any code in this plan is executed
- Every task produces a working, testable increment that can be rolled back by simply not running the new platform

---

## Task 0: Safety Audit & Workspace Preparation

**Files:**
- Create: `docs/superpowers/plans/2026-05-23-higgsfield-core-2.0-platform-migration.md` (this document — already created)
- Create: `platform/higgsfield-core/SAFETY-AUDIT.md`
- Modify (append only): `.gitignore` if needed for new platform build artifacts

- [ ] **Step 0.1: Run full current app validation to establish baseline**

```bash
cd /Users/shasheemoore/Downloads/Higgsfield
npm run apps:validate
npm run apps:audit
npm run test:run -- --passWithNoTests
```

Expected: All existing validation scripts pass. Capture output to `platform/higgsfield-core/SAFETY-AUDIT.md`.

- [ ] **Step 0.2: Verify both dev servers start without errors (parallel terminals recommended)**

```bash
# Terminal 1 (Next.js marketing + old shell)
npm run dev

# Terminal 2 (current Vite shell on :8080)
npm run dev:vite
```

Expected: Both start cleanly. Note the ports. Do not proceed until both are green.

- [ ] **Step 0.3: Create the new platform directory (never touches existing code)**

```bash
mkdir -p platform/higgsfield-core
cd platform/higgsfield-core
echo "# Higgsfield Core 2.0 — DO NOT DELETE THIS DIRECTORY" > README.md
```

- [ ] **Step 0.4: Document the current state snapshot**

Create `platform/higgsfield-core/SAFETY-AUDIT.md` with the following content (copy the actual command outputs you just captured):

```markdown
# Pre-Migration Safety Baseline — 2026-05-23

## Validation Results
< paste `npm run apps:validate` output here >

## Audit Results
< paste `npm run apps:audit` output here >

## Running Processes
- Next.js dev: http://localhost:3000 (marketing + legacy routes)
- Vite dev: http://localhost:8080 (current hash-router shell)

## Critical Paths That Must Remain Untouched
- /app/** (Next.js app router)
- /src/** (legacy Vite components & router)
- root vite.config.js, next.config.mjs, package.json scripts
- All apps/ subdirectories

Any task that would modify the above is FORBIDDEN in this plan.
```

---

## Task 1: Bootstrap Clean React + Vite + TypeScript Core

**Files:**
- Create: `platform/higgsfield-core/package.json`
- Create: `platform/higgsfield-core/vite.config.ts`
- Create: `platform/higgsfield-core/tsconfig.json`
- Create: `platform/higgsfield-core/tsconfig.node.json`
- Create: `platform/higgsfield-core/index.html`
- Create: `platform/higgsfield-core/tailwind.config.js`
- Create: `platform/higgsfield-core/postcss.config.js`
- Create: `platform/higgsfield-core/src/main.tsx`
- Create: `platform/higgsfield-core/src/App.tsx`
- Create: `platform/higgsfield-core/src/vite-env.d.ts`

- [ ] **Step 1.1: Initialize package.json for the new isolated workspace package**

Write exactly this content to `platform/higgsfield-core/package.json`:

```json
{
  "name": "@higgsfield/core",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.4",
    "framer-motion": "^12.12.1",
    "lucide-react": "^0.511.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^6.30.0",
    "zustand": "^5.0.5"
  },
  "devDependencies": {
    "@types/node": "^22.15.18",
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.5",
    "@vitejs/plugin-react": "^4.4.1",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3",
    "tailwindcss": "^4.1.7",
    "typescript": "~5.8.3",
    "vite": "^6.3.5"
  }
}
```

- [ ] **Step 1.2: Create Vite + React + Tailwind configuration (strict, secure, isolated)**

Write `platform/higgsfield-core/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@apps': path.resolve(__dirname, './src/apps'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3100,           // Dedicated port — never conflicts with 3000 or 8080
    strictPort: true,
    host: true,
    cors: true,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state': ['zustand'],
          'motion': ['framer-motion'],
        },
      },
    },
  },
});
```

Write `platform/higgsfield-core/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@apps/*": ["src/apps/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Write `platform/higgsfield-core/tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

Write `platform/higgsfield-core/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Higgsfield Core 2.0</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 1.3: Install dependencies inside the new package (first real change — completely isolated)**

```bash
cd /Users/shasheemoore/Downloads/Higgsfield/platform/higgsfield-core
pnpm install
```

Expected: Clean install. The root `node_modules` is untouched for the legacy apps.

- [ ] **Step 1.4: Create minimal Tailwind + PostCSS setup**

Write `platform/higgsfield-core/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cinematic dark theme tokens (will be expanded in Task 6)
        bg: '#0a0a0c',
        panel: '#111113',
        border: '#26262a',
        accent: '#a78bfa',
      }
    },
  },
  plugins: [],
}
```

Write `platform/higgsfield-core/postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Create `platform/higgsfield-core/src/index.css` (will be imported in main):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
}

body {
  font-family: var(--font-sans);
  background-color: #0a0a0c;
  color: #ededed;
}
```

- [ ] **Step 1.5: Create the absolute minimal working React entry point**

Write `platform/higgsfield-core/src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

Write `platform/higgsfield-core/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

Write `platform/higgsfield-core/src/App.tsx` (minimal router shell):

```tsx
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <Routes>
        <Route path="/" element={<div className="p-8 text-2xl">Higgsfield Core 2.0 — Platform Ready</div>} />
        <Route path="/workspace" element={<div className="p-8">Workspace Shell (coming in Task 5)</div>} />
      </Routes>
    </div>
  );
}
```

- [ ] **Step 1.6: Verify the new platform runs cleanly on its own port (3100)**

```bash
cd /Users/shasheemoore/Downloads/Higgsfield/platform/higgsfield-core
pnpm dev
```

Open http://localhost:3100 — you should see the placeholder text.  
**Critical test:** Confirm that `npm run dev` (port 3000) and `npm run dev:vite` (port 8080) are **still running normally** and unaffected.

If everything passes, commit the bootstrap:

```bash
git add platform/higgsfield-core
git commit -m "feat(core): bootstrap isolated @higgsfield/core React + Vite + TS + Tailwind + React Router foundation"
```

---

## Task 2: Establish Core Architecture & Directory Structure

**Files:**
- Create: `platform/higgsfield-core/src/core/registry/AppRegistry.ts`
- Create: `platform/higgsfield-core/src/core/providers/index.ts` (barrel)
- Create: `platform/higgsfield-core/src/core/layouts/AppShell.tsx`
- Create: many small focused files (see steps)

- [ ] **Step 2.1: Create the canonical PHASE 2 directory layout (exact structure required)**

This matches the new app structure you specified:

```
src/
├── core/
├── shared/
├── apps/
├── registry/
├── providers/
├── layouts/
├── hooks/
├── services/
└── styles/
```

Run these exact commands:

```bash
cd /Users/shasheemoore/Downloads/Higgsfield/platform/higgsfield-core/src
mkdir -p core/{registry,providers,layouts,components,hooks,types,utils}
mkdir -p shared/{ui,icons,hooks,utils,design-system}
mkdir -p apps/{timeline,image-studio,video-studio,open-generative}   # placeholder registration points
mkdir -p registry
mkdir -p providers
mkdir -p layouts
mkdir -p hooks
mkdir -p services/ai
mkdir -p styles
mkdir -p features/{workspace,media,ai}
```

Note: Some folders are created both at root `src/` and under `core/` because the registry, providers, and layouts will eventually be promoted to top-level `src/registry/`, `src/providers/`, `src/layouts/` for the clean PHASE 2 structure while `core/` holds the low-level engine. This gives us the best of both worlds during the transition.

- [ ] **Step 2.2: Define the App Definition Type (single source of truth)**

Create `platform/higgsfield-core/src/core/types/AppDefinition.ts`:

```ts
export interface AppDefinition {
  id: string;                    // unique kebab-case id, e.g. "timeline-editor"
  name: string;
  icon?: React.ComponentType;
  description?: string;
  category: 'creative' | 'studio' | 'workflow' | 'agent' | 'marketing' | 'system';
  version: string;
  entryPoint: () => Promise<React.ComponentType<any>>;   // lazy loaded React component
  defaultRoute?: string;
  supportsLegacy?: boolean;      // true = can be wrapped
  tags?: string[];
  permissions?: string[];
}
```

- [ ] **Step 2.3: Implement the App Registry (in-memory + extensible)**

Create `platform/higgsfield-core/src/core/registry/AppRegistry.ts`:

```ts
import type { AppDefinition } from '../types/AppDefinition';

class AppRegistry {
  private apps = new Map<string, AppDefinition>();

  register(app: AppDefinition) {
    if (this.apps.has(app.id)) {
      console.warn(`[AppRegistry] Overwriting existing app: ${app.id}`);
    }
    this.apps.set(app.id, app);
  }

  unregister(id: string) {
    this.apps.delete(id);
  }

  get(id: string): AppDefinition | undefined {
    return this.apps.get(id);
  }

  getAll(): AppDefinition[] {
    return Array.from(this.apps.values());
  }

  getByCategory(category: AppDefinition['category']): AppDefinition[] {
    return this.getAll().filter(a => a.category === category);
  }
}

export const appRegistry = new AppRegistry();
```

Export barrel `platform/higgsfield-core/src/core/registry/index.ts`:

```ts
export * from './AppRegistry';
```

- [ ] **Step 2.4: Create the Provider barrel and placeholder providers (detailed implementation in Task 3)**

Create `platform/higgsfield-core/src/core/providers/index.ts`:

```ts
export { WorkspaceProvider, useWorkspace } from './WorkspaceProvider';
export { ThemeProvider, useTheme } from './ThemeProvider';
// More providers added in Task 3
```

- [ ] **Step 2.5: Commit the architecture skeleton**

```bash
git add platform/higgsfield-core/src/core platform/higgsfield-core/src/shared
git commit -m "feat(core): establish core registry, types, and directory architecture"
```

---

## Task 3: Implement Foundational Shared Providers (Auth, Theme, Workspace, AI)

**Focus:** All providers must be self-contained, testable, and safe to use even when legacy apps are mounted.

- [ ] **Step 3.1: Theme Provider (Zustand + class toggling + localStorage persistence)**

Create `platform/higgsfield-core/src/core/providers/ThemeProvider.tsx`:

```tsx
import React, { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';

interface ThemeState {
  theme: 'dark' | 'light' | 'cinematic';
  setTheme: (t: 'dark' | 'light' | 'cinematic') => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('higgsfield-theme') as any) || 'cinematic',
  setTheme: (theme) => {
    localStorage.setItem('higgsfield-theme', theme);
    set({ theme });
  },
}));

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'cinematic');
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
```

- [ ] **Step 3.2: Minimal Supabase-backed Auth Provider (read-only for Phase 1 — no breaking changes to existing auth)**

Create `platform/higgsfield-core/src/core/providers/AuthProvider.tsx` (uses existing Supabase project — reuses the same anon key from `.env`):

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
```

- [ ] **Step 3.3: WorkspaceProvider (current open app, layout state, undo stack placeholder)**

Create `platform/higgsfield-core/src/core/providers/WorkspaceProvider.tsx` using Zustand slice pattern.

(For brevity in this plan, the full implementation follows the exact same pattern as ThemeProvider above — use a store for `currentAppId`, `openPanels`, `history`.)

- [ ] **Step 3.4: AI Provider (thin MuAPI abstraction layer — no secrets in code)**

Create a minimal `AIProvider.tsx` that exposes:

```ts
interface AIContext {
  generateImage: (prompt: string, opts?: any) => Promise<any>;
  // other methods added later
}
```

Implementation simply proxies to `/api` or the existing MuAPI helper (imported safely).

- [ ] **Step 3.5: Wire all providers into App.tsx root**

Update `platform/higgsfield-core/src/App.tsx` to wrap `<Routes>` with the four providers.

Commit after providers are verified working on :3100.

---

## Task 4: Build the Modern App Registry + Dynamic Registration

- [ ] **Step 4.1: Create a Registry Dashboard route (for development only)**

Add route `/registry` that renders a table of all registered apps using the registry built in Task 2.

- [ ] **Step 4.2: Create a sample "Hello World" modern app and register it**

Create `platform/higgsfield-core/src/apps/hello-modern/HelloModernApp.tsx`:

```tsx
export default function HelloModernApp() {
  return <div className="p-8 text-xl text-green-400">Hello from the new modern React platform!</div>;
}
```

Then in `src/main.tsx` or a dedicated `registerApps.ts`, call:

```ts
import { appRegistry } from '@core/registry';
import HelloModernApp from '@apps/hello-modern/HelloModernApp';

appRegistry.register({
  id: 'hello-modern',
  name: 'Hello Modern',
  category: 'system',
  version: '2.0.0',
  entryPoint: async () => HelloModernApp,
});
```

Verify it appears in the registry route.

- [ ] **Step 4.3: Commit the registry + first modern app**

```bash
git commit -m "feat(core): implement AppRegistry with dynamic registration + first modern app"
```

---

## Task 5: Implement the Cinematic Workspace Shell + Layout System

This is the visual heart of the new platform.

**Files to create:**
- `src/core/layouts/AppShell.tsx`
- `src/core/layouts/WorkspaceLayout.tsx`
- `src/core/components/Sidebar.tsx` (modern, resizable, keyboard nav)
- `src/core/components/Topbar.tsx`
- `src/core/components/Panel.tsx` (resizable panels using framer-motion + react-resizable-panels or simple CSS grid)

- [ ] **Step 5.1: Build AppShell that supports both modern apps and legacy wrappers**

The shell must accept a `children` prop that can be either a modern React component or a `<LegacyAppWrapper>`.

- [ ] **Step 5.2: Implement Sidebar with app registry integration**

Sidebar reads from `appRegistry.getAll()` and renders clickable items that navigate via React Router to `/workspace/:appId`.

- [ ] **Step 5.3: Add Framer Motion page transitions and cinematic panel animations**

Use `<motion.div>` for smooth expand/collapse of panels.

- [ ] **Step 5.4: Make the shell the default route at `/workspace`**

Update router so visiting the core platform shows the beautiful empty workspace with "No app selected — pick one from the sidebar".

- [ ] **Step 5.5: Test that the shell loads on :3100 without touching any legacy server**

Commit the first visual milestone.

---

## Task 6: Shared Design System Foundation (Tokens + Base shadcn Components)

- [ ] **Step 6.1: Define design tokens in CSS variables + Tailwind config**

Expand `tailwind.config.js` and `src/index.css` with cinematic tokens (bg, panel, accent, etc.).

- [ ] **Step 6.2: Scaffold first 5 shadcn-style components (Button, Card, Dialog, Tabs, ResizableHandle)**

Use the official shadcn CLI or manual Radix + Tailwind implementations (preferred for full control).

Place them in `src/shared/ui/`.

- [ ] **Step 6.3: Create a living style guide page at `/design-system`**

This page becomes the single source of truth for the design system and is used by all future app developers.

---

## Task 7: Legacy App Wrapper (The Safety Net)

This task is the most important for "never break current apps".

- [ ] **Step 7.1: Create `LegacyAppWrapper.tsx` component**

Two modes supported from day one:
1. **Iframe mode** (safest, zero JS collision) — default for Phase 1
2. **Portal/Shadow mode** (advanced, for later when we trust the legacy code)

Iframe implementation:

```tsx
interface LegacyAppWrapperProps {
  legacyUrl: string;           // e.g. "http://localhost:8080/#/timeline?legacy=1"
  title: string;
}

export function LegacyAppWrapper({ legacyUrl, title }: LegacyAppWrapperProps) {
  return (
    <div className="w-full h-full relative">
      <iframe
        src={legacyUrl}
        className="w-full h-full border-0"
        title={title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
```

- [ ] **Step 7.2: Register several existing studios as legacy apps in the registry**

Example:

```ts
appRegistry.register({
  id: 'timeline-legacy',
  name: 'Timeline Editor (Legacy)',
  category: 'creative',
  version: '1.x',
  supportsLegacy: true,
  entryPoint: async () => () => <LegacyAppWrapper legacyUrl="http://localhost:8080/#/timeline" title="Timeline" />,
});
```

- [ ] **Step 7.3: Add a toggle in the shell header: "Modern / Legacy" for apps that have both versions**

- [ ] **Step 7.4: Document the wrapper contract in `docs/` so future AI agents know how to safely import old code**

---

## Task 8: Co-existence & Launch Strategy (Run Old + New Side-by-Side)

- [ ] **Step 8.1: Add root-level convenience scripts (non-breaking additions)**

In the **root** `package.json` (append-only), add:

```json
"core:dev": "pnpm --filter @higgsfield/core dev",
"core:build": "pnpm --filter @higgsfield/core build",
"core:preview": "pnpm --filter @higgsfield/core preview"
```

These do **not** affect existing scripts.

- [ ] **Step 8.2: Create a "Launch Matrix" document**

`platform/higgsfield-core/DEVELOPER-QUICKSTART.md` explaining:
- How to run marketing (Next)
- How to run legacy shell (Vite :8080)
- How to run the new Core platform (:3100)
- How to register a new modern app
- How to wrap a legacy app

- [ ] **Step 8.3: Final verification test matrix**

Run all three servers simultaneously and confirm:
- Marketing pages still work
- Every existing studio still loads via the old hash router
- The new Core platform on 3100 shows the registry and can launch both modern and legacy-wrapped apps

- [ ] **Step 8.4: Commit the launch configuration**

```bash
git commit -m "chore: add safe co-existence scripts and developer launch matrix for Core 2.0"
```

---

## Task 9: Progressive Migration Playbook (Post-Platform Tasks)

This section is documentation only — no code changes yet. It is the "what comes after the platform is solid".

- Document the exact 6-step migration order from the original user request:
  1. One Higgsfield studio at a time (start with lowest-risk: e.g. a simple page)
  2. Port to modern React component inside the new registry
  3. Keep legacy registration alive with the wrapper as fallback
  4. After 3–4 studios are native, begin deprecating old routes
  5. Finally import Open Generative AI / external apps using the same registry pattern

- Create a `MIGRATION_PLAYBOOK.md` with templates for "Porting a Studio" PRs.

---

## Task 10: Final Hardening, Tests, and Documentation

- [ ] Add Vitest + React Testing Library to the core package
- [ ] Write smoke tests for: registry registration, provider initialization, shell rendering, legacy wrapper iframe
- [ ] Add CI matrix entry (optional) that builds the core package
- [ ] Update root README with a one-paragraph "New Architecture" section pointing to the platform
- [ ] Create `CHANGELOG-CORE.md` inside the platform folder

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-23-higgsfield-core-2.0-platform-migration.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task using `superpowers:subagent-driven-development`. Review between tasks. Fast, safe iteration. Perfect for a migration of this size.

**2. Inline Execution** — Use `superpowers:executing-plans` to run tasks sequentially in this session with explicit review checkpoints after every major phase (Tasks 0–2, 3–5, 6–8, 9–10).

**Which approach would you like to take?**

Reply with either:
- "Launch subagent-driven execution" (I will immediately start dispatching the first agent for Task 0)
- "Execute inline with checkpoints"
- Or any specific task number you want to start with first.

This plan guarantees the current apps stay 100% functional while the new modern foundation is built beside them. When you are ready, we begin.