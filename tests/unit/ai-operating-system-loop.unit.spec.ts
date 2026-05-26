import { describe, it, expect, beforeEach } from 'vitest';
import { RuntimeInitializer } from '../../src/lib/runtime-initializer.js';
import { AppRegistry } from '../../src/lib/appRegistry.js';

describe('AI Operating System Loop', () => {
  beforeEach(() => {
    AppRegistry.clear();
  });

  it('should initialize runtime with all apps', async () => {
    const result = await RuntimeInitializer.initialize();

    expect(result.status).toBe('initialized');
    expect(result.apps).toBeDefined();
    expect(result.apps.length).toBeGreaterThan(0);
  });

it('should register all apps', async () => {
    const app = AppRegistry.get('vibe-workflow');
    expect(app.appId).toBe('vibe-workflow');

    const app2 = AppRegistry.get('videco-ai-platform');
    expect(app2.appId).toBe('videco-ai-platform');

    const app3 = AppRegistry.get('ai-headshot-generator');
    expect(app3.appId).toBe('ai-headshot-generator');

    const app4 = AppRegistry.get('open-pomelli');
    expect(app4.appId).toBe('open-pomelli');

    const app5 = AppRegistry.get('agents-app');
    expect(app5.appId).toBe('agents-app');

    const app6 = AppRegistry.get('assistant-app');
    expect(app6.appId).toBe('assistant-app');
  });

  it('should register videco-ai-platform app', async () => {
    await RuntimeInitializer.initialize();

    const app = AppRegistry.get('videco-ai-platform');
    expect(app).toBeDefined();
    expect(app.appId).toBe('videco-ai-platform');
  });

  it('should register ai-headshot-generator app', async () => {
    await RuntimeInitializer.initialize();

    const app = AppRegistry.get('ai-headshot-generator');
    expect(app).toBeDefined();
    expect(app.appId).toBe('ai-headshot-generator');
  });

  it('should register open-pomelli app', async () => {
    await RuntimeInitializer.initialize();

    const app = AppRegistry.get('open-pomelli');
    expect(app).toBeDefined();
    expect(app.appId).toBe('open-pomelli');
  });

  it('should execute ai-generation app via runtime', async () => {
    await RuntimeInitializer.initialize();

    const result = await RuntimeInitializer.execute('ai-headshot-generator', {
      prompt: 'test prompt',
      type: 'image'
    }, {});

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should handle unknown app gracefully', async () => {
    await RuntimeInitializer.initialize();

    await expect(
      RuntimeInitializer.execute('unknown-app', {}, {})
    ).rejects.toThrow('App unknown-app not registered');
  });

  it('should track execution state', async () => {
    const { realtimeTracker } = await import('../../src/lib/realtime-execution-tracker.js');

    let initializedEventReceived = false;
    const originalEmit = realtimeTracker.emit.bind(realtimeTracker);
    realtimeTracker.emit = (type, data) => {
      if (type === 'runtime:initialized') {
        initializedEventReceived = true;
      }
      return originalEmit(type, data);
    };

    await RuntimeInitializer.initialize();

    expect(initializedEventReceived).toBe(true);
  });
});