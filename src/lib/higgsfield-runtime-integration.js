import { ExecutionStates } from './execution-state-machine.js';
import { orchestrationEngine } from './orchestration-engine.js';
import { workflowEngine, NodeTypes } from './workflow-engine.js';
import { realtimeTracker } from './realtime-execution-tracker.js';
import { assetLifecycle } from './asset-lifecycle-manager.js';
import { recoverySystem } from './failure-recovery.js';

class HiggsfieldRuntimeIntegration {
  constructor() {
    this.executionId = null;
    this.stateMachine = null;
  }

  async initializeWorkflow(projectId, config) {
    this.executionId = `workflow_${projectId}_${Date.now()}`;
    this.stateMachine = ExecutionStateMachine.create('workflow', this.executionId, { projectId, config });
    this.stateMachine.transition(ExecutionStates.PENDING);
    
    const workflow = workflowEngine.registerWorkflow(`${projectId}_main`, {
      nodes: config.nodes || [],
      edges: config.edges || []
    });
    
    this.stateMachine.transition(ExecutionStates.QUEUED);
    return this.executionId;
  }

  async executeWorkflow(input, onProgress) {
    if (!this.stateMachine) throw new Error('Workflow not initialized');
    
    this.stateMachine.transition(ExecutionStates.PROCESSING);
    
    try {
      const result = await workflowEngine.execute(this.executionId, input);
      
      this.stateMachine.transition(ExecutionStates.COMPLETED, { result });
      realtimeTracker.emit('workflow:completed', { executionId: this.executionId, result });
      
      return result;
    } catch (error) {
      this.stateMachine.setError(error);
      this.stateMachine.transition(ExecutionStates.FAILED, { error: error.message });
      realtimeTracker.emit('workflow:failed', { executionId: this.executionId, error: error.message });
      
      const recovery = await recoverySystem.recoverJob(null, error);
      if (!recovery.recovered) throw error;
      
      return { recovered: true, error: error.message };
    }
  }

  async executeAIGeneration(provider, model, prompt, settings, onProgress) {
    const taskId = `ai_gen_${Date.now()}`;
    
    const task = orchestrationEngine.registerTask(taskId, {
      type: 'ai-generation',
      payload: { provider, model, prompt, settings }
    });
    
    const jobId = await orchestrationEngine.execute(taskId);
    
    const asset = await assetLifecycle.createAsset({
      type: 'ai-output',
      provider,
      model,
      prompt,
      settings
    });
    
    onProgress?.({ stage: 'processing', progress: 50 });
    
    return { taskId, jobId, assetId: asset.id };
  }

  async saveToLibrary(output, type) {
    const asset = await assetLifecycle.createAsset({
      ...output,
      type,
      handoff_targets: ['library']
    });
    
    realtimeTracker.emit('asset:saved', { assetId: asset.id, type });
    return asset;
  }

  async handoffToStudio(output, targetStudio) {
    switch (targetStudio) {
      case 'render':
        return await this.saveToLibrary(output, 'video');
      case 'timeline':
        return await this.saveToLibrary(output, 'video');
      case 'edit':
        return await this.saveToLibrary(output, 'video');
      default:
        throw new Error(`Unknown studio: ${targetStudio}`);
    }
  }

  getStatus() {
    return {
      executionId: this.executionId,
      state: this.stateMachine?.state || 'idle',
      isRunning: this.stateMachine?.state === ExecutionStates.PROCESSING
    };
  }

  cancel() {
    if (this.stateMachine) {
      this.stateMachine.transition(ExecutionStates.CANCELLED);
    }
  }
}

const higgsfieldRuntime = new HiggsfieldRuntimeIntegration();

export { ExecutionStates, NodeTypes, higgsfieldRuntime };