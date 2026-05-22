// src/lib/runtime/RuntimeAdapterBase.js
import { WorkflowEngine } from '../workflow/WorkflowEngine.ts';
// import other shared singletons (PersistenceLayer, ProviderRegistry, etc.)

/**
 * RuntimeAdapterBase — abstract base for all runtime adapters.
 * Contract: subclasses MUST implement execute(input, context).
 * Hard stack lock: this.stack is frozen and defines the canonical
 * { llm: 'openai', generation: 'muapi', storage: 'supabase' } triplet.
 * Subclasses MUST NOT mutate or override the stack (enforced by Object.freeze).
 */
export class RuntimeAdapterBase {
  constructor(options = {}) {
    this.executionId = null;
    this.state = 'idle';
    this.workflow = new WorkflowEngine();
    this.stack = Object.freeze({ llm: 'openai', generation: 'muapi', storage: 'supabase' });
  }
  async execute(input, context) { throw new Error('Must implement in subclass'); }
  async pause(executionId) { this.state = 'paused'; }
  async resume(executionId) { this.state = 'running'; }
  async cancel(executionId) { this.state = 'cancelled'; }
  async recover(snapshot) {}
  serialize() { return { id: this.executionId, state: this.state }; }
  deserialize(data) { Object.assign(this, data); }
  subscribe(events, cb) {}
  unsubscribe(events, cb) {}
  getExecutionState() { return { id: this.executionId, state: this.state, stack: this.stack }; }
}
