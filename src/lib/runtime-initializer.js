import { AppRegistry, registerAppFromManifest } from './appRegistry.js';
import { registeredApps } from './appRegistry.js';

const appManifests = new Map();

class RuntimeInitializer {
  static reset() {
    appManifests.clear();
  }

  async init() {
    return { registered: registeredApps.size, apps: Array.from(registeredApps.keys()) };
  }

  static registerAppManifest(appId, manifest) {
    appManifests.set(appId, manifest);
  }

  static getAppManifest(appId) {
    return appManifests.get(appId);
  }

  static registerApp(appId, manifest) {
    appManifests.set(appId, manifest);
    const executor = {
      appId,
      name: manifest.name,
      execute: async (input, context) => ({ status: 'completed', appId, input })
    };
    AppRegistry.register(appId, executor);
  }

  static getRegisteredApps() {
    return Array.from(appManifests.values());
  }
}

const runtimeInitializer = new RuntimeInitializer();

export { RuntimeInitializer, runtimeInitializer };