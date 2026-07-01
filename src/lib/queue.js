const QUEUE_STATE = {
  jobs: new Map(),
  waiting: [],
  active: [],
  completed: [],
  failed: []
};

const MAX_CONCURRENT = 3;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000;

class JobQueue {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || MAX_CONCURRENT;
    this.retryAttempts = options.retryAttempts || RETRY_ATTEMPTS;
    this.retryDelay = options.retryDelay || RETRY_DELAY;
    this.jobs = new Map();
    this.waiting = [];
    this.active = [];
    this.failed = [];
  }

  add(job) {
    const jobId = job.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const jobEntry = {
      id: jobId,
      task: job.task,
      payload: job.payload,
      attempts: 0,
      status: 'waiting',
      priority: job.priority || 5,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };
    this.jobs.set(jobId, jobEntry);
    this.waiting.push(jobId);
    this.process();
    return jobId;
  }

  async process() {
    if (this.active.length >= this.maxConcurrent) return;
    if (this.waiting.length === 0) return;

    const jobId = this.waiting.shift();
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'active';
    this.active.push(jobId);

    try {
      job.startedAt = new Date();
      const result = await job.task(job.payload);
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      this.active = this.active.filter(id => id !== jobId);
      this.completed.push(jobId);
      this.emit('completed', { jobId, result });
    } catch (error) {
      job.attempts++;
      job.error = error.message;
      
      if (job.attempts < this.retryAttempts) {
        job.status = 'waiting';
        this.waiting.unshift(jobId);
        setTimeout(() => this.process(), this.retryDelay);
        this.emit('retry', { jobId, attempt: job.attempts, error: error.message });
      } else {
        job.status = 'failed';
        this.active = this.active.filter(id => id !== jobId);
        this.failed.push(jobId);
        this.emit('failed', { jobId, error: error.message });
      }
    } finally {
      if (job.status === 'completed') {
        setTimeout(() => this.cleanup(jobId), 60000);
      }
      this.process();
    }
  }

  get(jobId) {
    return this.jobs.get(jobId);
  }

  getStatus(jobId) {
    const job = this.jobs.get(jobId);
    return job ? job.status : 'not_found';
  }

  async getResult(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    if (job.status === 'waiting') {
      return new Promise((resolve, reject) => {
        const check = () => {
          const j = this.jobs.get(jobId);
          if (j.status === 'completed') resolve(j.result);
          else if (j.status === 'failed') reject(new Error(j.error));
          else setTimeout(check, 500);
        };
        check();
      });
    }
    if (job.status === 'completed') return job.result;
    if (job.status === 'failed') throw new Error(job.error);
    throw new Error(`Job ${jobId} is still processing`);
  }

  cleanup(jobId) {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'completed') {
      this.completed = this.completed.filter(id => id !== jobId);
      this.jobs.delete(jobId);
    }
  }

  emit(event, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`queue:${event}`, { detail: data }));
    }
  }
}

const defaultQueue = new JobQueue();

export { JobQueue, defaultQueue };
export default defaultQueue;