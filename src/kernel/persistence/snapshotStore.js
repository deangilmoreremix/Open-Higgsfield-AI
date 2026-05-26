class SnapshotStore {
  constructor() {
    this.snapshots = new Map();
  }

  save(executionId, state) {
    const serializable = this.serializeState(state);
    this.snapshots.set(executionId, {
      timestamp: Date.now(),
      state: serializable,
    });
  }

  serializeState(state) {
    if (!state) return state;
    const copy = {};
    for (const [key, value] of Object.entries(state)) {
      if (typeof value === 'function') {
        copy[key] = '[Function]';
      } else if (Array.isArray(value)) {
        copy[key] = value.map((v) =>
          typeof v === 'function' ? '[Function]' : v
        );
      } else if (value && typeof value === 'object') {
        copy[key] = this.serializeState(value);
      } else {
        copy[key] = value;
      }
    }
    return copy;
  }

  load(executionId) {
    return this.snapshots.get(executionId)?.state || null;
  }

  has(executionId) {
    return this.snapshots.has(executionId);
  }

  delete(executionId) {
    this.snapshots.delete(executionId);
  }

  clear() {
    this.snapshots.clear();
  }
}

const snapshotStore = new SnapshotStore();

export { SnapshotStore, snapshotStore };