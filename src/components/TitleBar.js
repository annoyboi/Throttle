import React from 'react';
import styles from './TitleBar.module.css';

export default function TitleBar({ mode }) {
  const api = window.throttle;
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.logo}>THROTTLE</span>
        <span className={`${styles.badge} ${mode === 'online' ? styles.online : styles.offline}`}>
          <span className={styles.dot} />
          {mode === 'online' ? 'ONLINE — EAC ON' : 'OFFLINE — EAC OFF'}
        </span>
      </div>
      <div className={styles.controls}>
        <button onClick={() => api?.minimize()} className={styles.btn}>─</button>
        <button onClick={() => api?.maximize()} className={styles.btn}>□</button>
        <button onClick={() => api?.close()} className={`${styles.btn} ${styles.closeBtn}`}>✕</button>
      </div>
    </div>
  );
}
