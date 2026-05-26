class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.instances = new Map();
  }

  register(name, provider, options = {}) {
    this.providers.set(name, { provider, options, instance: null });
  }

  async get(name) {
    const entry = this.providers.get(name);
    if (!entry) {
      throw new Error(`Provider '${name}' not registered`);
    }

    if (!entry.instance) {
      entry.instance = await this.createInstance(entry);
    }

    return entry.instance;
  }

  async createInstance(entry) {
    const { provider, options } = entry;
    
    if (typeof provider === 'function') {
      return new provider(options);
    }
    
    if (provider && typeof provider === 'object') {
      return provider;
    }
    
    throw new Error(`Invalid provider for '${entry.name}'`);
  }

  async getInstance(name) {
    return this.get(name);
  }

  async reset(name) {
    const entry = this.providers.get(name);
    if (entry) {
      entry.instance = null;
    }
  }

  async clear() {
    this.instances.clear();
    for (const [name, entry] of this.providers) {
      entry.instance = null;
    }
  }
}

const registry = new ProviderRegistry();

export const providers = {
  register: registry.register.bind(registry),
  get: registry.get.bind(registry),
  getInstance: registry.getInstance.bind(registry),
  reset: registry.reset.bind(registry),
  clear: registry.clear.bind(registry),
};

export { ProviderRegistry };
export default registry;