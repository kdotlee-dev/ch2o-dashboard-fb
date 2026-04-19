# CH2O Monitor — Formaldehyde Dashboard

A real-time web dashboard for an ESP32-based formaldehyde (CH₂O / HCHO) air quality sensor. Readings stream from the device into Firebase Realtime Database and render here as live charts, historical trends, and a safety breakdown classified against WHO and OSHA guidelines.

> Hardware/firmware repo: _coming soon_

---

## Features

- **Live + historical views** — Toggle between a streaming "Live" feed and fixed time windows (15m, 1h, 6h, 24h, 7d, All).
- **Shareable state** — The selected range is reflected in the URL (`?range=24h`), so links and reloads just work.
- **Safety classification** — Every reading is bucketed into Safe / Warning / Danger using the same thresholds the device firmware uses (`SAFE_LIMIT = 0.08 ppm` WHO, `DANGER_LIMIT = 0.75 ppm` OSHA PEL).
- **Charts**
  - Time-series line chart of ppm over the selected window
  - Hourly average bar chart
  - Safety-level distribution pie chart
- **Readings table** with pagination ("Load older"), per-row delete, and a "Clear all" action.
- **Resilient data layer** — Tolerates messy device payloads (unix-seconds vs. millisecond timestamps, alternate field names like `ch2o_ppm` / `hcho` / `value`, and `boot_<millis>` keys when the clock isn't synced).
- **About page** explaining what formaldehyde is, common indoor sources, and exposure-level health effects.
- **Responsive, modern UI** built with Tailwind v4 and Lucide icons.

---

## Tech stack

| Layer       | Choice                              |
| ----------- | ----------------------------------- |
| Framework   | React 19 + Vite                     |
| Styling     | Tailwind CSS v4                     |
| Routing     | React Router v7                     |
| Charts      | Apache ECharts                      |
| Backend     | Firebase Realtime Database          |
| Hosting     | Firebase Hosting                    |
| Icons       | lucide-react                        |

---

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A Firebase project with Realtime Database enabled
- (Optional) The companion ESP32 firmware writing readings to your RTDB

### 1. Install

```bash
git clone https://github.com/<your-username>/ch2o-dashboard-fb.git
cd ch2o-dashboard-fb
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Firebase project credentials:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Path in RTDB where the device writes readings.
# Must match the firmware's HISTORY_PATH.
VITE_FIREBASE_READINGS_PATH=devices/device01/history
```

### 3. Run locally

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### 4. Build for production

```bash
npm run build
npm run preview   # optional: serve the production build locally
```

---

## Data model

Each reading is a child of `VITE_FIREBASE_READINGS_PATH` (default `devices/device01/history`). The dashboard expects this shape:

```json
{
  "ch2o_ppm": 0.042,
  "level": "safe",
  "wifi": "online",
  "uptime_ms": 1234567,
  "timestamp_unix_s": 1755600000
}
```

- `level` is one of `"safe" | "warning" | "danger"` (or `"offline"` when the sensor isn't responding).
- The row **key** itself is the unix-seconds timestamp at write time, or `boot_<millis>` if NTP hadn't synced yet.
- The dashboard accepts a few alternate field names (`ch2o`, `hcho`, `value`, `ppm`, `timestamp`, `ts`, `createdAt`) so older firmware revisions still render.

### Realtime Database rules

The bundled `database.rules.json` validates the schema and currently allows public read/write under `devices/device01/history` for prototyping. **Lock this down before going to production** — at minimum, restrict `.write` to authenticated devices and consider whether `.read` should be public.

For better query performance, also add an index on the timestamp field:

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

Without it, range queries still work but Firebase logs a warning.

---

## Deployment (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

To deploy database rule changes:

```bash
firebase deploy --only database
```

---

## Project structure

```
src/
├── App.jsx                  # Routes
├── main.jsx                 # Entry
├── index.css                # Tailwind theme + utilities
├── pages/
│   ├── Home.jsx             # Landing + dashboard
│   ├── About.jsx            # Formaldehyde info, sources, exposure tiers
│   └── NotFound.jsx
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Onboarding.jsx       # Hero section
│   ├── Dashboard.jsx        # Composes the dashboard widgets
│   ├── ReadingsChart.jsx    # Time-series line chart
│   ├── HourlyBarChart.jsx
│   ├── SafetyPieChart.jsx
│   ├── SafetyBreakdownCard.jsx
│   ├── DeviceStatusCard.jsx
│   ├── ReadingsTable.jsx
│   ├── TimeRangePicker.jsx
│   └── ScrollToTop.jsx
├── hooks/
│   └── useReadings.js       # RTDB subscription, normalization, pagination
└── lib/
    ├── firebase.js          # Firebase init
    ├── safety.js            # Safety-level thresholds + helpers
    ├── timeRanges.js        # Live / 15m / 1h / 6h / 24h / 7d / All presets
    └── utils.js
```

---

## Scripts

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start the Vite dev server        |
| `npm run build`   | Production build to `dist/`      |
| `npm run preview` | Preview the production build     |
| `npm run lint`    | Run ESLint                       |

---

## Security model

This project is intentionally **open by design**. The Realtime Database rules permit public reads and writes to `devices/device01/history` (subject to schema validation), and the dashboard exposes destructive actions like "Delete reading" and "Clear all" without authentication. This keeps the prototype simple — the device just writes, the dashboard just reads, no auth flows on either side.

This is fine for a hobby/portfolio project: the worst realistic outcome is that someone wipes the sensor history and it gets repopulated by the next reading. If this ever evolves into something people actually rely on (a commercial device, a multi-tenant deployment, etc.), it should be hardened at minimum by:

- Restricting RTDB rules so writes require authentication (`".write": "auth != null"`) and reads are scoped per device.
- Authenticating the ESP32 via Firebase Auth (anonymous, email/password "device account", or a custom token from a backend) so it can keep writing under the new rules.
- Gating destructive UI actions behind an admin role.
- Setting a billing budget alert in Google Cloud Console to cap exposure to quota-abuse.

---

## Disclaimer

This project is a learning / prototype tool. It is **not** a certified air-quality measurement device. Safety thresholds reference WHO and OSHA guidelines for context, but readings should not be relied on for medical or occupational-safety decisions.

---

## License

Released under the [MIT License](./LICENSE).
