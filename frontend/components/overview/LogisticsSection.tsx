"use client";

import React from "react";
import { StationCurrent } from "@/lib/types";
import { MetricCard } from "../shared/MetricCard";
import { Package, Truck, HeartPulse, ShieldCheck } from "lucide-react";
import { SourceBadge } from "../shared/SourceBadge";

interface LogisticsSectionProps {
  logistics: StationCurrent["logistics"];
}

export const LogisticsSection: React.FC<LogisticsSectionProps> = ({
  logistics,
}) => {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#DCD8E7] bg-gradient-to-br from-[#F6F4FA] via-[#F3F5F8] to-[#EEF3F5] p-5 lg:p-7 shadow-[0_7px_26px_rgba(70,65,90,0.06)]">

      {/* Decorative background glows */}
      <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-[#B9ADD5]/15 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-24 left-1/3 w-60 h-60 rounded-full bg-[#9EC5D5]/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DDD9E5]">

        <div className="flex items-center gap-3">

          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#E5DFF0] text-[#70639A]">
            <Package className="w-5 h-5 stroke-[1.8]" />
          </div>

          <div>
            <h3 className="text-base font-bold tracking-tight text-[#344955]">
              Logistics & Autonomous Reserves
            </h3>

            <p className="text-[11px] text-[#78858D] mt-0.5">
              Supplies, fuel autonomy & critical inventory
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E9E4F2] border border-[#DDD6EA]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#75689C]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70658D]">
              Survival Horizon
            </span>
          </div>

        </div>
      </div>

      {/* Reserve indicator */}
      <div className="relative flex items-center gap-3 mt-5 mb-4">

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#75689C]" />

          <span className="text-[10px] uppercase tracking-wider font-bold text-[#766D87]">
            Autonomous Reserves
          </span>
        </div>

        <div className="flex-1 h-px bg-gradient-to-r from-[#C8BEDB] via-[#D8DDE0] to-[#A9C7D2]" />

        <span className="text-[10px] font-semibold text-[#879299]">
          Station continuity
        </span>

      </div>

      {/* Logistics cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* FOOD */}
        <MetricCard
          label="Food Rations Reserve"
          value={logistics.food_days_remaining.value}
          unit="days"
          source={logistics.food_days_remaining.source}
          icon={<Package className="w-4 h-4 stroke-[1.8]" />}
          className="!bg-gradient-to-br !from-[#EAE3F3] !via-[#F0EBF5] !to-[#E5DFEF] !border-[#DCD3E8]"
        />

        {/* DIESEL */}
        <MetricCard
          label="Diesel Autonomy"
          value={logistics.diesel_days_remaining.value}
          unit="days"
          source={logistics.diesel_days_remaining.source}
          icon={<Truck className="w-4 h-4 stroke-[1.8]" />}
          className="!bg-gradient-to-br !from-[#DDEEF3] !via-[#E7F2F5] !to-[#D9E9EF] !border-[#C9DEE5]"
        />

        {/* MEDICAL */}
        <div className="relative flex flex-col justify-between min-w-0 p-5 rounded-2xl bg-gradient-to-br from-[#F6E5E9] via-[#F9ECEF] to-[#F2E1E6] border border-[#E8D2D9] shadow-[0_4px_14px_rgba(100,70,80,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(100,70,80,0.08)]">

          {/* Top */}
          <div className="flex items-start justify-between gap-3 mb-4">

            <div className="flex items-start gap-2.5 min-w-0">

              <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-xl bg-[#EFD6DD] text-[#B05F72]">
                <HeartPulse className="w-4 h-4 stroke-[1.8]" />
              </div>

              <div className="min-w-0">
                <span className="block text-[11px] font-semibold tracking-wider uppercase leading-4 text-[#765A63]">
                  Medical & Critical Spares
                </span>

                <span className="block text-[10px] text-[#9A7D85] mt-1">
                  Emergency inventory status
                </span>
              </div>

            </div>

            <span className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-full bg-[#E2F1E9] border border-[#CFE5D8] text-[10px] font-semibold text-[#4D8066] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F9A76]" />
              Stable
            </span>

          </div>

          {/* Status */}
          <div className="flex items-end gap-2 my-2">

            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#A95568]">
              Nominal
            </span>

            <span className="text-xs font-medium text-[#806A71] pb-1">
              Tier 1 Buffer
            </span>

          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E8D5DB]">

            <span className="text-[10px] font-medium text-[#987B83]">
              Critical inventory
            </span>

            <SourceBadge source="derived" />

          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-[#DDD9E5]">

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#E5DFF0]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#75689C]" />
          </div>

          <span className="text-[10px] font-semibold text-[#7D858B]">
            Reserve monitoring active
          </span>
        </div>

        <span className="text-[10px] font-medium text-[#969CA1]">
          Food • Fuel • Medical
        </span>

      </div>

    </section>
  );
};