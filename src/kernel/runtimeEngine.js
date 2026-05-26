import { eventBus } from './eventBus.js';

class RuntimeEngine {
  constructor() {
    this.handlers = new Map();
  }

  registerHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  async execute(task) {
    eventBus.publish({
      type: 'task:start',
      executionId: task.executionId,
      taskId: task.id,
      taskType: task.type,
    });

    try {
      const handler = this.handlers.get(task.type);
      if (!handler) {
        throw new Error(`No handler registered for task type: ${task.type}`);
      }

      const result = await handler(task);

      eventBus.publish({
        type: 'task:complete',
        executionId: task.executionId,
        taskId: task.id,
        result,
      });

      return result;
    } catch (err) {
      eventBus.publish({
        type: 'task:error',
        executionId: task.executionId,
        taskId: task.id,
        error: err.message,
      });

      throw err;
    }
  }

  async executeGraph(graph, context = {}) {
    const results = {};

    for (const node of graph.nodes) {
      const nodeResult = await this.runNode(node, context);
      results[node.id] = nodeResult;
    }

    return results;
  }

  async runNode(node, context = {}) {
    const handler = this.handlers.get(node.type);

    if (handler) {
      return await handler({
        id: node.id,
        type: node.type,
        executionId: `node-${node.id}`,
        payload: node.input || {},
      });
    }

    return {
      nodeId: node.id,
      output: `executed:${node.type}`,
      type: node.type,
    };
  }
}

const runtimeEngine = new RuntimeEngine();

export { RuntimeEngine, runtimeEngine };