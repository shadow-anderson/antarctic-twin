"use client";

import React, { useState, useEffect } from "react";
import { StationSwitcher } from "./StationSwitcher";
import { LinkStatusIndicator } from "./LinkStatusIndicator";
import {
  RadioTower,
  LayoutDashboard,
  Layers,
  Sparkles,
} from "lucide-react";

export type ConsoleTab = "overview" | "assets" | "whatif";

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
    const updateTime = () => {
      const now = new Date();

      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");

      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7FAFA]/95 backdrop-blur-md border-b border-[#D9E2E5] px-4 lg:px-8 py-3 shadow-[0_1px_8px_rgba(23,54,74,0.05)]">
      <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">

        {/* =====================================================
            LEFT — BRAND + STATION
        ===================================================== */}

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">

          {/* Brand */}
          <div className="flex items-center gap-3">

            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-[#E7F0F1] border border-[#D0E0E2] flex items-center justify-center text-[#287C80]">
              <RadioTower className="w-[19px] h-[19px] stroke-[1.8]" />
            </div>

            {/* Brand text */}
            <div>
              <div className="flex items-center gap-2">

                <span className="text-[13px] sm:text-sm font-bold tracking-tight text-[#263746]">
                  Antarctic Remote Operations
                </span>

                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide bg-[#E3EFF0] text-[#287C80] border border-[#CFE1E3]">
                  POLAR TWIN
                </span>

              </div>

              <p className="text-[11px] text-[#71818B] font-medium mt-0.5">
                Research Command Center
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-7 w-px bg-[#D9E2E5] hidden md:block" />

          {/* Station */}
          <div className="flex items-center gap-2">

            <span className="text-[11px] font-semibold text-[#71818B] hidden sm:inline">
              Station
            </span>

            <StationSwitcher />

          </div>
        </div>

        {/* =====================================================
            CENTER — NAVIGATION
        ===================================================== */}

        <nav className="flex items-center p-1 rounded-xl bg-[#EAF0F1] border border-[#DCE5E7]">

          {/* Overview */}
          <button
            type="button"
            onClick={() => onTabChange("overview")}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-[#17364A] text-white shadow-[0_2px_6px_rgba(23,54,74,0.15)]"
                : "text-[#647582] hover:text-[#263746] hover:bg-[#F5F8F8]"
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
                ? "bg-[#17364A] text-white shadow-[0_2px_6px_rgba(23,54,74,0.15)]"
                : "text-[#647582] hover:text-[#263746] hover:bg-[#F5F8F8]"
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
                ? "bg-[#17364A] text-white shadow-[0_2px_6px_rgba(23,54,74,0.15)]"
                : "text-[#647582] hover:text-[#263746] hover:bg-[#F5F8F8]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
            What-If
          </button>

        </nav>

        {/* =====================================================
            RIGHT — UTC + LINK STATUS
        ===================================================== */}

        <div className="flex items-center gap-4 w-full lg:w-auto justify-end">

          {/* UTC Mission Time */}
          <div className="hidden xl:flex flex-col text-right pr-1">

            <span className="text-[9px] font-semibold text-[#87959D] uppercase tracking-[0.12em]">
              UTC Mission Time
            </span>

            <span className="text-xs font-semibold text-[#3D5260] tabular-nums mt-0.5">
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