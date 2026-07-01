import { eventBus } from './eventBus.js';

export class ExecutionKernel {
  constructor({ scheduler, eventBus, snapshotManager, replayEngine }) {
    this.scheduler = scheduler;
    this.eventBus = eventBus || eventBus;
    this.snapshotManager = snapshotManager;
    this.replayEngine = replayEngine;
  }

  async execute(graph, context = {}) {
    const executionId = graph.id || crypto.randomUUID();

    this.eventBus.publish({
      type: 'kernel:execution:start',
      executionId,
      graphId: graph.id,
    });

    const snapshot = await this.snapshotManager.create({
      executionId,
      graph,
      context,
    });

    try {
      const result = await this.scheduler.schedule({
        executionId,
        graph,
        context,
        kernel: this,
      });

      await this.snapshotManager.complete(executionId, result);

      this.eventBus.publish({
        type: 'kernel:execution:complete',
        executionId,
        result,
      });

      return result;
    } catch (error) {
      await this.snapshotManager.fail(executionId, error);

      this.eventBus.publish({
        type: 'kernel:execution:failed',
        executionId,
        error,
      });

      throw error;
    }
  }
}