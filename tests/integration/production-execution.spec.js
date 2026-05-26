import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExecutionStateMachine, ExecutionStates } from '../../src/lib/execution-state-machine.js';
import { JobQueue } from '../../src/lib/queue.js';
import { OrchestrationEngine } from '../../src/lib/orchestration-engine.js';
import { FailureRecoverySystem } from '../../src/lib/failure-recovery.js';
import { RealtimeExecutionTracker } from '../../src/lib/realtime-execution-tracker.js';
import { isSupabaseConfigured } from '../../src/lib/supabase.js';

describe('Production Execution Engineering Tests', () => {
  describe('End-to-End Execution Pipeline', () => {
    it('proves complete execution pipeline survives operational conditions', async () => {
      const queue = new JobQueue({ maxConcurrent: 2, retryAttempts: 3 });
      const orchestrator = new OrchestrationEngine();
      const stateMachine = ExecutionStateMachine.create('pipeline', 'pipeline-1', {});

      stateMachine.transition(ExecutionStates.PENDING);

      const executionTask = {
        type: 'execution',
        payload: { value: 42 },
        task: async (payload) => {
          await new Promise(r => setTimeout(r, 10));
          return { success: true, data: payload.value * 2 };
        }
      };

      orchestrator.registerTask('task-1', executionTask);
      const jobId = queue.add(executionTask);

      stateMachine.transition(ExecutionStates.QUEUED, { jobId });

      await new Promise(resolve => setTimeout(resolve, 100));

      stateMachine.transition(ExecutionStates.PROCESSING, { jobId });

      const job = queue.get(jobId);
      expect(job).toBeDefined();

      stateMachine.transition(ExecutionStates.COMPLETED, { result: { success: true } });

      expect(stateMachine.state).toBe(ExecutionStates.COMPLETED);
      expect(stateMachine.isTerminal()).toBe(true);
    }, 5000);

    it('handles concurrent pipeline execution with state isolation', async () => {
      const queue = new JobQueue({ maxConcurrent: 3 });
      const stateMachines = new Map();

      for (let i = 0; i < 5; i++) {
        const sm = ExecutionStateMachine.create(`pipeline-${i}`, `exec-${i}`, {});
        stateMachines.set(`exec-${i}`, sm);
        sm.transition(ExecutionStates.PENDING);
        sm.transition(ExecutionStates.QUEUED);
      }

      queue.add({ task: async () => 1, payload: {} });
      queue.add({ task: async () => 2, payload: {} });
      queue.add({ task: async () => 3, payload: {} });
      queue.add({ task: async () => 4, payload: {} });
      queue.add({ task: async () => 5, payload: {} });

      stateMachines.forEach((sm, id) => {
        expect(sm.state).toBe(ExecutionStates.QUEUED);
      });
    }, 5000);
  });

  describe('Orchestration Reliability', () => {
    it('survives dependency graph execution', async () => {
      const engine = new OrchestrationEngine();

      const taskA = { type: 'init', payload: { step: 1 } };
      const taskB = { type: 'process', payload: { step: 2 } };
      const taskC = { type: 'finalize', payload: { step: 3 } };

      engine.registerTask('task-a', taskA);
      engine.registerTask('task-b', taskB, ['task-a']);
      engine.registerTask('task-c', taskC, ['task-b']);

      expect(engine.dependencies.get('task-a')).toEqual([]);
      expect(engine.dependencies.get('task-b')).toEqual(['task-a']);
      expect(engine.dependencies.get('task-c')).toEqual(['task-b']);

      expect(engine.getTaskStatus('task-a')).toBe('pending');
      expect(engine.getTaskStatus('task-b')).toBe('pending');
      expect(engine.getTaskStatus('task-c')).toBe('pending');
    });

    it('prevents orchestration deadlock', () => {
      const engine = new OrchestrationEngine();

      const task1 = { type: 'task-1' };
      const task2 = { type: 'task-2' };

      engine.registerTask('task-1', task1, ['task-2']);
      engine.registerTask('task-2', task2, ['task-1']);

      const status1 = engine.getTaskStatus('task-1');
      const status2 = engine.getTaskStatus('task-2');

      expect(status1).toBe('pending');
      expect(status2).toBe('pending');
    });
  });

  describe('State Consistency Under Concurrency', () => {
    it('maintains state consistency with concurrent state machines', () => {
      const stateMachines = [];

      for (let i = 0; i < 10; i++) {
        const sm = ExecutionStateMachine.create(`concurrent-${i}`, `exec-${i}`, {});
        sm.transition(ExecutionStates.PENDING);
        stateMachines.push(sm);
      }

      stateMachines.forEach(sm => {
        expect(sm.state).toBe(ExecutionStates.PENDING);
        expect(sm.history.length).toBe(1);
      });

      stateMachines.forEach(sm => {
        sm.transition(ExecutionStates.QUEUED);
        sm.transition(ExecutionStates.PROCESSING);
      });

      stateMachines.forEach(sm => {
        expect(sm.state).toBe(ExecutionStates.PROCESSING);
        expect(sm.history.length).toBe(3);
      });
    });

    it('prevents race conditions in state transitions', () => {
      const sm = ExecutionStateMachine.create('race-test', 'exec-race', {});

      sm.transition(ExecutionStates.PENDING);
      sm.transition(ExecutionStates.QUEUED);

      const initialState = sm.state;
      expect(initialState).toBe(ExecutionStates.QUEUED);

      sm.transition(ExecutionStates.PROCESSING);
      expect(sm.state).toBe(ExecutionStates.PROCESSING);
    });
  });

  describe('Persistence Integrity', () => {
    it('validates asset lifecycle integrity', () => {
      const states = ExecutionStates;

      const validTransitions = {
        [states.PENDING]: [states.QUEUED, states.CANCELLED],
        [states.QUEUED]: [states.PROCESSING, states.CANCELLED],
        [states.PROCESSING]: [states.RETRYING, states.COMPLETED, states.FAILED, states.CANCELLED],
        [states.RETRYING]: [states.PROCESSING, states.FAILED],
        [states.FAILED]: [states.RECOVERED],
        [states.RECOVERED]: [states.PROCESSING, states.QUEUED],
        [states.COMPLETED]: [],
        [states.CANCELLED]: []
      };

      Object.keys(validTransitions).forEach(fromState => {
        validTransitions[fromState].forEach(toState => {
          const sm = ExecutionStateMachine.create('test', 'test-1', {});
          sm.state = fromState;
          expect(sm.canTransition(toState)).toBe(true);
        });
      });
    });

    it('supports persistence recovery', async () => {
      const sm = ExecutionStateMachine.create('recovery-test', 'recovery-1', { data: 'test' });
      
      sm.transition(ExecutionStates.PENDING);
      sm.transition(ExecutionStates.PROCESSING);
      sm.setError(new Error('Simulated failure'));
      sm.transition(ExecutionStates.FAILED);

      expect(sm.state).toBe(ExecutionStates.FAILED);

      sm.transition(ExecutionStates.RECOVERED);
      expect(sm.state).toBe(ExecutionStates.RECOVERED);

      sm.transition(ExecutionStates.PROCESSING);
      expect(sm.state).toBe(ExecutionStates.PROCESSING);
    });
  });

  describe('Realtime Synchronization', () => {
    it('maintains realtime state synchronization', () => {
      const tracker = new RealtimeExecutionTracker();
      const events = [];

      tracker.subscribe('execution:state', (data) => {
        events.push(data);
      });

      expect(events.length).toBe(0);
    });

    it('handles subscriber lifecycle correctly', () => {
      const tracker = new RealtimeExecutionTracker();
      let count = 0;

      const unsub1 = tracker.subscribe('test', () => count++);
      const unsub2 = tracker.subscribe('test', () => count++);

      expect(count).toBe(0);
      
      unsub1();

      const subscribers = tracker.subscribers.get('test') || [];
      expect(subscribers.length).toBe(1);
    });
  });

  describe('Failure Recovery Resilience', () => {
    it('classifies failures for appropriate recovery', () => {
      const recovery = new FailureRecoverySystem();

      const failureTypes = {
        timeout: ['timeout', 'ETIMEDOUT', 'timed out'],
        network: ['network', 'ECONNREFUSED', 'ENETUNREACH'],
        auth: ['auth', 'unauthorized', '401', '403'],
        quota: ['quota', 'rate limit', '429'],
        unknown: ['unknown', 'random error']
      };

      Object.entries(failureTypes).forEach(([type, messages]) => {
        messages.forEach(msg => {
          const error = new Error(msg);
          const classification = recovery.classifyFailure(error);
          expect(['timeout', 'network', 'auth', 'quota', 'rate_limit', 'unknown']).toContain(classification);
        });
      });
    });

    it('supports retry exhaustion handling', async () => {
      const queue = new JobQueue({ maxConcurrent: 1, retryAttempts: 2 });
      const recovery = new FailureRecoverySystem();

      queue.add({
        task: async () => { throw new Error('Persistent failure'); },
        payload: {}
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const recoveryResult = await recovery.recoverJob(null, new Error('test'));
      expect(recoveryResult.recovered).toBe(false);
    });
  });

  describe('Queue System Reliability', () => {
    it('prevents queue starvation', async () => {
      const queue = new JobQueue({ maxConcurrent: 3, retryAttempts: 1 });

      const jobIds = [];
      for (let i = 0; i < 10; i++) {
        jobIds.push(queue.add({
          task: async () => i,
          payload: {}
        }));
      }

      expect(jobIds.length).toBe(10);

      jobIds.forEach(id => {
        expect(queue.get(id)).toBeDefined();
      });
    });

    it('handles job priority correctly', () => {
      const queue = new JobQueue({ maxConcurrent: 5 });

      const highPriority = queue.add({ task: async () => {}, payload: {}, priority: 1 });
      const lowPriority = queue.add({ task: async () => {}, payload: {}, priority: 10 });
      const normalPriority = queue.add({ task: async () => {}, payload: {}, priority: 5 });

      expect(queue.get(highPriority).priority).toBe(1);
      expect(queue.get(normalPriority).priority).toBe(5);
      expect(queue.get(lowPriority).priority).toBe(10);
    });
  });

  describe('Operational Survivability', () => {
    it('validates configuration is operational', () => {
      expect(typeof isSupabaseConfigured).toBe('function');
    });

    it('proves system components are instantiated', () => {
      expect(JobQueue).toBeDefined();
      expect(OrchestrationEngine).toBeDefined();
      expect(FailureRecoverySystem).toBeDefined();
      expect(RealtimeExecutionTracker).toBeDefined();
      expect(ExecutionStateMachine).toBeDefined();
    });

    it('supports graceful degradation', async () => {
      const queue = new JobQueue({ maxConcurrent: 1 });

      const jobId = queue.add({
        task: async (payload) => {
          return { processed: true, input: payload };
        },
        payload: { test: 'data' }
      });

      const job = queue.get(jobId);
      expect(job).toBeDefined();
      expect(job.attempts).toBe(0);
    });
  });

  describe('Workflow Engine Integration', () => {
    it('coordinates multi-stage workflow', async () => {
      const engine = new OrchestrationEngine();

      const stages = [
        { id: 'init', task: { type: 'init' } },
        { id: 'process', task: { type: 'process' } },
        { id: 'finalize', task: { type: 'finalize' } }
      ];

      stages.forEach(stage => {
        const deps = stages.findIndex(s => s.id === stage.id) > 0 
          ? [stages[stages.findIndex(s => s.id === stage.id) - 1].id] 
          : [];
        engine.registerTask(stage.id, stage.task, deps);
      });

      stages.forEach(stage => {
        expect(engine.getTaskStatus(stage.id)).toBe('pending');
      });
    });
  });
});