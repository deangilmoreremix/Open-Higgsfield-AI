import { ExecutionStates } from './execution-state-machine.js';
import { isSupabaseConfigured } from './supabase.js';

class ExecutionPersistence {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'higgsfield_execution_state';
    this.snapshotInterval = options.snapshotInterval || 5000;
  }

  async saveExecution(executionId, state, data) {
    if (!isSupabaseConfigured()) {
      localStorage.setItem(`${this.storageKey}_${executionId}`, JSON.stringify({ state, data, timestamp: Date.now() }));
      return { success: true, method: 'localStorage' };
    }

    try {
      const response = await fetch('/api/executions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId, state, data, timestamp: Date.now() })
      });

      if (!response.ok) throw new Error('Failed to save');
      return { success: true, method: 'supabase' };
    } catch (error) {
      localStorage.setItem(`${this.storageKey}_${executionId}`, JSON.stringify({ state, data, timestamp: Date.now() }));
      return { success: true, method: 'localStorage', fallback: true };
    }
  }

  async loadExecution(executionId) {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(`${this.storageKey}_${executionId}`);
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const response = await fetch(`/api/executions/load/${executionId}`);
      if (!response.ok) throw new Error('Failed to load');
      return await response.json();
    } catch (error) {
      const stored = localStorage.getItem(`${this.storageKey}_${executionId}`);
      return stored ? JSON.parse(stored) : null;
    }
  }

  async saveSnapshot(workflowId, graph, position) {
    const snapshot = {
      workflowId,
      graph,
      position,
      timestamp: Date.now()
    };

    if (!isSupabaseConfigured()) {
      localStorage.setItem(`${this.storageKey}_snapshot_${workflowId}`, JSON.stringify(snapshot));
      return { success: true };
    }

    try {
      const response = await fetch('/api/snapshots/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot)
      });
      return response.ok ? { success: true } : { success: false };
    } catch (error) {
      localStorage.setItem(`${this.storageKey}_snapshot_${workflowId}`, JSON.stringify(snapshot));
      return { success: true, fallback: true };
    }
  }

  async loadSnapshot(workflowId) {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(`${this.storageKey}_snapshot_${workflowId}`);
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const response = await fetch(`/api/snapshots/load/${workflowId}`);
      return response.ok ? await response.json() : null;
    } catch (error) {
      const stored = localStorage.getItem(`${this.storageKey}_snapshot_${workflowId}`);
      return stored ? JSON.parse(stored) : null;
    }
  }

  async clearExecution(executionId) {
    localStorage.removeItem(`${this.storageKey}_${executionId}`);
    try {
      await fetch(`/api/executions/delete/${executionId}`, { method: 'DELETE' });
    } catch (error) {
      // ignore
    }
  }
}

const executionPersistence = new ExecutionPersistence();

export { ExecutionPersistence, executionPersistence };