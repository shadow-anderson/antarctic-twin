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
    """A telemetry value that can be None when the data source has a gap."""

    value: Optional[float]
    source: Literal["real", "simulated", "derived"]


class WeatherBlock(BaseModel):
    """Weather readings — values may be None when the latest CSV row has gaps."""

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
    timestamp: str  # ISO 8601 string — most recent row with full weather data
    weather: WeatherBlock
    energy: EnergyBlock
    logistics: LogisticsBlock
