"use client";

import React from "react";
import { CascadeResult } from "@/lib/intelligence/types";
import { SourceBadge } from "../shared/SourceBadge";
import {
  ArrowDown,
  ArrowRight,
  Clock,
  AlertTriangle,
  Flame,
  Zap,
  Battery,
  Fuel,
  Truck,
  ShieldAlert,
  Thermometer,
  Layers,
  Activity,
} from "lucide-react";

interface CascadeVisualizerProps {
  cascade: CascadeResult;
}

export const CascadeVisualizer: React.FC<CascadeVisualizerProps> = ({ cascade }) => {
  const isCritical = cascade.missionRisk.simulated === "CRITICAL";
  const isHigh = cascade.missionRisk.simulated === "HIGH";

  const getSystemIcon = (system: string) => {
    switch (system.toLowerCase()) {
      case "environmental":
        return <Thermometer className="w-3.5 h-3.5 text-ops-teal" />;
      case "infrastructure":
        return <Flame className="w-3.5 h-3.5 text-ops-amber" />;
      case "energy":
      case "microgrid":
        return <Zap className="w-3.5 h-3.5 text-ops-amber" />;
      case "logistics":
        return <Truck className="w-3.5 h-3.5 text-ops-violet" />;
      case "life support":
        return <ShieldAlert className="w-3.5 h-3.5 text-ops-red" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-ops-text-2" />;
    }
  };

  const getNodeDirectionStyle = (dir: string) => {
    switch (dir) {
      case "critical":
        return "border-ops-red/40 bg-ops-red/10 text-ops-red";
      case "warning":
        return "border-ops-amber/40 bg-ops-amber/10 text-ops-amber";
      case "up":
        return "border-ops-amber/30 bg-ops-card text-ops-amber";
      case "down":
        return "border-ops-ice/30 bg-ops-card text-ops-ice";
      default:
        return "border-white/10 bg-ops-card text-ops-text-2";
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          CASCADE RESULTS METRIC SUMMARY STRIP
          (Matches Feature 1 "CASCADE RESULTS" specifications)
      ======================================================== */}
      <div className="rounded-2xl border border-white/10 bg-ops-card/80 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ops-amber animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
              Cascading Risk Model Evaluation
            </h4>
            <SourceBadge source="derived" size="xs" origin="Deterministic system cascade calculation" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ops-text-3 font-semibold uppercase tracking-wider">
              Time to Critical:
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-ops-red/20 text-ops-red border border-ops-red/40 tabular-nums">
              {cascade.timeToCritical.hoursOrDays}
            </span>
          </div>
        </div>

        {/* 6 Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Trigger & Temp */}
          <div className="p-3 rounded-xl bg-ops-bg/60 border border-white/5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-ops-text-3">
              Trigger
            </div>
            <div className="text-xs font-bold text-ops-text mt-0.5 truncate">
              {cascade.scenarioTitle}
            </div>
            <div className="text-[10px] text-ops-ice font-semibold mt-1">
              Temp: {cascade.temperatureC.simulated}°C ({cascade.temperatureC.delta})
            </div>
          </div>

          {/* Heating Demand */}
          <div className="p-3 rounded-xl bg-ops-bg/60 border border-white/5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-ops-text-3">
              Heating Demand
            </div>
            <div className="text-sm font-bold text-ops-amber mt-0.5">
              +{cascade.heatingDemandPct.deltaPct}%
            </div>
            <div className="text-[10px] text-ops-text-3 font-medium mt-1">
              {cascade.heatingDemandPct.simulatedKw} kW load
            </div>
          </div>

          {/* Energy Consumption */}
          <div className="p-3 rounded-xl bg-ops-bg/60 border border-white/5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-ops-text-3">
              Energy Consumption
            </div>
            <div className="text-sm font-bold text-ops-amber mt-0.5">
              +{cascade.energyConsumptionPct.deltaPct}%
            </div>
            <div className="text-[10px] text-ops-text-3 font-medium mt-1">
              {cascade.energyConsumptionPct.simulatedKw} kW total
            </div>
          </div>

          {/* Battery Endurance */}
          <div className="p-3 rounded-xl bg-ops-bg/60 border border-white/5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-ops-text-3">
              Battery Endurance
            </div>
            <div className="text-sm font-bold text-ops-red mt-0.5">
              {cascade.batteryEnduranceHours.simulated}h
            </div>
            <div className="text-[10px] text-ops-text-3 font-medium mt-1">
              SOC: {cascade.batterySocPct.simulated}%
            </div>
          </div>

          {/* Fuel Consumption */}
          <div className="p-3 rounded-xl bg-ops-bg/60 border border-white/5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-ops-text-3">
              Fuel Consumption
            </div>
            <div className="text-sm font-bold text-ops-amber mt-0.5">
              {cascade.fuelConsumptionPctDay.simulated}%/day
            </div>
            <div className="text-[10px] text-ops-text-3 font-medium mt-1">
              Gen Load: {cascade.generatorLoadPct.simulated}%
            </div>
          </div>

          {/* Overall Mission Risk */}
          <div className="p-3 rounded-xl bg-ops-bg/60 border border-white/5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-ops-text-3">
              Mission Risk
            </div>
            <div className={`text-sm font-bold mt-0.5 ${isCritical ? "text-ops-red" : isHigh ? "text-ops-red" : "text-ops-amber"}`}>
              {cascade.missionRisk.simulated}
            </div>
            <div className="text-[10px] text-ops-text-3 font-medium mt-1">
              Resupply: {cascade.resupplyRisk}
            </div>
          </div>
        </div>

        {/* Affected Systems List */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5 text-[11px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3">
            Affected Systems:
          </span>
          {cascade.affectedSystems.map((sys) => (
            <span
              key={sys}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-ops-card border border-white/10 text-ops-text text-[10px] font-medium"
            >
              {getSystemIcon(sys)}
              {sys}
            </span>
          ))}
        </div>
      </div>

      {/* ========================================================
          VISUAL CASCADE CHAIN (HORIZONTAL ON LG / VERTICAL ON MOBILE)
          (Clean, compact flowchart matching user specs)
      ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-ops-teal" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
              Propagating Cascade Chain
            </span>
          </div>
          <span className="text-[10px] text-ops-text-3">
            6 interconnected subsystem stages
          </span>
        </div>

        {/* Chain wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {cascade.cascadeChain.map((node, index) => {
            const isFirst = index === 0;
            const isLast = index === cascade.cascadeChain.length - 1;

            return (
              <div key={node.id} className="relative flex flex-col justify-between">
                <div
                  className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 h-full ${
                    isFirst
                      ? "bg-ops-card/90 border-ops-ice/40 shadow-sm"
                      : isLast
                      ? "bg-ops-card/90 border-ops-red/40 shadow-sm"
                      : "bg-ops-card/60 border-white/10"
                  }`}
                >
                  {/* Step header */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-ops-text-3">
                        <span className="w-4 h-4 rounded-full bg-ops-panel border border-white/10 flex items-center justify-center text-[8px] font-extrabold text-ops-teal">
                          {node.stepNumber}
                        </span>
                        {node.system}
                      </span>

                      {node.metricDelta && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide ${getNodeDirectionStyle(
                            node.direction
                          )}`}
                        >
                          {node.metricDelta}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-ops-text tracking-tight leading-snug">
                      {node.label}
                    </div>
                  </div>

                  <p className="text-[10px] leading-relaxed text-ops-text-2 mt-2 pt-2 border-t border-white/5">
                    {node.detail}
                  </p>
                </div>

                {/* Arrow between nodes on mobile / tablet */}
                {!isLast && (
                  <div className="lg:hidden flex justify-center py-1">
                    <ArrowDown className="w-3.5 h-3.5 text-ops-text-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
