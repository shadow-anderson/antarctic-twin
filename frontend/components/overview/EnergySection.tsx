"use client";

import React from "react";
import { StationCurrent } from "@/lib/types";
import { MetricCard } from "../shared/MetricCard";
import { Zap, Activity, Fuel, BatteryCharging } from "lucide-react";

interface EnergySectionProps {
  energy: StationCurrent["energy"];
}

export const EnergySection: React.FC<EnergySectionProps> = ({ energy }) => {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-ops-panel p-5 lg:p-7 shadow-[0_7px_26px_rgba(0,0,0,0.3)] ring-1 ring-white/5">
      {/* Thin accent top line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-ops-amber via-ops-teal to-ops-green" />

      {/* Decorative energy glow - toned down */}
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-ops-amber/5 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-24 left-1/3 w-56 h-56 rounded-full bg-ops-green/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">

        <div className="flex items-center gap-3">

          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-ops-card border border-white/10 text-ops-amber shadow-inner">
            <Zap className="w-5 h-5 stroke-[1.8]" />

            <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-ops-amber border-2 border-ops-panel" />
          </div>

          <div>
            <h3 className="text-base font-bold tracking-tight text-ops-text">
              Power Microgrid & Energy Generation
            </h3>

            <p className="text-[11px] text-ops-text-3 mt-0.5">
              Station power, consumption & reserve telemetry
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ops-card border border-white/10">
            <BatteryCharging className="w-3.5 h-3.5 text-ops-amber" />

            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ops-text-2">
              Microgrid
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ops-green/15 border border-ops-green/30">
            <span className="w-1.5 h-1.5 rounded-full bg-ops-green" />

            <span className="text-[10px] font-semibold text-ops-green">
              Operational
            </span>
          </div>

        </div>

      </div>

      {/* Energy flow strip */}
      <div className="relative flex items-center gap-2 mt-5 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ops-amber" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-ops-amber">
            Generation
          </span>
        </div>

        <div className="flex-1 h-px bg-gradient-to-r from-ops-amber/40 via-white/10 to-ops-teal/40" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-ops-teal">
            Station Load
          </span>
          <span className="w-2 h-2 rounded-full bg-ops-teal" />
        </div>
      </div>

      {/* Energy cards — compact, denser grid */}
      <div className="relative grid grid-cols-2 md:grid-cols-3 gap-3">

        <MetricCard
          label="Power Generation"
          value={energy.generation_kw.value}
          unit="kW"
          source={energy.generation_kw.source}
          icon={<Zap className="w-4 h-4 stroke-[1.8]" />}
          tone="amber"
          variant="compact"
        />

        <MetricCard
          label="Consumption"
          value={energy.consumption_kw.value}
          unit="kW"
          source={energy.consumption_kw.source}
          icon={<Activity className="w-4 h-4 stroke-[1.8]" />}
          tone="teal"
          variant="compact"
        />

        <MetricCard
          label="Diesel Level"
          value={energy.diesel_pct.value}
          unit="%"
          source={energy.diesel_pct.source}
          icon={<Fuel className="w-4 h-4 stroke-[1.8]" />}
          tone="mint"
          variant="compact"
        />

      </div>

      {/* Bottom status strip */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.08]">

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-ops-card border border-white/10">
            <Zap className="w-3.5 h-3.5 text-ops-amber" />
          </div>

          <span className="text-[10px] font-semibold text-ops-text-2">
            Microgrid telemetry active
          </span>
        </div>

        <span className="text-[10px] font-medium text-ops-text-3">
          Generation → Load → Reserve
        </span>

      </div>
    </section>
  );
};