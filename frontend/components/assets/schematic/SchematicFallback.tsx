"use client";

import React, { useState } from "react";
import { AssetStatus } from "@/lib/types";

/* ─────────────── colour palette ─────────────── */
const STATUS_FILL: Record<AssetStatus, string> = {
  healthy: "#4FB58A",
  warning: "#D9A441",
  critical: "#D4706F",
};

const STATUS_FILL_DIM: Record<AssetStatus, string> = {
  healthy: "#3A8A6A",
  warning: "#B0842E",
  critical: "#B55A59",
};

/* ─────────── asset layout (2-d iso grid) ─────────── */
interface AssetDef {
  id: string;
  label: string;
  /** SVG x,y for the center of the shape */
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "box" | "cylinder" | "tank";
}

const ASSETS: AssetDef[] = [
  // Buildings  (top-left quadrant)
  { id: "bld-main",    label: "Main Building",    x: 160, y: 100, w: 80, h: 44, kind: "box" },
  { id: "bld-lab",     label: "Lab Module",       x: 260, y: 100, w: 48, h: 32, kind: "box" },
  { id: "bld-storage", label: "Storage Facility",  x: 160, y: 164, w: 60, h: 24, kind: "box" },

  // Power  (top-right quadrant)
  { id: "gen-01",      label: "Generator 1",       x: 400, y: 80,  w: 44, h: 28, kind: "box" },
  { id: "gen-02",      label: "Generator 2",       x: 460, y: 80,  w: 44, h: 28, kind: "box" },
  { id: "battery-sys", label: "Battery System",    x: 430, y: 130, w: 56, h: 20, kind: "box" },

  // Water  (bottom-left quadrant)
  { id: "water-pump",    label: "Water Pump",      x: 140, y: 260, w: 36, h: 28, kind: "box" },
  { id: "water-storage", label: "Water Tank",      x: 210, y: 260, w: 30, h: 40, kind: "tank" },

  // Logistics  (bottom-right quadrant)
  { id: "log-diesel",  label: "Diesel Storage",    x: 370, y: 230, w: 50, h: 22, kind: "cylinder" },
  { id: "log-food",    label: "Food Supply",       x: 370, y: 270, w: 36, h: 22, kind: "box" },
  { id: "log-medical", label: "Medical Supplies",  x: 420, y: 270, w: 36, h: 22, kind: "box" },
  { id: "log-water",   label: "Water Reserves",    x: 470, y: 270, w: 36, h: 22, kind: "box" },
  { id: "log-spares",  label: "Spare Parts",       x: 520, y: 270, w: 36, h: 22, kind: "box" },
];

/* ─────────────── component ─────────────── */
interface SchematicFallbackProps {
  assets: { id: string; status: AssetStatus }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  stationId: "maitri" | "bharati";
}

export const SchematicFallback: React.FC<SchematicFallbackProps> = ({
  assets,
  selectedId,
  onSelect,
  stationId,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const statusMap = new Map(assets.map((a) => [a.id, a.status]));

  const getWaterPumpLabel = () =>
    stationId === "maitri" ? "Lake Water Pump House" : "Sea Water Pump House";

  return (
    <div className="relative w-full" style={{ height: 420, background: "#0D2130" }}>
      <svg
        viewBox="0 0 600 360"
        className="w-full h-full"
        style={{ maxHeight: 420 }}
      >
        {/* ── ground / platform ── */}
        <rect
          x="40"
          y="310"
          width="520"
          height="30"
          rx="6"
          fill="#1B3A4D"
          stroke="#2A5060"
          strokeWidth="1"
        />
        {/* faint grid lines */}
        {[120, 200, 280, 360, 440].map((gx) => (
          <line
            key={`gv${gx}`}
            x1={gx}
            y1="60"
            x2={gx}
            y2="310"
            stroke="#1B3A4D"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}
        {[120, 180, 240].map((gy) => (
          <line
            key={`gh${gy}`}
            x1="40"
            y1={gy}
            x2="560"
            y2={gy}
            stroke="#1B3A4D"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}

        {/* ── scenery ridges ── */}
        <polygon points="60,310 90,290 120,310" fill="#1B3A4D" opacity="0.6" />
        <polygon points="500,310 530,285 560,310" fill="#1B3A4D" opacity="0.5" />

        {/* ── section labels ── */}
        <text x="180" y="55" fill="#6F8794" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">BUILDINGS</text>
        <text x="430" y="55" fill="#6F8794" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">POWER</text>
        <text x="170" y="225" fill="#6F8794" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">WATER</text>
        <text x="440" y="210" fill="#6F8794" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">LOGISTICS</text>

        {/* ── asset shapes ── */}
        {ASSETS.map((asset) => {
          const status = statusMap.get(asset.id) ?? "healthy";
          const fill = STATUS_FILL[status];
          const fillDim = STATUS_FILL_DIM[status];
          const isSelected = asset.id === selectedId;
          const isHovered = asset.id === hoveredId;
          const label =
            asset.id === "water-pump" ? getWaterPumpLabel() : asset.label;

          // Isometric offset for 3d-ish look
          const isoOff = 6;

          return (
            <g
              key={asset.id}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(asset.id)}
              onMouseEnter={() => setHoveredId(asset.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* ── shadow ── */}
              <rect
                x={asset.x - asset.w / 2 + 3}
                y={asset.y - asset.h / 2 + 3}
                width={asset.w}
                height={asset.h}
                rx={asset.kind === "tank" ? asset.w / 2 : 3}
                fill="rgba(0,0,0,0.3)"
              />

              {/* ── side face (iso depth) ── */}
              {asset.kind === "box" && (
                <polygon
                  points={`
                    ${asset.x - asset.w / 2},${asset.y + asset.h / 2}
                    ${asset.x + asset.w / 2},${asset.y + asset.h / 2}
                    ${asset.x + asset.w / 2 + isoOff},${asset.y + asset.h / 2 + isoOff}
                    ${asset.x - asset.w / 2 + isoOff},${asset.y + asset.h / 2 + isoOff}
                  `}
                  fill={fillDim}
                />
              )}

              {/* ── main face ── */}
              {asset.kind === "tank" ? (
                <ellipse
                  cx={asset.x}
                  cy={asset.y}
                  rx={asset.w / 2}
                  ry={asset.h / 2}
                  fill={fill}
                  stroke={isSelected ? "#fff" : isHovered ? "#9DB2BC" : "transparent"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  opacity={isHovered ? 1 : 0.88}
                />
              ) : asset.kind === "cylinder" ? (
                <rect
                  x={asset.x - asset.w / 2}
                  y={asset.y - asset.h / 2}
                  width={asset.w}
                  height={asset.h}
                  rx={asset.h / 2}
                  fill={fill}
                  stroke={isSelected ? "#fff" : isHovered ? "#9DB2BC" : "transparent"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  opacity={isHovered ? 1 : 0.88}
                />
              ) : (
                <rect
                  x={asset.x - asset.w / 2}
                  y={asset.y - asset.h / 2}
                  width={asset.w}
                  height={asset.h}
                  rx={3}
                  fill={fill}
                  stroke={isSelected ? "#fff" : isHovered ? "#9DB2BC" : "transparent"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  opacity={isHovered ? 1 : 0.88}
                />
              )}

              {/* ── beacon dot ── */}
              <circle
                cx={asset.x}
                cy={asset.y - asset.h / 2 - 6}
                r={3}
                fill={fill}
                opacity={0.9}
              >
                {status === "critical" && (
                  <animate
                    attributeName="opacity"
                    values="0.9;0.3;0.9"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* ── selection ring ── */}
              {isSelected && (
                <rect
                  x={asset.x - asset.w / 2 - 4}
                  y={asset.y - asset.h / 2 - 4}
                  width={asset.w + 8}
                  height={asset.h + 8}
                  rx={5}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
              )}

              {/* ── hover / selected label ── */}
              {(isHovered || isSelected) && (
                <g>
                  <rect
                    x={asset.x - label.length * 3.2}
                    y={asset.y - asset.h / 2 - 24}
                    width={label.length * 6.4}
                    height={14}
                    rx={3}
                    fill="rgba(13,33,48,0.92)"
                    stroke="#2FA3A8"
                    strokeWidth="0.5"
                  />
                  <text
                    x={asset.x}
                    y={asset.y - asset.h / 2 - 14}
                    fill="#E6EEF1"
                    fontSize="8"
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    {label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── station name ── */}
        <text
          x="300"
          y="345"
          fill="#6F8794"
          fontSize="10"
          fontWeight="500"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
        >
          {stationId === "maitri" ? "Maitri Station" : "Bharati Station"} — 2D Schematic
        </text>
      </svg>
    </div>
  );
};
