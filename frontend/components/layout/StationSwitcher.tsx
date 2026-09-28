"use client";

import React from "react";
import { useStation } from "@/context/StationContext";

export const StationSwitcher: React.FC = () => {
  const { selectedStation, setSelectedStation } = useStation();

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-ops-bg/80 border border-white/10">
      
      {/* Maitri */}
      <button
        type="button"
        onClick={() => setSelectedStation("maitri")}
        className={`px-4 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 ${
          selectedStation === "maitri"
            ? "bg-ops-card text-white shadow-sm ring-1 ring-white/10"
            : "text-ops-text-2 hover:text-ops-text hover:bg-white/5"
        }`}
      >
        Maitri
      </button>

      {/* Bharati */}
      <button
        type="button"
        onClick={() => setSelectedStation("bharati")}
        className={`px-4 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 ${
          selectedStation === "bharati"
            ? "bg-ops-card text-white shadow-sm ring-1 ring-white/10"
            : "text-ops-text-2 hover:text-ops-text hover:bg-white/5"
        }`}
      >
        Bharati
      </button>

    </div>
  );
};