"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Sunset } from "lucide-react";
import {
  computeSolarElevationDeg,
  classifySolarState,
  SolarState,
} from "@/lib/solarPosition";

/* =========================================================
   SolarBadge
   Small pill showing the current solar state and elevation
   for a given station. Designed for the dark hero background
   in OverviewPanel — translucent light styling.
========================================================= */

interface SolarBadgeProps {
  lat: number;
  lon: number;
}

const ICON_MAP: Record<SolarState, React.ReactNode> = {
  "Polar Day":      <Sun     className="w-3 h-3" />,
  "Civil Twilight": <Sunset  className="w-3 h-3" />,
  "Polar Night":    <Moon    className="w-3 h-3" />,
};

const GLOW_MAP: Record<SolarState, string> = {
  "Polar Day":      "bg-[#B98232]/20 border-[#B98232]/30 text-[#F0D9A8]",
  "Civil Twilight": "bg-[#8EC0C2]/15 border-[#8EC0C2]/25 text-[#B6D8DA]",
  "Polar Night":    "bg-[#9BAFC8]/15 border-[#9BAFC8]/25 text-[#B4C7DB]",
};

export const SolarBadge: React.FC<SolarBadgeProps> = ({ lat, lon }) => {
  const [elevation, setElevation] = useState<number | null>(null);
  const [state, setState] = useState<SolarState>("Civil Twilight");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const elev = computeSolarElevationDeg(lat, lon, now);
      setElevation(elev);
      setState(classifySolarState(elev));
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  if (elevation === null) return null;

  const elevStr = elevation >= 0
    ? `+${elevation.toFixed(1)}°`
    : `${elevation.toFixed(1)}°`;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-lg
        border
        text-[10px] font-semibold
        transition-colors duration-300
        ${GLOW_MAP[state]}
      `}
      title={`Solar elevation: ${elevStr}`}
    >
      {ICON_MAP[state]}

      <span className="tracking-wide">
        {state}
      </span>

      <span className="opacity-70">·</span>

      <span className="tabular-nums">
        Sun {elevStr}
      </span>
    </span>
  );
};
