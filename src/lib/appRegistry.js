import { validateManifest } from './validateAppManifest.js';

const KNOWN_COMPLETE_APPS = [
  { id: 'image', name: 'Image Studio', description: 'Generate and transform images with 200+ models (Flux, Midjourney, etc.)', category: 'image', route: '/image', status: 'complete', icon: '🖼️' },
  { id: 'video', name: 'Video Studio', description: 'Text-to-video, image-to-video, and advanced motion tools', category: 'video', route: '/video', status: 'complete', icon: '🎬' },
  { id: 'ai-vfx', name: 'AI-VFX Studio', description: '37 professional AI visual effects and motion controls', category: 'vfx', route: '/ai-vfx', status: 'complete', icon: '✨' },
  { id: 'cinema', name: 'Cinema Studio', description: 'Cinematic grading, camera moves, and film tools', category: 'cinema', route: '/cinema', status: 'complete', icon: '🎥' },
  { id: 'effects', name: 'Effects Studio', description: 'Vibe Motion and advanced effects library', category: 'vfx', route: '/effects', status: 'complete', icon: '⚡' },
  { id: 'edit', name: 'Edit Studio', description: 'Professional non-linear video editing', category: 'edit', route: '/edit', status: 'complete', icon: '✂️' },
  { id: 'character', name: 'Character Studio', description: 'Create and animate consistent characters', category: 'character', route: '/character', status: 'complete', icon: '👤' },
  { id: 'influencer', name: 'Influencer Studio', description: 'AI influencer creation and content generation', category: 'social', route: '/influencer', status: 'complete', icon: '📱' },
  { id: 'studio', name: 'Studio', description: 'Unified professional workspace', category: 'core', route: '/studio', status: 'complete', icon: '🎨' },
  { id: 'marketing-studio', name: 'Marketing Studio', description: 'Campaign generation and social content tools', category: 'marketing', route: '/marketing-studio', status: 'complete', icon: '📈' },
  { id: 'audio', name: 'Audio Studio', description: 'Generate music and speech with AI audio models', category: 'audio', route: '/audio', status: 'complete', icon: '🎵' },
  { id: 'clipping', name: 'AI Clipping Studio', description: 'Automatically extract highlights and create clips from videos', category: 'video', route: '/clipping', status: 'complete', icon: '✂️' },
];

// Removed duplicate entries that are now handled by shell apps:
// - 'workflows' (from src/apps/workflows/manifest.js)
// - 'agents' (from src/apps/agents/manifest.js)
// - 'ai-headshot-generator' (from src/apps/ai-headshot-generator/manifest.js)
// - 'open-pomelli' (from src/apps/open-pomelli/manifest.js)
// - 'remix-go' (from src/apps/remix-go/manifest.js)
// - 'design-agent' (from src/apps/design-agent/manifest.js)

const SHELL_APP_DIRS = [
  'ai-headshot-generator',
  'open-pomelli',
  'videco',
  'remix-go',
  'agents',
  'workflows',
  'design-agent',
];

let cachedRegistry = null;

async function loadShellManifests() {
  const manifests = [];
  for (const appId of SHELL_APP_DIRS) {
    try {
      const mod = await import(`../apps/${appId}/manifest.js`);
      const manifest = mod.appManifest || mod.default;
      if (manifest) {
        const validation = validateManifest(manifest);
        manifests.push({ ...manifest, validation });
      }
    } catch (err) {
      // ignore missing shell manifests
    }
  }
  return manifests;
}

export const appRegistry = {
  async getApp(appId) {
    const apps = await this.getAllApps();
    return apps.find(app => app.id === appId) || null;
  },

  async getAllApps() {
    if (!cachedRegistry) {
      const shells = await loadShellManifests();
      cachedRegistry = [...KNOWN_COMPLETE_APPS, ...shells];
    }
    return cachedRegistry;
  },

  async getAppsByCategory(category) {
    const apps = await this.getAllApps();
    return apps.filter(app => app.category === category);
  },

  async getShellApps() {
    const apps = await this.getAllApps();
    return apps.filter(app => app.status === 'shell');
  },

  async getCompleteApps() {
    const apps = await this.getAllApps();
    return apps.filter(app => app.status === 'complete');
  },

  clearCache() {
    cachedRegistry = null;
  },
};

export default appRegistry;