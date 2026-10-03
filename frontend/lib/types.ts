export type DataSource = "real" | "simulated" | "derived";

export interface Metric {
  value: number;
  source: DataSource;
}

export interface NullableMetric {
  value: number | null;
  source: DataSource;
}

export interface StationCurrent {
  station_id: string;
  observation_time: string;
  weather: {
    temperature_c: Metric;
    wind_speed_ms: Metric;
    pressure_hpa: Metric;
  };
  energy: {
    generation_kw: Metric;
    consumption_kw: Metric;
    diesel_pct: Metric;
  };
  logistics: {
    food_days_remaining: Metric;
    diesel_days_remaining: Metric;
  };
}


export interface Anomaly {
  variable: string;
  value: number;
  baseline_mean: number;
  baseline_stddev: number;
  severity: "low" | "medium" | "high";
}

export interface WhatIfResult {
  timeline: { day: number; event: string }[];
  recommendations: string[];
  /** Optional verdict fields from feat/hierarchy backend. Absent on older deployments. */
  urgency?: "urgent" | "warning" | "monitor";
  days_until_critical?: number | null;
}

export interface LinkStatus {
  connected: boolean;
  last_synced: string;
  is_live?: boolean;
}

// Supporting UI types for Asset hierarchy & telemetry
export type AssetStatus = "healthy" | "warning" | "critical";

export interface AssetNode {
  id: string;
  label: string;
  status?: AssetStatus;
  children?: AssetNode[];
}

export interface AssetDetail {
  id: string;
  name: string;
  category: string;
  status: AssetStatus;
  health_pct: number;
  temperature_c?: number;
  vibration_mms?: number;
  efficiency_pct?: number;
  runtime_hours?: number;
  operational_status: string;
  last_inspected: string;
  telemetry_source: DataSource;
  specs: { label: string; value: string }[];
}

export type ScenarioTrigger = "generator_failure" | "blizzard" | "resupply_delay";

export interface ScenarioDefinition {
  id: ScenarioTrigger;
  title: string;
  tagline: string;
  description: string;
  impact_summary: string[];
}

export interface ForecastPoint {
  day: number;
  days_remaining: number;
}

export interface ThresholdCrossing {
  threshold_label: "warning" | "critical";
  threshold_days: number;
  projected_day: number | null;
}

export interface ResourceForecast {
  resource: "diesel" | "food";
  current_days_remaining: number;
  burn_rate_multiplier: number;
  status: "nominal" | "warning" | "critical";
  daily_projection: ForecastPoint[];
  threshold_crossings: ThresholdCrossing[];
}

export interface StationForecast {
  station_id: string;
  diesel: ResourceForecast;
  food: ResourceForecast;
}

