"use client";

import React, { useState } from "react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { ReadinessStatus } from "@/lib/intelligence/readinessEngine";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
} from "lucide-react";

export const MissionReadinessCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { missionReadiness, isSimulationActive, cascadeResult } = useOperationalIntelligence();
  const [showFormula, setShowFormula] = useState(false);

  const { overallScore, baselineScore, status, categories, delta } = missionReadiness;

  const getStatusBadge = (st: ReadinessStatus) => {
    switch (st) {
      case "MISSION READY":
        return {
          bg: "bg-ops-green/15 border-ops-green/30 text-ops-green",
          dot: "bg-ops-green",
          icon: ShieldCheck,
        };
      case "READY WITH CAUTION":
        return {
          bg: "bg-ops-amber/15 border-ops-amber/30 text-ops-amber",
          dot: "bg-ops-amber",
          icon: AlertTriangle,
        };
      case "LIMITED READINESS":
        return {
          bg: "bg-orange-500/15 border-orange-500/30 text-orange-400",
          dot: "bg-orange-400",
          icon: AlertTriangle,
        };
      case "CRITICAL":
        return {
          bg: "bg-ops-red/15 border-ops-red/30 text-ops-red",
          dot: "bg-ops-red",
          icon: ShieldAlert,
        };
    }
  };

  const badge = getStatusBadge(status);
  const StatusIcon = badge.icon;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-ops-green";
    if (score >= 75) return "text-ops-amber";
    if (score >= 50) return "text-orange-400";
    return "text-ops-red";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 90) return "bg-ops-green";
    if (score >= 75) return "bg-ops-amber";
    if (score >= 50) return "bg-orange-400";
    return "bg-ops-red";
  };

  return (
    <div className="rounded-[24px] border border-white/10 bg-ops-panel p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.22)] relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20 ${
          status === "MISSION READY"
            ? "bg-ops-green"
            : status === "READY WITH CAUTION"
            ? "bg-ops-amber"
            : "bg-ops-red"
        }`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ops-card border border-white/10 flex items-center justify-center text-ops-teal shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ops-text-3">
                Operational Index
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white/5 border border-white/10 text-ops-text-3">
                SIMULATED MODEL
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-ops-text tracking-tight">
              Mission Readiness Score
            </h2>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${badge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="p-1.5 rounded-lg bg-ops-card border border-white/10 text-ops-text-3 hover:text-ops-text transition-colors"
            title="Toggle calculation methodology"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Score & Before/After Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-5 items-center relative z-10">
        {/* Left: Big Score */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl sm:text-6xl font-black tracking-tight ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
            {isSimulationActive && delta !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                  delta > 0
                    ? "bg-ops-green/15 text-ops-green border border-ops-green/30"
                    : "bg-ops-red/15 text-ops-red border border-ops-red/30"
                }`}
              >
                {delta > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>
                  {delta > 0 ? `+${delta}` : delta} pts
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-ops-text-2 mt-2 leading-relaxed">
            {isSimulationActive ? (
              <>
                Reflects active disruption scenario (<span className="text-ops-text font-semibold">{cascadeResult.scenarioTitle}</span>).
                {delta < 0 ? " Operational capabilities degraded." : " Resilient under active mitigation."}
              </>
            ) : (
              "Station operating at nominal baseline. All mission critical systems within normal envelope."
            )}
          </p>

          {/* Before/After breakdown chips if simulated */}
          {isSimulationActive && (
            <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-ops-card/60 border border-white/10 text-center">
              <div>
                <div className="text-[9px] uppercase font-bold text-ops-text-3">Baseline</div>
                <div className="text-sm font-bold text-ops-text mt-0.5">{baselineScore}%</div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-ops-text-3">Simulated</div>
                <div className="text-sm font-bold text-ops-red mt-0.5">{overallScore}%</div>
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-ops-text-3">Impact</div>
                <div className="text-sm font-bold text-ops-amber mt-0.5">{delta} pts</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Category Breakdown Bars */}
        <div className="md:col-span-7 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3 flex justify-between items-center mb-1">
            <span>Readiness Category Breakdown</span>
            <span>Weight</span>
          </div>

          {categories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-ops-text flex items-center gap-1.5">
                  {cat.label}
                  {isSimulationActive && cat.score !== cat.baselineScore && (
                    <span className="text-[10px] text-ops-text-3">
                      ({cat.baselineScore}% → <span className={cat.score < cat.baselineScore ? "text-ops-red font-bold" : "text-ops-green font-bold"}>{cat.score}%</span>)
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${getScoreColor(cat.score)}`}>
                    {cat.score}%
                  </span>
                  <span className="text-[10px] text-ops-text-3 font-mono">
                    ({Math.round(cat.weight * 100)}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-ops-card border border-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(cat.score)}`}
                  style={{ width: `${Math.max(4, cat.score)}%` }}
                />
              </div>
              <p className="text-[10px] text-ops-text-3 truncate">{cat.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Dropdown */}
      {showFormula && (
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-ops-text-2 bg-ops-card/40 p-4 rounded-xl border border-white/5 space-y-2">
          <div className="font-bold text-ops-text text-xs flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-ops-teal" />
            Deterministic Weighted Calculation
          </div>
          <p className="font-mono text-[11px] text-ops-teal/90">
            Readiness = Energy (28%) + Infrastructure (22%) + Resources (20%) + Logistics (15%) + Communication (10%) + Environment (5%)
          </p>
          <p className="text-[10px] text-ops-text-3">
            Deterministic formula derived from active battery SOC, generator load, fuel depletion curve, communication latency, and ambient temperatures. Recomputes deterministically when What-If scenarios or mitigations are triggered.
          </p>
        </div>
      )}
    </div>
  );
};
