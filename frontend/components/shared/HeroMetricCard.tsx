"use client";

import React from "react";
import { DataSource } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";
import { useLink } from "@/context/LinkContext";
import { daysStatus, WARNING_DAYS, CRITICAL_DAYS, ResourceStatus } from "@/lib/thresholds";

interface HeroMetricCardProps {
  label: string;
  value: number | null;
  unit: string;
  source: DataSource;
  /** Optional descriptive text shown below the value */
  caption?: string;
  /** If provided, enables the threshold ruler (clamps to 0–45 days) */
  daysMode?: boolean;
  className?: string;
}

const STATUS_STYLES: Record<ResourceStatus, {
  bar: string;
  glow: string;
  pill: string;
  pillText: string;
  label: string;
  criticalZone: string;
  warningZone: string;
  markerBorder: string;
}> = {
  nominal: {
    bar: "bg-[#4F8A6B]",
    glow: "rgba(79,138,107,0.30)",
    pill: "bg-[#4F8A6B]/20 border border-[#4F8A6B]/40",
    pillText: "text-[#7ECBA3]",
    label: "Nominal",
    criticalZone: "bg-[#B65C5C]/25",
    warningZone: "bg-[#B98232]/20",
    markerBorder: "border-[#4F8A6B]",
  },
  warning: {
    bar: "bg-[#B98232]",
    glow: "rgba(185,130,50,0.35)",
    pill: "bg-[#B98232]/20 border border-[#B98232]/40",
    pillText: "text-[#E3B060]",
    label: "Warning",
    criticalZone: "bg-[#B65C5C]/25",
    warningZone: "bg-[#B98232]/20",
    markerBorder: "border-[#B98232]",
  },
  critical: {
    bar: "bg-[#B65C5C]",
    glow: "rgba(182,92,92,0.40)",
    pill: "bg-[#B65C5C]/20 border border-[#B65C5C]/40",
    pillText: "text-[#E08080]",
    label: "Critical",
    criticalZone: "bg-[#B65C5C]/35",
    warningZone: "bg-[#B98232]/25",
    markerBorder: "border-[#B65C5C]",
  },
};

const RULER_MAX = 45; // display range for the threshold ruler

export const HeroMetricCard: React.FC<HeroMetricCardProps> = ({
  label,
  value,
  unit,
  source,
  caption,
  daysMode = false,
  className = "",
}) => {
  const { connected } = useLink();
  const status = daysStatus(value);
  const styles = STATUS_STYLES[status];

  const formattedValue =
    value === null
      ? "N/A"
      : Number.isInteger(value)
      ? value.toString()
      : value.toFixed(1);

  // Threshold ruler: critical zone = 0–7d, warning zone = 7–15d, rest = nominal
  const criticalPct = (CRITICAL_DAYS / RULER_MAX) * 100;         // ~15.6%
  const warningPct = ((WARNING_DAYS - CRITICAL_DAYS) / RULER_MAX) * 100; // ~17.8%
  const markerPct = value !== null
    ? Math.min(Math.max(value / RULER_MAX, 0), 1) * 100
    : null;

  return (
    <div
      style={{ "--hero-glow": styles.glow } as React.CSSProperties}
      className={`
        relative flex flex-col justify-between
        min-h-[200px] p-5 sm:p-6 rounded-2xl
        bg-ops-card/90 backdrop-blur-sm
        border border-white/[0.08] ring-1 ring-white/5
        shadow-[0_4px_20px_rgba(0,0,0,0.30)]
        overflow-hidden
        transition-all duration-200
        ${connected ? "hover:shadow-[0_12px_32px_var(--hero-glow)]" : "opacity-70"}
        ${className}
      `}
    >
      {/* Soft ambient glow blob */}
      <div
        className="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ backgroundColor: styles.glow.replace("0.30", "1").replace("0.35", "1").replace("0.40", "1") }}
      />

      {/* Accent bar — top, 3px, status-colored */}
      <div className={`absolute top-0 inset-x-0 h-[3px] ${styles.bar} rounded-tl-2xl rounded-tr-2xl`} />

      {/* Header: label + stale + source badge */}
      <div className="relative flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-ops-text-2">
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {!connected && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-ops-amber/15 text-ops-amber border border-ops-amber/30">
              Stale
            </span>
          )}
          <SourceBadge source={source} />
        </div>
      </div>

      {/* Hero value */}
      <div className="relative flex items-baseline gap-2 mb-1">
        <span className="text-6xl sm:text-7xl font-bold tracking-tight text-white tabular-nums leading-none">
          {formattedValue}
        </span>
        <span className="text-base font-semibold text-ops-text-2 pb-1">{unit}</span>
      </div>

      {/* Status pill */}
      <div className="relative mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${styles.pill} ${styles.pillText}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${styles.bar}`} />
          {styles.label}
        </span>
      </div>

      {/* Caption */}
      {caption && (
        <p className="relative text-[11px] text-ops-text-3 mb-3 leading-5">
          {caption}
        </p>
      )}

      {/* Threshold ruler (only in daysMode with a real value) */}
      {daysMode && value !== null && (
        <div className="relative mt-auto">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-ops-text-3 mb-1">
            <span>Critical · {CRITICAL_DAYS}d</span>
            <span>Warning · {WARNING_DAYS}d</span>
            <span>{RULER_MAX}d+</span>
          </div>

          {/* Track */}
          <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
            {/* Critical zone (0 → criticalPct) */}
            <div
              className={`absolute left-0 top-0 h-full ${styles.criticalZone}`}
              style={{ width: `${criticalPct}%` }}
            />
            {/* Warning zone (criticalPct → criticalPct+warningPct) */}
            <div
              className={`absolute top-0 h-full ${styles.warningZone}`}
              style={{ left: `${criticalPct}%`, width: `${warningPct}%` }}
            />
          </div>

          {/* Marker */}
          {markerPct !== null && (
            <div
              className="absolute top-[1.45rem] w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2"
              style={{
                left: `${markerPct}%`,
                borderColor: styles.markerBorder.replace("border-[", "").replace("]", ""),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
