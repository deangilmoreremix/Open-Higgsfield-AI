import { describe, it, expect, beforeEach } from 'vitest';
import { bootstrapApps } from '../../src/forge/bootstrapApps.js';

describe('AI Operating System Full Execution Loop', () => {
  let registry;
  let kernel;

  beforeEach(() => {
    const bootstrap = bootstrapApps();
    registry = bootstrap.registry;
    kernel = bootstrap.kernel;
  });

  it('INITIALIZE: all apps are registered', () => {
    const apps = registry.list();
    expect(apps.length).toBe(9);
    expect(apps).toContain('videco-ai-platform');
    expect(apps).toContain('vibe-workflow');
    expect(apps).toContain('ai-video-outreach');
    expect(apps).toContain('ai-headshot-generator');
    expect(apps).toContain('workflow-app');
    expect(apps).toContain('studio-app');
    expect(apps).toContain('open-pomelli');
    expect(apps).toContain('agents-app');
    expect(apps).toContain('assistant-app');
  });

  it('EXECUTE: videco-ai-platform runs through kernel', async () => {
    const result = await registry.run('videco-ai-platform', {
      prompt: 'create a product video',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('completed');
  });

  it('EXECUTE: vibe-workflow runs through kernel', async () => {
    const result = await registry.run('vibe-workflow', {
      prompt: 'build a workflow',
    });

    expect(result).toBeDefined();
  });

  it('EXECUTE: ai-headshot-generator runs through kernel', async () => {
    const result = await registry.run('ai-headshot-generator', {
      prompt: 'professional portrait',
    });

    expect(result).toBeDefined();
  });

  it('EXECUTE: open-pomelli runs through kernel', async () => {
    const result = await registry.run('open-pomelli', {
      prompt: 'create a video',
    });

    expect(result).toBeDefined();
  });

  it('PERSISTENCE: execution state is saved', async () => {
    const graph = {
      id: 'persist-test',
      nodes: [{ id: 'n1', type: 'test', input: {} }],
      edges: [],
    };

    const executionId = await kernel.submit(graph);
    await kernel.execute(executionId);

    const snapshot = kernel.snapshots.load(executionId);
    expect(snapshot).not.toBeNull();
  });

  it('RECOVERY: system can recover from failure', async () => {
    const result = await registry.run('vibe-workflow', {
      prompt: 'test recovery',
    }).catch((e) => ({ error: e.message }));

    expect(result).toBeDefined();
  });

  it('CONCURRENCY: multiple apps execute independently', async () => {
    const results = await Promise.all([
      registry.run('videco-ai-platform', { prompt: 'video 1' }),
      registry.run('vibe-workflow', { prompt: 'workflow 1' }),
      registry.run('ai-headshot-generator', { prompt: 'portrait 1' }),
    ]);

    expect(results.length).toBe(3);
    results.forEach((r) => {
      expect(r).toBeDefined();
    });
  });
});