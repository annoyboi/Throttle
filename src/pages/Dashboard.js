import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

export default function Dashboard({ events, mode }) {
  const [session, setSession] = useState({ wins: 0, losses: 0, goals: 0, saves: 0, streak: 0 });
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    if (!events.length) return;
    const e = events[0];
    setLastEvent(e);

    if (e.Event === 'GoalScored') {
      setSession(s => ({ ...s, goals: s.goals + 1 }));
    }
    if (e.Event === 'MatchEnded') {
      const won = e.Data?.Winner === 'local';
      setSession(s => ({
        ...s,
        wins: won ? s.wins + 1 : s.wins,
        losses: !won ? s.losses + 1 : s.losses,
        streak: won ? (s.streak >= 0 ? s.streak + 1 : 1) : (s.streak <= 0 ? s.streak - 1 : -1),
      }));
    }
  }, [events]);

  const wl = session.wins + session.losses;
  const winrate = wl > 0 ? Math.round((session.wins / wl) * 100) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <span className={styles.sub}>Session stats — resets on close</span>
      </div>

      <div className={styles.statGrid}>
        <StatCard label="WINS" value={session.wins} color="var(--online)" />
        <StatCard label="LOSSES" value={session.losses} color="var(--accent)" />
        <StatCard label="WIN RATE" value={`${winrate}%`} color="var(--accent2)" />
        <StatCard label="STREAK" value={session.streak >= 0 ? `+${session.streak}` : `${session.streak}`} color={session.streak >= 0 ? 'var(--online)' : 'var(--accent)'} />
        <StatCard label="GOALS" value={session.goals} color="var(--offline)" />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>LIVE EVENTS</div>
        {mode === 'online' ? (
          <div className={styles.eventFeed}>
            {events.length === 0 && (
              <div className={styles.empty}>Waiting for game events... Launch Rocket League with EAC on.</div>
            )}
            {events.slice(0, 15).map((e, i) => (
              <EventRow key={i} event={e} />
            ))}
          </div>
        ) : (
          <div className={styles.offlineBanner}>
            <span className={styles.offlineIcon}>◈</span>
            <div>
              <div className={styles.offlineTitle}>OFFLINE MODE ACTIVE</div>
              <div className={styles.offlineDesc}>
                Launch RL with EAC off to use BakkesMod features. Relaunch with EAC on to see live stats here.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue} style={{ color }}>{value}</div>
    </div>
  );
}

function EventRow({ event }) {
  const name = event.Event || event.type || 'Event';
  const time = new Date(event.ts).toLocaleTimeString();
  return (
    <div className={styles.eventRow}>
      <span className={styles.eventTime}>{time}</span>
      <span className={styles.eventName}>{name}</span>
      {event.Data?.Scorer?.Name && (
        <span className={styles.eventDetail}>by {event.Data.Scorer.Name}</span>
      )}
    </div>
  );
}
