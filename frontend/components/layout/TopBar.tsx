"use client";

import React, { useState, useEffect } from "react";
import { StationSwitcher } from "./StationSwitcher";
import { LinkStatusIndicator } from "./LinkStatusIndicator";
import {
  RadioTower,
  LayoutDashboard,
  Layers,
  Sparkles,
  TrendingDown,
} from "lucide-react";

import { getMissionTime } from "@/lib/api";

export type ConsoleTab = "overview" | "assets" | "whatif" | "forecast";

interface TopBarProps {
  activeTab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [utcTime, setUtcTime] = useState<string>("14:32:00 UTC");

  useEffect(() => {
    let isMounted = true;
    let offsetMs = 0;

    const formatUtc = (d: Date) => {
      const hours = String(d.getUTCHours()).padStart(2, "0");
      const minutes = String(d.getUTCMinutes()).padStart(2, "0");
      const seconds = String(d.getUTCSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds} UTC`;
    };

    // 1. Initial sync with backend server time
    const syncServerTime = async () => {
      try {
        const timeStr = await getMissionTime();
        if (!isMounted) return;
        // Parse timeStr like "HH:MM:SS UTC"
        const parts = timeStr.replace(" UTC", "").split(":");
        if (parts.length === 3) {
          const now = new Date();
          const serverDate = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            parseInt(parts[0], 10),
            parseInt(parts[1], 10),
            parseInt(parts[2], 10)
          ));
          offsetMs = serverDate.getTime() - Date.now();
          setUtcTime(formatUtc(new Date(Date.now() + offsetMs)));
        } else {
          setUtcTime(timeStr);
        }
      } catch {
        // Fallback to local UTC
        if (isMounted) {
          setUtcTime(formatUtc(new Date()));
        }
      }
    };

    syncServerTime();

    // 2. Smooth 1-second local tick using offset
    const tickInterval = setInterval(() => {
      if (!isMounted) return;
      setUtcTime(formatUtc(new Date(Date.now() + offsetMs)));
    }, 1000);

    // 3. Periodic re-sync every 60 seconds to prevent drift
    const syncInterval = setInterval(syncServerTime, 60000);

    return () => {
      isMounted = false;
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, []);



  return (
    <header className="sticky top-0 z-40 w-full bg-ops-panel/90 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-8 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">

        {/* =====================================================
            LEFT — BRAND + STATION
        ===================================================== */}

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">

          {/* Brand */}
          <div className="flex items-center gap-3">

            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-ops-card border border-white/10 flex items-center justify-center text-ops-teal shadow-inner">
              <RadioTower className="w-[19px] h-[19px] stroke-[1.8]" />
            </div>

            {/* Brand text */}
            <div>
              <div className="flex items-center gap-2">

                <span className="text-[13px] sm:text-sm font-bold tracking-tight text-ops-text">
                  Antarctic Remote Operations
                </span>

                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide bg-ops-teal/15 text-ops-teal border border-ops-teal/30">
                  POLAR TWIN
                </span>

              </div>

              <p className="text-[11px] text-ops-text-3 font-medium mt-0.5">
                Research Command Center
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-7 w-px bg-white/10 hidden md:block" />

          {/* Station */}
          <div className="flex items-center gap-2">

            <span className="text-[11px] font-semibold text-ops-text-3 hidden sm:inline">
              Station
            </span>

            <StationSwitcher />

          </div>
        </div>

        {/* =====================================================
            CENTER — NAVIGATION
        ===================================================== */}

        <nav className="flex items-center p-1 rounded-xl bg-ops-bg/80 border border-white/10">

          {/* Overview */}
          <button
            type="button"
            onClick={() => onTabChange("overview")}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-ops-card text-white shadow-sm ring-1 ring-white/10"
                : "text-ops-text-2 hover:text-ops-text hover:bg-white/5"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 stroke-[2]" />
            Overview
          </button>

          {/* Assets */}
          <button
            type="button"
            onClick={() => onTabChange("assets")}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
              activeTab === "assets"
                ? "bg-ops-card text-white shadow-sm ring-1 ring-white/10"
                : "text-ops-text-2 hover:text-ops-text hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5 stroke-[2]" />
            Assets
          </button>

          {/* What-If */}
          <button
            type="button"
            onClick={() => onTabChange("whatif")}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
              activeTab === "whatif"
                ? "bg-ops-card text-white shadow-sm ring-1 ring-white/10"
                : "text-ops-text-2 hover:text-ops-text hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
            What-If
          </button>

          {/* Forecast */}
          <button
            type="button"
            onClick={() => onTabChange("forecast")}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
              activeTab === "forecast"
                ? "bg-ops-card text-white shadow-sm ring-1 ring-white/10"
                : "text-ops-text-2 hover:text-ops-text hover:bg-white/5"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 stroke-[2]" />
            Forecast
          </button>
        </nav>

        {/* =====================================================
            RIGHT — UTC + LINK STATUS
        ===================================================== */}

        <div className="flex items-center gap-4 w-full lg:w-auto justify-end">

          {/* UTC Mission Time */}
          <div className="hidden xl:flex flex-col text-right pr-1">

            <span className="text-[9px] font-semibold text-ops-text-3 uppercase tracking-[0.12em]">
              UTC Mission Time
            </span>

            <span className="text-xs font-semibold text-ops-text tabular-nums mt-0.5">
              {utcTime}
            </span>

          </div>

          {/* Link Status */}
          <LinkStatusIndicator />

        </div>

      </div>
    </header>
  );
};