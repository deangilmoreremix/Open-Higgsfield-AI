import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kernel } from '../../src/kernel/kernel.js';
import { EventBus } from '../../src/kernel/eventBus.js';
import { ExecutionScheduler } from '../../src/kernel/executionScheduler.js';
import { SnapshotEngine } from '../../src/kernel/snapshotEngine.js';
import { ReplayEngine } from '../../src/kernel/replayEngine.js';

describe('Kernel Layer', () => {
  let kernel;
  let eventBus;
  let scheduler;
  let snapshots;
  let replay;

  beforeEach(() => {
    eventBus = new EventBus();
    scheduler = new ExecutionScheduler();
    snapshots = new SnapshotEngine();
    replay = new ReplayEngine({ eventBus });
    kernel = new Kernel();
    kernel.eventBus = eventBus;
    kernel.scheduler = scheduler;
    kernel.snapshots = snapshots;
    kernel.replay = replay;
  });

  afterEach(() => {
    kernel.stop();
    eventBus.clear();
  });

  describe('EventBus', () => {
    it('should publish and subscribe to events', () => {
      const events = [];
      eventBus.subscribe('test:event', (e) => events.push(e));

      eventBus.publish({ type: 'test:event', payload: { data: 1 } });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('test:event');
      expect(events[0].payload.data).toBe(1);
    });

    it('should log all events', () => {
      eventBus.publish({ type: 'event:1', executionId: 'exec-1' });
      eventBus.publish({ type: 'event:2', executionId: 'exec-1' });

      const events = eventBus.getEvents('exec-1');
      expect(events).toHaveLength(2);
    });
  });

  describe('ExecutionScheduler', () => {
    it('should add and queue tasks', () => {
      scheduler.add({ id: 'task-1', executionId: 'exec-1', type: 'test' });

      const task = scheduler.nextRunnable();
      expect(task).toBeDefined();
      expect(task.id).toBe('task-1');
    });

    it('should respect concurrency limits', () => {
      scheduler.concurrency = 2;
      scheduler.add({ id: 't1', executionId: 'e1', type: 'test' });
      scheduler.add({ id: 't2', executionId: 'e1', type: 'test' });
      scheduler.add({ id: 't3', executionId: 'e1', type: 'test' });

      const running = [scheduler.nextRunnable(), scheduler.nextRunnable()];
      expect(running.filter(Boolean)).toHaveLength(2);
    });

    it('should complete and fail tasks', () => {
      scheduler.add({ id: 'task-1', executionId: 'exec-1', type: 'test' });
      const task = scheduler.nextRunnable();

      scheduler.complete('task-1');
      expect(scheduler.completed.has('task-1')).toBe(true);
    });
  });

  describe('SnapshotEngine', () => {
    it('should save and load snapshots', () => {
      const state = { queue: [], running: [] };
      snapshots.save('exec-1', state);

      const loaded = snapshots.load('exec-1');
      expect(loaded).toEqual(state);
    });

    it('should return null for missing snapshots', () => {
      expect(snapshots.load('nonexistent')).toBeNull();
    });
  });

  describe('ReplayEngine', () => {
    it('should rebuild execution state from events', () => {
      const localEventBus = new EventBus();
      const localReplay = new ReplayEngine({ eventBus: localEventBus });

      localEventBus.publish({ type: 'task:start', taskId: 'task-1', executionId: 'exec-1' });
      localEventBus.publish({ type: 'task:complete', taskId: 'task-1', executionId: 'exec-1', result: { data: 1 } });

      const events = localEventBus.getEvents('exec-1');
      expect(events).toHaveLength(2);

      const state = localReplay.rebuild('exec-1');
      expect(state.events).toHaveLength(2);
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].status).toBe('completed');
    });
  });

  describe('Kernel', () => {
    it('should register tasks', () => {
      kernel.registerTask({ id: 'task-1', executionId: 'exec-1', type: 'test' });

      expect(kernel.scheduler.getTask('task-1')).toBeDefined();
    });

    it('should register handlers', () => {
      kernel.registerHandler('test', async () => ({ success: true }));

      expect(kernel.runtime.handlers.get('test')).toBeDefined();
    });

    it('should execute tasks through the kernel', async () => {
      kernel.registerHandler('test', async (task) => ({ processed: true }));
      kernel.registerTask({ id: 'task-1', executionId: 'exec-1', type: 'test' });

      const result = await kernel.tick();

      expect(result.task.id).toBe('task-1');
      expect(result.result).toEqual({ processed: true });
    });

    it('should save snapshots after execution', async () => {
      kernel.registerHandler('test', async () => ({ data: 1 }));
      kernel.registerTask({ id: 'task-1', executionId: 'exec-1', type: 'test' });

      await kernel.tick();

      expect(kernel.snapshots.has('exec-1')).toBe(true);
    });

    it('should recover from snapshot', async () => {
      const state = { queue: [{ id: 'recovered' }], completed: [] };
      kernel.snapshots.save('exec-1', state);

      const recovery = await kernel.recover('exec-1');

      expect(recovery.snapshot.state).toEqual(state);
    });
  });
});