"use client";

import React, { useState } from "react";
import { useStation } from "@/context/StationContext";
import { ScenarioTrigger, WhatIfResult } from "@/lib/types";
import { SCENARIOS } from "@/lib/mockData";
import { simulateWhatIf } from "@/lib/api";
import { ScenarioPicker } from "./ScenarioPicker";
import { ResultsPanel } from "./ResultsPanel";

import {
  Play,
  Loader2,
  Sparkles,
  FlaskConical,
  ArrowRight,
  Radio,
  Activity,
  ShieldCheck,
  Zap,
  ChevronRight,
  CircleDot,
  GitBranch,
} from "lucide-react";

export const WhatIfPanel: React.FC = () => {
  const { selectedStation } = useStation();

  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioTrigger | null>("generator_failure");

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<WhatIfResult | null>(null);

  const currentScenarioDef = SCENARIOS.find(
    (s) => s.id === selectedScenario
  );

  const handleRunSimulation = async () => {
    if (!selectedScenario || isRunning) return;

    setIsRunning(true);

    try {
      const simResult = await simulateWhatIf(
        selectedStation,
        selectedScenario
      );

      setResult(simResult);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-7 pb-8">

      {/* =========================================================
          HERO / COMMAND CENTER HEADER
      ========================================================= */}
      <section className="relative overflow-hidden rounded-[30px] border border-[#C9DDE0] bg-gradient-to-br from-[#EAF4F5] via-[#F4F7F5] to-[#F4EEE3] shadow-[0_10px_35px_rgba(47,76,84,0.08)]">

        {/* Decorative background */}
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-[#B9DDE0]/30 blur-3xl" />
        <div className="absolute -left-24 -bottom-28 w-80 h-80 rounded-full bg-[#E8D5B5]/25 blur-3xl" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(#A9C7CB 1px, transparent 1px), linear-gradient(90deg, #A9C7CB 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage:
              "linear-gradient(to bottom right, black, transparent 75%)",
            WebkitMaskImage:
              "linear-gradient(to bottom right, black, transparent 75%)",
          }}
        />

        <div className="relative p-6 sm:p-8 lg:p-9">

          {/* top metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-7">

            <div className="flex flex-wrap items-center gap-2">

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCEDEF] border border-[#C0DADD] text-[#47727B] text-[10px] font-bold uppercase tracking-[0.16em]">
                <FlaskConical className="w-3.5 h-3.5" />
                Predictive Simulation
              </span>

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5EBD9] border border-[#E5D3AF] text-[#8A6A32] text-[10px] font-bold uppercase tracking-[0.12em]">
                <Radio className="w-3 h-3" />
                {selectedStation} Station
              </span>

            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#73848A]">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#4F8A6B] opacity-40 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
              </span>
              Simulation Engine Ready
            </div>
          </div>

          {/* title */}
          <div className="max-w-3xl">
            <div className="flex items-start gap-4">

              <div className="hidden sm:flex shrink-0 items-center justify-center w-14 h-14 rounded-2xl bg-[#17364A] text-white shadow-[0_7px_18px_rgba(23,54,74,0.18)]">
                <GitBranch className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.035em] text-[#17364A] leading-tight">
                  What-If Command Center
                </h1>

                <p className="mt-2 max-w-2xl text-sm sm:text-[15px] leading-6 text-[#61757D]">
                  Explore operational disruptions virtually, trace their
                  cascading effects, and evaluate mitigation pathways before
                  field actions are taken.
                </p>
              </div>

            </div>
          </div>

          {/* =====================================================
              SIMULATION PIPELINE
          ===================================================== */}
          <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Step 1 */}
            <div className="relative rounded-2xl border border-[#C9DDE0] bg-[#F7FBFB]/90 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#DCECEF] text-[#4B7F8A]">
                  <CircleDot className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8A9A9F]">
                    Step 01
                  </div>
                  <div className="text-sm font-bold text-[#405B65]">
                    Select Trigger
                  </div>
                </div>

              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#7B8C92]">
                Choose an operational disruption to introduce into the
                station model.
              </p>

              <div className="hidden md:flex absolute top-1/2 -right-4 z-10 w-7 h-7 -translate-y-1/2 rounded-full bg-[#F2F7F7] border border-[#C9DDE0] items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5 text-[#6B8991]" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-[#D8D1C1] bg-[#FBF8F1]/90 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F2E5C9] text-[#9A7438]">
                  <Activity className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9B8C72]">
                    Step 02
                  </div>
                  <div className="text-sm font-bold text-[#5C5648]">
                    Simulate Cascade
                  </div>
                </div>

              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#8B8170]">
                Project how the disruption propagates through station
                infrastructure and resources.
              </p>

              <div className="hidden md:flex absolute top-1/2 -right-4 z-10 w-7 h-7 -translate-y-1/2 rounded-full bg-[#FBF8F1] border border-[#D8D1C1] items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5 text-[#9A8560]" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-[#D7D3E1] bg-[#F7F5FA]/90 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E8E3F0] text-[#776B98]">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#958BA8]">
                    Step 03
                  </div>
                  <div className="text-sm font-bold text-[#554F65]">
                    Assess Response
                  </div>
                </div>

              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#858091]">
                Review projected impacts, timelines, and recommended
                mitigation actions.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          SCENARIO SELECTION
      ========================================================= */}
      <section className="rounded-[28px] border border-[#D6E2E4] bg-[#F8FAFA] shadow-[0_7px_24px_rgba(47,70,77,0.05)] overflow-hidden">

        {/* section header */}
        <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-[#DFE8E9]">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E3EFF0] text-[#4D808A]">
                <Zap className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#405963]">
                  Operational Disruption
                </h2>

                <p className="text-[11px] text-[#8A999E] mt-0.5">
                  Select the event you want to introduce into the digital twin
                </p>
              </div>

            </div>

            <div className="inline-flex self-start sm:self-auto items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2F2] border border-[#DCE4E5] text-[10px] font-bold uppercase tracking-wider text-[#718289]">
              <span>{SCENARIOS.length}</span>
              calibrated scenarios
            </div>

          </div>
        </div>

        {/* scenario picker */}
        <div className="p-5 sm:p-7">
          <ScenarioPicker
            scenarios={SCENARIOS}
            selectedScenario={selectedScenario}
            onSelectScenario={(id) => {
              setSelectedScenario(id);
              setResult(null);
            }}
            disabled={isRunning}
          />
        </div>

      </section>


      {/* =========================================================
          SELECTED SCENARIO + RUN SIMULATION
      ========================================================= */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#D7D1C2] bg-gradient-to-r from-[#FBF8F0] via-[#F7F4EC] to-[#EEF5F5] shadow-[0_8px_25px_rgba(80,75,55,0.06)]">

        <div className="absolute right-0 top-0 w-72 h-full bg-gradient-to-l from-[#DCEDEF]/35 to-transparent pointer-events-none" />

        <div className="relative p-6 sm:p-7">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* selected scenario */}
            <div className="flex items-start gap-4 min-w-0">

              <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-2xl bg-[#17364A] text-white shadow-[0_6px_16px_rgba(23,54,74,0.15)]">
                <Sparkles className="w-5 h-5" />
              </div>

              <div className="min-w-0">

                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#927B50]">
                  Active Scenario
                </div>

                <h3 className="mt-1 text-lg sm:text-xl font-bold text-[#354D57] truncate">
                  {currentScenarioDef?.title || "No scenario selected"}
                </h3>

                <p className="mt-1 text-xs text-[#7D898E] max-w-xl leading-5">
                  The selected trigger will be injected into the{" "}
                  <span className="font-semibold text-[#506B73]">
                    {selectedStation}
                  </span>{" "}
                  operational model.
                </p>

              </div>
            </div>

            {/* action */}
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={!selectedScenario || isRunning}
              className={`group shrink-0 inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 ${
                !selectedScenario || isRunning
                  ? "bg-[#DDE5E6] text-[#9AA7AA] cursor-not-allowed"
                  : "bg-[#B98232] hover:bg-[#A97027] text-white shadow-[0_7px_18px_rgba(185,130,50,0.24)] hover:shadow-[0_9px_22px_rgba(185,130,50,0.30)] active:scale-[0.98] cursor-pointer"
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Simulation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Simulation
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

          </div>

        </div>
      </section>


      {/* =========================================================
          RESULTS / EMPTY STATE
      ========================================================= */}
      {result && currentScenarioDef ? (
        <section className="space-y-4">

          <div className="flex items-center gap-3 px-1">

            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E3EFE9] text-[#4F8069]">
              <Activity className="w-4 h-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#405963]">
                Simulation Output
              </h2>
              <p className="text-[11px] text-[#89979C]">
                Projected operational cascade and mitigation response
              </p>
            </div>

            <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F0EA] border border-[#D4E2D8] text-[10px] font-bold uppercase tracking-wider text-[#5F7C69]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F8A6B]" />
              Simulation Complete
            </div>

          </div>

          <ResultsPanel
            scenario={currentScenarioDef}
            result={result}
          />

        </section>
      ) : (
        <section className="relative overflow-hidden rounded-[28px] border border-[#D5E1E3] bg-gradient-to-br from-[#F2F7F7] via-[#F8FAFA] to-[#F5F1E8] shadow-[0_7px_25px_rgba(50,75,82,0.05)]">

          {/* decorative flow */}
          <div className="absolute inset-0 pointer-events-none">

            <div className="absolute left-[12%] top-1/2 w-28 h-px bg-[#C8D9DC]" />
            <div className="absolute left-[43%] top-1/2 w-28 h-px bg-[#C8D9DC]" />
            <div className="absolute right-[13%] top-1/2 w-20 h-px bg-[#C8D9DC]" />

          </div>

          <div className="relative flex flex-col items-center text-center px-6 py-12 sm:py-14">

            <div className="relative flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#17364A] text-white shadow-[0_10px_25px_rgba(23,54,74,0.18)]">

              <Sparkles className="w-7 h-7" />

              <span className="absolute -right-1 -top-1 flex items-center justify-center w-5 h-5 rounded-full bg-[#B98232] text-white">
                <Play className="w-2.5 h-2.5 fill-current" />
              </span>

            </div>

            <div className="mt-5">

              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8B9A9F]">
                Digital Twin Awaiting Input
              </div>

              <h3 className="mt-1.5 text-xl font-bold text-[#3B5660]">
                Ready to Model the Disruption
              </h3>

              <p className="mt-2 max-w-lg text-xs sm:text-sm leading-6 text-[#7B8B91]">
                Select a scenario above and launch the simulation to see how
                the event propagates through energy, logistics, infrastructure,
                and operational readiness.
              </p>

            </div>

            {/* mini flow */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E5EFF0] border border-[#D1E1E3] text-[10px] font-bold uppercase tracking-wider text-[#557780]">
                <CircleDot className="w-3.5 h-3.5" />
                Trigger
              </div>

              <ArrowRight className="w-4 h-4 text-[#A0AFB3]" />

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F3E8D0] border border-[#E6D5B4] text-[10px] font-bold uppercase tracking-wider text-[#8A6B35]">
                <Activity className="w-3.5 h-3.5" />
                Cascade
              </div>

              <ArrowRight className="w-4 h-4 text-[#A0AFB3]" />

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E8E3F0] border border-[#D8D1E4] text-[10px] font-bold uppercase tracking-wider text-[#70638E]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mitigation
              </div>

            </div>

          </div>
        </section>
      )}

    </div>
  );
};