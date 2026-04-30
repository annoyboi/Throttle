const { app, BrowserWindow, Tray, Menu, ipcMain, shell, nativeImage } = require('electron');
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
  try {
    let icon = nativeImage.createEmpty();
    const iconPath = path.join(__dirname, 'public', 'tray.png');
    if (fs.existsSync(iconPath)) icon = iconPath;
    tray = new Tray(icon);
    const menu = Menu.buildFromTemplate([
      { label: 'Open Throttle', click: () => mainWindow.show() },
      { type: 'separator' },
      { label: 'Quit', click: () => { app.quit(); process.exit(0); } },
    ]);
    tray.setContextMenu(menu);
    tray.setToolTip('Throttle — RL Companion');
    tray.on('double-click', () => mainWindow.show());
  } catch (e) {
    console.log('Tray creation failed (non-fatal):', e.message);
  }
}

function detectRLMode() {
  const { execSync } = require('child_process');
  try {
    const procs = execSync('tasklist /FO CSV /NH', { encoding: 'utf8' }).toLowerCase();
    const rlRunning = procs.includes('rocketleague');
    const eacRunning = procs.includes('easyanticheat_eos') || procs.includes('easyanticheat');
    const newMode = rlRunning && eacRunning;
    if (newMode !== isOnlineMode) {
      isOnlineMode = newMode;
      mainWindow?.webContents.send('mode-change', { online: isOnlineMode });
    }
  } catch (e) {}
}

// Fix: correct config filename is TAStatsAPI.ini, located in OneDrive
function configureStatsAPI() {
  const os = require('os');
  const possiblePaths = [
    path.join(os.homedir(), 'OneDrive', 'Documents', 'My Games', 'Rocket League', 'TAGame', 'Config', 'TAStatsAPI.ini'),
    path.join(os.homedir(), 'OneDrive', 'Documents', 'Other', 'My Games', 'Rocket League', 'TAGame', 'Config', 'TAStatsAPI.ini'),
    path.join(os.homedir(), 'Documents', 'My Games', 'Rocket League', 'TAGame', 'Config', 'TAStatsAPI.ini'),
    path.join(process.env.LOCALAPPDATA || '', 'Rocket League', 'TAGame', 'Config', 'TAStatsAPI.ini'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log('Found StatsAPI config at:', p);
      fs.writeFileSync(p, '[StatsAPI]\nPacketSendRate=30\nPort=49123\n');
      return true;
    }
  }
  console.log('StatsAPI config not found in any path');
  return false;
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  statsAPI = new StatsAPI();
  statsAPI.on('event', (data) => {
    mainWindow?.webContents.send('stats-event', data);
  });
  statsAPI.start();

  replayWatcher = new ReplayWatcher();
  replayWatcher.on('new-replay', (filePath) => {
    mainWindow?.webContents.send('new-replay', { path: filePath });
  });
  replayWatcher.start();

  setTimeout(detectRLMode, 2000);
  setInterval(detectRLMode, 5000);
});

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
