"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useStation } from "./StationContext";
import {
  ScenarioId,
  SeverityLevel,
  DurationWindow,
  CascadeResult,
  OperationalAlert,
  SmartResource,
} from "@/lib/intelligence/types";
import { calculateCascadeRisk } from "@/lib/intelligence/cascadeEngine";
import { generateAlerts, countAlerts, AlertCounts } from "@/lib/intelligence/alertEngine";
import { calculateSmartResources } from "@/lib/intelligence/resourceEngine";
import { buildMissionReport, MissionReportData } from "@/lib/intelligence/missionReportEngine";
import { ConsoleTab } from "@/components/layout/TopBar";

interface OperationalIntelligenceContextType {
  // Scenario simulation state
  scenarioId: ScenarioId;
  setScenarioId: (id: ScenarioId) => void;
  severity: SeverityLevel;
  setSeverity: (sev: SeverityLevel) => void;
  duration: DurationWindow;
  setDuration: (dur: DurationWindow) => void;
  appliedActionIds: string[];
  toggleAction: (actionId: string) => void;
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean) => void;
  resetToBaseline: () => void;
  runDemoScenario: () => void;

  // Computed results
  cascadeResult: CascadeResult;
  alerts: OperationalAlert[];
  alertCounts: AlertCounts;
  resources: SmartResource[];
  dismissAlert: (id: string) => void;

  // Selected alert inspection & system linking
  selectedAlert: OperationalAlert | null;
  setSelectedAlert: (alert: OperationalAlert | null) => void;
  jumpToAlertSystem: (alert: OperationalAlert) => void;

  // Navigation integration
  activeTab: ConsoleTab;
  setActiveTab: (tab: ConsoleTab) => void;
  highlightedElementId: string | null;
  setHighlightedElementId: (id: string | null) => void;

  // Mission Report Modal state
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  missionReport: MissionReportData;

  // Alert Drawer / Modal state
  isAlertDrawerOpen: boolean;
  setIsAlertDrawerOpen: (open: boolean) => void;
}

const OperationalIntelligenceContext = createContext<
  OperationalIntelligenceContextType | undefined
>(undefined);

export const OperationalIntelligenceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { selectedStation } = useStation();

  // Active tab state shared with TopBar
  const [activeTab, setActiveTab] = useState<ConsoleTab>("overview");

  // Simulation controls
  const [scenarioId, setScenarioId] = useState<ScenarioId>("extreme_cold");
  const [severity, setSeverity] = useState<SeverityLevel>("severe");
  const [duration, setDuration] = useState<DurationWindow>("48h");
  const [appliedActionIds, setAppliedActionIds] = useState<string[]>([]);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false); // user must explicitly run simulation

  // Modals & drawers
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState<boolean>(false);
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [highlightedElementId, setHighlightedElementId] = useState<string | null>(null);

  // Toggle individual mitigation action
  const toggleAction = useCallback((actionId: string) => {
    setAppliedActionIds((prev) =>
      prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]
    );
  }, []);

  // Reset scenario to baseline state
  const resetToBaseline = useCallback(() => {
    setIsSimulationActive(false);
    setAppliedActionIds([]);
  }, []);

  // Run the canonical demo scenario: "48-hour Extreme Cold Event"
  const runDemoScenario = useCallback(() => {
    setScenarioId("extreme_cold");
    setSeverity("severe");
    setDuration("48h");
    setAppliedActionIds([]);
    setIsSimulationActive(true);
    setActiveTab("whatif");
  }, []);

  // Compute Cascade Result reactively
  const cascadeResult = useMemo(() => {
    return calculateCascadeRisk(
      selectedStation,
      scenarioId,
      severity,
      duration,
      appliedActionIds
    );
  }, [selectedStation, scenarioId, severity, duration, appliedActionIds]);

  // Compute Actionable Alerts reactively
  const alerts = useMemo(() => {
    const rawAlerts = generateAlerts(
      selectedStation,
      isSimulationActive ? scenarioId : null,
      severity,
      isSimulationActive,
      appliedActionIds.length > 0
    );
    return rawAlerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [selectedStation, scenarioId, severity, isSimulationActive, appliedActionIds, dismissedAlertIds]);

  const alertCounts = useMemo(() => countAlerts(alerts), [alerts]);

  const dismissAlert = useCallback((id: string) => {
    setDismissedAlertIds((prev) => [...prev, id]);
  }, []);

  // Compute Smart Resources reactively
  const resources = useMemo(() => {
    return calculateSmartResources(
      selectedStation,
      isSimulationActive ? scenarioId : null,
      isSimulationActive,
      appliedActionIds.includes("reduce_non_critical")
    );
  }, [selectedStation, scenarioId, isSimulationActive, appliedActionIds]);

  // Compute Mission Report reactively
  const missionReport = useMemo(() => {
    return buildMissionReport(
      selectedStation,
      null,
      cascadeResult,
      resources,
      alerts,
      isSimulationActive
    );
  }, [selectedStation, cascadeResult, resources, alerts, isSimulationActive]);

  // Jump to linked system from alert
  const jumpToAlertSystem = useCallback(
    (alert: OperationalAlert) => {
      setSelectedAlert(alert);
      setActiveTab(alert.targetTab);
      setIsAlertDrawerOpen(false);

      // Smooth scroll & highlight after DOM switch
      setTimeout(() => {
        setHighlightedElementId(alert.targetElementId);
        const el = document.getElementById(alert.targetElementId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setTimeout(() => setHighlightedElementId(null), 3000);
      }, 150);
    },
    []
  );

  return (
    <OperationalIntelligenceContext.Provider
      value={{
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
        alerts,
        alertCounts,
        resources,
        dismissAlert,

        selectedAlert,
        setSelectedAlert,
        jumpToAlertSystem,

        activeTab,
        setActiveTab,
        highlightedElementId,
        setHighlightedElementId,

        isReportModalOpen,
        setIsReportModalOpen,
        missionReport,

        isAlertDrawerOpen,
        setIsAlertDrawerOpen,
      }}
    >
      {children}
    </OperationalIntelligenceContext.Provider>
  );
};

export const useOperationalIntelligence = (): OperationalIntelligenceContextType => {
  const context = useContext(OperationalIntelligenceContext);
  if (!context) {
    throw new Error(
      "useOperationalIntelligence must be used within an OperationalIntelligenceProvider"
    );
  }
  return context;
};
