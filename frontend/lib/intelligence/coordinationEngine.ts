/**
 * INTER-STATION COORDINATION ENGINE
 * ====================================
 * Compares Maitri and Bharati station states to identify
 * support opportunities.
 *
 * Architecture:
 *   STATION_BASELINES[maitri] + STATION_BASELINES[bharati]
 *   + CascadeResult (active station) → StationCoordination
 *
 * Derives from existing data. No duplicated definitions.
 * Decision-support only — does NOT automatically transfer resources.
 */

import { STATION_BASELINES, StationBaseline } from "./cascadeEngine";
import { ReadinessResult } from "./readinessEngine";
import { SmartResource } from "./types";

export type SupportType = "Fuel" | "Food" | "Personnel" | "Equipment" | "Communication";

export interface SupportOpportunity {
  resource: SupportType;
  fromStation: "maitri" | "bharati";
  toStation: "maitri" | "bharati";
  description: string;
  estimatedWindowDays: number;
  coordinationStatus: "Available" | "Planning Required" | "Not Feasible";
}

export interface StationOperationalSnapshot {
  stationId: "maitri" | "bharati";
  stationName: string;
  missionReadinessPct: number;
  fuelPct: number;
  fuelDays: number;
  batteryPct: number;
  foodDays: number;
  commScore: number;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface InterStationCoordination {
  maitri: StationOperationalSnapshot;
  bharati: StationOperationalSnapshot;
  supportOpportunities: SupportOpportunity[];
  coordinationNarrative: string;
  source: "simulated";
}

/**
 * Build a snapshot from baseline data + optional override for the active station
 */
function buildSnapshot(
  stationId: "maitri" | "bharati",
  base: StationBaseline,
  readiness: ReadinessResult | null,
  resources: SmartResource[] | null,
  commScore: number,
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
): StationOperationalSnapshot {
  const fuelResource = resources?.find(r => r.id === "fuel");
  const batteryResource = resources?.find(r => r.id === "battery");
  const foodResource = resources?.find(r => r.id === "food");

  return {
    stationId,
    stationName: base.name,
    missionReadinessPct: readiness?.overallScore ?? (stationId === "maitri" ? 78 : 84),
    fuelPct: fuelResource?.currentLevel ?? base.nominalFuelPct,
    fuelDays: fuelResource?.daysRemaining ?? base.dieselDays,
    batteryPct: batteryResource?.currentLevel ?? base.batterySocPct,
    foodDays: foodResource?.daysRemaining ?? base.foodDays,
    commScore,
    risk,
  };
}

/**
 * Identify support opportunities between two station snapshots
 */
function identifySupportOpportunities(
  maitri: StationOperationalSnapshot,
  bharati: StationOperationalSnapshot,
  activeStation: "maitri" | "bharati"
): SupportOpportunity[] {
  const opportunities: SupportOpportunity[] = [];

  // Fuel support
  const fuelDeficit = activeStation === "maitri"
    ? maitri.fuelDays < 14 && bharati.fuelDays > 25
    : bharati.fuelDays < 14 && maitri.fuelDays > 25;

  if (fuelDeficit) {
    const fromStation = activeStation === "maitri" ? "bharati" : "maitri";
    const toStation = activeStation;
    const fromSnap = activeStation === "maitri" ? bharati : maitri;
    const toSnap = activeStation === "maitri" ? maitri : bharati;

    opportunities.push({
      resource: "Fuel",
      fromStation,
      toStation,
      description: `${fromSnap.stationName} has ${fromSnap.fuelDays} days fuel reserve. ${toSnap.stationName} has ${toSnap.fuelDays} days — below 14-day threshold. Potential simulated fuel support opportunity.`,
      estimatedWindowDays: Math.min(fromSnap.fuelDays - 14, 21), // reserve safety buffer
      coordinationStatus: fromSnap.fuelDays > 25 ? "Available" : "Planning Required",
    });
  }

  // Food support
  const foodDeficit = activeStation === "maitri"
    ? maitri.foodDays < 20 && bharati.foodDays > 40
    : bharati.foodDays < 20 && maitri.foodDays > 40;

  if (foodDeficit) {
    const fromStation = activeStation === "maitri" ? "bharati" : "maitri";
    const toStation = activeStation;
    const fromSnap = activeStation === "maitri" ? bharati : maitri;
    const toSnap = activeStation === "maitri" ? maitri : bharati;

    opportunities.push({
      resource: "Food",
      fromStation,
      toStation,
      description: `${fromSnap.stationName} food reserve (${fromSnap.foodDays}d) can partially support ${toSnap.stationName} (${toSnap.foodDays}d remaining).`,
      estimatedWindowDays: 7,
      coordinationStatus: "Planning Required",
    });
  }

  // Communication support
  const commDiff = Math.abs(maitri.commScore - bharati.commScore);
  if (commDiff > 30) {
    const betterStation = maitri.commScore > bharati.commScore ? "maitri" : "bharati";
    const worseStation = betterStation === "maitri" ? "bharati" : "maitri";
    const betterSnap = betterStation === "maitri" ? maitri : bharati;
    const worseSnap = worseStation === "maitri" ? maitri : bharati;

    opportunities.push({
      resource: "Communication",
      fromStation: betterStation,
      toStation: worseStation,
      description: `${betterSnap.stationName} (comm score ${betterSnap.commScore}%) can relay messages for ${worseSnap.stationName} (comm score ${worseSnap.commScore}%) during degraded link periods.`,
      estimatedWindowDays: 3,
      coordinationStatus: "Available",
    });
  }

  return opportunities;
}

/**
 * Main coordination calculation
 */
export function calculateInterStationCoordination(
  activeStation: "maitri" | "bharati",
  activeReadiness: ReadinessResult | null,
  activeResources: SmartResource[],
  activeCommScore: number,
  activeRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
): InterStationCoordination {
  const maitriBase = STATION_BASELINES.maitri;
  const bharatiBase = STATION_BASELINES.bharati;

  // The inactive station uses deterministic baseline values
  const inactiveStation = activeStation === "maitri" ? "bharati" : "maitri";
  const inactiveBase = STATION_BASELINES[inactiveStation];

  // Inactive station snapshot — deterministic baselines
  const inactiveSnapshot: StationOperationalSnapshot = {
    stationId: inactiveStation,
    stationName: inactiveBase.name,
    missionReadinessPct: inactiveStation === "bharati" ? 84 : 78,
    fuelPct: inactiveBase.nominalFuelPct,
    fuelDays: inactiveBase.dieselDays,
    batteryPct: inactiveBase.batterySocPct,
    foodDays: inactiveBase.foodDays,
    commScore: inactiveStation === "bharati" ? 92 : 88,
    risk: "LOW",
  };

  // Active station snapshot — uses live computed data
  const activeSnapshot = buildSnapshot(
    activeStation,
    STATION_BASELINES[activeStation],
    activeReadiness,
    activeResources,
    activeCommScore,
    activeRisk
  );

  const maitriSnapshot = activeStation === "maitri" ? activeSnapshot : inactiveSnapshot;
  const bharatiSnapshot = activeStation === "bharati" ? activeSnapshot : inactiveSnapshot;

  const supportOpportunities = identifySupportOpportunities(
    maitriSnapshot, bharatiSnapshot, activeStation
  );

  // Narrative
  let narrative = `Maitri mission readiness: ${maitriSnapshot.missionReadinessPct}% · Bharati: ${bharatiSnapshot.missionReadinessPct}%. `;
  if (supportOpportunities.length > 0) {
    narrative += `${supportOpportunities.length} simulated support opportunity${supportOpportunities.length !== 1 ? "ies" : ""} identified. `;
    narrative += supportOpportunities.map(o => `${o.fromStation === "maitri" ? "Maitri" : "Bharati"} can provide ${o.resource} support to ${o.toStation === "maitri" ? "Maitri" : "Bharati"}`).join("; ") + ". ";
    narrative += "Note: This is a decision-support recommendation only — no automatic transfer is made. [Simulated]";
  } else {
    narrative += "Both stations operating within nominal parameters. No support coordination required at this time.";
  }

  return {
    maitri: maitriSnapshot,
    bharati: bharatiSnapshot,
    supportOpportunities,
    coordinationNarrative: narrative,
    source: "simulated",
  };
}
