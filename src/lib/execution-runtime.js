import { ExecutionStateMachine, ExecutionStates } from './execution-state-machine.js';
import { JobQueue } from './queue.js';
import { RealtimeExecutionTracker, realtimeTracker } from './realtime-execution-tracker.js';
import { isSupabaseConfigured } from './supabase.js';
import { executionPersistence } from './execution-persistence.js';
import { executionRecovery } from './execution-recovery.js';

const assetLifecycle = null;
const recoverySystem = {
  recoverJob: async () => ({ recovered: false })
};
const orchestrationEngine = {
  registerTask: () => {},
  getTaskStatus: () => 'pending'
};

class ExecutionRuntime {
  constructor(options = {}) {
    this.queue = options.queue || new JobQueue();
    this.stateManager = new ExecutionStateMachine();
    this.orchestrator = options.orchestrator || orchestrationEngine;
    this.executionTimeout = options.executionTimeout || 300000;
  }

  async execute(taskId, task, options = {}) {
    const stateMachine = ExecutionStateMachine.create('execution', taskId, { task, options });
    stateMachine.transition(ExecutionStates.PENDING);

    const executionId = `${taskId}_${Date.now()}`;
    stateMachine.transition(ExecutionStates.QUEUED, { executionId });

    realtimeTracker.emit('execution:started', { executionId, taskId });

    await executionPersistence.saveExecution(executionId, ExecutionStates.QUEUED, { task, options });
    await executionRecovery.createSnapshot(executionId, ExecutionStates.QUEUED, { task, options });

    try {
      const jobId = await this.queue.add({
        type: 'execution',
        payload: { taskId, task, options },
        priority: options.priority || 5
      });

      stateMachine.transition(ExecutionStates.PROCESSING, { jobId });
      await executionPersistence.saveExecution(executionId, ExecutionStates.PROCESSING, { jobId });
      await executionRecovery.createSnapshot(executionId, ExecutionStates.PROCESSING, { jobId });

      const result = await this.runTask(task, options);

      stateMachine.transition(ExecutionStates.COMPLETED, { result });
      realtimeTracker.emit('execution:completed', { executionId, taskId, result });
      await executionPersistence.saveExecution(executionId, ExecutionStates.COMPLETED, { result });
      await executionRecovery.createSnapshot(executionId, ExecutionStates.COMPLETED, { result });

      return { success: true, executionId, result };
    } catch (error) {
      stateMachine.setError(error);
      stateMachine.transition(ExecutionStates.FAILED, { error: error.message });
      realtimeTracker.emit('execution:failed', { executionId, taskId, error: error.message });
      await executionPersistence.saveExecution(executionId, ExecutionStates.FAILED, { error: error.message });
      await executionRecovery.createSnapshot(executionId, ExecutionStates.FAILED, { error: error.message });

      const recovery = await recoverySystem.recoverJob(null, error);
      if (!recovery.recovered) {
        throw error;
      }

      return { success: false, executionId, error: error.message, recovered: true };
    }
  }

  async recoverExecution(executionId) {
    return await executionRecovery.replayExecution(executionId);
  }

  async runTask(task, options) {
    if (typeof task === 'function') {
      return await task(options.payload);
    }

    if (task.type === 'ai-generation') {
      return await this.runAIGeneration(task, options);
    }

    if (task.type === 'pipeline') {
      return await this.runPipeline(task, options);
    }

    throw new Error(`Unknown task type: ${task.type}`);
  }

  async runAIGeneration(task, options) {
    const { provider, model, prompt, settings } = task.payload;

    if (options.onProgress) {
      options.onProgress({ stage: 'initializing', progress: 0 });
    }

    let assetId = null;
    if (assetLifecycle && isSupabaseConfigured()) {
      const asset = await assetLifecycle.createAsset({
        type: task.payload.type || 'image',
        provider,
        model,
        prompt,
        settings
      });
      assetId = asset.id;

      if (options.onProgress) {
        options.onProgress({ stage: 'processing', progress: 50 });
      }

      await assetLifecycle.updateState(asset.id, 'processing');
    }

    return { assetId, provider, model, prompt };
  }

  async runPipeline(task, options) {
    const { stages, input } = task.payload;
    const results = [];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const progress = Math.round((i / stages.length) * 100);

      if (options.onProgress) {
        options.onProgress({ stage: stage.name, progress });
      }

      const result = await this.runTask(stage.task, { ...options, payload: stage.task.payload });
      results.push(result);
    }

    return { results };
  }

  async waitForCompletion(executionId, timeout = this.executionTimeout) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const state = this.stateManager.getState ? this.stateManager.getState(executionId) : null;
        if (state === ExecutionStates.COMPLETED) {
          resolve({ status: 'completed' });
        } else if (state === ExecutionStates.FAILED) {
          reject(new Error('Execution failed'));
        } else if (Date.now() - start < timeout) {
          setTimeout(check, 500);
        } else {
          reject(new Error('Timeout'));
        }
      };
      check();
    });
  }

  cancel(executionId) {
    const stateMachine = this.stateManager;
    stateMachine.transition(ExecutionStates.CANCELLED);
    this.queue.cancel?.(executionId);
  }
}

const executionRuntime = new ExecutionRuntime();

export { ExecutionRuntime, executionRuntime };