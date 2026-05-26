import { executionPersistence } from './execution-persistence.js';
import { ExecutionStates } from './execution-state-machine.js';

class ExecutionRecovery {
  constructor(options = {}) {
    this.persistence = options.persistence || executionPersistence;
    this.snapshotInterval = options.snapshotInterval || 10000;
  }

  async createSnapshot(executionId, state, context = {}) {
    const snapshot = {
      executionId,
      state,
      context,
      timestamp: Date.now(),
      checkpoint: this.isCheckpoint(state)
    };

    await this.persistence.saveExecution(executionId, state, snapshot);
    return snapshot;
  }

  async restoreSnapshot(executionId) {
    const snapshot = await this.persistence.loadExecution(executionId);
    if (!snapshot) return null;

    return {
      executionId,
      state: snapshot.state,
      context: snapshot.data?.context || {},
      restoredAt: Date.now()
    };
  }

  isCheckpoint(state) {
    return state === ExecutionStates.PROCESSING || 
           state === ExecutionStates.QUEUED ||
           state === ExecutionStates.COMPLETED;
  }

  async replayExecution(executionId, targetState = null) {
    const snapshot = await this.restoreSnapshot(executionId);
    if (!snapshot) return null;

    const { state, context } = snapshot;
    
    if (targetState && targetState !== state) {
      return {
        executionId,
        restored: false,
        reason: `Cannot replay from ${state} to ${targetState}`
      };
    }

    return {
      executionId,
      restored: true,
      state,
      context
    };
  }

  async listSnapshots(filter = {}) {
    try {
      const response = await fetch('/api/executions/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter)
      });
      return response.ok ? await response.json() : [];
    } catch (error) {
      return [];
    }
  }

  async deleteSnapshot(executionId) {
    await this.persistence.clearExecution(executionId);
    try {
      await fetch(`/api/executions/delete/${executionId}`, { method: 'DELETE' });
    } catch (error) {
      // ignore
    }
  }
}

const executionRecovery = new ExecutionRecovery();

export { ExecutionRecovery, executionRecovery };