"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  WhatIfResult,
  ScenarioDefinition,
} from "@/lib/types";

import {
  ArrowDown,
  ArrowRight,
  CheckSquare,
  Calendar,
  AlertCircle,
  Zap,
  Activity,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

interface ResultsPanelProps {
  scenario: ScenarioDefinition;
  result: WhatIfResult;
}

type PlaybackSection =
  | "impact"
  | "timeline"
  | "mitigation"
  | "complete";

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  scenario,
  result,
}) => {
  /* ============================================================
     PLAYBACK STATE
  ============================================================ */

  const [impactVisible, setImpactVisible] = useState(0);
  const [timelineVisible, setTimelineVisible] = useState(0);
  const [mitigationVisible, setMitigationVisible] = useState(0);

  const [activeSection, setActiveSection] =
    useState<PlaybackSection>("impact");

  const [isPlaying, setIsPlaying] = useState(true);

  /* ============================================================
     TYPING STATE
  ============================================================ */

  const [impactTyped, setImpactTyped] = useState("");
  const [timelineTyped, setTimelineTyped] = useState("");
  const [mitigationTyped, setMitigationTyped] = useState("");

  const [typingImpactIndex, setTypingImpactIndex] =
    useState<number | null>(null);

  const [typingTimelineIndex, setTypingTimelineIndex] =
    useState<number | null>(null);

  const [typingMitigationIndex, setTypingMitigationIndex] =
    useState<number | null>(null);

  /* ============================================================
     AUTO SCROLL REFS
  ============================================================ */

  const impactRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mitigationRefs = useRef<(HTMLDivElement | null)[]>([]);

  const completeRef = useRef<HTMLDivElement | null>(null);

  /* ============================================================
     RESET WHEN NEW RESULT ARRIVES
  ============================================================ */

  useEffect(() => {
    setImpactVisible(0);
    setTimelineVisible(0);
    setMitigationVisible(0);

    setImpactTyped("");
    setTimelineTyped("");
    setMitigationTyped("");

    setTypingImpactIndex(null);
    setTypingTimelineIndex(null);
    setTypingMitigationIndex(null);

    setActiveSection("impact");
    setIsPlaying(true);

    impactRefs.current = [];
    timelineRefs.current = [];
    mitigationRefs.current = [];
  }, [result]);

  /* ============================================================
     AUTO SCROLL
  ============================================================ */

  useEffect(() => {
    let element: HTMLElement | null = null;

    if (
      activeSection === "impact" &&
      impactVisible > 0
    ) {
      element =
        impactRefs.current[impactVisible - 1];
    }

    if (
      activeSection === "timeline" &&
      timelineVisible > 0
    ) {
      element =
        timelineRefs.current[timelineVisible - 1];
    }

    if (
      activeSection === "mitigation" &&
      mitigationVisible > 0
    ) {
      element =
        mitigationRefs.current[
          mitigationVisible - 1
        ];
    }

    if (activeSection === "complete") {
      element = completeRef.current;
    }

    if (!element) return;

    const timer = setTimeout(() => {
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [
    activeSection,
    impactVisible,
    timelineVisible,
    mitigationVisible,
  ]);

  /* ============================================================
     KEEP SCROLLING WHILE TEXT IS BEING TYPED
  ============================================================ */

  useEffect(() => {
    let element: HTMLElement | null = null;

    if (
      activeSection === "impact" &&
      impactVisible > 0
    ) {
      element =
        impactRefs.current[impactVisible - 1];
    }

    if (
      activeSection === "timeline" &&
      timelineVisible > 0
    ) {
      element =
        timelineRefs.current[timelineVisible - 1];
    }

    if (
      activeSection === "mitigation" &&
      mitigationVisible > 0
    ) {
      element =
        mitigationRefs.current[
          mitigationVisible - 1
        ];
    }

    if (!element) return;

    const timer = setTimeout(() => {
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [
    impactTyped,
    timelineTyped,
    mitigationTyped,
    activeSection,
    impactVisible,
    timelineVisible,
    mitigationVisible,
  ]);

  /* ============================================================
     IMPACT TYPING
  ============================================================ */

  useEffect(() => {
    if (!isPlaying || activeSection !== "impact") {
      return;
    }

    if (impactVisible === 0) {
      const timer = setTimeout(() => {
        setImpactVisible(1);
        setTypingImpactIndex(0);
        setImpactTyped("");
      }, 500);

      return () => clearTimeout(timer);
    }

    const currentIndex = impactVisible - 1;
    const currentText =
      scenario.impact_summary[currentIndex] ?? "";

    if (
      typingImpactIndex !== currentIndex
    ) {
      setTypingImpactIndex(currentIndex);
      setImpactTyped("");
      return;
    }

    /* TYPE CURRENT IMPACT */

    if (impactTyped.length < currentText.length) {
      const timer = setTimeout(() => {
        setImpactTyped(
          currentText.slice(
            0,
            impactTyped.length + 1
          )
        );
      }, 20);

      return () => clearTimeout(timer);
    }

    /* MOVE TO NEXT IMPACT */

    if (
      impactTyped.length === currentText.length &&
      impactVisible <
        scenario.impact_summary.length
    ) {
      const timer = setTimeout(() => {
        setImpactVisible(
          (prev) => prev + 1
        );

        setTypingImpactIndex(
          impactVisible
        );

        setImpactTyped("");
      }, 550);

      return () => clearTimeout(timer);
    }

    /* IMPACT FINISHED → TIMELINE */

    if (
      impactTyped.length === currentText.length &&
      impactVisible ===
        scenario.impact_summary.length
    ) {
      const timer = setTimeout(() => {
        setActiveSection("timeline");
        setTimelineVisible(0);
        setTimelineTyped("");
        setTypingTimelineIndex(null);
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [
    isPlaying,
    activeSection,
    impactVisible,
    impactTyped,
    typingImpactIndex,
    scenario.impact_summary,
  ]);

  /* ============================================================
     TIMELINE TYPING
  ============================================================ */

  useEffect(() => {
    if (!isPlaying || activeSection !== "timeline") {
      return;
    }

    if (result.timeline.length === 0) {
      setActiveSection("mitigation");
      return;
    }

    if (timelineVisible === 0) {
      const timer = setTimeout(() => {
        setTimelineVisible(1);
        setTypingTimelineIndex(0);
        setTimelineTyped("");
      }, 350);

      return () => clearTimeout(timer);
    }

    const currentIndex = timelineVisible - 1;

    const currentText =
      result.timeline[currentIndex]?.event ?? "";

    if (
      typingTimelineIndex !== currentIndex
    ) {
      setTypingTimelineIndex(currentIndex);
      setTimelineTyped("");
      return;
    }

    /* TYPE CURRENT EVENT */

    if (
      timelineTyped.length < currentText.length
    ) {
      const timer = setTimeout(() => {
        setTimelineTyped(
          currentText.slice(
            0,
            timelineTyped.length + 1
          )
        );
      }, 20);

      return () => clearTimeout(timer);
    }

    /* MOVE TO NEXT EVENT */

    if (
      timelineTyped.length ===
        currentText.length &&
      timelineVisible <
        result.timeline.length
    ) {
      const timer = setTimeout(() => {
        setTimelineVisible(
          (prev) => prev + 1
        );

        setTypingTimelineIndex(
          timelineVisible
        );

        setTimelineTyped("");
      }, 550);

      return () => clearTimeout(timer);
    }

    /* TIMELINE FINISHED */

    if (
      timelineTyped.length ===
        currentText.length &&
      timelineVisible ===
        result.timeline.length
    ) {
      const timer = setTimeout(() => {
        setActiveSection("mitigation");
        setMitigationVisible(0);
        setMitigationTyped("");
        setTypingMitigationIndex(null);
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [
    isPlaying,
    activeSection,
    timelineVisible,
    timelineTyped,
    typingTimelineIndex,
    result.timeline,
  ]);

  /* ============================================================
     MITIGATION TYPING
  ============================================================ */

  useEffect(() => {
    if (
      !isPlaying ||
      activeSection !== "mitigation"
    ) {
      return;
    }

    if (
      result.recommendations.length === 0
    ) {
      setActiveSection("complete");
      setIsPlaying(false);
      return;
    }

    if (mitigationVisible === 0) {
      const timer = setTimeout(() => {
        setMitigationVisible(1);
        setTypingMitigationIndex(0);
        setMitigationTyped("");
      }, 350);

      return () => clearTimeout(timer);
    }

    const currentIndex =
      mitigationVisible - 1;

    const currentText =
      result.recommendations[currentIndex] ??
      "";

    if (
      typingMitigationIndex !== currentIndex
    ) {
      setTypingMitigationIndex(
        currentIndex
      );
      setMitigationTyped("");
      return;
    }

    /* TYPE CURRENT ACTION */

    if (
      mitigationTyped.length <
      currentText.length
    ) {
      const timer = setTimeout(() => {
        setMitigationTyped(
          currentText.slice(
            0,
            mitigationTyped.length + 1
          )
        );
      }, 20);

      return () => clearTimeout(timer);
    }

    /* MOVE TO NEXT ACTION */

    if (
      mitigationTyped.length ===
        currentText.length &&
      mitigationVisible <
        result.recommendations.length
    ) {
      const timer = setTimeout(() => {
        setMitigationVisible(
          (prev) => prev + 1
        );

        setTypingMitigationIndex(
          mitigationVisible
        );

        setMitigationTyped("");
      }, 550);

      return () => clearTimeout(timer);
    }

    /* FINISH */

    if (
      mitigationTyped.length ===
        currentText.length &&
      mitigationVisible ===
        result.recommendations.length
    ) {
      const timer = setTimeout(() => {
        setActiveSection("complete");
        setIsPlaying(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    isPlaying,
    activeSection,
    mitigationVisible,
    mitigationTyped,
    typingMitigationIndex,
    result.recommendations,
  ]);

  /* ============================================================
     PROGRESS
  ============================================================ */

  const totalSteps =
    scenario.impact_summary.length +
    result.timeline.length +
    result.recommendations.length;

  const completedSteps =
    impactVisible +
    timelineVisible +
    mitigationVisible;

  const progress =
    totalSteps > 0
      ? Math.round(
          (completedSteps / totalSteps) * 100
        )
      : 0;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="w-full space-y-7">

      {/* ========================================================
          SIMULATION HEADER
      ======================================================== */}

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_8px_28px_rgba(0,0,0,0.3)]">

        <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-ops-teal/10 blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-7">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-2xl bg-ops-card border border-white/10 text-ops-teal shadow-[0_7px_18px_rgba(0,0,0,0.25)]">

                {isPlaying ? (
                  <Activity className="w-6 h-6 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-ops-green" />
                )}

              </div>

              <div>

                <div className="flex items-center gap-2 mb-1.5">

                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPlaying
                        ? "bg-ops-amber animate-pulse"
                        : "bg-ops-green"
                    }`}
                  />

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-ops-text-3">
                    {isPlaying
                      ? "Simulation Running"
                      : "Simulation Complete"}
                  </span>

                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ops-text">
                  {scenario.title}
                </h2>

                <p className="text-xs text-ops-text-2 mt-1">
                  {isPlaying
                    ? "Tracing the projected operational cascade..."
                    : "Projected operational cascade successfully generated."}
                </p>

              </div>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto px-3 py-2 rounded-xl bg-ops-card border border-white/10">

              <span
                className={`w-2 h-2 rounded-full ${
                  isPlaying
                    ? "bg-ops-amber animate-pulse"
                    : "bg-ops-green"
                }`}
              />

              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ops-text-2">
                Polar Physics Model v2.4
              </span>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="mt-6">

            <div className="flex items-center justify-between mb-2">

              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ops-text-3">
                Simulation Progress
              </span>

              <span className="text-[10px] font-bold text-ops-teal tabular-nums">
                {progress}%
              </span>

            </div>

            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-ops-teal via-ops-ice to-ops-amber transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

        </div>
      </div>

      {/* ========================================================
          IMPACT CASCADE
      ======================================================== */}

      <section className="rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_7px_25px_rgba(0,0,0,0.25)] overflow-hidden">

        <div className="px-6 sm:px-7 pt-6 pb-5 border-b border-white/10">

          <div className="flex items-center gap-3">

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-amber/15 text-ops-amber border border-ops-amber/25">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div>

              <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-ops-text">
                Impact Cascade
              </h3>

              <p className="text-[11px] text-ops-text-2 mt-0.5">
                {activeSection === "impact"
                  ? "Tracing disruption propagation..."
                  : "Cascade sequence generated"}
              </p>

            </div>

          </div>

        </div>

        <div className="p-5 sm:p-8">

          <div className="max-w-4xl mx-auto">

            {scenario.impact_summary
              .slice(0, impactVisible)
              .map((step, idx) => {

                const isFirst = idx === 0;

                const isLastVisible =
                  idx === impactVisible - 1;

                const isFinal =
                  idx ===
                  scenario.impact_summary.length - 1;

                const isTyping =
                  typingImpactIndex === idx;

                const displayedText =
                  isTyping
                    ? impactTyped
                    : step;

                return (
                  <React.Fragment key={idx}>

                    {/* STEP */}

                    <div
                      ref={(el) => {
                        impactRefs.current[idx] =
                          el;
                      }}
                      className="animate-[fadeSlideUp_0.5s_ease-out]"
                    >

                      <div
                        className={`
                          relative overflow-hidden
                          rounded-[22px]
                          border
                          ${
                            isFirst
                              ? "bg-ops-card/90 border-ops-red/30 shadow-[0_5px_16px_rgba(212,112,111,0.08)]"
                              : isFinal
                              ? "bg-ops-card/90 border-ops-green/30 shadow-[0_5px_16px_rgba(79,181,138,0.08)]"
                              : "bg-ops-card/90 border-white/10 shadow-[0_5px_16px_rgba(0,0,0,0.2)]"
                          }
                        `}
                      >

                        <div
                          className={`
                            absolute left-0 top-0 bottom-0 w-1.5
                            ${
                              isFirst
                                ? "bg-ops-red"
                                : isFinal
                                ? "bg-ops-green"
                                : "bg-ops-teal"
                            }
                          `}
                        />

                        <div className="p-5 sm:p-6">

                          <div className="flex items-start gap-4">

                            <div
                              className={`
                                flex items-center justify-center
                                shrink-0
                                w-11 h-11
                                rounded-2xl
                                text-sm font-bold
                                ${
                                  isFirst
                                    ? "bg-ops-red/15 text-ops-red border border-ops-red/30"
                                    : isFinal
                                    ? "bg-ops-green/15 text-ops-green border border-ops-green/30"
                                    : "bg-ops-teal/15 text-ops-teal border border-ops-teal/30"
                                }
                              `}
                            >
                              {String(idx + 1).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-center gap-2 mb-2">

                                <span
                                  className={`
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.16em]
                                    ${
                                      isFirst
                                        ? "text-ops-red"
                                        : isFinal
                                        ? "text-ops-green"
                                        : "text-ops-teal"
                                    }
                                  `}
                                >
                                  {isFirst
                                    ? "Initial Trigger"
                                    : isFinal
                                    ? "Final Impact"
                                    : `Cascade Stage ${
                                        idx + 1
                                      }`}
                                </span>

                                {/* TYPING DOT */}

                                {isTyping &&
                                  impactTyped.length <
                                    step.length && (
                                    <span className="inline-block w-1.5 h-3.5 rounded-sm bg-ops-teal animate-pulse" />
                                  )}

                              </div>

                              <p className="text-sm sm:text-[15px] font-semibold leading-6 text-ops-text">
                                {displayedText}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                    {!isLastVisible && (
                      <div className="flex flex-col items-center py-3 animate-[fadeIn_0.4s_ease-out]">

                        <div className="h-5 w-px bg-white/10" />

                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-ops-card border border-white/10 text-ops-text-2">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>

                        <div className="h-5 w-px bg-white/10" />

                      </div>
                    )}

                  </React.Fragment>
                );
              })}

            {activeSection === "impact" &&
              impactVisible <
                scenario.impact_summary.length && (
                <div className="flex items-center justify-center gap-2 py-6">

                  <span className="w-1.5 h-1.5 rounded-full bg-ops-teal animate-bounce" />

                  <span
                    className="w-1.5 h-1.5 rounded-full bg-ops-teal animate-bounce"
                    style={{
                      animationDelay: "120ms",
                    }}
                  />

                  <span
                    className="w-1.5 h-1.5 rounded-full bg-ops-teal animate-bounce"
                    style={{
                      animationDelay: "240ms",
                    }}
                  />

                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] ml-1 text-ops-text-3">
                    Calculating cascade
                  </span>

                </div>
              )}

          </div>

        </div>
      </section>

      {/* ========================================================
          TIMELINE
      ======================================================== */}

      {timelineVisible > 0 && (
        <section className="rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_7px_24px_rgba(0,0,0,0.25)] overflow-hidden animate-[fadeSlideUp_0.6s_ease-out]">

          <div className="px-6 sm:px-7 pt-6 pb-5 border-b border-white/10">

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-violet/15 text-ops-violet border border-ops-violet/25">
                <Calendar className="w-5 h-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-ops-text">
                  Event Timeline
                </h3>

                <p className="text-[11px] text-ops-text-2 mt-0.5">
                  Projected sequence of operational events
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-8">

            <div className="max-w-4xl mx-auto">

              {result.timeline
                .slice(0, timelineVisible)
                .map((entry, idx) => {

                  const isLast =
                    idx === timelineVisible - 1;

                  const isTyping =
                    typingTimelineIndex === idx;

                  const displayedText =
                    isTyping
                      ? timelineTyped
                      : entry.event;

                  return (
                    <React.Fragment key={idx}>

                      <div
                        ref={(el) => {
                          timelineRefs.current[idx] =
                            el;
                        }}
                        className="flex items-start gap-4 animate-[fadeSlideUp_0.5s_ease-out]"
                      >

                        <div className="flex flex-col items-center shrink-0">

                          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-ops-card border border-white/10 text-ops-violet shadow-[0_5px_14px_rgba(0,0,0,0.25)]">

                            <span className="text-[10px] font-bold">
                              D{entry.day}
                            </span>

                          </div>

                        </div>

                        <div className="flex-1 rounded-2xl bg-ops-card/90 border border-white/10 p-4 shadow-sm">

                          <div className="flex items-center gap-2 mb-1">

                            <Clock className="w-3.5 h-3.5 text-ops-text-3" />

                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-ops-text-3">
                              Day {entry.day}
                            </span>

                          </div>

                          <p className="text-xs sm:text-sm font-medium leading-6 text-ops-text">

                            {displayedText}

                            {isTyping &&
                              timelineTyped.length <
                                entry.event.length && (
                                <span className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm bg-ops-violet animate-pulse align-middle" />
                              )}

                          </p>

                        </div>

                      </div>

                      {!isLast && (
                        <div className="ml-[23px] h-8 border-l-2 border-dashed border-white/15" />
                      )}

                    </React.Fragment>
                  );
                })}

              {activeSection === "timeline" &&
                timelineVisible <
                  result.timeline.length && (
                  <div className="flex items-center justify-center gap-2 py-5">

                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ops-text-3">
                      Advancing timeline
                    </span>

                    <span className="flex gap-1">

                      <span className="w-1 h-1 rounded-full bg-ops-violet animate-bounce" />

                      <span
                        className="w-1 h-1 rounded-full bg-ops-violet animate-bounce"
                        style={{
                          animationDelay: "120ms",
                        }}
                      />

                      <span
                        className="w-1 h-1 rounded-full bg-ops-violet animate-bounce"
                        style={{
                          animationDelay: "240ms",
                        }}
                      />

                    </span>

                  </div>
                )}

            </div>

          </div>

        </section>
      )}

      {/* ========================================================
          MITIGATION
      ======================================================== */}

      {mitigationVisible > 0 && (
        <section className="rounded-[28px] border border-white/10 bg-ops-panel shadow-[0_7px_24px_rgba(0,0,0,0.25)] overflow-hidden animate-[fadeSlideUp_0.6s_ease-out]">

          <div className="px-6 sm:px-7 pt-6 pb-5 border-b border-white/10">

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-green/15 text-ops-green border border-ops-green/25">
                <CheckSquare className="w-5 h-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-ops-text">
                  Recommended Mitigation
                </h3>

                <p className="text-[11px] text-ops-text-2 mt-0.5">
                  Response actions derived from the simulated scenario
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-8">

            <div className="max-w-4xl mx-auto">

              {result.recommendations
                .slice(0, mitigationVisible)
                .map((rec, idx) => {

                  const isLast =
                    idx === mitigationVisible - 1;

                  const isTyping =
                    typingMitigationIndex === idx;

                  const displayedText =
                    isTyping
                      ? mitigationTyped
                      : rec;

                  return (
                    <React.Fragment key={idx}>

                      <div
                        ref={(el) => {
                          mitigationRefs.current[idx] =
                            el;
                        }}
                        className="flex items-start gap-4 animate-[fadeSlideUp_0.5s_ease-out]"
                      >

                        <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-2xl bg-ops-green/15 border border-ops-green/30 text-ops-green font-bold text-xs">
                          {idx + 1}
                        </div>

                        <div className="flex-1 p-4 rounded-2xl bg-ops-card/90 border border-white/10 shadow-sm">

                          <div className="flex items-center gap-2 mb-1">

                            <ShieldCheck className="w-3.5 h-3.5 text-ops-green" />

                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ops-green">
                              Action {idx + 1}
                            </span>

                          </div>

                          <p className="text-xs sm:text-sm font-medium leading-6 text-ops-text">

                            {displayedText}

                            {isTyping &&
                              mitigationTyped.length <
                                rec.length && (
                                <span className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm bg-ops-green animate-pulse align-middle" />
                              )}

                          </p>

                        </div>

                      </div>

                      {!isLast && (
                        <div className="flex justify-center py-2">
                          <ArrowDown className="w-4 h-4 text-ops-text-3" />
                        </div>
                      )}

                    </React.Fragment>
                  );
                })}

              {activeSection === "mitigation" &&
                mitigationVisible <
                  result.recommendations.length && (
                  <div className="flex items-center justify-center gap-2 py-5">

                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ops-text-3">
                      Generating response actions
                    </span>

                    <span className="flex gap-1">

                      <span className="w-1 h-1 rounded-full bg-ops-green animate-bounce" />

                      <span
                        className="w-1 h-1 rounded-full bg-ops-green animate-bounce"
                        style={{
                          animationDelay: "120ms",
                        }}
                      />

                      <span
                        className="w-1 h-1 rounded-full bg-ops-green animate-bounce"
                        style={{
                          animationDelay: "240ms",
                        }}
                      />

                    </span>

                  </div>
                )}

            </div>

          </div>

        </section>
      )}

      {/* ========================================================
          COMPLETE
      ======================================================== */}

      {activeSection === "complete" && (
        <div
          ref={completeRef}
          className="rounded-[24px] border border-ops-green/30 bg-ops-panel p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.35)] animate-[fadeSlideUp_0.8s_ease-out]"
        >

          <div className="flex flex-col items-center text-center">

            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-ops-green/15 border border-ops-green/30 text-ops-green mb-3">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-ops-green">
              Simulation Complete
            </h3>

            <p className="text-xs text-ops-text-2 mt-1">
              Full impact, timeline, and mitigation sequence has been projected.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-5">

              <FlowPill
                icon={<Zap className="w-3.5 h-3.5" />}
                label="Trigger"
                className="bg-ops-red/15 border-ops-red/30 text-ops-red"
              />

              <ArrowRight className="w-4 h-4 text-ops-text-3 rotate-90 md:rotate-0" />

              <FlowPill
                icon={<Activity className="w-3.5 h-3.5" />}
                label="Cascade"
                className="bg-ops-teal/15 border-ops-teal/30 text-ops-teal"
              />

              <ArrowRight className="w-4 h-4 text-ops-text-3 rotate-90 md:rotate-0" />

              <FlowPill
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Timeline"
                className="bg-ops-violet/15 border-ops-violet/30 text-ops-violet"
              />

              <ArrowRight className="w-4 h-4 text-ops-text-3 rotate-90 md:rotate-0" />

              <FlowPill
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                label="Mitigation"
                className="bg-ops-green/15 border-ops-green/30 text-ops-green"
              />

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          ANIMATIONS
      ======================================================== */}

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
};

/* ================================================================
   FLOW PILL
================================================================ */

interface FlowPillProps {
  icon: React.ReactNode;
  label: string;
  className: string;
}

const FlowPill: React.FC<FlowPillProps> = ({
  icon,
  label,
  className,
}) => {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider ${className}`}
    >
      {icon}
      {label}
    </div>
  );
};