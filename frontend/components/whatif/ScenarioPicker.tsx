"use client";

import React, { useState } from "react";
import { ScenarioId, ScenarioDefinitionExtended } from "@/lib/intelligence/types";
import {
  ThermometerSnowflake,
  CloudSnow,
  Wind,
  ZapOff,
  BatteryWarning,
  WifiOff,
  Truck,
  Fuel,
  Flame,
  AlertTriangle,
  Check,
  ArrowUpRight,
  Radio,
  Filter,
} from "lucide-react";

interface ScenarioPickerProps {
  scenarios: ScenarioDefinitionExtended[];
  selectedScenario: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  disabled?: boolean;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  scenarios,
  selectedScenario,
  onSelectScenario,
  disabled = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "ENERGY", "ENVIRONMENTAL", "LOGISTICS", "INFRASTRUCTURE", "COMPOUND"];

  const filteredScenarios = scenarios.filter((s) => {
    if (selectedCategory === "ALL") return true;
    return s.category === selectedCategory;
  });

  const getScenarioVisual = (id: ScenarioId) => {
    switch (id) {
      case "extreme_cold":
        return {
          icon: ThermometerSnowflake,
          number: "01",
          category: "ENVIRONMENTAL",
          accent: "#2FA3A8",
          iconBg: "rgba(47, 163, 168, 0.15)",
          iconBorder: "rgba(47, 163, 168, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#2FA3A8",
          badgeBg: "rgba(47, 163, 168, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "blizzard":
        return {
          icon: CloudSnow,
          number: "02",
          category: "ENVIRONMENTAL",
          accent: "#6FA8C7",
          iconBg: "rgba(111, 168, 199, 0.15)",
          iconBorder: "rgba(111, 168, 199, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#6FA8C7",
          badgeBg: "rgba(111, 168, 199, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "high_wind":
        return {
          icon: Wind,
          number: "03",
          category: "ENVIRONMENTAL",
          accent: "#8EC0C2",
          iconBg: "rgba(142, 192, 194, 0.15)",
          iconBorder: "rgba(142, 192, 194, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#8EC0C2",
          badgeBg: "rgba(142, 192, 194, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "generator_failure":
        return {
          icon: ZapOff,
          number: "04",
          category: "ENERGY",
          accent: "#D4706F",
          iconBg: "rgba(212, 112, 111, 0.15)",
          iconBorder: "rgba(212, 112, 111, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#D4706F",
          badgeBg: "rgba(212, 112, 111, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "battery_degradation":
        return {
          icon: BatteryWarning,
          number: "05",
          category: "ENERGY",
          accent: "#D9A441",
          iconBg: "rgba(217, 164, 65, 0.15)",
          iconBorder: "rgba(217, 164, 65, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#D9A441",
          badgeBg: "rgba(217, 164, 65, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "communication_failure":
        return {
          icon: WifiOff,
          number: "06",
          category: "INFRASTRUCTURE",
          accent: "#A78BFA",
          iconBg: "rgba(167, 139, 250, 0.15)",
          iconBorder: "rgba(167, 139, 250, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#A78BFA",
          badgeBg: "rgba(167, 139, 250, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "logistics_delay":
        return {
          icon: Truck,
          number: "07",
          category: "LOGISTICS",
          accent: "#F59E0B",
          iconBg: "rgba(245, 158, 11, 0.15)",
          iconBorder: "rgba(245, 158, 11, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#F59E0B",
          badgeBg: "rgba(245, 158, 11, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "fuel_delay":
        return {
          icon: Fuel,
          number: "08",
          category: "LOGISTICS",
          accent: "#E11D48",
          iconBg: "rgba(225, 29, 72, 0.15)",
          iconBorder: "rgba(225, 29, 72, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#E11D48",
          badgeBg: "rgba(225, 29, 72, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "hvac_failure":
        return {
          icon: Flame,
          number: "09",
          category: "INFRASTRUCTURE",
          accent: "#FB923C",
          iconBg: "rgba(251, 146, 60, 0.15)",
          iconBorder: "rgba(251, 146, 60, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#FB923C",
          badgeBg: "rgba(251, 146, 60, 0.15)",
          badgeText: "#E6EEF1",
        };
      case "multiple_failures":
      default:
        return {
          icon: AlertTriangle,
          number: "10",
          category: "COMPOUND",
          accent: "#EF4444",
          iconBg: "rgba(239, 68, 68, 0.15)",
          iconBorder: "rgba(239, 68, 68, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#EF4444",
          badgeBg: "rgba(239, 68, 68, 0.15)",
          badgeText: "#E6EEF1",
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3 flex items-center gap-1.5 mr-1">
          <Filter className="w-3 h-3" />
          Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider transition-all duration-150 uppercase ${
              selectedCategory === cat
                ? "bg-ops-teal text-[#0D2130] shadow-sm font-extrabold"
                : "bg-ops-card text-ops-text-3 hover:text-ops-text hover:bg-white/5 border border-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {filteredScenarios.map((scenario) => {
          const isSelected = selectedScenario === scenario.id;
          const visual = getScenarioVisual(scenario.id);
          const Icon = visual.icon;

          return (
            <button
              key={scenario.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectScenario(scenario.id)}
              aria-pressed={isSelected}
              className={`
                group relative overflow-hidden text-left
                min-h-[195px] flex flex-col justify-between
                rounded-[20px]
                border
                p-4
                transition-all duration-200
                select-none
                focus:outline-none
                ${
                  isSelected
                    ? "shadow-[0_8px_25px_rgba(0,0,0,0.4)] -translate-y-0.5"
                    : "shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
                }
                ${
                  disabled
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
              style={{
                backgroundColor: isSelected ? visual.selectedBg : visual.cardBg,
                borderColor: isSelected ? visual.selectedBorder : "rgba(255,255,255,0.08)",
              }}
            >
              {/* Top Accent line */}
              <div
                className="absolute left-0 right-0 top-0 h-1 transition-all duration-200"
                style={{
                  backgroundColor: visual.accent,
                  opacity: isSelected ? 1 : 0.4,
                }}
              />

              {/* Header: Icon + Number */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl border shadow-sm"
                    style={{
                      backgroundColor: visual.iconBg,
                      borderColor: visual.iconBorder,
                      color: visual.accent,
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-bold tracking-wider"
                      style={{ color: visual.accent }}
                    >
                      {visual.number}
                    </span>
                    <div
                      className="flex items-center justify-center w-5 h-5 rounded-full border"
                      style={{
                        backgroundColor: isSelected ? visual.accent : "rgba(255,255,255,0.05)",
                        borderColor: isSelected ? visual.accent : "rgba(255,255,255,0.15)",
                        color: isSelected ? "#0D2130" : visual.accent,
                      }}
                    >
                      {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                    </div>
                  </div>
                </div>

                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border mb-1.5"
                  style={{
                    backgroundColor: visual.badgeBg,
                    borderColor: visual.iconBorder,
                    color: visual.badgeText,
                  }}
                >
                  {scenario.category}
                </span>

                <h4 className="text-xs font-bold text-white tracking-tight leading-snug line-clamp-1">
                  {scenario.title}
                </h4>

                <p className="text-[10px] text-ops-text-2 mt-1 leading-relaxed line-clamp-2">
                  {scenario.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[9px]">
                <span
                  className="font-bold uppercase tracking-wider"
                  style={{ color: isSelected ? visual.accent : "#8FA6B2" }}
                >
                  {isSelected ? "Active Model" : "Select"}
                </span>
                <ArrowUpRight
                  className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                  style={{ color: visual.accent }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};