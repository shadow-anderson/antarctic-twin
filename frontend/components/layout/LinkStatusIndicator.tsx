"use client";

import React from "react";
import { useLink } from "@/context/LinkContext";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { SourceBadge } from "../shared/SourceBadge";

export const LinkStatusIndicator: React.FC = () => {
  const { connected, isLive, lastSynced, isRestoring, toggle } = useLink();

  return (
    <button
      onClick={toggle}
      disabled={isRestoring}
      title="Communication link status — click to toggle simulated degradation"
      className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all duration-200 text-left cursor-pointer select-none ${
        isRestoring
          ? "bg-ops-teal/15 border-ops-teal/30 text-ops-teal"
          : !connected
          ? "bg-ops-amber/15 border-ops-amber/30 hover:bg-ops-amber/25 hover:border-ops-amber/40 text-ops-amber"
          : isLive
          ? "bg-ops-card/80 border-ops-green/30 hover:bg-ops-card hover:border-ops-green/50 text-ops-text ring-1 ring-ops-green/10"
          : "bg-ops-card/80 border-ops-teal/30 hover:bg-ops-card hover:border-ops-teal/40 text-ops-text ring-1 ring-ops-teal/10"
      }`}
    >
      {/* =====================================================
          STATUS CONTENT
      ===================================================== */}

      <div className="flex items-center gap-2.5">

        {/* Status Indicator */}
        {isRestoring ? (
          <RefreshCw
            className="w-3.5 h-3.5 text-ops-teal animate-spin"
          />
        ) : !connected ? (
          <span className="inline-flex rounded-full h-2 w-2 bg-ops-amber" />
        ) : isLive ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ops-green opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ops-green" />
          </span>
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ops-teal opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ops-teal" />
          </span>
        )}

        {/* Text */}
        <div className="flex flex-col">

          <div className="flex items-center gap-1.5 leading-none">

            <span className="text-xs font-semibold tracking-tight text-ops-text">
              {isRestoring
                ? "Restoring link..."
                : !connected
                ? "Degraded"
                : isLive
                ? "Live Connection"
                : "Simulation Mode"}
            </span>

            <span className="text-[9px] text-ops-text-3 font-medium group-hover:text-ops-text-2 transition-colors">
              toggle
            </span>

          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <SourceBadge
              source="simulated"
              size="xs"
              origin="Deterministic model"
              variant="dark"
            />
            <span className="text-[10px] text-ops-text-3 font-normal">
              {isRestoring
                ? "Syncing telemetry..."
                : isLive
                ? `Synced: ${lastSynced}`
                : "Calibrated Telemetry"}
            </span>
          </div>

        </div>
      </div>

      {/* =====================================================
          CONNECTION ICON
      ===================================================== */}

      <div className="pl-3 border-l border-white/10 flex items-center text-ops-text-3">

        {connected ? (
          <Wifi className="w-3.5 h-3.5 text-ops-teal" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-ops-amber" />
        )}

      </div>
    </button>
  );
};