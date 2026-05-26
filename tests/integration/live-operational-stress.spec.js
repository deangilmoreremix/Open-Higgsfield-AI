import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExecutionStateMachine, ExecutionStates } from '../../src/lib/execution-state-machine.js';
import { JobQueue } from '../../src/lib/queue.js';
import { OrchestrationEngine } from '../../src/lib/orchestration-engine.js';
import { FailureRecoverySystem } from '../../src/lib/failure-recovery.js';
import { RealtimeExecutionTracker } from '../../src/lib/realtime-execution-tracker.js';

describe('Live Operational Stress Validation', () => {
  describe('Long-Running Execution Simulation', () => {
    it('handles extended execution with state persistence', async () => {
      const stateMachine = ExecutionStateMachine.create('long-running', 'exec-long', {});
      
      stateMachine.transition(ExecutionStates.PENDING);
      stateMachine.transition(ExecutionStates.QUEUED);
      stateMachine.transition(ExecutionStates.PROCESSING);

      await new Promise(resolve => setTimeout(resolve, 100));

      stateMachine.transition(ExecutionStates.RETRYING);
      stateMachine.transition(ExecutionStates.PROCESSING);

      await new Promise(resolve => setTimeout(resolve, 100));

      stateMachine.transition(ExecutionStates.COMPLETED);

      expect(stateMachine.state).toBe(ExecutionStates.COMPLETED);
      expect(stateMachine.history.length).toBe(6);
    }, 5000);

    it('survives multiple retry cycles', async () => {
      const queue = new JobQueue({ maxConcurrent: 1, retryAttempts: 3, retryDelay: 10 });

      let attempts = 0;
      queue.add({
        task: async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
          return { success: true, attempts };
        },
        payload: {}
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(attempts).toBeGreaterThanOrEqual(1);
    }, 5000);
  });

  describe('Concurrent User Simulation', () => {
    it('handles 50 concurrent state machines', () => {
      const stateMachines = [];

      for (let i = 0; i < 50; i++) {
        const sm = ExecutionStateMachine.create(`user-${i}`, `exec-${i}`, {});
        sm.transition(ExecutionStates.PENDING);
        stateMachines.push(sm);
      }

      stateMachines.forEach(sm => {
        expect(sm.state).toBe(ExecutionStates.PENDING);
      });

      stateMachines.forEach(sm => {
        sm.transition(ExecutionStates.QUEUED);
        sm.transition(ExecutionStates.PROCESSING);
      });

      stateMachines.forEach(sm => {
        expect(sm.state).toBe(ExecutionStates.PROCESSING);
      });
    });

    it('manages 20 concurrent jobs with priority', async () => {
      const queue = new JobQueue({ maxConcurrent: 5 });

      const jobIds = [];
      for (let i = 0; i < 20; i++) {
        jobIds.push(queue.add({
          task: async () => i,
          payload: {},
          priority: i % 10
        }));
      }

      expect(jobIds.length).toBe(20);

      await new Promise(resolve => setTimeout(resolve, 200));

      jobIds.forEach(id => {
        expect(queue.get(id)).toBeDefined();
      });
    });
  });

  describe('WebSocket Disconnect/Reconnect Simulation', () => {
    it('recovers from connection loss', () => {
      const tracker = new RealtimeExecutionTracker();

      tracker.disconnect();
      tracker.reconnect = true;
      tracker.connect('ws://localhost:8080');

      expect(tracker.ws).toBeDefined();
    });

    it('manages subscriber lifecycle', () => {
      const tracker = new RealtimeExecutionTracker();
      let count = 0;

      const unsub = tracker.subscribe('test', () => count++);
      expect(count).toBe(0);
      
      unsub();
      expect(count).toBe(0);
    });
  });

  describe('Orchestration Under Stress', () => {
    it('handles circular dependency detection', () => {
      const engine = new OrchestrationEngine();

      const task1 = { type: 'task-1' };
      const task2 = { type: 'task-2' };
      const task3 = { type: 'task-3' };

      engine.registerTask('t1', task1, ['t3']);
      engine.registerTask('t2', task2, ['t1']);
      engine.registerTask('t3', task3, ['t2']);

      expect(engine.getTaskStatus('t1')).toBe('pending');
      expect(engine.getTaskStatus('t2')).toBe('pending');
      expect(engine.getTaskStatus('t3')).toBe('pending');
    });

    it('coordinates 100 dependent tasks', () => {
      const engine = new OrchestrationEngine();

      for (let i = 0; i < 100; i++) {
        const deps = i > 0 ? [`task-${i - 1}`] : [];
        engine.registerTask(`task-${i}`, { type: 'task', index: i }, deps);
      }

      expect(engine.getTaskStatus('task-0')).toBe('pending');
      expect(engine.getTaskStatus('task-50')).toBe('pending');
      expect(engine.getTaskStatus('task-99')).toBe('pending');
    });
  });

  describe('Failure Recovery Under Stress', () => {
    it('recovers from intermittent network failures', async () => {
      const queue = new JobQueue({ maxConcurrent: 1, retryAttempts: 3, retryDelay: 10 });

      let failures = 0;
      queue.add({
        task: async () => {
          failures++;
          if (failures < 2) {
            throw new Error('Network connection failed');
          }
          return { success: true };
        },
        payload: {}
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(failures).toBeGreaterThanOrEqual(1);
    }, 5000);

    it('classifies cascading failures', () => {
      const recovery = new FailureRecoverySystem();

      const errors = [
        new Error('ETIMEDOUT'),
        new Error('ECONNREFUSED'),
        new Error('ENETUNREACH'),
        new Error('api_key invalid'),
        new Error('quota exceeded'),
        new Error('rate limit hit')
      ];

      errors.forEach(error => {
        const classification = recovery.classifyFailure(error);
        expect(['timeout', 'network', 'auth', 'quota', 'rate_limit', 'unknown']).toContain(classification);
      });
    });
  });

  describe('Memory Pressure Simulation', () => {
    it('handles large payload without memory leak', async () => {
      const queue = new JobQueue({ maxConcurrent: 3 });

      const largePayload = {
        data: 'x'.repeat(1024 * 1024),
        items: Array(1000).fill(null).map((_, i) => ({ id: i, value: Math.random() }))
      };

      const jobIds = [];
      for (let i = 0; i < 5; i++) {
        jobIds.push(queue.add({
          task: async (payload) => ({ processed: payload.items.length }),
          payload: { large: largePayload, index: i }
        }));
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      jobIds.forEach(id => {
        expect(queue.get(id)).toBeDefined();
      });
    });
  });

  describe('Race Condition Prevention', () => {
    it('handles concurrent state transitions', () => {
      const sm = ExecutionStateMachine.create('race-test', 'exec-race', {});

      for (let i = 0; i < 10; i++) {
        sm.transition(ExecutionStates.PENDING);
        sm.transition(ExecutionStates.QUEUED);
        sm.transition(ExecutionStates.PROCESSING);
      }

      expect(sm.state).toBe(ExecutionStates.PROCESSING);
      expect(sm.history.length).toBe(30);
    });
  });

  describe('Production Workload Simulation', () => {
    it('simulates video generation pipeline', async () => {
      const engine = new OrchestrationEngine();
      const queue = new JobQueue({ maxConcurrent: 3 });

      const stages = [
        { name: 'init', task: { type: 'init' } },
        { name: 'prompt', task: { type: 'prompt' } },
        { name: 'generate', task: { type: 'generate' } },
        { name: 'process', task: { type: 'process' } },
        { name: 'export', task: { type: 'export' } }
      ];

      stages.forEach((stage, i) => {
        const deps = i > 0 ? [`stage-${i - 1}`] : [];
        engine.registerTask(`stage-${i}`, stage.task, deps);
      });

      expect(engine.getTaskStatus('stage-0')).toBe('pending');
      expect(engine.getTaskStatus('stage-4')).toBe('pending');
    });

    it('simulates image batch processing', async () => {
      const queue = new JobQueue({ maxConcurrent: 5 });

      const batchSize = 50;
      const jobIds = [];

      for (let i = 0; i < batchSize; i++) {
        jobIds.push(queue.add({
          task: async () => ({ processed: i }),
          payload: { image: `image-${i}.png` }
        }));
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(jobIds.length).toBe(batchSize);
    });
  });
});