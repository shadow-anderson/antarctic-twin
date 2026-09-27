
# app/api/stations.py
"""
Router for station-related endpoints.

GET  /stations                        → list all stations
GET  /stations/{station_id}/current   → latest telemetry snapshot
GET  /stations/{station_id}/anomalies → anomaly detection against baselines
POST /stations/{station_id}/simulate  → what-if simulation
GET  /link/status                     → satellite link state
POST /link/toggle                     → toggle link connected/disconnected
"""

import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Literal, Optional

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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


# ---------------------------------------------------------------------------
# Response models for new endpoints
# ---------------------------------------------------------------------------


class StationMeta(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    capacity_summer: int
    capacity_winter: int


class AnomalyItem(BaseModel):
    variable: str
    value: float
    baseline_mean: float
    baseline_stddev: float
    severity: Literal["low", "medium", "high"]


class TimelineEvent(BaseModel):
    day: int
    event: str


class SimulateRequest(BaseModel):
    trigger: Literal["generator_failure", "blizzard", "resupply_delay"]


class SimulateResult(BaseModel):
    timeline: List[TimelineEvent]
    recommendations: List[str]


class LinkStatusResponse(BaseModel):
    connected: bool
    last_synced: str


class AssetSpec(BaseModel):
    label: str
    value: str


class AssetNode(BaseModel):
    id: str
    label: str
    status: Optional[Literal["healthy", "warning", "critical"]] = None
    children: Optional[List["AssetNode"]] = None


class AssetDetail(BaseModel):
    id: str
    name: str
    category: str
    status: Literal["healthy", "warning", "critical"]
    health_pct: float
    temperature_c: Optional[float] = None
    vibration_mms: Optional[float] = None
    efficiency_pct: Optional[float] = None
    runtime_hours: Optional[float] = None
    operational_status: str
    last_inspected: str
    telemetry_source: Literal["real", "simulated", "derived"]
    specs: List[AssetSpec]


class MissionTime(BaseModel):
    utc_time: str
    iso: str



# ---------------------------------------------------------------------------
# In-memory link state (per-process; resets on restart)
# ---------------------------------------------------------------------------

_link_state: dict = {
    "connected": True,
    "last_synced": datetime.now(timezone.utc).strftime("%H:%M UTC"),
}

# ---------------------------------------------------------------------------
# Baseline stats — loaded once at module import
# ---------------------------------------------------------------------------

_BASELINE_PATH = _REPO_ROOT / "data" / "baseline_stats.json"

try:
    with open(_BASELINE_PATH, "r", encoding="utf-8") as _f:
        _BASELINE: dict = json.load(_f)
except FileNotFoundError:
    _BASELINE = {}

# ---------------------------------------------------------------------------
# Station capacities (fixed; from official IAP documentation)
# ---------------------------------------------------------------------------

_STATION_CAPS = {
    "maitri": {"summer": 25, "winter": 25},
    "bharati": {"summer": 47, "winter": 47},
}

# ---------------------------------------------------------------------------
# What-if scenario catalogue (hardcoded; simulation module not yet built)
# ---------------------------------------------------------------------------

_WHATIF_CATALOGUE: dict[str, dict] = {
    "generator_failure": {
        "timeline": [
            {"day": 0, "event": "Generator failure detected on primary power bus"},
            {"day": 1, "event": "Backup generation activated; non-critical lab heaters throttled"},
            {"day": 2, "event": "Fuel consumption increases by 18% on secondary unit"},
            {"day": 3, "event": "Scheduled maintenance window required for injector rebuild"},
        ],
        "recommendations": [
            "Activate backup generation immediately",
            "Prioritize critical life-support and habitat heating loads",
            "Schedule emergency generator mechanical inspection",
            "Monitor diesel reserve drawdown rate",
        ],
    },
    "blizzard": {
        "timeline": [
            {"day": 0, "event": "Category 3 Blizzard warning triggered; wind gusting 32 m/s"},
            {"day": 1, "event": "External HVAC intake filters iced; switch to recirculated mode"},
            {"day": 2, "event": "Station structural thermal leakage increases generator load to 490 kW"},
            {"day": 3, "event": "Blizzard winds subside; external antenna alignment verification required"},
        ],
        "recommendations": [
            "Seal outer airlocks and engage emergency perimeter heating",
            "Preheat secondary backup generators to avoid cold-start stall",
            "Lock down external transport and outside scientific array tasks",
            "Reroute vital satellite comms to redundant radome feed",
        ],
    },
    "resupply_delay": {
        "timeline": [
            {"day": 0, "event": "Supply vessel polar ice encounter; arrival delayed by 45 days"},
            {"day": 1, "event": "Logistics audit locks current diesel stock at 41 days reserve"},
            {"day": 2, "event": "Thermal setpoint reduced to 18°C across non-habitation modules"},
            {"day": 3, "event": "Extended ration schedule initiated; medical supplies verified stable"},
        ],
        "recommendations": [
            "Reduce non-essential research power usage during night hours",
            "Implement stage-1 fuel conservation protocol",
            "Re-evaluate food inventory expiry horizons and freeze-dry balance",
            "Coordinate with Bharati station for inter-station supply contingency",
        ],
    },
}

# ---------------------------------------------------------------------------
# Anomaly detection helpers
# ---------------------------------------------------------------------------

_SIGMA_THRESHOLD = 2.0  # flag if |z-score| > 2

_VAR_MAP = {
    # CSV column → (frontend variable name, human-readable label)
    "tempr": "temperature_c",
    "ws": "wind_speed",
    "ap": "pressure_hpa",
}


def _severity_from_z(z: float) -> Literal["low", "medium", "high"]:
    abs_z = abs(z)
    if abs_z >= 4.0:
        return "high"
    if abs_z >= 3.0:
        return "medium"
    return "low"


def _detect_anomalies(station_id: str) -> List[AnomalyItem]:
    """
    Load the latest row from the processed CSV, look up per-month-hour
    baseline stats, and return variables that deviate by > _SIGMA_THRESHOLD σ.
    """
    csv = _csv_path(station_id)
    if not csv.exists():
        return []

    df = pd.read_csv(csv, parse_dates=["obstime"])
    if df.empty:
        return []

    df = df.sort_values("obstime")
    latest = df.iloc[-1]
    ts = latest["obstime"]

    # Build baseline key: "MM_HH"
    month_str = f"{ts.month:02d}"
    hour_str = f"{ts.hour:02d}"
    key = f"{month_str}_{hour_str}"

    station_baseline = _BASELINE.get(station_id, {})
    anomalies: List[AnomalyItem] = []

    for col, var_name in _VAR_MAP.items():
        raw = _nullable(latest.get(col))
        if raw is None:
            continue

        var_baseline = station_baseline.get(col, {})
        slot = var_baseline.get(key)
        if slot is None:
            continue

        mean = slot.get("mean")
        std = slot.get("std")
        if mean is None or std is None or std == 0:
            continue

        z = (raw - mean) / std
        if abs(z) > _SIGMA_THRESHOLD:
            anomalies.append(
                AnomalyItem(
                    variable=var_name,
                    value=round(raw, 2),
                    baseline_mean=round(mean, 4),
                    baseline_stddev=round(std, 4),
                    severity=_severity_from_z(z),
                )
            )

    return anomalies


# ---------------------------------------------------------------------------
# GET /stations
# ---------------------------------------------------------------------------


@router.get(
    "/stations",
    response_model=List[StationMeta],
    summary="List all stations",
)
def list_stations() -> List[StationMeta]:
    """Return a list of all registered Antarctic research stations."""
    result = []
    for sid, info in STATIONS.items():
        caps = _STATION_CAPS.get(sid, {"summer": 0, "winter": 0})
        result.append(
            StationMeta(
                id=sid,
                name=info["name"],
                lat=info["lat"],
                lon=info["lon"],
                capacity_summer=caps["summer"],
                capacity_winter=caps["winter"],
            )
        )
    return result


# ---------------------------------------------------------------------------
# GET /stations/{station_id}/anomalies
# ---------------------------------------------------------------------------


@router.get(
    "/stations/{station_id}/anomalies",
    response_model=List[AnomalyItem],
    summary="Anomaly detection for a station",
)
def get_station_anomalies(station_id: str) -> List[AnomalyItem]:
    """
    Compare the latest weather observation to per-month-hour historical
    baselines (baseline_stats.json). Returns variables that deviate by
    more than 2 standard deviations from their expected value.
    """
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Station '{station_id}' not found. "
                f"Valid options are: {sorted(STATIONS.keys())}"
            ),
        )

    return _detect_anomalies(station_id)


# ---------------------------------------------------------------------------
# POST /stations/{station_id}/simulate
# ---------------------------------------------------------------------------


@router.post(
    "/stations/{station_id}/simulate",
    response_model=SimulateResult,
    summary="Run a what-if simulation",
)
def simulate_whatif(station_id: str, body: SimulateRequest) -> SimulateResult:
    """
    Run a pre-defined what-if scenario for the given station.

    The simulation module is not yet built; responses are drawn from a
    curated catalogue of realistic cascade timelines and recommendations.
    """
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Station '{station_id}' not found. "
                f"Valid options are: {sorted(STATIONS.keys())}"
            ),
        )

    scenario = _WHATIF_CATALOGUE.get(body.trigger)
    if scenario is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown trigger: '{body.trigger}'",
        )

    return SimulateResult(
        timeline=[TimelineEvent(**e) for e in scenario["timeline"]],
        recommendations=scenario["recommendations"],
    )


# ---------------------------------------------------------------------------
# GET /link/status
# ---------------------------------------------------------------------------


@router.get(
    "/link/status",
    response_model=LinkStatusResponse,
    summary="Satellite link status",
)
def get_link_status() -> LinkStatusResponse:
    """Return the current satellite link connection state."""
    return LinkStatusResponse(**_link_state)


# ---------------------------------------------------------------------------
# POST /link/toggle
# ---------------------------------------------------------------------------


@router.post(
    "/link/toggle",
    response_model=LinkStatusResponse,
    summary="Toggle satellite link",
)
def toggle_link() -> LinkStatusResponse:
    """Toggle the satellite link between connected and disconnected."""
    _link_state["connected"] = not _link_state["connected"]
    _link_state["last_synced"] = datetime.now(timezone.utc).strftime("%H:%M UTC")
    return LinkStatusResponse(**_link_state)


# ---------------------------------------------------------------------------
# GET /system/time — UTC Mission Time
# ---------------------------------------------------------------------------


@router.get(
    "/system/time",
    response_model=MissionTime,
    summary="Current UTC mission time",
)
def get_mission_time() -> MissionTime:
    """Return the current UTC mission time."""
    now = datetime.now(timezone.utc)
    return MissionTime(
        utc_time=now.strftime("%H:%M:%S UTC"),
        iso=now.isoformat(),
    )


# ---------------------------------------------------------------------------
# Asset hierarchy and telemetry catalogue — per-station, time-varying
# ---------------------------------------------------------------------------

import math as _math
import random as _random


def _jitter(base: float, pct: float, seed: int) -> float:
    """Return base ± pct% using a deterministic seed that changes every 3 min."""
    _random.seed(seed)
    delta = base * pct / 100.0
    return round(base + _random.uniform(-delta, delta), 1)


def _time_seed(asset_id: str, station_id: str) -> int:
    """Seed that changes every 3 minutes — same within a 3-min window, different between stations."""
    slot = int(datetime.now(timezone.utc).timestamp()) // 180
    return hash(f"{station_id}:{asset_id}:{slot}") & 0x7FFFFFFF


# ---------------------------------------------------------------------------
# Station-specific base telemetry offsets
#
# Maitri  — smaller, older station on Schirmacher Oasis (Queen Maud Land)
#           colder inland site, older generator fleet, smaller fuel reserve
# Bharati — newer, larger station in Prydz Bay (Larsemann Hills)
#           coastal site, less extreme wind chill, fresher equipment
# ---------------------------------------------------------------------------

_STATION_OFFSETS: dict[str, dict] = {
    "maitri": {
        # Power — older diesel generators, higher wear
        "gen-01": dict(health=89, temp=76,  vib=2.6,  eff=87,  hours=5410,
                       fuel_rate="41.3 L/h", voltage="411 V 3-Phase", oil="4.5 bar",
                       op="Operational", inspected="2026-09-14 07:00 UTC", status="healthy"),
        "gen-02": dict(health=61, temp=97,  vib=6.2,  eff=74,  hours=7890,
                       fuel_rate="49.8 L/h", voltage="402 V 3-Phase", oil="3.4 bar",
                       op="High Vibration — Inspection Due", inspected="2026-09-05 09:00 UTC", status="warning"),
        "battery-sys": dict(health=91, temp=22, vib=0.2, eff=91, hours=7300,
                            soc="84%", cycles="538", voltage="476 V DC",
                            op="Buffer Charging", inspected="2026-09-18 10:00 UTC", status="healthy"),
        # Water
        "water-pump": dict(health=88, temp=46, vib=2.4, eff=84, hours=3100,
                           flow="3.9 m³/h", pressure="2.9 bar", trace="Active (+3°C)",
                           op="Operational", inspected="2026-09-17 07:30 UTC", status="healthy"),
        "water-storage": dict(health=96, temp=5, vib=0.0, eff=98, hours=12200,
                              volume="14,800 L", capacity="20,000 L", heaters="Standby (Auto)",
                              op="Holding Nominal", inspected="2026-09-22 14:00 UTC", status="healthy"),
        # Buildings
        "bld-main": dict(health=90, temp=20, vib=0.3, eff=89, hours=22000,
                         pressure="1011 hPa", hvac="+20.1°C", airlocks="14",
                         op="Nominal", inspected="2026-09-18 08:00 UTC", status="healthy"),
        "bld-lab":  dict(health=93, temp=19, vib=0.5, eff=92, hours=18000,
                         filter="99.97% HEPA", delta_p="41 Pa", load="36 kW",
                         op="Active Research", inspected="2026-09-20 09:00 UTC", status="healthy"),
        "bld-storage": dict(health=87, temp=-10, vib=0.2, eff=86, hours=28000,
                            insulation="R-44", fire="Inert Gas Armed",
                            op="Sub-Zero Storage", inspected="2026-09-12 13:00 UTC", status="healthy"),
        # Logistics
        "log-food":    dict(health=82, days=24, dry="1,520 kg", frozen="810 kg", kcal="3,200 kcal",
                            op="24 Days at Standard Burn Rate", inspected="2026-09-24 07:00 UTC", status="healthy"),
        "log-diesel":  dict(health=58, days=32, t1="61% (38,400 L)", t2="49% (30,800 L)", trend="1,480 L/day",
                            op="32 Days Reserve (Threshold 45d)", inspected="2026-09-24 10:00 UTC", status="warning"),
        "log-medical": dict(health=99, o2="12 / 12 Full", trauma="Certified Exp 2028", tele="Ready",
                            op="100% Critical Supplies Green", inspected="2026-09-23 12:00 UTC", status="healthy"),
        "log-water":   dict(health=89, consumption="920 L/day", reserve="16.1 Days",
                            op="14,800 L Available", inspected="2026-09-24 05:00 UTC", status="healthy"),
        "log-spares":  dict(health=84, injectors="3 units", hvac_belts="6 sets", cables="10 kits",
                            op="Minor Gaps — Restocking Requested", inspected="2026-09-16 14:00 UTC", status="healthy"),
    },
    "bharati": {
        # Power — newer plant, coastal climate, higher efficiency
        "gen-01": dict(health=97, temp=69,  vib=1.8,  eff=93,  hours=2640,
                       fuel_rate="36.4 L/h", voltage="416 V 3-Phase", oil="4.9 bar",
                       op="Operational", inspected="2026-09-20 11:00 UTC", status="healthy"),
        "gen-02": dict(health=78, temp=84,  vib=4.2,  eff=84,  hours=4380,
                       fuel_rate="42.6 L/h", voltage="410 V 3-Phase", oil="4.1 bar",
                       op="Elevated Thermal State", inspected="2026-09-12 13:00 UTC", status="warning"),
        "battery-sys": dict(health=99, temp=18, vib=0.1, eff=97, hours=8760,
                            soc="95%", cycles="312", voltage="481 V DC",
                            op="Float Charging", inspected="2026-09-24 16:00 UTC", status="healthy"),
        # Water
        "water-pump": dict(health=96, temp=40, vib=1.5, eff=92, hours=1540,
                           flow="5.1 m³/h", pressure="3.5 bar", trace="Active (+5°C)",
                           op="Operational", inspected="2026-09-23 09:00 UTC", status="healthy"),
        "water-storage": dict(health=99, temp=7, vib=0.0, eff=100, hours=15800,
                              volume="21,200 L", capacity="28,000 L", heaters="Standby (Auto)",
                              op="Holding Nominal", inspected="2026-09-25 16:00 UTC", status="healthy"),
        # Buildings
        "bld-main": dict(health=97, temp=22, vib=0.2, eff=95, hours=28500,
                         pressure="1014 hPa", hvac="+22.0°C", airlocks="21",
                         op="Nominal Pressurization", inspected="2026-09-22 10:00 UTC", status="healthy"),
        "bld-lab":  dict(health=98, temp=21, vib=0.3, eff=97, hours=24000,
                         filter="99.97% HEPA", delta_p="48 Pa", load="51 kW",
                         op="Active Research Operations", inspected="2026-09-25 11:00 UTC", status="healthy"),
        "bld-storage": dict(health=94, temp=-6, vib=0.1, eff=93, hours=33000,
                            insulation="R-52", fire="Inert Gas Armed",
                            op="Stable Sub-Zero Storage", inspected="2026-09-17 15:00 UTC", status="healthy"),
        # Logistics
        "log-food":    dict(health=94, days=39, dry="2,100 kg", frozen="1,140 kg", kcal="3,200 kcal",
                            op="39 Days at Standard Burn Rate", inspected="2026-09-25 08:00 UTC", status="healthy"),
        "log-diesel":  dict(health=83, days=52, t1="83% (52,200 L)", t2="71% (44,600 L)", trend="1,790 L/day",
                            op="52 Days Reserve (Threshold 45d)", inspected="2026-09-25 12:00 UTC", status="healthy"),
        "log-medical": dict(health=99, o2="12 / 12 Full", trauma="Certified Exp 2029", tele="Ready",
                            op="100% Critical Supplies Green", inspected="2026-09-24 14:00 UTC", status="healthy"),
        "log-water":   dict(health=96, consumption="1,280 L/day", reserve="16.6 Days",
                            op="21,200 L Available", inspected="2026-09-25 06:00 UTC", status="healthy"),
        "log-spares":  dict(health=94, injectors="5 units", hvac_belts="10 sets", cables="14 kits",
                            op="Full Critical Spares Inventory", inspected="2026-09-21 16:30 UTC", status="healthy"),
    },
}


def _build_asset_tree(station_id: str) -> List[AssetNode]:
    """Return the asset hierarchy with station-specific statuses."""
    off = _STATION_OFFSETS.get(station_id, _STATION_OFFSETS["maitri"])
    return [
        AssetNode(
            id="power", label="POWER",
            status="warning" if off["gen-02"]["status"] == "warning" else "healthy",
            children=[
                AssetNode(id="gen-01",      label="Generator 01",   status=off["gen-01"]["status"]),
                AssetNode(id="gen-02",      label="Generator 02",   status=off["gen-02"]["status"]),
                AssetNode(id="battery-sys", label="Battery System", status=off["battery-sys"]["status"]),
            ],
        ),
        AssetNode(
            id="water", label="WATER", status="healthy",
            children=[
                AssetNode(id="water-pump",    label="Pump",    status=off["water-pump"]["status"]),
                AssetNode(id="water-storage", label="Storage", status=off["water-storage"]["status"]),
            ],
        ),
        AssetNode(
            id="buildings", label="BUILDINGS", status="healthy",
            children=[
                AssetNode(id="bld-main",    label="Main Building", status=off["bld-main"]["status"]),
                AssetNode(id="bld-lab",     label="Laboratory",    status=off["bld-lab"]["status"]),
                AssetNode(id="bld-storage", label="Storage",       status=off["bld-storage"]["status"]),
            ],
        ),
        AssetNode(
            id="logistics", label="LOGISTICS",
            status="warning" if any(
                off[k]["status"] == "warning"
                for k in ("log-food", "log-diesel", "log-medical", "log-water", "log-spares")
            ) else "healthy",
            children=[
                AssetNode(id="log-food",    label="Food",    status=off["log-food"]["status"]),
                AssetNode(id="log-diesel",  label="Diesel",  status=off["log-diesel"]["status"]),
                AssetNode(id="log-medical", label="Medical", status=off["log-medical"]["status"]),
                AssetNode(id="log-water",   label="Water",   status=off["log-water"]["status"]),
                AssetNode(id="log-spares",  label="Spares",  status=off["log-spares"]["status"]),
            ],
        ),
    ]


def _build_asset_detail(asset_id: str, station_id: str) -> AssetDetail | None:
    """
    Build a live AssetDetail for the given asset and station.
    Numeric telemetry fields drift ±3% every 3 minutes using a time-seeded
    deterministic jitter so repeated calls in the same window return the same
    value (no flicker), but change between windows.
    """
    off = _STATION_OFFSETS.get(station_id, _STATION_OFFSETS["maitri"])
    o = off.get(asset_id)
    if o is None:
        return None

    seed = _time_seed(asset_id, station_id)

    def j(val: float, pct: float = 3.0) -> float:
        return _jitter(val, pct, seed ^ hash(str(val)))

    # ------------------------------------------------------------------ power
    if asset_id == "gen-01":
        return AssetDetail(
            id=asset_id, name="Generator 01", category="POWER INFRASTRUCTURE",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Rated Output",        value="250 kW"),
                AssetSpec(label="Fuel Rate",            value=o["fuel_rate"]),
                AssetSpec(label="Alternator Voltage",   value=o["voltage"]),
                AssetSpec(label="Oil Pressure",         value=o["oil"]),
            ],
        )

    if asset_id == "gen-02":
        return AssetDetail(
            id=asset_id, name="Generator 02", category="POWER INFRASTRUCTURE",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Rated Output",        value="250 kW"),
                AssetSpec(label="Fuel Rate",            value=o["fuel_rate"]),
                AssetSpec(label="Alternator Voltage",   value=o["voltage"]),
                AssetSpec(label="Oil Pressure",         value=o["oil"]),
            ],
        )

    if asset_id == "battery-sys":
        return AssetDetail(
            id=asset_id, name="Battery System", category="POWER INFRASTRUCTURE",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Capacity",        value="360 kWh"),
                AssetSpec(label="State of Charge", value=o["soc"]),
                AssetSpec(label="Cycle Count",     value=o["cycles"]),
                AssetSpec(label="Bus Voltage",     value=o["voltage"]),
            ],
        )

    # ------------------------------------------------------------------ water
    if asset_id == "water-pump":
        return AssetDetail(
            id=asset_id, name="Primary Meltwater Pump", category="WATER LIFESUPPORT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Flow Rate",          value=o["flow"]),
                AssetSpec(label="Discharge Pressure", value=o["pressure"]),
                AssetSpec(label="Trace Heating",      value=o["trace"]),
            ],
        )

    if asset_id == "water-storage":
        return AssetDetail(
            id=asset_id, name="Insulated Reservoir", category="WATER LIFESUPPORT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Current Volume",    value=o["volume"]),
                AssetSpec(label="Capacity",          value=o["capacity"]),
                AssetSpec(label="Immersion Heaters", value=o["heaters"]),
            ],
        )

    # ---------------------------------------------------------------- buildings
    if asset_id == "bld-main":
        return AssetDetail(
            id=asset_id, name="Main Habitation Module", category="BUILDINGS & HABITAT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Internal Pressure",    value=o["pressure"]),
                AssetSpec(label="HVAC Return Air",      value=o["hvac"]),
                AssetSpec(label="Airlock Cycles / Day", value=o["airlocks"]),
            ],
        )

    if asset_id == "bld-lab":
        return AssetDetail(
            id=asset_id, name="Scientific Laboratory", category="BUILDINGS & HABITAT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Clean Room Filter",  value=o["filter"]),
                AssetSpec(label="Clean Air Delta-P",  value=o["delta_p"]),
                AssetSpec(label="Instrument Load",    value=o["load"]),
            ],
        )

    if asset_id == "bld-storage":
        return AssetDetail(
            id=asset_id, name="Cold Logistics Bunker", category="BUILDINGS & HABITAT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Insulation R-Value", value=o["insulation"]),
                AssetSpec(label="Fire Suppression",   value=o["fire"]),
            ],
        )

    # --------------------------------------------------------------- logistics
    if asset_id == "log-food":
        return AssetDetail(
            id=asset_id, name="Food & Rations Stockpile", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="Dry Freeze Rations", value=o["dry"]),
                AssetSpec(label="Frozen Provisions",  value=o["frozen"]),
                AssetSpec(label="Per Capita Daily",   value=o["kcal"]),
            ],
        )

    if asset_id == "log-diesel":
        return AssetDetail(
            id=asset_id, name="Arctic Fuel Reserves", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="Tank 1 (Main)",     value=o["t1"]),
                AssetSpec(label="Tank 2 (Reserve)",  value=o["t2"]),
                AssetSpec(label="Consumption Trend", value=o["trend"]),
            ],
        )

    if asset_id == "log-medical":
        return AssetDetail(
            id=asset_id, name="Medical Clinic Infirmary", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="O2 Cylinders",       value=o["o2"]),
                AssetSpec(label="Trauma Packs",        value=o["trauma"]),
                AssetSpec(label="Telemedicine Link",   value=o["tele"]),
            ],
        )

    if asset_id == "log-water":
        return AssetDetail(
            id=asset_id, name="Potable Water Buffer", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="Daily Consumption",   value=o["consumption"]),
                AssetSpec(label="Autonomous Reserve",  value=o["reserve"]),
            ],
        )

    if asset_id == "log-spares":
        return AssetDetail(
            id=asset_id, name="Mechanical & Electrical Spares", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="Gen Injector Kits",    value=o["injectors"]),
                AssetSpec(label="HVAC Belts & Motors",  value=o["hvac_belts"]),
                AssetSpec(label="Cable Splice Kits",    value=o["cables"]),
            ],
        )

    return None


# ---------------------------------------------------------------------------
# GET /stations/{station_id}/assets
# ---------------------------------------------------------------------------


@router.get(
    "/stations/{station_id}/assets",
    response_model=List[AssetNode],
    summary="Subsystem asset tree for a station",
)
def get_station_assets(station_id: str) -> List[AssetNode]:
    """Return the asset hierarchy with live statuses for the given station."""
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Station '{station_id}' not found. Valid options: {sorted(STATIONS.keys())}",
        )
    return _build_asset_tree(station_id)


# ---------------------------------------------------------------------------
# GET /stations/{station_id}/assets/{asset_id}
# ---------------------------------------------------------------------------


@router.get(
    "/stations/{station_id}/assets/{asset_id}",
    response_model=AssetDetail,
    response_model_exclude_none=True,
    summary="Asset diagnostic details for a station",
)
def get_station_asset(station_id: str, asset_id: str) -> AssetDetail:
    """Return live diagnostic details for a specific asset node at the given station."""
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Station '{station_id}' not found. Valid options: {sorted(STATIONS.keys())}",
        )
    asset = _build_asset_detail(asset_id, station_id)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found.")
    return asset



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

# app/api/stations.py
"""
Router for station-related endpoints.

GET  /stations                        → list all stations
GET  /stations/{station_id}/current   → latest telemetry snapshot
GET  /stations/{station_id}/anomalies → anomaly detection against baselines
POST /stations/{station_id}/simulate  → what-if simulation
GET  /link/status                     → satellite link state
POST /link/toggle                     → toggle link connected/disconnected
"""

import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Literal, Optional

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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


# ---------------------------------------------------------------------------
# Response models for new endpoints
# ---------------------------------------------------------------------------


class StationMeta(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    capacity_summer: int
    capacity_winter: int


class AnomalyItem(BaseModel):
    variable: str
    value: float
    baseline_mean: float
    baseline_stddev: float
    severity: Literal["low", "medium", "high"]


class TimelineEvent(BaseModel):
    day: int
    event: str


class SimulateRequest(BaseModel):
    trigger: Literal["generator_failure", "blizzard", "resupply_delay"]


class SimulateResult(BaseModel):
    timeline: List[TimelineEvent]
    recommendations: List[str]


class LinkStatusResponse(BaseModel):
    connected: bool
    last_synced: str


class AssetSpec(BaseModel):
    label: str
    value: str


class AssetNode(BaseModel):
    id: str
    label: str
    status: Optional[Literal["healthy", "warning", "critical"]] = None
    children: Optional[List["AssetNode"]] = None


class AssetDetail(BaseModel):
    id: str
    name: str
    category: str
    status: Literal["healthy", "warning", "critical"]
    health_pct: float
    temperature_c: Optional[float] = None
    vibration_mms: Optional[float] = None
    efficiency_pct: Optional[float] = None
    runtime_hours: Optional[float] = None
    operational_status: str
    last_inspected: str
    telemetry_source: Literal["real", "simulated", "derived"]
    specs: List[AssetSpec]


class MissionTime(BaseModel):
    utc_time: str
    iso: str



# ---------------------------------------------------------------------------
# In-memory link state (per-process; resets on restart)
# ---------------------------------------------------------------------------

_link_state: dict = {
    "connected": True,
    "last_synced": datetime.now(timezone.utc).strftime("%H:%M UTC"),
}

# ---------------------------------------------------------------------------
# Baseline stats — loaded once at module import
# ---------------------------------------------------------------------------

_BASELINE_PATH = _REPO_ROOT / "data" / "baseline_stats.json"

try:
    with open(_BASELINE_PATH, "r", encoding="utf-8") as _f:
        _BASELINE: dict = json.load(_f)
except FileNotFoundError:
    _BASELINE = {}

# ---------------------------------------------------------------------------
# Station capacities (fixed; from official IAP documentation)
# ---------------------------------------------------------------------------

_STATION_CAPS = {
    "maitri": {"summer": 25, "winter": 25},
    "bharati": {"summer": 47, "winter": 47},
}

# ---------------------------------------------------------------------------
# What-if scenario catalogue (hardcoded; simulation module not yet built)
# ---------------------------------------------------------------------------

_WHATIF_CATALOGUE: dict[str, dict] = {
    "generator_failure": {
        "timeline": [
            {"day": 0, "event": "Generator failure detected on primary power bus"},
            {"day": 1, "event": "Backup generation activated; non-critical lab heaters throttled"},
            {"day": 2, "event": "Fuel consumption increases by 18% on secondary unit"},
            {"day": 3, "event": "Scheduled maintenance window required for injector rebuild"},
        ],
        "recommendations": [
            "Activate backup generation immediately",
            "Prioritize critical life-support and habitat heating loads",
            "Schedule emergency generator mechanical inspection",
            "Monitor diesel reserve drawdown rate",
        ],
    },
    "blizzard": {
        "timeline": [
            {"day": 0, "event": "Category 3 Blizzard warning triggered; wind gusting 32 m/s"},
            {"day": 1, "event": "External HVAC intake filters iced; switch to recirculated mode"},
            {"day": 2, "event": "Station structural thermal leakage increases generator load to 490 kW"},
            {"day": 3, "event": "Blizzard winds subside; external antenna alignment verification required"},
        ],
        "recommendations": [
            "Seal outer airlocks and engage emergency perimeter heating",
            "Preheat secondary backup generators to avoid cold-start stall",
            "Lock down external transport and outside scientific array tasks",
            "Reroute vital satellite comms to redundant radome feed",
        ],
    },
    "resupply_delay": {
        "timeline": [
            {"day": 0, "event": "Supply vessel polar ice encounter; arrival delayed by 45 days"},
            {"day": 1, "event": "Logistics audit locks current diesel stock at 41 days reserve"},
            {"day": 2, "event": "Thermal setpoint reduced to 18°C across non-habitation modules"},
            {"day": 3, "event": "Extended ration schedule initiated; medical supplies verified stable"},
        ],
        "recommendations": [
            "Reduce non-essential research power usage during night hours",
            "Implement stage-1 fuel conservation protocol",
            "Re-evaluate food inventory expiry horizons and freeze-dry balance",
            "Coordinate with Bharati station for inter-station supply contingency",
        ],
    },
}

# ---------------------------------------------------------------------------
# Anomaly detection helpers
# ---------------------------------------------------------------------------

_SIGMA_THRESHOLD = 2.0  # flag if |z-score| > 2

_VAR_MAP = {
    # CSV column → (frontend variable name, human-readable label)
    "tempr": "temperature_c",
    "ws": "wind_speed",
    "ap": "pressure_hpa",
}


def _severity_from_z(z: float) -> Literal["low", "medium", "high"]:
    abs_z = abs(z)
    if abs_z >= 4.0:
        return "high"
    if abs_z >= 3.0:
        return "medium"
    return "low"


def _detect_anomalies(station_id: str) -> List[AnomalyItem]:
    """
    Load the latest row from the processed CSV, look up per-month-hour
    baseline stats, and return variables that deviate by > _SIGMA_THRESHOLD σ.
    """
    csv = _csv_path(station_id)
    if not csv.exists():
        return []

    df = pd.read_csv(csv, parse_dates=["obstime"])
    if df.empty:
        return []

    df = df.sort_values("obstime")
    latest = df.iloc[-1]
    ts = latest["obstime"]

    # Build baseline key: "MM_HH"
    month_str = f"{ts.month:02d}"
    hour_str = f"{ts.hour:02d}"
    key = f"{month_str}_{hour_str}"

    station_baseline = _BASELINE.get(station_id, {})
    anomalies: List[AnomalyItem] = []

    for col, var_name in _VAR_MAP.items():
        raw = _nullable(latest.get(col))
        if raw is None:
            continue

        var_baseline = station_baseline.get(col, {})
        slot = var_baseline.get(key)
        if slot is None:
            continue

        mean = slot.get("mean")
        std = slot.get("std")
        if mean is None or std is None or std == 0:
            continue

        z = (raw - mean) / std
        if abs(z) > _SIGMA_THRESHOLD:
            anomalies.append(
                AnomalyItem(
                    variable=var_name,
                    value=round(raw, 2),
                    baseline_mean=round(mean, 4),
                    baseline_stddev=round(std, 4),
                    severity=_severity_from_z(z),
                )
            )

    return anomalies


# ---------------------------------------------------------------------------
# GET /stations
# ---------------------------------------------------------------------------


@router.get(
    "/stations",
    response_model=List[StationMeta],
    summary="List all stations",
)
def list_stations() -> List[StationMeta]:
    """Return a list of all registered Antarctic research stations."""
    result = []
    for sid, info in STATIONS.items():
        caps = _STATION_CAPS.get(sid, {"summer": 0, "winter": 0})
        result.append(
            StationMeta(
                id=sid,
                name=info["name"],
                lat=info["lat"],
                lon=info["lon"],
                capacity_summer=caps["summer"],
                capacity_winter=caps["winter"],
            )
        )
    return result


# ---------------------------------------------------------------------------
# GET /stations/{station_id}/anomalies
# ---------------------------------------------------------------------------


@router.get(
    "/stations/{station_id}/anomalies",
    response_model=List[AnomalyItem],
    summary="Anomaly detection for a station",
)
def get_station_anomalies(station_id: str) -> List[AnomalyItem]:
    """
    Compare the latest weather observation to per-month-hour historical
    baselines (baseline_stats.json). Returns variables that deviate by
    more than 2 standard deviations from their expected value.
    """
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Station '{station_id}' not found. "
                f"Valid options are: {sorted(STATIONS.keys())}"
            ),
        )

    return _detect_anomalies(station_id)


# ---------------------------------------------------------------------------
# POST /stations/{station_id}/simulate
# ---------------------------------------------------------------------------


@router.post(
    "/stations/{station_id}/simulate",
    response_model=SimulateResult,
    summary="Run a what-if simulation",
)
def simulate_whatif(station_id: str, body: SimulateRequest) -> SimulateResult:
    """
    Run a pre-defined what-if scenario for the given station.

    The simulation module is not yet built; responses are drawn from a
    curated catalogue of realistic cascade timelines and recommendations.
    """
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Station '{station_id}' not found. "
                f"Valid options are: {sorted(STATIONS.keys())}"
            ),
        )

    scenario = _WHATIF_CATALOGUE.get(body.trigger)
    if scenario is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown trigger: '{body.trigger}'",
        )

    return SimulateResult(
        timeline=[TimelineEvent(**e) for e in scenario["timeline"]],
        recommendations=scenario["recommendations"],
    )


# ---------------------------------------------------------------------------
# GET /link/status
# ---------------------------------------------------------------------------


@router.get(
    "/link/status",
    response_model=LinkStatusResponse,
    summary="Satellite link status",
)
def get_link_status() -> LinkStatusResponse:
    """Return the current satellite link connection state."""
    return LinkStatusResponse(**_link_state)


# ---------------------------------------------------------------------------
# POST /link/toggle
# ---------------------------------------------------------------------------


@router.post(
    "/link/toggle",
    response_model=LinkStatusResponse,
    summary="Toggle satellite link",
)
def toggle_link() -> LinkStatusResponse:
    """Toggle the satellite link between connected and disconnected."""
    _link_state["connected"] = not _link_state["connected"]
    _link_state["last_synced"] = datetime.now(timezone.utc).strftime("%H:%M UTC")
    return LinkStatusResponse(**_link_state)


# ---------------------------------------------------------------------------
# GET /system/time — UTC Mission Time
# ---------------------------------------------------------------------------


@router.get(
    "/system/time",
    response_model=MissionTime,
    summary="Current UTC mission time",
)
def get_mission_time() -> MissionTime:
    """Return the current UTC mission time."""
    now = datetime.now(timezone.utc)
    return MissionTime(
        utc_time=now.strftime("%H:%M:%S UTC"),
        iso=now.isoformat(),
    )


# ---------------------------------------------------------------------------
# Asset hierarchy and telemetry catalogue — per-station, time-varying
# ---------------------------------------------------------------------------

import math as _math
import random as _random


def _jitter(base: float, pct: float, seed: int) -> float:
    """Return base ± pct% using a deterministic seed that changes every 3 min."""
    _random.seed(seed)
    delta = base * pct / 100.0
    return round(base + _random.uniform(-delta, delta), 1)


def _time_seed(asset_id: str, station_id: str) -> int:
    """Seed that changes every 3 minutes — same within a 3-min window, different between stations."""
    slot = int(datetime.now(timezone.utc).timestamp()) // 180
    return hash(f"{station_id}:{asset_id}:{slot}") & 0x7FFFFFFF


# ---------------------------------------------------------------------------
# Station-specific base telemetry offsets
#
# Maitri  — smaller, older station on Schirmacher Oasis (Queen Maud Land)
#           colder inland site, older generator fleet, smaller fuel reserve
# Bharati — newer, larger station in Prydz Bay (Larsemann Hills)
#           coastal site, less extreme wind chill, fresher equipment
# ---------------------------------------------------------------------------

_STATION_OFFSETS: dict[str, dict] = {
    "maitri": {
        # Power — older diesel generators, higher wear
        "gen-01": dict(health=89, temp=76,  vib=2.6,  eff=87,  hours=5410,
                       fuel_rate="41.3 L/h", voltage="411 V 3-Phase", oil="4.5 bar",
                       op="Operational", inspected="2026-09-14 07:00 UTC", status="healthy"),
        "gen-02": dict(health=61, temp=97,  vib=6.2,  eff=74,  hours=7890,
                       fuel_rate="49.8 L/h", voltage="402 V 3-Phase", oil="3.4 bar",
                       op="High Vibration — Inspection Due", inspected="2026-09-05 09:00 UTC", status="warning"),
        "battery-sys": dict(health=91, temp=22, vib=0.2, eff=91, hours=7300,
                            soc="84%", cycles="538", voltage="476 V DC",
                            op="Buffer Charging", inspected="2026-09-18 10:00 UTC", status="healthy"),
        # Water
        "water-pump": dict(health=88, temp=46, vib=2.4, eff=84, hours=3100,
                           flow="3.9 m³/h", pressure="2.9 bar", trace="Active (+3°C)",
                           op="Operational", inspected="2026-09-17 07:30 UTC", status="healthy"),
        "water-storage": dict(health=96, temp=5, vib=0.0, eff=98, hours=12200,
                              volume="14,800 L", capacity="20,000 L", heaters="Standby (Auto)",
                              op="Holding Nominal", inspected="2026-09-22 14:00 UTC", status="healthy"),
        # Buildings
        "bld-main": dict(health=90, temp=20, vib=0.3, eff=89, hours=22000,
                         pressure="1011 hPa", hvac="+20.1°C", airlocks="14",
                         op="Nominal", inspected="2026-09-18 08:00 UTC", status="healthy"),
        "bld-lab":  dict(health=93, temp=19, vib=0.5, eff=92, hours=18000,
                         filter="99.97% HEPA", delta_p="41 Pa", load="36 kW",
                         op="Active Research", inspected="2026-09-20 09:00 UTC", status="healthy"),
        "bld-storage": dict(health=87, temp=-10, vib=0.2, eff=86, hours=28000,
                            insulation="R-44", fire="Inert Gas Armed",
                            op="Sub-Zero Storage", inspected="2026-09-12 13:00 UTC", status="healthy"),
        # Logistics
        "log-food":    dict(health=82, days=24, dry="1,520 kg", frozen="810 kg", kcal="3,200 kcal",
                            op="24 Days at Standard Burn Rate", inspected="2026-09-24 07:00 UTC", status="healthy"),
        "log-diesel":  dict(health=58, days=32, t1="61% (38,400 L)", t2="49% (30,800 L)", trend="1,480 L/day",
                            op="32 Days Reserve (Threshold 45d)", inspected="2026-09-24 10:00 UTC", status="warning"),
        "log-medical": dict(health=99, o2="12 / 12 Full", trauma="Certified Exp 2028", tele="Ready",
                            op="100% Critical Supplies Green", inspected="2026-09-23 12:00 UTC", status="healthy"),
        "log-water":   dict(health=89, consumption="920 L/day", reserve="16.1 Days",
                            op="14,800 L Available", inspected="2026-09-24 05:00 UTC", status="healthy"),
        "log-spares":  dict(health=84, injectors="3 units", hvac_belts="6 sets", cables="10 kits",
                            op="Minor Gaps — Restocking Requested", inspected="2026-09-16 14:00 UTC", status="healthy"),
    },
    "bharati": {
        # Power — newer plant, coastal climate, higher efficiency
        "gen-01": dict(health=97, temp=69,  vib=1.8,  eff=93,  hours=2640,
                       fuel_rate="36.4 L/h", voltage="416 V 3-Phase", oil="4.9 bar",
                       op="Operational", inspected="2026-09-20 11:00 UTC", status="healthy"),
        "gen-02": dict(health=78, temp=84,  vib=4.2,  eff=84,  hours=4380,
                       fuel_rate="42.6 L/h", voltage="410 V 3-Phase", oil="4.1 bar",
                       op="Elevated Thermal State", inspected="2026-09-12 13:00 UTC", status="warning"),
        "battery-sys": dict(health=99, temp=18, vib=0.1, eff=97, hours=8760,
                            soc="95%", cycles="312", voltage="481 V DC",
                            op="Float Charging", inspected="2026-09-24 16:00 UTC", status="healthy"),
        # Water
        "water-pump": dict(health=96, temp=40, vib=1.5, eff=92, hours=1540,
                           flow="5.1 m³/h", pressure="3.5 bar", trace="Active (+5°C)",
                           op="Operational", inspected="2026-09-23 09:00 UTC", status="healthy"),
        "water-storage": dict(health=99, temp=7, vib=0.0, eff=100, hours=15800,
                              volume="21,200 L", capacity="28,000 L", heaters="Standby (Auto)",
                              op="Holding Nominal", inspected="2026-09-25 16:00 UTC", status="healthy"),
        # Buildings
        "bld-main": dict(health=97, temp=22, vib=0.2, eff=95, hours=28500,
                         pressure="1014 hPa", hvac="+22.0°C", airlocks="21",
                         op="Nominal Pressurization", inspected="2026-09-22 10:00 UTC", status="healthy"),
        "bld-lab":  dict(health=98, temp=21, vib=0.3, eff=97, hours=24000,
                         filter="99.97% HEPA", delta_p="48 Pa", load="51 kW",
                         op="Active Research Operations", inspected="2026-09-25 11:00 UTC", status="healthy"),
        "bld-storage": dict(health=94, temp=-6, vib=0.1, eff=93, hours=33000,
                            insulation="R-52", fire="Inert Gas Armed",
                            op="Stable Sub-Zero Storage", inspected="2026-09-17 15:00 UTC", status="healthy"),
        # Logistics
        "log-food":    dict(health=94, days=39, dry="2,100 kg", frozen="1,140 kg", kcal="3,200 kcal",
                            op="39 Days at Standard Burn Rate", inspected="2026-09-25 08:00 UTC", status="healthy"),
        "log-diesel":  dict(health=83, days=52, t1="83% (52,200 L)", t2="71% (44,600 L)", trend="1,790 L/day",
                            op="52 Days Reserve (Threshold 45d)", inspected="2026-09-25 12:00 UTC", status="healthy"),
        "log-medical": dict(health=99, o2="12 / 12 Full", trauma="Certified Exp 2029", tele="Ready",
                            op="100% Critical Supplies Green", inspected="2026-09-24 14:00 UTC", status="healthy"),
        "log-water":   dict(health=96, consumption="1,280 L/day", reserve="16.6 Days",
                            op="21,200 L Available", inspected="2026-09-25 06:00 UTC", status="healthy"),
        "log-spares":  dict(health=94, injectors="5 units", hvac_belts="10 sets", cables="14 kits",
                            op="Full Critical Spares Inventory", inspected="2026-09-21 16:30 UTC", status="healthy"),
    },
}


def _build_asset_tree(station_id: str) -> List[AssetNode]:
    """Return the asset hierarchy with station-specific statuses."""
    off = _STATION_OFFSETS.get(station_id, _STATION_OFFSETS["maitri"])
    return [
        AssetNode(
            id="power", label="POWER",
            status="warning" if off["gen-02"]["status"] == "warning" else "healthy",
            children=[
                AssetNode(id="gen-01",      label="Generator 01",   status=off["gen-01"]["status"]),
                AssetNode(id="gen-02",      label="Generator 02",   status=off["gen-02"]["status"]),
                AssetNode(id="battery-sys", label="Battery System", status=off["battery-sys"]["status"]),
            ],
        ),
        AssetNode(
            id="water", label="WATER", status="healthy",
            children=[
                AssetNode(id="water-pump",    label="Pump",    status=off["water-pump"]["status"]),
                AssetNode(id="water-storage", label="Storage", status=off["water-storage"]["status"]),
            ],
        ),
        AssetNode(
            id="buildings", label="BUILDINGS", status="healthy",
            children=[
                AssetNode(id="bld-main",    label="Main Building", status=off["bld-main"]["status"]),
                AssetNode(id="bld-lab",     label="Laboratory",    status=off["bld-lab"]["status"]),
                AssetNode(id="bld-storage", label="Storage",       status=off["bld-storage"]["status"]),
            ],
        ),
        AssetNode(
            id="logistics", label="LOGISTICS",
            status="warning" if any(
                off[k]["status"] == "warning"
                for k in ("log-food", "log-diesel", "log-medical", "log-water", "log-spares")
            ) else "healthy",
            children=[
                AssetNode(id="log-food",    label="Food",    status=off["log-food"]["status"]),
                AssetNode(id="log-diesel",  label="Diesel",  status=off["log-diesel"]["status"]),
                AssetNode(id="log-medical", label="Medical", status=off["log-medical"]["status"]),
                AssetNode(id="log-water",   label="Water",   status=off["log-water"]["status"]),
                AssetNode(id="log-spares",  label="Spares",  status=off["log-spares"]["status"]),
            ],
        ),
    ]


def _build_asset_detail(asset_id: str, station_id: str) -> AssetDetail | None:
    """
    Build a live AssetDetail for the given asset and station.
    Numeric telemetry fields drift ±3% every 3 minutes using a time-seeded
    deterministic jitter so repeated calls in the same window return the same
    value (no flicker), but change between windows.
    """
    off = _STATION_OFFSETS.get(station_id, _STATION_OFFSETS["maitri"])
    o = off.get(asset_id)
    if o is None:
        return None

    seed = _time_seed(asset_id, station_id)

    def j(val: float, pct: float = 3.0) -> float:
        return _jitter(val, pct, seed ^ hash(str(val)))

    # ------------------------------------------------------------------ power
    if asset_id == "gen-01":
        return AssetDetail(
            id=asset_id, name="Generator 01", category="POWER INFRASTRUCTURE",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Rated Output",        value="250 kW"),
                AssetSpec(label="Fuel Rate",            value=o["fuel_rate"]),
                AssetSpec(label="Alternator Voltage",   value=o["voltage"]),
                AssetSpec(label="Oil Pressure",         value=o["oil"]),
            ],
        )

    if asset_id == "gen-02":
        return AssetDetail(
            id=asset_id, name="Generator 02", category="POWER INFRASTRUCTURE",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Rated Output",        value="250 kW"),
                AssetSpec(label="Fuel Rate",            value=o["fuel_rate"]),
                AssetSpec(label="Alternator Voltage",   value=o["voltage"]),
                AssetSpec(label="Oil Pressure",         value=o["oil"]),
            ],
        )

    if asset_id == "battery-sys":
        return AssetDetail(
            id=asset_id, name="Battery System", category="POWER INFRASTRUCTURE",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Capacity",        value="360 kWh"),
                AssetSpec(label="State of Charge", value=o["soc"]),
                AssetSpec(label="Cycle Count",     value=o["cycles"]),
                AssetSpec(label="Bus Voltage",     value=o["voltage"]),
            ],
        )

    # ------------------------------------------------------------------ water
    if asset_id == "water-pump":
        return AssetDetail(
            id=asset_id, name="Primary Meltwater Pump", category="WATER LIFESUPPORT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Flow Rate",          value=o["flow"]),
                AssetSpec(label="Discharge Pressure", value=o["pressure"]),
                AssetSpec(label="Trace Heating",      value=o["trace"]),
            ],
        )

    if asset_id == "water-storage":
        return AssetDetail(
            id=asset_id, name="Insulated Reservoir", category="WATER LIFESUPPORT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Current Volume",    value=o["volume"]),
                AssetSpec(label="Capacity",          value=o["capacity"]),
                AssetSpec(label="Immersion Heaters", value=o["heaters"]),
            ],
        )

    # ---------------------------------------------------------------- buildings
    if asset_id == "bld-main":
        return AssetDetail(
            id=asset_id, name="Main Habitation Module", category="BUILDINGS & HABITAT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Internal Pressure",    value=o["pressure"]),
                AssetSpec(label="HVAC Return Air",      value=o["hvac"]),
                AssetSpec(label="Airlock Cycles / Day", value=o["airlocks"]),
            ],
        )

    if asset_id == "bld-lab":
        return AssetDetail(
            id=asset_id, name="Scientific Laboratory", category="BUILDINGS & HABITAT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Clean Room Filter",  value=o["filter"]),
                AssetSpec(label="Clean Air Delta-P",  value=o["delta_p"]),
                AssetSpec(label="Instrument Load",    value=o["load"]),
            ],
        )

    if asset_id == "bld-storage":
        return AssetDetail(
            id=asset_id, name="Cold Logistics Bunker", category="BUILDINGS & HABITAT",
            status=o["status"], health_pct=j(o["health"]),
            temperature_c=j(o["temp"]), vibration_mms=round(j(o["vib"], 5), 2),
            efficiency_pct=j(o["eff"]), runtime_hours=round(j(o["hours"], 0.1)),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="simulated",
            specs=[
                AssetSpec(label="Insulation R-Value", value=o["insulation"]),
                AssetSpec(label="Fire Suppression",   value=o["fire"]),
            ],
        )

    # --------------------------------------------------------------- logistics
    if asset_id == "log-food":
        return AssetDetail(
            id=asset_id, name="Food & Rations Stockpile", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="Dry Freeze Rations", value=o["dry"]),
                AssetSpec(label="Frozen Provisions",  value=o["frozen"]),
                AssetSpec(label="Per Capita Daily",   value=o["kcal"]),
            ],
        )

    if asset_id == "log-diesel":
        return AssetDetail(
            id=asset_id, name="Arctic Fuel Reserves", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="Tank 1 (Main)",     value=o["t1"]),
                AssetSpec(label="Tank 2 (Reserve)",  value=o["t2"]),
                AssetSpec(label="Consumption Trend", value=o["trend"]),
            ],
        )

    if asset_id == "log-medical":
        return AssetDetail(
            id=asset_id, name="Medical Clinic Infirmary", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="O2 Cylinders",       value=o["o2"]),
                AssetSpec(label="Trauma Packs",        value=o["trauma"]),
                AssetSpec(label="Telemedicine Link",   value=o["tele"]),
            ],
        )

    if asset_id == "log-water":
        return AssetDetail(
            id=asset_id, name="Potable Water Buffer", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="Daily Consumption",   value=o["consumption"]),
                AssetSpec(label="Autonomous Reserve",  value=o["reserve"]),
            ],
        )

    if asset_id == "log-spares":
        return AssetDetail(
            id=asset_id, name="Mechanical & Electrical Spares", category="LOGISTICS & SURVIVAL",
            status=o["status"], health_pct=j(o["health"]),
            operational_status=o["op"], last_inspected=o["inspected"],
            telemetry_source="derived",
            specs=[
                AssetSpec(label="Gen Injector Kits",    value=o["injectors"]),
                AssetSpec(label="HVAC Belts & Motors",  value=o["hvac_belts"]),
                AssetSpec(label="Cable Splice Kits",    value=o["cables"]),
            ],
        )

    return None


# ---------------------------------------------------------------------------
# GET /stations/{station_id}/assets
# ---------------------------------------------------------------------------


@router.get(
    "/stations/{station_id}/assets",
    response_model=List[AssetNode],
    summary="Subsystem asset tree for a station",
)
def get_station_assets(station_id: str) -> List[AssetNode]:
    """Return the asset hierarchy with live statuses for the given station."""
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Station '{station_id}' not found. Valid options: {sorted(STATIONS.keys())}",
        )
    return _build_asset_tree(station_id)


# ---------------------------------------------------------------------------
# GET /stations/{station_id}/assets/{asset_id}
# ---------------------------------------------------------------------------


@router.get(
    "/stations/{station_id}/assets/{asset_id}",
    response_model=AssetDetail,
    response_model_exclude_none=True,
    summary="Asset diagnostic details for a station",
)
def get_station_asset(station_id: str, asset_id: str) -> AssetDetail:
    """Return live diagnostic details for a specific asset node at the given station."""
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Station '{station_id}' not found. Valid options: {sorted(STATIONS.keys())}",
        )
    asset = _build_asset_detail(asset_id, station_id)
    if asset is None:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found.")
    return asset