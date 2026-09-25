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
    <section className="relative overflow-hidden rounded-[28px] border border-[#E3D8C5] bg-gradient-to-br from-[#FBF7EE] via-[#F8F3E8] to-[#EEF3ED] p-5 lg:p-7 shadow-[0_7px_26px_rgba(100,80,40,0.07)]">

      {/* Decorative energy glow */}
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#E4B96D]/20 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-24 left-1/3 w-56 h-56 rounded-full bg-[#8BB9A0]/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5DAC7]">

        <div className="flex items-center gap-3">

          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#F0DFC0] text-[#A8752F]">
            <Zap className="w-5 h-5 stroke-[1.8]" />

            <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-[#C58A36] border-2 border-[#FBF7EE]" />
          </div>

          <div>
            <h3 className="text-base font-bold tracking-tight text-[#354650]">
              Power Microgrid & Energy Generation
            </h3>

            <p className="text-[11px] text-[#7C8580] mt-0.5">
              Station power, consumption & reserve telemetry
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0E5D0] border border-[#E3D5BB]">
            <BatteryCharging className="w-3.5 h-3.5 text-[#A47735]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#806B49]">
              Microgrid
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4EFE7] border border-[#D1E1D7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F806A]" />

            <span className="text-[10px] font-semibold text-[#557364]">
              Operational
            </span>
          </div>

        </div>

      </div>

      {/* Energy flow strip */}
      <div className="relative flex items-center gap-2 mt-5 mb-4">

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B98232]" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C795B]">
            Generation
          </span>
        </div>

        <div className="flex-1 h-px bg-gradient-to-r from-[#D8B477] via-[#D6D0BE] to-[#9DBEAB]" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#6F7D76]">
            Station Load
          </span>
          <span className="w-2 h-2 rounded-full bg-[#287C80]" />
        </div>

      </div>

      {/* Energy cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* GENERATION */}
        <MetricCard
          label="Power Generation"
          value={energy.generation_kw.value}
          unit="kW"
          source={energy.generation_kw.source}
          icon={<Zap className="w-4 h-4 stroke-[1.8]" />}
          tone="amber"
          className="!bg-gradient-to-br !from-[#F8EACD] !via-[#FAF0DC] !to-[#F1E3C8] !border-[#E7D5B1]"
        />

        {/* CONSUMPTION */}
        <MetricCard
          label="Power Consumption"
          value={energy.consumption_kw.value}
          unit="kW"
          source={energy.consumption_kw.source}
          icon={<Activity className="w-4 h-4 stroke-[1.8]" />}
          tone="teal"
          className="!bg-gradient-to-br !from-[#DCEDEF] !via-[#E7F2F2] !to-[#D9E9EA] !border-[#C9DDDE]"
        />

        {/* FUEL */}
        <MetricCard
          label="Diesel Fuel Level"
          value={energy.diesel_pct.value}
          unit="%"
          source={energy.diesel_pct.source}
          icon={<Fuel className="w-4 h-4 stroke-[1.8]" />}
          tone="mint"
          className="!bg-gradient-to-br !from-[#DDEDE2] !via-[#E8F2EB] !to-[#D9E9DF] !border-[#C9DDD0]"
        />

      </div>

      {/* Bottom status strip */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-[#E5DAC7]">

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#F0DFC0]">
            <Zap className="w-3.5 h-3.5 text-[#A47735]" />
          </div>

          <span className="text-[10px] font-semibold text-[#7A817B]">
            Microgrid telemetry active
          </span>
        </div>

        <span className="text-[10px] font-medium text-[#96998F]">
          Generation → Load → Reserve
        </span>

      </div>

    </section>
  );
};