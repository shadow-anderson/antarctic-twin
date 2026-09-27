"use client";

import React from "react";
import { DataSource } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";
import { useLink } from "@/context/LinkContext";

interface MetricCardProps {
  label: string;
  value: number | null;
  unit: string;
  source: DataSource;
  icon?: React.ReactNode;
  className?: string;
  trendSparkline?: number[];
  tone?: "ice" | "lavender" | "mint" | "amber" | "teal";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  source,
  icon,
  className = "",
  tone = "teal",
}) => {
  const { connected } = useLink();

  // Format value to 1 decimal place if float, or raw if integer. Show N/A for null.
  const formattedValue =
    value === null
      ? "N/A"
      : Number.isInteger(value)
      ? value.toString()
      : value.toFixed(1);

  const toneStyles = {
    ice: {
      card: "from-[#F1F7F9] to-[#E8F1F4] border-[#D6E5E9]",
      icon: "bg-[#DDECEF] text-[#4C7891]",
      accent: "#4C7891",
      bar: "from-[#9CBAC8] to-[#4C7891]",
    },

    lavender: {
      card: "from-[#F3F1F7] to-[#ECEAF2] border-[#DEDAE7]",
      icon: "bg-[#E7E3EF] text-[#756B91]",
      accent: "#756B91",
      bar: "from-[#B7AEC9] to-[#756B91]",
    },

    mint: {
      card: "from-[#F0F6F2] to-[#E7F0EA] border-[#D5E4DA]",
      icon: "bg-[#DFECE4] text-[#4F806A]",
      accent: "#4F806A",
      bar: "from-[#9CBCAA] to-[#4F806A]",
    },

    amber: {
      card: "from-[#F8F3E9] to-[#F2EBDD] border-[#E7DCC5]",
      icon: "bg-[#EEE3CF] text-[#A47735]",
      accent: "#A47735",
      bar: "from-[#D2B477] to-[#A47735]",
    },

    teal: {
      card: "from-[#EEF6F6] to-[#E6F0F0] border-[#D5E4E4]",
      icon: "bg-[#DCEBEC] text-[#287C80]",
      accent: "#287C80",
      bar: "from-[#8DBFC0] to-[#287C80]",
    },
  };

  const currentTone = toneStyles[tone];

  return (
    <div
      className={`
        relative flex flex-col justify-between
        p-5 rounded-2xl
        bg-gradient-to-br ${currentTone.card}
        border
        shadow-[0_3px_12px_rgba(40,60,70,0.05)]
        transition-all duration-200
        overflow-hidden
        ${
          connected
            ? "hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(40,60,70,0.08)]"
            : "opacity-70"
        }
        ${className}
      `}
    >
      {/* Very subtle decorative glow */}
      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-30 blur-2xl pointer-events-none"
        style={{ backgroundColor: currentTone.accent }}
      />

      {/* Top Header */}
      <div className="relative flex items-center justify-between gap-2 mb-4 min-w-0">
        <div className="flex items-center gap-2.5 text-[#526673]">
          {icon && (
            <span
              className={`
                flex items-center justify-center
                w-8 h-8 rounded-xl
                ${currentTone.icon}
              `}
            >
              {icon}
            </span>
          )}

          <span className="text-[11px] font-semibold tracking-wider uppercase">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!connected && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7EDDB] text-[#A47735] border border-[#E8D7B8]">
              Stale
            </span>
          )}

          <SourceBadge source={source} />
        </div>
      </div>

      {/* Main Value */}
      <div className="relative flex items-end justify-between mt-1 mb-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#263746] tabular-nums">
            {formattedValue}
          </span>

          <span className="text-sm font-medium text-[#687984]">
            {unit}
          </span>
        </div>

        {/* Decorative micro-sparkline */}
        <div className="hidden sm:block opacity-70">
          <svg
            className="w-16 h-7 overflow-visible"
            viewBox="0 0 64 28"
            fill="none"
          >
            <path
              d="M2 22 L16 18 L30 20 L44 10 L62 14"
              stroke={currentTone.accent}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle
              cx="62"
              cy="14"
              r="2.5"
              fill={currentTone.accent}
            />
          </svg>
        </div>
      </div>

      {/* Bottom Indicator */}
      <div className="w-full h-1 bg-[#DCE4E6] rounded-full mt-4 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${currentTone.bar} rounded-full`}
          style={{ width: "68%" }}
        />
      </div>
    </div>
  );
};