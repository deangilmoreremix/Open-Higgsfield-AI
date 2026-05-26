const ExecutionStates = {
  PENDING: 'pending',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  RETRYING: 'retrying',
  FAILED: 'failed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RECOVERED: 'recovered'
};

export class ExecutionStateMachine {
  constructor(initialState = ExecutionStates.PENDING) {
    this.state = initialState;
    this.context = {};
    this.history = [];
    this.error = null;
    this.retryCount = 0;
    this.id = null;
  }

  transition(newState, context = {}) {
    this.history.push({
      from: this.state,
      to: newState,
      timestamp: new Date().toISOString(),
      context: { ...context }
    });
    this.state = newState;
    this.context = { ...this.context, ...context };
    return this.state;
  }

  isTerminal() {
    return [
      ExecutionStates.COMPLETED,
      ExecutionStates.FAILED,
      ExecutionStates.CANCELLED
    ].includes(this.state);
  }

  canTransition(toState) {
    const validTransitions = {
      [ExecutionStates.PENDING]: [ExecutionStates.QUEUED, ExecutionStates.CANCELLED],
      [ExecutionStates.QUEUED]: [ExecutionStates.PROCESSING, ExecutionStates.CANCELLED],
      [ExecutionStates.PROCESSING]: [ExecutionStates.RETRYING, ExecutionStates.COMPLETED, ExecutionStates.FAILED, ExecutionStates.CANCELLED],
      [ExecutionStates.RETRYING]: [ExecutionStates.PROCESSING, ExecutionStates.FAILED],
      [ExecutionStates.FAILED]: [ExecutionStates.RECOVERED],
      [ExecutionStates.RECOVERED]: [ExecutionStates.PROCESSING, ExecutionStates.QUEUED],
      [ExecutionStates.COMPLETED]: [],
      [ExecutionStates.CANCELLED]: []
    };
    return validTransitions[this.state]?.includes(toState) || false;
  }

  setError(error) {
    this.error = error;
    this.context.lastError = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  }

  getState(executionId) {
    return this.state;
  }

  static create(type, id, payload) {
    const machine = new ExecutionStateMachine();
    machine.id = id;
    machine.context = {
      type,
      id,
      payload,
      createdAt: new Date().toISOString()
    };
    return machine;
  }
}

export { ExecutionStates };

export default ExecutionStateMachine;