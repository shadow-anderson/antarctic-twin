"use client";

import React from "react";
import { AssetDetail } from "@/lib/types";
import { SourceBadge } from "../shared/SourceBadge";
import {
  Activity,
  Cpu,
  Clock,
  Thermometer,
  Zap,
  Gauge,
  Info,
  ShieldCheck,
  Radio,
  CircleDot,
} from "lucide-react";

interface AssetDetailPanelProps {
  asset: AssetDetail | null;
}

export const AssetDetailPanel: React.FC<AssetDetailPanelProps> = ({
  asset,
}) => {
  /* =========================================================
     NO ASSET SELECTED
  ========================================================= */

  if (!asset) {
    return (
      <div className="relative w-full min-h-[520px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-ops-panel flex items-center justify-center ring-1 ring-white/5">
        {/* Decorative background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-ops-teal/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-ops-violet/5 blur-3xl" />

        <div className="relative text-center max-w-sm px-8">
          <div className="mx-auto w-20 h-20 rounded-[24px] bg-ops-card border border-white/10 flex items-center justify-center text-ops-teal shadow-inner">
            <Cpu className="w-9 h-9 stroke-[1.5]" />
          </div>

          <div className="mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ops-card border border-white/10 text-[9px] font-bold uppercase tracking-[0.16em] text-ops-text-2">
              <CircleDot className="w-3 h-3 text-ops-teal" />
              Asset Intelligence
            </div>

            <h3 className="mt-4 text-xl font-bold tracking-tight text-ops-text">
              No Asset Selected
            </h3>

            <p className="mt-2 text-sm leading-6 text-ops-text-3">
              Select an asset from the hierarchy to open its digital twin,
              telemetry, operational state and technical information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatus = () => {
    switch (asset.status) {
      case "critical":
        return {
          label: "Critical",
          text: "text-ops-red",
          bg: "bg-ops-red/15",
          border: "border-ops-red/30",
          dot: "bg-ops-red",
          accent: "#D4706F",
          soft: "rgba(212,112,111,0.2)",
        };

      case "warning":
        return {
          label: "Warning",
          text: "text-ops-amber",
          bg: "bg-ops-amber/15",
          border: "border-ops-amber/30",
          dot: "bg-ops-amber",
          accent: "#D9A441",
          soft: "rgba(217,164,65,0.2)",
        };

      case "healthy":
      default:
        return {
          label: "Healthy",
          text: "text-ops-green",
          bg: "bg-ops-green/15",
          border: "border-ops-green/30",
          dot: "bg-ops-green",
          accent: "#4FB58A",
          soft: "rgba(79,181,138,0.2)",
        };
    }
  };

  const status = getStatus();

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-ops-panel shadow-[0_12px_40px_rgba(0,0,0,0.3)] ring-1 ring-white/5">

      {/* =====================================================
          TOP DECORATIVE BAND
      ===================================================== */}

      <div className="h-1.5 w-full bg-gradient-to-r from-ops-teal via-ops-ice to-ops-violet" />

      <div className="p-5 sm:p-7">

        {/* ===================================================
            ASSET IDENTITY HEADER
        =================================================== */}

        <div className="relative overflow-hidden rounded-[24px] bg-ops-card/80 border border-white/10 p-5 sm:p-6 ring-1 ring-white/5">

          {/* decorative circles */}
          <div className="absolute -right-16 -top-20 w-48 h-48 rounded-full border-[28px] border-white/5 opacity-40 pointer-events-none" />
          <div className="absolute right-10 -bottom-20 w-32 h-32 rounded-full border-[18px] border-white/5 opacity-40 pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Identity */}
            <div className="flex items-start gap-4 min-w-0">

              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-[20px] bg-ops-panel border border-white/10 flex items-center justify-center text-ops-teal shadow-inner">
                  <Cpu className="w-8 h-8 stroke-[1.5]" />
                </div>

                <span
                  className={`absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full border-[3px] border-ops-panel ${status.dot}`}
                />
              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2 mb-2">

                  <span className="px-2.5 py-1 rounded-md bg-ops-teal/15 text-ops-teal border border-ops-teal/30 text-[9px] font-bold uppercase tracking-[0.14em]">
                    {asset.category}
                  </span>

                  <span className="text-[10px] text-ops-text-3 font-medium">
                    Asset ID · {asset.id}
                  </span>

                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
                  {asset.name}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-ops-text-3">
                  <span className="flex items-center gap-1.5 text-ops-teal">
                    <Radio className="w-3.5 h-3.5" />
                    Digital Twin Connected
                  </span>

                  <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />

                  <span>
                    Live asset telemetry
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="relative shrink-0 flex flex-col items-start lg:items-end gap-2">

              <span className="text-[9px] uppercase tracking-[0.16em] font-bold text-ops-text-3">
                Current Condition
              </span>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${status.bg} ${status.border} ${status.text}`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${status.dot} ${
                    asset.status === "healthy" ? "animate-pulse" : ""
                  }`}
                />

                <span className="text-xs font-bold">
                  {status.label}
                </span>
              </div>

              <SourceBadge source={asset.telemetry_source} origin="Seeded asset simulation" variant="dark" />

            </div>
          </div>
        </div>

        {/* ===================================================
            HEALTH + TELEMETRY
        =================================================== */}

        <div className="mt-6">

          <div className="flex items-center justify-between mb-3">

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ops-text-3">
                Live Instrumentation
              </p>

              <h3 className="text-sm font-bold text-ops-text mt-0.5">
                Asset Telemetry
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-ops-green">
              <span className="w-1.5 h-1.5 rounded-full bg-ops-green animate-pulse" />
              Live
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

            {/* HEALTH */}
            <div className="relative overflow-hidden rounded-[20px] bg-ops-card/90 border border-white/[0.08] p-4 ring-1 ring-white/5">

              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full border-[12px] border-white/5 pointer-events-none" />

              <div className="relative flex items-start justify-between">

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
                      System Health
                    </p>
                    <SourceBadge source={asset.telemetry_source} size="xs" origin="Seeded asset simulation" variant="dark" />
                  </div>

                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-white tabular-nums">
                      {asset.health_pct}
                    </span>
                    <span className="text-xs font-semibold text-ops-text-2">
                      %
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-ops-green/15 text-ops-green flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>

              </div>

              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ops-green"
                  style={{
                    width: `${Math.min(
                      Math.max(asset.health_pct, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[9px] font-medium text-ops-text-3">
                Overall operational health
              </p>
            </div>

            {/* TEMPERATURE */}
            {asset.temperature_c != null && (
              <div className="rounded-[20px] bg-ops-card/90 border border-white/[0.08] p-4 ring-1 ring-white/5">

                <div className="flex items-start justify-between">

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
                        Temperature
                      </p>
                      <SourceBadge source={asset.telemetry_source} size="xs" origin="Seeded asset simulation" variant="dark" />
                    </div>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-white tabular-nums">
                        {asset.temperature_c}
                      </span>
                      <span className="text-xs font-semibold text-ops-text-2">
                        °C
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-ops-ice/15 text-ops-ice flex items-center justify-center">
                    <Thermometer className="w-4 h-4" />
                  </div>

                </div>

                <div className="mt-5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10" />
                  <span className="text-[9px] font-bold text-ops-text-3">
                    CURRENT
                  </span>
                </div>
              </div>
            )}

            {/* VIBRATION */}
            {asset.vibration_mms != null && (
              <div className="rounded-[20px] bg-ops-card/90 border border-white/[0.08] p-4 ring-1 ring-white/5">

                <div className="flex items-start justify-between">

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
                        Vibration
                      </p>
                      <SourceBadge source={asset.telemetry_source} size="xs" origin="Seeded asset simulation" variant="dark" />
                    </div>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-white tabular-nums">
                        {asset.vibration_mms}
                      </span>
                      <span className="text-[10px] font-semibold text-ops-text-2">
                        mm/s
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-ops-amber/15 text-ops-amber flex items-center justify-center">
                    <Gauge className="w-4 h-4" />
                  </div>

                </div>

                <div className="mt-5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10" />
                  <span className="text-[9px] font-bold text-ops-text-3">
                    RMS
                  </span>
                </div>
              </div>
            )}

            {/* EFFICIENCY */}
            {asset.efficiency_pct != null && (
              <div className="rounded-[20px] bg-ops-card/90 border border-white/[0.08] p-4 ring-1 ring-white/5">

                <div className="flex items-start justify-between">

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
                        Efficiency
                      </p>
                      <SourceBadge source={asset.telemetry_source} size="xs" origin="Seeded asset simulation" variant="dark" />
                    </div>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-white tabular-nums">
                        {asset.efficiency_pct}
                      </span>
                      <span className="text-xs font-semibold text-ops-text-2">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-ops-teal/15 text-ops-teal flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>

                </div>

                <div className="mt-5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ops-teal"
                      style={{
                        width: `${Math.min(
                          Math.max(asset.efficiency_pct, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RUNTIME */}
            {asset.runtime_hours != null && (
              <div className="rounded-[20px] bg-ops-card/90 border border-white/[0.08] p-4 ring-1 ring-white/5">

                <div className="flex items-start justify-between">

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
                        Runtime
                      </p>
                      <SourceBadge source={asset.telemetry_source} size="xs" origin="Seeded asset simulation" variant="dark" />
                    </div>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-white tabular-nums">
                        {asset.runtime_hours.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-ops-text-2">
                        h
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-ops-violet/15 text-ops-violet flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>

                </div>

                <p className="mt-5 text-[9px] font-semibold uppercase tracking-wider text-ops-text-3">
                  Total operating time
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ===================================================
            OPERATIONAL CONDITION
        =================================================== */}

        <div className="mt-6">

          <div
            className={`relative overflow-hidden rounded-[22px] border ${status.border} ${status.bg} p-5`}
          >

            <div
              className="absolute left-0 top-0 bottom-0 w-1.5"
              style={{ backgroundColor: status.accent }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">

              <div className="flex items-start gap-3">

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: status.soft,
                    color: status.accent,
                  }}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <div>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-[0.16em] ${status.text}`}
                  >
                    Operational Condition
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-white leading-5">
                    {asset.operational_status}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] uppercase tracking-wider font-bold text-ops-text-3">
                  Status
                </span>

                <span
                  className={`w-2 h-2 rounded-full ${status.dot}`}
                />
              </div>

            </div>
          </div>
        </div>

        {/* ===================================================
            TECHNICAL ATTRIBUTES
        =================================================== */}

        {asset.specs && asset.specs.length > 0 && (
          <div className="mt-6">

            <div className="flex items-end justify-between mb-3">

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ops-text-3">
                  Engineering Data
                </p>

                <h3 className="text-sm font-bold text-ops-text mt-0.5">
                  Technical Attributes
                </h3>
              </div>

              <span className="hidden sm:block text-[9px] uppercase tracking-wider font-semibold text-ops-text-3">
                {asset.specs.length} parameters
              </span>

            </div>

            <div className="rounded-[22px] border border-white/[0.08] overflow-hidden bg-ops-card/60 ring-1 ring-white/5">

              <div className="grid grid-cols-1 sm:grid-cols-2">

                {asset.specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`
                      group flex items-center justify-between gap-5 px-4 py-3.5
                      border-white/[0.08]
                      hover:bg-white/5
                      transition-colors
                      ${
                        i % 2 === 0
                          ? "sm:border-r"
                          : ""
                      }
                      ${
                        i < asset.specs.length - 2
                          ? "border-b"
                          : ""
                      }
                    `}
                  >

                    <div className="flex items-center gap-2.5 min-w-0">

                      <span className="w-1.5 h-1.5 rounded-full bg-ops-teal/60 shrink-0" />

                      <span className="text-xs text-ops-text-2 font-medium truncate">
                        {spec.label}
                      </span>

                    </div>

                    <span className="text-xs text-ops-text font-bold text-right shrink-0">
                      {spec.value}
                    </span>

                  </div>
                ))}

              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2">

          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-ops-text-3">

            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-ops-card border border-white/10 text-ops-teal">
              <Clock className="w-3 h-3 text-ops-teal" />
            </span>

            Last Field Inspection

          </div>

          <span className="text-xs font-bold text-ops-text">
            {asset.last_inspected}
          </span>

        </div>

      </div>
    </div>
  );
};