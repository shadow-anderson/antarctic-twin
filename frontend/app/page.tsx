"use client";

import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { OverviewPanel } from "@/components/overview/OverviewPanel";
import { AssetsPanel } from "@/components/assets/AssetsPanel";
import { PolarisTwinPanel } from "@/components/twin/PolarisTwinPanel";
import { WhatIfPanel } from "@/components/whatif/WhatIfPanel";
import { ForecastPanel } from "@/components/forecast/ForecastPanel";
import { LogisticsPanel } from "@/components/logistics/LogisticsPanel";
import { AlertDrawer } from "@/components/intelligence/AlertDrawer";
import { MissionReportModal } from "@/components/intelligence/MissionReportModal";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";

export default function TwinConsolePage() {
  const {
    activeTab,
    setActiveTab,
    isAlertDrawerOpen,
    setIsAlertDrawerOpen,
    isReportModalOpen,
    setIsReportModalOpen,
  } = useOperationalIntelligence();

  return (
    <div className="min-h-screen flex flex-col bg-ops-bg text-ops-text">
      {/* Top Operations Bar */}
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Command Center Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5 sm:p-7 lg:p-8 space-y-7">
        {activeTab === "overview" && <OverviewPanel />}
        {activeTab === "assets" && <AssetsPanel />}
        {activeTab === "twin" && <PolarisTwinPanel />}
        {activeTab === "whatif" && <WhatIfPanel />}
        {activeTab === "forecast" && <ForecastPanel />}
        {activeTab === "logistics" && <LogisticsPanel />}
      </main>

      {/* Operational Intelligence Overlays */}
      <AlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
      />
      <MissionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Enterprise Polar Footer */}
      <footer className="w-full border-t border-white/[0.08] bg-ops-panel/80 py-5 px-6 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ops-text-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-ops-teal" />
            <span className="font-semibold text-ops-text">
              Indian Antarctic Programme · Scientific Digital Twin
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs font-medium text-ops-text-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ops-green" />
              <span>Real: NCPOR/IMD AWS archive</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ops-amber" />
              <span>Simulated: seeded microgrid &amp; logistics model</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ops-violet" />
              <span>Derived: computed from real + simulated inputs</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
