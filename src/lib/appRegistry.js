import { validateManifest } from './validateAppManifest';

const APP_DIRS = [
  'agents',
  'ai-headshot-generator',
  'design-agent',
  'marketing-studio',
  'open-pomelli',
  'remix-go',
  'vibe-workflow',
  'workflows',
];

let cachedRegistry = null;

async function loadAllManifests() {
  const manifests = [];

  for (const appId of APP_DIRS) {
    try {
      const mod = await import(`../apps/${appId}/manifest.js`);
      const manifest = mod.appManifest || mod.default;
      if (manifest) {
        const validation = validateManifest(manifest);
        manifests.push({
          ...manifest,
          validation,
        });
      }
    } catch (err) {
      console.warn(`[AppRegistry] Failed to load manifest for ${appId}:`, err.message);
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
      cachedRegistry = await loadAllManifests();
    }
    return cachedRegistry;
  },

  async getAppsByCategory(category) {
    const apps = await this.getAllApps();
    return apps.filter(app => app.category === category);
  },

  async getShellApps() {
    const apps = await this.getAllApps();
    return apps.filter(app => app.status === 'shell' || app.validation?.isShell);
  },

  async getCompleteApps() {
    const apps = await this.getAllApps();
    return apps.filter(app => app.status === 'complete');
  },

  async getPartialApps() {
    const apps = await this.getAllApps();
    return apps.filter(app => app.status === 'partial');
  },

  clearCache() {
    cachedRegistry = null;
  },
};

export default appRegistry;
