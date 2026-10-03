import { OperationalAlert, AffectedSystem, ScenarioId, SeverityLevel } from "./types";

export interface AlertCounts {
  critical: number;
  high: number;
  warning: number;
  info: number;
  total: number;
}

/**
 * Generate actionable alerts derived from station telemetry, anomalies, and active simulation scenarios.
 */
export function generateAlerts(
  stationId: "maitri" | "bharati",
  scenarioId: ScenarioId | null,
  severity: SeverityLevel = "severe",
  isSimulating: boolean = false,
  hasMitigationApplied: boolean = false
): OperationalAlert[] {
  const stationName = stationId === "maitri" ? "Maitri" : "Bharati";

  // Base telemetry alerts that always reflect real/simulated station health
  const alerts: OperationalAlert[] = [];

  if (stationId === "maitri") {
    // Maitri has gen-02 vibration anomaly and older fuel buffer
    alerts.push({
      id: "alt-m-1",
      severity: "WARNING",
      title: "Generator 02 Harmonic Vibration Detected",
      cause: "High mechanical bearing vibration (6.2 mm/s vs 4.0 mm/s limit) on secondary 250 kW diesel unit.",
      affectedSystem: "Infrastructure",
      timeToImpact: "14 days",
      recommendedAction: "Schedule emergency mechanical bearing re-greasing and fuel injector inspection.",
      projectedImprovement: "Vibration reduction -45%, equipment lifespan extended",
      targetTab: "assets",
      targetElementId: "gen-02",
      source: "derived",
      timestamp: "10:14 UTC",
    });

    alerts.push({
      id: "alt-m-2",
      severity: "WARNING",
      title: "Lake Water Pump Freeze Protection Warning",
      cause: "Ambient temperature drop near Priyadarshini Lake intake trace heating circuit.",
      affectedSystem: "Infrastructure",
      timeToImpact: "18 hours",
      recommendedAction: "Verify trace heating circuit current draw (+3°C nominal) and purge intake loop.",
      projectedImprovement: "Freezing prevention assured, 14,800 L potable water buffer protected",
      targetTab: "assets",
      targetElementId: "water-pump",
      source: "derived",
      timestamp: "09:45 UTC",
    });
  } else {
    // Bharati alerts
    alerts.push({
      id: "alt-b-1",
      severity: "WARNING",
      title: "Sea Water Pump House Strainer Delta-P",
      cause: "Prydz Bay sea ice slush accumulation against offshore intake strainer mesh.",
      affectedSystem: "Infrastructure",
      timeToImpact: "28 hours",
      recommendedAction: "Trigger backwash cycle on seawater desalination primary feed pump.",
      projectedImprovement: "Intake differential pressure normalized from 3.5 bar → 2.1 bar",
      targetTab: "assets",
      targetElementId: "water-pump",
      source: "derived",
      timestamp: "10:30 UTC",
    });
  }

  // Common baseline alert
  alerts.push({
    id: "alt-common-1",
    severity: "INFO",
    title: "Polar Satellite Comms Nominal Pass",
    cause: "ISRO ground station tracking antenna aligned with geostationary data transponder.",
    affectedSystem: "Communications",
    timeToImpact: "Nominal",
    recommendedAction: "Continue automated telemetry sync with NCPOR polar operations data center.",
    projectedImprovement: "0% packet drop, sub-second telemetry latency",
    targetTab: "overview",
    targetElementId: "overview-telemetry",
    source: "real",
    timestamp: "10:55 UTC",
  });

  // When a scenario is simulated, generate immediate critical & high actionable alerts
  if (isSimulating && scenarioId) {
    if (scenarioId === "extreme_cold") {
      alerts.unshift(
        {
          id: "alt-sim-ec-1",
          severity: hasMitigationApplied ? "WARNING" : "CRITICAL",
          title: hasMitigationApplied
            ? "Generator Overload Mitigated via Load Shedding"
            : "Generator Overload Predicted Under Cold Surge",
          cause: "Extreme cold causing increased heating demand (+27%) and microgrid power surge.",
          affectedSystem: "Microgrid",
          timeToImpact: hasMitigationApplied ? "22.5 hours" : "11.4 hours",
          recommendedAction: hasMitigationApplied
            ? "Maintain non-critical load reduction and monitor battery buffer SOC."
            : "Shift non-critical electrical loads and prioritize critical habitat systems.",
          projectedImprovement: "Generator load -18%, battery endurance +2.9h (8.2h → 11.1h)",
          targetTab: "whatif",
          targetElementId: "whatif-cascade",
          source: "derived",
          timestamp: "Simulated",
        },
        {
          id: "alt-sim-ec-2",
          severity: hasMitigationApplied ? "WARNING" : "HIGH",
          title: "Battery BESS Rapid Discharge Alert",
          cause: "Station load exceeding generation baseline, depleting battery reserve down to 42% SOC.",
          affectedSystem: "Energy",
          timeToImpact: hasMitigationApplied ? "11.1 hours" : "8.2 hours",
          recommendedAction: "Engage auxiliary generator bus to equalize microgrid power balance.",
          projectedImprovement: "Battery discharge reduced by -35%, endurance improved to 11.1h",
          targetTab: "overview",
          targetElementId: "energy-section",
          source: "derived",
          timestamp: "Simulated",
        },
        {
          id: "alt-sim-ec-3",
          severity: "HIGH",
          title: "Accelerated Diesel Burn Rate Warning",
          cause: `Continuous heating requirement drives fuel burn rate to 9.1%/day (+13% above nominal).`,
          affectedSystem: "Logistics",
          timeToImpact: "8.4 days",
          recommendedAction: "Transmit priority logistic resupply request to NCPOR Goa via satellite.",
          projectedImprovement: "Winter reserve threshold protected against premature exhaustion",
          targetTab: "forecast",
          targetElementId: "forecast-diesel",
          source: "derived",
          timestamp: "Simulated",
        }
      );
    } else if (scenarioId === "generator_failure") {
      alerts.unshift(
        {
          id: "alt-sim-gf-1",
          severity: "CRITICAL",
          title: "Primary 250 kW Generator Offline",
          cause: "Total mechanical shutdown of Generator 01; single-point generation vulnerability.",
          affectedSystem: "Microgrid",
          timeToImpact: "6.2 hours",
          recommendedAction: "Shed all non-essential loads immediately and inspect Gen-02 thermal parameters.",
          projectedImprovement: "Prevent secondary generator trip and maintain life-support continuity",
          targetTab: "assets",
          targetElementId: "gen-01",
          source: "derived",
          timestamp: "Simulated",
        },
        {
          id: "alt-sim-gf-2",
          severity: "CRITICAL",
          title: "Severe Microgrid Capacity Deficit",
          cause: "Available continuous generation drops from 250 kW to 125 kW against 140 kW station load.",
          affectedSystem: "Energy",
          timeToImpact: "Immediate",
          recommendedAction: "Activate stage-1 automated load shed; disconnect auxiliary lab containers.",
          projectedImprovement: "Net power balance restored to zero deficit",
          targetTab: "overview",
          targetElementId: "energy-section",
          source: "derived",
          timestamp: "Simulated",
        }
      );
    } else if (scenarioId === "blizzard") {
      alerts.unshift(
        {
          id: "alt-sim-bz-1",
          severity: "HIGH",
          title: "Category-3 Blizzard Lockdown Mandatory",
          cause: "Severe storm front bringing sustained 34 m/s katabatic gusts and zero visibility.",
          affectedSystem: "Infrastructure",
          timeToImpact: "Immediate",
          recommendedAction: "Seal outer airlocks, halt all external scientific traverses, and secure fuel tanks.",
          projectedImprovement: "Zero personnel exposure risk, structural windward integrity maintained",
          targetTab: "overview",
          targetElementId: "overview-weather",
          source: "derived",
          timestamp: "Simulated",
        },
        {
          id: "alt-sim-bz-2",
          severity: "HIGH",
          title: "Logistics Resupply Transfer Halted",
          cause: "Extreme snowdrift accumulation blocks fuel tanker transfer umbilical lines.",
          affectedSystem: "Logistics",
          timeToImpact: "18.5 hours",
          recommendedAction: "Rely strictly on internal module stores until blizzard eye transit.",
          projectedImprovement: "Prevent fuel line rupture and mechanical snow-packing",
          targetTab: "forecast",
          targetElementId: "forecast-food",
          source: "derived",
          timestamp: "Simulated",
        }
      );
    } else if (scenarioId === "logistics_delay" || scenarioId === "fuel_delay") {
      alerts.unshift(
        {
          id: "alt-sim-ld-1",
          severity: "CRITICAL",
          title: "Expedition Fuel Resupply Delay: 45 Days",
          cause: "Sea-ice consolidation traps seasonal supply ship; fuel reserves will breach 15% margin.",
          affectedSystem: "Logistics",
          timeToImpact: "8.4 days",
          recommendedAction: "Enforce stage-2 power rationing; drop non-critical module heating setpoints.",
          projectedImprovement: "Extend fuel autonomy cushion from 8.4 days to 28 days",
          targetTab: "forecast",
          targetElementId: "forecast-diesel",
          source: "derived",
          timestamp: "Simulated",
        },
        {
          id: "alt-sim-ld-2",
          severity: "HIGH",
          title: "Food Rations Conservation Protocol Activated",
          cause: "Delayed replenishment necessitates transition from frozen stores to dry freeze-dried rations.",
          affectedSystem: "Logistics",
          timeToImpact: "32 days",
          recommendedAction: "Audit dry ration pantry and cap daily calorie distribution to 3,200 kcal/person.",
          projectedImprovement: "Preserve 60-day survival horizon across wintering personnel",
          targetTab: "forecast",
          targetElementId: "forecast-food",
          source: "derived",
          timestamp: "Simulated",
        }
      );
    } else {
      alerts.unshift({
        id: "alt-sim-gen-1",
        severity: "HIGH",
        title: `Operational Disruption Active: ${scenarioId.replace(/_/g, " ").toUpperCase()}`,
        cause: "Simulated operational stress testing digital twin response across interconnected subsystems.",
        affectedSystem: "Infrastructure",
        timeToImpact: "Active Window",
        recommendedAction: "Review cascading risk chain and apply recommended mitigation procedures.",
        projectedImprovement: "Stabilize station operational readiness score",
        targetTab: "whatif",
        targetElementId: "whatif-cascade",
        source: "derived",
        timestamp: "Simulated",
      });
    }
  }

  return alerts;
}

export function countAlerts(alerts: OperationalAlert[]): AlertCounts {
  let critical = 0;
  let high = 0;
  let warning = 0;
  let info = 0;

  for (const a of alerts) {
    if (a.severity === "CRITICAL") critical++;
    else if (a.severity === "HIGH") high++;
    else if (a.severity === "WARNING") warning++;
    else if (a.severity === "INFO") info++;
  }

  return {
    critical,
    high,
    warning,
    info,
    total: alerts.length,
  };
}
