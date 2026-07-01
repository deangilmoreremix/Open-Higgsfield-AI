import { AppRegistry } from './appRegistry.js';
import { vibeWorkflowAdapter } from './vibe-workflow-adapter.js';
import { muAPIPipeline } from './muapi-pipeline.js';
import { executionRuntime } from './execution-runtime.js';
import { workflowEngine } from './workflow-engine.js';
import { JobQueue } from './queue.js';
import { realtimeTracker } from './realtime-execution-tracker.js';
import { executionPersistence } from './execution-persistence.js';
import { executionRecovery } from './execution-recovery.js';

class AppExecutorFactory {
  static create(appId, manifest) {
    const executionMode = manifest.executionMode || 'runtime-native';

    switch (executionMode) {
      case 'workflow':
        return this.createWorkflowExecutor(appId, manifest);
      case 'pipeline':
        return this.createPipelineExecutor(appId, manifest);
      case 'ai-generation':
        return this.createAIGenerationExecutor(appId, manifest);
      case 'runtime-native':
      default:
        return this.createNativeExecutor(appId, manifest);
    }
  }

  static createNativeExecutor(appId, manifest) {
    return {
      appId,
      name: manifest.name,
      execute: async (input, context = {}) => {
        const executionId = `${appId}-${Date.now()}`;
        realtimeTracker.emit('queued', { executionId, appId });

        try {
          realtimeTracker.emit('processing', { executionId });

          const result = await this.runWithRuntime(appId, input, context, manifest);

          realtimeTracker.emit('completed', { executionId, result });
          return { success: true, executionId, result };
        } catch (error) {
          realtimeTracker.emit('failed', { executionId, error: error.message });
          throw error;
        }
      }
    };
  }

  static createWorkflowExecutor(appId, manifest) {
    return {
      appId,
      name: manifest.name,
      execute: async (input, context = {}) => {
        const executionId = `${appId}-workflow-${Date.now()}`;
        realtimeTracker.emit('queued', { executionId, appId });

        try {
          realtimeTracker.emit('processing', { executionId });

          const workflowId = context.workflowId || appId;
          const result = await vibeWorkflowAdapter.execute(workflowId, input, context);

          realtimeTracker.emit('completed', { executionId, result });
          return { success: true, executionId, result };
        } catch (error) {
          realtimeTracker.emit('failed', { executionId, error: error.message });
          throw error;
        }
      }
    };
  }

  static createPipelineExecutor(appId, manifest) {
    return {
      appId,
      name: manifest.name,
      execute: async (input, context = {}) => {
        const executionId = `${appId}-pipeline-${Date.now()}`;
        realtimeTracker.emit('queued', { executionId, appId });

        try {
          realtimeTracker.emit('processing', { executionId });

          const task = {
            type: 'pipeline',
            payload: {
              stages: manifest.stages || [],
              input
            }
          };

          const queue = new JobQueue();
          const jobId = await queue.add({
            type: 'execution',
            payload: { taskId: executionId, task },
            priority: context.priority || 5
          });

          const result = await executionRuntime.execute(executionId, task, context);

          realtimeTracker.emit('completed', { executionId, result });
          return { success: true, executionId, result };
        } catch (error) {
          realtimeTracker.emit('failed', { executionId, error: error.message });
          throw error;
        }
      }
    };
  }

  static createAIGenerationExecutor(appId, manifest) {
    return {
      appId,
      name: manifest.name,
      execute: async (input, context = {}) => {
        const executionId = `${appId}-ai-${Date.now()}`;
        realtimeTracker.emit('queued', { executionId, appId });

        try {
          realtimeTracker.emit('processing', { executionId });

          const task = {
            type: 'ai-generation',
            provider: manifest.pipeline?.providers?.[0] || 'muapi',
            payload: {
              type: input.type || 'image',
              prompt: input.prompt || context.prompt,
              settings: input.settings || {}
            }
          };

          const result = await executionRuntime.execute(executionId, task, context);

          realtimeTracker.emit('completed', { executionId, result });
          return { success: true, executionId, result };
        } catch (error) {
          realtimeTracker.emit('failed', { executionId, error: error.message });
          throw error;
        }
      }
    };
  }

  static async runWithRuntime(appId, input, context, manifest) {
    const executionEngine = manifest.execution?.engine;

    switch (executionEngine) {
      case 'WorkflowEngine':
        return await vibeWorkflowAdapter.execute(appId, input, context);
      case 'ExecutionRuntime':
        return await executionRuntime.runTask({
          type: 'ai-generation',
          payload: input
        }, context);
      default:
        return await this.runDefault(appId, input, context, manifest);
    }
  }

  static async runDefault(appId, input, context, manifest) {
    const pipeline = manifest.pipeline;

    if (pipeline === 'MuAPIGenerationPipeline') {
      const provider = context.provider || 'muapi';
      const prompt = input.prompt || context.prompt;
      const settings = input.settings || {};

      if (provider === 'muapi') {
        return await muAPIPipeline.executeTask({
          payload: { type: 'image', prompt, settings }
        }, context);
      }
    }

    return { appId, input, context };
  }

  static register(appId, manifest) {
    const executor = this.create(appId, manifest);
    AppRegistry.register(appId, executor);
    return executor;
  }
}

export { AppExecutorFactory };