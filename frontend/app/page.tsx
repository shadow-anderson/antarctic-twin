"use client";

import React, { useState } from "react";
import { TopBar, ConsoleTab } from "@/components/layout/TopBar";
import { OverviewPanel } from "@/components/overview/OverviewPanel";
import { AssetsPanel } from "@/components/assets/AssetsPanel";
import { WhatIfPanel } from "@/components/whatif/WhatIfPanel";

export default function TwinConsolePage() {
  const [activeTab, setActiveTab] = useState<ConsoleTab>("overview");

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FB] text-[#0F1B2A]">
      {/* Top Operations Bar */}
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Command Center Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5 sm:p-7 lg:p-8 space-y-7">
        {activeTab === "overview" && <OverviewPanel />}
        {activeTab === "assets" && <AssetsPanel />}
        {activeTab === "whatif" && <WhatIfPanel />}
      </main>

      {/* Enterprise Polar Footer */}
      <footer className="w-full border-t border-[#E4E9EF] bg-white py-5 px-6 sm:px-8 mt-auto shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5B6B7D]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#0E7C86]" />
            <span className="font-semibold text-[#0B2942]">
              Indian Antarctic Programme · Scientific Digital Twin
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E9E6D]" />
              <span>Real: WMO / IMD AWS Feed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4922A]" />
              <span>Simulated: Physics Microgrid</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6366A8]" />
              <span>Derived: Autonomous Calculus</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
