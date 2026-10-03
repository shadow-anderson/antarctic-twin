"use client";

import React, { useState } from "react";
import { TwinLayerId, TWIN_LAYERS } from "@/lib/twinAssetRegistry";
import {
  Layers,
  RotateCcw,
  Camera,
  Radio,
  Sliders,
  Compass,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

interface TwinControlPanelProps {
  stationId: "maitri" | "bharati";
  onStationChange: (stationId: "maitri" | "bharati") => void;
  activeLayers: Record<TwinLayerId, boolean>;
  onToggleLayer: (layerId: TwinLayerId) => void;
  onFocusPreset: (preset: "overview" | "generator" | "battery" | "habitation" | "water" | "fuel" | "weather") => void;
  onResetCamera: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
}

export const TwinControlPanel: React.FC<TwinControlPanelProps> = ({
  stationId,
  onStationChange,
  activeLayers,
  onToggleLayer,
  onFocusPreset,
  onResetCamera,
  autoRotate,
  onToggleAutoRotate,
  wireframe,
  onToggleWireframe,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If collapsed, render a minimal floating dock on the far left edge
  if (isCollapsed) {
    return (
      <aside className="absolute top-4 left-3 z-30 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="w-10 h-10 rounded-xl bg-[#0A101C]/90 hover:bg-[#2979FF]/30 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center shadow-2xl backdrop-blur-md transition-all cursor-pointer"
          title="Expand Control Panel"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onResetCamera}
          className="w-10 h-10 rounded-xl bg-[#0A101C]/90 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleAutoRotate}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-2xl backdrop-blur-md transition-all cursor-pointer ${
            autoRotate
              ? "bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]"
              : "bg-[#0A101C]/90 border-white/15 text-[#8B9BB4] hover:text-white"
          }`}
          title="Toggle Orbit Rotation"
        >
          <Compass className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="absolute top-4 left-3 bottom-4 w-60 sm:w-64 rounded-2xl border border-white/15 bg-[#0A101C]/85 backdrop-blur-xl shadow-[0_12px_45px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.1)] z-20 flex flex-col overflow-hidden text-white transition-all duration-300"
      aria-label="3D Twin Controls"
    >
      {/* Top Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#00E676]" />

      {/* Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2979FF]/20 border border-[#2979FF]/40 flex items-center justify-center text-[#00E5FF]">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-white">
              Twin Controls
            </h2>
            <p className="text-[9px] text-[#8B9BB4]">POLARIS Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onResetCamera}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#8B9BB4] hover:text-white text-[10px] transition-colors cursor-pointer"
            title="Reset Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#8B9BB4] hover:text-white text-[10px] transition-colors cursor-pointer"
            title="Collapse Panel"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar text-xs">
        {/* Station Selector */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#8B9BB4] mb-1.5 flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#00E5FF]" />
            Station Select
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-0.5 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => onStationChange("maitri")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                stationId === "maitri"
                  ? "bg-[#2979FF] text-white shadow-[0_0_10px_rgba(41,121,255,0.5)]"
                  : "text-[#8B9BB4] hover:text-white hover:bg-white/5"
              }`}
            >
              Maitri
            </button>
            <button
              type="button"
              onClick={() => onStationChange("bharati")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                stationId === "bharati"
                  ? "bg-[#2979FF] text-white shadow-[0_0_10px_rgba(41,121,255,0.5)]"
                  : "text-[#8B9BB4] hover:text-white hover:bg-white/5"
              }`}
            >
              Bharati
            </button>
          </div>
        </div>

        {/* Camera Preset Quick Jumps */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#8B9BB4] mb-1.5 flex items-center gap-1">
            <Camera className="w-3 h-3 text-[#00E5FF]" />
            Quick Presets
          </label>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onFocusPreset("overview")}
              className="col-span-2 py-1 px-2 rounded-lg bg-black/40 hover:bg-[#2979FF]/20 border border-white/10 hover:border-[#00E5FF]/40 text-left text-[10px] font-medium text-white transition-all cursor-pointer"
            >
              Station Overview
            </button>
            <button
              type="button"
              onClick={() => onFocusPreset("generator")}
              className="py-1 px-2 rounded-lg bg-black/40 hover:bg-[#2979FF]/20 border border-white/10 hover:border-[#00E5FF]/40 text-left text-[10px] font-medium text-white transition-all cursor-pointer"
            >
              Generators
            </button>
            <button
              type="button"
              onClick={() => onFocusPreset("battery")}
              className="py-1 px-2 rounded-lg bg-black/40 hover:bg-[#2979FF]/20 border border-white/10 hover:border-[#00E5FF]/40 text-left text-[10px] font-medium text-white transition-all cursor-pointer"
            >
              Battery BESS
            </button>
            <button
              type="button"
              onClick={() => onFocusPreset("habitation")}
              className="py-1 px-2 rounded-lg bg-black/40 hover:bg-[#2979FF]/20 border border-white/10 hover:border-[#00E5FF]/40 text-left text-[10px] font-medium text-white transition-all cursor-pointer"
            >
              Habitation
            </button>
            <button
              type="button"
              onClick={() => onFocusPreset("water")}
              className="py-1 px-2 rounded-lg bg-black/40 hover:bg-[#2979FF]/20 border border-white/10 hover:border-[#00E5FF]/40 text-left text-[10px] font-medium text-white transition-all cursor-pointer"
            >
              Water System
            </button>
            <button
              type="button"
              onClick={() => onFocusPreset("fuel")}
              className="py-1 px-2 rounded-lg bg-black/40 hover:bg-[#2979FF]/20 border border-white/10 hover:border-[#00E5FF]/40 text-left text-[10px] font-medium text-white transition-all cursor-pointer"
            >
              Fuel Storage
            </button>
            <button
              type="button"
              onClick={() => onFocusPreset("weather")}
              className="py-1 px-2 rounded-lg bg-black/40 hover:bg-[#2979FF]/20 border border-white/10 hover:border-[#00E5FF]/40 text-left text-[10px] font-medium text-white transition-all cursor-pointer"
            >
              Weather Mast
            </button>
          </div>
        </div>

        {/* 8 Visualization Layers */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-[#8B9BB4] flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#00E5FF]" />
              Layers
            </label>
            <span className="text-[9px] text-[#00E5FF] font-mono">
              {Object.values(activeLayers).filter(Boolean).length}/8
            </span>
          </div>

          <div className="space-y-1 rounded-xl bg-black/40 border border-white/10 p-1.5">
            {TWIN_LAYERS.map((layer) => {
              const active = activeLayers[layer.id];
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => onToggleLayer(layer.id)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-left transition-all cursor-pointer ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-[#8B9BB4] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {active ? (
                      <CheckSquare className="w-3 h-3 text-[#00E5FF]" />
                    ) : (
                      <Square className="w-3 h-3 text-[#8B9BB4]" />
                    )}
                    <span className="text-[10px] font-semibold">{layer.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Toggles */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#8B9BB4] mb-1.5 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[#00E5FF]" />
            Display
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onToggleAutoRotate}
              className={`py-1 px-2 rounded-lg border text-[10px] font-semibold text-center transition-all cursor-pointer ${
                autoRotate
                  ? "bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]"
                  : "bg-black/40 border-white/10 text-[#8B9BB4] hover:text-white"
              }`}
            >
              Rotate
            </button>
            <button
              type="button"
              onClick={onToggleWireframe}
              className={`py-1 px-2 rounded-lg border text-[10px] font-semibold text-center transition-all cursor-pointer ${
                wireframe
                  ? "bg-[#2979FF]/20 border-[#2979FF] text-[#2979FF]"
                  : "bg-black/40 border-white/10 text-[#8B9BB4] hover:text-white"
              }`}
            >
              Wireframe
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
