"use client";

import React from "react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { useStation } from "@/context/StationContext";
import {
  Share2,
  ArrowRight,
  ArrowLeft,
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

  const getFuelStatus = (days: number) => {
    if (days <= 14) return { label: "LOW", color: "text-ops-red" };
    if (days <= 21) return { label: "MODERATE", color: "text-ops-amber" };
    return { label: "HIGH", color: "text-ops-green" };
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
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
              Inter-Station Mutual Contingency &amp; Support Assessment
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-ops-teal">
              {supportOpportunities.length > 0 ? "Support Opportunity Detected" : "Nominal Autonomy"}
            </span>
          </div>

          {/* Compact Visual Bridge: MAITRI [Box] <--- SUPPORT ---> BHARATI [Box] */}
          {(() => {
            const maitriFuel = getFuelStatus(maitri.fuelDays);
            const bharatiFuel = getFuelStatus(bharati.fuelDays);
            const hasSupport = supportOpportunities.length > 0;
            const primaryOpp = hasSupport ? supportOpportunities[0] : null;
            const isFromBharati = primaryOpp?.fromStation === "bharati";

            return (
              <div className="p-5 rounded-2xl bg-ops-card border border-white/10 space-y-4">
                {/* Header Badge */}
                <div className="text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
                      hasSupport
                        ? "bg-ops-amber/20 border-ops-amber/40 text-ops-amber"
                        : "bg-ops-green/15 border-ops-green/30 text-ops-green"
                    }`}
                  >
                    {hasSupport ? "POTENTIAL SUPPORT OPPORTUNITY" : "INDEPENDENT OPERATIONS"}
                  </span>
                </div>

                {/* 3-Column Visual Layout: MAITRI <--- CONNECTOR ---> BHARATI */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                  {/* MAITRI CARD */}
                  <div
                    className={`md:col-span-4 p-4 rounded-xl border transition-all ${
                      hasSupport && primaryOpp?.toStation === "maitri"
                        ? "bg-ops-red/10 border-ops-red/40 ring-1 ring-ops-red/20"
                        : "bg-ops-panel/80 border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-ops-text flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-ops-teal" />
                        MAITRI
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${getRiskBadge(maitri.risk)}`}>
                        {maitri.risk} RISK
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-ops-text-3 text-[11px]">Fuel:</span>
                        <strong className={`font-mono ${maitriFuel.color}`}>
                          {maitriFuel.label} ({maitri.fuelDays}d)
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ops-text-3 text-[11px]">Risk:</span>
                        <strong className="font-mono text-ops-text">{maitri.risk}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ops-text-3 text-[11px]">Readiness:</span>
                        <strong className={`font-mono ${getScoreColor(maitri.missionReadinessPct)}`}>
                          {maitri.missionReadinessPct}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* CONNECTOR / SUPPORT DIRECTION */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center p-2 text-center space-y-1.5">
                    {hasSupport && primaryOpp ? (
                      <>
                        <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ops-teal/15 border border-ops-teal/30 text-ops-teal">
                          {isFromBharati ? (
                            <ArrowLeft className="w-4 h-4 text-ops-teal shrink-0 animate-pulse" />
                          ) : null}
                          <span className="text-[11px] font-bold tracking-tight uppercase">
                            SUPPORT: {primaryOpp.resource}
                          </span>
                          {!isFromBharati ? (
                            <ArrowRight className="w-4 h-4 text-ops-teal shrink-0 animate-pulse" />
                          ) : null}
                        </div>
                        <span className="text-[9px] text-ops-text-3 font-semibold uppercase tracking-wider">
                          {isFromBharati ? "BHARATI → MAITRI" : "MAITRI → BHARATI"}
                        </span>
                      </>
                    ) : (
                      <div className="py-2.5 px-3 rounded-xl bg-ops-panel border border-white/5 w-full text-center">
                        <span className="text-[10px] font-bold text-ops-green uppercase block">
                          ⇋ BALANCED RESERVES ⇋
                        </span>
                        <span className="text-[9px] text-ops-text-3 leading-tight block mt-0.5">
                          Nominal autonomy bounds
                        </span>
                      </div>
                    )}
                  </div>

                  {/* BHARATI CARD */}
                  <div
                    className={`md:col-span-4 p-4 rounded-xl border transition-all ${
                      hasSupport && primaryOpp?.toStation === "bharati"
                        ? "bg-ops-red/10 border-ops-red/40 ring-1 ring-ops-red/20"
                        : "bg-ops-panel/80 border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-ops-text flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-ops-teal" />
                        BHARATI
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${getRiskBadge(bharati.risk)}`}>
                        {bharati.risk} RISK
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-ops-text-3 text-[11px]">Fuel:</span>
                        <strong className={`font-mono ${bharatiFuel.color}`}>
                          {bharatiFuel.label} ({bharati.fuelDays}d)
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ops-text-3 text-[11px]">Risk:</span>
                        <strong className="font-mono text-ops-text">{bharati.risk}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ops-text-3 text-[11px]">Readiness:</span>
                        <strong className={`font-mono ${getScoreColor(bharati.missionReadinessPct)}`}>
                          {bharati.missionReadinessPct}%
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETAILS OR NOMINAL STATE BANNER */}
                {hasSupport && primaryOpp ? (
                  <div className="p-4 rounded-xl bg-ops-panel/90 border border-ops-teal/20 text-xs space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2.5 border-b border-white/5 text-[11px]">
                      <div>
                        <span className="text-ops-text-3 block text-[10px] font-bold">SOURCE:</span>
                        <strong className="text-ops-teal uppercase">{primaryOpp.fromStation} Station</strong>
                      </div>
                      <div>
                        <span className="text-ops-text-3 block text-[10px] font-bold">DESTINATION:</span>
                        <strong className="text-ops-amber uppercase">{primaryOpp.toStation} Station</strong>
                      </div>
                      <div>
                        <span className="text-ops-text-3 block text-[10px] font-bold">RESOURCE:</span>
                        <strong className="text-white">{primaryOpp.resource} ({primaryOpp.estimatedWindowDays}d window)</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-ops-text-2">
                      <strong className="text-ops-text">Reason:</strong> {primaryOpp.description}
                    </div>

                    <div className="text-[10px] text-ops-amber flex items-center gap-1.5 pt-1 border-t border-white/5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Decision support recommendation only · Does NOT automatically execute transfer · Requires NCPOR flight dispatch approval</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-ops-panel/50 border border-white/5 text-center text-xs text-ops-text-2">
                    <CheckCircle2 className="w-4 h-4 text-ops-green mx-auto mb-1 inline mr-1.5" />
                    <strong>INDEPENDENT OPERATIONS</strong> — Both stations operating within nominal autonomy bounds. No inter-station transfer indicated.
                  </div>
                )}
              </div>
            );
          })()}
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
