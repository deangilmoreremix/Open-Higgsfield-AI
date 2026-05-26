import { eventStore } from './eventStore.js';

class Indexer {
  constructor(eventStore) {
    this.eventStore = eventStore;
  }

  getExecutionTimeline(executionId) {
    return this.eventStore.queryByExecution(executionId);
  }

  getFailures(executionId) {
    return this.eventStore
      .queryByExecution(executionId)
      .filter((e) => e.type === 'task:error');
  }

  getTaskHistory(taskId) {
    return this.eventStore.events.filter((e) => e.taskId === taskId);
  }

  getStatistics() {
    const total = this.eventStore.events.length;
    const byType = {};

    for (const event of this.eventStore.events) {
      byType[event.type] = (byType[event.type] || 0) + 1;
    }

    return { total, byType };
  }
}

const indexer = new Indexer(eventStore);

export { Indexer, indexer };