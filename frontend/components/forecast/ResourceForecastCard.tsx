"use client";

import React, { useState, useEffect } from "react";
import { ResourceForecast } from "@/lib/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  Fuel,
  Utensils,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Flame,
} from "lucide-react";
import { SectionProvenance } from "../shared/SectionProvenance";

interface ResourceForecastCardProps {
  forecast: ResourceForecast;
}

export const ResourceForecastCard: React.FC<ResourceForecastCardProps> = ({
  forecast,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDiesel = forecast.resource === "diesel";
  const resourceTitle = isDiesel ? "Diesel Reserve" : "Food Supplies";
  const ResourceIcon = isDiesel ? Fuel : Utensils;
  const lineColor = isDiesel ? "#0E7C86" : "#2F855A";

  // Status badge styling mirroring SourceBadge aesthetic
  const statusConfigs = {
    nominal: {
      label: "Nominal",
      textColor: "text-[#39735F]",
      bgColor: "bg-[#E5F0EA]",
      borderColor: "border-[#D2E3DA]",
      dotColor: "bg-[#4F806A]",
      icon: CheckCircle2,
    },
    warning: {
      label: "Warning",
      textColor: "text-[#956E31]",
      bgColor: "bg-[#FDF4E7]",
      borderColor: "border-[#F6DEBC]",
      dotColor: "bg-[#D48222]",
      icon: AlertTriangle,
    },
    critical: {
      label: "Critical",
      textColor: "text-[#C53030]",
      bgColor: "bg-[#FDE8E8]",
      borderColor: "border-[#F8B4B4]",
      dotColor: "bg-[#E53E3E]",
      icon: AlertCircle,
    },
  };

  const statusConfig =
    statusConfigs[forecast.status] || statusConfigs.nominal;

  return (
    <div className="flex flex-col justify-between p-6 sm:p-7 rounded-[26px] bg-white border border-[#D9E3E6] shadow-[0_4px_20px_rgba(23,54,74,0.06)] space-y-6">
      {/* =========================================================
          CARD HEADER
      ========================================================= */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              isDiesel
                ? "bg-[#E4F2F3] text-[#0E7C86] border border-[#CCE4E7]"
                : "bg-[#EAF3EC] text-[#2F855A] border border-[#D2E7D7]"
            }`}
          >
            <ResourceIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A8C93]">
              Resource Depletion
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1C3240] tracking-tight">
              {resourceTitle}
            </h3>
            <div className="mt-1">
              <SectionProvenance
                source="derived"
                origin="Computed from simulated inventory · linear burn model"
              />
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}
            />
            <span>{statusConfig.label}</span>
          </span>
        </div>
      </div>

      {/* =========================================================
          KEY NUMBER & BURN RATE NOTE
      ========================================================= */}
      <div className="flex flex-wrap items-end justify-between gap-3 p-4 rounded-2xl bg-[#F6F9FA] border border-[#E3EBEE]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#677983] block">
            Current Autonomous Reserve
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#17364A] tracking-tight tabular-nums">
              {forecast.current_days_remaining.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-[#5B6D77]">
              days remaining
            </span>
          </div>
        </div>

        {/* Elevated burn rate warning if > 1.0 */}
        {forecast.burn_rate_multiplier > 1.0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF3E6] border border-[#FCD9B8] text-[#B85D19] text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>
              Burn rate elevated ×{forecast.burn_rate_multiplier.toFixed(2)} — accelerated depletion
            </span>
          </div>
        )}
      </div>

      {/* =========================================================
          30-DAY PROJECTION LINE CHART
      ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-[#4B606B] flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-[#0E7C86]" />
            30-Day Autonomy Projection
          </span>
          <span className="text-[11px] text-[#7A8C93]">
            Target: Linear Depletion
          </span>
        </div>

        <div className="w-full h-64 sm:h-72 pt-2">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={forecast.daily_projection}
                margin={{ top: 12, right: 16, left: -14, bottom: 6 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E4ECEE"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#83959D"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#D0DCE0" }}
                  tickFormatter={(val) => `D${val}`}
                  interval={4}
                />
                <YAxis
                  stroke="#83959D"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#D0DCE0" }}
                  domain={[0, "auto"]}
                  unit="d"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-[#CCE0E4] bg-[#FFFFFF]/95 p-3 shadow-lg backdrop-blur-sm text-xs">
                          <div className="font-bold text-[#17364A]">
                            Day {data.day}
                          </div>
                          <div className="mt-1 font-semibold text-[#0E7C86]">
                            {data.days_remaining} days remaining
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Reference Line for Warning (15 days) */}
                <ReferenceLine
                  y={15}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Warning (15d)",
                    position: "insideTopRight",
                    fill: "#B45309",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />

                {/* Reference Line for Critical (7 days) */}
                <ReferenceLine
                  y={7}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Critical (7d)",
                    position: "insideTopRight",
                    fill: "#B91C1C",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="days_remaining"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: lineColor,
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F7FAFA] rounded-2xl text-xs text-[#83959D]">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          THRESHOLD CROSSINGS SUMMARY
      ========================================================= */}
      <div className="pt-3 border-t border-[#E5EEF0] space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#788C93] block">
          Depletion Thresholds
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {forecast.threshold_crossings.map((crossing) => {
            const isWarning = crossing.threshold_label === "warning";
            const crosses = crossing.projected_day !== null;

            return (
              <div
                key={crossing.threshold_label}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${
                  crosses
                    ? isWarning
                      ? "bg-[#FEF9EE] border-[#F6E2B8] text-[#8C5D19]"
                      : "bg-[#FEF2F2] border-[#FBCBCB] text-[#991B1B]"
                    : "bg-[#F7FAFA] border-[#E2EBEE] text-[#556973]"
                }`}
              >
                {crosses ? (
                  isWarning ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
                  )
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A] mt-0.5" />
                )}

                <div>
                  <span className="font-semibold block capitalize">
                    {crossing.threshold_label} Threshold ({crossing.threshold_days.toFixed(0)}d)
                  </span>
                  <span className="text-[11px] opacity-90">
                    {crosses
                      ? `Crosses ${crossing.threshold_label} threshold on day ${crossing.projected_day}`
                      : `Does not cross ${crossing.threshold_label} threshold within 30 days`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
