class ExecutionScheduler {
  constructor() {
    this.queue = [];
    this.running = new Map();
    this.concurrency = 5;
    this.completed = new Set();
    this.failed = new Set();
  }

  add(task) {
    const normalizedTask = {
      status: 'queued',
      priority: task.priority || 1,
      retries: 0,
      timeout: task.timeout || 30000,
      ...task,
    };

    this.queue.push(normalizedTask);
    this.sort();
  }

  sort() {
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }

  nextRunnable() {
    if (this.running.size >= this.concurrency) return null;

    const index = this.queue.findIndex(
      (t) => t.status === 'queued' && this.canRun(t)
    );

    if (index === -1) return null;

    const task = this.queue.splice(index, 1)[0];
    this.running.set(task.id, task);

    task.status = 'running';
    task.timestamp = Date.now();
    return task;
  }

  canRun(task) {
    return (task.dependencies || []).every((dep) =>
      this.completed.has(dep) || this.failed.has(dep)
    );
  }

  complete(taskId) {
    const task = this.running.get(taskId);
    if (!task) return;

    this.running.delete(taskId);
    this.completed.add(taskId);
    task.status = 'completed';
  }

  fail(taskId, error) {
    const task = this.running.get(taskId);
    if (!task) return;

    this.running.delete(taskId);
    this.failed.add(taskId);
    task.error = error?.message || 'Unknown error';

    task.retries += 1;

    if (task.retries < (task.maxRetries || 3)) {
      task.status = 'queued';
      task.timestamp = Date.now();
      this.queue.push(task);
    } else {
      task.status = 'failed';
    }
  }

  getTask(taskId) {
    for (const task of this.queue) {
      if (task.id === taskId) return task;
    }
    return this.running.get(taskId);
  }

  async schedule(request) {
    const { executionId, graph, context, kernel } = request;
    const results = {};

    for (const node of graph.nodes) {
      const nodeResult = await this.runNode(node, context, kernel);
      results[node.id] = nodeResult;
    }

    return results;
  }

  async runNode(node, context, kernel) {
    return {
      nodeId: node.id,
      output: `executed:${node.type}`,
      type: node.type,
    };
  }

  getState() {
    return {
      queue: [...this.queue],
      running: Array.from(this.running.values()),
      completed: Array.from(this.completed),
      failed: Array.from(this.failed),
    };
  }
}

const scheduler = new ExecutionScheduler();

export { ExecutionScheduler, scheduler };