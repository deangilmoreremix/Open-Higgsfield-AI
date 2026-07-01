import { aiOSExecutionLoop } from './ai-os-execution-loop.js';

export async function execute(appId, input, context) {
  return aiOSExecutionLoop({
    appId,
    input,
    context
  });
}