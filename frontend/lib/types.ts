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
  timestamp: string;
  weather: {
    temperature_c: NullableMetric;
    wind_speed_ms: NullableMetric;
    pressure_hpa: NullableMetric;
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
}

export interface LinkStatus {
  connected: boolean;
  last_synced: string;
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
