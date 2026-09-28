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
          accent: "#D4706F",
          accentDark: "#D4706F",
          iconBg: "rgba(212, 112, 111, 0.15)",
          iconBorder: "rgba(212, 112, 111, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#D4706F",
          badgeBg: "rgba(212, 112, 111, 0.15)",
          badgeText: "#E6EEF1",
          description:
            "Simulate primary generator loss and observe its effect on station power availability, fuel demand, and operational continuity.",
        };

      case "blizzard":
        return {
          icon: CloudSnow,
          number: "02",
          category: "ENVIRONMENTAL EVENT",
          accent: "#2FA3A8",
          accentDark: "#2FA3A8",
          iconBg: "rgba(47, 163, 168, 0.15)",
          iconBorder: "rgba(47, 163, 168, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#2FA3A8",
          badgeBg: "rgba(47, 163, 168, 0.15)",
          badgeText: "#E6EEF1",
          description:
            "Introduce severe Antarctic weather conditions and project impacts across logistics, energy consumption, field operations, and readiness.",
        };

      case "resupply_delay":
        return {
          icon: Clock,
          number: "03",
          category: "LOGISTICS EVENT",
          accent: "#D9A441",
          accentDark: "#D9A441",
          iconBg: "rgba(217, 164, 65, 0.15)",
          iconBorder: "rgba(217, 164, 65, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#D9A441",
          badgeBg: "rgba(217, 164, 65, 0.15)",
          badgeText: "#E6EEF1",
          description:
            "Delay incoming supplies and examine how reserves, medical inventory, food availability, and operational endurance are affected.",
        };

      default:
        return {
          icon: Radio,
          number: "00",
          category: "OPERATIONAL EVENT",
          accent: "#6FA8C7",
          accentDark: "#6FA8C7",
          iconBg: "rgba(111, 168, 199, 0.15)",
          iconBorder: "rgba(111, 168, 199, 0.3)",
          cardBg: "#183548",
          selectedBg: "#1b3c52",
          selectedBorder: "#6FA8C7",
          badgeBg: "rgba(111, 168, 199, 0.15)",
          badgeText: "#E6EEF1",
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
              focus-visible:ring-ops-teal
              ${
                isSelected
                  ? "shadow-[0_12px_30px_rgba(0,0,0,0.35)] -translate-y-1"
                  : "shadow-[0_5px_18px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.3)]"
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
                : "rgba(255,255,255,0.1)",
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
              className="absolute -right-12 -top-12 w-32 h-32 rounded-full transition-transform duration-500 group-hover:scale-125 pointer-events-none"
              style={{
                backgroundColor: visual.accent,
                opacity: isSelected ? 0.12 : 0.05,
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
                      opacity: 0.9,
                    }}
                  >
                    {visual.number}
                  </span>

                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-200"
                    style={{
                      backgroundColor: isSelected
                        ? visual.accent
                        : "rgba(255,255,255,0.05)",
                      borderColor: isSelected
                        ? visual.accent
                        : "rgba(255,255,255,0.15)",
                      color: isSelected
                        ? "#0D2130"
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
              <h3 className="mt-3 text-base font-bold tracking-tight text-ops-text">
                {scenario.title}
              </h3>

              {/* Description */}
              <p className="mt-1.5 text-[11px] leading-[1.65] text-ops-text-2">
                {visual.description || scenario.description}
              </p>

              {/* Bottom action */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">

                <div
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: isSelected
                      ? visual.accent
                      : "#9DB2BC",
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
                  boxShadow: `inset 0 0 0 1px ${visual.accent}60`,
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