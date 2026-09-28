"use client";

import React from "react";
import { StationCurrent } from "@/lib/types";
import { MetricCard } from "../shared/MetricCard";
import { SectionProvenance } from "../shared/SectionProvenance";
import { Thermometer, Wind, Gauge, CloudSnow } from "lucide-react";

interface WeatherSectionProps {
  weather: StationCurrent["weather"];
  observationTime?: string;
}

function formatObservationTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = d.getUTCDate();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} · ${hours}:${minutes} UTC`;
  } catch {
    return isoString;
  }
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({
  weather,
  observationTime,
}) => {
  const formattedTime = formatObservationTime(observationTime);
  const caption = formattedTime
    ? `Latest archived NCPOR observation · ${formattedTime}`
    : "Latest archived NCPOR observation";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-ops-panel p-5 lg:p-7 shadow-[0_6px_24px_rgba(0,0,0,0.3)] ring-1 ring-white/5">
      {/* Thin accent top line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-ops-teal via-ops-ice to-ops-teal/40" />

      {/* Decorative background shapes - toned down */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-ops-teal/5 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-ops-ice/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">

        <div className="flex items-center gap-3">

          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-ops-card border border-white/10 text-ops-teal shadow-inner">
            <CloudSnow className="w-5 h-5 stroke-[1.7]" />
          </div>

          <div>
            <h3 className="text-base font-bold tracking-tight text-ops-text">
              Atmospheric &amp; Environmental Telemetry
            </h3>

            <p className="text-[11px] text-ops-text-3 mt-0.5">
              Latest available observation
            </p>

            <div className="mt-1">
              <SectionProvenance
                source="real"
                origin="NCPOR/IMD AWS archive"
                caption={caption}
              />
            </div>
          </div>

        </div>

        <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-ops-card border border-white/10 text-[10px] font-bold text-ops-text-2 tracking-[0.12em] uppercase">
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
        />

        {/* PRESSURE */}
        <MetricCard
          label="Atmospheric Pressure"
          value={weather.pressure_hpa.value}
          unit="hPa"
          source={weather.pressure_hpa.source}
          icon={<Gauge className="w-4 h-4 stroke-[1.8]" />}
          tone="lavender"
        />

        {/* WIND */}
        <MetricCard
          label="Wind Velocity"
          value={weather.wind_speed_ms.value}
          unit="m/s"
          source={weather.wind_speed_ms.source}
          icon={<Wind className="w-4 h-4 stroke-[1.8]" />}
          tone="mint"
        />

      </div>
    </section>
  );
};