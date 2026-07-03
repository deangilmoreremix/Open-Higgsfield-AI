/**
 * UI App Registry - Central registry for all UI applications
 * Handles registration, lazy loading, metadata, and capabilities
 * SINGLE SOURCE OF TRUTH for all app routing and mounting
 */

import { lazy } from 'react';

// App definition interface
export const createAppDefinition = (config) => ({
  id: config.id,
  name: config.name,
  description: config.description || '',
  icon: config.icon || 'Box',
  category: config.category || 'general',
  route: config.route,
  status: config.status || 'beta',
  features: config.features || [],
  legacy: config.legacy || false,
  source: config.source || 'react-shell', // legacy | react-shell | upstream-next | external-repo
  mount: config.mount || 'react', // react | iframe | module-federation
  deprecated: config.deprecated || false,
  duplicateOf: config.duplicateOf || null,
  lazy: config.lazy ?? true,
  capabilities: config.capabilities || [],
  meta: config.meta || {},
});

class UIAppRegistry {
  constructor() {
    this.apps = new Map();
    this.lazyCache = new Map();
  }

  register(appConfig) {
    const app = createAppDefinition(appConfig);
    
    // Create lazy loader if component is provided
    if (appConfig.component && app.lazy) {
      app.lazyComponent = lazy(appConfig.component);
    }
    
    this.apps.set(app.id, app);
    return app;
  }

  get(id) {
    return this.apps.get(id);
  }

  getAll() {
    return Array.from(this.apps.values());
  }

  getActive() {
    return this.getAll().filter(app => !app.deprecated);
  }

  getByCategory(category) {
    return this.getActive().filter(app => app.category === category);
  }

  getByRoute(route) {
    return this.getActive().find(app => app.route === route);
  }

  getBySource(source) {
    return this.getActive().filter(app => app.source === source);
  }

  list() {
    return Array.from(this.apps.keys());
  }

  has(id) {
    return this.apps.has(id);
  }

  // Get component with lazy loading
  getComponent(id) {
    const app = this.apps.get(id);
    if (!app) return null;
    return app.lazyComponent || app.component;
  }

  // Get mount strategy for an app
  getMountStrategy(id) {
    const app = this.apps.get(id);
    return app ? app.mount : 'react';
  }
}

// Global registry instance
export const registry = new UIAppRegistry();

// =============================================================================
// CANONICAL APP REGISTRATIONS
// =============================================================================

// === REACT SHELL APPS (src/apps/*) ===
registry.register({
  id: 'design-agent',
  name: 'Design Agent',
  description: 'AI-powered design canvas with generative capabilities',
  icon: 'Palette',
  category: 'design',
  route: '/design-agent',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Creative canvas editor', 'Konva-based visual editor', 'AI image generation'],
  capabilities: ['canvas', 'generation', 'export'],
});

registry.register({
  id: 'workflows',
  name: 'Workflows',
  description: 'Repeatable pipelines — generate, edit, render, package.',
  icon: 'Workflow',
  category: 'workflow',
  route: '/workflows',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Node-based workflows', 'Automation'],
  capabilities: ['automation', 'pipeline'],
});

registry.register({
  id: 'agents',
  name: 'Agents',
  description: 'Autonomous creative agents. Planning, editing, writing.',
  icon: 'Bot',
  category: 'ai',
  route: '/agents',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Agent orchestration', 'Autonomous workflows'],
  capabilities: ['ai', 'automation'],
});

// === NATIVE REACT APPS (fully integrated source) ===
// Source: apps/ai-vfx + packages/ai-vfx + src/components - Canonical native React
registry.register({
  id: 'ai-vfx',
  name: 'AI VFX',
  description: 'AI-powered visual effects studio',
  icon: 'Sparkles',
  category: 'vfx',
  route: '/ai-vfx',
  source: 'native-react',
  mount: 'react',
  status: 'complete',
  features: ['Visual effects', 'AI enhancement', 'Real-time generation', 'Asset library integration'],
  capabilities: ['effects', 'render', 'ai', 'media-pipeline'],
  legacy: false,
  component: () => import('../apps/ai-vfx/index.jsx'),
});

// Source: apps/director + src/components/DirectorPage.js + src/lib/director - Canonical native React/DOM
registry.register({
  id: 'director',
  name: 'Director',
  description: 'Director-mode tools for cinematic scene composition',
  icon: 'Film',
  category: 'tools',
  route: '/director',
  source: 'native-react',
  mount: 'react',
  status: 'complete',
  features: ['Scene planning', 'Cinematic direction', 'Agent runtime', 'Storyboard frames', 'Real-time generation'],
  capabilities: ['planning', 'direction', 'ai', 'timeline', 'media-pipeline'],
  legacy: false,
  component: () => import('../components/DirectorPage.js').then(m => m.DirectorPage()),
});

// Source: src/components/cinegen/* (native React conversion of CineGenApp class) - Canonical native
registry.register({
  id: 'cinegen',
  name: 'Cinegen',
  description: 'Cinematic video generation tool',
  icon: 'Video',
  category: 'video',
  route: '/cinegen',
  source: 'native-react',
  mount: 'react',
  status: 'complete',
  features: ['Video generation', 'Cinematic effects', 'Elements panel', 'AI tools (gap fill, extend, music, mask)'],
  capabilities: ['generation', 'render', 'timeline', 'ai-tools'],
  legacy: false,
  component: () => import('../components/cinegen/CineGenStudio.jsx'),
});

// Source: apps/ai-storyboarder + full extracted React 19 (DnD-kit, Zustand, ReactFlow, Recharts, tabs, canvas, stores) - Canonical native
registry.register({
  id: 'storyboard',
  name: 'Storyboard',
  description: 'Plan and visualize your video scenes',
  icon: 'Grid',
  category: 'planning',
  route: '/storyboard',
  source: 'native-react',
  mount: 'react',
  status: 'complete',
  features: ['Scene planning', 'Visual storyboarding', 'DnD canvas', 'AI analysis', 'Script/Scenes/ Images tabs', 'Project management'],
  capabilities: ['planning', 'visualization', 'ai', 'drag-drop', 'export'],
  legacy: false,
  component: () => import('../apps/ai-storyboarder/index.jsx').then(m => m.StoryboarderApp()),
});

// === MARKETING APPS (React shell components) ===
registry.register({
  id: 'marketing-studio',
  name: 'Marketing Studio',
  description: 'Create marketing video ads with AI',
  icon: 'Megaphone',
  category: 'marketing',
  route: '/marketing-studio',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Video ad generation', 'Product marketing', 'Avatar presets'],
  capabilities: ['marketing', 'ads'],
});

// Source: apps/open-pomelli + extracted libs (brand-analyzer etc) + PomelliStudio - Canonical native
registry.register({
  id: 'pomelli-studio',
  name: 'Pomelli Studio',
  description: 'AI marketing studio for brand DNA and campaign generation',
  icon: 'Megaphone',
  category: 'marketing',
  route: '/pomelli-studio',
  source: 'native-react',
  mount: 'react',
  status: 'complete',
  features: ['Brand DNA analysis', 'Campaign generation', 'Website analysis', 'Photo studio', 'Animation'],
  capabilities: ['marketing', 'branding', 'generation', 'asset-pipeline'],
});

// Source: apps/ai-headshot-generator + extracted 689LOC real page + 7 lib services (muapi/auth/stripe/supabase) - Canonical native
registry.register({
  id: 'ai-headshot',
  name: 'AI Headshot',
  description: 'Create studio-quality portrait photos using AI',
  icon: 'User',
  category: 'image',
  route: '/ai-headshot',
  source: 'native-react',
  mount: 'react',
  status: 'complete',
  features: ['Headshot generation', 'Style selection', 'Aspect ratios', 'Categories (LinkedIn etc)', 'Batch generation', 'Asset save'],
  capabilities: ['generation', 'image', 'ai', 'asset-pipeline'],
  legacy: false,
  component: () => import('../apps/ai-headshot/index.jsx').then(m => m.HeadshotApp()),
});

// Source: apps/videco-ai-platform + src/components/videco + VidecoOutreachApp - Canonical native React
registry.register({
  id: 'videco-outreach',
  name: 'Videco Outreach',
  description: 'AI-powered video outreach and workflow automation',
  icon: 'Video',
  category: 'outreach',
  route: '/videco-outreach',
  source: 'native-react',
  mount: 'react',
  status: 'complete',
  features: ['Video outreach', 'Workflow automation', 'Recorder', 'Player', 'Insights', 'AI videos'],
  capabilities: ['outreach', 'automation', 'media', 'editor'],
  component: () => import('../components/VidecoOutreachApp.tsx'),
});

// === STUDIO APPS (React shell components) ===
registry.register({
  id: 'image-studio',
  name: 'Image Studio',
  description: 'Text to image. Image to image. Edit, enhance, style.',
  icon: 'Image',
  category: 'studio',
  route: '/studio/image',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Text to image', 'Image to image', 'Style transfer'],
  capabilities: ['generation', 'editing'],
});

registry.register({
  id: 'video-studio',
  name: 'Video Studio',
  description: 'Text to video. Image to video. Motion from concept.',
  icon: 'Video',
  category: 'studio',
  route: '/studio/video',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Text to video', 'Image to video', 'Motion generation'],
  capabilities: ['generation', 'editing'],
});

registry.register({
  id: 'cinema-studio',
  name: 'Cinema Studio',
  description: 'Cinematic scene direction — camera, lighting, mood.',
  icon: 'Camera',
  category: 'studio',
  route: '/studio/cinema',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Scene direction', 'Camera control', 'Lighting'],
  capabilities: ['direction', 'render'],
});

// === SPECIALIZED TOOLS ===
registry.register({
  id: 'effects',
  name: 'Effects',
  description: 'Browse and apply creative visual effects',
  icon: 'Sparkles',
  category: 'tools',
  route: '/effects',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Visual effects', 'Filters'],
  capabilities: ['effects', 'editing'],
});

registry.register({
  id: 'avatar',
  name: 'Avatar',
  description: 'Create and customize AI digital avatars',
  icon: 'User',
  category: 'tools',
  route: '/avatar',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Avatar creation', 'Customization'],
  capabilities: ['avatar', 'generation'],
});

registry.register({
  id: 'character',
  name: 'Character',
  description: 'Design and manage AI characters',
  icon: 'Users',
  category: 'tools',
  route: '/character',
  source: 'react-shell',
  mount: 'react',
  status: 'complete',
  features: ['Character design', 'Persona creation'],
  capabilities: ['character', 'design'],
});

// === DEPRECATED APPS (Marked but NOT deleted) ===
// These apps exist in multiple locations - only the canonical versions above are active
// ai-vfx-deprecated removed - now fully native-react at canonical 'ai-vfx'

registry.register({
  id: 'director-deprecated',
  name: 'Director (Deprecated)',
  category: 'tools',
  route: '/director',
  source: 'legacy',
  mount: 'react',
  status: 'deprecated',
  deprecated: true,
  duplicateOf: 'director',
});

export default registry;