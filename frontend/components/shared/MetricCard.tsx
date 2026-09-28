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
  tone?: "ice" | "lavender" | "mint" | "amber" | "teal";
  /** "standard" (default) = full-height card; "compact" = denser, smaller text, no icon chip */
  variant?: "standard" | "compact";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  source,
  icon,
  className = "",
  tone = "teal",
  variant = "standard",
}) => {
  const { connected } = useLink();

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
    },

    lavender: {
      cardGradient: "from-[#8F86B8]/[0.12] to-transparent",
      icon: "bg-[#8F86B8]/15 text-[#8F86B8] border border-[#8F86B8]/30",
      accent: "#8F86B8",
      glow: "rgba(143, 134, 184, 0.25)",
    },

    mint: {
      cardGradient: "from-[#4FB58A]/[0.12] to-transparent",
      icon: "bg-[#4FB58A]/15 text-[#4FB58A] border border-[#4FB58A]/30",
      accent: "#4FB58A",
      glow: "rgba(79, 181, 138, 0.25)",
    },

    amber: {
      cardGradient: "from-[#D9A441]/[0.12] to-transparent",
      icon: "bg-[#D9A441]/15 text-[#D9A441] border border-[#D9A441]/30",
      accent: "#D9A441",
      glow: "rgba(217, 164, 65, 0.25)",
    },

    teal: {
      cardGradient: "from-[#2FA3A8]/[0.12] to-transparent",
      icon: "bg-[#2FA3A8]/15 text-[#2FA3A8] border border-[#2FA3A8]/30",
      accent: "#2FA3A8",
      glow: "rgba(47, 163, 168, 0.25)",
    },
  };

  const currentTone = toneStyles[tone];

  /* ---- COMPACT VARIANT ---- */
  if (variant === "compact") {
    return (
      <div
        style={{ "--tone-glow": currentTone.glow } as React.CSSProperties}
        className={`
          relative flex flex-col justify-between
          p-3 rounded-xl
          bg-ops-card/90 backdrop-blur-sm
          border border-white/[0.08] ring-1 ring-white/5
          shadow-[0_2px_8px_rgba(0,0,0,0.20)]
          transition-all duration-200
          overflow-hidden
          ${
            connected
              ? "hover:-translate-y-0.5 hover:shadow-[0_6px_16px_var(--tone-glow)] hover:border-white/20"
              : "opacity-70"
          }
          ${className}
        `}
      >
        {/* Subtle top gradient */}
        <div
          className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${currentTone.cardGradient} pointer-events-none`}
        />

        {/* Header row: label + stale + source */}
        <div className="relative flex items-center justify-between gap-1 mb-1.5 min-w-0">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-ops-text-2 truncate">
            {label}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {!connected && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-ops-amber/15 text-ops-amber border border-ops-amber/30">
                Stale
              </span>
            )}
            <SourceBadge source={source} />
          </div>
        </div>

        {/* Value */}
        <div className="relative flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums">
            {formattedValue}
          </span>
          <span className="text-xs font-medium text-ops-text-2">{unit}</span>
        </div>
      </div>
    );
  }

  /* ---- STANDARD VARIANT (default) ---- */
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
      <div className="relative flex items-baseline gap-1.5 mt-1">
        <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums">
          {formattedValue}
        </span>

        <span className="text-sm font-medium text-ops-text-2">{unit}</span>
      </div>
    </div>
  );
};