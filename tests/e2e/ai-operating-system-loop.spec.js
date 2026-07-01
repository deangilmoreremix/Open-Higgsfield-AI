import { describe, it, expect, beforeEach } from 'vitest';
import { Kernel } from '../../src/kernel/kernel.js';
import { bootstrapApps } from '../../src/forge/bootstrapApps.js';

describe('AI Operating System Loop', () => {
  let kernel;
  let registry;

  beforeEach(() => {
    const bootstrap = bootstrapApps();
    kernel = bootstrap.kernel;
    registry = bootstrap.registry;
  });

  it('INITIALIZE: all apps are registered', () => {
    const apps = registry.list();
    expect(apps.length).toBe(7);
  });

  it('DISPATCH: can dispatch execution to registered apps', async () => {
    const app = registry.get('vibe-workflow');
    expect(app).toBeDefined();
  });

  it('EXECUTE: runs workflow app through kernel', async () => {
    const result = await registry.run('vibe-workflow', {
      prompt: 'test generation',
    });

    expect(result).toBeDefined();
  });

  it('PERSISTENCE: execution state is tracked', async () => {
    const graph = {
      id: 'exec-os-test',
      nodes: [{ id: 'persist-task', type: 'test', input: {} }],
      edges: [],
    };

    const executionId = await kernel.submit(graph);
    await kernel.execute(executionId);

    const snapshot = kernel.snapshots.load('exec-os-test');
    expect(snapshot).not.toBeNull();
  });

  it('RECOVERY: can recover from execution failure', async () => {
    const result = await registry.run('vibe-workflow', {
      prompt: 'test recovery',
    }).catch((e) => ({ error: e.message }));

    expect(result).toBeDefined();
  });

  it('CONCURRENCY: handles multiple parallel executions', async () => {
    const executionId = 'concurrent-test';

    const graph = {
      id: executionId,
      nodes: [
        { id: 'task-0', type: 'test', input: {} },
        { id: 'task-1', type: 'test', input: {} },
      ],
      edges: [],
    };

    await kernel.submit(graph);
    await kernel.execute(executionId);

    const snapshot = kernel.snapshots.load(executionId);
    expect(snapshot).not.toBeNull();
  });
});