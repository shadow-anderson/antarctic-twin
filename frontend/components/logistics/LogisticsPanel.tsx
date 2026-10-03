"use client";

import React from "react";
import { RouteSimulator } from "./RouteSimulator";
import { InterStationCoordinationPanel } from "./InterStationCoordinationPanel";
import { SectionProvenance } from "../shared/SectionProvenance";
import { Truck, Radio, Share2 } from "lucide-react";
import { useStation } from "@/context/StationContext";

export const LogisticsPanel: React.FC = () => {
  const { selectedStation } = useStation();

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_8px_28px_rgba(0,0,0,0.3)] px-6 sm:px-8 py-6">
        <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-ops-teal/8 blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-ops-card border border-white/10 text-ops-teal">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ops-teal/15 border border-ops-teal/30 text-ops-teal text-[10px] font-bold uppercase tracking-wider">
                <Radio className="w-3 h-3" />
                {selectedStation === "maitri" ? "Maitri" : "Bharati"} Logistics Sector
              </span>
              <SectionProvenance source="simulated" origin="Polar logistics route & coordination model" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ops-text">
              Logistics &amp; Inter-Station Coordination
            </h1>
            <p className="mt-1 text-sm text-ops-text-2 max-w-2xl">
              Model maritime and ground resupply routes under extreme weather conditions, evaluate supply gap risks, and coordinate mutual contingency support between Maitri and Bharati.
            </p>
          </div>
        </div>
      </section>

      {/* Feature 13: Logistics Route Simulation */}
      <RouteSimulator />

      {/* Feature 12: Inter-Station Coordination */}
      <InterStationCoordinationPanel />
    </div>
  );
};
