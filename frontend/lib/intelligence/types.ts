import { DataSource } from "../types";

export type ScenarioId =
  | "extreme_cold"
  | "blizzard"
  | "high_wind"
  | "generator_failure"
  | "battery_degradation"
  | "communication_failure"
  | "logistics_delay"
  | "fuel_delay"
  | "hvac_failure"
  | "multiple_failures";

export type SeverityLevel = "moderate" | "severe" | "critical";

export type DurationWindow = "12h" | "24h" | "48h" | "72h";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AffectedSystem =
  | "Energy"
  | "Microgrid"
  | "Infrastructure"
  | "Logistics"
  | "Life Support"
  | "Communications"
  | "Science Operations";

export interface CascadeNode {
  id: string;
  stepNumber: number;
  label: string;
  system: AffectedSystem;
  direction: "up" | "down" | "warning" | "critical" | "neutral";
  detail: string;
  metricDelta?: string;
  source: DataSource;
}

export interface MetricComparison {
  label: string;
  unit: string;
  baseline: number;
  scenario: number;
  afterAction: number;
  formattedBaseline: string;
  formattedScenario: string;
  formattedAfterAction: string;
  trend: "worse" | "better" | "neutral";
}

export interface MitigationAction {
  id: string;
  title: string;
  description: string;
  impactLabel: string;
  simulatedOutcome: string;
  riskReduction: string;
  applied: boolean;
  order: number;
}

export interface CascadeResult {
  scenarioId: ScenarioId;
  scenarioTitle: string;
  severity: SeverityLevel;
  duration: DurationWindow;
  stationId: "maitri" | "bharati";
  stationName: string;
  trigger: string;
  summary: string;

  // Key metrics
  temperatureC: { baseline: number; simulated: number; delta: string };
  heatingDemandPct: { deltaPct: number; simulatedKw: number };
  energyConsumptionPct: { deltaPct: number; simulatedKw: number };
  batterySocPct: { baseline: number; simulated: number; afterAction: number };
  batteryEnduranceHours: { baseline: number; simulated: number; afterAction: number };
  generatorLoadPct: { baseline: number; simulated: number; afterAction: number };
  fuelConsumptionPctDay: { baseline: number; simulated: number; afterAction: number };
  
  resupplyRisk: RiskLevel;
  missionRisk: { baseline: RiskLevel; simulated: RiskLevel; afterAction: RiskLevel };
  
  timeToCritical: {
    hoursOrDays: string;
    resourceOrSystem: string;
    description: string;
  };
  
  affectedSystems: AffectedSystem[];
  cascadeChain: CascadeNode[];
  
  // Mitigation actions
  recommendedMitigations: MitigationAction[];
  
  // Before / After table metrics
  comparisons: MetricComparison[];
}

export interface OperationalAlert {
  id: string;
  severity: "CRITICAL" | "HIGH" | "WARNING" | "INFO";
  title: string;
  cause: string;
  affectedSystem: AffectedSystem;
  timeToImpact: string;
  recommendedAction: string;
  projectedImprovement: string;
  targetTab: "overview" | "assets" | "whatif" | "forecast";
  targetElementId: string;
  source: DataSource;
  timestamp: string;
}

export interface SmartResourceForecastPoint {
  day: number;
  level: number;
}

export interface SmartResource {
  id: "fuel" | "battery" | "water" | "food" | "medical";
  name: string;
  currentLevel: number;
  unit: string;
  capacityMax: number;
  consumptionRate: number;
  consumptionUnit: string;
  remainingQuantity: string;
  daysRemaining: number;
  predictedDepletionDays: number;
  status: "NOMINAL" | "WARNING" | "CRITICAL";
  recommendedAction: string;
  timeToCritical: string;
  source: DataSource;
  history: SmartResourceForecastPoint[];
}

export interface ScenarioDefinitionExtended {
  id: ScenarioId;
  title: string;
  tagline: string;
  category: "ENERGY" | "ENVIRONMENTAL" | "LOGISTICS" | "INFRASTRUCTURE" | "COMPOUND";
  description: string;
  defaultSeverity: SeverityLevel;
  defaultDuration: DurationWindow;
  iconName: string;
}
