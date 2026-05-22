import { describe, it, expect } from 'vitest';

describe('RuntimeAdapterBase', () => {
  it('should have all required methods from the runtime contract', async () => {
    const mod = await import('../../src/lib/runtime/RuntimeAdapterBase.js');
    const RuntimeAdapterBase = mod.default || mod.RuntimeAdapterBase;
    expect(RuntimeAdapterBase).toBeDefined();
    expect(typeof RuntimeAdapterBase).toBe('function');

    const instance = new RuntimeAdapterBase();
    const requiredMethods = [
      'execute',
      'pause',
      'resume',
      'cancel',
      'recover',
      'serialize',
      'deserialize',
      'subscribe',
      'unsubscribe',
      'getExecutionState'
    ];
    requiredMethods.forEach((method) => {
      expect(typeof instance[method]).toBe('function');
    });
  });
});
