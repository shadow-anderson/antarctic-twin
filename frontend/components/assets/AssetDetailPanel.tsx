"use client";

import React from "react";
import { AssetDetail } from "@/lib/types";
import { SourceBadge } from "../shared/SourceBadge";
import {
  Cpu,
  Clock,
  Thermometer,
  Zap,
  Gauge,
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
      <div className="relative w-full min-h-[520px] overflow-hidden rounded-[28px] border border-[#D8E3E5] bg-[#F7FAFA] flex items-center justify-center">
        {/* Decorative background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#DCEEEF] opacity-50 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#E9E4F1] opacity-50 blur-3xl" />

        <div className="relative text-center max-w-sm px-8">
          <div className="mx-auto w-20 h-20 rounded-[24px] bg-[#E5EFF0] border border-[#D1E0E2] flex items-center justify-center text-[#4E7C87] shadow-sm">
            <Cpu className="w-9 h-9 stroke-[1.5]" />
          </div>

          <div className="mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E9F1F2] border border-[#D7E5E7] text-[9px] font-bold uppercase tracking-[0.16em] text-[#66818A]">
              <CircleDot className="w-3 h-3" />
              Asset Intelligence
            </div>

            <h3 className="mt-4 text-xl font-bold tracking-tight text-[#334E59]">
              No Asset Selected
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#7B8D94]">
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
          text: "text-[#A65050]",
          bg: "bg-[#F8E7E7]",
          border: "border-[#E8C7C7]",
          dot: "bg-[#B65C5C]",
          accent: "#B65C5C",
          soft: "#F2DADA",
        };

      case "warning":
        return {
          label: "Warning",
          text: "text-[#936C2B]",
          bg: "bg-[#F6ECD9]",
          border: "border-[#E5D2AA]",
          dot: "bg-[#B98232]",
          accent: "#B98232",
          soft: "#EFE0BD",
        };

      case "healthy":
      default:
        return {
          label: "Healthy",
          text: "text-[#4D7C65]",
          bg: "bg-[#E5F0EA]",
          border: "border-[#C9DED3]",
          dot: "bg-[#4F8A6B]",
          accent: "#4F8A6B",
          soft: "#D9E9DF",
        };
    }
  };

  const status = getStatus();

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-[#D7E2E4] bg-[#F8FAFA] shadow-[0_12px_40px_rgba(42,67,77,0.06)]">

      {/* =====================================================
          TOP DECORATIVE BAND
      ===================================================== */}

      <div className="h-1.5 w-full bg-gradient-to-r from-[#5E8D97] via-[#7CA5AC] to-[#A89ABF]" />

      <div className="p-5 sm:p-7">

        {/* ===================================================
            ASSET IDENTITY HEADER
        =================================================== */}

        <div className="relative overflow-hidden rounded-[24px] bg-[#EDF4F4] border border-[#D6E4E6] p-5 sm:p-6">

          {/* decorative circles */}
          <div className="absolute -right-16 -top-20 w-48 h-48 rounded-full border-[28px] border-[#DCEBED] opacity-70" />
          <div className="absolute right-10 -bottom-20 w-32 h-32 rounded-full border-[18px] border-[#E3ECEE] opacity-70" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Identity */}
            <div className="flex items-start gap-4 min-w-0">

              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-[20px] bg-[#DCEBED] border border-[#C9DDE0] flex items-center justify-center text-[#4E7C87]">
                  <Cpu className="w-8 h-8 stroke-[1.5]" />
                </div>

                <span
                  className={`absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full border-[3px] border-[#EDF4F4] ${status.dot}`}
                />
              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2 mb-2">

                  <span className="px-2.5 py-1 rounded-md bg-[#DCEBED] text-[#557C86] text-[9px] font-bold uppercase tracking-[0.14em]">
                    {asset.category}
                  </span>

                  <span className="text-[10px] text-[#82949A] font-medium">
                    Asset ID · {asset.id}
                  </span>

                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#314B56] truncate">
                  {asset.name}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-[#758991]">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    Digital Twin Connected
                  </span>

                  <span className="hidden sm:block w-1 h-1 rounded-full bg-[#A9B8BC]" />

                  <span>
                    Live asset telemetry
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="relative shrink-0 flex flex-col items-start lg:items-end gap-2">

              <span className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#8A9BA0]">
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

              <SourceBadge source={asset.telemetry_source} />

            </div>
          </div>
        </div>

        {/* ===================================================
            HERO SYSTEM HEALTH
        =================================================== */}

        <div className="mt-6">

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#82949A]">
                Live Instrumentation
              </p>
              <h3 className="text-sm font-bold text-[#425B64] mt-0.5">
                System Health &amp; Telemetry
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-[#5B847D]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B8A70] animate-pulse" />
              Live
            </div>
          </div>

          {/* Hero health card */}
          <div
            className="relative overflow-hidden rounded-[20px] p-5 mb-4"
            style={{
              background: `linear-gradient(135deg, ${status.soft} 0%, #F4F9F9 100%)`,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: status.accent + "55",
            }}
          >
            {/* Accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: status.accent }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pl-3">

              {/* Big number */}
              <div className="shrink-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#72888D] mb-1">System Health</p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-6xl font-bold tabular-nums leading-none"
                    style={{ color: status.accent }}
                  >
                    {asset.health_pct}
                  </span>
                  <span className="text-base font-semibold text-[#789087]">%</span>
                </div>
              </div>

              {/* Bar + Operational status */}
              <div className="flex-1 min-w-0">
                {/* Thick health bar */}
                <div className="h-3 rounded-full bg-white/60 overflow-hidden mb-3 border border-white/40 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.max(asset.health_pct, 0), 100)}%`,
                      backgroundColor: status.accent,
                    }}
                  />
                </div>

                {/* Operational status inline */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${status.bg} ${status.border} ${status.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                  <span className="text-xs text-[#617880] leading-5">{asset.operational_status}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Compact telemetry table */}
          {(asset.temperature_c != null ||
            asset.vibration_mms != null ||
            asset.efficiency_pct != null ||
            asset.runtime_hours != null) && (
            <div className="rounded-[18px] border border-[#D9E3E5] overflow-hidden bg-[#F1F5F5]">

              <div className="px-4 py-2.5 border-b border-[#D9E3E5] flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#82949A]">
                  Sensor Readings
                </span>
                <SourceBadge source={asset.telemetry_source} />
              </div>

              <div className="divide-y divide-[#DDE6E8]">

                {asset.temperature_c != null && (
                  <div className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#EBF1F2] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Thermometer className="w-3.5 h-3.5 text-[#6FA8C7] shrink-0" />
                      <span className="text-xs text-[#73858B] font-medium">Temperature</span>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="text-sm font-bold text-[#405B65] tabular-nums">{asset.temperature_c}</span>
                      <span className="text-[10px] text-[#7D9095]">°C</span>
                    </div>
                  </div>
                )}

                {asset.vibration_mms != null && (
                  <div className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#EBF1F2] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Gauge className="w-3.5 h-3.5 text-[#D9A441] shrink-0" />
                      <span className="text-xs text-[#73858B] font-medium">Vibration</span>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="text-sm font-bold text-[#405B65] tabular-nums">{asset.vibration_mms}</span>
                      <span className="text-[10px] text-[#7D9095]">mm/s</span>
                    </div>
                  </div>
                )}

                {asset.efficiency_pct != null && (
                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#EBF1F2] transition-colors">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <Zap className="w-3.5 h-3.5 text-[#4FB58A] shrink-0" />
                      <span className="text-xs text-[#73858B] font-medium">Efficiency</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Real data bar — efficiency is a genuine 0-100% */}
                      <div className="flex-1 h-1.5 rounded-full bg-[#D8E3E5] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#4FB58A]"
                          style={{ width: `${Math.min(Math.max(asset.efficiency_pct, 0), 100)}%` }}
                        />
                      </div>
                      <div className="flex items-baseline gap-0.5 shrink-0">
                        <span className="text-sm font-bold text-[#405B65] tabular-nums">{asset.efficiency_pct}</span>
                        <span className="text-[10px] text-[#7D9095]">%</span>
                      </div>
                    </div>
                  </div>
                )}

                {asset.runtime_hours != null && (
                  <div className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#EBF1F2] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-[#8F86B8] shrink-0" />
                      <span className="text-xs text-[#73858B] font-medium">Runtime Hours</span>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="text-sm font-bold text-[#405B65] tabular-nums">{asset.runtime_hours.toLocaleString()}</span>
                      <span className="text-[10px] text-[#7D9095]">h</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

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

                  <p className="mt-1.5 text-sm font-semibold text-[#465D65] leading-5">
                    {asset.operational_status}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#8A999E]">
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
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#84959A]">
                  Engineering Data
                </p>

                <h3 className="text-sm font-bold text-[#425B64] mt-0.5">
                  Technical Attributes
                </h3>
              </div>

              <span className="hidden sm:block text-[9px] uppercase tracking-wider font-semibold text-[#9AA7AA]">
                {asset.specs.length} parameters
              </span>

            </div>

            <div className="rounded-[22px] border border-[#D9E3E5] overflow-hidden bg-[#F1F5F5]">

              <div className="grid grid-cols-1 sm:grid-cols-2">

                {asset.specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`
                      group flex items-center justify-between gap-5 px-4 py-3.5
                      border-[#DCE5E6]
                      hover:bg-[#E9F0F1]
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

                      <span className="w-1.5 h-1.5 rounded-full bg-[#89A8AF] shrink-0" />

                      <span className="text-xs text-[#73858B] font-medium truncate">
                        {spec.label}
                      </span>

                    </div>

                    <span className="text-xs text-[#425A62] font-bold text-right shrink-0">
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

        <div className="mt-6 pt-4 border-t border-[#DDE6E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">

          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#84959B]">

            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#E6EEF0]">
              <Clock className="w-3 h-3 text-[#64828A]" />
            </span>

            Last Field Inspection

          </div>

          <span className="text-xs font-bold text-[#536B73]">
            {asset.last_inspected}
          </span>

        </div>

      </div>
    </div>
  );
};