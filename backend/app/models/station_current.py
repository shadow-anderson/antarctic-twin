# app/models/station_current.py
"""
Pydantic response models for the GET /stations/{station_id}/current endpoint.

The shape here is a locked contract — do not change field names or nesting
without coordinating with the frontend developer.
"""

from typing import Literal, Optional
from pydantic import BaseModel


class Metric(BaseModel):
    """A single non-nullable telemetry value with its provenance label."""

    value: float
    source: Literal["real", "simulated", "derived"]


class NullableMetric(BaseModel):
    """A telemetry value that can be None when the data source has a gap.
    Retained for potential future use; not used for weather in the current
    contract (weather rows are pre-filtered to guarantee non-null values).
    """

    value: Optional[float]
    source: Literal["real", "simulated", "derived"]


class WeatherBlock(BaseModel):
    """Weather readings — all three values are guaranteed non-null.
    The router selects the most-recent row where tempr, ap, AND ws
    are simultaneously present, so no field here can ever be None.
    """

    temperature_c: Metric
    wind_speed_ms: Metric
    pressure_hpa: Metric


class EnergyBlock(BaseModel):
    generation_kw: Metric
    consumption_kw: Metric
    diesel_pct: Metric

    def __getitem__(self, item: str):
        return getattr(self, item)

    def __setitem__(self, item: str, value):
        setattr(self, item, value)


class LogisticsBlock(BaseModel):
    food_days_remaining: Metric
    diesel_days_remaining: Metric

    def __getitem__(self, item: str):
        return getattr(self, item)

    def __setitem__(self, item: str, value):
        setattr(self, item, value)


class StationCurrent(BaseModel):
    station_id: str
    observation_time: str  # ISO 8601 — most recent row with all weather fields non-null
    weather: WeatherBlock
    energy: EnergyBlock
    logistics: LogisticsBlock


class ForecastPoint(BaseModel):
    day: int
    days_remaining: float


class ThresholdCrossing(BaseModel):
    threshold_label: str      # "warning" or "critical"
    threshold_days: float
    projected_day: int | None   # None if never crossed within the 30-day window


class ResourceForecast(BaseModel):
    resource: str              # "diesel" or "food"
    current_days_remaining: float
    burn_rate_multiplier: float
    status: str                # "nominal", "warning", or "critical"
    daily_projection: list[ForecastPoint]
    threshold_crossings: list[ThresholdCrossing]


class StationForecast(BaseModel):
    station_id: str
    diesel: ResourceForecast
    food: ResourceForecast

