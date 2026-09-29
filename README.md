# Antarctic Digital Twin

A web-based monitoring and simulation platform for India's two Antarctic research stations — Maitri and Bharati — built for Smart India Hackathon 2026, Problem Statement **PS-26060: Digital Platform for efficient remote management of Indian Antarctic Research Stations** (Ministry of Earth Sciences / NCPOR).

## What it does

- **Overview tab** — displays the most recent archived weather observation (temperature, wind speed, atmospheric pressure) for the selected station, together with simulated energy and logistics state; flags weather anomalies against a historical baseline using z-score detection.
- **Assets tab** — shows a hierarchy of 13 tracked subsystem nodes (power, water, buildings, logistics) with per-asset diagnostic details, and an illustrative 3D schematic view.
- **What-If tab** — runs one of three disruption scenarios (Generator Failure, Blizzard, Resupply Delay) against the station's current simulated state; returns a computed event timeline, urgency verdict, and prioritised recommendations via a live API call.
- **Forecast tab** — projects diesel and food reserve depletion over 30 days using a linear burn model, with warning (≤ 15 days) and critical (≤ 7 days) threshold crossings.

The API also exposes a satellite link toggle (`GET /link/status`, `POST /link/toggle`) used to demonstrate graceful degradation when communications are lost.

## Data honesty

Every metric in the system carries a `source` field — `"real"`, `"simulated"`, or `"derived"` — both in API responses and in the UI. Weather observations are real archived data from the NCPOR/IMD AWS network; energy, logistics, and asset telemetry are simulated from hardcoded baselines; anomaly flags, forecasts, and what-if results are derived computations. See `docs/data-provenance.md` for the full breakdown.

## Live deployment

- **Frontend:** [FILL IN — Vercel URL not found in repository; add after deployment]
- **Backend API:** [FILL IN — Render URL not found in repository; add after deployment]
- **API docs:** `<Backend URL>/docs` (FastAPI automatic documentation is enabled; `docs_url` is not overridden in `backend/app/main.py`)

## Tech stack

**Backend** (from `backend/requirements.txt`):

- `fastapi`
- `uvicorn[standard]`
- `pandas`
- `pydantic`

**Frontend** (from `frontend/package.json`, `dependencies` and `devDependencies`):

- `next` ^14.2.24
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `recharts` ^3.10.1
- `three` ^0.160.1
- `@react-three/fiber` ^8.18.0
- `@react-three/drei` ^9.122.0
- `lucide-react` ^0.469.0
- `tailwindcss` ^3.4.17
- `typescript` ^5.7.2

## Project structure

```
backend/    FastAPI application — API routes, models, station data logic
data/       Raw and processed AWS CSV files, baseline_stats.json
docs/       Project documentation (data-provenance.md, demo-script.md, api-contract.md)
frontend/   Next.js 14 application — all UI tabs, context, API client
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
uvicorn app.main:app --reload
```

The backend starts on `http://localhost:8000`.  
Start command sourced from `backend/.env.local` comment: `uvicorn app.main:app --reload --port 8000`.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local if your backend is not on localhost:8000
npm install
npm run dev
```

`npm run dev` is the `"dev"` script defined in `frontend/package.json` (`"next dev"`).  
The frontend starts on `http://localhost:3000`.

**Required environment variable** (from `frontend/.env.local.example`):

```
NEXT_PUBLIC_API_URL=https://antarctic-twin.onrender.com/
```

Set this to the deployed backend URL when running in production.

## Demo

See `docs/demo-script.md` for a full walkthrough.

