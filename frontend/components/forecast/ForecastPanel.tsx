"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useStation } from "@/context/StationContext";
import { StationForecast } from "@/lib/types";
import { getStationForecast } from "@/lib/api";
import { MOCK_FORECASTS } from "@/lib/mockData";
import { ResourceForecastCard } from "./ResourceForecastCard";
import {
  TrendingDown,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Radio,
  Clock,
  RefreshCw,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

export const ForecastPanel: React.FC = () => {
  const { selectedStation } = useStation();

  const [forecast, setForecast] = useState<StationForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getStationForecast(selectedStation);
      setForecast(data);
      setIsUsingFallback(false);
    } catch (err) {
      console.warn("Forecast fetch failed, attempting mock fallback:", err);
      const fallback = MOCK_FORECASTS[selectedStation];
      if (fallback) {
        setForecast(fallback);
        setIsUsingFallback(true);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load station forecast"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedStation]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const stationDisplayName =
    selectedStation === "maitri" ? "Maitri" : "Bharati";

  return (
    <div className="space-y-7 pb-8">
      {/* =========================================================
          HERO / FORECAST HORIZON HEADER
      ========================================================= */}
      <section className="relative overflow-hidden rounded-[30px] border border-[#C9DDE0] bg-gradient-to-br from-[#EAF4F5] via-[#F4F7F5] to-[#F4EEE3] shadow-[0_10px_35px_rgba(47,76,84,0.08)]">
        {/* Subtle blur circles */}
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-[#B9DDE0]/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-28 w-80 h-80 rounded-full bg-[#E8D5B5]/25 blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8 lg:p-9">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCEDEF] border border-[#C0DADD] text-[#3D6E77] text-[10px] font-bold uppercase tracking-[0.16em]">
                <TrendingDown className="w-3.5 h-3.5" />
                Depletion Horizon Analysis
              </span>

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5EBD9] border border-[#E5D3AF] text-[#8A6A32] text-[10px] font-bold uppercase tracking-[0.12em]">
                <Radio className="w-3 h-3" />
                {stationDisplayName} Station
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#73848A]">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#4F8A6B] opacity-40 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
              </span>
              30-Day Predictive Model
            </div>
          </div>

          {/* Title & description */}
          <div className="max-w-3xl">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex shrink-0 items-center justify-center w-14 h-14 rounded-2xl bg-[#17364A] text-white shadow-[0_7px_18px_rgba(23,54,74,0.18)]">
                <CalendarDays className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-[-0.03em] text-[#17364A] leading-tight">
                  Resource Autonomy & Depletion
                </h1>
                <p className="mt-2 max-w-2xl text-sm sm:text-[15px] leading-6 text-[#586F78]">
                  Continuous daily linear projection for mission-critical fuel and food supplies. Evaluates days remaining against standard 15-day warning and 7-day emergency critical thresholds.
                </p>
              </div>
            </div>
          </div>

          {/* Quick status bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#D5E3E6]/80 text-xs text-[#637780]">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0E7C86]" />
                Forecast Window: <strong className="text-[#17364A]">Day 0 to Day 30</strong>
              </span>
              <span className="hidden md:flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2F855A]" />
                Thresholds: <strong className="text-[#17364A]">Warning 15d · Critical 7d</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={fetchForecast}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-[#CDDDE0] text-[#3D5560] text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Fallback Notice Banner */}
      {isUsingFallback && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFF8EB] border border-[#F6DEB5] text-[#9A641A] text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
          <span>
            Operating in offline mode — displaying calibrated local reference projections for {stationDisplayName}.
          </span>
        </div>
      )}

      {/* =========================================================
          CONTENT AREA: LOADING / ERROR / FORECAST CARDS
      ========================================================= */}
      {loading && !forecast ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-[28px] border border-[#D5E1E3] bg-[#F8FAFA] shadow-[0_4px_20px_rgba(23,54,74,0.04)]">
          <Loader2 className="w-8 h-8 text-[#0E7C86] animate-spin mb-3" />
          <p className="text-sm font-semibold text-[#4A636E]">
            Generating depletion forecast models for {stationDisplayName}...
          </p>
        </div>
      ) : error && !forecast ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-[28px] border border-[#F5C7C7] bg-[#FEF2F2] shadow-sm text-center">
          <AlertCircle className="w-9 h-9 text-[#DC2626] mb-2" />
          <h3 className="text-base font-bold text-[#991B1B]">
            Unable to Load Depletion Forecast
          </h3>
          <p className="text-xs text-[#7F1D1D] mt-1 max-w-md">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchForecast}
            className="mt-4 px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-semibold hover:bg-[#B91C1C] transition-colors"
          >
            Retry Request
          </button>
        </div>
      ) : forecast ? (
        <div className="space-y-6">

          {/* =========================================================
              HERO: TIME TO THRESHOLD STRIP
          ========================================================= */}
          {(() => {
            // Find the nearest threshold crossing across diesel and food
            const allCrossings: Array<{
              resource: string;
              label: string;
              day: number;
              type: "warning" | "critical";
            }> = [];

            for (const resourceKey of ["diesel", "food"] as const) {
              for (const crossing of forecast[resourceKey].threshold_crossings) {
                if (crossing.projected_day !== null) {
                  allCrossings.push({
                    resource: resourceKey === "diesel" ? "Diesel" : "Food",
                    label: crossing.threshold_label,
                    day: crossing.projected_day,
                    type: crossing.threshold_label as "warning" | "critical",
                  });
                }
              }
            }

            // Sort ascending — nearest first
            allCrossings.sort((a, b) => a.day - b.day);
            const nearest = allCrossings[0] ?? null;

            if (!nearest) {
              // Stable — no threshold crossing
              return (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 rounded-[24px] border border-[#BFD8CC] bg-gradient-to-br from-[#E8F5EE] to-[#F3FAF5] shadow-[0_4px_16px_rgba(79,138,107,0.10)]">
                  <div className="flex items-center justify-center w-14 h-14 shrink-0 rounded-[18px] bg-[#D5EBDF] border border-[#BDD8CA] text-[#4F8A6B] shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6A9B82] mb-1">Threshold Status</div>
                    <p className="text-xl font-bold text-[#2F6A50] tracking-tight">
                      Stable — no threshold crossing in 30 days
                    </p>
                    <p className="text-xs text-[#6A9B82] mt-1">Both diesel and food reserves remain above warning levels throughout the forecast window.</p>
                  </div>
                </div>
              );
            }

            const isCritical = nearest.type === "critical";
            const colors = isCritical
              ? { bg: "from-[#FEF2F2] to-[#FDF5F5]", border: "border-[#F8C5C5]", iconBg: "bg-[#FCDCDC] border-[#F8C5C5] text-[#B65C5C]", numColor: "text-[#B65C5C]", labelBg: "bg-[#B65C5C]/15 border-[#B65C5C]/30 text-[#C07070]", dot: "bg-[#B65C5C]", glow: "rgba(182,92,92,0.12)" }
              : { bg: "from-[#FEF9EE] to-[#FFF8F0]", border: "border-[#F0D99A]", iconBg: "bg-[#FDEDC7] border-[#F0D99A] text-[#B98232]", numColor: "text-[#B98232]", labelBg: "bg-[#B98232]/15 border-[#B98232]/30 text-[#C09050]", dot: "bg-[#B98232]", glow: "rgba(185,130,50,0.12)" };

            return (
              <div
                style={{ boxShadow: `0 4px 20px ${colors.glow}` }}
                className={`flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-6 rounded-[24px] border ${colors.border} bg-gradient-to-br ${colors.bg}`}
              >
                {/* Icon */}
                <div className={`flex items-center justify-center w-14 h-14 shrink-0 rounded-[18px] border ${colors.iconBg} shadow-sm`}>
                  {isCritical
                    ? <AlertCircle className="w-7 h-7" />
                    : <AlertTriangle className="w-7 h-7" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A8070] mb-1">Time to Threshold</div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-5xl sm:text-6xl font-bold tabular-nums leading-none ${colors.numColor}`}>
                      {nearest.day}
                    </span>
                    <span className="text-sm font-semibold text-[#7A7060] mb-0.5">days</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${colors.labelBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {nearest.resource} reaches {nearest.label.toUpperCase()} threshold
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ResourceForecastCard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            <ResourceForecastCard forecast={forecast.diesel} />
            <ResourceForecastCard forecast={forecast.food} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
