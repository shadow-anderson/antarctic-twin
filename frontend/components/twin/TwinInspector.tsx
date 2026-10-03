"use client";

import React from "react";
import {
  TwinAsset,
  TwinAssetStatus,
  TWIN_ASSET_REGISTRY,
} from "@/lib/twinAssetRegistry";
import {
  X,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface TwinInspectorProps {
  asset: TwinAsset | null;
  stationId: "maitri" | "bharati";
  onClose: () => void;
  onSelectDependency: (assetId: string) => void;
}

const STATUS_BADGES: Record<
  TwinAssetStatus,
  { label: string; bg: string; border: string; text: string; icon: React.ElementType }
> = {
  nominal: {
    label: "NOMINAL",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    icon: CheckCircle,
  },
  warning: {
    label: "WARNING",
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    text: "text-amber-400",
    icon: AlertTriangle,
  },
  degraded: {
    label: "DEGRADED",
    bg: "bg-orange-500/15",
    border: "border-orange-500/40",
    text: "text-orange-400",
    icon: AlertTriangle,
  },
  critical: {
    label: "CRITICAL",
    bg: "bg-rose-500/15",
    border: "border-rose-500/40",
    text: "text-rose-400",
    icon: ShieldAlert,
  },
};

export const TwinInspector: React.FC<TwinInspectorProps> = ({
  asset,
  stationId,
  onClose,
  onSelectDependency,
}) => {
  // If no asset is selected, do NOT render the inspector panel so the 3D model is 100% visible
  if (!asset) return null;

  const data = stationId === "maitri" ? asset.maitri : asset.bharati;
  const statusMeta = STATUS_BADGES[data.status];
  const StatusIcon = statusMeta.icon;

  // Resolve dependency names
  const resolvedDeps = data.dependencies.map((depId) => {
    const found = TWIN_ASSET_REGISTRY.find((a) => a.id === depId);
    return {
      id: depId,
      name: found ? found.name : depId,
      shortId: found ? found.shortId : depId,
    };
  });

  return (
    <aside
      className="absolute top-4 right-3 bottom-4 w-72 sm:w-80 rounded-2xl border border-[#22354D]/80 bg-[#111C2E]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_20px_rgba(0,229,255,0.12)] z-20 flex flex-col overflow-hidden text-slate-100 transition-all duration-300 animate-in slide-in-from-right-6"
      aria-label="Asset Inspector"
    >
      {/* Top Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#2979FF] via-[#00E5FF] to-[#00E676]" />

      {/* Header */}
      <div className="p-3.5 border-b border-[#203047]/70 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#00E5FF] border border-[#00E5FF]/30">
              {asset.shortId}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
            >
              <StatusIcon className="w-2.5 h-2.5" />
              {statusMeta.label}
            </span>
          </div>

          <h2 className="text-sm font-bold tracking-tight text-slate-100 mt-1.5 leading-snug">
            {asset.name}
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {asset.type} • {stationId === "maitri" ? "Maitri" : "Bharati"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          aria-label="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar text-xs">
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="p-2 rounded-xl bg-[#0B1320]/65 border border-[#1E2E42]/70 flex flex-col items-center text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Health
            </span>
            <span
              className={`text-base font-mono font-black mt-0.5 ${
                data.healthPct >= 90
                  ? "text-emerald-400"
                  : data.healthPct >= 75
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {data.healthPct}%
            </span>
          </div>

          <div className="p-2 rounded-xl bg-[#0B1320]/65 border border-[#1E2E42]/70 flex flex-col items-center text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Fail Prob
            </span>
            <span
              className={`text-base font-mono font-black mt-0.5 ${
                data.failureProbPct > 15
                  ? "text-rose-400"
                  : data.failureProbPct > 5
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {data.failureProbPct}%
            </span>
          </div>

          <div className="p-2 rounded-xl bg-[#0B1320]/65 border border-[#1E2E42]/70 flex flex-col items-center text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              RUL
            </span>
            <span className="text-base font-mono font-black text-[#00E5FF] mt-0.5">
              {data.rulHours > 9000 ? "Nominal" : `${data.rulHours}h`}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-slate-300 leading-relaxed bg-[#0B1320]/65 p-2.5 rounded-xl border border-[#1E2E42]/50">
          {asset.description}
        </p>

        {/* Live Telemetry Cards */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3 h-3 text-[#00E5FF]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
              Live Telemetry
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {data.telemetry.map((t, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-[#0B1320]/65 border border-[#1E2E42]/70 flex flex-col justify-between"
              >
                <span className="text-[9px] text-slate-400 uppercase tracking-wider truncate font-medium">
                  {t.label}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-sm font-bold text-slate-100">
                    {t.value}
                  </span>
                  {t.unit && (
                    <span className="text-[9px] font-medium text-slate-400">
                      {t.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dependencies */}
        {resolvedDeps.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-[#FFAB00]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                Dependencies ({resolvedDeps.length})
              </span>
            </div>

            <div className="space-y-1">
              {resolvedDeps.map((dep) => (
                <button
                  key={dep.id}
                  type="button"
                  onClick={() => onSelectDependency(dep.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0B1320]/60 border border-[#1E2E42]/70 hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/10 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[9px] font-bold text-[#00E5FF] px-1 py-0.5 rounded bg-[#00E5FF]/10">
                      {dep.shortId}
                    </span>
                    <span className="text-[11px] text-slate-200 truncate group-hover:text-[#00E5FF] transition-colors">
                      {dep.name}
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#00E5FF] shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-[#203047]/70 bg-[#0B1320]/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Sync</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[#00E5FF] hover:underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
};
