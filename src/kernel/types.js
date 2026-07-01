export class ExecutionTask {
  constructor(config) {
    this.id = config.id || crypto.randomUUID();
    this.executionId = config.executionId;
    this.type = config.type;
    this.priority = config.priority || 1;
    this.dependencies = config.dependencies || [];
    this.payload = config.payload || {};
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
    this.handler = config.handler;
    this.timestamp = Date.now();
  }
}

export class ExecutionEvent {
  constructor(config) {
    this.id = config.id || crypto.randomUUID();
    this.type = config.type;
    this.executionId = config.executionId;
    this.taskId = config.taskId;
    this.timestamp = config.timestamp || Date.now();
    this.payload = config.payload || {};
  }
}

export class Snapshot {
  constructor(config) {
    this.executionId = config.executionId;
    this.timestamp = config.timestamp || Date.now();
    this.state = config.state;
  }
}