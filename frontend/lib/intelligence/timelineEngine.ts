/**
 * SCENARIO TIMELINE ENGINE
 * ========================
 * Generates a data-driven timeline from CascadeResult.
 * Events are derived from cascade chain nodes — NOT decorative.
 *
 * Architecture: CascadeResult.cascadeChain → ScenarioTimelineEvent[]
 */

import { CascadeResult, RiskLevel } from "./types";
import { SmartResource } from "./types";

export type TimelineSeverity = "NORMAL" | "WARNING" | "HIGH" | "CRITICAL";

export interface ScenarioTimelineEvent {
  time: string;       // e.g. "T+0", "T+12h", "T+24h"
  timeHours: number;  // numeric hours for sorting
  event: string;
  system: string;
  severity: TimelineSeverity;
  impact: string;
  mitigated?: boolean; // true if this event is avoided/reduced with mitigation
}

export interface ScenarioTimeline {
  withoutMitigation: ScenarioTimelineEvent[];
  withMitigation: ScenarioTimelineEvent[];
  scenarioTitle: string;
  durationWindow: string;
}

function directToSeverity(direction: string, metricDelta: string): TimelineSeverity {
  if (direction === "critical") return "CRITICAL";
  if (direction === "warning") return "WARNING";
  if (direction === "up" || direction === "down") {
    // Check if the delta indicates severity
    if (metricDelta?.includes("CRITICAL") || metricDelta?.includes("HIGH RISK")) return "CRITICAL";
    if (metricDelta?.includes("HIGH") || metricDelta?.includes("WARNING")) return "WARNING";
    return "HIGH";
  }
  return "NORMAL";
}

/**
 * Generate timeline from cascade chain + scenario parameters.
 * Time spacing is based on duration window and scenario type.
 */
export function generateScenarioTimeline(
  cascade: CascadeResult,
  resources: SmartResource[],
  appliedActionIds: string[]
): ScenarioTimeline {
  const hasMitigation = appliedActionIds.length > 0;
  const durationHours = parseInt(cascade.duration, 10); // 12, 24, 48, 72
  const chainLength = cascade.cascadeChain.length;

  // Distribute cascade events evenly across the duration
  const timeStep = Math.round(durationHours / Math.max(chainLength, 1));

  const withoutMitigation: ScenarioTimelineEvent[] = [];
  const withMitigation: ScenarioTimelineEvent[] = [];

  // T+0: Scenario begins
  withoutMitigation.push({
    time: "T+0",
    timeHours: 0,
    event: `${cascade.scenarioTitle} begins`,
    system: cascade.cascadeChain[0]?.system ?? "System",
    severity: "WARNING",
    impact: cascade.summary,
  });

  // Map cascade chain to timeline events
  cascade.cascadeChain.forEach((node, idx) => {
    if (idx === 0) return; // T+0 is handled above

    const timeHours = idx * timeStep;
    const timeLabel = timeHours < 24 ? `T+${timeHours}h` : `T+${Math.round(timeHours / 24)}d`;
    const severity = directToSeverity(node.direction, node.metricDelta ?? "");

    withoutMitigation.push({
      time: timeLabel,
      timeHours,
      event: node.label,
      system: node.system,
      severity,
      impact: node.detail,
      mitigated: false,
    });
  });

  // Add resource-derived events based on scenario
  const fuelResource = resources.find(r => r.id === "fuel");
  if (fuelResource && fuelResource.daysRemaining < 15) {
    const fuelWarnHours = Math.round(fuelResource.daysRemaining * 24 * 0.6);
    const fuelLabel = fuelWarnHours < 24 ? `T+${fuelWarnHours}h` : `T+${Math.round(fuelWarnHours / 24)}d`;
    withoutMitigation.push({
      time: fuelLabel,
      timeHours: fuelWarnHours,
      event: `Fuel reserve below ${Math.round(fuelResource.daysRemaining)} day threshold`,
      system: "Logistics",
      severity: fuelResource.daysRemaining < 7 ? "CRITICAL" : "HIGH",
      impact: `Diesel at ${fuelResource.currentLevel}% — ${fuelResource.daysRemaining}d remaining`,
      mitigated: false,
    });
  }

  // Add time-to-critical event
  const ttcText = cascade.timeToCritical.hoursOrDays;
  const ttcMatch = ttcText.match(/^([\d.]+)/);
  if (ttcMatch) {
    const ttcVal = parseFloat(ttcMatch[1]);
    const ttcHours = ttcText.includes("day") ? ttcVal * 24 : ttcVal;
    if (ttcHours <= durationHours) {
      const ttcLabel = ttcHours < 24 ? `T+${Math.round(ttcHours)}h` : `T+${Math.round(ttcHours / 24)}d`;
      withoutMitigation.push({
        time: ttcLabel,
        timeHours: ttcHours,
        event: `${cascade.timeToCritical.resourceOrSystem} reaches critical threshold`,
        system: "System",
        severity: "CRITICAL",
        impact: cascade.timeToCritical.description,
        mitigated: false,
      });
    }
  }

  // Mission readiness degraded event
  withoutMitigation.push({
    time: `T+${Math.round(durationHours * 0.75)}h`,
    timeHours: durationHours * 0.75,
    event: "Mission readiness significantly reduced",
    system: "Operations",
    severity: cascade.missionRisk.simulated === "CRITICAL" ? "CRITICAL" : "HIGH",
    impact: `Mission risk: ${cascade.missionRisk.simulated} — operational continuity at risk`,
    mitigated: false,
  });

  // Sort by time
  withoutMitigation.sort((a, b) => a.timeHours - b.timeHours);

  // --- WITH MITIGATION timeline ---
  // Copy base events then show which ones are resolved/reduced
  if (hasMitigation) {
    withoutMitigation.forEach((event, idx) => {
      if (idx === 0) {
        // T+0 same
        withMitigation.push({ ...event });
        return;
      }

      // Critical events become WARNING with mitigation applied
      // Later events get "Controlled" or "Stabilized"
      const mitigatedSeverity: TimelineSeverity =
        event.severity === "CRITICAL" ? "HIGH"
        : event.severity === "HIGH" ? "WARNING"
        : event.severity;

      const isLate = event.timeHours >= durationHours * 0.6;

      if (isLate && event.severity === "CRITICAL") {
        // Replace with stabilization event
        withMitigation.push({
          ...event,
          event: `${event.system} stabilized by mitigation actions`,
          severity: "WARNING",
          impact: "Load shedding and backup generation reduced impact",
          mitigated: true,
        });
      } else if (event.event.includes("critical threshold")) {
        withMitigation.push({
          ...event,
          event: `${event.system} threshold extended by conservation`,
          severity: mitigatedSeverity,
          impact: "Applied load reduction delayed critical threshold by ~6h",
          mitigated: true,
        });
      } else {
        withMitigation.push({
          ...event,
          severity: mitigatedSeverity,
          mitigated: event.severity !== mitigatedSeverity,
        });
      }
    });

    // Add a stabilization event at end
    withMitigation.push({
      time: `T+${durationHours}h`,
      timeHours: durationHours,
      event: "Station operational state stabilized",
      system: "Operations",
      severity: "WARNING",
      impact: `Mission risk reduced from ${cascade.missionRisk.simulated} to ${cascade.missionRisk.afterAction} with applied mitigations`,
      mitigated: true,
    });

    withMitigation.sort((a, b) => a.timeHours - b.timeHours);
  } else {
    // No mitigation — copy without mitigation
    withoutMitigation.forEach(e => withMitigation.push({ ...e }));
  }

  return {
    withoutMitigation,
    withMitigation,
    scenarioTitle: cascade.scenarioTitle,
    durationWindow: cascade.duration,
  };
}
