# app/models/station_current.py
"""
Pydantic response models for the GET /stations/{station_id}/current endpoint.

The shape here is a locked contract — do not change field names or nesting
without coordinating with the frontend developer.
"""

from typing import Literal, Optional
from pydantic import BaseModel


class Metric(BaseModel):
    """A single telemetry value with its provenance label."""

    value: float
    source: Literal["real", "simulated", "derived"]


class NullableMetric(BaseModel):
    """
    Like Metric but value may be None when the underlying data has a gap.
    Used for weather fields that can genuinely be missing in the raw CSV.
    """

    value: Optional[float]
    source: Literal["real", "simulated", "derived"]


class WeatherBlock(BaseModel):
    temperature_c: NullableMetric
    wind_speed_ms: NullableMetric
    pressure_hpa: NullableMetric


class EnergyBlock(BaseModel):
    generation_kw: Metric
    consumption_kw: Metric
    diesel_pct: Metric


class LogisticsBlock(BaseModel):
    food_days_remaining: Metric
    diesel_days_remaining: Metric


class StationCurrent(BaseModel):
    station_id: str
    timestamp: str  # ISO 8601 string from obstime
    weather: WeatherBlock
    energy: EnergyBlock
    logistics: LogisticsBlock
