"use client";

import React, { useState, useEffect } from "react";
import { AssetNode, AssetDetail } from "@/lib/types";
import { getAssetTree, getAssetDetail } from "@/lib/api";
import { AssetTree } from "./AssetTree";
import { AssetDetailPanel } from "./AssetDetailPanel";
import {
  Activity,
  Network,
  ShieldCheck,
  HardDrive,
  Menu,
} from "lucide-react";

export const AssetsPanel: React.FC = () => {
  const [treeData, setTreeData] = useState<AssetNode[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    "gen-01"
  );
  const [selectedDetail, setSelectedDetail] =
    useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Controls visibility of the left hierarchy
  const [showHierarchy, setShowHierarchy] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getAssetTree(),
      getAssetDetail("gen-01"),
    ]).then(([nodes, detail]) => {
      if (isMounted) {
        setTreeData(nodes);
        setSelectedDetail(detail);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectNode = async (node: AssetNode) => {
    setSelectedAssetId(node.id);

    const detail = await getAssetDetail(node.id);

    setSelectedDetail(detail);
  };

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center rounded-[28px] border border-[#D8E3E5] bg-gradient-to-br from-[#F1F6F7] to-[#E8F0F2]">
        <div className="flex flex-col items-center gap-4 text-[#657984]">

          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DCEBED]">
            <Network className="w-5 h-5 text-[#4B7F91] animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#4B7F91] border-t-transparent rounded-full animate-spin" />

            <span className="font-medium text-sm">
              Loading Asset Subsystem Hierarchy...
            </span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          MAIN HEADER
      ===================================================== */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#D5E1E3] bg-gradient-to-br from-[#EEF5F6] via-[#F3F6F5] to-[#E9F0F2] p-6 lg:p-7 shadow-[0_7px_26px_rgba(45,65,75,0.06)]">

        {/* Decorative background */}
        <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#8FBFC8]/15 blur-3xl pointer-events-none" />

        <div className="absolute -bottom-28 left-1/3 w-60 h-60 rounded-full bg-[#B9ADD0]/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">

          {/* Title */}
          <div className="flex items-start gap-4">

            <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl bg-[#DCEBED] text-[#477C8D]">
              <HardDrive className="w-6 h-6 stroke-[1.7]" />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2 mb-1">

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#304955]">
                  Subsystem Asset Digital Twin
                </h2>

                <span className="px-2.5 py-1 rounded-full bg-[#E5EDF0] border border-[#D4E1E4] text-[9px] font-bold uppercase tracking-[0.12em] text-[#66808A]">
                  Asset Registry
                </span>

              </div>

              <p className="text-xs sm:text-sm text-[#71838C] max-w-2xl">
                Inspect physical station components, mechanical state, and
                operational health.
              </p>

            </div>
          </div>

          {/* Header stats */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Tracked */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F1EA] border border-[#E6DDCB]">

              <HardDrive className="w-4 h-4 text-[#A17A3E]" />

              <div>
                <span className="block text-[9px] uppercase tracking-wider font-bold text-[#8C806B]">
                  Tracked
                </span>

                <span className="block text-xs font-bold text-[#665B49]">
                  13 Nodes
                </span>
              </div>

            </div>

            {/* Monitoring */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E5F0EA] border border-[#D1E1D7]">

              <Activity className="w-4 h-4 text-[#4E8067]" />

              <div>
                <span className="block text-[9px] uppercase tracking-wider font-bold text-[#71867B]">
                  Status
                </span>

                <span className="flex items-center gap-1.5 text-xs font-bold text-[#52705F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F8A6B]" />
                  Monitoring
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          ASSET WORKSPACE
      ===================================================== */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          showHierarchy ? "lg:grid-cols-12" : "lg:grid-cols-1"
        }`}
      >

        {/* =================================================
            LEFT — ASSET HIERARCHY
        ================================================= */}
        {showHierarchy && (
          <div className="lg:col-span-5 xl:col-span-4 min-h-[480px]">

            <div className="h-full rounded-[26px] border border-[#D8E2E4] bg-gradient-to-br from-[#F3F7F7] to-[#EDF3F4] p-1.5 shadow-[0_6px_22px_rgba(45,65,75,0.05)]">

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
            showHierarchy
              ? "lg:col-span-7 xl:col-span-8"
              : "lg:col-span-1"
          } relative`}
        >

          {/* =================================================
              REOPEN HIERARCHY BUTTON
          ================================================= */}
          {!showHierarchy && (
            <button
              type="button"
              onClick={() => setShowHierarchy(true)}
              aria-label="Show asset hierarchy"
              title="Show asset hierarchy"
              className="absolute -left-3 top-5 z-30 flex items-center justify-center w-9 h-9 rounded-xl bg-[#DCEBED] border border-[#BFD4D8] text-[#456F7B] shadow-[0_3px_10px_rgba(45,65,75,0.15)] hover:bg-[#CFE2E6] hover:text-[#315B67] transition-all duration-200 cursor-pointer"
            >
              <Menu
                className="w-5 h-5"
                strokeWidth={2.5}
              />
            </button>
          )}

          <div className="h-full rounded-[26px] border border-[#DCD8E5] bg-gradient-to-br from-[#F5F3F8] via-[#F3F5F6] to-[#EDF2F3] p-1.5 shadow-[0_6px_22px_rgba(60,55,75,0.05)]">

            {/* Details header */}
            <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">

              <div className="flex items-center gap-2">

                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E8E1F0] text-[#75689B]">
                  <ShieldCheck className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5962]">
                    Asset Diagnostics
                  </h3>

                  <p className="text-[10px] text-[#899399]">
                    Selected component details
                  </p>
                </div>

              </div>

              {/* Live Registry */}
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7F0EA] border border-[#D4E2D9] text-[9px] font-bold uppercase tracking-wider text-[#5F786A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#52856A]" />
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