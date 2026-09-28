"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import { AssetStatus } from "@/lib/types";

/* ═══════════════════════════════════════════
   STATUS COLOURS
   ═══════════════════════════════════════════ */
const STATUS_COLORS: Record<AssetStatus, string> = {
  healthy: "#4FB58A",
  warning: "#D9A441",
  critical: "#D4706F",
};

const BASE_COLOR = "#3A5060";
const SELECTED_EMISSIVE_INTENSITY = 0.55;
const HOVER_EMISSIVE_INTENSITY = 0.25;

/* ═══════════════════════════════════════════
   ASSET LAYOUT DEFINITIONS
   ═══════════════════════════════════════════ */
interface AssetPlacement {
  id: string;
  label: string;
  position: [number, number, number];
  /** Geometry factory name */
  shape: "building" | "generator" | "battery" | "pump" | "tank" | "cylinders" | "container";
  /** Optional scale overrides [x,y,z] */
  scale?: [number, number, number];
}

const ASSET_DEFS: AssetPlacement[] = [
  // ── Buildings ──
  { id: "bld-main",    label: "Main Building",    position: [-2.5, 0, -1.5], shape: "building",  scale: [2.5, 1.3, 1.6] },
  { id: "bld-lab",     label: "Lab Module",       position: [-0.2, 0, -1.5], shape: "building",  scale: [1.2, 0.9, 1.0] },
  { id: "bld-storage", label: "Storage Facility",  position: [-2.5, 0, 0.2],  shape: "building",  scale: [1.6, 0.6, 1.0] },

  // ── Power ──
  { id: "gen-01",      label: "Generator 1",       position: [2.0, 0, -2.5],  shape: "generator", scale: [1, 1, 1] },
  { id: "gen-02",      label: "Generator 2",       position: [3.5, 0, -2.5],  shape: "generator", scale: [1, 1, 1] },
  { id: "battery-sys", label: "Battery System",    position: [2.7, 0, -1.2],  shape: "battery",   scale: [1, 1, 1] },

  // ── Water ──
  { id: "water-pump",    label: "Water Pump",      position: [-3.0, 0, 2.0],  shape: "pump",      scale: [1, 1, 1] },
  { id: "water-storage", label: "Water Tank",      position: [-1.5, 0, 2.0],  shape: "tank",      scale: [1, 1, 1] },

  // ── Logistics ──
  { id: "log-diesel",  label: "Diesel Storage",    position: [1.5, 0, 1.0],   shape: "cylinders", scale: [1, 1, 1] },
  { id: "log-food",    label: "Food Supply",       position: [1.5, 0, 2.5],   shape: "container", scale: [1, 1, 1] },
  { id: "log-medical", label: "Medical Supplies",  position: [2.7, 0, 2.5],   shape: "container", scale: [1, 1, 1] },
  { id: "log-water",   label: "Water Reserves",    position: [3.9, 0, 2.5],   shape: "container", scale: [1, 1, 1] },
  { id: "log-spares",  label: "Spare Parts",       position: [5.1, 0, 2.5],   shape: "container", scale: [1, 1, 1] },
];

/* ═══════════════════════════════════════════
   INDIVIDUAL ASSET MESH COMPONENTS
   ═══════════════════════════════════════════ */

/** A single asset shape in the 3D scene */
const AssetMesh: React.FC<{
  def: AssetPlacement;
  status: AssetStatus;
  isSelected: boolean;
  isHovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
  stationId: "maitri" | "bharati";
}> = ({ def, status, isSelected, isHovered, onPointerOver, onPointerOut, onClick, stationId }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const color = new THREE.Color(STATUS_COLORS[status]);
  const baseCol = new THREE.Color(BASE_COLOR);

  const emissiveIntensity = isSelected
    ? SELECTED_EMISSIVE_INTENSITY
    : isHovered
    ? HOVER_EMISSIVE_INTENSITY
    : 0.08;

  const yOffset = isHovered && !isSelected ? 0.1 : 0;

  // Differentiation: Maitri has stilts for bld-main
  const stiltHeight =
    def.id === "bld-main" && stationId === "maitri" ? 0.6 : 0;
  const bldScale: [number, number, number] =
    def.id === "bld-main" && stationId === "bharati"
      ? [(def.scale?.[0] ?? 1) * 1.18, def.scale?.[1] ?? 1, (def.scale?.[2] ?? 1) * 1.18]
      : def.scale ?? [1, 1, 1];

  const label =
    def.id === "water-pump"
      ? stationId === "maitri"
        ? "Lake Water Pump House"
        : "Sea Water Pump House"
      : def.label;

  const adjustedPos: [number, number, number] = [
    def.position[0],
    def.position[1] + stiltHeight + yOffset,
    def.position[2],
  ];

  return (
    <group
      ref={groupRef}
      position={adjustedPos}
      onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
      onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* ── Stilts for Maitri bld-main ── */}
      {stiltHeight > 0 && (
        <>
          {[[-0.8, 0, -0.5], [0.8, 0, -0.5], [-0.8, 0, 0.5], [0.8, 0, 0.5]].map((pos, i) => (
            <mesh key={`stilt-${i}`} position={[pos[0], -stiltHeight / 2, pos[2]]}>
              <cylinderGeometry args={[0.04, 0.04, stiltHeight, 6]} />
              <meshStandardMaterial color="#6A8090" flatShading />
            </mesh>
          ))}
        </>
      )}

      {/* ── Shape geometry ── */}
      <ShapeGeometry
        shape={def.shape}
        scale={def.id === "bld-main" ? bldScale : def.scale ?? [1, 1, 1]}
        color={baseCol}
        statusColor={color}
        emissiveIntensity={emissiveIntensity}
        isSelected={isSelected}
      />

      {/* ── Beacon on top ── */}
      <mesh position={[0, (def.scale?.[1] ?? 1) * 0.5 + 0.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={STATUS_COLORS[status]}
          emissive={STATUS_COLORS[status]}
          emissiveIntensity={0.8}
          flatShading
        />
      </mesh>

      {/* ── Hover / selected HTML label ── */}
      {(isHovered || isSelected) && (
        <Html
          position={[0, (def.scale?.[1] ?? 1) * 0.5 + 0.5, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(13,33,48,0.92)",
              border: "1px solid #2FA3A8",
              borderRadius: 4,
              padding: "3px 8px",
              whiteSpace: "nowrap",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#E6EEF1",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ═══════════════════════════════════════════
   SHAPE GEOMETRY — primitives only
   ═══════════════════════════════════════════ */
const ShapeGeometry: React.FC<{
  shape: AssetPlacement["shape"];
  scale: [number, number, number];
  color: THREE.Color;
  statusColor: THREE.Color;
  emissiveIntensity: number;
  isSelected: boolean;
}> = ({ shape, scale, color, statusColor, emissiveIntensity, isSelected }) => {
  const mat = (
    <meshStandardMaterial
      color={color}
      emissive={statusColor}
      emissiveIntensity={emissiveIntensity}
      flatShading
    />
  );

  switch (shape) {
    case "building":
      return (
        <mesh scale={scale}>
          <boxGeometry args={[1, 1, 1]} />
          {mat}
          {isSelected && <Edges threshold={15} color="#ffffff" linewidth={1.5} />}
        </mesh>
      );

    case "generator":
      return (
        <group scale={scale}>
          {/* Main body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.5]} />
            {mat}
            {isSelected && <Edges threshold={15} color="#ffffff" linewidth={1.5} />}
          </mesh>
          {/* Exhaust stack */}
          <mesh position={[0.2, 0.5, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
            {mat}
          </mesh>
        </group>
      );

    case "battery":
      return (
        <group scale={scale}>
          {/* 3 stacked flat boxes */}
          {[0, 0.22, 0.44].map((yOff, i) => (
            <mesh key={i} position={[0, yOff, 0]}>
              <boxGeometry args={[1.2, 0.18, 0.6]} />
              {mat}
              {isSelected && i === 2 && <Edges threshold={15} color="#ffffff" linewidth={1.5} />}
            </mesh>
          ))}
        </group>
      );

    case "pump":
      return (
        <group scale={scale}>
          {/* Box housing */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.4]} />
            {mat}
            {isSelected && <Edges threshold={15} color="#ffffff" linewidth={1.5} />}
          </mesh>
          {/* Horizontal pipe */}
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
            {mat}
          </mesh>
        </group>
      );

    case "tank":
      return (
        <mesh scale={scale}>
          <cylinderGeometry args={[0.35, 0.35, 1.1, 12]} />
          {mat}
          {isSelected && <Edges threshold={15} color="#ffffff" linewidth={1.5} />}
        </mesh>
      );

    case "cylinders":
      return (
        <group scale={scale}>
          {/* Two horizontal cylinders on cradles */}
          {[-0.25, 0.25].map((zOff, i) => (
            <group key={i}>
              <mesh position={[0, 0.15, zOff]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.14, 0.14, 0.9, 8]} />
                {mat}
              </mesh>
              {/* Cradle */}
              <mesh position={[0, -0.05, zOff]}>
                <boxGeometry args={[0.7, 0.06, 0.12]} />
                {mat}
              </mesh>
            </group>
          ))}
          {isSelected && (
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[1, 0.4, 0.7]} />
              <meshBasicMaterial visible={false} />
              <Edges threshold={15} color="#ffffff" linewidth={1.5} />
            </mesh>
          )}
        </group>
      );

    case "container":
      return (
        <mesh scale={scale}>
          <boxGeometry args={[0.7, 0.5, 0.4]} />
          {mat}
          {isSelected && <Edges threshold={15} color="#ffffff" linewidth={1.5} />}
        </mesh>
      );

    default:
      return null;
  }
};

/* ═══════════════════════════════════════════
   GROUND PLATFORM + SCENERY
   ═══════════════════════════════════════════ */
const GroundAndScenery: React.FC = () => {
  return (
    <group>
      {/* ── Ground platform ── */}
      <mesh position={[0.5, -0.15, 0.5]} receiveShadow>
        <boxGeometry args={[14, 0.12, 10]} />
        <meshStandardMaterial color="#1B3A4D" flatShading />
      </mesh>

      {/* ── Faint grid on ground ── */}
      <gridHelper
        args={[14, 28, "#1E4050", "#1E4050"]}
        position={[0.5, -0.08, 0.5]}
      />

      {/* ── Low-poly cone ridges (scenery) ── */}
      {[
        { pos: [-5.5, 0, -3.5] as [number, number, number], h: 0.7, r: 0.5 },
        { pos: [-6.0, 0, -2.0] as [number, number, number], h: 0.5, r: 0.35 },
        { pos: [5.5, 0, 3.5] as [number, number, number], h: 0.9, r: 0.6 },
        { pos: [6.5, 0, 2.5] as [number, number, number], h: 0.6, r: 0.4 },
        { pos: [-4.5, 0, 4.0] as [number, number, number], h: 0.55, r: 0.45 },
        { pos: [6.0, 0, -3.0] as [number, number, number], h: 0.65, r: 0.38 },
      ].map(({ pos, h, r }, i) => (
        <mesh key={`ridge-${i}`} position={[pos[0], h / 2 - 0.1, pos[2]]}>
          <coneGeometry args={[r, h, 5]} />
          <meshStandardMaterial color="#1B3A4D" flatShading />
        </mesh>
      ))}
    </group>
  );
};

/* ═══════════════════════════════════════════
   CAMERA INVALIDATION HOOK
   ═══════════════════════════════════════════ */
const Invalidator: React.FC<{ deps: unknown[] }> = ({ deps }) => {
  const { invalidate } = useThree();
  React.useEffect(() => {
    invalidate();
  }, [deps, invalidate]);
  return null;
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
interface StationSchematicProps {
  assets: { id: string; status: AssetStatus }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  stationId: "maitri" | "bharati";
}

export const StationSchematic: React.FC<StationSchematicProps> = ({
  assets,
  selectedId,
  onSelect,
  stationId,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const statusMap = useMemo(
    () => new Map(assets.map((a) => [a.id, a.status])),
    [assets]
  );

  const handlePointerOver = useCallback(
    (id: string) => {
      setHoveredId(id);
      document.body.style.cursor = "pointer";
    },
    []
  );

  const handlePointerOut = useCallback(() => {
    setHoveredId(null);
    document.body.style.cursor = "auto";
  }, []);

  const handleClick = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      orthographic
      camera={{
        position: [12, 12, 12],
        zoom: 42,
        near: 0.1,
        far: 100,
      }}
      style={{ background: "#0D2130" }}
      gl={{ antialias: true, alpha: false }}
    >
      {/* ── Lighting (no shadows, flat-shaded) ── */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 12, 6]} intensity={0.9} />
      <directionalLight position={[-4, 6, -4]} intensity={0.3} />

      {/* ── Ground and scenery ── */}
      <GroundAndScenery />

      {/* ── Asset meshes ── */}
      {ASSET_DEFS.map((def) => (
        <AssetMesh
          key={def.id}
          def={def}
          status={statusMap.get(def.id) ?? "healthy"}
          isSelected={def.id === selectedId}
          isHovered={def.id === hoveredId}
          onPointerOver={() => handlePointerOver(def.id)}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick(def.id)}
          stationId={stationId}
        />
      ))}

      {/* ── Invalidate on hover / selection changes ── */}
      <Invalidator deps={[hoveredId, selectedId, assets]} />
    </Canvas>
  );
};

export default StationSchematic;
