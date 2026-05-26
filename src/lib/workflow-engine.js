import { ExecutionStateMachine, ExecutionStates } from './execution-state-machine.js';

const NodeTypes = {
  INPUT: 'input',
  OUTPUT: 'output',
  PROCESS: 'process',
  CONDITIONAL: 'conditional',
  PARALLEL: 'parallel',
  MERGE: 'merge'
};

class WorkflowNode {
  constructor(config) {
    this.id = config.id;
    this.type = config.type;
    this.name = config.name;
    this.handler = config.handler;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  async execute(input, context) {
    const stateMachine = ExecutionStateMachine.create('node-execution', this.id, { input, context });
    stateMachine.transition(ExecutionStates.PROCESSING);

    try {
      const result = await this.handler(input, context);
      stateMachine.transition(ExecutionStates.COMPLETED, { result });
      return { success: true, result, stateMachine };
    } catch (error) {
      stateMachine.setError(error);
      stateMachine.transition(ExecutionStates.FAILED, { error });
      throw error;
    }
  }
}

class WorkflowGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  addNode(node) {
    this.nodes.set(node.id, node);
  }

  addEdge(fromId, toId) {
    this.edges.push({ from: fromId, to: toId });
  }

  getExecutionOrder() {
    const visited = new Set();
    const order = [];
    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      const node = this.nodes.get(id);
      if (!node) return;
      for (const edge of this.edges) {
        if (edge.from === id) visit(edge.to);
      }
      order.push(id);
    };
    for (const [id] of this.nodes) visit(id);
    return order;
  }
}

class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.running = new Map();
  }

  registerWorkflow(id, definition) {
    const graph = new WorkflowGraph();
    for (const nodeDef of definition.nodes) {
      graph.addNode(new WorkflowNode(nodeDef));
    }
    for (const edge of definition.edges) {
      graph.addEdge(edge.from, edge.to);
    }
    this.workflows.set(id, { definition, graph });
  }

  async execute(workflowId, input, context = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    const executionId = `${workflowId}_${Date.now()}`;
    const stateMachine = ExecutionStateMachine.create('workflow', executionId, { input, context });
    stateMachine.transition(ExecutionStates.PROCESSING);

    this.running.set(executionId, { workflow, stateMachine, input, context });

    try {
      const order = workflow.graph.getExecutionOrder();
      const results = new Map();

      for (const nodeId of order) {
        const node = workflow.graph.nodes.get(nodeId);
        const nodeInputs = this.getNodeInputs(nodeId, results);
        const result = await node.execute(nodeInputs, context);
        results.set(nodeId, result);
      }

      stateMachine.transition(ExecutionStates.COMPLETED, { results });
      this.running.delete(executionId);
      return { success: true, executionId, results };
    } catch (error) {
      stateMachine.setError(error);
      stateMachine.transition(ExecutionStates.FAILED, { error });
      this.running.delete(executionId);
      throw error;
    }
  }

  getNodeInputs(nodeId, results) {
    return results.get(nodeId)?.result || {};
  }

  getRunning(workflowId) {
    for (const [id, running] of this.running) {
      if (id.startsWith(workflowId)) return running;
    }
    return null;
  }
}

const workflowEngine = new WorkflowEngine();

export { WorkflowNode, WorkflowGraph, WorkflowEngine, workflowEngine, NodeTypes };