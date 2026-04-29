const chokidar = require('chokidar');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');

class ReplayWatcher extends EventEmitter {
  constructor() {
    super();
    this.watcher = null;
    // Default RL replay folder locations
    this.replayPaths = [
      path.join(os.homedir(), 'Documents', 'My Games', 'Rocket League', 'TAGame', 'Demos'),
      path.join(process.env.LOCALAPPDATA || '', 'Rocket League', 'TAGame', 'Demos'),
    ];
  }

  start() {
    const validPaths = this.replayPaths.filter(p => {
      try { require('fs').accessSync(p); return true; } catch { return false; }
    });

    if (validPaths.length === 0) return;

    this.watcher = chokidar.watch(validPaths, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 500 },
    });

    this.watcher.on('add', (filePath) => {
      if (filePath.endsWith('.replay')) {
        this.emit('new-replay', filePath);
      }
    });
  }

  stop() {
    this.watcher?.close();
  }
}

module.exports = ReplayWatcher;
