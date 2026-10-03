/**
 * PREDICTIVE MAINTENANCE ENGINE
 * ==============================
 * Derives maintenance priority and recommendations from the
 * TWIN_ASSET_REGISTRY (existing source of truth).
 *
 * Architecture:
 *   TWIN_ASSET_REGISTRY + CascadeResult → MaintenanceRecord[]
 *
 * No duplicated data. Same asset IDs. No random values.
 */

import { TWIN_ASSET_REGISTRY, TwinAsset, getStationData } from "../twinAssetRegistry";
import { CascadeResult } from "./types";

export type MaintenancePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface MaintenanceRecord {
  assetId: string;
  assetName: string;
  shortId: string;
  category: string;
  healthPct: number;
  failureProbPct: number;
  rulHours: number;
  priority: MaintenancePriority;
  nextRecommended: string;
  reason: string[];
  explanation: string;
  trendIndicators: string[];
  source: "simulated";
}

/**
 * Calculate maintenance priority from health, failure probability, RUL, and criticality.
 * Pure deterministic function.
 */
export function calculatePriority(
  healthPct: number,
  failureProbPct: number,
  rulHours: number,
  category: string,
  isAffectedByScenario: boolean
): MaintenancePriority {
  // Criticality multiplier for power assets
  const criticalityBonus = (category === "power" || category === "hvac") ? 1.3 : 1.0;

  // Composite risk score (0–100)
  const riskScore =
    ((100 - healthPct) * 0.35 +
     failureProbPct * 0.40 +
     (rulHours < 500 ? Math.max(0, (500 - rulHours) / 5) : 0) * 0.25) *
    criticalityBonus +
    (isAffectedByScenario ? 15 : 0);

  if (riskScore >= 45) return "CRITICAL";
  if (riskScore >= 28) return "HIGH";
  if (riskScore >= 14) return "MEDIUM";
  return "LOW";
}

/**
 * Human-readable reason for maintenance
 */
function buildReasons(
  asset: TwinAsset,
  healthPct: number,
  failureProbPct: number,
  rulHours: number,
  isAffectedByScenario: boolean,
  scenarioId: string | null
): string[] {
  const reasons: string[] = [];

  if (healthPct < 80) {
    reasons.push(`Health at ${healthPct}% (below 80% threshold)`);
  }
  if (failureProbPct >= 15) {
    reasons.push(`Failure probability elevated at ${failureProbPct}%`);
  }
  if (rulHours < 500) {
    reasons.push(`Remaining useful life: ${rulHours}h (below 500h threshold)`);
  }
  if (isAffectedByScenario && scenarioId === "extreme_cold") {
    reasons.push("Operating under simulated extreme cold — thermal stress elevated");
  }
  if (isAffectedByScenario && scenarioId === "generator_failure") {
    reasons.push("Asset operating at elevated load post generator failure");
  }
  if (asset.category === "power" && failureProbPct >= 10) {
    reasons.push("Critical power infrastructure — elevated monitoring priority");
  }
  if (reasons.length === 0) {
    reasons.push("Routine scheduled maintenance interval approaching");
  }
  return reasons;
}

/**
 * Recommended action text based on priority
 */
function buildRecommendation(priority: MaintenancePriority, assetName: string, rulHours: number): string {
  switch (priority) {
    case "CRITICAL":
      return `Immediate inspection of ${assetName} required — do not defer`;
    case "HIGH":
      return rulHours < 500
        ? `Schedule ${assetName} inspection within 48h — RUL below threshold`
        : `Schedule ${assetName} service within 72h`;
    case "MEDIUM":
      return `Include ${assetName} in next scheduled maintenance window`;
    case "LOW":
      return `Monitor ${assetName} — no immediate action required`;
  }
}

/**
 * Trend indicators for expanded view
 */
function buildTrendIndicators(
  asset: TwinAsset,
  stationData: ReturnType<typeof getStationData>,
  isAffectedByScenario: boolean
): string[] {
  const indicators: string[] = [];

  // Parse telemetry for anomalies
  for (const field of stationData.telemetry) {
    if (field.unit?.includes("⚠")) {
      indicators.push(`${field.label}: ${field.value}${field.unit} — anomaly detected`);
    }
  }

  if (stationData.rulHours < 500) {
    indicators.push(`RUL has crossed 500h warning threshold`);
  }
  if (stationData.failureProbPct >= 15) {
    indicators.push(`Failure probability above 15% warning level`);
  }
  if (isAffectedByScenario) {
    indicators.push("Asset affected by active simulation scenario");
  }
  if (indicators.length === 0) {
    indicators.push("No anomalous trends detected in telemetry");
  }
  return indicators;
}

/**
 * Main maintenance calculation — derives from TWIN_ASSET_REGISTRY + CascadeResult
 */
export function calculatePredictiveMaintenance(
  stationId: "maitri" | "bharati",
  cascade: CascadeResult | null,
  isSimulationActive: boolean
): MaintenanceRecord[] {
  const scenarioId = isSimulationActive && cascade ? cascade.scenarioId : null;
  const affectedSystems = cascade?.affectedSystems ?? [];

  const records: MaintenanceRecord[] = [];

  for (const asset of TWIN_ASSET_REGISTRY) {
    const stationData = getStationData(asset, stationId);

    // Determine if this asset is affected by the active scenario
    const isAffectedByScenario =
      isSimulationActive &&
      (affectedSystems.some(sys =>
        (sys === "Energy" && asset.category === "power") ||
        (sys === "Infrastructure" && (asset.category === "hvac" || asset.category === "structure")) ||
        (sys === "Logistics" && asset.category === "logistics") ||
        (sys === "Communications" && asset.category === "comms")
      ) || stationData.dependencies.some(dep =>
        cascade?.cascadeChain?.some(node => node.id.includes(dep)) ?? false
      ));

    // Apply scenario modifiers to health/failure probability
    let effectiveHealth = stationData.healthPct;
    let effectiveFailureProb = stationData.failureProbPct;
    let effectiveRul = stationData.rulHours;

    if (isSimulationActive && cascade) {
      if (asset.category === "power" && (scenarioId === "extreme_cold" || scenarioId === "generator_failure" || scenarioId === "multiple_failures")) {
        // Power assets under stress
        effectiveHealth = Math.max(20, stationData.healthPct - 12);
        effectiveFailureProb = Math.min(95, stationData.failureProbPct + 15);
        effectiveRul = Math.max(50, stationData.rulHours - 100);
      } else if (asset.category === "hvac" && (scenarioId === "hvac_failure" || scenarioId === "extreme_cold")) {
        effectiveHealth = Math.max(20, stationData.healthPct - 20);
        effectiveFailureProb = Math.min(95, stationData.failureProbPct + 25);
        effectiveRul = Math.max(50, stationData.rulHours - 200);
      } else if (isAffectedByScenario) {
        // General scenario effect on affected systems
        effectiveHealth = Math.max(20, stationData.healthPct - 8);
        effectiveFailureProb = Math.min(80, stationData.failureProbPct + 8);
      }
    }

    const priority = calculatePriority(
      effectiveHealth,
      effectiveFailureProb,
      effectiveRul,
      asset.category,
      isAffectedByScenario
    );

    const reasons = buildReasons(
      asset,
      effectiveHealth,
      effectiveFailureProb,
      effectiveRul,
      isAffectedByScenario,
      scenarioId
    );

    const recommendation = buildRecommendation(priority, asset.name, effectiveRul);
    const trendIndicators = buildTrendIndicators(asset, stationData, isAffectedByScenario);

    records.push({
      assetId: asset.id,
      assetName: asset.name,
      shortId: asset.shortId,
      category: asset.category,
      healthPct: effectiveHealth,
      failureProbPct: effectiveFailureProb,
      rulHours: effectiveRul,
      priority,
      nextRecommended: recommendation,
      reason: reasons,
      explanation: reasons.join(". ") + ". " + recommendation + ". [Prototype prediction — not real maintenance certification]",
      trendIndicators,
      source: "simulated",
    });
  }

  // Sort by priority (CRITICAL > HIGH > MEDIUM > LOW) then by failure probability
  const priorityOrder: Record<MaintenancePriority, number> = {
    CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3,
  };

  return records.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return b.failureProbPct - a.failureProbPct;
  });
}
