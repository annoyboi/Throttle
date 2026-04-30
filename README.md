# Throttle

**Rocket League companion app — live stats, replay uploads, offline mod support.**

Built as a BakkesMod successor after EAC dropped on April 28, 2026.

---

## What it does

**Online mode (EAC on):**
- Live session stats (wins, losses, goals, streak)
- Real-time game event feed via Psyonix's StatsAPI
- Auto-detects and uploads replays to ballchasing.com

**Offline mode (EAC off):**
- Full BakkesMod compatibility (launch RL with EAC disabled)
- Throttle detects the mode automatically when you relaunch

---

## Setup (for developers / contributors)

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- Git (https://git-scm.com)
- Windows (required for Electron desktop app)

### Install & run
```bash
git clone https://github.com/annoyboi/throttle.git
cd throttle
npm install
npm start
```

### Build installer
```bash
npm run build
# Output: dist/Throttle Setup 1.0.0.exe
```

---

## StatsAPI setup
Throttle auto-configures this for you in Settings → Auto-Configure StatsAPI.

Manual: edit `<RL Install>\TAGame\Config\DefaultStatsAPI.ini`:
```
[StatsAPI]
PacketSendRate=30
Port=49123
```

---

## Contributing
PRs welcome. Plugin contributions especially wanted.

## License
MIT
