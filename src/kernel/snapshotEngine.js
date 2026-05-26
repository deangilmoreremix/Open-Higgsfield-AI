class SnapshotEngine {
  constructor() {
    this.snapshots = new Map();
  }

  async create({ executionId, graph, context }) {
    const snapshot = {
      executionId,
      graph,
      context,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.snapshots.set(executionId, snapshot);
    return snapshot;
  }

  async complete(executionId, result) {
    const snap = this.snapshots.get(executionId);
    if (snap) {
      snap.result = result;
      snap.status = 'completed';
      snap.completedAt = Date.now();
    }
  }

  async fail(executionId, error) {
    const snap = this.snapshots.get(executionId);
    if (snap) {
      snap.error = error;
      snap.status = 'failed';
      snap.failedAt = Date.now();
    }
  }

  save(executionId, state) {
    this.snapshots.set(executionId, {
      timestamp: Date.now(),
      state,
    });
  }

  load(executionId) {
    const snapshot = this.snapshots.get(executionId);
    if (!snapshot) return null;

    if (Date.now() - snapshot.timestamp > this.maxAge) {
      this.snapshots.delete(executionId);
      return null;
    }

    return snapshot.state || snapshot;
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

const snapshotEngine = new SnapshotEngine();

export { SnapshotEngine, snapshotEngine };