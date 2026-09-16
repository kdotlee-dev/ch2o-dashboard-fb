<div align="center">

# 🧪 CH₂O Dashboard

**Real-time formaldehyde air quality monitoring dashboard**

Built with React · Firebase · ECharts · Tailwind CSS

🌐 **[Live Demo → ch2o-dashboard.web.app](https://ch2o-dashboard.web.app/)**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen?logo=firebase&logoColor=white)](https://ch2o-dashboard.web.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-RTDB-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)

</div>

---

A web dashboard that visualizes real-time formaldehyde (HCHO) readings from an ESP32-based sensor. Data streams from the device into Firebase Realtime Database and renders as live charts, historical trends, and a safety breakdown classified against **WHO** and **OSHA** exposure guidelines.

> **Note** — This project is the web frontend only. The companion ESP32 firmware handles the sensor hardware and data upload.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Live & historical views** | Toggle between a streaming "Live" feed and fixed time windows (15 min, 1 h, 6 h, 24 h, 7 d, All) |
| **Shareable state** | Selected range is reflected in the URL (`?range=24h`) — links and reloads just work |
| **Safety classification** | Every reading is bucketed into Safe / Warning / Danger using WHO (`0.08 ppm`) and OSHA PEL (`0.75 ppm`) thresholds |
| **Interactive charts** | Time-series line chart, hourly average bar chart, and safety-level distribution pie chart powered by Apache ECharts |
| **Readings table** | Paginated table with per-row delete and "Clear all" action |
| **Resilient data layer** | Tolerates messy device payloads — handles unix-seconds vs. millisecond timestamps, alternate field names (`ch2o_ppm` / `hcho` / `value`), and `boot_<millis>` keys from pre-NTP-sync boots |
| **About page** | Educational page on formaldehyde sources and exposure-level health effects |
| **Responsive UI** | Modern interface built with Tailwind CSS v4, GSAP animations, and Lucide icons |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [React 19](https://react.dev) + [Vite 8](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Routing | [React Router v7](https://reactrouter.com) |
| Charts | [Apache ECharts](https://echarts.apache.org) |
| Animations | [GSAP](https://gsap.com) |
| Backend | [Firebase Realtime Database](https://firebase.google.com/docs/database) |
| Hosting | [Firebase Hosting](https://firebase.google.com/docs/hosting) |
| Icons | [Lucide React](https://lucide.dev) |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- A **Firebase project** with Realtime Database enabled
- *(Optional)* The companion ESP32 firmware writing readings to your RTDB

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/ch2o-dashboard-fb.git
cd ch2o-dashboard-fb
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your Firebase project credentials:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Path in RTDB where the device writes readings.
# Must match the firmware's HISTORY_PATH.
VITE_FIREBASE_READINGS_PATH=devices/device01/history
```

### 3. Run Locally

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### 4. Build for Production

```bash
npm run build
npm run preview   # optional — serve the production build locally
```

## 📊 Data Model

Each reading is a child under `VITE_FIREBASE_READINGS_PATH` (default: `devices/device01/history`).

**Expected shape:**

```json
{
  "ch2o_ppm": 0.042,
  "level": "safe",
  "wifi": "online",
  "uptime_ms": 1234567,
  "timestamp_unix_s": 1755600000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `ch2o_ppm` | `float` | Formaldehyde concentration in parts per million |
| `level` | `string` | One of `"safe"`, `"warning"`, `"danger"`, or `"offline"` |
| `wifi` | `string` | WiFi connection status |
| `uptime_ms` | `int` | Device uptime in milliseconds |
| `timestamp_unix_s` | `int` | Unix timestamp (seconds) at write time |

> **Tip** — The dashboard also accepts alternate field names (`ch2o`, `hcho`, `value`, `ppm`, `timestamp`, `ts`, `createdAt`) for backward compatibility with older firmware revisions.

### Database Rules

The bundled [`database.rules.json`](./database.rules.json) validates the schema and currently allows public read/write under `devices/device01/history` for prototyping.

> [!WARNING]
> **Lock down the database rules before production use.** At minimum, restrict `.write` to authenticated devices and consider whether `.read` should be public.

For better query performance, add an index on the timestamp field:

```json
{
  "rules": {
    "devices": {
      "device01": {
        "history": {
          ".indexOn": ["timestamp_unix_s"]
        }
      }
    }
  }
}
```

## 🌐 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

To deploy database rule changes:

```bash
firebase deploy --only database
```

## 📁 Project Structure

```
ch2o-dashboard-fb/
├── public/                     # Static assets (favicon, icons)
├── src/
│   ├── App.jsx                 # Route definitions
│   ├── main.jsx                # Entry point
│   ├── index.css               # Tailwind theme & custom utilities
│   ├── assets/                 # Images (hero, device photos)
│   ├── pages/
│   │   ├── Home.jsx            # Landing page + dashboard
│   │   ├── About.jsx           # Formaldehyde info & exposure tiers
│   │   └── NotFound.jsx        # 404 page
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Onboarding.jsx      # Hero section
│   │   ├── Dashboard.jsx       # Composes dashboard widgets
│   │   ├── ReadingsChart.jsx   # Time-series line chart
│   │   ├── HourlyBarChart.jsx  # Hourly averages
│   │   ├── SafetyPieChart.jsx  # Safety distribution
│   │   ├── SafetyBreakdownCard.jsx
│   │   ├── DeviceStatusCard.jsx
│   │   ├── ReadingsTable.jsx   # Paginated readings table
│   │   ├── TimeRangePicker.jsx # Range selector (Live/15m/1h/…)
│   │   └── ScrollToTop.jsx
│   ├── hooks/
│   │   └── useReadings.js      # RTDB subscription, normalization, pagination
│   └── lib/
│       ├── firebase.js         # Firebase initialization
│       ├── safety.js           # WHO/OSHA threshold helpers
│       ├── timeRanges.js       # Time window presets
│       └── utils.js            # General utilities
├── .env.example                # Environment variable template
├── database.rules.json         # Firebase RTDB security rules
├── firebase.json               # Firebase project configuration
├── vite.config.js              # Vite build configuration
└── package.json
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## 🔒 Security Considerations

This project is intentionally **open by design** for prototyping simplicity — the database allows public reads/writes and the UI exposes destructive actions without authentication.

For production hardening, consider:

- Restricting RTDB writes to authenticated devices (`".write": "auth != null"`)
- Scoping reads per device
- Authenticating the ESP32 via Firebase Auth (anonymous, email/password, or custom token)
- Gating destructive UI actions behind an admin role
- Setting a billing budget alert in Google Cloud Console

## ⚠️ Disclaimer

This project is a **learning and prototyping tool**. It is not a certified air-quality measurement device. Safety thresholds reference WHO and OSHA guidelines for context, but readings should not be relied on for medical or occupational-safety decisions.

## 📄 License

Released under the [MIT License](./LICENSE).

---

<div align="center">

**Built with ❤️ by [DotLee, Studio](https://github.com/kdotlee-dev)**

</div>
