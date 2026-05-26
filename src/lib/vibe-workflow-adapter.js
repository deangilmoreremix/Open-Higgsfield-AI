import { WorkflowEngine, NodeTypes, WorkflowNode, WorkflowGraph } from './workflow-engine.js';
import { JobQueue } from './queue.js';
import { ExecutionStateMachine, ExecutionStates } from './execution-state-machine.js';
import { realtimeTracker } from './realtime-execution-tracker.js';
import { assetLifecycle } from './asset-lifecycle-manager.js';
import { providers } from './providers.js';
import { muAPIPipeline } from './muapi-pipeline.js';

class VibeWorkflowAdapter {
  constructor(options = {}) {
    this.workflowEngine = options.workflowEngine || new WorkflowEngine();
    this.nodes = [];
    this.edges = [];
    this.nodeIdCounter = 0;
  }

  createNode(x, y, label = 'Node', type = NodeTypes.PROCESS) {
    const id = `node_${++this.nodeIdCounter}`;
    const node = {
      id,
      x,
      y,
      label,
      type,
      handler: null
    };
    this.nodes.push(node);
    return node;
  }

  addEdge(fromId, toId) {
    this.edges.push({ from: fromId, to: toId });
  }

  clear() {
    this.nodes = [];
    this.edges = [];
    this.nodeIdCounter = 0;
  }

  toWorkflowDefinition() {
    const nodeDefs = this.nodes.map(node => ({
      id: node.id,
      type: node.type,
      name: node.label,
      handler: this.createHandlerForNode(node),
      timeout: node.timeout || 30000,
      retryAttempts: node.retryAttempts || 3,
      retryDelay: node.retryDelay || 1000
    }));

    return {
      nodes: nodeDefs,
      edges: [...this.edges]
    };
  }

  createHandlerForNode(node) {
    const label = (node.label || '').toLowerCase();

    return async (input, context) => {
      const stateMachine = ExecutionStateMachine.create('vibe-node', node.id, { input, context });
      stateMachine.transition(ExecutionStates.PROCESSING);

      try {
        if (label.includes('image') || label.includes('muapi')) {
          return await this.executeImageGeneration(node, input, context, stateMachine);
        }

        if (label.includes('video')) {
          return await this.executeVideoGeneration(node, input, context, stateMachine);
        }

        if (label.includes('llm') || label.includes('prompt') || label.includes('openai')) {
          return await this.executeLLM(node, input, context, stateMachine);
        }

        if (label.includes('input')) {
          return await this.executeInput(node, input, context, stateMachine);
        }

        if (label.includes('output')) {
          return await this.executeOutput(node, input, context, stateMachine);
        }

        return { result: input, nodeType: node.type };
      } catch (error) {
        stateMachine.setError(error);
        stateMachine.transition(ExecutionStates.FAILED, { error });
        throw error;
      }
    };
  }

  async executeImageGeneration(node, input, context, stateMachine) {
    const { provider, model, prompt, settings } = {
      provider: context.provider || 'muapi',
      model: context.model || 'v1',
      prompt: input.prompt || context.prompt || 'generative art',
      settings: input.settings || context.settings || { width: 1024, height: 1024 }
    };

    if (context.onProgress) {
      context.onProgress({ stage: 'initializing', progress: 0 });
    }

    let assetId = null;
    if (assetLifecycle && assetLifecycle.createAsset) {
      const asset = await assetLifecycle.createAsset({
        type: 'image',
        provider,
        model,
        prompt,
        settings
      });
      assetId = asset.id;

      if (context.onProgress) {
        context.onProgress({ stage: 'processing', progress: 50 });
      }

      if (assetLifecycle.updateState) {
        await assetLifecycle.updateState(asset.id, 'processing');
      }
    }

    let result;
    try {
      if (provider === 'muapi') {
        result = await muAPIPipeline.generateImage(prompt, settings);
      } else {
        result = await this.generateWithProvider(provider, prompt, settings);
      }
    } catch (error) {
      if (assetLifecycle && assetId && assetLifecycle.updateState) {
        await assetLifecycle.updateState(assetId, 'failed');
      }
      throw error;
    }

    if (assetLifecycle && assetId && assetLifecycle.updateState) {
      await assetLifecycle.updateState(assetId, 'completed');
    }

    if (context.onProgress) {
      context.onProgress({ stage: 'completed', progress: 100 });
    }

    stateMachine.transition(ExecutionStates.COMPLETED, { assetId, provider, prompt, result });

    return {
      success: true,
      assetId,
      provider,
      model,
      prompt,
      settings,
      result
    };
  }

  async executeVideoGeneration(node, input, context, stateMachine) {
    const prompt = input.prompt || context.prompt || 'creative video';
    const duration = input.duration || context.duration || 5;

    if (context.onProgress) {
      context.onProgress({ stage: 'generating', progress: 30 });
    }

    let assetId = null;
    if (assetLifecycle && assetLifecycle.createAsset) {
      const asset = await assetLifecycle.createAsset({
        type: 'video',
        provider: 'muapi',
        model: 'video-v1',
        prompt,
        settings: { duration }
      });
      assetId = asset.id;

      if (context.onProgress) {
        context.onProgress({ stage: 'processing', progress: 60 });
      }

      if (assetLifecycle.updateState) {
        await assetLifecycle.updateState(asset.id, 'processing');
      }
    }

    let result;
    try {
      result = await muAPIPipeline.generateVideo(prompt, { duration });
    } catch (error) {
      if (assetLifecycle && assetId && assetLifecycle.updateState) {
        await assetLifecycle.updateState(assetId, 'failed');
      }
      throw error;
    }

    if (assetLifecycle && assetId && assetLifecycle.updateState) {
      await assetLifecycle.updateState(assetId, 'completed');
    }

    if (context.onProgress) {
      context.onProgress({ stage: 'completed', progress: 100 });
    }

    stateMachine.transition(ExecutionStates.COMPLETED, { assetId, prompt, duration, result });

    return {
      success: true,
      assetId,
      provider: 'muapi',
      prompt,
      duration,
      result
    };
  }

  async executeLLM(node, input, context, stateMachine) {
    const prompt = input.prompt || context.prompt || 'enhance this prompt';
    const provider = context.provider || 'openai';
    const model = context.model || 'gpt-4';

    if (context.onProgress) {
      context.onProgress({ stage: 'thinking', progress: 50 });
    }

    stateMachine.transition(ExecutionStates.COMPLETED, { prompt, provider });

    return {
      success: true,
      provider,
      model,
      prompt,
      enhanced: true
    };
  }

  async executeInput(node, input, context, stateMachine) {
    stateMachine.transition(ExecutionStates.COMPLETED, { input });
    return { success: true, input };
  }

  async executeOutput(node, input, context, stateMachine) {
    const result = input.result || input;
    stateMachine.transition(ExecutionStates.COMPLETED, { output: result });
    return { success: true, output: result };
  }

  async registerWorkflow(workflowId) {
    const definition = this.toWorkflowDefinition();
    this.workflowEngine.registerWorkflow(workflowId, definition);
    return workflowId;
  }

  async execute(workflowId, input = {}, context = {}) {
    return await this.workflowEngine.execute(workflowId, input, context);
  }

  async executeWithRuntime(workflowId, input = {}, context = {}) {
    const taskId = `vibe-${workflowId}-${Date.now()}`;
    const { ExecutionRuntime } = await import('./execution-runtime.js');
    const runtime = new ExecutionRuntime();

    return await runtime.execute(taskId, {
      type: 'pipeline',
      payload: {
        stages: this.nodes.map(node => ({
          name: node.label,
          task: {
            type: 'ai-generation',
            payload: this.extractGenerationParams(node, input, context)
          }
        })),
        input
      }
    }, context);
  }

  extractGenerationParams(node, input, context) {
    const label = (node.label || '').toLowerCase();

    if (label.includes('image')) {
      return {
        type: 'image',
        provider: context.provider || 'muapi',
        model: context.model || 'v1',
        prompt: input.prompt || context.prompt || 'generative art',
        settings: input.settings || { width: 1024, height: 1024 }
      };
    }

    if (label.includes('video')) {
      return {
        type: 'video',
        provider: 'muapi',
        model: 'video-v1',
        prompt: input.prompt || context.prompt || 'creative video',
        settings: { duration: input.duration || context.duration || 5 }
      };
    }

    return {
      type: 'text',
      provider: context.provider || 'openai',
      model: context.model || 'gpt-4',
      prompt: input.prompt || context.prompt || 'process input',
      settings: {}
    };
  }
}

const vibeWorkflowAdapter = new VibeWorkflowAdapter();

export { VibeWorkflowAdapter, vibeWorkflowAdapter };