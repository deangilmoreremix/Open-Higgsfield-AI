class EventStore {
  constructor() {
    this.events = [];
  }

  append(event) {
    const record = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...event,
    };

    this.events.push(record);
    return record;
  }

  queryByExecution(executionId) {
    return this.events.filter((e) => e.executionId === executionId);
  }

  queryByType(type) {
    return this.events.filter((e) => e.type === type);
  }

  replay(executionId) {
    return this.queryByExecution(executionId).sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }

  clear() {
    this.events = [];
  }
}

const eventStore = new EventStore();

export { EventStore, eventStore };