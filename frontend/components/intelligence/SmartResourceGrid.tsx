"use client";

import React from "react";
import { SmartResource } from "@/lib/intelligence/types";
import { SourceBadge } from "../shared/SourceBadge";
import {
  Fuel,
  Battery,
  Droplets,
  Utensils,
  HeartPulse,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

interface SmartResourceGridProps {
  resources: SmartResource[];
  isSimulationActive?: boolean;
}

export const SmartResourceGrid: React.FC<SmartResourceGridProps> = ({
  resources,
  isSimulationActive = false,
}) => {
  const getResourceIcon = (id: string) => {
    switch (id) {
      case "fuel":
        return <Fuel className="w-5 h-5 text-ops-amber" />;
      case "battery":
        return <Battery className="w-5 h-5 text-ops-teal" />;
      case "water":
        return <Droplets className="w-5 h-5 text-ops-ice" />;
      case "food":
        return <Utensils className="w-5 h-5 text-ops-violet" />;
      case "medical":
        return <HeartPulse className="w-5 h-5 text-ops-red" />;
      default:
        return <TrendingDown className="w-5 h-5 text-ops-text-2" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "bg-ops-red/20 text-ops-red border-ops-red/40";
      case "WARNING":
        return "bg-ops-amber/20 text-ops-amber border-ops-amber/40";
      case "NOMINAL":
      default:
        return "bg-ops-green/20 text-ops-green border-ops-green/40";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ops-teal">
              Autonomous Depletion Forecast
            </span>
            <SourceBadge
              source={isSimulationActive ? "derived" : "simulated"}
              size="xs"
              origin="Dynamic consumption rate model"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ops-text">
            Smart Resource &amp; Inventory Tracker
          </h3>
          <p className="text-xs text-ops-text-2 mt-0.5">
            Real-time projected depletion curves for survival-critical polar station resources
          </p>
        </div>

        {isSimulationActive && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ops-amber/15 border border-ops-amber/30 text-ops-amber text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Dynamic Scenario Rates Active
          </div>
        )}
      </div>

      {/* 5-Column Grid (Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {resources.map((res) => {
          const isCrit = res.status === "CRITICAL";
          const isWarn = res.status === "WARNING";

          return (
            <div
              key={res.id}
              className={`flex flex-col justify-between p-5 rounded-[22px] border transition-all duration-200 bg-ops-card/80 backdrop-blur-sm ${
                isCrit
                  ? "border-ops-red/40 shadow-[0_4px_16px_rgba(212,112,111,0.15)] ring-1 ring-ops-red/20"
                  : isWarn
                  ? "border-ops-amber/40 shadow-[0_4px_16px_rgba(217,164,65,0.15)] ring-1 ring-ops-amber/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-bg border border-white/10 shadow-inner">
                    {getResourceIcon(res.id)}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                      res.status
                    )}`}
                  >
                    {res.status}
                  </span>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3">
                  {res.id}
                </div>

                <h4 className="text-sm font-bold text-ops-text mt-0.5 leading-snug">
                  {res.name}
                </h4>

                {/* Primary numbers */}
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                    {res.currentLevel}
                    <span className="text-sm font-medium text-ops-text-3 ml-0.5">
                      {res.unit}
                    </span>
                  </span>
                  <span className="text-xs text-ops-text-3 font-semibold">
                    ({res.remainingQuantity})
                  </span>
                </div>

                {/* Consumption rate */}
                <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-white/5 text-ops-text-3">
                  <span>Consumption Rate:</span>
                  <span className="font-bold text-ops-amber tabular-nums">
                    {res.consumptionRate} {res.consumptionUnit}
                  </span>
                </div>

                {/* Depletion days */}
                <div className="flex items-center justify-between text-[11px] mt-1 text-ops-text-3">
                  <span>Projected Depletion:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      isCrit ? "text-ops-red" : isWarn ? "text-ops-amber" : "text-ops-green"
                    }`}
                  >
                    {res.daysRemaining} days
                  </span>
                </div>
              </div>

              {/* Mini Sparkline / Forecast Chart */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-ops-text-3 mb-1.5 flex items-center justify-between">
                  <span>8-Day Horizon</span>
                  <span className="text-ops-teal font-semibold">
                    {res.timeToCritical !== "Nominal" ? `Crit: ${res.timeToCritical}` : "Stable"}
                  </span>
                </div>

                {/* Step bars */}
                <div className="flex items-end gap-1.5 h-10 w-full pt-1">
                  {res.history.map((pt, i) => {
                    const heightPct = Math.max(12, Math.min(100, pt.level));
                    const isLast = i === res.history.length - 1;
                    return (
                      <div
                        key={pt.day}
                        title={`Day ${pt.day}: ${pt.level}%`}
                        className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
                      >
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isLast && pt.level <= 15
                              ? "bg-ops-red"
                              : pt.level <= 30
                              ? "bg-ops-amber"
                              : "bg-ops-teal/70 group-hover:bg-ops-teal"
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[8px] text-ops-text-3 font-semibold mt-1">
                  <span>Day 0</span>
                  <span>Day 4</span>
                  <span>Day 8</span>
                </div>

                {/* Recommendation snippet */}
                <p className="text-[10px] text-ops-text-2 mt-2.5 leading-relaxed line-clamp-2">
                  {res.recommendedAction}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
