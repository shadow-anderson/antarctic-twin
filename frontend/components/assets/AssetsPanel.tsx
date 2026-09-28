"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AssetNode, AssetDetail, AssetStatus } from "@/lib/types";
import { getAssetTree, getAssetDetail } from "@/lib/api";
import { useStation } from "@/context/StationContext";
import { AssetTree } from "./AssetTree";
import { AssetDetailPanel } from "./AssetDetailPanel";
import { SchematicLoader } from "./schematic/SchematicLoader";
import { SourceBadge } from "../shared/SourceBadge";
import {
  Activity,
  Network,
  ShieldCheck,
  HardDrive,
  Menu,
  AlertTriangle,
  Box,
  Layers,
} from "lucide-react";
import { SectionProvenance } from "../shared/SectionProvenance";

export const AssetsPanel: React.FC = () => {
  /* =========================================================
     SELECTED STATION
  ========================================================= */
  const { selectedStation } = useStation();

  /* =========================================================
     ASSET STATE
  ========================================================= */
  const [treeData, setTreeData] = useState<AssetNode[]>([]);

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    "gen-01"
  );

  const [selectedDetail, setSelectedDetail] =
    useState<AssetDetail | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  // Controls visibility of the left hierarchy
  const [showHierarchy, setShowHierarchy] = useState<boolean>(true);

  // Schematic vs Hierarchy view mode
  type ViewMode = "hierarchy" | "schematic";
  const searchParams = useSearchParams();
  const force2D = searchParams.get("schematic") === "2d";
  const [viewMode, setViewMode] = useState<ViewMode>(
    force2D ? "schematic" : "hierarchy"
  );

  /* =========================================================
     FLATTEN TREE → flat asset list for schematic
  ========================================================= */
  const flatAssets = useMemo(() => {
    const result: { id: string; status: AssetStatus }[] = [];
    const walk = (nodes: AssetNode[]) => {
      for (const n of nodes) {
        if (n.children && n.children.length > 0) {
          walk(n.children);
        } else {
          result.push({ id: n.id, status: n.status ?? "healthy" });
        }
      }
    };
    walk(treeData);
    return result;
  }, [treeData]);

  /* =========================================================
     LOAD ASSETS FOR SELECTED STATION
  ========================================================= */
  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const [nodes, detail] = await Promise.all([
          getAssetTree(selectedStation),
          getAssetDetail(selectedStation, "gen-01"),
        ]);

        if (isMounted) {
          setTreeData(nodes);
          setSelectedAssetId("gen-01");
          setSelectedDetail(detail);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(
            `Failed to load asset data for station "${selectedStation}":`,
            err
          );

          setError(
            err?.message ??
              `Failed to load asset data for ${selectedStation}`
          );

          setLoading(false);
        }
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [selectedStation]);

  /* =========================================================
     SELECT ASSET
  ========================================================= */
  const handleSelectNode = async (node: AssetNode) => {
    // Only leaf assets should open diagnostics.
    // Folder/category nodes have children.
    if (node.children && node.children.length > 0) {
      return;
    }

    setSelectedAssetId(node.id);

    try {
      const detail = await getAssetDetail(
        selectedStation,
        node.id
      );

      setSelectedDetail(detail);
    } catch (err) {
      console.error(
        `Failed to load detail for asset "${node.id}" at station "${selectedStation}":`,
        err
      );

      // Keep the previous detail visible rather than crashing
    }
  };

  /* =========================================================
     SELECT FROM SCHEMATIC (by id string)
  ========================================================= */
  const handleSchematicSelect = async (id: string) => {
    setSelectedAssetId(id);
    try {
      const detail = await getAssetDetail(selectedStation, id);
      setSelectedDetail(detail);
    } catch (err) {
      console.error(
        `Failed to load detail for asset "${id}" at station "${selectedStation}":`,
        err
      );
    }
  };

  /* =========================================================
     RETRY
  ========================================================= */
  const handleRetry = async () => {
    try {
      setError(null);
      setLoading(true);

      const [nodes, detail] = await Promise.all([
        getAssetTree(selectedStation),
        getAssetDetail(selectedStation, "gen-01"),
      ]);

      setTreeData(nodes);
      setSelectedAssetId("gen-01");
      setSelectedDetail(detail);
      setLoading(false);
    } catch (err: any) {
      console.error(
        `Retry failed for station "${selectedStation}":`,
        err
      );

      setError(
        err?.message ??
          `Failed to load asset data for ${selectedStation}`
      );

      setLoading(false);
    }
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */
  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center rounded-[28px] border border-white/[0.08] bg-ops-panel ring-1 ring-white/5">
        <div className="flex flex-col items-center gap-4 text-ops-text-2">

          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-ops-card border border-white/10 text-ops-teal shadow-inner">
            <Network className="w-5 h-5 text-ops-teal animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-ops-teal border-t-transparent rounded-full animate-spin" />

            <span className="font-medium text-sm text-ops-text">
              Loading Asset Subsystem Hierarchy...
            </span>
          </div>

        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */
  if (error) {
    return (
      <div className="min-h-[500px] flex items-center justify-center rounded-[28px] border border-ops-red/30 bg-ops-panel ring-1 ring-white/5">
        <div className="flex flex-col items-center gap-4 text-center px-8">

          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-ops-red/20 text-ops-red">
            <AlertTriangle className="w-5 h-5 text-ops-red" />
          </div>

          <div>
            <p className="font-semibold text-sm mb-1 text-white">
              Failed to load asset data
            </p>

            <p className="text-xs text-ops-text-2 max-w-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 rounded-xl bg-ops-red/20 hover:bg-ops-red/30 text-ops-red border border-ops-red/40 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Retry
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          MAIN HEADER
      ===================================================== */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-ops-panel p-6 lg:p-7 shadow-[0_7px_26px_rgba(0,0,0,0.3)] ring-1 ring-white/5">

        {/* Thin accent top line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-ops-teal via-ops-ice to-ops-violet" />

        {/* Decorative background */}
        <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-ops-teal/5 blur-3xl pointer-events-none" />

        <div className="absolute -bottom-28 left-1/3 w-60 h-60 rounded-full bg-ops-violet/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">

          {/* Title */}
          <div className="flex items-start gap-4">

            <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl bg-ops-card border border-white/10 text-ops-teal shadow-inner">
              <HardDrive className="w-6 h-6 stroke-[1.7]" />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2 mb-1">

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ops-text">
                  Subsystem Asset Digital Twin
                </h2>

                <span className="px-2.5 py-1 rounded-full bg-ops-card border border-white/10 text-[9px] font-bold uppercase tracking-[0.12em] text-ops-text-2">
                  Asset Registry
                </span>

              </div>

              <p className="text-xs sm:text-sm text-ops-text-3 max-w-2xl">
                Inspect physical station components, mechanical state, and
                operational health.
              </p>

              <div className="mt-1">
                <SectionProvenance
                  source="simulated"
                  origin="Seeded asset simulation"
                />
              </div>

            </div>
          </div>

          {/* Header stats + view toggle */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Segmented toggle: Hierarchy | 3D Schematic */}
            <div className="flex items-center rounded-xl bg-ops-card border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("hierarchy")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  viewMode === "hierarchy"
                    ? "bg-ops-teal/20 text-ops-teal border border-ops-teal/30"
                    : "text-ops-text-3 hover:text-ops-text-2"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Hierarchy
              </button>
              <button
                type="button"
                onClick={() => setViewMode("schematic")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  viewMode === "schematic"
                    ? "bg-ops-teal/20 text-ops-teal border border-ops-teal/30"
                    : "text-ops-text-3 hover:text-ops-text-2"
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                3D Schematic
              </button>
            </div>

            {/* Tracked */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ops-card border border-white/10">

              <HardDrive className="w-4 h-4 text-ops-amber" />

              <div>
                <span className="block text-[9px] uppercase tracking-wider font-bold text-ops-text-3">
                  Tracked
                </span>

                <span className="block text-xs font-bold text-ops-text">
                  13 Nodes
                </span>
              </div>

            </div>

            {/* Monitoring */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ops-card border border-white/10">

              <Activity className="w-4 h-4 text-ops-green" />

              <div>
                <span className="block text-[9px] uppercase tracking-wider font-bold text-ops-text-3">
                  Status
                </span>

                <span className="flex items-center gap-1.5 text-xs font-bold text-ops-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-ops-green" />
                  Monitoring
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          3D SCHEMATIC VIEW
      ===================================================== */}
      {viewMode === "schematic" && (
        <div className="space-y-4">
          <div className="rounded-[26px] border border-white/[0.08] bg-ops-panel overflow-hidden shadow-[0_6px_22px_rgba(0,0,0,0.3)] ring-1 ring-white/5">
            <div style={{ height: 420 }}>
              <SchematicLoader
                assets={flatAssets}
                selectedId={selectedAssetId}
                onSelect={handleSchematicSelect}
                stationId={selectedStation as "maitri" | "bharati"}
                force2D={force2D}
              />
            </div>

            {/* Caption */}
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-t border-white/[0.06]">
              <span className="text-[10px] text-ops-text-3">
                Illustrative schematic — not to scale ·
              </span>
              <span className="text-[10px] text-ops-text-3">Asset status:</span>
              <SourceBadge source="simulated" size="xs" />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ASSET WORKSPACE (hierarchy mode)
      ===================================================== */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          viewMode === "hierarchy" && showHierarchy ? "lg:grid-cols-12" : "lg:grid-cols-1"
        }`}
      >

        {/* =================================================
            LEFT — ASSET HIERARCHY (only in hierarchy mode)
        ================================================= */}
        {viewMode === "hierarchy" && showHierarchy && (
          <div className="lg:col-span-5 xl:col-span-4 min-h-[480px]">

            <div className="h-full rounded-[26px] border border-white/[0.08] bg-ops-panel p-1.5 shadow-[0_6px_22px_rgba(0,0,0,0.3)] ring-1 ring-white/5">

              <AssetTree
                nodes={treeData}
                selectedId={selectedAssetId}
                onSelectNode={handleSelectNode}
                onToggleSidebar={() => setShowHierarchy(false)}
              />

            </div>

          </div>
        )}

        {/* =================================================
            RIGHT — ASSET DIAGNOSTICS
        ================================================= */}
        <div
          className={`min-h-[480px] ${
            viewMode === "hierarchy" && showHierarchy
              ? "lg:col-span-7 xl:col-span-8"
              : "lg:col-span-1"
          } relative`}
        >

          {/* =================================================
              REOPEN HIERARCHY BUTTON
          ================================================= */}
          {viewMode === "hierarchy" && !showHierarchy && (
            <button
              type="button"
              onClick={() => setShowHierarchy(true)}
              aria-label="Show asset hierarchy"
              title="Show asset hierarchy"
              className="absolute -left-3 top-5 z-30 flex items-center justify-center w-9 h-9 rounded-xl bg-ops-card border border-white/10 text-ops-teal shadow-[0_3px_10px_rgba(0,0,0,0.3)] hover:bg-ops-card/80 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <Menu
                className="w-5 h-5"
                strokeWidth={2.5}
              />
            </button>
          )}

          <div className="h-full rounded-[26px] border border-white/[0.08] bg-ops-panel p-1.5 shadow-[0_6px_22px_rgba(0,0,0,0.3)] ring-1 ring-white/5">

            {/* Details header */}
            <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">

              <div className="flex items-center gap-2">

                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-ops-card border border-white/10 text-ops-violet">
                  <ShieldCheck className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ops-text">
                    Asset Diagnostics
                  </h3>

                  <p className="text-[10px] text-ops-text-3">
                    Selected component details
                  </p>
                </div>

              </div>

              {/* Live Registry */}
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ops-green/15 border border-ops-green/30 text-[9px] font-bold uppercase tracking-wider text-ops-green">
                <span className="w-1.5 h-1.5 rounded-full bg-ops-green" />
                Live Registry
              </span>

            </div>

            <AssetDetailPanel asset={selectedDetail} />

          </div>
        </div>

      </div>
    </div>
  );
};