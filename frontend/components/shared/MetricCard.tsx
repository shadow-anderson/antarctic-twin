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
      cardGradient: "from-[#6FA8C7]/[0.12] to-transparent",
      icon: "bg-[#6FA8C7]/15 text-[#6FA8C7] border border-[#6FA8C7]/30",
      accent: "#6FA8C7",
      glow: "rgba(111, 168, 199, 0.25)",
      bar: "from-[#6FA8C7]/40 to-[#6FA8C7]",
    },

    lavender: {
      cardGradient: "from-[#8F86B8]/[0.12] to-transparent",
      icon: "bg-[#8F86B8]/15 text-[#8F86B8] border border-[#8F86B8]/30",
      accent: "#8F86B8",
      glow: "rgba(143, 134, 184, 0.25)",
      bar: "from-[#8F86B8]/40 to-[#8F86B8]",
    },

    mint: {
      cardGradient: "from-[#4FB58A]/[0.12] to-transparent",
      icon: "bg-[#4FB58A]/15 text-[#4FB58A] border border-[#4FB58A]/30",
      accent: "#4FB58A",
      glow: "rgba(79, 181, 138, 0.25)",
      bar: "from-[#4FB58A]/40 to-[#4FB58A]",
    },

    amber: {
      cardGradient: "from-[#D9A441]/[0.12] to-transparent",
      icon: "bg-[#D9A441]/15 text-[#D9A441] border border-[#D9A441]/30",
      accent: "#D9A441",
      glow: "rgba(217, 164, 65, 0.25)",
      bar: "from-[#D9A441]/40 to-[#D9A441]",
    },

    teal: {
      cardGradient: "from-[#2FA3A8]/[0.12] to-transparent",
      icon: "bg-[#2FA3A8]/15 text-[#2FA3A8] border border-[#2FA3A8]/30",
      accent: "#2FA3A8",
      glow: "rgba(47, 163, 168, 0.25)",
      bar: "from-[#2FA3A8]/40 to-[#2FA3A8]",
    },
  };

  const currentTone = toneStyles[tone];

  return (
    <div
      style={{ "--tone-glow": currentTone.glow } as React.CSSProperties}
      className={`
        relative flex flex-col justify-between
        p-5 rounded-2xl
        bg-ops-card/90 backdrop-blur-sm
        border border-white/[0.08] ring-1 ring-white/5
        shadow-[0_4px_16px_rgba(0,0,0,0.25)]
        transition-all duration-200
        overflow-hidden
        ${
          connected
            ? "hover:-translate-y-1 hover:shadow-[0_10px_25px_var(--tone-glow)] hover:border-white/20"
            : "opacity-70"
        }
        ${className}
      `}
    >
      {/* Top Tone-tinted gradient at ~12% */}
      <div
        className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${currentTone.cardGradient} pointer-events-none`}
      />

      {/* Very subtle decorative glow */}
      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ backgroundColor: currentTone.accent }}
      />

      {/* Top Header */}
      <div className="relative flex items-center justify-between gap-2 mb-4 min-w-0">
        <div className="flex items-center gap-2.5 text-ops-text-2">
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

          <span className="text-[11px] font-semibold tracking-wider uppercase text-ops-text-2">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!connected && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-ops-amber/15 text-ops-amber border border-ops-amber/30">
              Stale
            </span>
          )}

          <SourceBadge source={source} variant="dark" />
        </div>
      </div>

      {/* Main Value */}
      <div className="relative flex items-end justify-between mt-1 mb-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums">
            {formattedValue}
          </span>

          <span className="text-sm font-medium text-ops-text-2">
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
      <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${currentTone.bar} rounded-full`}
          style={{ width: "68%" }}
        />
      </div>
    </div>
  );
};