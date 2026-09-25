"use client";

import React from "react";
import { ScenarioDefinition, ScenarioTrigger } from "@/lib/types";
import {
  ZapOff,
  CloudSnow,
  Clock,
  Check,
  ArrowUpRight,
  Radio,
} from "lucide-react";

interface ScenarioPickerProps {
  scenarios: ScenarioDefinition[];
  selectedScenario: ScenarioTrigger | null;
  onSelectScenario: (id: ScenarioTrigger) => void;
  disabled?: boolean;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  scenarios,
  selectedScenario,
  onSelectScenario,
  disabled = false,
}) => {
  const getScenarioVisual = (id: ScenarioTrigger) => {
    switch (id) {
      case "generator_failure":
        return {
          icon: ZapOff,
          number: "01",
          category: "ENERGY SYSTEM",
          accent: "#B65C5C",
          accentDark: "#934646",
          iconBg: "#F3DEDE",
          iconBorder: "#E6C4C4",
          cardBg: "#FBF5F5",
          selectedBg: "#F7EDED",
          selectedBorder: "#C98282",
          badgeBg: "#F1DDDD",
          badgeText: "#985353",
          description:
            "Simulate primary generator loss and observe its effect on station power availability, fuel demand, and operational continuity.",
        };

      case "blizzard":
        return {
          icon: CloudSnow,
          number: "02",
          category: "ENVIRONMENTAL EVENT",
          accent: "#4C7F91",
          accentDark: "#376674",
          iconBg: "#DDEDEF",
          iconBorder: "#C3DDE1",
          cardBg: "#F3F8F9",
          selectedBg: "#EAF4F5",
          selectedBorder: "#6E9CA7",
          badgeBg: "#DCECEF",
          badgeText: "#4B7480",
          description:
            "Introduce severe Antarctic weather conditions and project impacts across logistics, energy consumption, field operations, and readiness.",
        };

      case "resupply_delay":
        return {
          icon: Clock,
          number: "03",
          category: "LOGISTICS EVENT",
          accent: "#B98232",
          accentDark: "#936B2B",
          iconBg: "#F3E7CF",
          iconBorder: "#E3D0AB",
          cardBg: "#FBF8F1",
          selectedBg: "#F8F1E3",
          selectedBorder: "#C9A25E",
          badgeBg: "#F1E4CC",
          badgeText: "#8D6A32",
          description:
            "Delay incoming supplies and examine how reserves, medical inventory, food availability, and operational endurance are affected.",
        };

      default:
        return {
          icon: Radio,
          number: "00",
          category: "OPERATIONAL EVENT",
          accent: "#617C84",
          accentDark: "#4B646B",
          iconBg: "#E5ECEE",
          iconBorder: "#D3E0E3",
          cardBg: "#F7F9F9",
          selectedBg: "#EEF4F5",
          selectedBorder: "#91AEB5",
          badgeBg: "#E4ECEE",
          badgeText: "#607A82",
          description: scenarioDescriptionFallback,
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {scenarios.map((scenario) => {
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
              min-h-[255px]
              rounded-[24px]
              border
              transition-all duration-300
              select-none
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-offset-2
              focus-visible:ring-[#4C7F91]
              ${
                isSelected
                  ? "shadow-[0_12px_30px_rgba(65,90,96,0.13)] -translate-y-1"
                  : "shadow-[0_5px_18px_rgba(55,75,82,0.05)] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(55,75,82,0.10)]"
              }
              ${
                disabled
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
            style={{
              backgroundColor: isSelected
                ? visual.selectedBg
                : visual.cardBg,
              borderColor: isSelected
                ? visual.selectedBorder
                : visual.iconBorder,
            }}
          >
            {/* =================================================
                TOP ACCENT BAR
            ================================================= */}
            <div
              className="absolute left-0 right-0 top-0 h-1 transition-all duration-300"
              style={{
                backgroundColor: visual.accent,
                opacity: isSelected ? 1 : 0.45,
              }}
            />

            {/* =================================================
                DECORATIVE BACKGROUND CIRCLE
            ================================================= */}
            <div
              className="absolute -right-12 -top-12 w-32 h-32 rounded-full transition-transform duration-500 group-hover:scale-125"
              style={{
                backgroundColor: visual.accent,
                opacity: isSelected ? 0.08 : 0.045,
              }}
            />

            {/* =================================================
                CARD CONTENT
            ================================================= */}
            <div className="relative p-5">

              {/* Header row */}
              <div className="flex items-start justify-between gap-3">

                {/* Icon */}
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: visual.iconBg,
                    borderColor: visual.iconBorder,
                    color: visual.accent,
                  }}
                >
                  <Icon
                    className="w-6 h-6"
                    strokeWidth={1.8}
                  />
                </div>

                {/* Number + selection */}
                <div className="flex flex-col items-end gap-2">

                  <span
                    className="text-[10px] font-bold tracking-[0.18em]"
                    style={{
                      color: visual.accent,
                      opacity: 0.8,
                    }}
                  >
                    {visual.number}
                  </span>

                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-200"
                    style={{
                      backgroundColor: isSelected
                        ? visual.accent
                        : "rgba(255,255,255,0.6)",
                      borderColor: isSelected
                        ? visual.accent
                        : visual.iconBorder,
                      color: isSelected
                        ? "#FFFFFF"
                        : visual.accent,
                    }}
                  >
                    {isSelected ? (
                      <Check
                        className="w-3.5 h-3.5"
                        strokeWidth={3}
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full border border-current opacity-30" />
                    )}
                  </div>

                </div>
              </div>

              {/* Category */}
              <div className="mt-5">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] border"
                  style={{
                    backgroundColor: visual.badgeBg,
                    borderColor: visual.iconBorder,
                    color: visual.badgeText,
                  }}
                >
                  {visual.category}
                </span>
              </div>

              {/* Title */}
              <h3
                className="mt-3 text-base font-bold tracking-tight"
                style={{
                  color: "#344F59",
                }}
              >
                {scenario.title}
              </h3>

              {/* Description */}
              <p className="mt-1.5 text-[11px] leading-[1.65] text-[#75868C]">
                {visual.description || scenario.description}
              </p>

              {/* Bottom action */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/[0.06]">

                <div
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: isSelected
                      ? visual.accentDark
                      : "#8A989D",
                  }}
                >
                  <Radio className="w-3 h-3" />
                  {isSelected
                    ? "Scenario Selected"
                    : "Available Trigger"}
                </div>

                <ArrowUpRight
                  className={`
                    w-4 h-4 transition-all duration-300
                    ${
                      isSelected
                        ? "translate-x-0 opacity-100"
                        : "translate-x-1 opacity-30 group-hover:translate-x-0 group-hover:opacity-70"
                    }
                  `}
                  style={{
                    color: visual.accent,
                  }}
                />

              </div>
            </div>

            {/* =================================================
                SELECTED GLOW
            ================================================= */}
            {isSelected && (
              <div
                className="absolute inset-0 pointer-events-none rounded-[24px] ring-1"
                style={{
                  boxShadow: `inset 0 0 0 1px ${visual.accent}40`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

const scenarioDescriptionFallback =
  "Introduce an operational disruption into the digital twin and evaluate its projected impact.";