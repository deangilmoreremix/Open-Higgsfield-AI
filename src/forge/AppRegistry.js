export class AppRegistry {
  constructor(factory) {
    this.factory = factory;
    this.apps = new Map();
  }

  register(appDefinition) {
    const app = this.factory.create(appDefinition);
    this.apps.set(appDefinition.id, app);
    return app;
  }

  run(appId, input) {
    const app = this.apps.get(appId);
    if (!app) throw new Error(`App not found: ${appId}`);
    return app.run(input);
  }

  list() {
    return [...this.apps.keys()];
  }

  get(appId) {
    return this.apps.get(appId);
  }
}