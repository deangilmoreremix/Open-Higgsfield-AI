class RealtimeBus {
  constructor() {
    this.listeners = new Map();
    this.connection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(url) {
    if (this.connection) return this.connection;

    this.connection = new WebSocket(url);
    this.connection.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('connected');
    };
    this.connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };
    this.connection.onclose = () => {
      this.emit('disconnected');
      this.attemptReconnect();
    };
    this.connection.onerror = (error) => {
      this.emit('error', error);
    };

    return this.connection;
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect(this.connection?.url);
    }, Math.pow(2, this.reconnectAttempts) * 1000);
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    
    return () => this.unsubscribe(eventType, callback);
  }

  unsubscribe(eventType, callback) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(eventType, payload) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(payload));
    }
  }

  send(type, payload) {
    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
      this.connection.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    this.listeners.clear();
  }
}

const realtimeBus = new RealtimeBus();

export { RealtimeBus };
export default realtimeBus;