const chokidar = require('chokidar');
const path = require('path');
const os = require('os');
const fs = require('fs');
const EventEmitter = require('events');

class ReplayWatcher extends EventEmitter {
  constructor() {
    super();
    this.watcher = null;
    // Search all possible locations including OneDrive variants
    this.replayPaths = [
      path.join(os.homedir(), 'OneDrive', 'Documents', 'My Games', 'Rocket League', 'TAGame', 'DemosEpic'),
      path.join(os.homedir(), 'OneDrive', 'Documents', 'Other', 'My Games', 'Rocket League', 'TAGame', 'DemosEpic'),
      path.join(os.homedir(), 'OneDrive', 'Documents', 'My Games', 'Rocket League', 'TAGame', 'Demos'),
      path.join(os.homedir(), 'Documents', 'My Games', 'Rocket League', 'TAGame', 'DemosEpic'),
      path.join(os.homedir(), 'Documents', 'My Games', 'Rocket League', 'TAGame', 'Demos'),
      path.join(process.env.LOCALAPPDATA || '', 'Rocket League', 'TAGame', 'DemosEpic'),
    ];
  }

  start() {
    const validPaths = this.replayPaths.filter(p => {
      try { fs.accessSync(p); return true; } catch { return false; }
    });

    if (validPaths.length === 0) {
      console.log('No replay folders found');
      return;
    }

    console.log('Watching replay folders:', validPaths);

    this.watcher = chokidar.watch(validPaths, {
      persistent: true,
      ignoreInitial: true,
      usePolling: true,        // polling works better with OneDrive
      interval: 2000,
      awaitWriteFinish: { stabilityThreshold: 3000, pollInterval: 1000 },
    });

    this.watcher.on('add', (filePath) => {
      console.log('File added:', filePath);
      if (filePath.endsWith('.replay')) {
        console.log('New replay detected:', filePath);
        this.emit('new-replay', filePath);
      }
    });

    this.watcher.on('error', (err) => console.log('Watcher error:', err));
  }

  stop() {
    this.watcher?.close();
  }
}

module.exports = ReplayWatcher;
