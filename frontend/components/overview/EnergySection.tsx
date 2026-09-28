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
    <section className="relative overflow-hidden rounded-[28px] border border-[#D5E1E3] bg-gradient-to-br from-[#F3F8F8] via-[#EEF5F6] to-[#E8F0F2] p-5 lg:p-7 shadow-[0_6px_24px_rgba(40,60,70,0.06)]">

      {/* Decorative energy glow */}
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#D9A441]/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-56 h-56 rounded-full bg-[#2FA3A8]/8 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D3E0E2]">

        <div className="flex items-center gap-3">

          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#F2E8CC] border border-[#E8D9A0] text-[#9A7220]">
            <Zap className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-[#D9A441] border-2 border-[#F3F8F8]" />
          </div>

          <div>
            <h3 className="text-base font-bold tracking-tight text-[#304955]">
              Power Microgrid &amp; Energy Generation
            </h3>

            <p className="text-[11px] text-[#71848D] mt-0.5">
              Station power, consumption &amp; reserve telemetry
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8E0C8] border border-[#DDD0AA]">
            <BatteryCharging className="w-3.5 h-3.5 text-[#9A7220]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#806218]">
              Microgrid
            </span>
          </div>
        </div>

      </div>

      {/* Energy flow strip */}
      <div className="relative flex items-center gap-2 mt-5 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D9A441]" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#9A7220]">Generation</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-[#D9A441]/40 via-[#C8D5D7]/40 to-[#2FA3A8]/40" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#2FA3A8]">Station Load</span>
          <span className="w-2 h-2 rounded-full bg-[#2FA3A8]" />
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

    </section>
  );
};