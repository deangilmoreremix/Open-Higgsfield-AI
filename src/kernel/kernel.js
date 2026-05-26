import { eventBus } from './eventBus.js';
import { scheduler } from './executionScheduler.js';
import { snapshotEngine } from './snapshotEngine.js';
import { replayEngine } from './replayEngine.js';
import { ExecutionKernel } from './execution-kernel.js';

class Kernel {
  constructor() {
    this.eventBus = eventBus;
    this.scheduler = scheduler;
    this.snapshots = snapshotEngine;
    this.replay = replayEngine;
    this.runtime = {
      handlers: new Map(),
      registerHandler: function(type, handler) {
        this.handlers.set(type, handler);
      },
      async execute(task) {
        if (task.handler) {
          return task.handler(task.payload || {});
        }
        const handler = this.handlers.get(task.type);
        if (handler) {
          return handler(task);
        }
        return { status: 'completed' };
      }
    };

    this.executionKernel = new ExecutionKernel({
      scheduler: this.scheduler,
      eventBus: this.eventBus,
      snapshotManager: this.snapshots,
      replayEngine: this.replay,
    });

    this.running = false;
    this.loops = 0;
  }

  submit(graph) {
    return this.executionKernel.execute(graph);
  }

  async execute(executionId) {
    const graph = { id: executionId, nodes: [], edges: [] };
    return this.executionKernel.execute(graph, { executionId });
  }

  registerTask(task) {
    this.scheduler.add({
      ...task,
      timestamp: Date.now(),
    });
  }

  registerHandler(type, handler) {
    this.runtime.registerHandler(type, handler);
  }

  async tick() {
    const task = this.scheduler.nextRunnable();
    if (!task) return null;

    this.loops++;

    this.eventBus.publish({
      type: 'task:start',
      executionId: task.executionId,
      taskId: task.id,
      taskType: task.type,
    });

    try {
      const result = await this.runtime.execute(task);
      this.scheduler.complete(task.id);

      this.eventBus.publish({
        type: 'task:complete',
        executionId: task.executionId,
        taskId: task.id,
        result,
      });

      this.snapshots.save(task.executionId, this.scheduler.getState());
      return { task, result };
    } catch (err) {
      this.scheduler.fail(task.id, err);

      this.eventBus.publish({
        type: 'task:error',
        executionId: task.executionId,
        taskId: task.id,
        error: err.message,
      });

      return { task, error: err };
    }
  }

  start() {
    this.running = true;
    this.run();
  }

  stop() {
    this.running = false;
  }

  async run() {
    while (this.running) {
      await this.tick();
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  async recover(executionId) {
    const snapshot = this.snapshots.load(executionId);

    if (snapshot) {
      this.scheduler.queue = snapshot.queue || [];
      this.scheduler.running = new Map();
      this.scheduler.completed = new Set(snapshot.completed || []);
      this.scheduler.failed = new Set(snapshot.failed || []);
    }

    const replayState = this.replay.rebuild(executionId);

    return {
      snapshot: snapshot ? { executionId, state: snapshot } : null,
      replay: replayState,
    };
  }

  getState() {
    return {
      queue: this.scheduler.getState(),
      loops: this.loops,
      running: this.running,
    };
  }

  reset() {
    this.eventBus.clear();
    this.scheduler.queue = [];
    this.scheduler.running = new Map();
    this.scheduler.completed = new Set();
    this.scheduler.failed = new Set();
    this.snapshots.clear();
    this.replay.eventBus = this.eventBus;
    this.running = false;
    this.loops = 0;
  }
}

const kernel = new Kernel();

export { Kernel, kernel };