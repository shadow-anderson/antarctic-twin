"use client";

import React, { useState, useEffect, useRef } from "react";
import { StationSwitcher } from "./StationSwitcher";
import { LinkStatusIndicator } from "./LinkStatusIndicator";
import {
  RadioTower,
  LayoutDashboard,
  Layers,
  Sparkles,
  TrendingDown,
  Database,
  X,
} from "lucide-react";

import { getMissionTime, getStationCurrent } from "@/lib/api";
import { useStation } from "@/context/StationContext";
import {
  PROVENANCE_REGISTRY,
  ProvenanceEntry,
  groupBySource,
} from "@/lib/provenance";
import { DataSource } from "@/lib/types";

export type ConsoleTab = "overview" | "assets" | "whatif" | "forecast";

interface TopBarProps {
  activeTab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
}

const SOURCE_STYLES: Record<
  DataSource,
  { dot: string; heading: string }
> = {
  real: {
    dot: "bg-[#4F806A]",
    heading: "text-[#39735F]",
  },
  simulated: {
    dot: "bg-[#B98232]",
    heading: "text-[#956E31]",
  },
  derived: {
    dot: "bg-[#756B91]",
    heading: "text-[#69658A]",
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [utcTime, setUtcTime] = useState<string>("--:--:-- UTC");
  const { selectedStation } = useStation();

  /* ============================================================
     PROVENANCE LEDGER STATE
  ============================================================ */
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [ledgerEntries, setLedgerEntries] =
    useState<ProvenanceEntry[]>(PROVENANCE_REGISTRY);
  const chipRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const computeProvenance = async () => {
      try {
        const data = await getStationCurrent(selectedStation);
        if (!isMounted) return;

        // Tally .source of every metric from live response
        const dynamicSources: Record<string, DataSource> = {
          weather_temperature: data.weather.temperature_c.source,
          weather_wind_speed: data.weather.wind_speed_ms.source,
          weather_pressure: data.weather.pressure_hpa.source,
          energy_generation: data.energy.generation_kw.source,
          energy_consumption: data.energy.consumption_kw.source,
          energy_diesel_pct: data.energy.diesel_pct.source,
          logistics_food_days: data.logistics.food_days_remaining.source,
          logistics_diesel_days: data.logistics.diesel_days_remaining.source,
        };

        const updated = PROVENANCE_REGISTRY.map((entry) => ({
          ...entry,
          source: dynamicSources[entry.key] ?? entry.source,
        }));

        setLedgerEntries(updated);
      } catch (err) {
        console.warn(
          "Could not fetch live telemetry for provenance ledger, using registry defaults:",
          err
        );
        if (isMounted) {
          setLedgerEntries(PROVENANCE_REGISTRY);
        }
      }
    };

    computeProvenance();

    return () => {
      isMounted = false;
    };
  }, [selectedStation]);

  const itemsBySource = groupBySource(ledgerEntries);
  const counts = {
    real: itemsBySource.real.length,
    simulated: itemsBySource.simulated.length,
    derived: itemsBySource.derived.length,
  };

  /* Close on Escape and Outside Click */
  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPopoverOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        chipRef.current &&
        !chipRef.current.contains(e.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  /* ============================================================
     UTC CLOCK
  ============================================================ */
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
        const parts = timeStr.replace(" UTC", "").split(":");
        if (parts.length === 3) {
          const now = new Date();
          const serverDate = new Date(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              parseInt(parts[0], 10),
              parseInt(parts[1], 10),
              parseInt(parts[2], 10)
            )
          );
          offsetMs = serverDate.getTime() - Date.now();
          setUtcTime(formatUtc(new Date(Date.now() + offsetMs)));
        } else {
          setUtcTime(timeStr);
        }
      } catch {
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
            RIGHT — PROVENANCE LEDGER + UTC + LINK STATUS
        ===================================================== */}

        <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-end">

          {/* Provenance Ledger Chip & Popover */}
          <div className="relative">
            <button
              ref={chipRef}
              type="button"
              aria-expanded={isPopoverOpen}
              aria-haspopup="dialog"
              onClick={() => setIsPopoverOpen((prev) => !prev)}
              className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F5F5] border border-[#D4E1E3] hover:bg-[#E8F0F1] hover:border-[#C2D4D7] transition-all duration-150 text-[10px] font-semibold text-[#3D5260] cursor-pointer"
              title="Data provenance ledger — click to view origins"
            >
              <Database className="w-3 h-3 text-[#4C7891]" />
              {/* Full on xl */}
              <span className="hidden xl:inline-flex items-center gap-1.5">
                <span className="text-[#39735F]">{counts.real} Real</span>
                <span className="text-[#9BAEB5]">·</span>
                <span className="text-[#956E31]">{counts.simulated} Simulated</span>
                <span className="text-[#9BAEB5]">·</span>
                <span className="text-[#69658A]">{counts.derived} Derived</span>
              </span>
              {/* Compact on lg */}
              <span className="inline-flex xl:hidden items-center gap-1">
                <span className="text-[#39735F]">{counts.real}R</span>
                <span className="text-[#9BAEB5]">·</span>
                <span className="text-[#956E31]">{counts.simulated}S</span>
                <span className="text-[#9BAEB5]">·</span>
                <span className="text-[#69658A]">{counts.derived}D</span>
              </span>
            </button>

            {/* Popover */}
            {isPopoverOpen && (
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="Data provenance ledger"
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[#D5E1E3] bg-white shadow-[0_12px_40px_rgba(23,54,74,0.12)] z-50 overflow-hidden"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5ECEE] bg-[#F7FAFA]">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#4C7891]" />
                    <span className="text-xs font-bold text-[#304955] tracking-tight">
                      Data Provenance Ledger
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPopoverOpen(false)}
                    className="p-1 rounded-lg hover:bg-[#E5ECEE] text-[#8A999E] transition-colors"
                    aria-label="Close ledger"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Popover Content */}
                <div className="max-h-[70vh] overflow-y-auto divide-y divide-[#F0F5F5]">
                  {(["real", "simulated", "derived"] as DataSource[]).map(
                    (src) => {
                      const group = itemsBySource[src];
                      if (!group || group.length === 0) return null;
                      const style = SOURCE_STYLES[src];
                      const label =
                        src === "real"
                          ? "Real"
                          : src === "simulated"
                          ? "Simulated"
                          : "Derived";
                      return (
                        <div key={src} className="px-5 py-3.5">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span
                              className={`w-2 h-2 rounded-full ${style.dot}`}
                            />
                            <span
                              className={`text-[10px] font-bold uppercase tracking-[0.12em] ${style.heading}`}
                            >
                              {label} ({group.length})
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {group.map((item) => (
                              <li
                                key={item.key}
                                className="flex items-start justify-between gap-3 text-[11px]"
                              >
                                <span className="font-medium text-[#405963]">
                                  {item.label}
                                </span>
                                <span className="text-right text-[10px] text-[#7A8C93] font-normal shrink-0 max-w-[55%]">
                                  {item.origin}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Popover Footer */}
                <div className="px-5 py-2.5 border-t border-[#E5ECEE] bg-[#F7FAFA]">
                  <span className="text-[9px] font-medium text-[#8A999E]">
                    Station: {selectedStation === "maitri" ? "Maitri" : "Bharati"} · Verified provenance
                  </span>
                </div>
              </div>
            )}
          </div>

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