"use client";

import React, { useState } from "react";
import { OperationalAlert } from "@/lib/intelligence/types";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { SourceBadge } from "../shared/SourceBadge";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  X,
  ExternalLink,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertDrawer: React.FC<AlertDrawerProps> = ({ isOpen, onClose }) => {
  const { alerts, alertCounts, jumpToAlertSystem, dismissAlert } = useOperationalIntelligence();
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(alerts[0]?.id ?? null);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === "ALL") return true;
    return a.severity === filterSeverity;
  });

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) ?? filteredAlerts[0] ?? null;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-ops-red/20 text-ops-red border-ops-red/40";
      case "HIGH":
        return "bg-ops-amber/20 text-ops-amber border-ops-amber/40";
      case "WARNING":
        return "bg-ops-ice/20 text-ops-ice border-ops-ice/40";
      case "INFO":
      default:
        return "bg-ops-card text-ops-text-2 border-white/10";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fade-slide-up">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-ops-card/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-ops-red/15 text-ops-red border border-ops-red/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-ops-text">
                  Actionable Operational Alerts
                </h3>
                <SourceBadge source="derived" size="xs" origin="Telemetry + Models" />
              </div>
              <p className="text-[11px] text-ops-text-3">
                Early-warning risk notifications linked to digital twin subsystems
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-ops-text-2 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Count Pills Strip (Feature 3 specification) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-ops-bg/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterSeverity("ALL")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filterSeverity === "ALL"
                  ? "bg-ops-teal text-[#0D2130]"
                  : "bg-ops-card text-ops-text-2 border border-white/10"
              }`}
            >
              All ({alertCounts.total})
            </button>

            <button
              type="button"
              onClick={() => setFilterSeverity("CRITICAL")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                filterSeverity === "CRITICAL"
                  ? "bg-ops-red text-white border-ops-red"
                  : "bg-ops-red/15 text-ops-red border-ops-red/30 hover:bg-ops-red/25"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ops-red" />
              CRITICAL {alertCounts.critical}
            </button>

            <button
              type="button"
              onClick={() => setFilterSeverity("HIGH")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                filterSeverity === "HIGH"
                  ? "bg-ops-amber text-[#0D2130] border-ops-amber"
                  : "bg-ops-amber/15 text-ops-amber border-ops-amber/30 hover:bg-ops-amber/25"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ops-amber" />
              HIGH {alertCounts.high}
            </button>

            <button
              type="button"
              onClick={() => setFilterSeverity("WARNING")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                filterSeverity === "WARNING"
                  ? "bg-ops-ice text-[#0D2130] border-ops-ice"
                  : "bg-ops-ice/15 text-ops-ice border-ops-ice/30 hover:bg-ops-ice/25"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ops-ice" />
              WARNING {alertCounts.warning}
            </button>
          </div>

          <div className="text-[10px] text-ops-text-3 font-medium hidden sm:block">
            Click alert to inspect &amp; link to subsystem
          </div>
        </div>

        {/* Body Split: List on Left, Detail on Right */}
        <div className="flex-1 min-h-[380px] grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-y-auto">
          {/* Left list: 5 cols */}
          <div className="md:col-span-5 p-4 space-y-2 overflow-y-auto max-h-[500px]">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-ops-text-3 text-xs">
                No alerts for selected severity.
              </div>
            ) : (
              filteredAlerts.map((a) => {
                const isSelected = selectedAlert?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAlertId(a.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-ops-card border-ops-teal/40 shadow-sm ring-1 ring-ops-teal/20"
                        : "bg-ops-card/50 border-white/5 hover:bg-ops-card hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${getSeverityBadge(
                          a.severity
                        )}`}
                      >
                        {a.severity}
                      </span>
                      <span className="text-[10px] text-ops-text-3 tabular-nums">
                        {a.timeToImpact}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-ops-text line-clamp-1">
                      {a.title}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-ops-text-3">
                      <span>{a.affectedSystem}</span>
                      <span>•</span>
                      <span>{a.timestamp}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right detail: 7 cols */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between overflow-y-auto max-h-[500px]">
            {selectedAlert ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${getSeverityBadge(
                        selectedAlert.severity
                      )}`}
                    >
                      {selectedAlert.severity}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-ops-text-3 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-ops-amber" />
                      <span>Time to Impact:</span>
                      <strong className="text-white tabular-nums">
                        {selectedAlert.timeToImpact}
                      </strong>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {selectedAlert.title}
                  </h3>
                </div>

                {/* Structured info box */}
                <div className="space-y-3 p-4 rounded-2xl bg-ops-card/70 border border-white/5 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3 mb-0.5">
                      Cause:
                    </div>
                    <p className="text-ops-text leading-relaxed">
                      {selectedAlert.cause}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3 mb-0.5">
                      Affected Subsystem:
                    </div>
                    <span className="font-semibold text-ops-teal">
                      {selectedAlert.affectedSystem}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ops-green mb-0.5">
                      Recommended Action:
                    </div>
                    <p className="text-ops-text leading-relaxed font-medium">
                      {selectedAlert.recommendedAction}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ops-teal mb-0.5">
                      Projected Improvement:
                    </div>
                    <p className="text-ops-teal font-semibold">
                      {selectedAlert.projectedImprovement}
                    </p>
                  </div>
                </div>

                {/* Action Link button */}
                <div className="pt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => jumpToAlertSystem(selectedAlert)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ops-teal hover:bg-ops-teal/90 text-[#0D2130] text-xs font-extrabold uppercase tracking-wider transition-all duration-150 shadow-md cursor-pointer"
                  >
                    <span>Inspect {selectedAlert.affectedSystem} in Twin</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => dismissAlert(selectedAlert.id)}
                    className="px-4 py-3 rounded-xl bg-ops-card border border-white/10 hover:bg-white/10 text-xs font-semibold text-ops-text-2 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-ops-text-3 text-xs">
                Select an alert from the left to view action details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
