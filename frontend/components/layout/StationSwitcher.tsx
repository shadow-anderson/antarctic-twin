"use client";

import React from "react";
import { useStation } from "@/context/StationContext";

export const StationSwitcher: React.FC = () => {
  const { selectedStation, setSelectedStation } = useStation();

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-[#EAF0F1] border border-[#DCE5E7]">
      
      {/* Maitri */}
      <button
        type="button"
        onClick={() => setSelectedStation("maitri")}
        className={`px-4 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 ${
          selectedStation === "maitri"
            ? "bg-[#17364A] text-white shadow-[0_2px_6px_rgba(23,54,74,0.15)]"
            : "text-[#647582] hover:text-[#263746] hover:bg-[#F5F8F8]"
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
            ? "bg-[#17364A] text-white shadow-[0_2px_6px_rgba(23,54,74,0.15)]"
            : "text-[#647582] hover:text-[#263746] hover:bg-[#F5F8F8]"
        }`}
      >
        Bharati
      </button>

    </div>
  );
};