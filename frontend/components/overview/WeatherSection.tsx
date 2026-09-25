"use client";

import React from "react";
import { StationCurrent } from "@/lib/types";
import { MetricCard } from "../shared/MetricCard";
import { Thermometer, Wind, Gauge, CloudSnow } from "lucide-react";

interface WeatherSectionProps {
  weather: StationCurrent["weather"];
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({
  weather,
}) => {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#D5E1E3] bg-gradient-to-br from-[#F3F8F8] via-[#EEF5F6] to-[#E8F0F2] p-5 lg:p-7 shadow-[0_6px_24px_rgba(40,60,70,0.06)]">

      {/* Decorative background shapes */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#A9D1D5]/20 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-[#B9B0D0]/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D3E0E2]">

        <div className="flex items-center gap-3">

          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#D9EAED] text-[#477A91]">
            <CloudSnow className="w-5 h-5 stroke-[1.7]" />
          </div>

          <div>
            <h3 className="text-base font-bold tracking-tight text-[#304955]">
              Atmospheric & Environmental Telemetry
            </h3>

            <p className="text-[11px] text-[#71848D] mt-0.5">
              Current environmental conditions
            </p>
          </div>

        </div>

        <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#E3ECEE] border border-[#D5E1E3] text-[10px] font-bold text-[#66808A] tracking-[0.12em] uppercase">
          Meteorological Sensors
        </span>

      </div>

      {/* Weather cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

        {/* TEMPERATURE */}
        <MetricCard
          label="Temperature"
          value={weather.temperature_c.value}
          unit="°C"
          source={weather.temperature_c.source}
          icon={<Thermometer className="w-4 h-4 stroke-[1.8]" />}
          tone="ice"
          className="!bg-gradient-to-br !from-[#E2F1F5] !via-[#EAF5F6] !to-[#DDECEF]"
        />

        {/* PRESSURE */}
        <MetricCard
          label="Atmospheric Pressure"
          value={weather.pressure_hpa.value}
          unit="hPa"
          source={weather.pressure_hpa.source}
          icon={<Gauge className="w-4 h-4 stroke-[1.8]" />}
          tone="lavender"
          className="!bg-gradient-to-br !from-[#ECE8F3] !via-[#F1EEF5] !to-[#E6E1EF]"
        />

        {/* WIND */}
        <MetricCard
          label="Wind Velocity"
          value={weather.wind_speed_ms.value}
          unit="m/s"
          source={weather.wind_speed_ms.source}
          icon={<Wind className="w-4 h-4 stroke-[1.8]" />}
          tone="mint"
          className="!bg-gradient-to-br !from-[#E3F1E9] !via-[#EAF4ED] !to-[#DCECE3]"
        />

      </div>
    </section>
  );
};