import { eventBus } from './eventBus.js';

class ReplayEngine {
  constructor(options = {}) {
    this.eventBus = options.eventBus || eventBus;
  }

  replay(executionId) {
    const events = this.eventBus.getEvents(executionId);

    const state = {
      executionId,
      tasks: {},
      status: 'replaying',
      currentStep: 0,
    };

    for (const event of events) {
      state.currentStep++;

      switch (event.type) {
        case 'task:start':
          state.tasks[event.taskId] = {
            status: 'running',
            startedAt: event.timestamp,
          };
          break;

        case 'task:complete':
          state.tasks[event.taskId] = {
            ...state.tasks[event.taskId],
            status: 'completed',
            completedAt: event.timestamp,
            result: event.result,
          };
          break;

        case 'task:error':
          state.tasks[event.taskId] = {
            ...state.tasks[event.taskId],
            status: 'failed',
            failedAt: event.timestamp,
            error: event.error,
          };
          break;
      }
    }

    return state;
  }

  rebuild(executionId) {
    const events = this.eventBus.getEvents(executionId);

    const taskStates = new Map();
    let currentTask = null;

    for (const event of events) {
      switch (event.type) {
        case 'task:start':
          taskStates.set(event.taskId, {
            id: event.taskId,
            executionId: event.executionId,
            status: 'running',
            startedAt: event.timestamp,
          });
          currentTask = event.taskId;
          break;

        case 'task:complete':
          const completed = taskStates.get(event.taskId);
          if (completed) {
            completed.status = 'completed';
            completed.completedAt = event.timestamp;
            completed.result = event.result;
          }
          break;

        case 'task:error':
          const failed = taskStates.get(event.taskId);
          if (failed) {
            failed.status = 'failed';
            failed.failedAt = event.timestamp;
            failed.error = event.error;
          }
          break;
      }
    }

    return {
      executionId,
      tasks: Array.from(taskStates.values()),
      events,
    };
  }
}

const replayEngine = new ReplayEngine();

export { ReplayEngine, replayEngine };