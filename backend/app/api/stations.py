# app/api/stations.py
"""
Router for station-related endpoints.

GET /stations/{station_id}/current
  Returns the latest weather observation from the processed CSV for the
  given station, plus hardcoded energy / logistics placeholder values.
"""

import math
import os
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException

from app.models.station_current import (
    EnergyBlock,
    LogisticsBlock,
    Metric,
    NullableMetric,
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


def _nullable(raw_value) -> float | None:
    """Return None for NaN / missing values, otherwise a plain float."""
    if raw_value is None:
        return None
    try:
        if math.isnan(float(raw_value)):
            return None
    except (TypeError, ValueError):
        return None
    return float(raw_value)


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

    # 3. Sort and take latest row
    df = df.sort_values("obstime")
    latest = df.iloc[-1]

    timestamp = latest["obstime"]
    # Ensure ISO 8601 string regardless of pandas version
    if hasattr(timestamp, "isoformat"):
        timestamp_str = timestamp.isoformat()
    else:
        timestamp_str = str(timestamp)

    # 4. Build weather block — NaN → None (never crash, never lie)
    weather = WeatherBlock(
        temperature_c=NullableMetric(value=_nullable(latest.get("tempr")), source="real"),
        wind_speed_ms=NullableMetric(value=_nullable(latest.get("ws")), source="real"),
        pressure_hpa=NullableMetric(value=_nullable(latest.get("ap")), source="real"),
    )

    # 5. Assemble response
    placeholder = _PLACEHOLDER[station_id]
    return StationCurrent(
        station_id=station_id,
        timestamp=timestamp_str,
        weather=weather,
        energy=placeholder["energy"],
        logistics=placeholder["logistics"],
    )