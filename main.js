const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const StatsAPI = require('./statsapi');
const ReplayWatcher = require('./replayWatcher');

let mainWindow;
let tray;
let statsAPI;
let replayWatcher;
let isOnlineMode = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 550,
    frame: false,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'public', 'icon.ico'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'public', 'tray.png');
  tray = new Tray(iconPath);
  const menu = Menu.buildFromTemplate([
    { label: 'Open Throttle', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); process.exit(0); } },
  ]);
  tray.setContextMenu(menu);
  tray.setToolTip('Throttle — RL Companion');
  tray.on('double-click', () => mainWindow.show());
}

// Detect whether RL launched with EAC on or off
function detectRLMode() {
  // Check for EAC process running alongside RL
  const { execSync } = require('child_process');
  try {
    const procs = execSync('tasklist', { encoding: 'utf8' });
    const eacRunning = procs.toLowerCase().includes('easyanticheat');
    const rlRunning = procs.toLowerCase().includes('rocketleague');
    if (rlRunning) {
      isOnlineMode = eacRunning;
      mainWindow?.webContents.send('mode-change', { online: isOnlineMode });
    }
  } catch (e) {}
}

// Auto-configure StatsAPI ini file
function configureStatsAPI() {
  const possiblePaths = [
    path.join(process.env.LOCALAPPDATA || '', 'Rocket League', 'TAGame', 'Config', 'DefaultStatsAPI.ini'),
    path.join('C:', 'Program Files', 'Epic Games', 'rocketleague', 'TAGame', 'Config', 'DefaultStatsAPI.ini'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      fs.writeFileSync(p, '[StatsAPI]\nPacketSendRate=30\nPort=49123\n');
      return true;
    }
  }
  return false;
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Start StatsAPI listener
  statsAPI = new StatsAPI();
  statsAPI.on('event', (data) => {
    mainWindow?.webContents.send('stats-event', data);
  });
  statsAPI.start();

  // Start replay watcher
  replayWatcher = new ReplayWatcher();
  replayWatcher.on('new-replay', (filePath) => {
    mainWindow?.webContents.send('new-replay', { path: filePath });
  });
  replayWatcher.start();

  // Poll for RL mode every 5s
  setInterval(detectRLMode, 5000);
});

// IPC handlers
ipcMain.handle('get-mode', () => ({ online: isOnlineMode }));
ipcMain.handle('configure-statsapi', () => configureStatsAPI());
ipcMain.handle('open-external', (_, url) => shell.openExternal(url));
ipcMain.handle('minimize', () => mainWindow?.minimize());
ipcMain.handle('maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle('close', () => mainWindow?.hide());

ipcMain.handle('upload-replay', async (_, { filePath, apiKey }) => {
  const axios = require('axios');
  const formData = new (require('form-data'))();
  formData.append('file', fs.createReadStream(filePath));
  try {
    const res = await axios.post('https://ballchasing.com/api/v2/upload', formData, {
      headers: { ...formData.getHeaders(), Authorization: apiKey },
    });
    return { success: true, id: res.data.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('save-settings', (_, settings) => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
});

ipcMain.handle('load-settings', () => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  }
  return {};
});

app.on('window-all-closed', (e) => e.preventDefault());
