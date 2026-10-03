"use client";

import React, { useState } from "react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import {
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  ChevronDown,
  ChevronUp,
  Flame,
  BatteryCharging,
  Zap,
  ShieldAlert,
} from "lucide-react";

export const ExplainableRisk: React.FC = () => {
  const { cascadeResult, isSimulationActive, missionReadiness } = useOperationalIntelligence();
  const [isOpen, setIsOpen] = useState(true);

  const currentRisk = isSimulationActive
    ? cascadeResult.missionRisk.simulated
    : "LOW";

  // Derive top risk drivers dynamically from cascadeResult
  const deriveDrivers = () => {
    if (!isSimulationActive) {
      return [
        { name: "Polar baseline environmental load", contribution: 40, detail: "Continuous sub-zero ambient conditions" },
        { name: "Single-source maritime supply lines", contribution: 30, detail: "Seasonal resupply dependency" },
        { name: "Microgrid diesel base load requirement", contribution: 20, detail: "Non-renewable generator reliance" },
        { name: "Satellite tracking link latency", contribution: 10, detail: "High-latitude VSAT jitter" },
      ];
    }

    switch (cascadeResult.scenarioId) {
      case "extreme_cold":
        return [
          { name: "Extreme sub-zero heating thermal surge", contribution: 34, detail: `Ambient drop ${cascadeResult.temperatureC.delta}` },
          { name: "Elevated generator alternator load", contribution: 28, detail: `Generator running at ${cascadeResult.generatorLoadPct.simulated}%` },
          { name: "Accelerated battery buffer depletion", contribution: 22, detail: `SOC drawn down to ${cascadeResult.batterySocPct.simulated}%` },
          { name: "Steepened daily fuel burn rate", contribution: 16, detail: `Consuming ${cascadeResult.fuelConsumptionPctDay.simulated}% / day` },
        ];
      case "generator_failure":
        return [
          { name: "Primary 250 kW generator mechanical trip", contribution: 45, detail: "50% generation capacity offline" },
          { name: "Backup generator single-bus overload", contribution: 30, detail: `Load throttled to ${cascadeResult.generatorLoadPct.simulated}%` },
          { name: "Rapid battery reserve inversion", contribution: 15, detail: "Inverters buffering power deficit" },
          { name: "Auxiliary circuit emergency shedding", contribution: 10, detail: "Science lab priority dropped" },
        ];
      case "blizzard":
        return [
          { name: "Extreme katabatic gale wind velocity", contribution: 38, detail: "Outside operations suspended" },
          { name: "Fuel farm convoy ground traverse hold", contribution: 28, detail: "Resupply transfer blocked" },
          { name: "Perimeter vestibule trace heating draw", contribution: 20, detail: "Structural thermal de-icing active" },
          { name: "Atmospheric satellite link scintillation", contribution: 14, detail: "Telemetry packet latency elevated" },
        ];
      case "logistics_delay":
      case "fuel_delay":
        return [
          { name: "Resupply vessel sea-ice stall", contribution: 42, detail: "+45 day delivery slip" },
          { name: "Bulk fuel farm reserve exhaustion curve", contribution: 30, detail: "Depletion approaching critical window" },
          { name: "Mandatory thermal conservation throttling", contribution: 18, detail: "Secondary modules cold-stored" },
          { name: "Contingency inventory buffer contraction", contribution: 10, detail: "Safety reserve compromised" },
        ];
      default:
        return [
          { name: "Simulated operational stressor", contribution: 35, detail: cascadeResult.trigger },
          { name: "Secondary microgrid load elevation", contribution: 30, detail: "Auxiliary power demand increase" },
          { name: "Resource endurance buffer reduction", contribution: 20, detail: "Consumable safety margin contracted" },
          { name: "Operational visibility & monitoring strain", contribution: 15, detail: "Decision support window compressed" },
        ];
    }
  };

  const drivers = deriveDrivers();

  // Generate plain-English explanation
  const getExplanationSentence = () => {
    if (!isSimulationActive) {
      return "Current operational risk is LOW because all generation, battery buffers, and thermal loops are operating within nominal baseline parameters.";
    }

    if (cascadeResult.scenarioId === "extreme_cold") {
      return "Risk is HIGH because battery reserve is falling while generator load is elevated due to the ambient cold snap. Without mitigation, the model projects reduced energy resilience within 24h.";
    }
    if (cascadeResult.scenarioId === "generator_failure") {
      return "Risk is CRITICAL because the primary generator is offline and secondary generation is operating near maximum continuous rating without redundancy.";
    }
    if (cascadeResult.scenarioId === "blizzard") {
      return "Risk is HIGH because severe winds force station lockdown and halt external logistics movement, isolating module stockpiles.";
    }
    return `Risk is ${currentRisk} because ${cascadeResult.summary.toLowerCase()}`;
  };

  return (
    <div className="rounded-[26px] border border-white/10 bg-ops-panel shadow-[0_6px_20px_rgba(0,0,0,0.22)] overflow-hidden">
      {/* Header bar with "WHY IS THIS HIGH?" trigger */}
      <div className="px-6 sm:px-7 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-amber/15 text-ops-amber border border-ops-amber/25">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
                Explainable Risk Intelligence
              </h2>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                currentRisk === "CRITICAL"
                  ? "bg-ops-red/20 text-ops-red border border-ops-red/30"
                  : currentRisk === "HIGH"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : currentRisk === "MEDIUM"
                  ? "bg-ops-amber/20 text-ops-amber border border-ops-amber/30"
                  : "bg-ops-green/20 text-ops-green border border-ops-green/30"
              }`}>
                RISK: {currentRisk}
              </span>
            </div>
            <p className="text-[11px] text-ops-text-2 mt-0.5">
              Causal decomposition &amp; systemic risk attribution
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ops-amber/20 hover:bg-ops-amber/30 border border-ops-amber/40 text-ops-amber text-xs font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>Why is this {currentRisk}?</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Natural Language Explanation Box */}
          <div className="p-4 rounded-2xl bg-ops-card border border-white/10 flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
              currentRisk === "CRITICAL" ? "text-ops-red" : currentRisk === "HIGH" ? "text-orange-400" : "text-ops-amber"
            }`} />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ops-text">
                Operational Intelligence Assessment
              </h3>
              <p className="text-xs text-ops-text-2 mt-1 leading-relaxed">
                {getExplanationSentence()}
              </p>
            </div>
          </div>

          {/* 11.1 Top Risk Drivers */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3 flex justify-between items-center mb-3">
              <span>Top Risk Drivers (Simulated Contribution)</span>
              <span>Attribution</span>
            </div>

            <div className="space-y-3">
              {drivers.map((drv, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-ops-text">
                      {idx + 1}. {drv.name}
                    </span>
                    <span className="font-mono font-bold text-ops-teal">
                      {drv.contribution}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ops-card border border-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ops-teal to-ops-amber transition-all duration-500"
                      style={{ width: `${drv.contribution}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-ops-text-3">{drv.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 11.2 Causal Risk Chain */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3 mb-3">
              Causal Propagation Chain (Connected to Cascading Risk Engine)
            </div>

            {/* Horizontal flow on desktop / vertical stack on mobile */}
            <div className="p-4 rounded-2xl bg-ops-card/60 border border-white/10 overflow-x-auto">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 min-w-max">
                {cascadeResult.cascadeChain.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div className="p-3 rounded-xl bg-ops-panel border border-white/10 flex flex-col items-center text-center w-full sm:w-36">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[8px] font-mono text-ops-text-3 font-semibold">
                          STEP {node.stepNumber}
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          i === 0
                            ? "bg-ops-teal/15 text-ops-teal border-ops-teal/30"
                            : i === 1
                            ? "bg-ops-amber/15 text-ops-amber border-ops-amber/30"
                            : i === cascadeResult.cascadeChain.length - 1
                            ? "bg-ops-red/15 text-ops-red border-ops-red/30"
                            : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                        }`}>
                          {i === 0
                            ? "CAUSE"
                            : i === 1
                            ? "IMPACT"
                            : i === cascadeResult.cascadeChain.length - 1
                            ? "MISSION RISK"
                            : "CASCADING EFFECT"}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-ops-text line-clamp-2">
                        {node.label}
                      </span>
                      <span className="text-[9px] text-ops-text-3 mt-1 font-semibold uppercase">
                        {node.system}
                      </span>
                      {node.metricDelta && (
                        <span className="mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-ops-amber font-bold">
                          {node.metricDelta}
                        </span>
                      )}
                    </div>

                    {i < cascadeResult.cascadeChain.length - 1 && (
                      <div className="flex flex-col items-center">
                        <ArrowRight className="w-4 h-4 text-ops-teal/60 shrink-0 rotate-90 sm:rotate-0 my-1 sm:my-0" />
                        <span className="text-[8px] text-ops-text-3 font-mono hidden sm:inline">leads to</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-ops-text-3 text-right">
            * Attribution percentages are simulated model estimates based on multi-subsystem sensitivity weighting.
          </div>
        </div>
      )}
    </div>
  );
};
