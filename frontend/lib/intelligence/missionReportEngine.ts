import { CascadeResult } from "./types";
import { StationCurrent } from "../types";
import { SmartResource } from "./types";
import { OperationalAlert } from "./types";

export interface MissionReportData {
  station: "MAITRI" | "BHARATI";
  stationName: string;
  coordinates: string;
  region: string;
  timestampUtc: string;
  generatedBy: string;

  // 1. Station Health
  healthScore: number;
  environmentStatus: "NORMAL" | "WARNING" | "CRITICAL";
  energyStatus: "NORMAL" | "WARNING" | "CRITICAL";
  infrastructureStatus: "NORMAL" | "WARNING" | "CRITICAL";
  logisticsStatus: "NORMAL" | "WARNING" | "CRITICAL";

  // 2. Environment
  temperatureC: number;
  windSpeedMs: number;
  pressureHpa: number;
  snowState: string;

  // 3. Energy
  batterySocPct: number;
  generatorStatus: string;
  powerConsumptionKw: number;
  powerGenerationKw: number;
  netPowerKw: number;
  fuelLevelPct: number;
  estimatedEnduranceHours: number;

  // 4. Infrastructure
  criticalSystemsStatus: string;
  equipmentHealthPct: number;
  detectedFailures: string[];
  maintenanceRisks: string[];

  // 5. Logistics
  fuelAutonomyDays: number;
  foodReservesDays: number;
  waterReservesDays: number;
  medicalSuppliesStatus: string;
  resupplyStatus: string;

  // 6. Active Risks
  activeRisks: { rank: number; title: string; severity: string; timeToCritical: string }[];

  // 7. Forecast
  forecastHighlights: string[];

  // 8. What-If Scenario
  whatIfScenarioTitle: string;
  whatIfDuration: string;
  whatIfOverallRisk: string;
  whatIfTimeUntilCritical: string;

  // 9. Cascading Impact Chain
  cascadingChain: { step: number; label: string; system: string; detail: string }[];

  // 10. Recommended Actions
  recommendedActions: { id: string; action: string; impact: string; status: string }[];
}

/**
 * Generate a complete 10-section Mission Intelligence Report snapshot.
 */
export function buildMissionReport(
  stationId: "maitri" | "bharati",
  currentTelemetry: StationCurrent | null,
  cascadeResult: CascadeResult,
  resources: SmartResource[],
  alerts: OperationalAlert[],
  isSimulationActive: boolean
): MissionReportData {
  const stationName = stationId === "maitri" ? "MAITRI" : "BHARATI";
  const now = new Date();
  const timestampUtc = `${now.toISOString().replace("T", " ").substring(0, 19)} UTC`;

  const coords = stationId === "maitri" ? "70°45′57″ S, 11°44′09″ E" : "69°24′29″ S, 76°11′14″ E";
  const region = stationId === "maitri" ? "Schirmacher Oasis, Queen Maud Land" : "Larsemann Hills, East Antarctica";

  const tempVal = currentTelemetry?.weather.temperature_c.value ?? (stationId === "maitri" ? -18.4 : -9.2);
  const windVal = currentTelemetry?.weather.wind_speed_ms.value ?? 14.2;
  const pressVal = currentTelemetry?.weather.pressure_hpa.value ?? 988.5;

  const genKw = currentTelemetry?.energy.generation_kw.value ?? (stationId === "maitri" ? 142 : 187);
  const conKw = currentTelemetry?.energy.consumption_kw.value ?? (stationId === "maitri" ? 119 : 154);
  const fuelPct = currentTelemetry?.energy.diesel_pct.value ?? (stationId === "maitri" ? 61 : 58);

  const fuelRes = resources.find((r) => r.id === "fuel");
  const batteryRes = resources.find((r) => r.id === "battery");
  const waterRes = resources.find((r) => r.id === "water");
  const foodRes = resources.find((r) => r.id === "food");

  // Health scores
  let overallHealth = stationId === "maitri" ? 82 : 89;
  let energyStatus: "NORMAL" | "WARNING" | "CRITICAL" = "WARNING";
  let logisticsStatus: "NORMAL" | "WARNING" | "CRITICAL" = fuelRes?.status === "CRITICAL" ? "CRITICAL" : "WARNING";

  if (isSimulationActive) {
    if (cascadeResult.missionRisk.simulated === "CRITICAL") {
      overallHealth = 58;
      energyStatus = "CRITICAL";
      logisticsStatus = "CRITICAL";
    } else if (cascadeResult.missionRisk.simulated === "HIGH") {
      overallHealth = 68;
      energyStatus = "WARNING";
      logisticsStatus = "WARNING";
    }
  }

  // Active risks ranking
  const activeRisks = [
    {
      rank: 1,
      title: "Battery Depletion under High Thermal Load",
      severity: "HIGH",
      timeToCritical: `${cascadeResult.batteryEnduranceHours.simulated}h endurance`,
    },
    {
      rank: 2,
      title: "Arctic Diesel Depletion Horizon",
      severity: fuelRes?.status ?? "WARNING",
      timeToCritical: `${fuelRes?.daysRemaining ?? 8.4} days`,
    },
    {
      rank: 3,
      title: "Seasonal Resupply Ice Navigation Delay",
      severity: "WARNING",
      timeToCritical: "45-day window",
    },
  ];

  return {
    station: stationName,
    stationName: stationId === "maitri" ? "Maitri Research Station" : "Bharati Research Station",
    coordinates: coords,
    region,
    timestampUtc,
    generatedBy: "Antarctic Digital Twin — Operational Intelligence System (SIH26060)",

    // 1. Station Health
    healthScore: overallHealth,
    environmentStatus: "NORMAL",
    energyStatus,
    infrastructureStatus: stationId === "maitri" ? "WARNING" : "NORMAL",
    logisticsStatus,

    // 2. Environment
    temperatureC: isSimulationActive ? cascadeResult.temperatureC.simulated : tempVal,
    windSpeedMs: windVal,
    pressureHpa: pressVal,
    snowState: isSimulationActive && cascadeResult.scenarioId === "blizzard" ? "Severe Blowing Snow (34 m/s)" : "Nominal Polar Pack",

    // 3. Energy
    batterySocPct: isSimulationActive ? cascadeResult.batterySocPct.simulated : (batteryRes?.currentLevel ?? 64),
    generatorStatus: isSimulationActive && cascadeResult.scenarioId === "generator_failure"
      ? "Gen 01 Offline · Gen 02 Overload (92%)"
      : "Gen 01 Online · Gen 02 Standby Ready",
    powerConsumptionKw: isSimulationActive ? cascadeResult.energyConsumptionPct.simulatedKw : conKw,
    powerGenerationKw: genKw,
    netPowerKw: parseFloat((genKw - (isSimulationActive ? cascadeResult.energyConsumptionPct.simulatedKw : conKw)).toFixed(1)),
    fuelLevelPct: fuelPct,
    estimatedEnduranceHours: isSimulationActive ? cascadeResult.batteryEnduranceHours.simulated : (stationId === "maitri" ? 14.5 : 18.2),

    // 4. Infrastructure
    criticalSystemsStatus: "Life Support Online · Radome Heating Active",
    equipmentHealthPct: stationId === "maitri" ? 84.5 : 94.2,
    detectedFailures: stationId === "maitri"
      ? ["Generator 02 Elevated Harmonic Vibration (6.2 mm/s)", "Lake Priyadarshini intake heating loop trace verification pending"]
      : ["Sea Water Desalination secondary RO differential pressure elevated (+0.4 bar)"],
    maintenanceRisks: ["Injector overhaul due on backup diesel genset at 8,000 runtime hours"],

    // 5. Logistics
    fuelAutonomyDays: fuelRes?.daysRemaining ?? 42.0,
    foodReservesDays: foodRes?.daysRemaining ?? 68.0,
    waterReservesDays: waterRes?.daysRemaining ?? 16.1,
    medicalSuppliesStatus: "Tier-1 Surgical & Oxygen Packs 100% Certified Green",
    resupplyStatus: isSimulationActive && (cascadeResult.scenarioId === "logistics_delay" || cascadeResult.scenarioId === "fuel_delay")
      ? "Expedition Replenishment Slipped +45 Days (Icebound)"
      : "Seasonal Replenishment on Schedule (Target: November)",

    // 6. Active Risks
    activeRisks,

    // 7. Forecast
    forecastHighlights: [
      `Arctic diesel depletion trajectory: projected threshold in ${fuelRes?.daysRemaining ?? 8.4} days`,
      `Food stockpile autonomy: stable for ${foodRes?.daysRemaining ?? 68.0} days at standard 3,200 kcal/person`,
      `Potable meltwater supply: autonomous buffer of ${waterRes?.daysRemaining ?? 16.1} days`,
    ],

    // 8. What-If Scenario
    whatIfScenarioTitle: cascadeResult.scenarioTitle,
    whatIfDuration: cascadeResult.duration,
    whatIfOverallRisk: cascadeResult.missionRisk.simulated,
    whatIfTimeUntilCritical: cascadeResult.timeToCritical.hoursOrDays,

    // 9. Cascading Impact Chain
    cascadingChain: cascadeResult.cascadeChain.map((node) => ({
      step: node.stepNumber,
      label: node.label,
      system: node.system,
      detail: node.detail,
    })),

    // 10. Recommended Actions
    recommendedActions: cascadeResult.recommendedMitigations.map((action) => ({
      id: action.id,
      action: action.title,
      impact: action.impactLabel,
      status: action.applied ? "SIMULATED / APPLIED" : "RECOMMENDED",
    })),
  };
}
