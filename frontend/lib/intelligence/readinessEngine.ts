/**
 * MISSION READINESS ENGINE
 * ========================
 * Derives a deterministic Mission Readiness Score (0–100) from the
 * existing CascadeResult + SmartResource[] data.
 *
 * Architecture:
 *   EXISTING SIMULATION → CascadeResult + Resources → Mission Readiness
 *
 * No random values. Same state → same result always.
 * All sub-scores are labeled as SIMULATED / PROJECTED values.
 */

import { CascadeResult, SmartResource, RiskLevel } from "./types";
import { STATION_BASELINES } from "./cascadeEngine";

export interface ReadinessCategory {
  id: string;
  label: string;
  score: number;          // 0–100
  baselineScore: number;  // 0–100 without scenario
  weight: number;         // 0–1
  trend: "stable" | "degrading" | "improving";
  detail: string;
}

export interface ReadinessResult {
  overallScore: number;       // 0–100
  baselineScore: number;      // 0–100 without scenario
  status: ReadinessStatus;
  categories: ReadinessCategory[];
  /** Delta from baseline (negative = degraded) */
  delta: number;
  source: "simulated";
}

export type ReadinessStatus =
  | "MISSION READY"
  | "READY WITH CAUTION"
  | "LIMITED READINESS"
  | "CRITICAL";

/**
 * Configurable weights — sum must equal 1.0
 * Stored here for transparency and future adjustment.
 */
export const READINESS_WEIGHTS = {
  energy: 0.28,
  infrastructure: 0.22,
  resources: 0.20,
  logistics: 0.15,
  communication: 0.10,
  environment: 0.05,
} as const;

/**
 * Map a RiskLevel → a readiness penalty factor (0 = no penalty, 1 = max penalty)
 */
function riskPenalty(risk: RiskLevel): number {
  switch (risk) {
    case "LOW":      return 0.00;
    case "MEDIUM":   return 0.15;
    case "HIGH":     return 0.30;
    case "CRITICAL": return 0.55;
  }
}

/**
 * Map a resource level % → a readiness contribution score 0–100
 */
function resourceToScore(levelPct: number, daysRemaining: number): number {
  // Days remaining drives urgency more than level
  if (daysRemaining <= 0) return 0;
  if (daysRemaining <= 7) return Math.max(10, Math.round(levelPct * 0.4));
  if (daysRemaining <= 15) return Math.max(25, Math.round(levelPct * 0.7));
  return Math.min(100, Math.round(levelPct * 0.95 + daysRemaining * 0.2));
}

/**
 * Calculate the Mission Readiness baseline (no scenario applied)
 */
export function calculateBaselineReadiness(
  stationId: "maitri" | "bharati"
): ReadinessResult {
  const base = STATION_BASELINES[stationId];

  const categories: ReadinessCategory[] = [
    {
      id: "energy",
      label: "Energy",
      score: Math.round(
        (base.batterySocPct * 0.35 + (100 - base.generatorLoadPct) * 0.35 + (100 - base.nominalFuelBurnPctDay * 4) * 0.3)
      ),
      baselineScore: 0, // will be filled after
      weight: READINESS_WEIGHTS.energy,
      trend: "stable",
      detail: `Battery ${base.batterySocPct}% SOC · Generator at ${base.generatorLoadPct}% load`,
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      score: stationId === "maitri" ? 82 : 88,
      baselineScore: 0,
      weight: READINESS_WEIGHTS.infrastructure,
      trend: "stable",
      detail: "HVAC, buildings, and structural systems nominal",
    },
    {
      id: "resources",
      label: "Resources",
      score: Math.round(
        Math.min(100,
          ((base.foodDays / 90) * 100) * 0.5 +
          ((base.dieselDays / 45) * 100) * 0.5
        )
      ),
      baselineScore: 0,
      weight: READINESS_WEIGHTS.resources,
      trend: "stable",
      detail: `Diesel ${base.dieselDays}d · Food ${base.foodDays}d`,
    },
    {
      id: "logistics",
      label: "Logistics",
      score: stationId === "maitri" ? 74 : 79,
      baselineScore: 0,
      weight: READINESS_WEIGHTS.logistics,
      trend: "stable",
      detail: "Resupply window within nominal range",
    },
    {
      id: "communication",
      label: "Communication",
      score: stationId === "maitri" ? 88 : 92,
      baselineScore: 0,
      weight: READINESS_WEIGHTS.communication,
      trend: "stable",
      detail: "VSAT link nominal · Telemetry synced",
    },
    {
      id: "environment",
      label: "Environment",
      score: stationId === "maitri" ? 84 : 89,
      baselineScore: 0,
      weight: READINESS_WEIGHTS.environment,
      trend: "stable",
      detail: `Ambient ${base.nominalTempC}°C · Conditions manageable`,
    },
  ];

  // Self-assign baseline scores
  categories.forEach((c) => { c.baselineScore = c.score; });

  const overallScore = Math.round(
    categories.reduce((acc, c) => acc + c.score * c.weight, 0)
  );

  return {
    overallScore,
    baselineScore: overallScore,
    status: scoreToStatus(overallScore),
    categories,
    delta: 0,
    source: "simulated",
  };
}

export function scoreToStatus(score: number): ReadinessStatus {
  if (score >= 90) return "MISSION READY";
  if (score >= 75) return "READY WITH CAUTION";
  if (score >= 50) return "LIMITED READINESS";
  return "CRITICAL";
}

/**
 * Main readiness calculation — derives from CascadeResult + SmartResource[]
 */
export function calculateMissionReadiness(
  stationId: "maitri" | "bharati",
  cascade: CascadeResult,
  resources: SmartResource[],
  isSimulationActive: boolean,
  appliedActionIds: string[]
): ReadinessResult {
  const baseline = calculateBaselineReadiness(stationId);

  if (!isSimulationActive) {
    return baseline;
  }

  // --- Derive category scores from cascade result ---
  const base = STATION_BASELINES[stationId];
  const hasMitigation = appliedActionIds.length > 0;

  // 1. ENERGY — derived from battery SOC, generator load, fuel burn
  const batteryContrib = cascade.batterySocPct.afterAction ?? cascade.batterySocPct.simulated;
  const genLoadContrib = cascade.generatorLoadPct.afterAction ?? cascade.generatorLoadPct.simulated;
  const fuelBurnContrib = cascade.fuelConsumptionPctDay.afterAction ?? cascade.fuelConsumptionPctDay.simulated;

  const energyScore = Math.max(0, Math.min(100, Math.round(
    batteryContrib * 0.40 +
    (100 - genLoadContrib) * 0.35 +
    (100 - fuelBurnContrib * 7) * 0.25
  )));

  // 2. INFRASTRUCTURE — affected by HVAC/heating scenarios
  const infraPenalty = cascade.scenarioId === "hvac_failure"
    ? 35
    : cascade.scenarioId === "multiple_failures"
    ? 28
    : cascade.scenarioId === "extreme_cold"
    ? 14
    : 0;
  const infraScore = Math.max(0, baseline.categories.find(c => c.id === "infrastructure")!.score - infraPenalty + (hasMitigation ? infraPenalty * 0.4 : 0));

  // 3. RESOURCES — derived from SmartResource[]
  const fuelResource = resources.find(r => r.id === "fuel");
  const foodResource = resources.find(r => r.id === "food");
  const fuelScore = fuelResource ? resourceToScore(fuelResource.currentLevel, fuelResource.daysRemaining) : 80;
  const foodScore = foodResource ? resourceToScore(foodResource.currentLevel, foodResource.daysRemaining) : 80;
  const resourceScore = Math.max(0, Math.min(100, Math.round((fuelScore * 0.6 + foodScore * 0.4))));

  // 4. LOGISTICS — based on resupply risk
  const logisticsPenalty = riskPenalty(cascade.resupplyRisk) * 100;
  const baseLogistics = baseline.categories.find(c => c.id === "logistics")!.score;
  const logisticsScore = Math.max(10, Math.round(baseLogistics - logisticsPenalty + (hasMitigation ? logisticsPenalty * 0.35 : 0)));

  // 5. COMMUNICATION — affected by comms failure scenario
  const commPenalty = (cascade.scenarioId === "communication_failure" || cascade.scenarioId === "blizzard")
    ? 28
    : 0;
  const baseComm = baseline.categories.find(c => c.id === "communication")!.score;
  const commScore = Math.max(10, Math.round(baseComm - commPenalty + (hasMitigation ? commPenalty * 0.3 : 0)));

  // 6. ENVIRONMENT — based on temperature drop
  const tempDrop = Math.abs(cascade.temperatureC.baseline - cascade.temperatureC.simulated);
  const envPenalty = Math.min(60, tempDrop * 3);
  const baseEnv = baseline.categories.find(c => c.id === "environment")!.score;
  const envScore = Math.max(10, Math.round(baseEnv - envPenalty + (hasMitigation ? envPenalty * 0.2 : 0)));

  const simulatedCategories: ReadinessCategory[] = [
    {
      id: "energy",
      label: "Energy",
      score: energyScore,
      baselineScore: baseline.categories.find(c => c.id === "energy")!.score,
      weight: READINESS_WEIGHTS.energy,
      trend: energyScore < baseline.categories.find(c => c.id === "energy")!.score ? "degrading" : "stable",
      detail: `Battery ${batteryContrib}% SOC · Generator ${genLoadContrib}% load · Fuel burn ${fuelBurnContrib}%/day`,
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      score: Math.round(infraScore),
      baselineScore: baseline.categories.find(c => c.id === "infrastructure")!.score,
      weight: READINESS_WEIGHTS.infrastructure,
      trend: infraPenalty > 0 ? "degrading" : "stable",
      detail: cascade.scenarioId === "hvac_failure"
        ? "HVAC failure active — emergency heating engaged"
        : cascade.scenarioId === "extreme_cold"
        ? "Heating demand elevated — thermal load increased"
        : "Structural systems within tolerance",
    },
    {
      id: "resources",
      label: "Resources",
      score: resourceScore,
      baselineScore: baseline.categories.find(c => c.id === "resources")!.score,
      weight: READINESS_WEIGHTS.resources,
      trend: resourceScore < baseline.categories.find(c => c.id === "resources")!.score ? "degrading" : "stable",
      detail: fuelResource
        ? `Fuel ${fuelResource.daysRemaining}d remaining · Food ${foodResource?.daysRemaining ?? "?"}d`
        : "Resource levels nominal",
    },
    {
      id: "logistics",
      label: "Logistics",
      score: logisticsScore,
      baselineScore: baseLogistics,
      weight: READINESS_WEIGHTS.logistics,
      trend: logisticsPenalty > 0 ? "degrading" : "stable",
      detail: `Resupply risk: ${cascade.resupplyRisk}`,
    },
    {
      id: "communication",
      label: "Communication",
      score: commScore,
      baselineScore: baseComm,
      weight: READINESS_WEIGHTS.communication,
      trend: commPenalty > 0 ? "degrading" : "stable",
      detail: cascade.scenarioId === "communication_failure"
        ? "Satellite link degraded — autonomous mode active"
        : "VSAT link operational",
    },
    {
      id: "environment",
      label: "Environment",
      score: envScore,
      baselineScore: baseEnv,
      weight: READINESS_WEIGHTS.environment,
      trend: tempDrop > 5 ? "degrading" : "stable",
      detail: `Simulated temp: ${cascade.temperatureC.simulated}°C (${cascade.temperatureC.delta} from baseline)`,
    },
  ];

  const overallScore = Math.round(
    simulatedCategories.reduce((acc, c) => acc + c.score * c.weight, 0)
  );

  const baselineOverall = baseline.overallScore;
  const delta = overallScore - baselineOverall;

  return {
    overallScore,
    baselineScore: baselineOverall,
    status: scoreToStatus(overallScore),
    categories: simulatedCategories,
    delta,
    source: "simulated",
  };
}
