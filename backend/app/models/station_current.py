# app/models/station_current.py
"""
Pydantic response models for the GET /stations/{station_id}/current endpoint.

The shape here is a locked contract — do not change field names or nesting
without coordinating with the frontend developer.
"""

from typing import Literal
from pydantic import BaseModel


class Metric(BaseModel):
    """A single telemetry value with its provenance label."""

    value: float
    source: Literal["real", "simulated", "derived"]


class WeatherBlock(BaseModel):
    """All three fields are guaranteed non-null (router selects the most
    recent row where tempr, ap, and ws are all present simultaneously)."""

    temperature_c: Metric
    wind_speed_ms: Metric
    pressure_hpa: Metric


class EnergyBlock(BaseModel):
    generation_kw: Metric
    consumption_kw: Metric
    diesel_pct: Metric


class LogisticsBlock(BaseModel):
    food_days_remaining: Metric
    diesel_days_remaining: Metric


class StationCurrent(BaseModel):
    station_id: str
    observation_time: str  # ISO 8601 string — most recent row with full weather data
    weather: WeatherBlock
    energy: EnergyBlock
    logistics: LogisticsBlock
