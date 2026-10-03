"use client";

import React from "react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { useStation } from "@/context/StationContext";
import {
  Share2,
  ArrowRight,
  ArrowDown,
  Building2,
  Fuel,
  Battery,
  Radio,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info,
} from "lucide-react";

export const InterStationCoordinationPanel: React.FC = () => {
  const { interStationCoordination, isSimulationActive } = useOperationalIntelligence();
  const { selectedStation, setSelectedStation } = useStation();

  const { maitri, bharati, supportOpportunities, coordinationNarrative } =
    interStationCoordination;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-ops-red/15 border-ops-red/30 text-ops-red";
      case "HIGH":
        return "bg-orange-500/15 border-orange-500/30 text-orange-400";
      case "MEDIUM":
        return "bg-ops-amber/15 border-ops-amber/30 text-ops-amber";
      case "LOW":
        return "bg-ops-green/15 border-ops-green/30 text-ops-green";
      default:
        return "bg-white/10 text-white";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-ops-green";
    if (score >= 65) return "text-ops-amber";
    return "text-ops-red";
  };

  return (
    <div className="rounded-[26px] border border-white/10 bg-ops-panel shadow-[0_6px_20px_rgba(0,0,0,0.22)] overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-7 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-teal/15 text-ops-teal border border-ops-teal/25">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
                Inter-Station Coordination (Maitri ↔ Bharati)
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white/5 border border-white/10 text-ops-text-3">
                DECISION SUPPORT ONLY
              </span>
            </div>
            <p className="text-[11px] text-ops-text-2 mt-0.5">
              Simulated cross-station resource sharing &amp; mutual contingency coordination
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 12.1 Compact Station Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MAITRI CARD */}
          <div className={`p-5 rounded-2xl border transition-all ${
            selectedStation === "maitri"
              ? "bg-ops-card border-ops-teal/40 ring-1 ring-ops-teal/20"
              : "bg-ops-card/50 border-white/10 hover:border-white/20"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-ops-teal" />
                <span className="text-sm font-bold text-ops-text">MAITRI STATION</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getRiskBadge(maitri.risk)}`}>
                  {maitri.risk} RISK
                </span>
                {selectedStation !== "maitri" && (
                  <button
                    type="button"
                    onClick={() => setSelectedStation("maitri")}
                    className="text-[10px] text-ops-teal hover:underline font-semibold"
                  >
                    Switch to Maitri
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-ops-panel border border-white/5">
                <span className="text-[9px] uppercase font-bold text-ops-text-3 block mb-0.5">Readiness</span>
                <span className={`text-lg font-black ${getScoreColor(maitri.missionReadinessPct)}`}>
                  {maitri.missionReadinessPct}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-ops-panel border border-white/5">
                <span className="text-[9px] uppercase font-bold text-ops-text-3 block mb-0.5">Fuel Reserve</span>
                <span className="text-lg font-black text-ops-text">
                  {maitri.fuelDays}d
                </span>
                <span className="text-[9px] text-ops-text-3 block">({maitri.fuelPct}%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-ops-panel border border-white/5">
                <span className="text-[9px] uppercase font-bold text-ops-text-3 block mb-0.5">Battery SOC</span>
                <span className="text-lg font-black text-ops-text">
                  {maitri.batteryPct}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-ops-panel border border-white/5">
                <span className="text-[9px] uppercase font-bold text-ops-text-3 block mb-0.5">Comm Health</span>
                <span className={`text-lg font-black ${getScoreColor(maitri.commScore)}`}>
                  {maitri.commScore}%
                </span>
              </div>
            </div>
          </div>

          {/* BHARATI CARD */}
          <div className={`p-5 rounded-2xl border transition-all ${
            selectedStation === "bharati"
              ? "bg-ops-card border-ops-teal/40 ring-1 ring-ops-teal/20"
              : "bg-ops-card/50 border-white/10 hover:border-white/20"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-ops-teal" />
                <span className="text-sm font-bold text-ops-text">BHARATI STATION</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getRiskBadge(bharati.risk)}`}>
                  {bharati.risk} RISK
                </span>
                {selectedStation !== "bharati" && (
                  <button
                    type="button"
                    onClick={() => setSelectedStation("bharati")}
                    className="text-[10px] text-ops-teal hover:underline font-semibold"
                  >
                    Switch to Bharati
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-ops-panel border border-white/5">
                <span className="text-[9px] uppercase font-bold text-ops-text-3 block mb-0.5">Readiness</span>
                <span className={`text-lg font-black ${getScoreColor(bharati.missionReadinessPct)}`}>
                  {bharati.missionReadinessPct}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-ops-panel border border-white/5">
                <span className="text-[9px] uppercase font-bold text-ops-text-3 block mb-0.5">Fuel Reserve</span>
                <span className="text-lg font-black text-ops-text">
                  {bharati.fuelDays}d
                </span>
                <span className="text-[9px] text-ops-text-3 block">({bharati.fuelPct}%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-ops-panel border border-white/5">
                <span className="text-[9px] uppercase font-bold text-ops-text-3 block mb-0.5">Battery SOC</span>
                <span className="text-lg font-black text-ops-text">
                  {bharati.batteryPct}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-ops-panel border border-white/5">
                <span className="text-[9px] uppercase font-bold text-ops-text-3 block mb-0.5">Comm Health</span>
                <span className={`text-lg font-black ${getScoreColor(bharati.commScore)}`}>
                  {bharati.commScore}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 12.2 & 12.3 Support Opportunities / Coordination Diagram */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3 mb-3">
            Potential Support Opportunities (Simulated Assessment)
          </div>

          {supportOpportunities.length > 0 ? (
            <div className="space-y-3">
              {supportOpportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-ops-card border border-ops-teal/20 space-y-3"
                >
                  {/* Visual Flow diagram: Bharati │ Potential Support ↓ Maitri */}
                  <div className="flex items-center gap-3 text-xs font-bold text-ops-text bg-ops-panel/60 p-3 rounded-lg border border-white/5">
                    <span className="text-ops-teal uppercase">
                      {opp.fromStation === "maitri" ? "Maitri" : "Bharati"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-ops-teal shrink-0" />
                    <span className="px-2 py-0.5 rounded bg-ops-teal/20 text-ops-teal border border-ops-teal/30 text-[10px] uppercase font-bold">
                      Potential Support: {opp.resource}
                    </span>
                    <ArrowRight className="w-4 h-4 text-ops-teal shrink-0" />
                    <span className="text-ops-amber uppercase">
                      {opp.toStation === "maitri" ? "Maitri" : "Bharati"}
                    </span>
                  </div>

                  <p className="text-xs text-ops-text-2 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 border-t border-white/5 text-ops-text-3">
                    <span>
                      Window: <strong className="text-ops-text font-mono">{opp.estimatedWindowDays} days</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Status: <strong className="text-ops-teal">{opp.coordinationStatus}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-ops-amber">
                      * Non-automatic recommendation — requires NCPOR flight dispatch approval
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-ops-card/50 border border-white/5 text-center text-xs text-ops-text-2">
              <CheckCircle2 className="w-5 h-5 text-ops-green mx-auto mb-1.5" />
              Both Maitri and Bharati currently have balanced operational reserves. No inter-station resource transfer required.
            </div>
          )}
        </div>

        {/* Narrative */}
        <div className="p-4 rounded-xl bg-ops-card/40 border border-white/5 text-xs text-ops-text-2 leading-relaxed">
          <div className="font-bold text-ops-text text-xs mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-ops-teal" />
            Inter-Station Coordination Protocol
          </div>
          {coordinationNarrative}
        </div>
      </div>
    </div>
  );
};
