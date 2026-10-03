"use client";

import React, { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useStation } from "@/context/StationContext";
import {
  TWIN_ASSET_REGISTRY,
  TwinAsset,
  TwinLayerId,
} from "@/lib/twinAssetRegistry";
import { TwinControlPanel } from "./TwinControlPanel";
import { TwinInspector } from "./TwinInspector";
import { SectionProvenance } from "../shared/SectionProvenance";
import {
  RadioTower,
  Thermometer,
  Wind,
  Zap,
  Battery,
  Fuel,
  Compass,
  Wifi,
  WifiOff,
  Satellite,
} from "lucide-react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";

// Dynamic import of 3D Canvas with ssr: false
const Twin3DCanvas = dynamic(
  () => import("./Twin3DCanvas").then((mod) => mod.Twin3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050811] text-white">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl border border-[#00E5FF]/40 border-t-[#00E5FF] animate-spin" />
          <Compass className="w-6 h-6 text-[#00E5FF] absolute" />
        </div>
        <span className="mt-4 text-xs font-mono uppercase tracking-[0.2em] text-[#00E5FF]">
          Loading POLARIS 3D Twin...
        </span>
        <span className="text-[10px] text-[#8B9BB4] mt-1">
          Assembling spatial digital twin architecture
        </span>
      </div>
    ),
  }
);

export const PolarisTwinPanel: React.FC = () => {
  const { selectedStation, setSelectedStation } = useStation();
  const { communicationHealth, cascadeResult, resources, isSimulationActive } = useOperationalIntelligence();

  // Active layers (8 layers)
  const [activeLayers, setActiveLayers] = useState<Record<TwinLayerId, boolean>>({
    energy: true,
    infrastructure: true,
    environment: true,
    logistics: true,
    communication: true,
    assetHealth: true,
    alerts: true,
    dataFlow: true,
  });

  // Selected asset for right inspector (defaults to null so 3D is completely clear!)
  const [selectedAsset, setSelectedAsset] = useState<TwinAsset | null>(null);

  // Camera focus target coordinates [x, y, z]
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Display options
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [wireframe, setWireframe] = useState<boolean>(false);

  // Category filter for bottom tabs
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Toggle individual layers
  const handleToggleLayer = useCallback((layerId: TwinLayerId) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  // Handle asset click from 3D canvas
  const handleSelectAsset = useCallback((asset: TwinAsset) => {
    setSelectedAsset(asset);
    setFocusTarget(asset.position);
  }, []);

  // Handle dependency click in inspector
  const handleSelectDependency = useCallback((assetId: string) => {
    const found = TWIN_ASSET_REGISTRY.find((a) => a.id === assetId);
    if (found) {
      setSelectedAsset(found);
      setFocusTarget(found.position);
    }
  }, []);

  // Camera presets
  const handleFocusPreset = useCallback(
    (preset: "overview" | "generator" | "battery" | "habitation" | "water" | "fuel" | "weather") => {
      switch (preset) {
        case "overview":
          setSelectedAsset(null);
          setResetTrigger((prev) => prev + 1);
          setFocusTarget(null);
          break;
        case "generator": {
          const gen = TWIN_ASSET_REGISTRY.find((a) => a.id === "gen-01");
          if (gen) {
            setSelectedAsset(gen);
            setFocusTarget(gen.position);
          }
          break;
        }
        case "battery": {
          const bat = TWIN_ASSET_REGISTRY.find((a) => a.id === "battery-sys");
          if (bat) {
            setSelectedAsset(bat);
            setFocusTarget(bat.position);
          }
          break;
        }
        case "habitation": {
          const hab = TWIN_ASSET_REGISTRY.find((a) => a.id === "bld-main");
          if (hab) {
            setSelectedAsset(hab);
            setFocusTarget(hab.position);
          }
          break;
        }
        case "water": {
          const w = TWIN_ASSET_REGISTRY.find((a) => a.id === "water-pump");
          if (w) {
            setSelectedAsset(w);
            setFocusTarget(w.position);
          }
          break;
        }
        case "fuel": {
          const f = TWIN_ASSET_REGISTRY.find((a) => a.id === "log-diesel");
          if (f) {
            setSelectedAsset(f);
            setFocusTarget(f.position);
          }
          break;
        }
        case "weather": {
          const aws = TWIN_ASSET_REGISTRY.find((a) => a.id === "met-mast");
          if (aws) {
            setSelectedAsset(aws);
            setFocusTarget(aws.position);
          }
          break;
        }
      }
    },
    []
  );

  // Filtered assets
  const filteredAssets = useMemo(() => {
    if (categoryFilter === "ALL") return TWIN_ASSET_REGISTRY;
    return TWIN_ASSET_REGISTRY.filter(
      (a) => a.category.toUpperCase() === categoryFilter
    );
  }, [categoryFilter]);

  // Telemetry ticker values for active station — dynamically derived from simulation & resource state
  const stationTicker = useMemo(() => {
    const fuelRes = resources.find((r) => r.id === "fuel");
    const fuelDays = fuelRes?.daysRemaining ?? (selectedStation === "maitri" ? 8.4 : 11.6);
    const bessKwh = selectedStation === "maitri" ? "360kWh" : "480kWh";

    if (isSimulationActive && cascadeResult) {
      const isBlizzard = cascadeResult.scenarioId === "blizzard";
      const isHighWind = cascadeResult.scenarioId === "high_wind";
      const windSpeed = isBlizzard ? "34.0 m/s" : isHighWind ? "24.5 m/s" : (selectedStation === "maitri" ? "11.4 m/s" : "8.7 m/s");
      return {
        temp: `${cascadeResult.temperatureC.simulated}°C`,
        wind: windSpeed,
        power: `${cascadeResult.energyConsumptionPct.simulatedKw} kW`,
        bess: `${cascadeResult.batterySocPct.simulated}% (${bessKwh})`,
        fuel: `${fuelDays} days`,
      };
    }

    const baselineTemp = cascadeResult?.temperatureC.baseline ?? (selectedStation === "maitri" ? -14.2 : -8.6);
    const baselinePower = selectedStation === "maitri" ? 218 : 232;
    const baselineSoc = cascadeResult?.batterySocPct.baseline ?? (selectedStation === "maitri" ? 68 : 74);

    return {
      temp: `${baselineTemp}°C`,
      wind: selectedStation === "maitri" ? "11.4 m/s" : "8.7 m/s",
      power: `${baselinePower} kW`,
      bess: `${baselineSoc}% (${bessKwh})`,
      fuel: `${fuelDays} days`,
    };
  }, [selectedStation, isSimulationActive, cascadeResult, resources]);

  return (
    <div className="space-y-3 pb-8">
      {/* ============================================================
          TOP TELEMETRY & COMMAND TICKER
      ============================================================ */}
      <section className="relative overflow-hidden rounded-[22px] border border-[#203047]/70 bg-[#0E1726]/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Station Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]">
              <RadioTower className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
                  POLARIS 3D Digital Twin
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                  {selectedStation === "maitri" ? "Maitri Station" : "Bharati Station"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Interactive 3D spatial twin • Click an asset to focus camera &amp; view telemetry
              </p>
            </div>
          </div>

          {/* Real-time Ticker Metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 pt-2 lg:pt-0 border-white/10">
            <div className="flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-[#00E5FF]" />
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-medium">
                  Ambient
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-100">
                  {stationTicker.temp}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-[#2979FF]" />
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-medium">
                  Wind
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-100">
                  {stationTicker.wind}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#FFAB00]" />
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-medium">
                  Load
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-100">
                  {stationTicker.power}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Battery className="w-3.5 h-3.5 text-[#00E676]" />
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-medium">
                  BESS
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-100">
                  {stationTicker.bess}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Fuel className="w-3.5 h-3.5 text-[#FF9100]" />
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-medium">
                  Fuel Days
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-100">
                  {stationTicker.fuel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          DOMINANT 3D VIEWPORT (Full-Height, Wide Canvas)
      ============================================================ */}
      <section className="relative w-full h-[720px] sm:h-[780px] lg:h-[820px] rounded-[26px] border border-[#22354D]/70 bg-[#0E1726] overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.55)]">
        {/* Floating Left Control Panel (Pushed to far left, collapsible) */}
        <TwinControlPanel
          stationId={selectedStation}
          onStationChange={setSelectedStation}
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
          onFocusPreset={handleFocusPreset}
          onResetCamera={() => {
            setSelectedAsset(null);
            setResetTrigger((prev) => prev + 1);
          }}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
          wireframe={wireframe}
          onToggleWireframe={() => setWireframe((prev) => !prev)}
        />

        {/* Communication Health Layer Visualizer (Feature 14.5) */}
        {activeLayers.communication && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0B1320]/90 border border-[#22354D] backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-slate-100 uppercase">
                {selectedStation === "maitri" ? "Maitri Base" : "Bharati Base"}
              </span>
            </div>

            {/* Visual Animated Connection Flow */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/5">
              {communicationHealth.status === "CONNECTED" ? (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="w-6 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-wider">{communicationHealth.latencyMs}ms · NORMAL FLOW</span>
                  <span className="w-6 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              ) : communicationHealth.status === "DEGRADED" ? (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="w-6 h-0.5 border-t border-dashed border-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-wider">
                    {communicationHealth.latencyMs}ms · DEGRADED FLOW
                  </span>
                  <span className="w-6 h-0.5 border-t border-dashed border-amber-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-400">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono font-bold tracking-wider">CARRIER LINK BROKEN</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="font-mono text-[10px] text-slate-300">ISRO Sat Link</span>
            </div>
          </div>
        )}

        {/* 3D Scene Viewport */}
        <div className="w-full h-full">
          <Twin3DCanvas
            stationId={selectedStation}
            assets={filteredAssets}
            selectedAsset={selectedAsset}
            onSelectAsset={handleSelectAsset}
            activeLayers={activeLayers}
            autoRotate={autoRotate}
            wireframe={wireframe}
            focusTarget={focusTarget}
            resetTrigger={resetTrigger}
          />
        </div>

        {/* Floating Right Inspector Panel (Pushed to far right, ONLY renders when asset is selected!) */}
        <TwinInspector
          asset={selectedAsset}
          stationId={selectedStation}
          onClose={() => setSelectedAsset(null)}
          onSelectDependency={handleSelectDependency}
        />

        {/* Bottom Subsystem Filter Tabs */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-[#111C2E]/90 border border-[#22354D]/70 backdrop-blur-md shadow-2xl">
          {["ALL", "POWER", "STRUCTURE", "WATER", "LOGISTICS", "SCIENCE"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[#00E5FF] text-[#0A121E] shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
        <span>Click any 3D asset to focus camera and inspect live telemetry</span>
        <SectionProvenance source="derived" origin="POLARIS 3D spatial twin & CAD subsystem model" />
      </div>
    </div>
  );
};
