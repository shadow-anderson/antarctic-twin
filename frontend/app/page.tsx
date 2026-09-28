"use client";

import React, { useState } from "react";
import { TopBar, ConsoleTab } from "@/components/layout/TopBar";
import { OverviewPanel } from "@/components/overview/OverviewPanel";
import { AssetsPanel } from "@/components/assets/AssetsPanel";
import { WhatIfPanel } from "@/components/whatif/WhatIfPanel";
import { ForecastPanel } from "@/components/forecast/ForecastPanel";

export default function TwinConsolePage() {
  const [activeTab, setActiveTab] = useState<ConsoleTab>("overview");

  return (
    <div className="min-h-screen flex flex-col bg-ops-bg text-ops-text">
      {/* Top Operations Bar */}
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Command Center Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5 sm:p-7 lg:p-8 space-y-7">
        {activeTab === "overview" && <OverviewPanel />}
        {activeTab === "assets" && <AssetsPanel />}
        {activeTab === "whatif" && <WhatIfPanel />}
        {activeTab === "forecast" && <ForecastPanel />}
      </main>

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
              <span>Real: WMO / IMD AWS Feed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ops-amber" />
              <span>Simulated: Physics Microgrid</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ops-violet" />
              <span>Derived: Autonomous Calculus</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
