export class ChaosInjector {
  constructor(kernel) {
    this.kernel = kernel;
  }

  killSchedulerMidRun(ms = 50) {
    setTimeout(() => {
      this.kernel.stop();
    }, ms);
  }

  dropEventBusMessages(eventBus, probability = 0.3) {
    const original = eventBus.publish.bind(eventBus);

    eventBus.publish = (event) => {
      if (Math.random() < probability) {
        return null;
      }
      return original(event);
    };

    return () => {
      eventBus.publish = original;
    };
  }

  injectRandomFailures(scheduler, probability = 0.2) {
    const originalNext = scheduler.nextRunnable.bind(scheduler);

    scheduler.nextRunnable = () => {
      const task = originalNext();
      if (!task) return null;

      if (Math.random() < probability) {
        scheduler.fail(task.id);
        return null;
      }

      return task;
    };
  }

  simulateNetworkPartition(kernel, duration = 100) {
    const original = kernel.eventBus.publish;

    kernel.eventBus.publish = () => null;

    setTimeout(() => {
      kernel.eventBus.publish = original;
    }, duration);
  }

  injectMemoryPressure() {
    const largeArray = new Array(1000000).fill('x');
    return () => {
      largeArray.length = 0;
    };
  }
}