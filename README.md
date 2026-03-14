# SWARM Frontend — Setup Guide

## ⚡ Quick Start (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

That's it. It runs in MOCK MODE by default — no backend needed.

---

## Project Structure

```
swarm-frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx        ← Sidebar + nav shell
│   │   ├── StatCard.jsx      ← Dashboard stat cards
│   │   ├── AgentCard.jsx     ← Agent status cards
│   │   ├── ActivityFeed.jsx  ← Live feed panel
│   │   ├── PageHeader.jsx    ← Page title component
│   │   └── Loader.jsx        ← Spinning loader
│   ├── pages/
│   │   ├── Dashboard.jsx     ← Overview / control room
│   │   ├── Events.jsx        ← Event management
│   │   ├── ContentAgent.jsx  ← Content generator UI
│   │   ├── EmailAgent.jsx    ← Email dispatcher UI
│   │   └── SchedulerAgent.jsx← Schedule builder UI
│   ├── services/
│   │   └── api.js            ← ALL API calls + mocks (change USE_MOCK here)
│   ├── App.jsx               ← Routes
│   ├── main.jsx              ← Entry point
│   └── index.css             ← Global styles + CSS vars
├── API_CONTRACT.md           ← Give this to backend teammate
├── vite.config.js            ← Proxy: /api → localhost:8000
└── package.json
```

---

## Pages & Features

| Route | Page | Agent |
|---|---|---|
| `/` | Dashboard | Overview, all agents, live feed |
| `/events` | Events | Create & manage events |
| `/content` | Content Agent | Brief → posts + copy |
| `/email` | Email Agent | CSV upload → bulk personalized email |
| `/scheduler` | Scheduler | Constraints → schedule, conflict resolver |

---

## Connecting to Backend

1. Open `src/services/api.js`
2. Change `const USE_MOCK = true` → `const USE_MOCK = false`
3. Make sure backend runs on `http://localhost:8000`
4. See `API_CONTRACT.md` for exact endpoint specs

---

## Tech Stack

- **React 18** + **Vite 5**
- **React Router v6** — client-side routing
- **Axios** — HTTP client
- **PapaParse** — CSV parsing
- **react-hot-toast** — notifications
- **Recharts** — charts (ready to use)
- **Lucide React** — icons (ready to use)

---

## Design System

All colors are CSS variables in `src/index.css`:
```css
--accent:  #c8ff00  /* Content agent, primary */
--accent2: #ff3cac  /* Email agent */
--accent3: #3cffd0  /* Scheduler agent */
--accent4: #ffaa00  /* Orchestrator / Events */
```
Fonts: **Syne** (headings), **DM Mono** (body), **Instrument Serif** (accents)
