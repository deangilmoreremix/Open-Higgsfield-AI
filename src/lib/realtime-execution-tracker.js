import { ExecutionStates } from './execution-state-machine.js';

class RealtimeExecutionTracker {
  constructor(options = {}) {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.subscribers = new Map();
    this.executionStates = new Map();
  }

  connect(url) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return this.ws;

    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: new Date().toISOString() });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        this.emit('error', { message: 'Failed to parse message', error });
      }
    };

    this.ws.onclose = () => {
      this.emit('disconnected', { timestamp: new Date().toISOString() });
      this.attemptReconnect(url);
    };

    this.ws.onerror = (error) => {
      this.emit('error', { message: 'WebSocket error', error });
    };

    return this.ws;
  }

  handleMessage(data) {
    const { type, executionId, state, payload } = data;
    
    if (executionId) {
      this.executionStates.set(executionId, {
        state,
        payload,
        timestamp: new Date().toISOString()
      });
    }

    const subscribers = this.subscribers.get(type) || [];
    subscribers.forEach(callback => callback({ type, executionId, state, payload }));
  }

  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type).push(callback);
    
    return () => {
      const list = this.subscribers.get(type) || [];
      const index = list.indexOf(callback);
      if (index > -1) list.splice(index, 1);
    };
  }

  emit(type, data) {
    const subscribers = this.subscribers.get(type) || [];
    subscribers.forEach(callback => callback({ type, ...data }));

    if (typeof window !== 'undefined') {
      const event = new CustomEvent('execution:status', { detail: { type, ...data } });
      window.dispatchEvent(event);
    }
  }

  attemptReconnect(url) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    
    setTimeout(() => {
      this.connect(url);
    }, delay);
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  getExecutionState(executionId) {
    return this.executionStates.get(executionId) || null;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    this.executionStates.clear();
  }
}

const realtimeTracker = new RealtimeExecutionTracker();

export { RealtimeExecutionTracker, realtimeTracker };