import React, { useState } from 'react';
import styles from './Settings.module.css';

export default function Settings({ settings, saveSettings }) {
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [configured, setConfigured] = useState(false);

  const save = () => {
    saveSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const configureStatsAPI = async () => {
    const ok = await window.throttle?.configureStatsAPI();
    setConfigured(ok);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>STATSAPI SETUP</div>
        <div className={styles.desc}>
          One-click setup for Psyonix's StatsAPI. This edits your RL config file so Throttle can receive live game events while EAC is on.
        </div>
        <button className={styles.actionBtn} onClick={configureStatsAPI}>
          {configured ? '✓ CONFIGURED' : 'AUTO-CONFIGURE STATSAPI'}
        </button>
        {configured && <div className={styles.hint}>Done. Restart Rocket League for it to take effect.</div>}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>BALLCHASING.COM</div>
        <div className={styles.desc}>
          Paste your ballchasing.com API key to enable replay uploads. Get one free at ballchasing.com → account settings.
        </div>
        <input
          className={styles.input}
          type="password"
          placeholder="API key..."
          value={local.ballchasingKey || ''}
          onChange={e => setLocal(l => ({ ...l, ballchasingKey: e.target.value }))}
        />
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={local.autoUpload || false}
            onChange={e => setLocal(l => ({ ...l, autoUpload: e.target.checked }))}
          />
          <span>Auto-upload replays after every match</span>
        </label>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>LINKS</div>
        <div className={styles.links}>
          <button className={styles.link} onClick={() => window.throttle?.openExternal('https://ballchasing.com')}>
            ballchasing.com ↗
          </button>
          <button className={styles.link} onClick={() => window.throttle?.openExternal('https://github.com/bakkesmodorg/BakkesModSDK')}>
            BakkesMod SDK (offline) ↗
          </button>
        </div>
      </div>

      <button className={`${styles.saveBtn} ${saved ? styles.saved : ''}`} onClick={save}>
        {saved ? '✓ SAVED' : 'SAVE SETTINGS'}
      </button>
    </div>
  );
}
