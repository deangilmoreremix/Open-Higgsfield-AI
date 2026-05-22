import WorkflowEngine from '../workflow/WorkflowEngine.ts';

export default class RuntimeAdapterBase {
  constructor() {
    this.stack = Object.freeze({
      llm: 'openai',
      generation: 'muapi',
      storage: 'supabase'
    });
  }

  execute() {
    throw new Error('Must implement in subclass');
  }

  pause() {
    // base implementation - no-op, override in subclass
  }

  resume() {
    // base implementation - no-op, override in subclass
  }

  cancel() {
    // base implementation - no-op, override in subclass
  }

  recover() {
    // base implementation - no-op, override in subclass
  }

  serialize() {
    return {
      stack: this.stack,
      state: {}
    };
  }

  deserialize(data) {
    // base implementation - accept data, no-op, override in subclass for restore
    if (data && data.stack) {
      // stack is locked, cannot override
    }
  }

  subscribe(callback) {
    // base implementation returns a subscription id, subclasses manage listeners
    return Date.now();
  }

  unsubscribe(subscriptionId) {
    // base implementation - no-op, override in subclass
  }

  getExecutionState() {
    return {
      status: 'idle',
      stack: this.stack
    };
  }
}
