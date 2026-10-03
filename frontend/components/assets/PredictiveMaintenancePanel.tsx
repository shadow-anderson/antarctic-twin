"use client";

import React, { useState } from "react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { MaintenanceRecord, MaintenancePriority } from "@/lib/intelligence/maintenanceEngine";
import {
  Wrench,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ChevronRight,
  Info,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const PredictiveMaintenancePanel: React.FC = () => {
  const { maintenanceRecords, setActiveTab, cascadeResult, isSimulationActive } =
    useOperationalIntelligence();
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(
    maintenanceRecords[0] ?? null
  );

  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
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
      case "MEDIUM":
        return {
          bg: "bg-ops-amber/15 border-ops-amber/30 text-ops-amber",
          dot: "bg-ops-amber",
        };
      case "LOW":
        return {
          bg: "bg-ops-green/15 border-ops-green/30 text-ops-green",
          dot: "bg-ops-green",
        };
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 85) return "text-ops-green";
    if (health >= 70) return "text-ops-amber";
    return "text-ops-red";
  };

  return (
    <div className="rounded-[26px] border border-white/10 bg-ops-panel shadow-[0_6px_20px_rgba(0,0,0,0.22)] overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-7 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-teal/15 text-ops-teal border border-ops-teal/25">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
                Predictive Maintenance &amp; Health Projections
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white/5 border border-white/10 text-ops-text-3">
                PROTOTYPE PREDICTION
              </span>
            </div>
            <p className="text-[11px] text-ops-text-2 mt-0.5">
              Deterministic RUL &amp; failure probability tracking across station critical infrastructure
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("twin")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ops-card border border-white/10 text-xs font-semibold text-ops-text hover:bg-white/10 transition-colors"
        >
          <span>View in 3D Twin</span>
          <ExternalLink className="w-3.5 h-3.5 text-ops-teal" />
        </button>
      </div>

      {/* Main Content: Table + Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* Table column */}
        <div className="lg:col-span-7 xl:col-span-8 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-ops-card/40 text-[10px] font-bold uppercase tracking-wider text-ops-text-3">
                <th className="py-3 px-4 sm:px-6">Asset</th>
                <th className="py-3 px-3">Health</th>
                <th className="py-3 px-3">Failure Risk</th>
                <th className="py-3 px-3">RUL</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {maintenanceRecords.map((rec) => {
                const badge = getPriorityBadge(rec.priority);
                const isSelected = selectedRecord?.assetId === rec.assetId;

                return (
                  <tr
                    key={rec.assetId}
                    onClick={() => setSelectedRecord(rec)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-ops-teal/10 hover:bg-ops-teal/15"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-ops-text">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ops-card border border-white/10 text-ops-teal font-bold">
                          {rec.shortId}
                        </span>
                        <span className="truncate max-w-[140px] sm:max-w-none">{rec.assetName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`font-mono font-bold ${getHealthColor(rec.healthPct)}`}>
                        {rec.healthPct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`font-mono font-semibold ${
                        rec.failureProbPct > 20 ? "text-ops-red" : rec.failureProbPct > 10 ? "text-ops-amber" : "text-ops-text-2"
                      }`}>
                        {rec.failureProbPct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-ops-text-2">
                      {rec.rulHours >= 9000 ? "Nominal" : `${rec.rulHours}h`}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {rec.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-ops-teal font-semibold">
                      <span className="hover:underline flex items-center justify-end gap-1">
                        Inspect
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Asset Deep-Dive Explanation Panel */}
        <div className="lg:col-span-5 xl:col-span-4 p-5 sm:p-6 bg-ops-card/20 flex flex-col justify-between space-y-4">
          {selectedRecord ? (
            <div className="space-y-4">
              {/* Asset header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ops-teal font-mono">
                    {selectedRecord.shortId} · {selectedRecord.category.toUpperCase()}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      getPriorityBadge(selectedRecord.priority).bg
                    }`}
                  >
                    {selectedRecord.priority} PRIORITY
                  </span>
                </div>
                <h3 className="text-base font-bold text-ops-text mt-1">
                  {selectedRecord.assetName}
                </h3>
              </div>

              {/* Metrics pill row */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-ops-card border border-white/10 text-center">
                <div>
                  <div className="text-[9px] uppercase font-bold text-ops-text-3">Health</div>
                  <div className={`text-base font-black mt-0.5 ${getHealthColor(selectedRecord.healthPct)}`}>
                    {selectedRecord.healthPct}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-ops-text-3">Failure Risk</div>
                  <div className="text-base font-black text-ops-amber mt-0.5">
                    {selectedRecord.failureProbPct}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-ops-text-3">Est. RUL</div>
                  <div className="text-base font-black text-ops-text mt-0.5">
                    {selectedRecord.rulHours >= 9000 ? "8,760h+" : `${selectedRecord.rulHours}h`}
                  </div>
                </div>
              </div>

              {/* "WHY MAINTENANCE?" Section */}
              <div className="p-4 rounded-xl bg-ops-card border border-white/10 space-y-2">
                <div className="text-xs font-bold text-ops-text flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-ops-amber" />
                  Why Maintenance is Recommended
                </div>
                <ul className="space-y-1.5 text-xs text-ops-text-2">
                  {selectedRecord.reason.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-ops-teal font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendation Callout */}
              <div className="p-4 rounded-xl bg-ops-teal/10 border border-ops-teal/30 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ops-teal">
                  Action Recommendation
                </div>
                <p className="text-xs font-semibold text-ops-text">
                  {selectedRecord.nextRecommended}
                </p>
                <p className="text-[10px] text-ops-text-3 pt-1">
                  * Simulated prototype recommendation. Coordinates directly with 3D Twin telemetry nodes.
                </p>
              </div>

              {/* Telemetry trends */}
              {selectedRecord.trendIndicators.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3">
                    Observed Telemetry Indicators
                  </div>
                  <div className="space-y-1">
                    {selectedRecord.trendIndicators.map((ind, i) => (
                      <div
                        key={i}
                        className="text-[11px] p-2 rounded-lg bg-ops-card/50 border border-white/5 text-ops-text-2 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-ops-amber" />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-ops-text-3 text-xs">
              Select an asset from the table to view predictive maintenance analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
