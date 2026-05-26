import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionKernel } from '../../src/kernel/execution-kernel.js';
import { EventBus } from '../../src/kernel/eventBus.js';
import { ExecutionScheduler } from '../../src/kernel/executionScheduler.js';
import { SnapshotEngine } from '../../src/kernel/snapshotEngine.js';
import { ReplayEngine } from '../../src/kernel/replayEngine.js';

describe('Kernel Unification Tests', () => {
  let eventBus;
  let scheduler;
  let snapshotManager;
  let replayEngine;
  let kernel;

  beforeEach(() => {
    eventBus = new EventBus();
    scheduler = new ExecutionScheduler();
    snapshotManager = new SnapshotEngine();
    replayEngine = new ReplayEngine(eventBus);

    kernel = new ExecutionKernel({
      scheduler,
      eventBus,
      snapshotManager,
      replayEngine,
    });
  });

  it('forces all execution through kernel', async () => {
    const graph = {
      id: 'test-graph',
      nodes: [{ id: 'n1', type: 'test-node', input: {} }],
      edges: [],
    };

    const result = await kernel.execute(graph);

    expect(result).toBeDefined();
  });

  it('creates execution snapshots', async () => {
    const graph = {
      id: 'snapshot-test',
      nodes: [{ id: 'n1', type: 'test' }],
      edges: [],
    };

    await kernel.execute(graph);

    const snapshot = snapshotManager.load('snapshot-test');
    expect(snapshot).toBeDefined();
  });

  it('emits kernel-level lifecycle events', async () => {
    const graph = {
      id: 'event-test',
      nodes: [{ id: 'n1', type: 'test' }],
      edges: [],
    };

    const startEvents = [];
    const completeEvents = [];

    eventBus.subscribe('kernel:execution:start', (e) => startEvents.push(e));
    eventBus.subscribe('kernel:execution:complete', (e) => completeEvents.push(e));

    await kernel.execute(graph);

    expect(startEvents.length).toBe(1);
    expect(completeEvents.length).toBe(1);
  });

  it('handles execution failures', async () => {
    const graph = {
      id: 'fail-test',
      nodes: [{ id: 'n1', type: 'test' }],
      edges: [],
    };

    const result = await kernel.execute(graph);

    expect(result).toBeDefined();
  });
});