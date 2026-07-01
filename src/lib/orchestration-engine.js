import { ExecutionStateMachine, ExecutionStates } from './execution-state-machine.js';
import { JobQueue } from './queue.js';

class OrchestrationEngine {
  constructor(options = {}) {
    this.queue = options.queue || new JobQueue();
    this.tasks = new Map();
    this.dependencies = new Map();
    this.results = new Map();
  }

  registerTask(id, task, dependencies = []) {
    const stateMachine = ExecutionStateMachine.create(task.type, id, task.payload);
    this.tasks.set(id, {
      task,
      stateMachine,
      dependencies,
      createdAt: new Date()
    });
    this.dependencies.set(id, dependencies);
    return id;
  }

  async execute(id) {
    const taskEntry = this.tasks.get(id);
    if (!taskEntry) throw new Error(`Task ${id} not found`);

    if (!this.canExecute(id)) {
      throw new Error(`Dependencies not satisfied for task ${id}`);
    }

    const jobId = await this.queue.add({
      type: 'orchestrated-task',
      payload: {
        taskId: id,
        task: taskEntry.task
      },
      priority: taskEntry.task.priority || 5
    });

    taskEntry.stateMachine.transition(ExecutionStates.QUEUED, { jobId });
    return jobId;
  }

  canExecute(id) {
    const deps = this.dependencies.get(id) || [];
    for (const depId of deps) {
      const depResult = this.results.get(depId);
      if (!depResult || depResult.state !== ExecutionStates.COMPLETED) {
        return false;
      }
    }
    return true;
  }

  async executePipeline(taskIds) {
    const results = [];
    const executed = new Set();

    while (executed.size < taskIds.length) {
      for (const id of taskIds) {
        if (executed.has(id)) continue;
        
        if (this.canExecute(id)) {
          const jobId = await this.execute(id);
          results.push({ taskId: id, jobId });
          executed.add(id);
        }
      }

      if (results.length === executed.size) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return results;
  }

  async waitForCompletion(taskId, timeout = 60000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const result = this.results.get(taskId);
      if (result) {
        if (result.state === ExecutionStates.COMPLETED) return result;
        if (result.state === ExecutionStates.FAILED) throw new Error(result.error?.message);
      }
      await new Promise(r => setTimeout(r, 500));
    }
    throw new Error(`Timeout waiting for task ${taskId}`);
  }

  getTaskStatus(taskId) {
    const task = this.tasks.get(taskId);
    return task ? task.stateMachine.state : 'not_found';
  }

  cancel(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.stateMachine.transition(ExecutionStates.CANCELLED);
    }
  }
}

const orchestrationEngine = new OrchestrationEngine();

export { OrchestrationEngine, orchestrationEngine };