# app/api/stations.py
"""
Router for station-related endpoints.

GET /stations/{station_id}/current
  Returns the latest weather observation from the processed CSV for the
  given station, plus hardcoded energy / logistics placeholder values.
"""

import os
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException

from app.models.station_current import (
    EnergyBlock,
    LogisticsBlock,
    Metric,
    StationCurrent,
    WeatherBlock,
)

router = APIRouter()

# ---------------------------------------------------------------------------
# Station registry
# ---------------------------------------------------------------------------

STATIONS = {
    "maitri": {"name": "Maitri", "lat": -70.76, "lon": 11.73},
    "bharati": {"name": "Bharati", "lat": -69.41, "lon": 76.19},
}

# ---------------------------------------------------------------------------
# Hardcoded placeholder energy / logistics blocks (one per station).
# These are intentionally static until the simulation module is built.
# ---------------------------------------------------------------------------

_PLACEHOLDER: dict[str, dict] = {
    "maitri": {
        "energy": EnergyBlock(
            generation_kw=Metric(value=142, source="simulated"),
            consumption_kw=Metric(value=119, source="simulated"),
            diesel_pct=Metric(value=61, source="simulated"),
        ),
        "logistics": LogisticsBlock(
            food_days_remaining=Metric(value=68, source="simulated"),
            diesel_days_remaining=Metric(value=42, source="simulated"),
        ),
    },
    "bharati": {
        "energy": EnergyBlock(
            generation_kw=Metric(value=187, source="simulated"),
            consumption_kw=Metric(value=154, source="simulated"),
            diesel_pct=Metric(value=58, source="simulated"),
        ),
        "logistics": LogisticsBlock(
            food_days_remaining=Metric(value=74, source="simulated"),
            diesel_days_remaining=Metric(value=37, source="simulated"),
        ),
    },
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Resolve data directory relative to this file:
#   backend/app/api/stations.py  →  up 3 levels  →  repo root  →  data/processed
_REPO_ROOT = Path(__file__).resolve().parents[3]
_PROC_DIR = _REPO_ROOT / "data" / "processed"


def _csv_path(station_id: str) -> Path:
    return _PROC_DIR / f"{station_id}_clean.csv"


def _find_latest_complete_row(df: pd.DataFrame):
    """
    Return the most-recent row where tempr, ap, AND ws are all non-null.
    Sorts by obstime descending and returns the first fully-populated row.
    Raises HTTPException 503 if no such row exists.
    """
    complete = df.dropna(subset=["tempr", "ap", "ws"]).sort_values(
        "obstime", ascending=False
    )
    if complete.empty:
        raise HTTPException(
            status_code=503,
            detail="No row with all three weather fields (tempr, ap, ws) present.",
        )
    return complete.iloc[0]


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.get(
    "/stations/{station_id}/current",
    response_model=StationCurrent,
    summary="Latest observed conditions for a station",
)
def get_station_current(station_id: str) -> StationCurrent:
    """
    Return the most-recent row from the processed CSV for *station_id*,
    merged with hardcoded energy/logistics placeholder values.

    Raises 404 if the station_id is not recognised.
    Raises 503 if the processed CSV cannot be found or is empty.
    Weather metric values may be ``null`` when the latest row has a data gap.
    """
    # 1. Validate station
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Station '{station_id}' not found. "
                f"Valid options are: {sorted(STATIONS.keys())}"
            ),
        )

    # 2. Load CSV
    csv = _csv_path(station_id)
    if not csv.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Processed data file not found: {csv.name}",
        )

    df = pd.read_csv(csv, parse_dates=["obstime"])

    if df.empty:
        raise HTTPException(
            status_code=503,
            detail=f"Processed data file for '{station_id}' is empty.",
        )

    # 3. Find most-recent row where tempr, ap, AND ws are all non-null
    latest = _find_latest_complete_row(df)

    obs_time = latest["obstime"]
    if hasattr(obs_time, "isoformat"):
        observation_time_str = obs_time.isoformat()
    else:
        observation_time_str = str(obs_time)

    # 4. Build weather block — all three values guaranteed non-null by row selection
    weather = WeatherBlock(
        temperature_c=Metric(value=float(latest["tempr"]), source="real"),
        wind_speed_ms=Metric(value=float(latest["ws"]),    source="real"),
        pressure_hpa= Metric(value=float(latest["ap"]),    source="real"),
    )

    # 5. Assemble response
    placeholder = _PLACEHOLDER[station_id]
    return StationCurrent(
        station_id=station_id,
        observation_time=observation_time_str,
        weather=weather,
        energy=placeholder["energy"],
        logistics=placeholder["logistics"],
    )