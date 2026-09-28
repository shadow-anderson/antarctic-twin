"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AssetStatus } from "@/lib/types";
import { SchematicFallback } from "./SchematicFallback";
import { SchematicErrorBoundary } from "./SchematicErrorBoundary";

/* ─── Skeleton shown while the 3D chunk loads ─── */
const SchematicSkeleton: React.FC = () => (
  <div
    className="flex items-center justify-center rounded-2xl animate-pulse"
    style={{ height: 420, background: "#0D2130" }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-ops-card border border-white/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-ops-teal animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31 31" />
        </svg>
      </div>
      <span className="text-xs font-medium text-ops-text-2">Loading 3D Schematic…</span>
    </div>
  </div>
);

/* ─── Lazy-load StationSchematic – keeps three.js out of main bundle ─── */
const StationSchematic3D = dynamic(
  () =>
    import("./StationSchematic").then((mod) => mod.StationSchematic),
  {
    ssr: false,
    loading: () => <SchematicSkeleton />,
  }
);

/* ─── Detect WebGL support ─── */
function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("webgl2")
    );
  } catch {
    return false;
  }
}

/* ═══════════════════════════════════════════
   PUBLIC WRAPPER
   ═══════════════════════════════════════════ */
interface SchematicLoaderProps {
  assets: { id: string; status: AssetStatus }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  stationId: "maitri" | "bharati";
  force2D?: boolean;
}

export const SchematicLoader: React.FC<SchematicLoaderProps> = ({
  assets,
  selectedId,
  onSelect,
  stationId,
  force2D = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <SchematicSkeleton />;
  }

  const use2D = force2D || !hasWebGL();

  if (use2D) {
    return (
      <SchematicFallback
        assets={assets}
        selectedId={selectedId}
        onSelect={onSelect}
        stationId={stationId}
      />
    );
  }

  return (
    <SchematicErrorBoundary
      key={stationId}
      fallback={
        <SchematicFallback
          assets={assets}
          selectedId={selectedId}
          onSelect={onSelect}
          stationId={stationId}
        />
      }
    >
      <StationSchematic3D
        assets={assets}
        selectedId={selectedId}
        onSelect={onSelect}
        stationId={stationId}
      />
    </SchematicErrorBoundary>
  );
};
