/**
 * LOGISTICS ROUTE SIMULATION ENGINE
 * ===================================
 * Simulates supply route parameters for Antarctic logistics.
 * Connects to resource forecast to detect supply-gap risk.
 *
 * Architecture: RouteParams + WeatherCondition → LogisticsRoute
 * Resources.daysRemaining → supply gap detection
 *
 * All values are deterministic. No Math.random().
 */

import { SmartResource } from "./types";

export type WeatherCondition = "NORMAL" | "SEVERE_COLD" | "BLIZZARD" | "HIGH_WIND";
export type RouteRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RouteDefinition {
  id: string;
  name: string;
  from: string;
  to: string;
  baseDistanceKm: number;
  baseEtaHours: number;
  riskLabel: RouteRisk;
}

export interface LogisticsRoute {
  routeId: string;
  name: string;
  from: string;
  to: string;
  distanceKm: number;
  normalEtaHours: number;
  estimatedEtaHours: number;
  delayHours: number;
  weatherCondition: WeatherCondition;
  routeRisk: RouteRisk;
  fuelConsumptionMultiplier: number;
  resourceRequired: string;
  supplyGapDetected: boolean;
  supplyGapDetails: string | null;
  explanation: string;
  source: "simulated";
}

export interface RouteAlternative {
  route: RouteDefinition;
  estimatedEtaHours: number;
  routeRisk: RouteRisk;
  notes: string;
}

/** Deterministic route definitions */
export const ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    id: "goa-maitri-sea",
    name: "Goa → Maitri (Sea Route)",
    from: "Goa, India",
    to: "Maitri Station",
    baseDistanceKm: 9200,
    baseEtaHours: 480, // ~20 days
    riskLabel: "MEDIUM",
  },
  {
    id: "goa-bharati-sea",
    name: "Goa → Bharati (Sea Route)",
    from: "Goa, India",
    to: "Bharati Station",
    baseDistanceKm: 10400,
    baseEtaHours: 528, // ~22 days
    riskLabel: "MEDIUM",
  },
  {
    id: "maitri-bharati-traverse",
    name: "Maitri → Bharati (Ground Traverse)",
    from: "Maitri Station",
    to: "Bharati Station",
    baseDistanceKm: 3200,
    baseEtaHours: 96, // 4 days
    riskLabel: "HIGH",
  },
  {
    id: "cape-town-maitri-air",
    name: "Cape Town → Maitri (Air)",
    from: "Cape Town, South Africa",
    to: "Maitri Station",
    baseDistanceKm: 4800,
    baseEtaHours: 72, // 3 days incl. clearance
    riskLabel: "MEDIUM",
  },
];

/** Weather multipliers for travel time and risk */
const WEATHER_EFFECTS: Record<WeatherCondition, {
  speedMultiplier: number;
  fuelMultiplier: number;
  riskEscalation: number; // added to base risk index
  label: string;
}> = {
  NORMAL:      { speedMultiplier: 1.00, fuelMultiplier: 1.00, riskEscalation: 0, label: "Normal conditions" },
  SEVERE_COLD: { speedMultiplier: 0.78, fuelMultiplier: 1.28, riskEscalation: 1, label: "Severe cold — speed reduced" },
  BLIZZARD:    { speedMultiplier: 0.52, fuelMultiplier: 1.55, riskEscalation: 2, label: "Blizzard — major delays expected" },
  HIGH_WIND:   { speedMultiplier: 0.70, fuelMultiplier: 1.35, riskEscalation: 1, label: "High wind — reduced visibility" },
};

const RISK_INDEX: RouteRisk[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function escalateRisk(base: RouteRisk, steps: number): RouteRisk {
  const idx = RISK_INDEX.indexOf(base);
  return RISK_INDEX[Math.min(RISK_INDEX.length - 1, idx + steps)];
}

/**
 * Simulate a logistics route with weather impact.
 */
export function simulateRoute(
  routeId: string,
  weatherCondition: WeatherCondition,
  resources: SmartResource[]
): LogisticsRoute {
  const routeDef = ROUTE_DEFINITIONS.find(r => r.id === routeId) ?? ROUTE_DEFINITIONS[0];
  const wx = WEATHER_EFFECTS[weatherCondition];

  const estimatedEtaHours = Math.round(routeDef.baseEtaHours / wx.speedMultiplier);
  const delayHours = estimatedEtaHours - routeDef.baseEtaHours;
  const routeRisk = escalateRisk(routeDef.riskLabel, wx.riskEscalation);
  const fuelMultiplier = wx.fuelMultiplier;

  // Supply gap detection — does fuel deplete before supply arrives?
  const fuelResource = resources.find(r => r.id === "fuel");
  const fuelDaysRemaining = fuelResource?.daysRemaining ?? 30;
  const etaDays = estimatedEtaHours / 24;

  const supplyGapDetected = etaDays > fuelDaysRemaining;
  const gapDays = supplyGapDetected ? Math.round(etaDays - fuelDaysRemaining) : 0;

  const supplyGapDetails = supplyGapDetected
    ? `Projected fuel depletion occurs approximately ${gapDays} day${gapDays !== 1 ? "s" : ""} before simulated resupply arrival. Risk: HIGH. [Simulated projection]`
    : null;

  // Explanation text
  const etaDaysRounded = Math.round(etaDays);
  let explanation = `Route: ${routeDef.from} → ${routeDef.to} · Distance: ${routeDef.baseDistanceKm.toLocaleString()} km. `;
  explanation += `Normal ETA: ${Math.round(routeDef.baseEtaHours / 24)} days. `;
  explanation += wx.speedMultiplier < 1
    ? `${wx.label} reduces travel speed to ${Math.round(wx.speedMultiplier * 100)}%, extending ETA to ~${etaDaysRounded} days (+${Math.round(delayHours / 24)}d delay). `
    : "Normal conditions — standard ETA. ";
  explanation += `Fuel consumption ${Math.round(fuelMultiplier * 100)}% of baseline. `;
  if (supplyGapDetected) {
    explanation += `⚠ SUPPLY GAP: Fuel reserves (~${fuelDaysRemaining} days) will be exhausted ${gapDays}d before estimated arrival. Contingency required. [Simulated]`;
  }

  return {
    routeId,
    name: routeDef.name,
    from: routeDef.from,
    to: routeDef.to,
    distanceKm: routeDef.baseDistanceKm,
    normalEtaHours: routeDef.baseEtaHours,
    estimatedEtaHours,
    delayHours,
    weatherCondition,
    routeRisk,
    fuelConsumptionMultiplier: fuelMultiplier,
    resourceRequired: "Diesel fuel, food provisions",
    supplyGapDetected,
    supplyGapDetails,
    explanation,
    source: "simulated",
  };
}

/**
 * Get alternative routes for comparison
 */
export function getRouteAlternatives(
  destinationStation: "maitri" | "bharati",
  weatherCondition: WeatherCondition,
  resources: SmartResource[]
): RouteAlternative[] {
  const seaRouteId = destinationStation === "maitri" ? "goa-maitri-sea" : "goa-bharati-sea";
  const airRouteId = "cape-town-maitri-air";
  const wx = WEATHER_EFFECTS[weatherCondition];

  const alternatives: RouteAlternative[] = [];

  // Sea route
  const seaDef = ROUTE_DEFINITIONS.find(r => r.id === seaRouteId)!;
  if (seaDef) {
    const seaEta = Math.round(seaDef.baseEtaHours / wx.speedMultiplier);
    alternatives.push({
      route: seaDef,
      estimatedEtaHours: seaEta,
      routeRisk: escalateRisk(seaDef.riskLabel, wx.riskEscalation),
      notes: "Primary resupply route — high capacity, weather sensitive",
    });
  }

  // Air route (if Maitri)
  if (destinationStation === "maitri") {
    const airDef = ROUTE_DEFINITIONS.find(r => r.id === airRouteId)!;
    if (airDef) {
      // Air less affected by weather but high wind limits it
      const airWeatherFactor = weatherCondition === "BLIZZARD" ? 0.6 : weatherCondition === "HIGH_WIND" ? 0.75 : 1.0;
      const airEta = Math.round(airDef.baseEtaHours / airWeatherFactor);
      alternatives.push({
        route: airDef,
        estimatedEtaHours: airEta,
        routeRisk: weatherCondition === "BLIZZARD" ? "HIGH" : weatherCondition === "HIGH_WIND" ? "HIGH" : "MEDIUM",
        notes: "Faster but limited capacity — emergency/priority cargo only",
      });
    }
  }

  return alternatives;
}
