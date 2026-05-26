import { executionPersistence } from './execution-persistence.js';
import { executionRecovery } from './execution-recovery.js';
import { realtimeTracker } from './realtime-execution-tracker.js';

class AppExecutor {
  constructor(options = {}) {
    this.workflowEngine = options.workflowEngine || null;
    this.executionRuntime = options.executionRuntime || null;
    this.pipeline = options.pipeline || null;
    this.persistence = options.persistence || executionPersistence;
    this.tracker = options.tracker || realtimeTracker;
  }

  async execute(manifest, input, context = {}) {
    const { appId, execution, persistence, recovery } = manifest;
    const executionId = `${appId}-${Date.now()}`;

    this.tracker.emit('execution:started', { executionId, appId, input });

    if (persistence?.enabled) {
      await this.persistence.saveExecution(executionId, 'started', { input, context });
    }

    try {
      const result = await this.runExecution(manifest, executionId, input, context);
      
      this.tracker.emit('execution:completed', { executionId, appId, result });
      
      if (persistence?.enabled) {
        await this.persistence.saveExecution(executionId, 'completed', { result });
      }

      return { success: true, executionId, result };
    } catch (error) {
      this.tracker.emit('execution:failed', { executionId, appId, error: error.message });

      if (recovery?.retry && (recovery.retryCount || 0) < (recovery.maxRetries || 3)) {
        return await this.retryExecution(manifest, executionId, input, context, error, recovery);
      }

      if (persistence?.enabled) {
        await this.persistence.saveExecution(executionId, 'failed', { error: error.message });
      }

      throw error;
    }
  }

  async runExecution(manifest, executionId, input, context) {
    const { execution } = manifest;

    if (execution.engine === 'WorkflowEngine' && this.workflowEngine) {
      return await this.executeWorkflow(manifest, executionId, input, context);
    }

    if (execution.engine === 'ExecutionRuntime' && this.executionRuntime) {
      return await this.executionRuntime.execute(executionId, {
        type: 'pipeline',
        payload: { input }
      }, context);
    }

    return await this.executeGeneric(manifest, executionId, input, context);
  }

  async executeWorkflow(manifest, executionId, input, context) {
    const workflowId = `${manifest.appId}-workflow`;
    const adapter = manifest.execution.adapter;

    if (adapter === 'VibeWorkflowAdapter') {
      const { VibeWorkflowAdapter } = await import('./vibe-workflow-adapter.js');
      const wfAdapter = new VibeWorkflowAdapter();
      wfAdapter.clear();
      wfAdapter.createNode(0, 0, 'Input', 'input');
      wfAdapter.createNode(100, 0, 'Process', 'process');
      await wfAdapter.registerWorkflow(workflowId);
      return await wfAdapter.execute(workflowId, input, context);
    }

    return { success: true, workflowId, input };
  }

  async executeGeneric(manifest, executionId, input, context) {
    const { pipeline } = manifest;
    const provider = pipeline.providers?.[0] || 'muapi';

    if (this.pipeline && typeof this.pipeline.executeTask === 'function') {
      return await this.pipeline.executeTask({
        type: 'ai-generation',
        provider: provider,
        payload: { prompt: input.prompt || 'generate', type: input.type || 'image' }
      }, context.onProgress);
    }

    return { success: true, input };
  }

  async retryExecution(manifest, executionId, input, context, error, recovery) {
    const retryCount = (context.retryCount || 0) + 1;
    const delay = Math.pow(2, retryCount) * 1000;

    await new Promise(resolve => setTimeout(resolve, delay));

    return await this.execute(manifest, input, { ...context, retryCount });
  }

  async recoverExecution(appId, executionId) {
    const snapshot = await executionRecovery.replayExecution(executionId);
    if (!snapshot?.restored) return null;

    return {
      executionId,
      restored: true,
      state: snapshot.state,
      context: snapshot.context
    };
  }
}

const appExecutor = new AppExecutor();

export { AppExecutor, appExecutor };