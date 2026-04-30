const net = require('net');
const EventEmitter = require('events');

class StatsAPI extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.buffer = '';
    this.connected = false;
    this.reconnectTimer = null;
  }

  start() {
    this.connect();
  }

  connect() {
    this.client = new net.Socket();
    this.client.connect(49123, '127.0.0.1', () => {
      this.connected = true;
      this.emit('event', { type: 'connected' });
    });

    this.client.on('data', (data) => {
      this.buffer += data.toString();
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          this.emit('event', parsed);
        } catch (e) {}
      }
    });

    this.client.on('close', () => {
      this.connected = false;
      this.emit('event', { type: 'disconnected' });
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    });

    this.client.on('error', () => {
      this.client.destroy();
    });
  }

  stop() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.client?.destroy();
  }
}

module.exports = StatsAPI;
