import React, { useState } from 'react';
import styles from './Replays.module.css';

export default function Replays({ replays, settings }) {
  const [uploadStatus, setUploadStatus] = useState({});

  const upload = async (filePath) => {
    if (!settings.ballchasingKey) {
      alert('Add your ballchasing.com API key in Settings first.');
      return;
    }
    setUploadStatus(s => ({ ...s, [filePath]: 'uploading' }));
    const result = await window.throttle?.uploadReplay({ filePath, apiKey: settings.ballchasingKey });
    setUploadStatus(s => ({ ...s, [filePath]: result?.success ? 'done' : 'error' }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Replays</h1>
        <span className={styles.sub}>Auto-detected this session</span>
      </div>

      {replays.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◈</div>
          <div>No replays detected yet.</div>
          <div className={styles.emptyHint}>Play a match and the replay will appear here automatically.</div>
        </div>
      ) : (
        <div className={styles.list}>
          {replays.map((r, i) => {
            const name = r.path.split('\\').pop().split('/').pop();
            const status = uploadStatus[r.path];
            return (
              <div key={i} className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.rowIcon}>▶</span>
                  <div>
                    <div className={styles.rowName}>{name}</div>
                    <div className={styles.rowPath}>{r.path}</div>
                  </div>
                </div>
                <div className={styles.rowRight}>
                  {status === 'done' && <span className={styles.statusDone}>✓ UPLOADED</span>}
                  {status === 'error' && <span className={styles.statusError}>✕ FAILED</span>}
                  {status === 'uploading' && <span className={styles.statusUploading}>UPLOADING...</span>}
                  {!status && (
                    <button className={styles.uploadBtn} onClick={() => upload(r.path)}>
                      UPLOAD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
