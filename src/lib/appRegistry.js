import { validateManifest } from './validateAppManifest.js';

const KNOWN_COMPLETE_APPS = [
  { id: 'image', name: 'Image Studio', description: 'Generate and transform images with 200+ models (Flux, Nano Banana 2, Midjourney, etc.)', category: 'image', route: '/image', status: 'complete', icon: '🖼️' },
  { id: 'video', name: 'Video Studio', description: 'Text-to-video, image-to-video, and advanced motion tools with 200+ models', category: 'video', route: '/video', status: 'complete', icon: '🎬' },
  { id: 'cinema', name: 'Cinema Studio', description: 'Professional cinematic shots with camera controls (lens, focal length, aperture)', category: 'cinema', route: '/cinema', status: 'complete', icon: '🎥' },
  { id: 'ai-vfx', name: 'AI-VFX Studio', description: '37 professional AI visual effects and motion controls', category: 'vfx', route: '/ai-vfx', status: 'complete', icon: '✨' },
  { id: 'lipsync', name: 'Lip Sync Studio', description: 'Animate portraits or sync lips to audio with AI using 9 dedicated models', category: 'vfx', route: '/lipsync', status: 'complete', icon: '🎙️' },
  { id: 'audio', name: 'Audio Studio', description: 'Generate audio from text prompts with AI across multiple styles', category: 'audio', route: '/audio', status: 'complete', icon: '🎵' },
  { id: 'ai-clipping', name: 'AI Clipping', description: 'Turn long videos into viral-ready vertical shorts', category: 'video', route: '/ai-clipping', status: 'complete', icon: '✂️' },
  { id: 'vibe-motion', name: 'Vibe Motion', description: 'AI-powered motion graphics and animation tools', category: 'video', route: '/vibe-motion', status: 'complete', icon: '� Motion' },
  { id: 'ai-headshot-generator', name: 'AI Headshot Generator', description: 'Generate professional AI headshots from photos', category: 'image', route: '/headshots', status: 'complete', icon: '📸' },
  { id: 'open-pomelli', name: 'Open Pomelli', description: 'Brand DNA extraction and campaign generation', category: 'marketing', route: '/pomelli-studio', status: 'complete', icon: '🎯' },
  { id: 'marketing-studio', name: 'Marketing Studio', description: 'Create marketing campaigns with AI-generated ad videos and social content', category: 'marketing', route: '/marketing-studio', status: 'complete', icon: '📢' },
  { id: 'remix-go', name: 'Remix Go', description: 'Quick AI video remix tool', category: 'video', route: '/remix-go', status: 'complete', icon: '✂️' },
  { id: 'vibe-workflow', name: 'Vibe Workflow', description: 'Visual workflow builder for AI pipelines', category: 'workflow', route: '/workflows', status: 'complete', icon: '🔀' },
  { id: 'design-agent', name: 'Design Agent', description: 'AI-powered design agent for posters, social graphics, brand kits, and creative assets', category: 'design', route: '/design-agent', status: 'complete', icon: '🎨' },
];

const SHELL_APP_DIRS = [];

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