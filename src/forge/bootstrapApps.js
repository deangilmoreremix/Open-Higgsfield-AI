import { AppRegistry } from './AppRegistry.js';
import { AppFactory } from './AppFactory.js';
import { Kernel } from '../kernel/kernel.js';
import {
  videcoAIPlatform,
  vibeWorkflowApp,
  videoOutreachApp,
  headshotApp,
  workflowApp,
  studioApp,
  openPomelliApp,
  agentsApp,
  assistantApp,
} from './apps/index.js';

export function bootstrapApps() {
  const kernel = new Kernel();
  const factory = new AppFactory(kernel);
  const registry = new AppRegistry(factory);

  registry.register(videcoAIPlatform);
  registry.register(vibeWorkflowApp);
  registry.register(videoOutreachApp);
  registry.register(headshotApp);
  registry.register(workflowApp);
  registry.register(studioApp);
  registry.register(openPomelliApp);
  registry.register(agentsApp);
  registry.register(assistantApp);

  return { registry, kernel, factory };
}