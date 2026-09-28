"use client";

import React, { useEffect, useState } from "react";
import { useStation } from "@/context/StationContext";
import { getStationForecast } from "@/lib/api";
import { StationForecast } from "@/lib/types";

/* =========================================================
   STATION DATA
   Exact coordinates from backend/app/api/stations.py STATIONS dict
========================================================= */

export const STATIONS = [
  { id: "maitri" as const, name: "Maitri",  lat: -70.76, lon: 11.73 },
  { id: "bharati" as const, name: "Bharati", lat: -69.41, lon: 76.19 },
];

/* =========================================================
   STATUS TYPES & COLORS
   Canonical hex values from AssetTree.tsx — do not change
========================================================= */

type ResourceStatus = "nominal" | "warning" | "critical";

const STATUS_PRIORITY: Record<ResourceStatus, number> = {
  nominal: 0,
  warning: 1,
  critical: 2,
};

const STATUS_COLOR: Record<ResourceStatus, string> = {
  nominal:  "#4FB58A",
  warning:  "#D9A441",
  critical: "#D4706F",
};

const LOADING_COLOR = "#6F8794";

function worstStatus(a: ResourceStatus, b: ResourceStatus): ResourceStatus {
  return STATUS_PRIORITY[a] >= STATUS_PRIORITY[b] ? a : b;
}

function stationColor(forecast: StationForecast | null | "error"): string {
  if (!forecast || forecast === "error") return LOADING_COLOR;
  const worst = worstStatus(forecast.diesel.status, forecast.food.status);
  return STATUS_COLOR[worst];
}

/* =========================================================
   POLAR AZIMUTHAL EQUIDISTANT PROJECTION
   Centred on the South Pole (90°S).
   Convention: 0° lon at top, increasing clockwise for +East.
   maxColatitude = 35° gives a clean view of the coastal band;
   both stations land well inside the disc.

   colatitude_deg = 90 + lat  (lat is negative for south)
   r = (colatitude_deg / maxColatitude) * R_MAX
   theta_rad = lon * (PI / 180)
   x = cx + r * sin(theta)
   y = cy - r * cos(theta)
========================================================= */

const SVG_SIZE       = 400;
const CENTER         = SVG_SIZE / 2;   // 200
const MAX_COLATITUDE = 35;             // degrees from pole shown
const R_MAX          = 152;            // radius of the disc in SVG px

function project(lat: number, lon: number): { x: number; y: number } {
  const colatitude = 90 + lat;                    // 0 at pole, positive outward
  const r          = (colatitude / MAX_COLATITUDE) * R_MAX;
  const theta      = lon * (Math.PI / 180);
  return {
    x: CENTER + r * Math.sin(theta),
    y: CENTER - r * Math.cos(theta),
  };
}

/* =========================================================
   ANTARCTICA STYLISED OUTLINE
   A closed polygon traced around the approximate coastline
   in (colatitude, longitude) space, then projected.
   Maitri is at cola ≈ 19.24°, lon 11.73° → upper-left area.
   Bharati is at cola ≈ 20.59°, lon 76.19° → clearly to the
   right/clockwise of Maitri, matching real geography.
========================================================= */

function buildContinentPath(): string {
  // [colatitude_deg_from_pole, longitude_deg]
  // Traced clockwise from 0° E — a stylised but recognisable shape
  const coast: [number, number][] = [
    [24,    0],  // Queen Maud Land ~0°E
    [22,   15],
    [20,   30],
    [19,   45],
    [20,   60],
    [21,   75],  // Bharati sector (~76°E)
    [23,   90],
    [26,  110],
    [28,  125],
    [27,  140],
    [25,  155],
    [24,  165],
    [23,  180],
    [25,  195],
    [27,  210],
    [28,  225],
    [27,  240],
    [25,  255],
    [23,  270],
    [22,  285],
    [25,  300],  // Antarctic Peninsula
    [27,  315],
    [26,  330],
    [25,  345],
    [24,    0],  // close
  ];

  const points = coast.map(([cola, lon]) => {
    const r     = (cola / MAX_COLATITUDE) * R_MAX;
    const theta = lon * (Math.PI / 180);
    const x     = (CENTER + r * Math.sin(theta)).toFixed(2);
    const y     = (CENTER - r * Math.cos(theta)).toFixed(2);
    return `${x},${y}`;
  });

  return `M ${points[0]} ${points.slice(1).map((p) => `L ${p}`).join(" ")} Z`;
}

const CONTINENT_PATH = buildContinentPath();

/* =========================================================
   GRID HELPERS
========================================================= */

function spokePath(lon: number): string {
  const r0    = 5;
  const r1    = R_MAX + 8;
  const theta = lon * (Math.PI / 180);
  const x0 = (CENTER + r0 * Math.sin(theta)).toFixed(2);
  const y0 = (CENTER - r0 * Math.cos(theta)).toFixed(2);
  const x1 = (CENTER + r1 * Math.sin(theta)).toFixed(2);
  const y1 = (CENTER - r1 * Math.cos(theta)).toFixed(2);
  return `M ${x0} ${y0} L ${x1} ${y1}`;
}

/* =========================================================
   COMPONENT
========================================================= */

export const AntarcticaMap: React.FC = () => {
  const { selectedStation, setSelectedStation } = useStation();

  const [forecasts, setForecasts] = useState<
    Record<string, StationForecast | null | "error">
  >({ maitri: null, bharati: null });

  const [loadingForecasts, setLoadingForecasts] = useState(true);

  /* Fetch forecasts for both stations once on mount */
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoadingForecasts(true);

      const results = await Promise.allSettled(
        STATIONS.map((s) => getStationForecast(s.id))
      );

      if (!isMounted) return;

      const next: Record<string, StationForecast | null | "error"> = {};
      results.forEach((result, i) => {
        const id = STATIONS[i].id;
        if (result.status === "fulfilled") {
          next[id] = result.value;
        } else {
          console.error(
            `[AntarcticaMap] Forecast fetch failed for ${id}:`,
            result.reason
          );
          next[id] = "error";
        }
      });

      setForecasts(next);
      setLoadingForecasts(false);
    };

    load();
    return () => { isMounted = false; };
  }, []);

  /* Derive projected pin data */
  const pins = STATIONS.map((s) => {
    const pos        = project(s.lat, s.lon);
    const isSelected = selectedStation === s.id;
    const forecast   = forecasts[s.id];
    const color      = loadingForecasts ? LOADING_COLOR : stationColor(forecast);
    return { ...s, ...pos, isSelected, color };
  });

  const latRings = [10, 20, 30];

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-ops-panel shadow-[0_4px_18px_rgba(0,0,0,0.3)] ring-1 ring-white/5">

      {/* Accent top bar — consistent with other section cards */}
      <div className="h-1.5 bg-gradient-to-r from-ops-teal via-ops-ice to-ops-amber" />

      <div className="p-6 lg:p-8">

        {/* -----------------------------------------------
            SECTION HEADING
        ----------------------------------------------- */}
        <div className="flex items-center gap-3 mb-6">

          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-ops-card border border-white/10 text-ops-teal shadow-inner flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20" height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-ops-text-3">
              Station Map
            </p>
            <h2 className="text-xl font-bold text-ops-text mt-0.5">
              Antarctic Station Locations
            </h2>
          </div>

        </div>

        {/* -----------------------------------------------
            MAP + LEGEND LAYOUT
        ----------------------------------------------- */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">

          {/* ---------------------------------------------
              POLAR MAP SVG
          --------------------------------------------- */}
          <div
            className="w-full max-w-[360px] flex-shrink-0 mx-auto lg:mx-0"
            aria-label="Polar azimuthal equidistant map of Antarctica showing Maitri and Bharati research stations"
          >
            <svg
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
              style={{ overflow: "visible" }}
            >
              {/* Ocean background disc */}
              <circle
                cx={CENTER} cy={CENTER}
                r={R_MAX + 12}
                fill="#0A1C29"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />

              {/* Latitude rings */}
              {latRings.map((cola) => {
                const r = (cola / MAX_COLATITUDE) * R_MAX;
                return (
                  <circle
                    key={cola}
                    cx={CENTER} cy={CENTER}
                    r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.6"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Longitude spokes every 45° */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((lon) => (
                <path
                  key={lon}
                  d={spokePath(lon)}
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="0.5"
                  strokeDasharray="3 5"
                />
              ))}

              {/* Continent silhouette */}
              <path
                d={CONTINENT_PATH}
                fill="#16384C"
                stroke="#2B5D7A"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* South Pole marker */}
              <circle cx={CENTER} cy={CENTER} r={3} fill="#6FA8C7" />
              <text
                x={CENTER} y={CENTER - 7}
                textAnchor="middle"
                fontSize="7"
                fill="#9DB2BC"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
              >
                S POLE
              </text>

              {/* Cardinal lon labels */}
              {[
                { lon: 0,   label: "0°" },
                { lon: 90,  label: "90°E" },
                { lon: 180, label: "180°" },
                { lon: 270, label: "90°W" },
              ].map(({ lon, label }) => {
                const rLabel = R_MAX + 22;
                const theta  = lon * (Math.PI / 180);
                const lx = (CENTER + rLabel * Math.sin(theta)).toFixed(2);
                const ly = (CENTER - rLabel * Math.cos(theta)).toFixed(2);
                return (
                  <text
                    key={lon}
                    x={lx} y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fill="#9DB2BC"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                  >
                    {label}
                  </text>
                );
              })}

              {/* Station pins */}
              {pins.map((pin) => {
                const pinR  = pin.isSelected ? 9.5 : 6.5;
                const glowR = 18;

                return (
                  <g
                    key={pin.id}
                    id={`map-pin-${pin.id}`}
                    onClick={() => setSelectedStation(pin.id)}
                    style={{ cursor: "pointer" }}
                    role="button"
                    aria-label={`Select ${pin.name} station`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedStation(pin.id);
                      }
                    }}
                  >
                    {/* Selection glow */}
                    {pin.isSelected && (
                      <circle
                        cx={pin.x} cy={pin.y}
                        r={glowR}
                        fill={pin.color}
                        opacity="0.25"
                      />
                    )}

                    {/* Selection outer ring */}
                    {pin.isSelected && (
                      <circle
                        cx={pin.x} cy={pin.y}
                        r={pinR + 4}
                        fill="none"
                        stroke={pin.color}
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    )}

                    {/* Pin body */}
                    <circle
                      cx={pin.x} cy={pin.y}
                      r={pinR}
                      fill={pin.color}
                      stroke="#0D2130"
                      strokeWidth="2.2"
                      style={{
                        transition: "r 0.2s ease",
                        filter: `drop-shadow(0 2px 5px ${pin.color}88)`,
                      }}
                    />

                    {/* Label */}
                    <text
                      x={pin.x}
                      y={pin.y + pinR + 13}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="Inter, sans-serif"
                      fontWeight={pin.isSelected ? "700" : "600"}
                      fill={pin.isSelected ? "#FFFFFF" : "#9DB2BC"}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {pin.name}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>

          {/* ---------------------------------------------
              STATION DETAIL CARDS (legend)
          --------------------------------------------- */}
          <div className="flex-1 flex flex-col gap-4 w-full">

            <p className="text-xs text-ops-text-2 leading-5">
              Both Indian Antarctic research stations are projected using a{" "}
              <span className="font-semibold text-ops-text">
                polar azimuthal equidistant
              </span>{" "}
              projection centred on the South Pole. Pin colour reflects the
              worst-case resource status (diesel or food) from the current forecast.
            </p>

            {pins.map((pin) => {
              const forecast  = forecasts[pin.id];
              const isLoading = loadingForecasts;

              const statusLabel: string = isLoading
                ? "Loading…"
                : forecast === "error"
                ? "Unavailable"
                : forecast === null
                ? "Loading…"
                : (() => {
                    const worst = worstStatus(
                      forecast.diesel.status,
                      forecast.food.status
                    );
                    return worst.charAt(0).toUpperCase() + worst.slice(1);
                  })();

              return (
                <button
                  key={pin.id}
                  id={`map-card-${pin.id}`}
                  onClick={() => setSelectedStation(pin.id)}
                  className={`
                    w-full text-left p-4 rounded-2xl border transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-ops-teal
                    ${
                      pin.isSelected
                        ? "bg-ops-card border-ops-teal/40 shadow-[0_2px_12px_rgba(47,163,168,0.15)] ring-1 ring-ops-teal/30"
                        : "bg-ops-card/60 border-white/[0.08] hover:bg-ops-card hover:border-white/20 ring-1 ring-white/5"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">

                    {/* Status colour swatch */}
                    <span
                      className="mt-1 w-3 h-3 rounded-full flex-shrink-0 block ring-1 ring-white/20"
                      style={{ backgroundColor: pin.color }}
                    />

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-ops-text text-sm">
                          {pin.name}
                        </p>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: `${pin.color}25`,
                            color: pin.color,
                            border: `1px solid ${pin.color}50`,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <p className="text-xs text-ops-text-3 mt-0.5">
                        {Math.abs(pin.lat).toFixed(2)}°S, {pin.lon.toFixed(2)}°E
                      </p>

                      {/* Per-resource status */}
                      {!isLoading && forecast && forecast !== "error" && (
                        <div className="mt-2.5 flex flex-col gap-1.5">
                          {(
                            [
                              { label: "Diesel", status: forecast.diesel.status },
                              { label: "Food",   status: forecast.food.status },
                            ] as { label: string; status: ResourceStatus }[]
                          ).map(({ label, status }) => (
                            <div key={label} className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-ops-text-3 w-10 flex-shrink-0">
                                {label}
                              </span>
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: STATUS_COLOR[status] }}
                              />
                              <span
                                className="text-[10px] font-medium capitalize"
                                style={{ color: STATUS_COLOR[status] }}
                              >
                                {status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </button>
              );
            })}

            {loadingForecasts && (
              <p className="text-[11px] text-ops-text-3 italic">
                Fetching resource forecasts…
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
