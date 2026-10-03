"use client";

import React, { useState } from "react";
import { useStation } from "@/context/StationContext";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { SCENARIOS } from "@/lib/mockData";
import { simulateWhatIf } from "@/lib/api";
import { ScenarioDefinition, ScenarioTrigger, WhatIfResult } from "@/lib/types";
import { ScenarioPicker } from "./ScenarioPicker";
import { ResultsPanel } from "./ResultsPanel";
import { SCENARIO_DEFINITIONS } from "@/lib/intelligence/cascadeEngine";
import { ScenarioId, SeverityLevel, DurationWindow } from "@/lib/intelligence/types";
import { CascadeVisualizer } from "../intelligence/CascadeVisualizer";
import { MitigationPanel } from "../intelligence/MitigationPanel";
import { SectionProvenance } from "../shared/SectionProvenance";

import {
  Play,
  Loader2,
  Sparkles,
  FlaskConical,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Zap,
  Activity,
  RotateCcw,
  Radio,
  Clock,
} from "lucide-react";

/* ================================================================
   SYSTEM A — ORIGINAL WHAT-IF SIMULATION
   Uses: SCENARIOS (mockData), simulateWhatIf (API), ResultsPanel
   This is the primary simulation system. DO NOT remove or replace.
   ================================================================ */

export const WhatIfPanel: React.FC = () => {
  const { selectedStation } = useStation();

  // ── System A state (original simulation) ──────────────────────
  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioDefinition | null>(null);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runError, setRunError] = useState<string | null>(null);

  // ── System B state (cascade engine) ───────────────────────────
  const {
    scenarioId,
    setScenarioId,
    severity,
    setSeverity,
    duration,
    setDuration,
    appliedActionIds,
    toggleAction,
    isSimulationActive,
    setIsSimulationActive,
    resetToBaseline,
    runDemoScenario,
    cascadeResult,
  } = useOperationalIntelligence();

  const [cascadeExpanded, setCascadeExpanded] = useState<boolean>(false);
  const [cascadeIsRunning, setCascadeIsRunning] = useState<boolean>(false);

  // ── System A: run original simulation ─────────────────────────
  const handleRunSimulation = async () => {
    if (!selectedScenario) return;
    setIsRunning(true);
    setRunError(null);
    setResult(null);

    try {
      const res = await simulateWhatIf(
        selectedStation,
        selectedScenario.id as ScenarioTrigger
      );
      setResult(res);
    } catch (err: any) {
      setRunError(err?.message ?? "Simulation failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  // ── System B: run cascade engine ──────────────────────────────
  const handleRunCascade = () => {
    setCascadeIsRunning(true);
    setTimeout(() => {
      setIsSimulationActive(true);
      setCascadeIsRunning(false);
    }, 450);
  };

  const currentCascadeScenarioDef =
    SCENARIO_DEFINITIONS.find((s) => s.id === scenarioId) ??
    SCENARIO_DEFINITIONS[0];

  return (
    <div className="space-y-7 pb-8">

      {/* ============================================================
          SYSTEM A — ORIGINAL WHAT-IF SIMULATION (PRIMARY)
          This section is the original simulation that existed before
          any recent changes. It calls the backend API and renders
          the animated ResultsPanel.
      ============================================================ */}

      {/* Page Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_8px_28px_rgba(0,0,0,0.3)] px-6 sm:px-8 py-6">
        <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-ops-teal/8 blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-ops-card border border-white/10 text-ops-teal">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ops-teal/15 border border-ops-teal/30 text-ops-teal text-[10px] font-bold uppercase tracking-wider">
                <Radio className="w-3 h-3" />
                {selectedStation === "maitri" ? "Maitri" : "Bharati"} Station
              </span>
              <SectionProvenance source="simulated" origin="Backend physics engine" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ops-text">
              What-If Simulation
            </h1>
            <p className="mt-1 text-sm text-ops-text-2 max-w-2xl">
              Select a scenario, configure parameters, and run the simulation to
              receive timeline projections, risk assessments, and recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Scenario Selection */}
      <section className="rounded-[26px] border border-white/10 bg-ops-panel shadow-[0_6px_20px_rgba(0,0,0,0.22)] overflow-hidden">
        <div className="px-6 sm:px-7 pt-5 pb-4 border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
            Select Scenario
          </h2>
          <p className="text-[11px] text-ops-text-2 mt-0.5">
            Choose an operational disruption to simulate
          </p>
        </div>
        <div className="p-5 sm:p-7">
          <ScenarioPicker
            scenarios={SCENARIO_DEFINITIONS}
            selectedScenario={
              selectedScenario
                ? (selectedScenario.id as ScenarioId)
                : scenarioId
            }
            onSelectScenario={(id: ScenarioId) => {
              // Map cascade scenario IDs to original scenarios where possible
              const original = SCENARIOS.find((s) => s.id === id);
              if (original) {
                setSelectedScenario(original);
              } else {
                // For new scenario IDs not in original SCENARIOS,
                // create a minimal ScenarioDefinition compatible object
                const cascadeDef = SCENARIO_DEFINITIONS.find(
                  (s) => s.id === id
                );
                if (cascadeDef) {
                  setSelectedScenario({
                    id: id as ScenarioTrigger,
                    title: cascadeDef.title,
                    tagline: cascadeDef.tagline,
                    description: cascadeDef.description,
                    impact_summary: cascadeDef.description
                      .split(".")
                      .filter(Boolean)
                      .map((s) => s.trim()),
                  });
                }
              }
              // Also update cascade engine scenario
              setScenarioId(id);
              // Reset any prior results when switching scenario
              setResult(null);
              setRunError(null);
            }}
            disabled={isRunning}
          />
        </div>
      </section>

      {/* Run Controls */}
      <section className="rounded-[24px] border border-white/10 bg-ops-panel p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Selected scenario info */}
          <div>
            {selectedScenario ? (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3 mb-0.5">
                  Selected Scenario
                </div>
                <div className="text-sm font-bold text-ops-text">
                  {selectedScenario.title}
                </div>
                <div className="text-[11px] text-ops-text-2 mt-0.5">
                  {selectedScenario.tagline}
                </div>
              </div>
            ) : (
              <div className="text-sm text-ops-text-2">
                No scenario selected — choose one above
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {result && (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setRunError(null);
                  setSelectedScenario(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ops-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-ops-text-2 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isRunning || !selectedScenario}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-ops-teal hover:bg-ops-teal/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0D2130] text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-ops-teal/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Simulation…
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {runError && (
          <div className="mt-4 p-3 rounded-xl bg-ops-red/10 border border-ops-red/25 text-xs text-ops-red">
            {runError}
          </div>
        )}
      </section>

      {/* Empty state — no result yet */}
      {!result && !isRunning && !runError && (
        <section className="rounded-[26px] border border-dashed border-white/15 bg-ops-panel/60 px-8 py-14 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-ops-card border border-white/10 flex items-center justify-center text-ops-text-3">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="text-base font-bold text-ops-text mb-1">
              Digital Twin Awaiting Input
            </div>
            <p className="text-sm text-ops-text-2 max-w-sm">
              Select a scenario above and click{" "}
              <span className="text-ops-teal font-semibold">
                Run Simulation
              </span>{" "}
              to begin the what-if analysis.
            </p>
          </div>

          {/* Quick demo button */}
          <button
            type="button"
            onClick={runDemoScenario}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ops-amber/15 hover:bg-ops-amber/25 border border-ops-amber/30 text-ops-amber text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Run 48h Extreme Cold Demo
          </button>
        </section>
      )}

      {/* Loading state */}
      {isRunning && (
        <section className="rounded-[26px] border border-white/10 bg-ops-panel px-8 py-14 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ops-teal/15 border border-ops-teal/25 flex items-center justify-center text-ops-teal">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="text-sm font-bold text-ops-text">
            Running Simulation…
          </div>
          <p className="text-xs text-ops-text-2">
            Computing scenario projections and risk cascade
          </p>
        </section>
      )}

      {/* Results — original ResultsPanel with animated playback */}
      {result && selectedScenario && !isRunning && (
        <ResultsPanel scenario={selectedScenario} result={result} />
      )}

      {/* ============================================================
          SYSTEM B — CASCADE RISK ENGINE (SECONDARY, COLLAPSIBLE)
          This is the new operational intelligence layer added later.
          It is INDEPENDENT from System A — has its own state,
          its own simulation controls, and its own visualization.
          It does NOT replace System A.
      ============================================================ */}
      <section className="rounded-[26px] border border-white/10 bg-ops-panel shadow-[0_6px_20px_rgba(0,0,0,0.22)] overflow-hidden">
        {/* Cascade section header — always visible toggle */}
        <button
          type="button"
          onClick={() => setCascadeExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between px-6 sm:px-7 py-5 hover:bg-white/5 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-ops-teal/15 text-ops-teal border border-ops-teal/25">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
                Cascading Risk Engine
              </div>
              <div className="text-[11px] text-ops-text-2 mt-0.5">
                Multi-subsystem cascade visualization · 10 scenarios
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {isSimulationActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ops-red/15 border border-ops-red/30 text-ops-red text-[10px] font-bold uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Active
              </span>
            )}
            {cascadeExpanded ? (
              <ChevronUp className="w-4 h-4 text-ops-text-3" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ops-text-3" />
            )}
          </div>
        </button>

        {/* Cascade content — collapsible */}
        {cascadeExpanded && (
          <div className="border-t border-white/10">
            {/* Cascade controls */}
            <div className="px-6 sm:px-7 py-5 border-b border-white/10 bg-ops-card/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: controls */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Scenario dropdown */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.16em] text-ops-text-3 mb-1.5">
                      Scenario
                    </label>
                    <select
                      value={scenarioId}
                      onChange={(e) =>
                        setScenarioId(e.target.value as ScenarioId)
                      }
                      className="px-3 py-2 rounded-xl bg-ops-card border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-ops-teal cursor-pointer"
                    >
                      {SCENARIO_DEFINITIONS.map((s) => (
                        <option
                          key={s.id}
                          value={s.id}
                          className="bg-ops-panel text-white"
                        >
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.16em] text-ops-text-3 mb-1.5">
                      Severity
                    </label>
                    <div className="flex items-center rounded-xl bg-ops-card border border-white/10 p-0.5">
                      {(["moderate", "severe", "critical"] as SeverityLevel[]).map(
                        (sev) => (
                          <button
                            key={sev}
                            type="button"
                            onClick={() => setSeverity(sev)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              severity === sev
                                ? sev === "critical"
                                  ? "bg-ops-red text-white"
                                  : sev === "severe"
                                  ? "bg-ops-amber text-[#0D2130]"
                                  : "bg-ops-teal text-[#0D2130]"
                                : "text-ops-text-3 hover:text-ops-text"
                            }`}
                          >
                            {sev}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.16em] text-ops-text-3 mb-1.5">
                      Duration
                    </label>
                    <div className="flex items-center rounded-xl bg-ops-card border border-white/10 p-0.5">
                      {(["12h", "24h", "48h", "72h"] as DurationWindow[]).map(
                        (dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => setDuration(dur)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              duration === dur
                                ? "bg-white/20 text-white font-extrabold"
                                : "text-ops-text-3 hover:text-ops-text"
                            }`}
                          >
                            {dur}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: action buttons */}
                <div className="flex items-center gap-3">
                  {isSimulationActive && (
                    <button
                      type="button"
                      onClick={resetToBaseline}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ops-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-ops-text-2 hover:text-white transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Baseline
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRunCascade}
                    disabled={cascadeIsRunning}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ops-teal/90 hover:bg-ops-teal text-[#0D2130] text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
                  >
                    {cascadeIsRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Calculating…
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        Run Cascade
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={runDemoScenario}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ops-amber/15 hover:bg-ops-amber/25 border border-ops-amber/30 text-ops-amber text-xs font-bold transition-colors cursor-pointer"
                    title="48h Extreme Cold Demo"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Cascade results */}
            {isSimulationActive ? (
              <div className="p-5 sm:p-7 space-y-6">
                <CascadeVisualizer cascade={cascadeResult} />
                <MitigationPanel
                  cascade={cascadeResult}
                  onToggleAction={toggleAction}
                  appliedActionIds={appliedActionIds}
                />
              </div>
            ) : (
              <div className="px-7 py-10 flex flex-col items-center gap-3 text-center">
                <Activity className="w-8 h-8 text-ops-text-3" />
                <p className="text-sm text-ops-text-2">
                  Configure a scenario above and click{" "}
                  <span className="text-ops-teal font-semibold">
                    Run Cascade
                  </span>{" "}
                  to compute the multi-subsystem risk chain.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};