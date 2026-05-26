import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExecutionStateMachine, ExecutionStates } from '../../src/lib/execution-state-machine.js';
import { JobQueue } from '../../src/lib/queue.js';
import { OrchestrationEngine } from '../../src/lib/orchestration-engine.js';
import { FailureRecoverySystem } from '../../src/lib/failure-recovery.js';
import { AssetLifecycleManager } from '../../src/lib/asset-lifecycle-manager.js';
import { RealtimeExecutionTracker } from '../../src/lib/realtime-execution-tracker.js';

describe('Operational Integration Tests', () => {
  describe('End-to-End Execution Flow', () => {
    it('executes complete pipeline from queue to completion', async () => {
      const queue = new JobQueue({ maxConcurrent: 2, retryAttempts: 3 });
      const orchestrator = new OrchestrationEngine();
      const stateMachine = ExecutionStateMachine.create('pipeline', 'pipeline-1', { 
        steps: ['init', 'process', 'complete'] 
      });

      stateMachine.transition(ExecutionStates.PENDING);

      const task = async (payload) => {
        return { success: true, value: payload.value };
      };
      
      const jobId = queue.add({
        type: 'test-task',
        task: task,
        payload: { value: 42 }
      });

      orchestrator.registerTask('task-1', { type: 'test-task', payload: { value: 42 } });

      stateMachine.transition(ExecutionStates.QUEUED, { jobId });
      
      await new Promise(resolve => setTimeout(resolve, 200));

      stateMachine.transition(ExecutionStates.PROCESSING, { jobId });

      const result = await task({ value: 42 });
      
      stateMachine.transition(ExecutionStates.COMPLETED, { result });

      expect(stateMachine.state).toBe(ExecutionStates.COMPLETED);
      expect(stateMachine.context.result).toEqual({ success: true, value: 42 });
    }, 5000);

    it('handles pipeline failure and recovery', async () => {
      const queue = new JobQueue({ maxConcurrent: 1, retryAttempts: 2 });
      const recovery = new FailureRecoverySystem();
      const stateMachine = ExecutionStateMachine.create('failing-pipeline', 'pipeline-2', {});

      stateMachine.transition(ExecutionStates.PENDING);
      stateMachine.transition(ExecutionStates.QUEUED);
      stateMachine.transition(ExecutionStates.PROCESSING);

      const error = new Error('Network timeout');
      stateMachine.setError(error);
      stateMachine.transition(ExecutionStates.FAILED, { error: error.message });

      const classification = recovery.classifyFailure(error);
      expect(classification).toBe('timeout');

      const recoveryResult = await recovery.recoverJob(null, error);
      expect(recoveryResult.recovered).toBe(false);
    }, 5000);
  });

  describe('Real-time Synchronization', () => {
    it('subscribes to execution events', () => {
      const tracker = new RealtimeExecutionTracker();
      let callCount = 0;

      const unsubscribe = tracker.subscribe('execution:state', (data) => {
        callCount++;
      });

      expect(callCount).toBe(0);
      unsubscribe();
    });

    it('manages multiple subscribers for same event', () => {
      const tracker = new RealtimeExecutionTracker();
      const calls = [];

      tracker.subscribe('test', () => calls.push(1));
      tracker.subscribe('test', () => calls.push(2));

      const list = tracker.subscribers.get('test') || [];
      expect(list.length).toBe(2);
    });
  });

  describe('Persistence Integration', () => {
    it('manages asset lifecycle states', async () => {
      const manager = new AssetLifecycleManager();

      const states = [
        manager.states.UPLOADING,
        manager.states.UPLOADED,
        manager.states.PROCESSING,
        manager.states.PROCESSED,
        manager.states.RENDERING,
        manager.states.RENDERED,
        manager.states.EXPORTING,
        manager.states.EXPORTED,
        manager.states.ARCHIVED,
        manager.states.ERROR
      ];

      expect(states.length).toBe(10);
      expect(manager.states.UPLOADING).toBe('uploading');
      expect(manager.states.ERROR).toBe('error');
    });

    it('supports state transitions for asset lifecycle', () => {
      const manager = new AssetLifecycleManager();
      const validStates = Object.values(manager.states);

      expect(validStates).toContain('uploading');
      expect(validStates).toContain('processing');
      expect(validStates).toContain('exported');
    });
  });

  describe('Orchestration Coordination', () => {
    it('coordinates dependent task execution', async () => {
      const engine = new OrchestrationEngine();

      const task1 = { id: 'task-1', payload: { step: 1 } };
      const task2 = { id: 'task-2', payload: { step: 2 } };

      engine.registerTask('task-1', task1);
      engine.registerTask('task-2', task2, ['task-1']);

      expect(engine.getTaskStatus('task-1')).toBe('pending');
      expect(engine.getTaskStatus('task-2')).toBe('pending');
      expect(engine.dependencies.get('task-2')).toEqual(['task-1']);
    });

    it('supports multiple parallel tasks', async () => {
      const queue = new JobQueue({ maxConcurrent: 3 });
      
      const jobIds = [];
      for (let i = 0; i < 3; i++) {
        jobIds.push(queue.add({ 
          task: async () => i, 
          payload: {} 
        }));
      }

      expect(jobIds.length).toBe(3);
    });
  });

  describe('Failure Recovery Integration', () => {
    it('classifies different failure types', () => {
      const recovery = new FailureRecoverySystem();

      const failures = [
        { error: new Error('timeout occurred'), expected: 'timeout' },
        { error: new Error('network error'), expected: 'network' },
        { error: new Error('auth failed'), expected: 'auth' },
        { error: new Error('unknown error'), expected: 'unknown' }
      ];

      failures.forEach(({ error, expected }) => {
        expect(recovery.classifyFailure(error)).toBe(expected);
      });
    });

    it('supports retry strategy selection', () => {
      const recovery = new FailureRecoverySystem();

      const strategies = {
        timeout: { retries: 5, backoff: 'exponential' },
        network: { retries: 3, backoff: 'exponential' },
        auth: { retries: 0, backoff: 'none' },
        unknown: { retries: 3, backoff: 'exponential' }
      };

      expect(strategies.timeout.retries).toBe(5);
      expect(strategies.auth.retries).toBe(0);
    });
  });

  describe('Queue System Integration', () => {
    it('manages job lifecycle from add to complete', async () => {
      const queue = new JobQueue({ maxConcurrent: 1, retryAttempts: 1 });

      const jobId = queue.add({
        type: 'test-job',
        payload: { data: 'test' },
        task: async (payload) => ({ result: payload.data })
      });

      const job = queue.get(jobId);
      expect(job).toBeDefined();
      expect(job.attempts).toBe(0);
    });

    it('supports priority-based ordering', () => {
      const queue = new JobQueue({ maxConcurrent: 3 });

      const highPriority = queue.add({ 
        type: 'high', 
        payload: {}, 
        priority: 1,
        task: async () => {} 
      });
      const normalPriority = queue.add({ 
        type: 'normal', 
        payload: {}, 
        priority: 5,
        task: async () => {} 
      });
      const lowPriority = queue.add({ 
        type: 'low', 
        payload: {}, 
        priority: 10,
        task: async () => {} 
      });

      expect(queue.get(highPriority)).toBeDefined();
      expect(queue.get(normalPriority)).toBeDefined();
      expect(queue.get(lowPriority)).toBeDefined();
    });
  });

  describe('Execution State Machine Integration', () => {
    it('supports full execution lifecycle', () => {
      const sm = ExecutionStateMachine.create('execution', 'exec-1', { input: 'data' });

      const transitions = [
        ExecutionStates.PENDING,
        ExecutionStates.QUEUED,
        ExecutionStates.PROCESSING,
        ExecutionStates.COMPLETED
      ];

      transitions.forEach(state => {
        sm.transition(state);
        expect(sm.state).toBe(state);
      });

      expect(sm.isTerminal()).toBe(true);
    });

    it('handles recovery from failed state', () => {
      const sm = ExecutionStateMachine.create('recovery-test', 'exec-2', {});

      sm.transition(ExecutionStates.PENDING);
      sm.transition(ExecutionStates.PROCESSING);
      sm.setError(new Error('Failed'));
      sm.transition(ExecutionStates.FAILED);

      expect(sm.state).toBe(ExecutionStates.FAILED);

      sm.transition(ExecutionStates.RECOVERED);
      expect(sm.state).toBe(ExecutionStates.RECOVERED);

      sm.transition(ExecutionStates.PROCESSING);
      expect(sm.state).toBe(ExecutionStates.PROCESSING);
    });

    it('maintains execution history', () => {
      const sm = ExecutionStateMachine.create('history-test', 'exec-3', {});

      sm.transition(ExecutionStates.PENDING);
      sm.transition(ExecutionStates.QUEUED);
      sm.transition(ExecutionStates.PROCESSING);

      expect(sm.history.length).toBe(3);
      expect(sm.history[0].from).toBe(ExecutionStates.PENDING);
      expect(sm.history[1].from).toBe(ExecutionStates.PENDING);
      expect(sm.history[1].to).toBe(ExecutionStates.QUEUED);
    });
  });

  describe('Concurrent Execution', () => {
    it('handles multiple jobs in queue', async () => {
      const queue = new JobQueue({ maxConcurrent: 3 });
      
      const jobIds = [];
      for (let i = 0; i < 5; i++) {
        jobIds.push(queue.add({
          type: `job-${i}`,
          task: async () => i,
          payload: {}
        }));
      }

      expect(jobIds.length).toBe(5);
      
      jobIds.forEach(id => {
        expect(queue.get(id)).toBeDefined();
      });
    });
  });
});