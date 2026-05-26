import { AppRegistry } from './appRegistry.js';
import { aiOSExecutionLoop } from './ai-os-execution-loop.js';

export async function runAppById(appId, input, context = {}) {
  const app = AppRegistry.get(appId);

  if (!app) {
    return await aiOSExecutionLoop({
      appId,
      input,
      context
    });
  }

  return app.execute(input, context);
}