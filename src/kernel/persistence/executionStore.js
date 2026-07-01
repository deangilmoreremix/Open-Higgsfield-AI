import { eventStore } from './eventStore.js';
import { snapshotStore } from './snapshotStore.js';

class ExecutionStore {
  constructor(options = {}) {
    this.eventStore = options.eventStore || eventStore;
    this.snapshotStore = options.snapshotStore || snapshotStore;
  }

  getState(executionId) {
    const snapshot = this.snapshotStore.load(executionId);

    if (snapshot) return snapshot;

    const events = this.eventStore.replay(executionId);

    const state = { tasks: {} };

    for (const e of events) {
      if (e.type === 'task:start') {
        state.tasks[e.taskId] = { status: 'running', startedAt: e.timestamp };
      }

      if (e.type === 'task:complete') {
        state.tasks[e.taskId] = { ...state.tasks[e.taskId], status: 'completed', completedAt: e.timestamp, result: e.result };
      }

      if (e.type === 'task:error') {
        state.tasks[e.taskId] = { ...state.tasks[e.taskId], status: 'failed', failedAt: e.timestamp, error: e.error };
      }
    }

    return state;
  }

  saveState(executionId, state) {
    const serializable = {
      queue: state.queue || [],
      completed: Array.from(state.completed || []),
      failed: Array.from(state.failed || []),
      running: Array.from((state.running || []).keys()),
    };
    this.snapshotStore.save(executionId, serializable);
  }

  appendEvent(event) {
    return this.eventStore.append(event);
  }
}

const executionStore = new ExecutionStore();

export { ExecutionStore, executionStore };