
# app/api/stations.py
"""
Router for station-related endpoints.

GET  /stations                        → list all stations
GET  /stations/{station_id}/current   → latest telemetry snapshot
GET  /stations/{station_id}/anomalies → anomaly detection against baselines
GET  /stations/{station_id}/forecast  → 30-day depletion forecast for diesel & food
POST /stations/{station_id}/simulate  → what-if simulation
GET  /link/status                     → satellite link state
POST /link/toggle                     → toggle link connected/disconnected
"""

import json
import math
import os
import random as _random
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Literal, Optional

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.station_current import (
    EnergyBlock,
    ForecastPoint,
    LogisticsBlock,
    Metric,
    ResourceForecast,
    StationCurrent,
    StationForecast,
    ThresholdCrossing,
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
# Baseline nominal energy / logistics values (one per station).
# These are unjittered base figures. Live values returned by
# get_station_current() apply a time-seeded ±jitter on top of these.
# ---------------------------------------------------------------------------

_BASE_ENERGY: dict[str, dict[str, float]] = {
    "maitri": {
        "generation_kw": 142.0,
        "consumption_kw": 119.0,
        "diesel_pct": 61.0,
        "food_days_remaining": 68.0,
        "diesel_days_remaining": 42.0,
    },
    "bharati": {
        "generation_kw": 187.0,
        "consumption_kw": 154.0,
        "diesel_pct": 58.0,
        "food_days_remaining": 74.0,
        "diesel_days_remaining": 37.0,
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


def _jitter(base: float, pct: float, seed: int) -> float:
    """Return base ± pct% using a deterministic seed that changes every 3 min."""
    _random.seed(seed)
    delta = base * pct / 100.0
    return round(base + _random.uniform(-delta, delta), 1)


def _time_seed(asset_id: str, station_id: str, slot: int | None = None) -> int:
    """Seed that changes every 3 minutes — same within a 3-min window, different between stations."""
    if slot is None:
        slot = int(datetime.now(timezone.utc).timestamp()) // 180
    return hash(f"{station_id}:{asset_id}:{slot}") & 0x7FFFFFFF


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
    merged with time-jittered energy/logistics telemetry derived from base values.

    Raises 404 if the station_id is not recognised.
    Raises 503 if the processed CSV cannot be found, is empty, or has no
    row where tempr, ap, AND ws are all simultaneously non-null.

    All three weather fields (temperature_c, wind_speed_ms, pressure_hpa)
    are guaranteed non-null: the router pre-filters the CSV to rows where
    all three columns are present, then takes the most recent such row.
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

    # 3. Find the most-recent row where tempr, ap, AND ws are ALL non-null.
    #    This guarantees the WeatherBlock has no None values.
    complete = df.dropna(subset=["tempr", "ap", "ws"]).sort_values(
        "obstime", ascending=False
    )
    if complete.empty:
        raise HTTPException(
            status_code=503,
            detail=(
                f"No row in '{station_id}' CSV has all three weather fields "
                "(tempr, ap, ws) non-null simultaneously."
            ),
        )
    latest = complete.iloc[0]

    obs_time = latest["obstime"]
    # Ensure ISO 8601 string regardless of pandas version
    if hasattr(obs_time, "isoformat"):
        observation_time_str = obs_time.isoformat()
    else:
        observation_time_str = str(obs_time)

    # 4. Build weather block — all values guaranteed non-null by row selection above
    weather = WeatherBlock(
        temperature_c=Metric(value=float(latest["tempr"]), source="real"),
        wind_speed_ms=Metric(value=float(latest["ws"]),   source="real"),
        pressure_hpa= Metric(value=float(latest["ap"]),   source="real"),
    )

    # 5. Assemble response with time-jittered energy & logistics telemetry
    base = _BASE_ENERGY[station_id]
    energy = EnergyBlock(
        generation_kw=Metric(
            value=_jitter(base["generation_kw"], 4.0, _time_seed("generation_kw", station_id)),
            source="simulated",
        ),
        consumption_kw=Metric(
            value=_jitter(base["consumption_kw"], 4.0, _time_seed("consumption_kw", station_id)),
            source="simulated",
        ),
        diesel_pct=Metric(
            value=_jitter(base["diesel_pct"], 1.5, _time_seed("diesel_pct", station_id)),
            source="simulated",
        ),
    )
    logistics = LogisticsBlock(
        food_days_remaining=Metric(
            value=_jitter(base["food_days_remaining"], 1.0, _time_seed("food_days_remaining", station_id)),
            source="simulated",
        ),
        diesel_days_remaining=Metric(
            value=_jitter(base["diesel_days_remaining"], 1.0, _time_seed("diesel_days_remaining", station_id)),
            source="simulated",
        ),
    )
    return StationCurrent(
        station_id=station_id,
        observation_time=observation_time_str,
        weather=weather,
        energy=energy,
        logistics=logistics,
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
# What-if scenario parameters — HOW each scenario affects the station.
# These multipliers are applied to the station's live state to compute
# projected values; no canned output text is stored here.
# ---------------------------------------------------------------------------

_SCENARIO_PARAMS: dict[str, dict] = {
    "generator_failure": {
        "generation_multiplier": 0.55,   # lose ~45% of generation capacity
        "consumption_multiplier": 1.0,   # consumption unchanged
        "diesel_burn_multiplier": 1.30,  # backup generator burns diesel faster
        "trigger_event": "Generator failure detected on primary power bus",
    },
    "blizzard": {
        "generation_multiplier": 0.85,   # reduced efficiency in extreme cold/wind
        "consumption_multiplier": 1.25,  # heating/HVAC load spike
        "diesel_burn_multiplier": 1.20,
        "trigger_event": "Category 3 blizzard warning triggered; wind gusting 32 m/s",
    },
    "resupply_delay": {
        "generation_multiplier": 1.0,
        "consumption_multiplier": 1.0,
        "diesel_burn_multiplier": 1.0,
        "resupply_delay_days": 45,        # this scenario delays restock, not burn rate
        "trigger_event": "Supply vessel encountered polar ice; arrival delayed",
    },
}


# ---------------------------------------------------------------------------
# What-if computation engine
# ---------------------------------------------------------------------------


def compute_whatif(station_id: str, trigger: str) -> SimulateResult:
    """
    Compute a realistic what-if simulation result from the station's current
    state and the named scenario's physics multipliers.

    Steps:
      1. Fetch station's current state via get_station_current(station_id).
      2. Apply scenario multipliers to compute post-event generation,
         consumption, and diesel reserves.
      3. Compute days_until_critical — when diesel reaches 15% threshold.
      4. Build a dynamic timeline and urgency-tiered recommendations from
         the computed numbers, not from fixed text.
    """
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Station '{station_id}' not found. Valid options are: {sorted(STATIONS.keys())}",
        )
    if trigger not in _SCENARIO_PARAMS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown trigger: '{trigger}'",
        )

    params = _SCENARIO_PARAMS[trigger]
    current = get_station_current(station_id)

    # --- 1. Current station state ---
    cur_gen_kw = current.energy.generation_kw.value
    cur_con_kw = current.energy.consumption_kw.value
    cur_diesel_pct = current.energy.diesel_pct.value
    raw_diesel_days = current.logistics.diesel_days_remaining.value
    cur_food_days = current.logistics.food_days_remaining.value

    # Nominal capacity reference from baseline unjittered values
    nominal_pct = _BASE_ENERGY[station_id]["diesel_pct"]
    cur_diesel_days = raw_diesel_days * (cur_diesel_pct / nominal_pct)

    # --- 2. Apply scenario multipliers ---
    gen_mult = params["generation_multiplier"]
    con_mult = params["consumption_multiplier"]
    burn_mult = params["diesel_burn_multiplier"]

    new_generation_kw = cur_gen_kw * gen_mult
    new_consumption_kw = cur_con_kw * con_mult
    new_diesel_days_remaining = (
        cur_diesel_days if trigger == "resupply_delay" else cur_diesel_days / burn_mult
    )

    # --- 3. Compute days until diesel crosses 15% critical threshold ---
    days_until_critical = max(0, round(new_diesel_days_remaining * 0.15))

    # --- 4. Build timeline dynamically ---
    timeline: list[TimelineEvent] = []

    if trigger == "resupply_delay":
        delay_days = params["resupply_delay_days"]
        timeline.append(TimelineEvent(day=0, event=params["trigger_event"]))

        diesel_shortfall = delay_days > cur_diesel_days
        food_shortfall = delay_days > cur_food_days

        if diesel_shortfall or food_shortfall:
            if diesel_shortfall and food_shortfall:
                first_out_days = min(cur_diesel_days, cur_food_days)
                resource = "Diesel" if cur_diesel_days <= cur_food_days else "Food"
                timeline.append(
                    TimelineEvent(
                        day=round(first_out_days),
                        event=(
                            f"{resource} reserves exhausted on day {round(first_out_days)} "
                            f"— {delay_days - round(first_out_days)} days before resupply arrives"
                        ),
                    )
                )
            elif diesel_shortfall:
                timeline.append(
                    TimelineEvent(
                        day=round(cur_diesel_days),
                        event=(
                            f"Diesel reserves exhausted on day {round(cur_diesel_days)} "
                            f"— {delay_days - round(cur_diesel_days)} days before resupply arrives"
                        ),
                    )
                )
            else:
                timeline.append(
                    TimelineEvent(
                        day=round(cur_food_days),
                        event=(
                            f"Food reserves exhausted on day {round(cur_food_days)} "
                            f"— {delay_days - round(cur_food_days)} days before resupply arrives"
                        ),
                    )
                )
        else:
            timeline.append(
                TimelineEvent(
                    day=delay_days,
                    event=(
                        f"Supply vessel arrives on day {delay_days}; "
                        f"diesel (+{cur_diesel_days - delay_days:.0f}d) and "
                        f"food (+{cur_food_days - delay_days:.0f}d) reserves held"
                    ),
                )
            )
    else:
        timeline.append(TimelineEvent(day=0, event=params["trigger_event"]))
        timeline.append(
            TimelineEvent(
                day=1,
                event=f"Generation drops to {new_generation_kw:.0f} kW, consumption at {new_consumption_kw:.0f} kW",
            )
        )
        timeline.append(
            TimelineEvent(
                day=days_until_critical,
                event=(
                    f"Diesel reserves fall below 15% operational threshold "
                    f"(projected {new_diesel_days_remaining:.0f}-day reserve exhausted early)"
                ),
            )
        )

    # --- 5. Urgency-tiered recommendations ---
    recs: list[str] = []

    if trigger == "resupply_delay":
        delay_days = params["resupply_delay_days"]
        if cur_diesel_days < delay_days or cur_food_days < delay_days:
            first_out = min(cur_diesel_days, cur_food_days)
            first_resource = "diesel" if cur_diesel_days <= cur_food_days else "food"
            shortfall = delay_days - first_out
            if first_out <= 10:
                recs.append(
                    f"URGENT: {first_resource} reserve exhausted in {round(first_out)} days ({round(shortfall)} days before resupply) — implement emergency rationing immediately"
                )
            else:
                recs.append(
                    f"WARNING: projected {first_resource} deficit of {round(shortfall)} days before resupply on day {delay_days} — activate stage-1 conservation"
                )
        else:
            recs.append(
                f"Reserves adequate for {delay_days}-day delay; maintain standard polar inventory monitoring"
            )
        recs += [
            "Reduce non-essential research power usage during night hours",
            "Audit food inventory and transition to emergency freeze-dried rationing",
            "Coordinate with nearby international stations for emergency supply air-drop contingency",
        ]
    else:
        if days_until_critical <= 3:
            recs.append(
                f"URGENT: diesel reserve critical within {days_until_critical} days — initiate emergency load shedding immediately"
            )
        elif days_until_critical <= 7:
            recs.append(
                f"WARNING: diesel reaches 15% operational threshold in {days_until_critical} days — begin non-critical load reduction now"
            )
        else:
            recs.append(
                f"Monitor diesel burn rate; 15% operational threshold reached in {days_until_critical} days under current conditions"
            )

        if trigger == "generator_failure":
            recs += [
                "Prioritize critical life-support and habitat heating loads over auxiliary research",
                "Schedule emergency mechanical inspection and injector rebuild on backup generator",
                f"Projected net balance: {new_generation_kw - new_consumption_kw:+.0f} kW — request priority spare parts resupply",
            ]
        else:  # blizzard
            recs += [
                "Seal outer airlocks and engage emergency perimeter heating systems",
                "Lock down external transport and suspend outdoor scientific array operations",
                "Reroute power to maintain primary satellite communication radomes and life support",
            ]

    return SimulateResult(
        timeline=timeline,
        recommendations=recs,
    )


# ---------------------------------------------------------------------------
# Depletion forecast computation engine
# ---------------------------------------------------------------------------


def compute_forecast(station_id: str) -> StationForecast:
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Station '{station_id}' not found. Valid options are: {sorted(STATIONS.keys())}",
        )

    current = get_station_current(station_id)

    gen_kw = current.energy.generation_kw.value
    con_kw = current.energy.consumption_kw.value
    diesel_days = current.logistics.diesel_days_remaining.value
    food_days = current.logistics.food_days_remaining.value

    # --- Diesel: burn rate accelerates if consumption exceeds generation ---
    # (deficit means backup/reserve diesel draw is happening right now)
    deficit_ratio = max(0.0, (con_kw - gen_kw) / gen_kw) if gen_kw > 0 else 0.0
    diesel_burn_rate = 1.0 + deficit_ratio   # 1.0 = nominal, >1.0 = accelerated

    # --- Food: no power-linked acceleration, straightforward depletion ---
    food_burn_rate = 1.0

    def build_resource_forecast(resource_name: str, days_remaining: float, burn_rate: float) -> ResourceForecast:
        WARNING_DAYS = 15.0
        CRITICAL_DAYS = 7.0

        projection: list[ForecastPoint] = []
        for day in range(0, 31):  # day 0 through day 30 inclusive
            remaining = max(0.0, days_remaining - (day * burn_rate))
            projection.append(ForecastPoint(day=day, days_remaining=round(remaining, 1)))

        def find_crossing_day(threshold: float) -> int | None:
            for point in projection:
                if point.days_remaining <= threshold:
                    return point.day
            return None

        crossings = [
            ThresholdCrossing(
                threshold_label="warning",
                threshold_days=WARNING_DAYS,
                projected_day=find_crossing_day(WARNING_DAYS),
            ),
            ThresholdCrossing(
                threshold_label="critical",
                threshold_days=CRITICAL_DAYS,
                projected_day=find_crossing_day(CRITICAL_DAYS),
            ),
        ]

        if days_remaining <= CRITICAL_DAYS:
            status = "critical"
        elif days_remaining <= WARNING_DAYS:
            status = "warning"
        else:
            status = "nominal"

        return ResourceForecast(
            resource=resource_name,
            current_days_remaining=round(days_remaining, 1),
            burn_rate_multiplier=round(burn_rate, 2),
            status=status,
            daily_projection=projection,
            threshold_crossings=crossings,
        )

    return StationForecast(
        station_id=station_id,
        diesel=build_resource_forecast("diesel", diesel_days, diesel_burn_rate),
        food=build_resource_forecast("food", food_days, food_burn_rate),
    )


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
# GET /stations/{station_id}/forecast
# ---------------------------------------------------------------------------


@router.get("/stations/{station_id}/forecast", response_model=StationForecast)
def get_station_forecast(station_id: str) -> StationForecast:
    return compute_forecast(station_id)


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
    Run a what-if scenario simulation for the given station.

    Results are computed dynamically from the station's current energy and
    logistics telemetry (generation_kw, consumption_kw, diesel_pct,
    diesel_days_remaining, food_days_remaining) combined with the scenario's
    physics multipliers in _SCENARIO_PARAMS. Timeline events and recommendation
    urgency are derived from the computed projected values — not from static canned catalogues.
    """
    if station_id not in STATIONS:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Station '{station_id}' not found. "
                f"Valid options are: {sorted(STATIONS.keys())}"
            ),
        )

    if body.trigger not in _SCENARIO_PARAMS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown trigger: '{body.trigger}'",
        )

    return compute_whatif(station_id, body.trigger)


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

