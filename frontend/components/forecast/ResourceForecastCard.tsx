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
  const lineColor = isDiesel ? "#2FA3A8" : "#4FB58A";

  // Status badge styling mirroring SourceBadge aesthetic - dark variants
  const statusConfigs = {
    nominal: {
      label: "Nominal",
      textColor: "text-ops-green",
      bgColor: "bg-ops-green/15",
      borderColor: "border-ops-green/30",
      dotColor: "bg-ops-green",
      icon: CheckCircle2,
    },
    warning: {
      label: "Warning",
      textColor: "text-ops-amber",
      bgColor: "bg-ops-amber/15",
      borderColor: "border-ops-amber/30",
      dotColor: "bg-ops-amber",
      icon: AlertTriangle,
    },
    critical: {
      label: "Critical",
      textColor: "text-ops-red",
      bgColor: "bg-ops-red/15",
      borderColor: "border-ops-red/30",
      dotColor: "bg-ops-red",
      icon: AlertCircle,
    },
  };

  const statusConfig =
    statusConfigs[forecast.status] || statusConfigs.nominal;

  return (
    <div className="flex flex-col justify-between p-6 sm:p-7 rounded-[26px] bg-ops-panel border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-1 ring-white/5 space-y-6">
      {/* =========================================================
          CARD HEADER
      ========================================================= */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${
              isDiesel
                ? "bg-ops-card text-ops-teal border border-white/10"
                : "bg-ops-card text-ops-green border border-white/10"
            }`}
          >
            <ResourceIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3">
              Resource Depletion
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
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
      <div className="flex flex-wrap items-end justify-between gap-3 p-4 rounded-2xl bg-ops-card/80 border border-white/10 ring-1 ring-white/5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ops-text-3 block">
            Current Autonomous Reserve
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
              {forecast.current_days_remaining.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-ops-text-2">
              days remaining
            </span>
          </div>
        </div>

        {/* Elevated burn rate warning if > 1.0 */}
        {forecast.burn_rate_multiplier > 1.0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ops-amber/20 border border-ops-amber/30 text-ops-amber text-xs font-semibold">
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
          <span className="font-bold text-ops-text flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-ops-teal" />
            30-Day Autonomy Projection
          </span>
          <span className="text-[11px] text-ops-text-3">
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
                  stroke="rgba(255,255,255,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.15)"
                  tick={{ fill: "#9DB2BC", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickFormatter={(val) => `D${val}`}
                  interval={4}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.15)"
                  tick={{ fill: "#9DB2BC", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  domain={[0, "auto"]}
                  unit="d"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-white/10 bg-ops-card/95 p-3 shadow-xl backdrop-blur-md text-xs">
                          <div className="font-bold text-white">
                            Day {data.day}
                          </div>
                          <div className="mt-1 font-semibold text-ops-teal">
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
                  stroke="#D9A441"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Warning (15d)",
                    position: "insideTopRight",
                    fill: "#D9A441",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />

                {/* Reference Line for Critical (7 days) */}
                <ReferenceLine
                  y={7}
                  stroke="#D4706F"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Critical (7d)",
                    position: "insideTopRight",
                    fill: "#D4706F",
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
                    stroke: "#0D2130",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-ops-card/40 rounded-2xl text-xs text-ops-text-3">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          THRESHOLD CROSSINGS SUMMARY
      ========================================================= */}
      <div className="pt-3 border-t border-white/[0.08] space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3 block">
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
                      ? "bg-ops-amber/15 border-ops-amber/30 text-ops-amber"
                      : "bg-ops-red/15 border-ops-red/30 text-ops-red"
                    : "bg-ops-card/60 border-white/[0.08] text-ops-text-2 ring-1 ring-white/5"
                }`}
              >
                {crosses ? (
                  isWarning ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-ops-amber mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-ops-red mt-0.5" />
                  )
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-ops-green mt-0.5" />
                )}

                <div>
                  <span className="font-semibold block capitalize text-white">
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
