"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import {
  TwinAsset,
  TwinLayerId,
  TwinAssetStatus,
} from "@/lib/twinAssetRegistry";

interface Twin3DCanvasProps {
  stationId: "maitri" | "bharati";
  assets: TwinAsset[];
  selectedAsset: TwinAsset | null;
  onSelectAsset: (asset: TwinAsset) => void;
  activeLayers: Record<TwinLayerId, boolean>;
  autoRotate: boolean;
  wireframe: boolean;
  focusTarget: [number, number, number] | null;
  resetTrigger: number;
}

const STATUS_COLORS: Record<TwinAssetStatus, string> = {
  nominal: "#00E676",
  warning: "#FFAB00",
  degraded: "#FF9100",
  critical: "#FF1744",
};

/* ── Smooth Camera Controller with Cinematic Lerping ── */
function CameraController({
  focusTarget,
  resetTrigger,
  autoRotate,
}: {
  focusTarget: [number, number, number] | null;
  resetTrigger: number;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsType>(null);
  const targetLookAt = useRef(new THREE.Vector3(0, 0.5, 0));
  const targetCamPos = useRef(new THREE.Vector3(14, 11, 15));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (focusTarget) {
      targetLookAt.current.set(focusTarget[0], focusTarget[1] + 0.6, focusTarget[2]);
      targetCamPos.current.set(
        focusTarget[0] + 4.5,
        focusTarget[1] + 3.8,
        focusTarget[2] + 4.5
      );
      isTransitioning.current = true;
    }
  }, [focusTarget]);

  useEffect(() => {
    targetLookAt.current.set(0, 0.5, 0);
    targetCamPos.current.set(14, 11, 15);
    isTransitioning.current = true;
  }, [resetTrigger]);

  useFrame((_, delta) => {
    if (isTransitioning.current && controlsRef.current) {
      const step = Math.min(delta * 4, 0.12);
      camera.position.lerp(targetCamPos.current, step);
      controlsRef.current.target.lerp(targetLookAt.current, step);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(targetCamPos.current) < 0.08 &&
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.08
      ) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      enableDamping
      dampingFactor={0.06}
      minDistance={3}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2 - 0.03}
    />
  );
}

/* ── Realistic Architectural Asset Meshes ── */
function ArchitecturalAssetMesh({
  asset,
  stationId,
  isSelected,
  wireframe,
  onClick,
}: {
  asset: TwinAsset;
  stationId: "maitri" | "bharati";
  isSelected: boolean;
  wireframe: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const data = stationId === "maitri" ? asset.maitri : asset.bharati;
  const statusColor = STATUS_COLORS[data.status];

  // Material Palette - Technical Antarctic Command Tone
  const stationHue = stationId === "bharati" ? "#3A5D82" : "#B87B2E"; // Bharati is crisp metallic blue-gray, Maitri is insulated polar ochre
  const stationAccent = stationId === "bharati" ? "#00E5FF" : "#FFAB00";

  const metallicPanel = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isSelected ? "#00E5FF" : hovered ? "#5C8BB5" : stationHue,
        roughness: 0.35,
        metalness: 0.55,
        wireframe,
        emissive: isSelected ? "#00E5FF" : hovered ? statusColor : "#0E1A29",
        emissiveIntensity: isSelected ? 0.35 : hovered ? 0.25 : 0.04,
      }),
    [isSelected, hovered, statusColor, stationHue, wireframe]
  );

  const darkStructuralMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#33465C",
        metalness: 0.7,
        roughness: 0.35,
        wireframe,
      }),
    [wireframe]
  );

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#A6DDF8",
        transmission: 0.75,
        opacity: 1,
        transparent: true,
        roughness: 0.12,
        ior: 1.5,
      }),
    []
  );

  const pos = asset.position;

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* ========================================================
          1. MAIN STATION HABITATION COMPLEX
      ======================================================== */}
      {asset.id === "bld-main" && (
        <group position={[0, 0, 0]}>
          {/* Elevated Stilts Platform */}
          {[-1.2, 0, 1.2].map((x) =>
            [-0.7, 0.7].map((z) => (
              <mesh key={`stilt-${x}-${z}`} position={[x, 0.4, z]}>
                <cylinderGeometry args={[0.07, 0.08, 0.8, 8]} />
                <primitive object={darkStructuralMat} />
              </mesh>
            ))
          )}

          {/* Under-chassis girder frame */}
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[3.2, 0.1, 2.0]} />
            <primitive object={darkStructuralMat} />
          </mesh>

          {/* Main Station Building (aerodynamic pod) */}
          <mesh position={[0, 1.45, 0]}>
            <boxGeometry args={[3.0, 1.15, 1.8]} />
            <primitive object={metallicPanel} />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>

          {/* Observation Window Ribbon */}
          <mesh position={[0, 1.55, 0.91]}>
            <boxGeometry args={[2.6, 0.35, 0.02]} />
            <primitive object={glassMat} />
          </mesh>
          <mesh position={[0, 1.55, -0.91]}>
            <boxGeometry args={[2.6, 0.35, 0.02]} />
            <primitive object={glassMat} />
          </mesh>

          {/* Roof Terrace & HVAC pods */}
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[2.4, 0.12, 1.4]} />
            <primitive object={darkStructuralMat} />
          </mesh>
          {[-0.6, 0.6].map((x, i) => (
            <mesh key={`hvac-pod-${i}`} position={[x, 2.25, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.2, 12]} />
              <meshStandardMaterial color="#8899AA" metalness={0.7} />
            </mesh>
          ))}

          {/* Communication / Radar Antenna Mast */}
          <mesh position={[-1.2, 2.6, 0]}>
            <cylinderGeometry args={[0.02, 0.04, 1.0, 6]} />
            <primitive object={darkStructuralMat} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          2. SCIENCE LABORATORY COMPLEX
      ======================================================== */}
      {asset.id === "bld-lab" && (
        <group position={[0, 0, 0]}>
          {/* Base stilts */}
          {[-0.6, 0.6].map((x) =>
            [-0.5, 0.5].map((z) => (
              <mesh key={`lab-stilt-${x}-${z}`} position={[x, 0.3, z]}>
                <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
                <primitive object={darkStructuralMat} />
              </mesh>
            ))
          )}

          {/* Lab Module Body */}
          <mesh position={[0, 1.0, 0]}>
            <boxGeometry args={[1.6, 0.9, 1.3]} />
            <primitive object={metallicPanel} />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>

          {/* Optical Dome / Sky Observation Bubble */}
          <mesh position={[0.3, 1.5, 0]}>
            <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <primitive object={glassMat} />
          </mesh>

          {/* Side airlock connection tunnel to main building */}
          <mesh position={[-0.95, 0.95, 0]}>
            <boxGeometry args={[0.35, 0.6, 0.6]} />
            <primitive object={darkStructuralMat} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          3. PRIMARY & SECONDARY DIESEL GENERATORS (GEN-01 & GEN-02)
      ======================================================== */}
      {(asset.id === "gen-01" || asset.id === "gen-02") && (
        <group position={[0, 0, 0]}>
          {/* Concrete / Steel Foundation Pad */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[1.2, 0.16, 0.9]} />
            <meshStandardMaterial color="#3A4A5C" roughness={0.85} />
          </mesh>

          {/* Generator Acoustic Housing */}
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[1.0, 0.72, 0.7]} />
            <meshStandardMaterial
              color={isSelected ? "#00E5FF" : hovered ? "#5C8BB5" : "#4A6582"}
              metalness={0.65}
              roughness={0.32}
              emissive={isSelected ? "#00E5FF" : hovered ? statusColor : "#101D2C"}
              emissiveIntensity={isSelected ? 0.35 : 0.06}
            />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>

          {/* Radiator Cooling Grills */}
          <mesh position={[-0.45, 0.55, 0]}>
            <boxGeometry args={[0.05, 0.5, 0.55]} />
            <meshStandardMaterial color="#1E2D3E" metalness={0.8} />
          </mesh>

          {/* Twin Silver Exhaust Stacks */}
          {[0.15, 0.35].map((x, i) => (
            <mesh key={`exhaust-${i}`} position={[x, 1.05, 0]}>
              <cylinderGeometry args={[0.05, 0.06, 0.65, 12]} />
              <meshStandardMaterial color="#9FB2C4" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}

          {/* Safety Warning Stripe */}
          <mesh position={[0, 0.22, 0.36]}>
            <boxGeometry args={[0.9, 0.06, 0.01]} />
            <meshStandardMaterial color="#FFB300" />
          </mesh>
        </group>
      )}

      {/* ========================================================
          4. BATTERY ENERGY STORAGE SYSTEM (BESS)
      ======================================================== */}
      {asset.id === "battery-sys" && (
        <group position={[0, 0, 0]}>
          {/* Base pad */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.6, 0.12, 0.9]} />
            <meshStandardMaterial color="#2C3E54" />
          </mesh>

          {/* High-Tech BESS Container Enclosure */}
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[1.45, 0.9, 0.75]} />
            <meshStandardMaterial
              color={isSelected ? "#00E5FF" : hovered ? "#5C8BB5" : "#3E5C7F"}
              metalness={0.7}
              roughness={0.28}
              emissive={isSelected ? "#00E5FF" : hovered ? statusColor : "#101E2E"}
              emissiveIntensity={isSelected ? 0.35 : 0.06}
            />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>

          {/* BESS Status LED Strip */}
          <mesh position={[0, 0.85, 0.38]}>
            <boxGeometry args={[1.1, 0.04, 0.02]} />
            <meshStandardMaterial
              color="#00E676"
              emissive="#00E676"
              emissiveIntensity={1.2}
            />
          </mesh>

          {/* Rooftop Inverter/HVAC Unit */}
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[0.8, 0.18, 0.5]} />
            <primitive object={darkStructuralMat} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          5. WATER PUMP HOUSE & INTAKE
      ======================================================== */}
      {asset.id === "water-pump" && (
        <group position={[0, 0, 0]}>
          {/* Pump shelter */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.85, 0.8, 0.7]} />
            <primitive object={metallicPanel} />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>

          {/* Insulated Primary Intake Pipe */}
          <mesh position={[0.55, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.9, 12]} />
            <meshStandardMaterial color="#00E5FF" metalness={0.65} roughness={0.3} />
          </mesh>

          {/* Trace Heating Cable Junction Box */}
          <mesh position={[0, 0.7, 0.36]}>
            <boxGeometry args={[0.2, 0.2, 0.08]} />
            <meshStandardMaterial color="#FFAB00" />
          </mesh>
        </group>
      )}

      {/* ========================================================
          6. POTABLE WATER STORAGE TANKS
      ======================================================== */}
      {asset.id === "water-storage" && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.65, 0.7, 0.1, 18]} />
            <meshStandardMaterial color="#35485A" />
          </mesh>

          {/* Insulated Vertical Cylinder Tank */}
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 1.5, 24]} />
            <meshStandardMaterial
              color={isSelected ? "#00E5FF" : hovered ? "#5C8BB5" : "#4B729A"}
              metalness={0.65}
              roughness={0.32}
              emissive={isSelected ? "#00E5FF" : hovered ? statusColor : "#101E2E"}
              emissiveIntensity={isSelected ? 0.35 : 0.06}
            />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>

          {/* Inspection Catwalk & Ladder Ring */}
          <mesh position={[0, 1.4, 0]}>
            <torusGeometry args={[0.58, 0.02, 8, 24]} />
            <primitive object={darkStructuralMat} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          7. DIESEL FUEL BULK STORAGE
      ======================================================== */}
      {asset.id === "log-diesel" && (
        <group position={[0, 0, 0]}>
          {/* Spill Containment Bund Wall */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.5, 0.2, 1.8]} />
            <meshStandardMaterial color="#36495E" roughness={0.8} />
          </mesh>

          {/* Twin Horizontal Bulk Cylinders on Cradle Saddles */}
          {[-0.45, 0.45].map((z, idx) => (
            <group key={`tank-${idx}`}>
              <mesh position={[0, 0.58, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.35, 0.35, 1.3, 20]} />
                <meshStandardMaterial
                  color={isSelected ? "#00E5FF" : hovered ? "#5C8BB5" : "#DE933E"}
                  metalness={0.65}
                  roughness={0.3}
                  emissive={isSelected ? "#00E5FF" : hovered ? statusColor : "#241608"}
                  emissiveIntensity={isSelected ? 0.35 : 0.06}
                />
                {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
              </mesh>
              {/* Spherical End Caps */}
              <mesh position={[-0.65, 0.58, z]}>
                <sphereGeometry args={[0.35, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#DE933E" metalness={0.65} />
              </mesh>
              <mesh position={[0.65, 0.58, z]} rotation={[0, Math.PI, 0]}>
                <sphereGeometry args={[0.35, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#DE933E" metalness={0.65} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ========================================================
          8. BIFACIAL POLAR SOLAR ARRAY
      ======================================================== */}
      {asset.id === "solar-array" && (
        <group position={[0, 0, 0]}>
          {/* Galvanized ground pylons */}
          {[-0.8, 0, 0.8].map((x) => (
            <mesh key={`pylon-${x}`} position={[x, 0.35, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.7, 6]} />
              <primitive object={darkStructuralMat} />
            </mesh>
          ))}

          {/* Tilted Solar PV Table (35-degree polar tilt) */}
          <group position={[0, 0.75, 0]} rotation={[-0.6, 0.15, 0]}>
            <mesh>
              <boxGeometry args={[2.2, 0.04, 1.3]} />
              <meshStandardMaterial
                color="#153255"
                metalness={0.85}
                roughness={0.15}
                emissive={isSelected ? "#00E5FF" : "#0A1B30"}
                emissiveIntensity={isSelected ? 0.35 : 0.05}
              />
              {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
            </mesh>
            {/* Silicon Cell Grid Lines */}
            <mesh position={[0, 0.025, 0]}>
              <planeGeometry args={[2.1, 1.2]} />
              <meshStandardMaterial color="#00E5FF" wireframe />
            </mesh>
          </group>
        </group>
      )}

      {/* ========================================================
          9. SATELLITE VSAT TRACKING RADOME / DISH
      ======================================================== */}
      {asset.id === "antenna-01" && (
        <group position={[0, 0, 0]}>
          {/* Raised Pedestal */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 0.8, 12]} />
            <primitive object={darkStructuralMat} />
          </mesh>

          {/* Geodesic Tracking Radome Sphere */}
          <mesh position={[0, 1.25, 0]}>
            <sphereGeometry args={[0.65, 18, 18]} />
            <meshStandardMaterial
              color="#F2F7FA"
              roughness={0.3}
              metalness={0.15}
              emissive={isSelected ? "#00E5FF" : hovered ? statusColor : "#12202E"}
              emissiveIntensity={isSelected ? 0.35 : 0.05}
            />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>
        </group>
      )}

      {/* ========================================================
          10. IMD AUTOMATIC WEATHER STATION (AWS) MAST
      ======================================================== */}
      {asset.id === "met-mast" && (
        <group position={[0, 0, 0]}>
          {/* Guyed Lattice Mast */}
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.03, 0.06, 2.2, 6]} />
            <meshStandardMaterial color="#3E5269" metalness={0.7} />
          </mesh>

          {/* Anemometer Crossarm */}
          <mesh position={[0, 2.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
            <meshStandardMaterial color="#FFB833" metalness={0.5} />
          </mesh>

          {/* Wind Vane & Pyranometer Sensor Orbs */}
          {[-0.32, 0.32].map((x, i) => (
            <mesh key={`sensor-${i}`} position={[x, 2.1, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* ========================================================
          11. COLD STORAGE DEPOT / SPARE WAREHOUSE
      ======================================================== */}
      {asset.id === "bld-storage" && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.9, 0.9, 1.2]} />
            <meshStandardMaterial
              color={isSelected ? "#00E5FF" : hovered ? "#5C8BB5" : "#455C75"}
              metalness={0.6}
              roughness={0.38}
              emissive={isSelected ? "#00E5FF" : hovered ? statusColor : "#101D2C"}
              emissiveIntensity={isSelected ? 0.35 : 0.05}
            />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>
          {/* Roller Shutter Door */}
          <mesh position={[0.96, 0.45, 0]}>
            <boxGeometry args={[0.02, 0.65, 0.7]} />
            <meshStandardMaterial color="#263649" metalness={0.85} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          12. FOOD & MEDICAL CONTAINER STORES
      ======================================================== */}
      {asset.id === "log-food" && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.1, 0.7, 0.65]} />
            <meshStandardMaterial
              color={isSelected ? "#00E5FF" : hovered ? "#5C8BB5" : "#3A7A64"}
              metalness={0.65}
              roughness={0.35}
              emissive={isSelected ? "#00E5FF" : hovered ? statusColor : "#0E241B"}
              emissiveIntensity={isSelected ? 0.35 : 0.05}
            />
            {isSelected && <Edges threshold={15} color="#FFFFFF" linewidth={2} />}
          </mesh>
        </group>
      )}

      {/* Status Beacon Orb on Top of Asset */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={isSelected ? 1.4 : 0.6}
        />
      </mesh>

      {/* ========================================================
          FLOATING 3D LABEL:
          ONLY VISIBLE WHEN USER CLICKS THIS PARTICULAR ASSET!
          Prevents messy cluttering of the 3D scene.
      ======================================================== */}
      {isSelected && (
        <Html position={[0, 2.65, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <div className="px-3 py-1.5 rounded-lg bg-[#0E1726]/95 border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center gap-2 whitespace-nowrap text-white">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: statusColor }}
              />
              <span className="font-mono text-xs font-black text-[#00E5FF]">
                {asset.shortId}
              </span>
              <span className="text-white/40">|</span>
              <span className="text-xs font-bold text-white">{asset.name}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                style={{
                  backgroundColor: `${statusColor}25`,
                  color: statusColor,
                }}
              >
                {data.healthPct}%
              </span>
            </div>
            {/* Small downward pointer triangle */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#00E5FF]" />
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Polar Antarctic Ice Sheet Terrain ── */
function PolarTerrain({ stationId }: { stationId: "maitri" | "bharati" }) {
  return (
    <group>
      {/* Polar Ice Shelf Foundation */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[20, 21, 0.25, 64]} />
        <meshStandardMaterial
          color="#121E2C"
          roughness={0.82}
          metalness={0.15}
          flatShading
        />
      </mesh>

      {/* Polar Coordinate Concentric Range Rings */}
      <polarGridHelper
        args={[18, 6, 8, 64, "#00E5FF", "#1F354D"]}
        position={[0, 0.08, 0]}
      />

      {/* Helicopter Landing Zone (Helipad) with 'H' Ring */}
      <group position={[7.5, 0.08, -4.0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.8, 32]} />
          <meshStandardMaterial color="#1A2C3E" roughness={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.6, 1.75, 32]} />
          <meshBasicMaterial color="#FFB833" />
        </mesh>
      </group>

      {/* Distant Antarctic Nunatak Peaks (Mountain Ridges) */}
      {[
        { pos: [-12, 0, -11], s: [6, 2.2, 4] },
        { pos: [12, 0, -12], s: [7, 2.8, 5] },
        { pos: [-13, 0, 9], s: [5, 1.8, 3.5] },
        { pos: [11, 0, 10], s: [5.5, 1.6, 3] },
      ].map((ridge, i) => (
        <mesh
          key={i}
          position={ridge.pos as [number, number, number]}
          scale={ridge.s as [number, number, number]}
        >
          <coneGeometry args={[1, 1, 5]} />
          <meshStandardMaterial color="#15273C" flatShading roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export const Twin3DCanvas: React.FC<Twin3DCanvasProps> = ({
  stationId,
  assets,
  selectedAsset,
  onSelectAsset,
  activeLayers,
  autoRotate,
  wireframe,
  focusTarget,
  resetTrigger,
}) => {
  // Filter visible assets based on active layer toggles
  const visibleAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (asset.layer === "energy" && !activeLayers.energy) return false;
      if (asset.layer === "infrastructure" && !activeLayers.infrastructure) return false;
      if (asset.layer === "environment" && !activeLayers.environment) return false;
      if (asset.layer === "logistics" && !activeLayers.logistics) return false;
      if (asset.layer === "communication" && !activeLayers.communication) return false;
      return true;
    });
  }, [assets, activeLayers]);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [14, 11, 15], fov: 42 }}
      style={{ width: "100%", height: "100%", background: "#0E1726" }}
    >
      {/* Balanced Technical Polar Lighting - Clear, Depth-rich, Never Flat */}
      <ambientLight intensity={0.9} color="#D1E2F2" />
      <hemisphereLight args={["#88B0D8", "#142232", 0.6]} />
      <directionalLight position={[12, 18, 10]} intensity={1.5} color="#FFFBF5" castShadow />
      <directionalLight position={[-10, 10, -8]} intensity={0.65} color="#00E5FF" />
      <pointLight position={[0, 9, 0]} intensity={0.6} color="#E8F1FA" distance={35} />

      <CameraController
        focusTarget={focusTarget}
        resetTrigger={resetTrigger}
        autoRotate={autoRotate}
      />

      <PolarTerrain stationId={stationId} />

      {visibleAssets.map((asset) => (
        <ArchitecturalAssetMesh
          key={asset.id}
          asset={asset}
          stationId={stationId}
          isSelected={selectedAsset?.id === asset.id}
          wireframe={wireframe}
          onClick={() => onSelectAsset(asset)}
        />
      ))}
    </Canvas>
  );
};
