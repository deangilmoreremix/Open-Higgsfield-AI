export function validateExecutionState(kernel, executionId) {
  const snapshot = kernel.snapshots.load(executionId);

  if (!snapshot) return false;

  const queue = snapshot.queue;
  const running = snapshot.running;

  return (
    Array.isArray(queue) &&
    typeof running === 'object' &&
    Object.keys(running).length >= 0
  );
}

export function validateNoTaskLeaks(kernel) {
  return kernel.scheduler.running.size === 0;
}

export function validateEventConsistency(kernel, executionId) {
  const events = kernel.eventBus.getEvents(executionId);

  const starts = events.filter((e) => e.type === 'task:start').length;
  const completes = events.filter((e) => e.type === 'task:complete').length;

  return starts >= completes;
}

export function validateRecovery(kernel, executionId) {
  const snapshot = kernel.snapshots.load(executionId);
  const replay = kernel.replay.replay(executionId);

  return snapshot !== null && replay.events.length > 0;
}

export function validateDeterminism(kernel, executionId) {
  const state1 = kernel.persistence.getState(executionId);
  const state2 = kernel.replay.rebuild(executionId);

  return JSON.stringify(state1) === JSON.stringify(state2);
}