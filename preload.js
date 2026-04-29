const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('throttle', {
  getMode: () => ipcRenderer.invoke('get-mode'),
  configureStatsAPI: () => ipcRenderer.invoke('configure-statsapi'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  minimize: () => ipcRenderer.invoke('minimize'),
  maximize: () => ipcRenderer.invoke('maximize'),
  close: () => ipcRenderer.invoke('close'),
  uploadReplay: (args) => ipcRenderer.invoke('upload-replay', args),
  saveSettings: (s) => ipcRenderer.invoke('save-settings', s),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  onStatsEvent: (cb) => ipcRenderer.on('stats-event', (_, d) => cb(d)),
  onNewReplay: (cb) => ipcRenderer.on('new-replay', (_, d) => cb(d)),
  onModeChange: (cb) => ipcRenderer.on('mode-change', (_, d) => cb(d)),
});
