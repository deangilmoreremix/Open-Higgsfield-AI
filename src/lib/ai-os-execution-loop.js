import { runAppById } from './runAppById.js';
import { realtimeTracker } from './realtime-execution-tracker.js';
import { recoverySystem } from './failure-recovery.js';
import { AppRegistry } from './appRegistry.js';

const recovery = recoverySystem;

export async function aiOSExecutionLoop({
  appId,
  input,
  context = {},
  options = {}
}) {
  const executionId = `${appId}-${Date.now()}`;

  realtimeTracker.emit('queued', { executionId, appId });

  try {
    const app = AppRegistry.get(appId);

    if (!app) {
      throw new Error(`App not found in runtime: ${appId}`);
    }

    realtimeTracker.emit('processing', { executionId });

    const result = await app.execute(input, {
      executionId,
      context
    });

    realtimeTracker.emit('completed', {
      executionId,
      result
    });

    return {
      executionId,
      status: 'completed',
      result
    };
  } catch (error) {
    realtimeTracker.emit('failed', {
      executionId,
      error: error.message
    });

    const recoveryResult = await recovery.recoverJob?.(executionId, error).catch(() => null);

    if (recoveryResult?.recovered) {
      realtimeTracker.emit('recovered', { executionId });

      const replay = await runAppById(appId, input, {
        replay: true
      });

      return {
        executionId,
        status: 'recovered',
        result: replay
      };
    }

    throw error;
  }
}