import {
  StationCurrent,
  Anomaly,
  WhatIfResult,
  LinkStatus,
  AssetNode,
  AssetDetail,
  ScenarioTrigger,
  StationForecast,
} from "./types";
import { MOCK_FORECASTS } from "./mockData";

/*
 * ============================================================
 * API CONFIGURATION
 * ============================================================
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Returns true only when we have a non-localhost API URL configured.
 * This prevents fetch hangs on Vercel where no backend is running.
 */
function isBackendAvailable(): boolean {
  if (!API_BASE_URL) return false;
  // Never attempt localhost calls in a non-browser or production context
  if (typeof window !== "undefined") {
    try {
      const url = new URL(API_BASE_URL);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return false; // skip — no backend on Vercel
      }
    } catch {
      return false;
    }
  }
  return true;
}

function getApiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

/**
 * fetch() with a hard 3-second timeout so the app never hangs
 * waiting for an unreachable backend.
 */
async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = 3000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/*
 * Calibrated fallback datasets matching backend nominal state
 */
const CALIBRATED_CURRENT: Record<string, StationCurrent> = {
  maitri: {
    station_id: "maitri",
    observation_time: new Date().toISOString(),
    weather: {
      temperature_c: { value: -18.4, source: "real" },
      wind_speed_ms: { value: 14.2, source: "real" },
      pressure_hpa: { value: 988.5, source: "real" },
    },
    energy: {
      generation_kw: { value: 142.0, source: "simulated" },
      consumption_kw: { value: 119.0, source: "simulated" },
      diesel_pct: { value: 61.0, source: "simulated" },
    },
    logistics: {
      food_days_remaining: { value: 68.0, source: "simulated" },
      diesel_days_remaining: { value: 42.0, source: "simulated" },
    },
  },
  bharati: {
    station_id: "bharati",
    observation_time: new Date().toISOString(),
    weather: {
      temperature_c: { value: -9.2, source: "real" },
      wind_speed_ms: { value: 11.5, source: "real" },
      pressure_hpa: { value: 994.2, source: "real" },
    },
    energy: {
      generation_kw: { value: 187.0, source: "simulated" },
      consumption_kw: { value: 154.0, source: "simulated" },
      diesel_pct: { value: 58.0, source: "simulated" },
    },
    logistics: {
      food_days_remaining: { value: 74.0, source: "simulated" },
      diesel_days_remaining: { value: 37.0, source: "simulated" },
    },
  },
};

const CALIBRATED_ANOMALIES: Record<string, Anomaly[]> = {
  maitri: [
    {
      variable: "wind_speed",
      value: 14.2,
      baseline_mean: 8.4,
      baseline_stddev: 2.3,
      severity: "medium",
    },
  ],
  bharati: [
    {
      variable: "pressure_hpa",
      value: 994.2,
      baseline_mean: 982.1,
      baseline_stddev: 4.8,
      severity: "low",
    },
  ],
};

const CALIBRATED_ASSET_TREES: Record<string, AssetNode[]> = {
  maitri: [
    {
      id: "power",
      label: "POWER",
      status: "warning",
      children: [
        { id: "gen-01", label: "Generator 01", status: "healthy" },
        { id: "gen-02", label: "Generator 02", status: "warning" },
        { id: "battery-sys", label: "Battery System", status: "healthy" },
      ],
    },
    {
      id: "water",
      label: "WATER",
      status: "healthy",
      children: [
        { id: "water-pump", label: "Pump", status: "healthy" },
        { id: "water-storage", label: "Storage", status: "healthy" },
      ],
    },
    {
      id: "buildings",
      label: "BUILDINGS",
      status: "healthy",
      children: [
        { id: "bld-main", label: "Main Building", status: "healthy" },
        { id: "bld-lab", label: "Laboratory", status: "healthy" },
        { id: "bld-storage", label: "Storage", status: "healthy" },
      ],
    },
    {
      id: "logistics",
      label: "LOGISTICS",
      status: "warning",
      children: [
        { id: "log-food", label: "Food", status: "healthy" },
        { id: "log-diesel", label: "Diesel", status: "warning" },
        { id: "log-medical", label: "Medical", status: "healthy" },
        { id: "log-water", label: "Water", status: "healthy" },
        { id: "log-spares", label: "Spares", status: "healthy" },
      ],
    },
  ],
  bharati: [
    {
      id: "power",
      label: "POWER",
      status: "warning",
      children: [
        { id: "gen-01", label: "Generator 01", status: "healthy" },
        { id: "gen-02", label: "Generator 02", status: "warning" },
        { id: "battery-sys", label: "Battery System", status: "healthy" },
      ],
    },
    {
      id: "water",
      label: "WATER",
      status: "healthy",
      children: [
        { id: "water-pump", label: "Pump", status: "healthy" },
        { id: "water-storage", label: "Storage", status: "healthy" },
      ],
    },
    {
      id: "buildings",
      label: "BUILDINGS",
      status: "healthy",
      children: [
        { id: "bld-main", label: "Main Building", status: "healthy" },
        { id: "bld-lab", label: "Laboratory", status: "healthy" },
        { id: "bld-storage", label: "Storage", status: "healthy" },
      ],
    },
    {
      id: "logistics",
      label: "LOGISTICS",
      status: "healthy",
      children: [
        { id: "log-food", label: "Food", status: "healthy" },
        { id: "log-diesel", label: "Diesel", status: "healthy" },
        { id: "log-medical", label: "Medical", status: "healthy" },
        { id: "log-water", label: "Water", status: "healthy" },
        { id: "log-spares", label: "Spares", status: "healthy" },
      ],
    },
  ],
};

const CALIBRATED_ASSET_DETAILS: Record<string, Record<string, AssetDetail>> = {
  maitri: {
    "gen-01": {
      id: "gen-01",
      name: "Generator 01",
      category: "POWER INFRASTRUCTURE",
      status: "healthy",
      health_pct: 89,
      temperature_c: 76,
      vibration_mms: 2.6,
      efficiency_pct: 87,
      runtime_hours: 5410,
      operational_status: "Operational",
      last_inspected: "2026-09-14 07:00 UTC",
      telemetry_source: "simulated",
      specs: [
        { label: "Rated Output", value: "250 kW" },
        { label: "Fuel Rate", value: "41.3 L/h" },
        { label: "Alternator Voltage", value: "411 V 3-Phase" },
        { label: "Oil Pressure", value: "4.5 bar" },
      ],
    },
    "gen-02": {
      id: "gen-02",
      name: "Generator 02",
      category: "POWER INFRASTRUCTURE",
      status: "warning",
      health_pct: 61,
      temperature_c: 97,
      vibration_mms: 6.2,
      efficiency_pct: 74,
      runtime_hours: 7890,
      operational_status: "High Vibration — Inspection Due",
      last_inspected: "2026-09-05 09:00 UTC",
      telemetry_source: "simulated",
      specs: [
        { label: "Rated Output", value: "250 kW" },
        { label: "Fuel Rate", value: "49.8 L/h" },
        { label: "Alternator Voltage", value: "402 V 3-Phase" },
        { label: "Oil Pressure", value: "3.4 bar" },
      ],
    },
    "battery-sys": {
      id: "battery-sys",
      name: "Battery System",
      category: "POWER INFRASTRUCTURE",
      status: "healthy",
      health_pct: 91,
      temperature_c: 22,
      vibration_mms: 0.2,
      efficiency_pct: 91,
      runtime_hours: 7300,
      operational_status: "Buffer Charging",
      last_inspected: "2026-09-18 10:00 UTC",
      telemetry_source: "simulated",
      specs: [
        { label: "Capacity", value: "360 kWh" },
        { label: "State of Charge", value: "84%" },
        { label: "Cycle Count", value: "538" },
        { label: "Bus Voltage", value: "476 V DC" },
      ],
    },
  },
  bharati: {
    "gen-01": {
      id: "gen-01",
      name: "Generator 01",
      category: "POWER INFRASTRUCTURE",
      status: "healthy",
      health_pct: 97,
      temperature_c: 69,
      vibration_mms: 1.8,
      efficiency_pct: 93,
      runtime_hours: 2640,
      operational_status: "Operational",
      last_inspected: "2026-09-20 11:00 UTC",
      telemetry_source: "simulated",
      specs: [
        { label: "Rated Output", value: "250 kW" },
        { label: "Fuel Rate", value: "36.4 L/h" },
        { label: "Alternator Voltage", value: "416 V 3-Phase" },
        { label: "Oil Pressure", value: "4.9 bar" },
      ],
    },
  },
};

/*
 * ============================================================
 * STATION CURRENT DATA
 * GET /stations/{stationId}/current
 * ============================================================
 */

export async function getStationCurrent(
  stationId: string
): Promise<StationCurrent> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(getApiUrl(`/stations/${stationId}/current`), {
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }
  }

  const fallback = CALIBRATED_CURRENT[stationId] ?? CALIBRATED_CURRENT.maitri;
  return fallback;
}

/*
 * ============================================================
 * STATION ANOMALIES
 * GET /stations/{stationId}/anomalies
 * ============================================================
 */

export async function getStationAnomalies(
  stationId: string
): Promise<Anomaly[]> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(getApiUrl(`/stations/${stationId}/anomalies`), {
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }
  }

  return CALIBRATED_ANOMALIES[stationId] ?? [];
}

/*
 * ============================================================
 * WHAT-IF SIMULATION
 * POST /stations/{stationId}/simulate
 * ============================================================
 */

export async function simulateWhatIf(
  stationId: string,
  trigger: ScenarioTrigger
): Promise<WhatIfResult> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(getApiUrl(`/stations/${stationId}/simulate`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback simulation result
  return {
    timeline: [
      { day: 0, event: `Trigger: ${trigger.replace(/_/g, " ").toUpperCase()}` },
      { day: 1, event: "Primary energy demand shifts; battery buffer active" },
      { day: 11, event: "Critical operational reserve threshold reached" },
    ],
    recommendations: [
      "Reduce non-critical electrical loads across auxiliary modules",
      "Engage backup generator bus to balance alternator thermal load",
      "Prioritize essential habitation and life support envelopes",
    ],
    urgency: "warning",
    days_until_critical: 11,
  };
}

/*
 * ============================================================
 * LINK STATUS
 * GET /link/status
 * ============================================================
 */

export async function getLinkStatus(): Promise<LinkStatus> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(getApiUrl("/link/status"), { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  }

  return { connected: true, last_synced: "Simulation Mode" };
}

/*
 * ============================================================
 * LINK TOGGLE
 * POST /link/toggle
 * ============================================================
 */

export async function toggleLink(): Promise<LinkStatus> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(getApiUrl("/link/toggle"), {
        method: "POST",
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  }

  return { connected: false, last_synced: "Degraded" };
}

/*
 * ============================================================
 * UTC MISSION TIME
 * GET /system/time
 * ============================================================
 */

export async function getMissionTime(): Promise<string> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(getApiUrl("/system/time"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return data.utc_time;
      }
    } catch {
      // Fallback
    }
  }

  const now = new Date();
  return `${String(now.getUTCHours()).padStart(2, "0")}:${String(
    now.getUTCMinutes()
  ).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")} UTC`;
}

/*
 * ============================================================
 * ASSET TREE
 * GET /stations/{stationId}/assets
 * ============================================================
 */

export async function getAssetTree(stationId: string): Promise<AssetNode[]> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(getApiUrl(`/stations/${stationId}/assets`), {
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }
  }

  return (
    CALIBRATED_ASSET_TREES[stationId] ?? CALIBRATED_ASSET_TREES.maitri
  );
}

/*
 * ============================================================
 * ASSET DETAIL
 * GET /stations/{stationId}/assets/{assetId}
 * ============================================================
 */

export async function getAssetDetail(
  stationId: string,
  assetId: string
): Promise<AssetDetail | null> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(
        getApiUrl(`/stations/${stationId}/assets/${assetId}`),
        { cache: "no-store" }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }
  }

  const stationDetails =
    CALIBRATED_ASSET_DETAILS[stationId] ?? CALIBRATED_ASSET_DETAILS.maitri;
  return (
    stationDetails[assetId] ??
    stationDetails["gen-01"] ?? {
      id: assetId,
      name: assetId,
      category: "STATION ASSET",
      status: "healthy",
      health_pct: 95,
      operational_status: "Operational",
      last_inspected: "2026-09-20 12:00 UTC",
      telemetry_source: "simulated",
      specs: [{ label: "Status", value: "Nominal" }],
    }
  );
}

/*
 * ============================================================
 * STATION DEPLETION FORECAST
 * GET /stations/{stationId}/forecast
 * ============================================================
 */

export async function getStationForecast(
  stationId: string
): Promise<StationForecast> {
  if (isBackendAvailable()) {
    try {
      const res = await fetchWithTimeout(getApiUrl(`/stations/${stationId}/forecast`), {
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }
  }

  return MOCK_FORECASTS[stationId] ?? MOCK_FORECASTS.maitri;
}