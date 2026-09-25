"use client";

import React from "react";
import { useLink } from "@/context/LinkContext";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export const LinkStatusIndicator: React.FC = () => {
  const { connected, lastSynced, isRestoring, toggle } = useLink();

  return (
    <button
      onClick={toggle}
      disabled={isRestoring}
      title="Click to toggle communication link degradation demo"
      className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all duration-200 text-left cursor-pointer select-none ${
        isRestoring
          ? "bg-[#E3EFF0] border-[#C7DDE0] text-[#287C80]"
          : connected
          ? "bg-[#F9FBFB] border-[#D9E2E5] hover:bg-[#F3F7F7] hover:border-[#C5D2D6] text-[#3D5260]"
          : "bg-[#F7EDDB] border-[#E8D4AE] hover:bg-[#F4E7CF] hover:border-[#D7BC88] text-[#876126]"
      }`}
    >
      {/* =====================================================
          STATUS CONTENT
      ===================================================== */}

      <div className="flex items-center gap-2.5">

        {/* Status Indicator */}
        {isRestoring ? (
          <RefreshCw
            className="w-3.5 h-3.5 text-[#287C80] animate-spin"
          />
        ) : connected ? (
          <span className="relative flex h-2 w-2">

            {/* Soft pulse */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3F8068] opacity-40" />

            {/* Main dot */}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3F8068]" />

          </span>
        ) : (
          <span className="inline-flex rounded-full h-2 w-2 bg-[#B98232]" />
        )}

        {/* Text */}
        <div className="flex flex-col">

          <div className="flex items-center gap-1.5 leading-none">

            <span className="text-xs font-semibold tracking-tight">
              {isRestoring
                ? "Restoring link..."
                : connected
                ? "Live"
                : "Degraded"}
            </span>

            <span className="text-[9px] text-[#8A99A3] font-medium group-hover:text-[#647582] transition-colors">
              toggle
            </span>

          </div>

          <span className="text-[10px] text-[#87959D] mt-1 font-normal">
            {isRestoring
              ? "Syncing telemetry..."
              : `Synced: ${lastSynced}`}
          </span>

        </div>
      </div>

      {/* =====================================================
          CONNECTION ICON
      ===================================================== */}

      <div className="pl-3 border-l border-[#D9E2E5] flex items-center text-[#71818B]">

        {connected ? (
          <Wifi className="w-3.5 h-3.5 text-[#287C80]" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-[#B98232]" />
        )}

      </div>
    </button>
  );
};