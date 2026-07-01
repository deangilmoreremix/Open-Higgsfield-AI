const DEFAULT_OPTIONS = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  factor: 2,
  jitter: true
};

class RetrySystem {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async execute(fn, key, options = {}) {
    const config = { ...this.options, ...options };
    const context = { key: key || 'default', attempts: 0, errors: [] };
    
    while (context.attempts < config.maxRetries) {
      context.attempts++;
      try {
        const result = await fn(context.attempts);
        this.emit('success', { ...context, result });
        return result;
      } catch (error) {
        context.errors.push({ attempt: context.attempts, error: error.message, timestamp: Date.now() });
        
        if (context.attempts >= config.maxRetries) {
          this.emit('failed', context);
          throw error;
        }
        
        const delay = this.calculateDelay(context.attempts, config);
        this.emit('retry', { ...context, delay, nextAttempt: context.attempts + 1 });
        await this.sleep(delay);
      }
    }
  }

  calculateDelay(attempt, config) {
    let delay = config.retryDelay;
    if (config.exponentialBackoff) {
      delay = config.retryDelay * Math.pow(config.factor, attempt - 1);
    }
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    return Math.min(delay, 30000);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  emit(event, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`retry:${event}`, { detail: data }));
    }
  }
}

export async function withRetry(fn, options = {}) {
  const retry = new RetrySystem(options);
  return retry.execute(fn);
}

export { RetrySystem };
export default RetrySystem;