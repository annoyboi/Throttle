import React from 'react';
import styles from './Sidebar.module.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'replays',   label: 'Replays',   icon: '◈' },
  { id: 'settings',  label: 'Settings',  icon: '◎' },
];

export default function Sidebar({ page, setPage, mode }) {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.nav}>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`${styles.item} ${page === n.id ? styles.active : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className={styles.icon}>{n.icon}</span>
            <span className={styles.label}>{n.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.modeBlock}>
        <div className={`${styles.modeIndicator} ${mode === 'online' ? styles.online : styles.offline}`}>
          <div className={styles.modeTitle}>{mode === 'online' ? 'ONLINE MODE' : 'OFFLINE MODE'}</div>
          <div className={styles.modeDesc}>
            {mode === 'online'
              ? 'EAC active — stats & replays'
              : 'EAC off — full mod support'}
          </div>
        </div>
      </div>
    </nav>
  );
}
