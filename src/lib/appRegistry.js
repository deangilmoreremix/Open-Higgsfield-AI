import { validateManifest } from './validateAppManifest.js';

const KNOWN_COMPLETE_APPS = [
  { id: 'image', name: 'Image Studio', description: 'Generate and transform images with 200+ models (Flux, Midjourney, etc.)', category: 'image', route: '/image', status: 'complete', icon: '🖼️' },
  { id: 'video', name: 'Video Studio', description: 'Text-to-video, image-to-video, and advanced motion tools', category: 'video', route: '/video', status: 'complete', icon: '🎬' },
  { id: 'ai-vfx', name: 'AI-VFX Studio', description: '37 professional AI visual effects and motion controls', category: 'vfx', route: '/ai-vfx', status: 'complete', icon: '✨' },
  { id: 'lipsync', name: 'Lip Sync Studio', description: 'Animate portraits or sync lips to audio with AI', category: 'vfx', route: '/lipsync', status: 'complete', icon: '🎙️' },
  { id: 'ai-headshot-generator', name: 'AI Headshot Generator', description: 'Generate professional AI headshots from photos', category: 'image', route: '/headshots', status: 'complete', icon: 'Camera' },
  { id: 'open-pomelli', name: 'Open Pomelli', description: 'Brand DNA extraction and campaign generation', category: 'marketing', route: '/pomelli-studio', status: 'complete', icon: '🎯' },
  { id: 'remix-go', name: 'Remix Go', description: 'Quick AI video remix tool', category: 'video', route: '/remix-go', status: 'complete', icon: 'Scissors' },
  { id: 'vibe-workflow', name: 'Vibe Workflow', description: 'Visual workflow builder for AI pipelines', category: 'workflow', route: '/workflows', status: 'complete', icon: 'GitBranch' },
];

const SHELL_APP_DIRS = [
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