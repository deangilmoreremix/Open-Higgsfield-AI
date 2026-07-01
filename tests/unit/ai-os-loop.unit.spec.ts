import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { aiOSExecutionLoop } from '../../src/lib/ai-os-execution-loop.js';
import { AppRegistry } from '../../src/lib/appRegistry.js';
import { realtimeTracker } from '../../src/lib/realtime-execution-tracker.js';

describe('AI Operating System Loop', () => {
  const originalLog = console.log;
  const mockLogs = [];

  beforeEach(() => {
    mockLogs.length = 0;
    console.log = (...args) => mockLogs.push(args.join(' '));
    AppRegistry.clear();
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it('executes cross-app workflow end-to-end', async () => {
    const mockApp = {
      execute: vi.fn().mockResolvedValue({ success: true, result: { url: 'https://test.com/output' } })
    };
    AppRegistry.register('test-app', mockApp);

    const result = await aiOSExecutionLoop({
      appId: 'test-app',
      input: { prompt: 'test workflow' }
    });

    expect(result.status).toBe('completed');
    expect(result.executionId).toBeDefined();
    expect(mockApp.execute).toHaveBeenCalled();
  });

  it('handles app not found in registry', async () => {
    const result = await aiOSExecutionLoop({
      appId: 'non-existent',
      input: { prompt: 'test' }
    }).catch(e => ({ error: e.message }));

    expect(result.error).toContain('not found');
  });

  it('emits realtime events for execution lifecycle', async () => {
    const events = [];
    const handler = (data) => events.push(data);
    realtimeTracker.subscribe('queued', handler);
    realtimeTracker.subscribe('processing', handler);
    realtimeTracker.subscribe('completed', handler);

    const mockApp = {
      execute: vi.fn().mockResolvedValue({ success: true })
    };
    AppRegistry.register('event-app', mockApp);

    await aiOSExecutionLoop({
      appId: 'event-app',
      input: { test: 'data' }
    });

    expect(events.some(e => e.type === 'queued')).toBe(true);
    expect(events.some(e => e.type === 'processing')).toBe(true);
    expect(events.some(e => e.type === 'completed')).toBe(true);
  });

  it('supports concurrent app execution', async () => {
    const mockApp = {
      execute: vi.fn().mockResolvedValue({ success: true })
    };
    AppRegistry.register('app1', { ...mockApp });
    AppRegistry.register('app2', { ...mockApp });
    AppRegistry.register('app3', { ...mockApp });

    const results = await Promise.all([
      aiOSExecutionLoop({ appId: 'app1', input: { id: 1 } }),
      aiOSExecutionLoop({ appId: 'app2', input: { id: 2 } }),
      aiOSExecutionLoop({ appId: 'app3', input: { id: 3 } })
    ]);

    expect(results.length).toBe(3);
    results.forEach(r => {
      expect(r.status).toBe('completed');
    });
  });
});