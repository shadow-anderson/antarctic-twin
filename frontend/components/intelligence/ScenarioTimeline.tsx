"use client";

import React, { useState } from "react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { ScenarioTimelineEvent, TimelineSeverity } from "@/lib/intelligence/timelineEngine";
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Zap,
  CheckCircle2,
  ChevronRight,
  Info,
  SlidersHorizontal,
} from "lucide-react";

export const ScenarioTimeline: React.FC = () => {
  const { scenarioTimeline, appliedActionIds, isSimulationActive, cascadeResult } =
    useOperationalIntelligence();
  const [viewMode, setViewMode] = useState<"compare" | "unmitigated" | "mitigated">("compare");
  const [selectedEvent, setSelectedEvent] = useState<ScenarioTimelineEvent | null>(null);

  const { withoutMitigation, withMitigation, scenarioTitle, durationWindow } =
    scenarioTimeline;

  const getSeverityBadge = (sev: TimelineSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return {
          bg: "bg-ops-red/15 border-ops-red/30 text-ops-red",
          dot: "bg-ops-red",
        };
      case "HIGH":
        return {
          bg: "bg-orange-500/15 border-orange-500/30 text-orange-400",
          dot: "bg-orange-400",
        };
      case "WARNING":
        return {
          bg: "bg-ops-amber/15 border-ops-amber/30 text-ops-amber",
          dot: "bg-ops-amber",
        };
      case "NORMAL":
        return {
          bg: "bg-ops-green/15 border-ops-green/30 text-ops-green",
          dot: "bg-ops-green",
        };
    }
  };

  const hasMitigations = appliedActionIds.length > 0;

  return (
    <div className="rounded-[26px] border border-white/10 bg-ops-panel shadow-[0_6px_20px_rgba(0,0,0,0.22)] overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-7 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-teal/15 text-ops-teal border border-ops-teal/25">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
                Scenario Timeline &amp; Temporal Progression
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white/5 border border-white/10 text-ops-text-3">
                {durationWindow} HORIZON
              </span>
            </div>
            <p className="text-[11px] text-ops-text-2 mt-0.5">
              Data-driven causal chain progression under active scenario:{" "}
              <span className="text-ops-text font-bold">{scenarioTitle}</span>
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-xl bg-ops-card border border-white/10 p-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("compare")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
              viewMode === "compare"
                ? "bg-ops-teal text-[#0D2130]"
                : "text-ops-text-3 hover:text-ops-text"
            }`}
          >
            Compare View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("unmitigated")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
              viewMode === "unmitigated"
                ? "bg-ops-red text-white"
                : "text-ops-text-3 hover:text-ops-text"
            }`}
          >
            Unmitigated
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mitigated")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
              viewMode === "mitigated"
                ? "bg-ops-green text-[#0D2130]"
                : "text-ops-text-3 hover:text-ops-text"
            }`}
          >
            With Mitigation
          </button>
        </div>
      </div>

      {/* Mitigation status banner if in compare mode */}
      {viewMode === "compare" && (
        <div className="px-6 py-2.5 bg-ops-card/50 border-b border-white/5 flex items-center justify-between text-xs">
          <span className="text-ops-text-2">
            Showing progression difference between unmitigated trajectory vs. applied load-shedding
          </span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
            hasMitigations ? "bg-ops-green/20 text-ops-green" : "bg-ops-amber/20 text-ops-amber"
          }`}>
            {hasMitigations ? `${appliedActionIds.length} Mitigations Applied` : "Zero Mitigations Active"}
          </span>
        </div>
      )}

      {/* Timeline Lists */}
      <div className="p-6">
        {viewMode === "compare" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Unmitigated */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-ops-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ops-red">
                  Without Mitigation (Base Trajectory)
                </h3>
              </div>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {withoutMitigation.map((ev, idx) => {
                  const badge = getSeverityBadge(ev.severity);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedEvent(ev)}
                      className="relative p-3.5 rounded-xl bg-ops-card/70 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <span className={`absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full border-2 border-ops-panel ${badge.dot}`} />
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-ops-teal">
                          {ev.time}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-ops-text-3 font-semibold">
                            {ev.system}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${badge.bg}`}>
                            {ev.severity}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-ops-text">{ev.event}</h4>
                      <p className="text-[11px] text-ops-text-3 mt-1 leading-relaxed">{ev.impact}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: With Mitigation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-ops-green" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ops-green">
                  With Mitigation (Controlled Trajectory)
                </h3>
              </div>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {withMitigation.map((ev, idx) => {
                  const badge = getSeverityBadge(ev.severity);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedEvent(ev)}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer group ${
                        ev.mitigated
                          ? "bg-ops-green/5 border-ops-green/25 hover:border-ops-green/40"
                          : "bg-ops-card/70 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className={`absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full border-2 border-ops-panel ${badge.dot}`} />
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-ops-teal">
                          {ev.time}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ev.mitigated && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-ops-green/20 text-ops-green border border-ops-green/30">
                              Mitigated
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-ops-text-3 font-semibold">
                            {ev.system}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${badge.bg}`}>
                            {ev.severity}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-ops-text">{ev.event}</h4>
                      <p className="text-[11px] text-ops-text-3 mt-1 leading-relaxed">{ev.impact}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Single list view */
          <div className="max-w-2xl mx-auto relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {(viewMode === "mitigated" ? withMitigation : withoutMitigation).map((ev, idx) => {
              const badge = getSeverityBadge(ev.severity);
              return (
                <div
                  key={idx}
                  className="relative p-4 rounded-xl bg-ops-card/70 border border-white/10 hover:border-white/20 transition-all"
                >
                  <span className={`absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full border-2 border-ops-panel ${badge.dot}`} />
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-ops-teal">{ev.time}</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${badge.bg}`}>
                      {ev.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-ops-text">{ev.event}</h4>
                  <p className="text-xs text-ops-text-2 mt-1 leading-relaxed">{ev.impact}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
