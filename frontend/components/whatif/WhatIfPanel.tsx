"use client";

import React, { useState } from "react";
import { useStation } from "@/context/StationContext";
import { ScenarioTrigger, WhatIfResult } from "@/lib/types";
import { SCENARIOS } from "@/lib/mockData";
import { simulateWhatIf } from "@/lib/api";
import { ScenarioPicker } from "./ScenarioPicker";
import { ResultsPanel } from "./ResultsPanel";
import { SectionProvenance } from "../shared/SectionProvenance";

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
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-ops-panel shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
        {/* 1px accent top line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ops-teal/40 to-transparent" />

        {/* Decorative background */}
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-ops-teal/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-28 w-80 h-80 rounded-full bg-ops-amber/10 blur-3xl pointer-events-none" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
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

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ops-teal/15 border border-ops-teal/30 text-ops-teal text-[10px] font-bold uppercase tracking-[0.16em]">
                <FlaskConical className="w-3.5 h-3.5" />
                Predictive Simulation
              </span>

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ops-amber/15 border border-ops-amber/30 text-ops-amber text-[10px] font-bold uppercase tracking-[0.12em]">
                <Radio className="w-3 h-3" />
                {selectedStation} Station
              </span>

            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-ops-text-3">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-ops-green opacity-40 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-ops-green" />
              </span>
              Simulation Engine Ready
            </div>
          </div>

          {/* title */}
          <div className="max-w-3xl">
            <div className="flex items-start gap-4">

              <div className="hidden sm:flex shrink-0 items-center justify-center w-14 h-14 rounded-2xl bg-ops-card border border-white/10 text-ops-teal shadow-[0_7px_18px_rgba(0,0,0,0.25)]">
                <GitBranch className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.035em] text-ops-text leading-tight">
                  What-If Command Center
                </h1>

                <p className="mt-2 max-w-2xl text-sm sm:text-[15px] leading-6 text-ops-text-2">
                  Explore operational disruptions virtually, trace their
                  cascading effects, and evaluate mitigation pathways before
                  field actions are taken.
                </p>

                <div className="mt-2">
                  <SectionProvenance
                    source="derived"
                    origin="Scenario multipliers on simulated state"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* =====================================================
              SIMULATION PIPELINE
          ===================================================== */}
          <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Step 1 */}
            <div className="relative rounded-2xl border border-white/10 bg-ops-card/70 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-teal/15 text-ops-teal border border-ops-teal/25">
                  <CircleDot className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ops-text-3">
                    Step 01
                  </div>
                  <div className="text-sm font-bold text-ops-text">
                    Select Trigger
                  </div>
                </div>

              </div>

              <p className="mt-3 text-[11px] leading-5 text-ops-text-2">
                Choose an operational disruption to introduce into the
                station model.
              </p>

              <div className="hidden md:flex absolute top-1/2 -right-4 z-10 w-7 h-7 -translate-y-1/2 rounded-full bg-ops-panel border border-white/10 items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5 text-ops-text-3" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-white/10 bg-ops-card/70 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-amber/15 text-ops-amber border border-ops-amber/25">
                  <Activity className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ops-text-3">
                    Step 02
                  </div>
                  <div className="text-sm font-bold text-ops-text">
                    Simulate Cascade
                  </div>
                </div>

              </div>

              <p className="mt-3 text-[11px] leading-5 text-ops-text-2">
                Project how the disruption propagates through station
                infrastructure and resources.
              </p>

              <div className="hidden md:flex absolute top-1/2 -right-4 z-10 w-7 h-7 -translate-y-1/2 rounded-full bg-ops-panel border border-white/10 items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5 text-ops-text-3" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-white/10 bg-ops-card/70 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-violet/15 text-ops-violet border border-ops-violet/25">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-ops-text-3">
                    Step 03
                  </div>
                  <div className="text-sm font-bold text-ops-text">
                    Assess Response
                  </div>
                </div>

              </div>

              <p className="mt-3 text-[11px] leading-5 text-ops-text-2">
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
      <section className="rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_7px_24px_rgba(0,0,0,0.25)] overflow-hidden">

        {/* section header */}
        <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-white/10">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-teal/15 text-ops-teal border border-ops-teal/25">
                <Zap className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-ops-text">
                  Operational Disruption
                </h2>

                <p className="text-[11px] text-ops-text-2 mt-0.5">
                  Select the event you want to introduce into the digital twin
                </p>
              </div>

            </div>

            <div className="inline-flex self-start sm:self-auto items-center gap-2 px-3 py-1.5 rounded-full bg-ops-card border border-white/10 text-[10px] font-bold uppercase tracking-wider text-ops-text-2">
              <span className="text-ops-teal font-extrabold">{SCENARIOS.length}</span>
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
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_8px_25px_rgba(0,0,0,0.25)]">

        <div className="absolute right-0 top-0 w-72 h-full bg-gradient-to-l from-ops-teal/10 to-transparent pointer-events-none" />

        <div className="relative p-6 sm:p-7">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* selected scenario */}
            <div className="flex items-start gap-4 min-w-0">

              <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-2xl bg-ops-card border border-white/10 text-ops-amber shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
                <Sparkles className="w-5 h-5" />
              </div>

              <div className="min-w-0">

                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-ops-amber">
                  Active Scenario
                </div>

                <h3 className="mt-1 text-lg sm:text-xl font-bold text-ops-text truncate">
                  {currentScenarioDef?.title || "No scenario selected"}
                </h3>

                <p className="mt-1 text-xs text-ops-text-2 max-w-xl leading-5">
                  The selected trigger will be injected into the{" "}
                  <span className="font-semibold text-ops-text">
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
                  ? "bg-ops-card border border-white/5 text-ops-text-3 cursor-not-allowed"
                  : "bg-ops-amber hover:bg-ops-amber/90 text-[#0D2130] font-extrabold shadow-[0_7px_18px_rgba(217,164,65,0.25)] hover:shadow-[0_9px_22px_rgba(217,164,65,0.35)] active:scale-[0.98] cursor-pointer"
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

            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-ops-green/15 text-ops-green border border-ops-green/25">
              <Activity className="w-4 h-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-ops-text">
                Simulation Output
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-[11px] text-ops-text-2">
                  Projected operational cascade and mitigation response
                </p>
                <SectionProvenance
                  source="derived"
                  origin="Scenario multipliers on simulated state"
                />
              </div>
            </div>

            <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-ops-green/15 border border-ops-green/30 text-[10px] font-bold uppercase tracking-wider text-ops-green">
              <span className="w-1.5 h-1.5 rounded-full bg-ops-green" />
              Simulation Complete
            </div>

          </div>

          {/* Verdict hero — only when backend returns urgency field */}
          {result.urgency && (
            (() => {
              const verdictStyles = {
                urgent: {
                  border: "border-ops-red/30",
                  label: "URGENT",
                  labelColor: "text-ops-red",
                  daysColor: "text-ops-red",
                  pill: "bg-ops-red/15 border-ops-red/30 text-ops-red",
                  dot: "bg-ops-red",
                  glow: "rgba(212,112,111,0.25)",
                },
                warning: {
                  border: "border-ops-amber/30",
                  label: "WARNING",
                  labelColor: "text-ops-amber",
                  daysColor: "text-ops-amber",
                  pill: "bg-ops-amber/15 border-ops-amber/30 text-ops-amber",
                  dot: "bg-ops-amber",
                  glow: "rgba(217,164,65,0.25)",
                },
                monitor: {
                  border: "border-ops-green/30",
                  label: "MONITOR",
                  labelColor: "text-ops-green",
                  daysColor: "text-ops-green",
                  pill: "bg-ops-green/15 border-ops-green/30 text-ops-green",
                  dot: "bg-ops-green",
                  glow: "rgba(79,181,138,0.20)",
                },
              };
              const vs = verdictStyles[result.urgency!];
              return (
                <div
                  style={{ boxShadow: `0 4px 20px ${vs.glow}` }}
                  className={`flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-6 rounded-[24px] border ${vs.border} bg-ops-panel/90 backdrop-blur-sm ring-1 ring-white/5`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ops-text-3 mb-1">
                      Simulation Verdict
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-5xl sm:text-6xl font-bold tabular-nums leading-none ${vs.daysColor}`}>
                        {result.days_until_critical != null ? result.days_until_critical : "—"}
                      </span>
                      {result.days_until_critical != null && (
                        <span className="text-sm font-semibold text-ops-text-2 mb-0.5">days to critical</span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide ${vs.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vs.dot}`} />
                        <span className={vs.labelColor}>{vs.label}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          <ResultsPanel
            scenario={currentScenarioDef}
            result={result}
          />

        </section>
      ) : (
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_7px_25px_rgba(0,0,0,0.25)]">

          {/* decorative flow */}
          <div className="absolute inset-0 pointer-events-none">

            <div className="absolute left-[12%] top-1/2 w-28 h-px bg-white/10" />
            <div className="absolute left-[43%] top-1/2 w-28 h-px bg-white/10" />
            <div className="absolute right-[13%] top-1/2 w-20 h-px bg-white/10" />

          </div>

          <div className="relative flex flex-col items-center text-center px-6 py-12 sm:py-14">

            <div className="relative flex items-center justify-center w-16 h-16 rounded-[20px] bg-ops-card border border-white/10 text-ops-amber shadow-[0_10px_25px_rgba(0,0,0,0.35)]">

              <Sparkles className="w-7 h-7" />

              <span className="absolute -right-1 -top-1 flex items-center justify-center w-5 h-5 rounded-full bg-ops-amber text-[#0D2130]">
                <Play className="w-2.5 h-2.5 fill-current" />
              </span>

            </div>

            <div className="mt-5">

              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-ops-text-3">
                Digital Twin Awaiting Input
              </div>

              <h3 className="mt-1.5 text-xl font-bold text-ops-text">
                Ready to Model the Disruption
              </h3>

              <p className="mt-2 max-w-lg text-xs sm:text-sm leading-6 text-ops-text-2">
                Select a scenario above and launch the simulation to see how
                the event propagates through energy, logistics, infrastructure,
                and operational readiness.
              </p>

            </div>

            {/* mini flow */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ops-card border border-white/10 text-[10px] font-bold uppercase tracking-wider text-ops-teal">
                <CircleDot className="w-3.5 h-3.5" />
                Trigger
              </div>

              <ArrowRight className="w-4 h-4 text-ops-text-3" />

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ops-card border border-white/10 text-[10px] font-bold uppercase tracking-wider text-ops-amber">
                <Activity className="w-3.5 h-3.5" />
                Cascade
              </div>

              <ArrowRight className="w-4 h-4 text-ops-text-3" />

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ops-card border border-white/10 text-[10px] font-bold uppercase tracking-wider text-ops-violet">
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