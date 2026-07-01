import defaultQueue from './queue.js';
import { withRetry } from './retry.js';
import { sendToLibrary, sendToRender, sendToDirector, sendToTimeline, sendToEditStudio } from './outputHandoff.js';

const NODE_REGISTRY = new Map();
const EXECUTION_STATE = new Map();

class NodeRegistry {
  register(nodeType, executor) {
    NODE_REGISTRY.set(nodeType, executor);
  }

  get(nodeType) {
    return NODE_REGISTRY.get(nodeType);
  }

  has(nodeType) {
    return NODE_REGISTRY.has(nodeType);
  }

  remove(nodeType) {
    NODE_REGISTRY.delete(nodeType);
  }

  clear() {
    NODE_REGISTRY.clear();
  }
}

const nodeRegistry = new NodeRegistry();

class WorkflowEngine {
  constructor(options = {}) {
    this.queue = options.queue || defaultQueue;
    this.maxConcurrent = options.maxConcurrent || 5;
  }

  async executeWorkflow(workflow) {
    const executionId = `exec_${Date.now()}`;
    const execution = {
      id: executionId,
      workflowId: workflow.id,
      status: 'starting',
      nodes: [],
      results: new Map(),
      startedAt: new Date(),
      completedAt: null
    };

    EXECUTION_STATE.set(executionId, execution);

    try {
      execution.status = 'running';
      const nodeOrder = this.topologicalSort(workflow.nodes);
      
      for (const node of nodeOrder) {
        const result = await this.executeNode(node, execution);
        execution.results.set(node.id, result);
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
      
      const output = await this.generateOutput(workflow, execution);
      return { executionId, status: 'completed', output };
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      throw error;
    }
  }

  topologicalSort(nodes) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (node) => {
      if (visited.has(node.id)) return;
      if (visiting.has(node.id)) throw new Error(`Cycle detected at node ${node.id}`);
      
      visiting.add(node.id);
      for (const edge of node.edges || []) {
        const target = nodes.find(n => n.id === edge.target);
        if (target) visit(target);
      }
      visiting.delete(node.id);
      visited.add(node.id);
      sorted.push(node);
    };

    for (const node of nodes) visit(node);
    return sorted;
  }

  async executeNode(node, execution) {
    const executor = nodeRegistry.get(node.type);
    if (!executor) {
      throw new Error(`No executor registered for node type: ${node.type}`);
    }

    const inputs = this.getInputs(node, execution);
    const result = await withRetry(async () => {
      return await executor.execute(node, inputs, execution);
    }, { maxRetries: 3 });

    return result;
  }

  getInputs(node, execution) {
    const inputs = {};
    for (const edge of node.edges || []) {
      if (edge.source === 'input') {
        inputs[edge.target] = node.params?.[edge.target];
      } else {
        const sourceNode = execution.workflow?.nodes?.find(n => n.id === edge.source);
        if (sourceNode) {
          const result = execution.results.get(edge.source);
          inputs[edge.target] = result?.output || result;
        }
      }
    }
    return inputs;
  }

  async generateOutput(workflow, execution) {
    const lastNode = execution.nodes[execution.nodes.length - 1];
    return execution.results.get(lastNode?.id || '');
  }

  getStatus(executionId) {
    return EXECUTION_STATE.get(executionId);
  }

  async cancel(executionId) {
    const execution = EXECUTION_STATE.get(executionId);
    if (execution) execution.status = 'cancelled';
  }
}

const workflowEngine = new WorkflowEngine();

export { NodeRegistry, nodeRegistry, WorkflowEngine };
export default workflowEngine;