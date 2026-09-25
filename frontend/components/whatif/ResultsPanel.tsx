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

      <div className="relative overflow-hidden rounded-[28px] border border-[#C9DDE0] bg-gradient-to-br from-[#EAF4F5] via-[#F6F8F7] to-[#F5EFE2] shadow-[0_8px_28px_rgba(47,76,84,0.07)]">

        <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-[#B9DDE0]/25 blur-3xl" />

        <div className="relative p-6 sm:p-7">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-2xl bg-[#17364A] text-white shadow-[0_7px_18px_rgba(23,54,74,0.16)]">

                {isPlaying ? (
                  <Activity className="w-6 h-6 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}

              </div>

              <div>

                <div className="flex items-center gap-2 mb-1.5">

                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPlaying
                        ? "bg-[#B98232] animate-pulse"
                        : "bg-[#4F8A6B]"
                    }`}
                  />

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#5F7A80]">
                    {isPlaying
                      ? "Simulation Running"
                      : "Simulation Complete"}
                  </span>

                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#304C57]">
                  {scenario.title}
                </h2>

                <p className="text-xs text-[#75868C] mt-1">
                  {isPlaying
                    ? "Tracing the projected operational cascade..."
                    : "Projected operational cascade successfully generated."}
                </p>

              </div>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto px-3 py-2 rounded-xl bg-[#F5F8F7] border border-[#D6E2DE]">

              <span
                className={`w-2 h-2 rounded-full ${
                  isPlaying
                    ? "bg-[#B98232] animate-pulse"
                    : "bg-[#4F8A6B]"
                }`}
              />

              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#607A6C]">
                Polar Physics Model v2.4
              </span>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="mt-6">

            <div className="flex items-center justify-between mb-2">

              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#75888E]">
                Simulation Progress
              </span>

              <span className="text-[10px] font-bold text-[#4C7F91] tabular-nums">
                {progress}%
              </span>

            </div>

            <div className="w-full h-1.5 rounded-full bg-[#DCE7E8] overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4C7F91] via-[#5D8D8D] to-[#B98232] transition-all duration-700 ease-out"
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

      <section className="rounded-[28px] border border-[#D7E1E3] bg-[#F7FAFA] shadow-[0_7px_25px_rgba(50,75,82,0.05)] overflow-hidden">

        <div className="px-6 sm:px-7 pt-6 pb-5 border-b border-[#DEE7E8]">

          <div className="flex items-center gap-3">

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F2E5CF] text-[#9A7438]">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div>

              <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-[#405963]">
                Impact Cascade
              </h3>

              <p className="text-[11px] text-[#89989D] mt-0.5">
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
                              ? "bg-gradient-to-r from-[#F8EAEA] to-[#FBF5F5] border-[#E2C4C4]"
                              : isFinal
                              ? "bg-gradient-to-r from-[#E7F1EA] to-[#F5F9F6] border-[#C9DED0]"
                              : "bg-gradient-to-r from-[#EEF5F6] to-[#F8FAFA] border-[#D1E1E4]"
                          }
                          shadow-[0_5px_16px_rgba(55,75,82,0.045)]
                        `}
                      >

                        <div
                          className={`
                            absolute left-0 top-0 bottom-0 w-1.5
                            ${
                              isFirst
                                ? "bg-[#B65C5C]"
                                : isFinal
                                ? "bg-[#4F8A6B]"
                                : "bg-[#4C7F91]"
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
                                    ? "bg-[#F0DADA] text-[#985353]"
                                    : isFinal
                                    ? "bg-[#DCEBE1] text-[#527861]"
                                    : "bg-[#DCEBED] text-[#4D7782]"
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
                                        ? "text-[#9A5A5A]"
                                        : isFinal
                                        ? "text-[#5B7D68]"
                                        : "text-[#597B85]"
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
                                    <span className="inline-block w-1.5 h-3.5 rounded-sm bg-[#4C7F91] animate-pulse" />
                                  )}

                              </div>

                              <p className="text-sm sm:text-[15px] font-semibold leading-6 text-[#405963]">
                                {displayedText}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                    {!isLastVisible && (
                      <div className="flex flex-col items-center py-3 animate-[fadeIn_0.4s_ease-out]">

                        <div className="h-5 w-px bg-[#BFCFD3]" />

                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E6EFF0] border border-[#C9DADD] text-[#5B8089]">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>

                        <div className="h-5 w-px bg-[#BFCFD3]" />

                      </div>
                    )}

                  </React.Fragment>
                );
              })}

            {activeSection === "impact" &&
              impactVisible <
                scenario.impact_summary.length && (
                <div className="flex items-center justify-center gap-2 py-6">

                  <span className="w-1.5 h-1.5 rounded-full bg-[#4C7F91] animate-bounce" />

                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#4C7F91] animate-bounce"
                    style={{
                      animationDelay: "120ms",
                    }}
                  />

                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#4C7F91] animate-bounce"
                    style={{
                      animationDelay: "240ms",
                    }}
                  />

                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] ml-1 text-[#819197]">
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
        <section className="rounded-[28px] border border-[#D9D4E3] bg-gradient-to-br from-[#F6F4F9] to-[#F8FAFA] shadow-[0_7px_24px_rgba(65,60,80,0.05)] overflow-hidden animate-[fadeSlideUp_0.6s_ease-out]">

          <div className="px-6 sm:px-7 pt-6 pb-5 border-b border-[#E2DFE8]">

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E9E4F1] text-[#776A98]">
                <Calendar className="w-5 h-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-[#514C62]">
                  Event Timeline
                </h3>

                <p className="text-[11px] text-[#8B8795] mt-0.5">
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

                          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#17364A] text-white shadow-[0_5px_14px_rgba(23,54,74,0.15)]">

                            <span className="text-[10px] font-bold">
                              D{entry.day}
                            </span>

                          </div>

                        </div>

                        <div className="flex-1 rounded-2xl bg-[#FBFCFC] border border-[#DCE4E6] p-4 shadow-sm">

                          <div className="flex items-center gap-2 mb-1">

                            <Clock className="w-3.5 h-3.5 text-[#718890]" />

                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7C8E94]">
                              Day {entry.day}
                            </span>

                          </div>

                          <p className="text-xs sm:text-sm font-medium leading-6 text-[#4B626B]">

                            {displayedText}

                            {isTyping &&
                              timelineTyped.length <
                                entry.event.length && (
                                <span className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm bg-[#776A98] animate-pulse align-middle" />
                              )}

                          </p>

                        </div>

                      </div>

                      {!isLast && (
                        <div className="ml-[23px] h-8 border-l-2 border-dashed border-[#CBD8DB]" />
                      )}

                    </React.Fragment>
                  );
                })}

              {activeSection === "timeline" &&
                timelineVisible <
                  result.timeline.length && (
                  <div className="flex items-center justify-center gap-2 py-5">

                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8B8795]">
                      Advancing timeline
                    </span>

                    <span className="flex gap-1">

                      <span className="w-1 h-1 rounded-full bg-[#776A98] animate-bounce" />

                      <span
                        className="w-1 h-1 rounded-full bg-[#776A98] animate-bounce"
                        style={{
                          animationDelay: "120ms",
                        }}
                      />

                      <span
                        className="w-1 h-1 rounded-full bg-[#776A98] animate-bounce"
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
        <section className="rounded-[28px] border border-[#CFE0D5] bg-gradient-to-br from-[#EEF6F1] via-[#F6F9F7] to-[#F3F7F5] shadow-[0_7px_24px_rgba(58,90,70,0.05)] overflow-hidden animate-[fadeSlideUp_0.6s_ease-out]">

          <div className="px-6 sm:px-7 pt-6 pb-5 border-b border-[#DCE9DF]">

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#DCEBE1] text-[#527A62]">
                <CheckSquare className="w-5 h-5" />
              </div>

              <div>

                <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-[#496657]">
                  Recommended Mitigation
                </h3>

                <p className="text-[11px] text-[#82938A] mt-0.5">
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

                        <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-2xl bg-[#DDECE2] border border-[#CBE0D1] text-[#527861] font-bold text-xs">
                          {idx + 1}
                        </div>

                        <div className="flex-1 p-4 rounded-2xl bg-[#FBFDFC] border border-[#D7E4DA] shadow-sm">

                          <div className="flex items-center gap-2 mb-1">

                            <ShieldCheck className="w-3.5 h-3.5 text-[#5A8068]" />

                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#71877A]">
                              Action {idx + 1}
                            </span>

                          </div>

                          <p className="text-xs sm:text-sm font-medium leading-6 text-[#4B6254]">

                            {displayedText}

                            {isTyping &&
                              mitigationTyped.length <
                                rec.length && (
                                <span className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm bg-[#5A8068] animate-pulse align-middle" />
                              )}

                          </p>

                        </div>

                      </div>

                      {!isLast && (
                        <div className="flex justify-center py-2">
                          <ArrowDown className="w-4 h-4 text-[#91A89A]" />
                        </div>
                      )}

                    </React.Fragment>
                  );
                })}

              {activeSection === "mitigation" &&
                mitigationVisible <
                  result.recommendations.length && (
                  <div className="flex items-center justify-center gap-2 py-5">

                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#71877A]">
                      Generating response actions
                    </span>

                    <span className="flex gap-1">

                      <span className="w-1 h-1 rounded-full bg-[#5A8068] animate-bounce" />

                      <span
                        className="w-1 h-1 rounded-full bg-[#5A8068] animate-bounce"
                        style={{
                          animationDelay: "120ms",
                        }}
                      />

                      <span
                        className="w-1 h-1 rounded-full bg-[#5A8068] animate-bounce"
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
          className="rounded-[24px] border border-[#D1E1D6] bg-gradient-to-r from-[#EEF6F1] to-[#F7FAF8] p-5 sm:p-6 animate-[fadeSlideUp_0.8s_ease-out]"
        >

          <div className="flex flex-col items-center text-center">

            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DDECE2] text-[#527861] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#4F6F5A]">
              Simulation Complete
            </h3>

            <p className="text-xs text-[#75877B] mt-1">
              Full impact, timeline, and mitigation sequence has been projected.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-5">

              <FlowPill
                icon={<Zap className="w-3.5 h-3.5" />}
                label="Trigger"
                className="bg-[#F0DEDE] border-[#E3C7C7] text-[#965858]"
              />

              <ArrowRight className="w-4 h-4 text-[#9BA9AD] rotate-90 md:rotate-0" />

              <FlowPill
                icon={<Activity className="w-3.5 h-3.5" />}
                label="Cascade"
                className="bg-[#E2EEF0] border-[#CDDEE1] text-[#527681]"
              />

              <ArrowRight className="w-4 h-4 text-[#9BA9AD] rotate-90 md:rotate-0" />

              <FlowPill
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Timeline"
                className="bg-[#E9E4F0] border-[#D9D1E4] text-[#70648D]"
              />

              <ArrowRight className="w-4 h-4 text-[#9BA9AD] rotate-90 md:rotate-0" />

              <FlowPill
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                label="Mitigation"
                className="bg-[#DDECE2] border-[#CBE0D1] text-[#557963]"
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