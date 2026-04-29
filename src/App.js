import React, { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Replays from './pages/Replays';
import Settings from './pages/Settings';
import styles from './App.module.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mode, setMode] = useState('offline'); // 'online' | 'offline'
  const [events, setEvents] = useState([]);
  const [replays, setReplays] = useState([]);
  const [settings, setSettings] = useState({ ballchasingKey: '', autoUpload: false });

  useEffect(() => {
    const api = window.throttle;
    if (!api) return;

    api.loadSettings().then(s => { if (s) setSettings(prev => ({ ...prev, ...s })); });
    api.getMode().then(m => setMode(m.online ? 'online' : 'offline'));
    api.onModeChange(m => setMode(m.online ? 'online' : 'offline'));

    api.onStatsEvent(e => {
      setEvents(prev => [{ ...e, ts: Date.now() }, ...prev].slice(0, 100));
    });

    api.onNewReplay(r => {
      setReplays(prev => [r, ...prev]);
      if (settings.autoUpload && settings.ballchasingKey) {
        api.uploadReplay({ filePath: r.path, apiKey: settings.ballchasingKey });
      }
    });
  }, []);

  const saveSettings = (s) => {
    setSettings(s);
    window.throttle?.saveSettings(s);
  };

  return (
    <div className={styles.app}>
      <TitleBar mode={mode} />
      <div className={styles.body}>
        <Sidebar page={page} setPage={setPage} mode={mode} />
        <main className={styles.main}>
          {page === 'dashboard' && <Dashboard events={events} mode={mode} />}
          {page === 'replays' && <Replays replays={replays} settings={settings} />}
          {page === 'settings' && <Settings settings={settings} saveSettings={saveSettings} />}
        </main>
      </div>
    </div>
  );
}
