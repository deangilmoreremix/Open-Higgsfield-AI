import { ExecutionStates } from './execution-state-machine.js';
import { JobQueue } from './queue.js';

class FailureRecoverySystem {
  constructor(options = {}) {
    this.queue = options.queue || new JobQueue();
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.recoveryStrategies = new Map();
    this.defaultStrategy = this.defaultStrategy.bind(this);
  }

  classifyFailure(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('timeout') || message.includes('expired')) {
      return 'timeout';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('api_key')) {
      return 'auth';
    }
    if (message.includes('rate') || message.includes('limit') || message.includes('429')) {
      return 'rate_limit';
    }
    if (message.includes('quota')) {
      return 'quota';
    }
    return 'unknown';
  }

  registerRecoveryStrategy(failureType, strategy) {
    this.recoveryStrategies.set(failureType, strategy);
  }

  async recoverJob(jobId, error) {
    const failureType = this.classifyFailure(error);
    const strategy = this.recoveryStrategies.get(failureType) || this.defaultStrategy;
    
    return strategy.call(this, jobId, error);
  }

  async defaultStrategy(jobId, error) {
    const job = this.queue.get(jobId);
    if (!job) return { recovered: false, reason: 'Job not found' };

    const delay = this.baseDelay * Math.pow(2, job.attempts);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return { 
      recovered: true, 
      reason: 'Retry scheduled',
      delay 
    };
  }

  async networkStrategy(jobId, error) {
    const delay = this.baseDelay * 5;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { recovered: true, reason: 'Network retry', delay };
  }

  async authStrategy(jobId, error) {
    return { 
      recovered: false, 
      reason: 'Authentication required - manual intervention needed',
      requiresAuth: true 
    };
  }

  async rateLimitStrategy(jobId, error) {
    const delay = this.baseDelay * 30;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { recovered: true, reason: 'Rate limit wait', delay };
  }

  async quotaStrategy(jobId, error) {
    return { 
      recovered: false, 
      reason: 'Quota exceeded - manual intervention needed',
      requiresUpgrade: true 
    };
  }

  async recoverFromFailure(jobId, error) {
    const job = this.queue.get(jobId);
    if (!job) return { recovered: false, reason: 'Job not found' };

    job.error = error.message;
    job.attempts++;

    if (job.attempts < this.maxRetries) {
      return await this.recoverJob(jobId, error);
    }

    return { recovered: false, reason: 'Max retries exceeded' };
  }

  async requeueFailedJobs(filterFn) {
    const requeued = [];
    for (const [jobId, job] of this.queue.jobs) {
      if (job.status === ExecutionStates.FAILED && filterFn(job)) {
        const newJobId = await this.queue.add({
          type: job.task?.type || 'retry',
          payload: job.payload,
          priority: job.priority || 5
        });
        requeued.push({ originalId: jobId, newId: newJobId });
      }
    }
    return requeued;
  }
}

const recoverySystem = new FailureRecoverySystem();

export { FailureRecoverySystem, recoverySystem };