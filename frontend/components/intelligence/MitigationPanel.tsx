"use client";

import React from "react";
import { CascadeResult } from "@/lib/intelligence/types";
import { SourceBadge } from "../shared/SourceBadge";
import {
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  Info,
} from "lucide-react";

interface MitigationPanelProps {
  cascade: CascadeResult;
  onToggleAction: (actionId: string) => void;
  appliedActionIds: string[];
}

export const MitigationPanel: React.FC<MitigationPanelProps> = ({
  cascade,
  onToggleAction,
  appliedActionIds,
}) => {
  const hasAppliedAny = appliedActionIds.length > 0;

  return (
    <div className="space-y-6">
      {/* ========================================================
          RECOMMENDED MITIGATION SECTION HEADER
      ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-ops-panel p-6 sm:p-7 shadow-[0_7px_25px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-2xl bg-ops-green/15 text-ops-green border border-ops-green/30 shadow-inner">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ops-green">
                  Deterministic Recommendation Engine
                </span>
                <SourceBadge source="derived" size="xs" origin="Simulated mitigation models" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-ops-text">
                Recommended Mitigation Strategy
              </h3>

              <p className="text-xs text-ops-text-2 mt-1 max-w-2xl leading-5">
                Simulated response actions generated from current conditions and cascading failure pathways.
                Toggle actions below to evaluate their projected outcomes on the digital twin.
              </p>
            </div>
          </div>

          {/* Risk summary badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 p-3 rounded-2xl bg-ops-card border border-white/10 self-start lg:self-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3">
              Identified Primary Risk:
            </div>
            <div className="text-xs font-bold text-ops-red">
              Battery depletion &amp; microgrid overload
            </div>
          </div>
        </div>

        {/* ========================================================
            ACTION CARDS WITH INTERACTIVE CHECKBOXES
        ======================================================== */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
              Simulated Mitigation Procedures (Select to simulate effect)
            </span>
            <span className="text-[10px] text-ops-text-2 font-medium">
              {appliedActionIds.length} of {cascade.recommendedMitigations.length} simulated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {cascade.recommendedMitigations.map((action) => {
              const isApplied = appliedActionIds.includes(action.id);

              return (
                <div
                  key={action.id}
                  onClick={() => onToggleAction(action.id)}
                  className={`group relative overflow-hidden flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                    isApplied
                      ? "bg-ops-card/95 border-ops-green/50 shadow-[0_4px_18px_rgba(79,181,138,0.18)] ring-1 ring-ops-green/30"
                      : "bg-ops-card/70 border-white/10 hover:border-white/20 hover:bg-ops-card/90"
                  }`}
                >
                  {/* Top indicator bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
                      isApplied ? "bg-ops-green" : "bg-transparent group-hover:bg-white/10"
                    }`}
                  />

                  {/* Header: Action label + checkbox */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-ops-panel border border-white/10 flex items-center justify-center text-[10px] font-bold text-ops-text">
                          0{action.order}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
                          Recommended Action
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold transition-colors ${
                            isApplied ? "text-ops-green" : "text-ops-text-3"
                          }`}
                        >
                          {isApplied ? "Simulated" : "Apply"}
                        </span>
                        {isApplied ? (
                          <CheckSquare className="w-4 h-4 text-ops-green" />
                        ) : (
                          <Square className="w-4 h-4 text-ops-text-3 group-hover:text-ops-text-2" />
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-ops-text mt-2 leading-snug">
                      {action.title}
                    </h4>

                    <p className="text-[11px] text-ops-text-2 mt-1.5 leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  {/* Footer: Impact & Risk Reduction */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between text-ops-text-3">
                      <span>Simulated effect:</span>
                      <span className="font-bold text-ops-teal tabular-nums">
                        {action.impactLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-ops-text-3">
                      <span>Projected outcome:</span>
                      <span className="font-semibold text-ops-green">
                        {action.riskReduction}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            BEFORE / AFTER COMPARISON TABLE
            (Matches Feature 2 & 9 specifications)
        ======================================================== */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ops-teal" />
              <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
                Simulated Impact Comparison (Before vs After Action)
              </h4>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-ops-text-3 font-medium">
              <Info className="w-3.5 h-3.5 text-ops-teal" />
              <span>
                {hasAppliedAny
                  ? "Displaying projected outcome with selected mitigations active"
                  : "Select an action above to view simulated outcome"}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ops-bg/70 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-ops-card/50 text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4">Baseline (Nominal)</th>
                  <th className="py-3 px-4 text-ops-red">Scenario (Before Action)</th>
                  <th className="py-3 px-4 text-ops-green">
                    Projected Outcome (After Action)
                  </th>
                  <th className="py-3 px-4 text-right">Net Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cascade.comparisons.map((c) => (
                  <tr
                    key={c.label}
                    className="hover:bg-white/[0.02] transition-colors font-medium"
                  >
                    <td className="py-3 px-4 font-bold text-ops-text">
                      {c.label}
                    </td>

                    <td className="py-3 px-4 text-ops-text-2 tabular-nums">
                      {c.formattedBaseline}
                    </td>

                    <td className="py-3 px-4 text-ops-red font-semibold tabular-nums">
                      {c.formattedScenario}
                    </td>

                    <td className="py-3 px-4 text-ops-green font-bold tabular-nums">
                      {hasAppliedAny ? c.formattedAfterAction : "— (Toggle action)"}
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums">
                      {hasAppliedAny ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ops-green">
                          <CheckCircle2 className="w-3 h-3" />
                          {c.label === "Battery Endurance"
                            ? "+2.9h"
                            : c.label === "Battery SOC"
                            ? "+16%"
                            : c.label === "Fuel Consumption"
                            ? "-1.3%/day"
                            : c.label === "Generator Load"
                            ? "-14%"
                            : "Risk Reduced"}
                        </span>
                      ) : (
                        <span className="text-ops-text-3 text-[10px]">Awaiting selection</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary verdict banner */}
          <div className="mt-4 p-4 rounded-xl bg-ops-card/80 border border-ops-green/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ops-green shrink-0" />
              <span className="text-ops-text-2">
                Simulated Result:{" "}
                <strong className="text-white">
                  Battery endurance improves from 8.2h → 11.1h (+2.9h safety buffer).
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-ops-text-3">
                Mission Risk:
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-ops-red/20 text-ops-red border border-ops-red/30">
                HIGH
              </span>
              <ArrowRight className="w-3 h-3 text-ops-text-3" />
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-ops-amber/20 text-ops-amber border border-ops-amber/30">
                MEDIUM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
