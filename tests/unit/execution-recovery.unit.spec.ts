import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionRecovery } from '../../src/lib/execution-recovery.js';
import { ExecutionStates } from '../../src/lib/execution-state-machine.js';

describe('ExecutionRecovery', () => {
  let recovery;
  let mockPersistence;

  beforeEach(() => {
    mockPersistence = {
      saveExecution: vi.fn(),
      loadExecution: vi.fn(),
      clearExecution: vi.fn()
    };
    recovery = new ExecutionRecovery({ persistence: mockPersistence });
  });

  describe('Snapshot Creation', () => {
    it('should create snapshot with execution data', async () => {
      const snapshot = await recovery.createSnapshot('exec-1', 'COMPLETED', { data: 'test' });
      expect(snapshot.executionId).toBe('exec-1');
      expect(snapshot.state).toBe('COMPLETED');
      expect(snapshot.timestamp).toBeDefined();
    });

    it('should save to persistence', async () => {
      await recovery.createSnapshot('exec-1', 'PROCESSING', {});
      expect(mockPersistence.saveExecution).toHaveBeenCalled();
    });
  });

  describe('Snapshot Restoration', () => {
    it('should restore snapshot from persistence', async () => {
      mockPersistence.loadExecution.mockResolvedValue({
        state: 'COMPLETED',
        data: { context: { foo: 'bar' } }
      });

      const restored = await recovery.restoreSnapshot('exec-1');
      expect(restored.executionId).toBe('exec-1');
      expect(restored.state).toBe('COMPLETED');
      expect(restored.context).toEqual({ foo: 'bar' });
    });

    it('should return null for missing snapshot', async () => {
      mockPersistence.loadExecution.mockResolvedValue(null);
      const restored = await recovery.restoreSnapshot('missing');
      expect(restored).toBeNull();
    });
  });

  describe('Checkpoint Detection', () => {
    it('should identify checkpoint states', () => {
      expect(recovery.isCheckpoint(ExecutionStates.QUEUED)).toBe(true);
      expect(recovery.isCheckpoint(ExecutionStates.PROCESSING)).toBe(true);
      expect(recovery.isCheckpoint(ExecutionStates.COMPLETED)).toBe(true);
    });

    it('should not identify non-checkpoint states', () => {
      expect(recovery.isCheckpoint(ExecutionStates.PENDING)).toBe(false);
      expect(recovery.isCheckpoint(ExecutionStates.FAILED)).toBe(false);
    });
  });

  describe('Execution Replay', () => {
    it('should replay execution from snapshot', async () => {
      mockPersistence.loadExecution.mockResolvedValue({
        state: 'COMPLETED',
        data: { context: {} }
      });

      const result = await recovery.replayExecution('exec-1');
      expect(result.restored).toBe(true);
      expect(result.state).toBe('COMPLETED');
    });

    it('should prevent invalid state transitions', async () => {
      mockPersistence.loadExecution.mockResolvedValue({
        state: 'FAILED',
        data: { context: {} }
      });

      const result = await recovery.replayExecution('exec-1', 'COMPLETED');
      expect(result.restored).toBe(false);
      expect(result.reason).toContain('Cannot replay');
    });
  });
});