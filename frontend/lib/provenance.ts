import { DataSource } from "./types";

export interface ProvenanceEntry {
  key: string;
  label: string;
  source: DataSource;
  origin: string;
}

/** Registry of every metric / data surface and its provenance */
export const PROVENANCE_REGISTRY: ProvenanceEntry[] = [
  // ── WEATHER (Real – archived) ─────────────────────────────────────────
  {
    key: "weather_temperature",
    label: "Temperature",
    source: "real",
    origin: "NCPOR/IMD AWS archive",
  },
  {
    key: "weather_wind_speed",
    label: "Wind Speed",
    source: "real",
    origin: "NCPOR/IMD AWS archive",
  },
  {
    key: "weather_pressure",
    label: "Atmospheric Pressure",
    source: "real",
    origin: "NCPOR/IMD AWS archive",
  },
  // ── ENERGY (Simulated) ─────────────────────────────────────────────────
  {
    key: "energy_generation",
    label: "Power Generation",
    source: "simulated",
    origin: "Seeded microgrid model",
  },
  {
    key: "energy_consumption",
    label: "Power Consumption",
    source: "simulated",
    origin: "Seeded microgrid model",
  },
  {
    key: "energy_diesel_pct",
    label: "Diesel Fuel Level",
    source: "simulated",
    origin: "Seeded microgrid model",
  },
  // ── LOGISTICS (Simulated) ─────────────────────────────────────────────
  {
    key: "logistics_food_days",
    label: "Food Rations Reserve",
    source: "simulated",
    origin: "Seeded logistics model",
  },
  {
    key: "logistics_diesel_days",
    label: "Diesel Autonomy",
    source: "simulated",
    origin: "Seeded logistics model",
  },
  // ── ASSET TELEMETRY (Simulated) ───────────────────────────────────────
  {
    key: "asset_telemetry",
    label: "Asset Telemetry",
    source: "simulated",
    origin: "Seeded asset simulation",
  },
  // ── ANOMALIES (Derived) ───────────────────────────────────────────────
  {
    key: "anomalies",
    label: "Anomaly Flags",
    source: "derived",
    origin: "z-score vs NCPOR historical baseline",
  },
  // ── FORECAST (Derived) ────────────────────────────────────────────────
  {
    key: "forecast_diesel",
    label: "Diesel Depletion Forecast",
    source: "derived",
    origin: "Computed from simulated inventory (linear burn)",
  },
  {
    key: "forecast_food",
    label: "Food Depletion Forecast",
    source: "derived",
    origin: "Computed from simulated inventory (linear burn)",
  },
  // ── WHAT-IF (Derived) ─────────────────────────────────────────────────
  {
    key: "whatif",
    label: "What-If Simulation",
    source: "derived",
    origin: "Scenario multipliers on simulated state",
  },
  // ── STATION FACTS (Real) ─────────────────────────────────────────────
  {
    key: "station_facts",
    label: "Station Facts",
    source: "real",
    origin: "NCPOR station documentation",
  },
  // ── OPERATIONAL INTELLIGENCE (Derived) ──────────────────────────────
  {
    key: "cascade_risk",
    label: "Cascading Risk Engine",
    source: "derived",
    origin: "Deterministic interconnected system physics model",
  },
  {
    key: "mitigation_actions",
    label: "Recommended Mitigation",
    source: "derived",
    origin: "Deterministic rule-based response actions",
  },
  {
    key: "actionable_alerts",
    label: "Actionable Operational Alerts",
    source: "derived",
    origin: "Multi-subsystem telemetry early warning flags",
  },
  {
    key: "mission_report",
    label: "Mission Intelligence Report",
    source: "derived",
    origin: "10-section operational synthesis",
  },
  // ── LINK STATE (Simulated) ────────────────────────────────────────────
  {
    key: "link_state",
    label: "Comms Link State",
    source: "simulated",
    origin: "Simulated demo control",
  },
];

/** Group registry entries by source */
export function groupBySource(entries: ProvenanceEntry[]) {
  return {
    real: entries.filter((e) => e.source === "real"),
    simulated: entries.filter((e) => e.source === "simulated"),
    derived: entries.filter((e) => e.source === "derived"),
  };
}
