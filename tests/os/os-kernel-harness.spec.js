import { describe, it, expect, beforeEach } from 'vitest';
import { Kernel } from '../../src/kernel/kernel.js';
import { ChaosInjector } from './chaos-injector.js';
import { createWorkflowScenarios, createFailureScenarios } from './execution-scenarios.js';
import {
  validateExecutionState,
  validateNoTaskLeaks,
  validateEventConsistency,
} from './validators.js';

describe('Higgsfield OS Kernel Harness', () => {
  let kernel;
  let chaos;

  beforeEach(() => {
    kernel = new Kernel();
    chaos = new ChaosInjector(kernel);
    kernel.reset();
  });

  it('FULL OS LOOP: executes cross-app workflow with recovery', async () => {
    const scenarios = createWorkflowScenarios();

    chaos.injectRandomFailures(kernel.scheduler);
    chaos.dropEventBusMessages(kernel.eventBus, 0.2);

    kernel.start();

    const executionId = 'exec-os-1';

    for (const step of scenarios[0].steps) {
      kernel.registerTask({
        id: `${step}-${Math.random()}`,
        executionId,
        type: step,
        handler: async (payload) => {
          await new Promise((r) => setTimeout(r, 10));
          return { step, ok: true };
        },
        payload: {},
      });
    }

    chaos.killSchedulerMidRun(80);

    await new Promise((r) => setTimeout(r, 300));

    kernel.start();

    await new Promise((r) => setTimeout(r, 300));

    kernel.stop();

    expect(validateExecutionState(kernel, executionId)).toBe(true);
    expect(validateNoTaskLeaks(kernel)).toBe(true);
    expect(validateEventConsistency(kernel, executionId)).toBe(true);
  });

  it('CONCURRENCY STRESS: 10 parallel workflows survive chaos', async () => {
    const executionId = 'exec-concurrent';

    kernel.start();

    chaos.injectRandomFailures(kernel.scheduler);

    for (let i = 0; i < 10; i++) {
      kernel.registerTask({
        id: `task-${i}`,
        executionId,
        type: 'muapi',
        handler: async () => {
          await new Promise((r) => setTimeout(r, 5));
          return true;
        },
        payload: {},
      });
    }

    await new Promise((r) => setTimeout(r, 800));

    kernel.stop();

    expect(validateNoTaskLeaks(kernel)).toBe(true);
  });

  it('REPLAY ENGINE: system can reconstruct execution state', () => {
    const executionId = 'exec-replay';

    kernel.eventBus.publish({
      type: 'task:start',
      executionId,
      taskId: 'a',
    });

    kernel.eventBus.publish({
      type: 'task:complete',
      executionId,
      taskId: 'a',
    });

    const replay = kernel.replay.replay(executionId);

    expect(replay.tasks['a'].status).toBe('completed');
  });

  it('PERSISTENCE: snapshots are saved and loaded', async () => {
    const graph = {
      id: 'exec-persist',
      nodes: [{ id: 'persist-task', type: 'test', input: {} }],
      edges: [],
    };

    const executionId = await kernel.submit(graph);
    await kernel.execute(executionId);

    const snapshot = kernel.snapshots.load(executionId);
    expect(snapshot).not.toBeNull();
  });
});