# Polar Twin

A web-based monitoring and simulation platform for India's two Antarctic research stations — Maitri and Bharati — built for Smart India Hackathon 2026, Problem Statement **PS-26060: Digital Platform for efficient remote management of Indian Antarctic Research Stations** (Ministry of Earth Sciences / NCPOR).

An Android companion app is also included, providing a native mobile interface to the same station data.

## What it does

### Web platform (Next.js)

- **Overview tab** — displays the most recent archived weather observation (temperature, wind speed, atmospheric pressure) for the selected station, together with simulated energy and logistics state; flags weather anomalies against a historical baseline using z-score detection.
- **Assets tab** — shows a hierarchy of 13 tracked subsystem nodes (power, water, buildings, logistics) with per-asset diagnostic details, and an illustrative 3D schematic view.
- **Twin tab** — renders an interactive 3D Polaris Digital Twin of the selected station using Three.js / React Three Fiber; includes a node inspector panel and a control panel for toggling simulation parameters.
- **What-If tab** — runs one of three disruption scenarios (Generator Failure, Blizzard, Resupply Delay) against the station's current simulated state; returns a computed event timeline, urgency verdict, and prioritised recommendations via a live API call.
- **Forecast tab** — projects diesel and food reserve depletion over 30 days using a linear burn model, with warning (≤ 15 days) and critical (≤ 7 days) threshold crossings.
- **Logistics tab** — inter-station coordination panel with a route simulator for planning resupply and personnel transfer between Maitri and Bharati.
- **Intelligence overlays** — a persistent alert drawer, exportable Mission Report (PDF via jsPDF), cascade failure visualizer, explainable risk breakdown, mitigation panel, scenario timeline, smart resource grid, communication health card, and mission readiness card; these float over all tabs and are driven by `OperationalIntelligenceContext`.

The API also exposes a satellite link toggle (`GET /link/status`, `POST /link/toggle`) used to demonstrate graceful degradation when communications are lost.

### Android companion app (Kotlin + Jetpack Compose)

Located under `app/Sih26060`. A self-contained native Android app (minSdk 23, targetSdk 37) built with Jetpack Compose and Material 3 that mirrors the four core views of the web platform:

- **Overview** — station hero card with real station imagery, atmospheric telemetry, power microgrid metrics, and logistics reserves.
- **Assets** — subsystem node hierarchy with per-asset diagnostic detail.
- **What-If** — disruption scenario simulator with computed urgency verdict and recommendations.
- **Forecast** — 30-day diesel and food reserve depletion chart with threshold warnings.

Station selection (Maitri / Bharati) and UTC time are shown in the persistent top bar.

## Data honesty

Every metric in the system carries a `source` field — `"real"`, `"simulated"`, or `"derived"` — both in API responses and in the UI. Weather observations are real archived data from the NCPOR/IMD AWS network; energy, logistics, and asset telemetry are simulated from hardcoded baselines; anomaly flags, forecasts, and what-if results are derived computations. See `docs/data-provenance.md` for the full breakdown.

## Live deployment

- **Frontend:** [https://antarctic-twin-wine.vercel.app/](https://antarctic-twin-wine.vercel.app/)
- **Backend API:** [https://antarctic-twin.onrender.com](https://antarctic-twin.onrender.com)
- **API docs:** [https://antarctic-twin.onrender.com/docs](https://antarctic-twin.onrender.com/docs) (FastAPI automatic documentation)

## Tech stack

**Backend** (from `backend/requirements.txt`):

- `fastapi`
- `uvicorn[standard]`
- `pandas`
- `pydantic`

**Frontend** (from `frontend/package.json`):

- `next` ^14.2.24
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `recharts` ^3.10.1
- `three` ^0.160.1
- `@react-three/fiber` ^8.18.0
- `@react-three/drei` ^9.122.0
- `lucide-react` ^0.469.0
- `jspdf` ^4.2.1
- `tailwindcss` ^3.4.17
- `typescript` ^5.7.2

**Android app** (`app/Sih26060`):

- Kotlin + Jetpack Compose (BOM 2025.07.00)
- `androidx.compose.material3`
- `androidx.navigation:navigation-compose` 2.9.0
- `androidx.compose.material:material-icons-extended`
- minSdk 23 · targetSdk 37

## Project structure

```
app/        Native Android companion app (Kotlin + Jetpack Compose)
  Sih26060/   Android Studio project — single-activity, Compose navigation
backend/    FastAPI application — API routes, models, station data logic
data/       Raw and processed AWS CSV files, baseline_stats.json
docs/       Project documentation (data-provenance.md, demo-script.md, api-contract.md)
frontend/   Next.js 14 application — all UI tabs, context, API client
  components/
    assets/       Assets tab components
    forecast/     Forecast tab components
    intelligence/ Operational intelligence overlays (alert drawer, mission report, etc.)
    layout/       TopBar, StationSwitcher, LinkStatusIndicator
    logistics/    Logistics tab — inter-station coordination, route simulator
    overview/     Overview tab components
    shared/       Shared UI primitives (MetricCard, AnomalyBanner, SourceBadge, etc.)
    twin/         3D Polaris Digital Twin — canvas, inspector, control panel
    whatif/       What-If tab components
  context/        React contexts (StationContext, LinkContext, OperationalIntelligenceContext)
scripts/    Data processing script (clean_and_baseline.py)
```

## Running locally

### Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend starts on `http://localhost:8000`.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local if your backend is not on localhost:8000
npm install
npm run dev
```

`npm run dev` runs `next dev`. The frontend starts on `http://localhost:3000`.

**Required environment variable** (from `frontend/.env.local.example`):

```
NEXT_PUBLIC_API_URL=https://antarctic-twin.onrender.com/
```

Set this to the deployed backend URL when running in production, or `http://localhost:8000/` for local development.

### Android app

Open `app/Sih26060` in Android Studio, sync Gradle, and run on an emulator or physical device (API 23+). The app uses hardcoded station data and does not require a running backend.

## Demo

See `docs/demo-script.md` for a full walkthrough.
