import { VibeWorkflowAdapter } from './vibe-workflow-adapter.js';
import { MuAPIGenerationPipeline } from './muapi-pipeline.js';
import { WorkflowEngine } from './workflow-engine.js';
import { ExecutionRuntime } from './execution-runtime.js';
import { executionPersistence } from './execution-persistence.js';
import { executionRecovery } from './execution-recovery.js';

const adapters = new Map();
const pipelines = new Map();
const runtimes = new Map();

class RuntimeAdapterFactory {
  static create(appId, type) {
    switch (type) {
      case 'workflow':
        if (!adapters.has(appId)) {
          adapters.set(appId, new VibeWorkflowAdapter());
        }
        return adapters.get(appId);

      case 'pipeline':
        if (!pipelines.has(appId)) {
          pipelines.set(appId, new MuAPIGenerationPipeline());
        }
        return pipelines.get(appId);

      case 'runtime':
        if (!runtimes.has(appId)) {
          runtimes.set(appId, new ExecutionRuntime());
        }
        return runtimes.get(appId);

      default:
        return new VibeWorkflowAdapter();
    }
  }

  static get(appId, type) {
    switch (type) {
      case 'workflow': return adapters.get(appId) || this.create(appId, type);
      case 'pipeline': return pipelines.get(appId) || this.create(appId, type);
      case 'runtime': return runtimes.get(appId) || this.create(appId, type);
      default: return this.create(appId, type);
    }
  }

  static async executeWithRuntime(appId, task, options = {}) {
    const runtime = this.get(appId, 'runtime');
    return await runtime.execute(`${appId}-${Date.now()}`, task, options);
  }

  static async createWorkflow(appId, definition) {
    const adapter = this.get(appId, 'workflow');
    adapter.clear();
    adapter.registerWorkflow(`${appId}-workflow`);
    return adapter;
  }
}

export { RuntimeAdapterFactory, adapters, pipelines, runtimes };