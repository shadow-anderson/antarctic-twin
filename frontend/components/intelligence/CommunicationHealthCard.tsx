"use client";

import React, { useState } from "react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { useStation } from "@/context/StationContext";
import { CommStatus } from "@/lib/intelligence/communicationEngine";
import {
  Radio,
  Wifi,
  WifiOff,
  SignalHigh,
  Clock,
  Activity,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export const CommunicationHealthCard: React.FC = () => {
  const { communicationHealth, isSimulationActive, cascadeResult } = useOperationalIntelligence();
  const { selectedStation } = useStation();
  const [showDetails, setShowDetails] = useState(false);

  const {
    status,
    overallScore,
    signalScore,
    latencyScore,
    freshnessScore,
    latencyMs,
    signalStrengthPct,
    lastSyncMinutes,
    dataFreshness,
    statusDetail,
  } = communicationHealth;

  const getStatusConfig = (st: CommStatus) => {
    switch (st) {
      case "CONNECTED":
        return {
          label: "CONNECTED",
          bg: "bg-ops-green/15 border-ops-green/30 text-ops-green",
          dot: "bg-ops-green",
          icon: CheckCircle2,
          pulse: "animate-pulse",
        };
      case "DEGRADED":
        return {
          label: "DEGRADED",
          bg: "bg-ops-amber/15 border-ops-amber/30 text-ops-amber",
          dot: "bg-ops-amber",
          icon: AlertTriangle,
          pulse: "animate-ping",
        };
      case "INTERRUPTED":
        return {
          label: "INTERRUPTED",
          bg: "bg-ops-red/15 border-ops-red/30 text-ops-red",
          dot: "bg-ops-red",
          icon: WifiOff,
          pulse: "animate-ping",
        };
    }
  };

  const statusCfg = getStatusConfig(status);
  const StatusIcon = statusCfg.icon;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-ops-green";
    if (score >= 60) return "text-ops-amber";
    return "text-ops-red";
  };

  return (
    <div className="rounded-[24px] border border-white/10 bg-ops-panel p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.22)] relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ops-card border border-white/10 flex items-center justify-center text-ops-teal shadow-inner">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ops-text-3">
                Telemetry Link
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white/5 border border-white/10 text-ops-text-3">
                SIMULATED LINK
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-ops-text tracking-tight">
              Communication Health &amp; Telemetry Freshness
            </h2>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${statusCfg.bg}`}
          >
            <span className="relative flex w-2 h-2">
              <span className={`absolute inline-flex w-full h-full rounded-full ${statusCfg.dot} opacity-75 ${statusCfg.pulse}`} />
              <span className={`relative inline-flex w-2 h-2 rounded-full ${statusCfg.dot}`} />
            </span>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusCfg.label}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 rounded-lg bg-ops-card border border-white/10 text-ops-text-3 hover:text-ops-text transition-colors"
            title="Toggle impact details"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Score + Telemetry metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5 min-w-0 overflow-hidden">
        {/* Overall Score */}
        <div className="p-4 rounded-2xl bg-ops-card/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ops-text-3">
            <span className="text-[10px] uppercase font-bold tracking-wider">Health Index</span>
            <Activity className="w-4 h-4 text-ops-teal" />
          </div>
          <div className="my-2">
            <div className={`text-3xl font-black ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <div className="text-[11px] text-ops-text-2 mt-0.5">Composite telemetry fidelity</div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-ops-bg overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallScore >= 80 ? "bg-ops-green" : overallScore >= 60 ? "bg-ops-amber" : "bg-ops-red"
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* Signal Strength */}
        <div className="p-4 rounded-2xl bg-ops-card/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ops-text-3">
            <span className="text-[10px] uppercase font-bold tracking-wider">VSAT Signal</span>
            <SignalHigh className="w-4 h-4 text-ops-teal" />
          </div>
          <div className="my-2">
            <div className={`text-3xl font-black ${getScoreColor(signalScore)}`}>
              {signalStrengthPct}%
            </div>
            <div className="text-[11px] text-ops-text-2 mt-0.5">Score: {signalScore}%</div>
          </div>
          <span className="text-[10px] text-ops-text-3">Ku-Band carrier link</span>
        </div>

        {/* Latency */}
        <div className="p-4 rounded-2xl bg-ops-card/80 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ops-text-3">
            <span className="text-[10px] uppercase font-bold tracking-wider">Round-Trip Latency</span>
            <Clock className="w-4 h-4 text-ops-amber" />
          </div>
          <div className="my-2">
            <div className={`text-3xl font-black ${latencyMs > 800 ? "text-ops-red" : latencyMs > 400 ? "text-ops-amber" : "text-ops-green"}`}>
              {latencyMs} <span className="text-base font-semibold">ms</span>
            </div>
            <div className="text-[11px] text-ops-text-2 mt-0.5">Score: {latencyScore}%</div>
          </div>
          <span className="text-[10px] text-ops-text-3">Geostationary polar relay</span>
        </div>

        {/* Data Freshness */}
        <div className="p-4 rounded-2xl bg-ops-card/80 border border-white/10 flex flex-col justify-between overflow-hidden min-w-0">
          <div className="flex items-center justify-between text-ops-text-3">
            <span className="text-[10px] uppercase font-bold tracking-wider">Data Freshness</span>
            <Layers className="w-4 h-4 text-ops-teal shrink-0" />
          </div>
          <div className="my-2 min-w-0">
            <div className={`text-base sm:text-lg font-bold truncate ${
              dataFreshness === "NOMINAL" ? "text-ops-green" : dataFreshness === "WARNING" ? "text-ops-amber" : "text-ops-red"
            }`}>
              {dataFreshness}
            </div>
            <div className="text-[11px] text-ops-text-2 mt-0.5">Last Sync: {lastSyncMinutes} min ago</div>
          </div>
          <span className="text-[10px] text-ops-text-3">Fidelity Score: {freshnessScore}%</span>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="text-xs text-ops-text-2 p-3 rounded-xl bg-ops-card/40 border border-white/5 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ops-teal" />
          {statusDetail}
        </span>
        <span className="text-[10px] text-ops-text-3 font-mono">
          Station: {selectedStation === "maitri" ? "Maitri" : "Bharati"}
        </span>
      </div>

      {/* Expandable Operational Awareness Impact Panel */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-ops-text-2 bg-ops-card/40 p-4 rounded-xl border border-white/5 space-y-2">
          <div className="font-bold text-ops-text flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-ops-teal" />
            Impact on Operational Awareness &amp; Decision Support
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] mt-2">
            <div className="p-2.5 rounded-lg bg-ops-panel border border-white/5">
              <span className="text-ops-text font-bold block mb-1">Communication</span>
              <span className={status === "CONNECTED" ? "text-ops-green" : "text-ops-amber"}>{status}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-ops-panel border border-white/5">
              <span className="text-ops-text font-bold block mb-1">Telemetry Freshness</span>
              <span className={dataFreshness === "NOMINAL" ? "text-ops-green" : "text-ops-amber"}>{lastSyncMinutes}m interval</span>
            </div>
            <div className="p-2.5 rounded-lg bg-ops-panel border border-white/5">
              <span className="text-ops-text font-bold block mb-1">Monitoring Confidence</span>
              <span className={overallScore > 75 ? "text-ops-green" : "text-ops-amber"}>{overallScore > 75 ? "High Confidence" : "Degraded Confidence"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-ops-panel border border-white/5">
              <span className="text-ops-text font-bold block mb-1">Physical Impact</span>
              <span className="text-ops-text-2">Zero physical shutdown; visibility reduced</span>
            </div>
          </div>
          <p className="text-[10px] text-ops-text-3 mt-2">
            * Note: Simulated communication health measures command-center situational visibility and monitoring latency. Physical station microgrids remain autonomous under PLC control during communication outages.
          </p>
        </div>
      )}
    </div>
  );
};
