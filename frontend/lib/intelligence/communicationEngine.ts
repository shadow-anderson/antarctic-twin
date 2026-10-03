/**
 * COMMUNICATION HEALTH ENGINE
 * ============================
 * Derives communication health from station data and active scenario.
 * Architecture: StationBaseline + ScenarioId → CommunicationHealth
 *
 * Thresholds are configurable. No random values.
 */

import { ScenarioId } from "./types";
import { STATION_BASELINES } from "./cascadeEngine";

export type CommStatus = "CONNECTED" | "DEGRADED" | "INTERRUPTED";

export interface CommHealthMetrics {
  signalStrength: number;    // 0–100
  latencyMs: number;
  dataFreshness: number;     // 0–100
  lastSyncMin: number;       // minutes ago
}

export interface CommunicationHealth {
  status: CommStatus;
  overallScore: number;       // 0–100
  signalScore: number;        // 0–100
  latencyScore: number;       // 0–100
  freshnessScore: number;     // 0–100
  latencyMs: number;
  signalStrengthPct: number;
  lastSyncMinutes: number;
  dataFreshness: "NOMINAL" | "WARNING" | "STALE";
  statusDetail: string;
  source: "simulated";
}

/** Configurable thresholds */
export const COMM_THRESHOLDS = {
  latency: {
    connected: 300,   // ms — below this = CONNECTED
    degraded: 800,    // ms — above this = HIGH LATENCY / DEGRADED
  },
  signal: {
    good: 70,         // % — above this = good
    degraded: 40,     // % — below this = degraded
  },
  freshness: {
    nominal: 5,       // minutes — below = NOMINAL
    warning: 30,      // minutes — above = WARNING, below = STALE
  },
};

/**
 * Derive latency score from ms (lower ms = higher score)
 */
function latencyToScore(latencyMs: number): number {
  if (latencyMs <= 200) return 100;
  if (latencyMs <= 300) return 90;
  if (latencyMs <= 500) return 75;
  if (latencyMs <= 800) return 55;
  if (latencyMs <= 1200) return 35;
  return 15;
}

/**
 * Station baseline communication metrics (deterministic)
 */
const STATION_COMM_BASELINES: Record<"maitri" | "bharati", CommHealthMetrics> = {
  maitri: {
    signalStrength: 74,
    latencyMs: 480,
    dataFreshness: 88,
    lastSyncMin: 3,
  },
  bharati: {
    signalStrength: 82,
    latencyMs: 390,
    dataFreshness: 94,
    lastSyncMin: 2,
  },
};

/**
 * Calculate communication health for a given station and scenario.
 */
export function calculateCommunicationHealth(
  stationId: "maitri" | "bharati",
  scenarioId: ScenarioId | null,
  isSimulationActive: boolean,
  appliedActionIds: string[]
): CommunicationHealth {
  const baseline = STATION_COMM_BASELINES[stationId];

  let signal = baseline.signalStrength;
  let latency = baseline.latencyMs;
  let freshness = baseline.dataFreshness;
  let lastSync = baseline.lastSyncMin;

  // Apply scenario effects
  if (isSimulationActive && scenarioId) {
    switch (scenarioId) {
      case "communication_failure":
        signal = 18;
        latency = 2400;
        freshness = 22;
        lastSync = 48;
        break;
      case "blizzard":
        signal = Math.max(20, signal - 28);
        latency = latency + 420;
        freshness = Math.max(30, freshness - 25);
        lastSync = 12;
        break;
      case "extreme_cold":
        signal = Math.max(40, signal - 12);
        latency = latency + 180;
        freshness = Math.max(55, freshness - 15);
        lastSync = 7;
        break;
      case "high_wind":
        signal = Math.max(45, signal - 18);
        latency = latency + 250;
        freshness = Math.max(50, freshness - 20);
        lastSync = 9;
        break;
      case "multiple_failures":
        signal = Math.max(25, signal - 35);
        latency = latency + 680;
        freshness = Math.max(20, freshness - 35);
        lastSync = 28;
        break;
      default:
        // Other scenarios have minor comms impact
        signal = Math.max(55, signal - 5);
        latency = latency + 60;
        break;
    }
  }

  // Mitigation can partially restore comms (resupply req triggers backup link)
  if (appliedActionIds.includes("trigger_resupply_req") && isSimulationActive) {
    signal = Math.min(baseline.signalStrength, signal + 12);
    latency = Math.max(baseline.latencyMs, latency - 200);
    freshness = Math.min(baseline.dataFreshness, freshness + 15);
    lastSync = Math.min(baseline.lastSyncMin, lastSync - 8);
  }

  // Determine status
  let status: CommStatus;
  if (latency > COMM_THRESHOLDS.latency.degraded || signal < COMM_THRESHOLDS.signal.degraded || lastSync > 60) {
    status = latency > 2000 || signal < 20 ? "INTERRUPTED" : "DEGRADED";
  } else if (latency > COMM_THRESHOLDS.latency.connected || signal < COMM_THRESHOLDS.signal.good) {
    status = "DEGRADED";
  } else {
    status = "CONNECTED";
  }

  // Score sub-components
  const signalScore = Math.round(Math.min(100, signal));
  const latencyScore = latencyToScore(latency);
  const freshnessScore = Math.round(Math.min(100, freshness));

  // Overall score weighted average
  const overallScore = Math.round(
    signalScore * 0.35 +
    latencyScore * 0.40 +
    freshnessScore * 0.25
  );

  // Data freshness label
  const dataFreshness: "NOMINAL" | "WARNING" | "STALE" =
    lastSync <= COMM_THRESHOLDS.freshness.nominal
      ? "NOMINAL"
      : lastSync <= COMM_THRESHOLDS.freshness.warning
      ? "WARNING"
      : "STALE";

  // Status detail text
  let statusDetail: string;
  switch (status) {
    case "CONNECTED":
      statusDetail = "Satellite uplink nominal — telemetry synchronized";
      break;
    case "DEGRADED":
      statusDetail = `Signal degraded (${signal}%) · Latency elevated (${latency}ms) · Last sync ${lastSync}min ago`;
      break;
    case "INTERRUPTED":
      statusDetail = scenarioId === "communication_failure"
        ? "Satellite carrier lost — autonomous station mode active"
        : `Intermittent connection — telemetry stale (${lastSync}min ago)`;
      break;
  }

  return {
    status,
    overallScore,
    signalScore,
    latencyScore,
    freshnessScore,
    latencyMs: Math.round(latency),
    signalStrengthPct: Math.round(signal),
    lastSyncMinutes: Math.round(lastSync),
    dataFreshness,
    statusDetail,
    source: "simulated",
  };
}
