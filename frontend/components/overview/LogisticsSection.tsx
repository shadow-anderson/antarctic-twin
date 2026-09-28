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
    <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-ops-panel p-5 lg:p-7 shadow-[0_7px_26px_rgba(0,0,0,0.3)] ring-1 ring-white/5">
      {/* Thin accent top line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-ops-violet via-ops-ice to-ops-teal" />

      {/* Decorative background glows - toned down */}
      <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-ops-violet/5 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-24 left-1/3 w-60 h-60 rounded-full bg-ops-ice/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">

        <div className="flex items-center gap-3">

          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-ops-card border border-white/10 text-ops-violet shadow-inner">
            <Package className="w-5 h-5 stroke-[1.8]" />
          </div>

          <div>
            <h3 className="text-base font-bold tracking-tight text-ops-text">
              Logistics & Autonomous Reserves
            </h3>

            <p className="text-[11px] text-ops-text-3 mt-0.5">
              Supplies, fuel autonomy & critical inventory
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ops-card border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-ops-violet" />

            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ops-text-2">
              Survival Horizon
            </span>
          </div>

        </div>
      </div>

      {/* Reserve indicator */}
      <div className="relative flex items-center gap-3 mt-5 mb-4">

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ops-violet" />

          <span className="text-[10px] uppercase tracking-wider font-bold text-ops-violet">
            Autonomous Reserves
          </span>
        </div>

        <div className="flex-1 h-px bg-gradient-to-r from-ops-violet/40 via-white/10 to-ops-teal/40" />

        <span className="text-[10px] font-semibold text-ops-text-3">
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
          variant="compact"
          tone="lavender"
        />

        {/* DIESEL */}
        <MetricCard
          label="Diesel Autonomy"
          value={logistics.diesel_days_remaining.value}
          unit="days"
          source={logistics.diesel_days_remaining.source}
          icon={<Truck className="w-4 h-4 stroke-[1.8]" />}
          variant="compact"
          tone="ice"
        />

        {/* MEDICAL */}
        <div className="relative flex flex-col justify-between min-w-0 p-5 rounded-2xl bg-ops-card/90 backdrop-blur-sm border border-white/[0.08] ring-1 ring-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-1 hover:border-white/20 overflow-hidden">
          {/* Top tone gradient */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#D4706F]/[0.12] to-transparent pointer-events-none" />

          {/* Top */}
          <div className="relative flex items-start justify-between gap-3 mb-4">

            <div className="flex items-start gap-2.5 min-w-0">

              <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-xl bg-[#D4706F]/15 border border-[#D4706F]/30 text-[#D4706F]">
                <HeartPulse className="w-4 h-4 stroke-[1.8]" />
              </div>

              <div className="min-w-0">
                <span className="block text-[11px] font-semibold tracking-wider uppercase leading-4 text-ops-text-2">
                  Medical & Critical Spares
                </span>

                <span className="block text-[10px] text-ops-text-3 mt-1">
                  Emergency inventory status
                </span>
              </div>

            </div>

            <span className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-full bg-ops-green/15 border border-ops-green/30 text-[10px] font-semibold text-ops-green whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-ops-green" />
              Stable
            </span>

          </div>

          {/* Status */}
          <div className="relative flex items-end gap-2 my-2">

            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Nominal
            </span>

            <span className="text-xs font-medium text-ops-text-2 pb-1">
              Tier 1 Buffer
            </span>

          </div>

          {/* Bottom */}
          <div className="relative flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/[0.08]">

            <span className="text-[10px] font-medium text-ops-text-3">
              Critical inventory
            </span>

            <SourceBadge source="derived" variant="dark" />

          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.08]">

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-ops-card border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-ops-violet" />
          </div>

          <span className="text-[10px] font-semibold text-ops-text-2">
            Reserve monitoring active
          </span>
        </div>

        <span className="text-[10px] font-medium text-ops-text-3">
          Food • Fuel • Medical
        </span>

      </div>

    </section>
  );
};