class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.eventLog = [];
  }

  publish(event) {
    const enriched = {
      id: event.id || crypto.randomUUID(),
      timestamp: Date.now(),
      ...event,
    };

    this.eventLog.push(enriched);

    const subs = this.subscribers.get(enriched.type) || [];
    subs.forEach((cb) => cb(enriched));

    const globalSubs = this.subscribers.get('*') || [];
    globalSubs.forEach((cb) => cb(enriched));

    return enriched;
  }

  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }

    this.subscribers.get(type).push(callback);

    return () => {
      const arr = this.subscribers.get(type) || [];
      this.subscribers.set(
        type,
        arr.filter((fn) => fn !== callback)
      );
    };
  }

  getEvents(executionId) {
    return this.eventLog.filter((e) => e.executionId === executionId);
  }

  clear() {
    this.eventLog = [];
    this.subscribers.clear();
  }
}

const eventBus = new EventBus();

export { EventBus, eventBus };