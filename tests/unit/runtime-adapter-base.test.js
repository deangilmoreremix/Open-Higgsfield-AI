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

  it('should freeze the hard stack lock and throw on execute', async () => {
    const mod = await import('../../src/lib/runtime/RuntimeAdapterBase.js');
    const RuntimeAdapterBase = mod.default || mod.RuntimeAdapterBase;
    const instance = new RuntimeAdapterBase();

    expect(instance.stack).toEqual({ llm: 'openai', generation: 'muapi', storage: 'supabase' });
    expect(Object.isFrozen(instance.stack)).toBe(true);

    await expect(instance.execute()).rejects.toThrow('Must implement in subclass');
  });
});
