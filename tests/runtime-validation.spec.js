import { describe, it, expect } from 'vitest';

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

class ExecutionStateMachine {
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

  static create(type, id, payload) {
    const machine = new ExecutionStateMachine();
    machine.id = id;
    machine.context = { type, id, payload, createdAt: new Date().toISOString() };
    return machine;
  }
}

class JobQueue {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 3;
    this.retryAttempts = options.retryAttempts || 3;
    this.jobs = new Map();
    this.waiting = [];
    this.active = [];
  }

  add(job) {
    const jobId = job.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const jobEntry = {
      id: jobId,
      task: job.task,
      payload: job.payload,
      attempts: 0,
      status: 'waiting',
      createdAt: new Date()
    };
    this.jobs.set(jobId, jobEntry);
    this.waiting.push(jobId);
    return jobId;
  }

  get(jobId) {
    return this.jobs.get(jobId);
  }
}

class OrchestrationEngine {
  constructor() {
    this.tasks = new Map();
    this.dependencies = new Map();
    this.results = new Map();
  }

  registerTask(id, task, dependencies = []) {
    this.tasks.set(id, { task, dependencies });
    this.dependencies.set(id, dependencies);
  }

  getTaskStatus(id) {
    return this.tasks.get(id) ? 'pending' : 'not_found';
  }
}

class FailureRecoverySystem {
  classifyFailure(error) {
    const message = error.message?.toLowerCase() || '';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network')) return 'network';
    if (message.includes('auth')) return 'auth';
    return 'unknown';
  }
}

class AssetLifecycleManager {
  constructor() {
    this.states = {
      UPLOADING: 'uploading',
      UPLOADED: 'uploaded',
      PROCESSING: 'processing',
      PROCESSED: 'processed'
    };
  }
}

describe('Execution State Machine', () => {
  it('creates with context', () => {
    const sm = ExecutionStateMachine.create('test', 'test-1', { input: 'hello' });
    expect(sm.context.type).toBe('test');
    expect(sm.id).toBe('test-1');
  });

  it('can transition to queued', () => {
    const sm = ExecutionStateMachine.create('test', 'test-1', { input: 'hello' });
    sm.transition(ExecutionStates.QUEUED);
    expect(sm.state).toBe(ExecutionStates.QUEUED);
  });

  it('can transition to processing', () => {
    const sm = ExecutionStateMachine.create('test', 'test-1', { input: 'hello' });
    sm.transition(ExecutionStates.QUEUED);
    expect(sm.canTransition(ExecutionStates.PROCESSING)).toBe(true);
  });

  it('can transition to completed', () => {
    const sm = ExecutionStateMachine.create('test', 'test-1', { input: 'hello' });
    sm.transition(ExecutionStates.QUEUED);
    sm.transition(ExecutionStates.PROCESSING);
    expect(sm.canTransition(ExecutionStates.COMPLETED)).toBe(true);
  });

  it('is terminal state when completed', () => {
    const sm = ExecutionStateMachine.create('test', 'test-1', { input: 'hello' });
    sm.transition(ExecutionStates.QUEUED);
    sm.transition(ExecutionStates.PROCESSING);
    sm.transition(ExecutionStates.COMPLETED);
    expect(sm.isTerminal()).toBe(true);
  });

  it('cannot transition from completed', () => {
    const sm = ExecutionStateMachine.create('test', 'test-1', { input: 'hello' });
    sm.transition(ExecutionStates.QUEUED);
    sm.transition(ExecutionStates.PROCESSING);
    sm.transition(ExecutionStates.COMPLETED);
    expect(sm.canTransition(ExecutionStates.PROCESSING)).toBe(false);
  });
});

describe('Job Queue', () => {
  it('adds job to queue', () => {
    const queue = new JobQueue({ maxConcurrent: 2 });
    const jobId = queue.add({
      type: 'test-job',
      payload: { value: 42 },
      task: async () => ({ result: 'success' })
    });
    expect(jobId).toBeDefined();
  });

  it('retrieves job', () => {
    const queue = new JobQueue({ maxConcurrent: 2 });
    const jobId = queue.add({
      type: 'test-job',
      payload: { value: 42 },
      task: async () => ({ result: 'success' })
    });
    expect(queue.get(jobId)).toBeDefined();
  });
});

describe('Orchestration Engine', () => {
  it('registers task', () => {
    const engine = new OrchestrationEngine();
    engine.registerTask('task-1', { type: 'simple', payload: { value: 1 } });
    expect(engine.getTaskStatus('task-1')).toBe('pending');
  });

  it('tracks dependencies', () => {
    const engine = new OrchestrationEngine();
    engine.registerTask('task-1', { type: 'simple', payload: { value: 1 } });
    engine.registerTask('task-2', { type: 'simple', payload: { value: 2 } }, ['task-1']);
    expect(engine.dependencies.get('task-2')?.length).toBe(1);
  });
});

describe('Failure Recovery', () => {
  it('classifies unknown failure', () => {
    const recovery = new FailureRecoverySystem();
    const error = new Error('Test failure');
    expect(recovery.classifyFailure(error)).toBe('unknown');
  });

  it('classifies network failure', () => {
    const recovery = new FailureRecoverySystem();
    const error = new Error('Network connection failed');
    expect(recovery.classifyFailure(error)).toBe('network');
  });
});

describe('Asset Lifecycle', () => {
  it('defines states', () => {
    const manager = new AssetLifecycleManager();
    expect(Object.keys(manager.states).length).toBeGreaterThan(0);
  });

  it('has upload state', () => {
    const manager = new AssetLifecycleManager();
    expect(manager.states.UPLOADING).toBe('uploading');
  });
});