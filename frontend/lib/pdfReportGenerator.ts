import jsPDF from "jspdf";
import { MissionReportData } from "./intelligence/missionReportEngine";
import { ReadinessResult } from "./intelligence/readinessEngine";
import { MaintenanceRecord } from "./intelligence/maintenanceEngine";
import { ScenarioTimeline } from "./intelligence/timelineEngine";
import { InterStationCoordination } from "./intelligence/coordinationEngine";
import { LogisticsRoute } from "./intelligence/logisticsEngine";
import { CommunicationHealth } from "./intelligence/communicationEngine";
import { CascadeResult } from "./intelligence/types";
import { SmartResource } from "./intelligence/types";

export interface GeneratePdfReportParams {
  missionReport: MissionReportData;
  missionReadiness: ReadinessResult;
  maintenanceRecords: MaintenanceRecord[];
  scenarioTimeline: ScenarioTimeline;
  interStationCoordination: InterStationCoordination;
  currentRoute: LogisticsRoute;
  communicationHealth: CommunicationHealth;
  cascadeResult: CascadeResult;
  resources: SmartResource[];
  isSimulationActive: boolean;
  stationId: "maitri" | "bharati";
}

/**
 * Generates a professional mission intelligence PDF report using jsPDF.
 * Layout uses strict column zones and splitTextToSize to prevent overlapping.
 */
export function generateMissionReportPdf(params: GeneratePdfReportParams): void {
  const {
    missionReport,
    missionReadiness,
    maintenanceRecords,
    scenarioTimeline,
    interStationCoordination,
    currentRoute,
    communicationHealth,
    cascadeResult,
    resources,
    isSimulationActive,
    stationId,
  } = params;

  // ── Document setup ──────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PW = 210;          // page width mm
  const PH = 297;          // page height mm
  const ML = 14;           // left margin
  const MR = 14;           // right margin
  const CW = PW - ML - MR; // content width = 182 mm
  const FOOTER_H = 14;     // footer zone height
  const SAFE_BOTTOM = PH - FOOTER_H;

  let y = ML;

  const stationName = stationId === "maitri" ? "MAITRI" : "BHARATI";

  // ── Colour palette ──────────────────────────────────────────────────────────
  const C = {
    navy:    [15,  23,  42 ] as [number,number,number],
    slate700:[51,  65,  85 ] as [number,number,number],
    slate500:[100, 116, 139] as [number,number,number],
    slate300:[203, 213, 225] as [number,number,number],
    slate100:[241, 245, 249] as [number,number,number],
    white:   [255, 255, 255] as [number,number,number],
    sky:     [14,  165, 233] as [number,number,number],
    cyan:    [56,  189, 248] as [number,number,number],
    green:   [22,  101, 52 ] as [number,number,number],
    greenBg: [240, 253, 244] as [number,number,number],
    amber:   [180, 83,  9  ] as [number,number,number],
    amberBg: [254, 243, 199] as [number,number,number],
    red:     [185, 28,  28 ] as [number,number,number],
    redBg:   [254, 242, 242] as [number,number,number],
    orange:  [234, 88,  12 ] as [number,number,number],
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const fill  = (c: [number,number,number]) => doc.setFillColor(...c);
  const stroke= (c: [number,number,number]) => doc.setDrawColor(...c);
  const color = (c: [number,number,number]) => doc.setTextColor(...c);

  /** Ensure at least `need` mm remains; add page if not. */
  const ensure = (need: number) => {
    if (y + need > SAFE_BOTTOM) {
      doc.addPage();
      drawPageBanner();
      y = 26;
    }
  };

  /** Draw the compact header on continuation pages. */
  const drawPageBanner = () => {
    fill(C.navy);
    doc.rect(ML, 8, CW, 8, "F");
    color(C.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("ANTARCTIC DIGITAL TWIN · MISSION INTELLIGENCE REPORT", ML + 3, 13.2);
    doc.setFont("helvetica", "normal");
    doc.text(`${stationName} STATION · ${missionReport.timestampUtc}`, PW - MR - 3, 13.2, { align: "right" });
  };

  /** Draw a section heading bar and advance y. Returns new y. */
  const section = (n: number, title: string) => {
    ensure(14);
    fill(C.slate100);
    stroke(C.slate300);
    doc.roundedRect(ML, y, CW, 7, 1.5, 1.5, "FD");
    // accent stripe
    fill(C.sky);
    doc.rect(ML, y, 2.5, 7, "F");
    color(C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`SECTION ${n} — ${title.toUpperCase()}`, ML + 5.5, y + 4.9);
    y += 10;
  };

  /** Draw a labelled key-value pair at current y; advance y by lineH. */
  const kv = (label: string, value: string, lineH = 5.5, indent = 0) => {
    ensure(lineH + 1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    color(C.slate500);
    doc.text(label, ML + indent, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    color(C.slate700);
    // wrap value to remaining width
    const maxW = CW - indent - 4;
    const lines = doc.splitTextToSize(value, maxW) as string[];
    doc.text(lines, ML + indent + 28, y);
    y += Math.max(lineH, lines.length * 3.8);
  };

  /** Draw separator line and add small gap. */
  const rule = (gap = 3) => {
    stroke(C.slate300);
    doc.setLineWidth(0.2);
    doc.line(ML, y, PW - MR, y);
    y += gap;
  };

  /** Draw a horizontal line segment from x1 to x2 at given y. */
  const ruleAt = (ry: number, x1: number, x2: number) => {
    stroke(C.slate300);
    doc.setLineWidth(0.2);
    doc.line(x1, ry, x2, ry);
  };

  /** Draw a badge pill at (bx, by) with given width, fg/bg colours and text. */
  const badge = (bx: number, by: number, w: number, h: number, bg: [number,number,number], fg: [number,number,number], bd: [number,number,number], text: string, fs = 6) => {
    fill(bg); stroke(bd);
    doc.roundedRect(bx, by, w, h, 1, 1, "FD");
    color(fg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fs);
    doc.text(text, bx + w / 2, by + h / 2 + fs * 0.18, { align: "center" });
  };

  /** Severity colour triple: [fill, stroke/text]. */
  const sevColor = (sev: string): [[number,number,number],[number,number,number]] => {
    if (sev === "CRITICAL") return [C.redBg,   C.red];
    if (sev === "HIGH")     return [C.amberBg, C.amber];
    if (sev === "WARNING")  return [C.amberBg, C.amber];
    return                        [C.greenBg,  C.green];
  };

  // ══════════════════════════════════════════════════════════════════════════
  // COVER HEADER
  // ══════════════════════════════════════════════════════════════════════════
  fill(C.navy);
  doc.roundedRect(ML, y, CW, 38, 2, 2, "F");
  // top cyan accent stripe
  fill(C.sky);
  doc.rect(ML, y, CW, 1.8, "F");

  // Title block
  color(C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("ANTARCTIC DIGITAL TWIN", ML + 6, y + 11);

  color(C.cyan);
  doc.setFontSize(9.5);
  doc.text("MISSION INTELLIGENCE EXECUTIVE REPORT", ML + 6, y + 17);

  color(C.slate300);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Indian Antarctic Programme · Operational Decision Support System", ML + 6, y + 22);
  doc.text(`Coordinates: ${missionReport.coordinates}   Region: ${missionReport.region}`, ML + 6, y + 26.5);

  // Right metadata column
  const rx = ML + 100; // right column start x
  color(C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(`STATION: ${stationName}`, rx, y + 11);

  color(C.slate300);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const scenarioTitle = cascadeResult?.scenarioTitle ?? "Baseline Nominal";
  // wrap long scenario text to right column width
  const scenarioLines = doc.splitTextToSize(`Scenario: ${scenarioTitle}`, CW - 106) as string[];
  doc.text(scenarioLines, rx, y + 16.5);
  const afterScenario = y + 16.5 + scenarioLines.length * 3.5;
  doc.text(`Mode: ${isSimulationActive ? "SIMULATION ACTIVE" : "SIMULATION (CALIBRATED)"}`, rx, afterScenario);
  doc.text(`Generated: ${missionReport.timestampUtc}`, rx, afterScenario + 4.5);

  // Mode badge
  fill(C.orange);
  doc.roundedRect(PW - MR - 48, y + 29, 43, 6, 1, 1, "F");
  color(C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("SIMULATED / PROTOTYPE DATA", PW - MR - 26.5, y + 33.5, { align: "center" });

  y += 42;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — MISSION READINESS
  // ══════════════════════════════════════════════════════════════════════════
  section(1, "Mission Readiness");

  const readinessScore  = missionReadiness?.overallScore  ?? missionReport.healthScore;
  const readinessStatus = missionReadiness?.status        ?? missionReport.readinessStatus;
  const statusRgb = readinessStatus === "MISSION READY"      ? C.green
                  : readinessStatus === "READY WITH CAUTION" ? C.amber
                  : C.red;

  // Overview box
  ensure(26);
  const overviewH = 20;
  fill([248, 250, 252]); stroke(C.slate300);
  doc.roundedRect(ML, y, CW, overviewH, 1.5, 1.5, "FD");

  // Big score
  color(C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(`${readinessScore}%`, ML + 7, y + 13);

  color(C.slate500);
  doc.setFontSize(6.5);
  doc.text("OVERALL MISSION READINESS", ML + 7, y + 17.5);

  // Status badge
  badge(ML + 48, y + 4, 50, 7, [255,255,255], statusRgb, statusRgb, readinessStatus, 6.5);

  // Delta text
  const deltaText = missionReport.readinessDelta !== 0
    ? `Simulation Impact: ${missionReport.readinessDelta > 0 ? "+" : ""}${missionReport.readinessDelta} pts from nominal baseline`
    : "Operating at calibrated baseline benchmark";
  color(C.slate500);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(deltaText, ML + 48, y + 15.5);

  y += overviewH + 4;

  // Category breakdown — 6 cards in one row
  const cats = missionReadiness?.categories?.length
    ? missionReadiness.categories
    : [
        { label: "Energy",         score: 82 },
        { label: "Infrastructure", score: 79 },
        { label: "Resources",      score: 85 },
        { label: "Logistics",      score: 74 },
        { label: "Communication",  score: 88 },
        { label: "Environment",    score: 70 },
      ];

  ensure(16);
  const gap   = 2;
  const cw    = (CW - gap * 5) / 6;
  cats.slice(0, 6).forEach((cat, i) => {
    const cx = ML + i * (cw + gap);
    fill([248, 250, 252]); stroke(C.slate300);
    doc.roundedRect(cx, y, cw, 13, 1, 1, "FD");

    color(C.slate500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    // truncate label to fit card
    const lbl = (cat.label ?? "").toUpperCase().slice(0, 9);
    doc.text(lbl, cx + cw / 2, y + 4, { align: "center" });

    color(C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`${cat.score}%`, cx + cw / 2, y + 9.5, { align: "center" });

    const status = cat.score < 60 ? "CRIT" : cat.score < 75 ? "WARN" : "OK";
    const sc = cat.score < 60 ? C.red : cat.score < 75 ? C.amber : C.green;
    color(sc);
    doc.setFontSize(5);
    doc.text(status, cx + cw / 2, y + 12.5, { align: "center" });
  });

  y += 17;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — RISK SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  section(2, "Risk Summary");

  const currentRisk = cascadeResult?.missionRisk?.simulated ?? "MEDIUM";
  const [riskBg, riskFg] = sevColor(currentRisk);
  ensure(8);
  color(C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CURRENT OVERALL RISK LEVEL:", ML + 2, y + 4);
  badge(ML + 62, y, 28, 6, riskBg, riskFg, riskFg, currentRisk, 7);
  y += 9;

  const activeRisks = missionReport.activeRisks.length
    ? missionReport.activeRisks
    : [
        { rank: 1, title: "Elevated Generator Heating Load", severity: "HIGH",    timeToCritical: "T+18h" },
        { rank: 2, title: "Fuel Autonomy Depletion Risk",    severity: "WARNING", timeToCritical: "T+36h" },
        { rank: 3, title: "Cross-Glacier Logistics Delay",   severity: "HIGH",    timeToCritical: "T+48h" },
      ];

  // Column definitions
  const COL_RISK_TITLE  = ML + 3;
  const COL_RISK_SEV    = ML + 116;
  const COL_RISK_HORIZ  = PW - MR - 3;

  activeRisks.slice(0, 5).forEach((risk) => {
    ensure(7);
    const [rbg, rfg] = sevColor(risk.severity);
    fill(rbg); stroke(C.slate300);
    doc.roundedRect(ML, y, CW, 6, 0.8, 0.8, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    color(C.navy);
    // truncate title to avoid overlapping severity column
    const maxTitleW = COL_RISK_SEV - COL_RISK_TITLE - 4;
    const titleLines = doc.splitTextToSize(`• ${risk.title}`, maxTitleW) as string[];
    doc.text(titleLines[0], COL_RISK_TITLE, y + 4);

    doc.setFont("helvetica", "bold");
    color(rfg);
    doc.text(`[${risk.severity}]`, COL_RISK_SEV, y + 4);

    doc.setFont("helvetica", "normal");
    color(C.slate500);
    doc.setFontSize(6.5);
    doc.text(`${risk.timeToCritical}`, COL_RISK_HORIZ, y + 4, { align: "right" });

    y += 7;
  });

  y += 2;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — EXPLAINABLE RISK
  // ══════════════════════════════════════════════════════════════════════════
  section(3, "Explainable Risk & Causal Propagation");

  ensure(10);
  color(C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("WHY IS THIS RISK ELEVATED?", ML + 2, y);
  y += 5;

  color(C.slate700);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const triggerText = `Trigger: ${cascadeResult?.trigger ?? "Environmental degradation / extreme temperature drop"}. Causal chain:`;
  const triggerLines = doc.splitTextToSize(triggerText, CW - 4) as string[];
  doc.text(triggerLines, ML + 2, y);
  y += triggerLines.length * 4 + 2;

  const chain = cascadeResult?.cascadeChain?.length
    ? cascadeResult.cascadeChain
    : [
        { stepNumber: 1, label: "Extreme Cold Incursion",              detail: "Sub-zero drop increases habitat thermal dissipation." },
        { stepNumber: 2, label: "HVAC Thermal Demand +40%",            detail: "Heating units switch to peak continuous draw." },
        { stepNumber: 3, label: "Generator 2 Load Spikes to 86%",      detail: "Primary diesel generator operates above nominal threshold." },
        { stepNumber: 4, label: "Fuel Burn Accelerates to 48 L/h",     detail: "Reserve autonomy decreases from 28 days to 14 days." },
        { stepNumber: 5, label: "Mission Autonomy Compromised",         detail: "Resupply required within 12 days under blizzard delay." },
      ];

  const STAGE_LABELS = ["CAUSE", "IMPACT", "CASCADING", "CASCADING", "MISSION RISK"];
  // Column widths for causal chain rows
  const PILL_W   = 22;   // stage pill
  const STEP_X   = ML + PILL_W + 5;
  const DETAIL_X = ML + 90;
  const DETAIL_W = CW - 90 - 2;

  chain.slice(0, 5).forEach((node, i) => {
    const stageLabel = STAGE_LABELS[Math.min(i, STAGE_LABELS.length - 1)];
    const rowH = 7;
    ensure(rowH + 1);

    fill([248, 250, 252]); stroke(C.slate300);
    doc.roundedRect(ML, y, CW, rowH, 0.8, 0.8, "FD");

    // stage pill
    fill(C.navy);
    doc.roundedRect(ML + 1.5, y + 1.3, PILL_W, 4.4, 0.8, 0.8, "F");
    color(C.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.text(stageLabel, ML + 1.5 + PILL_W / 2, y + 4.3, { align: "center" });

    // step label — bold, navy
    color(C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const labelMax = DETAIL_X - STEP_X - 3;
    const stepLabel = doc.splitTextToSize(`Step ${node.stepNumber}: ${node.label}`, labelMax) as string[];
    doc.text(stepLabel[0], STEP_X, y + 4.6);

    // detail — normal, slate
    color(C.slate500);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const detailLines = doc.splitTextToSize(node.detail, DETAIL_W) as string[];
    doc.text(detailLines[0], DETAIL_X, y + 4.6);

    y += rowH + 1.5;
  });

  y += 3;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — RESOURCE FORECAST
  // ══════════════════════════════════════════════════════════════════════════
  section(4, "Resource Autonomy & Depletion Forecast");

  const resourceItems = resources?.length
    ? resources
    : [
        { name: "Diesel Fuel",          currentLevel: missionReport.fuelLevelPct,    daysRemaining: missionReport.fuelAutonomyDays,   consumptionRate: 340, consumptionUnit: "L/day",      status: "WARNING" },
        { name: "BESS Battery Storage", currentLevel: missionReport.batterySocPct,   daysRemaining: 3,                                consumptionRate: 28,  consumptionUnit: "%/day",      status: "NOMINAL" },
        { name: "Potable Water",        currentLevel: 84,                             daysRemaining: missionReport.waterReservesDays,  consumptionRate: 210, consumptionUnit: "L/day",      status: "NOMINAL" },
        { name: "Food Provisions",      currentLevel: 92,                             daysRemaining: missionReport.foodReservesDays,   consumptionRate: 1,   consumptionUnit: "rations/day", status: "NOMINAL" },
      ];

  // Fixed column x positions
  const R_NAME   = ML + 3;
  const R_LEVEL  = ML + 55;
  const R_DAYS   = ML + 90;
  const R_RATE   = ML + 128;
  const R_STATUS = PW - MR - 3;

  // Header
  ensure(6);
  fill(C.slate100);
  doc.rect(ML, y, CW, 6, "F");
  color(C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("RESOURCE",        R_NAME,   y + 4.2);
  doc.text("LEVEL",           R_LEVEL,  y + 4.2);
  doc.text("AUTONOMY",        R_DAYS,   y + 4.2);
  doc.text("DAILY RATE",      R_RATE,   y + 4.2);
  doc.text("STATUS",          R_STATUS, y + 4.2, { align: "right" });
  y += 6;

  resourceItems.slice(0, 4).forEach((res) => {
    ensure(7);
    fill(C.white);
    doc.rect(ML, y, CW, 6.5, "F");
    stroke(C.slate100);
    doc.setLineWidth(0.2);
    doc.line(ML, y + 6.5, PW - MR, y + 6.5);

    color(C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    // Truncate resource name to fit column
    const nameTrunc = doc.splitTextToSize(res.name, R_LEVEL - R_NAME - 3) as string[];
    doc.text(nameTrunc[0], R_NAME, y + 4.3);

    color(C.slate700);
    doc.setFont("helvetica", "normal");
    doc.text(`${res.currentLevel}%`,                                 R_LEVEL, y + 4.3);
    doc.text(`${res.daysRemaining} days`,                            R_DAYS,  y + 4.3);
    doc.text(`${res.consumptionRate} ${res.consumptionUnit}`.slice(0, 20), R_RATE,  y + 4.3);

    const st = res.status ?? "NOMINAL";
    const [, sfg] = sevColor(st === "WARNING" ? "WARNING" : st === "CRITICAL" ? "CRITICAL" : "OK");
    color(sfg);
    doc.setFont("helvetica", "bold");
    doc.text(st, R_STATUS, y + 4.3, { align: "right" });

    y += 7;
  });

  y += 3;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — PREDICTIVE MAINTENANCE
  // ══════════════════════════════════════════════════════════════════════════
  section(5, "Predictive Maintenance & Asset Health");

  // Fixed column x positions
  const M_ASSET  = ML + 3;
  const M_HEALTH = ML + 55;
  const M_FAIL   = ML + 78;
  const M_RUL    = ML + 103;
  const M_PRIO   = ML + 125;
  const M_RECO   = PW - MR - 3;

  ensure(6);
  fill(C.slate100);
  doc.rect(ML, y, CW, 6, "F");
  color(C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("ASSET (ID)",        M_ASSET,  y + 4.2);
  doc.text("HEALTH",            M_HEALTH, y + 4.2);
  doc.text("FAIL RISK",         M_FAIL,   y + 4.2);
  doc.text("RUL (h)",           M_RUL,    y + 4.2);
  doc.text("PRIORITY",          M_PRIO,   y + 4.2);
  doc.text("RECOMMENDATION",   M_RECO,   y + 4.2, { align: "right" });
  y += 6;

  const records = maintenanceRecords?.length
    ? maintenanceRecords
    : [
        { shortId: "GEN-01",  assetName: "Primary Diesel Generator 1",   healthPct: 91, failureProbPct: 4,  rulHours: 8400, priority: "LOW"      as const, nextRecommended: "Scheduled inspection" },
        { shortId: "GEN-02",  assetName: "Secondary Diesel Generator 2",  healthPct: 76, failureProbPct: 18, rulHours: 420,  priority: "HIGH"     as const, nextRecommended: "Borescope inspection" },
        { shortId: "BESS-01", assetName: "Station BESS Battery Bank",     healthPct: 88, failureProbPct: 6,  rulHours: 6200, priority: "MEDIUM"   as const, nextRecommended: "Monitor temperature" },
        { shortId: "HVAC-01", assetName: "Main HVAC Unit",                healthPct: 82, failureProbPct: 9,  rulHours: 3100, priority: "MEDIUM"   as const, nextRecommended: "Check intake heaters" },
      ];

  records.slice(0, 5).forEach((rec) => {
    ensure(7.5);
    fill(C.white);
    doc.rect(ML, y, CW, 6.5, "F");
    stroke(C.slate100);
    doc.line(ML, y + 6.5, PW - MR, y + 6.5);

    color(C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    // Show shortId + truncated asset name
    const assetLabel = `${rec.shortId} · ${rec.assetName}`;
    const assetLines = doc.splitTextToSize(assetLabel, M_HEALTH - M_ASSET - 3) as string[];
    doc.text(assetLines[0], M_ASSET, y + 4.3);

    color(C.slate700);
    doc.setFont("helvetica", "normal");
    doc.text(`${rec.healthPct}%`,       M_HEALTH, y + 4.3);
    doc.text(`${rec.failureProbPct}%`,  M_FAIL,   y + 4.3);
    doc.text(`${rec.rulHours}`,         M_RUL,    y + 4.3);

    const [, pfg] = sevColor(
      rec.priority === "CRITICAL" ? "CRITICAL"
      : rec.priority === "HIGH"   ? "HIGH"
      : rec.priority === "MEDIUM" ? "WARNING"
      : "OK"
    );
    color(pfg);
    doc.setFont("helvetica", "bold");
    doc.text(rec.priority, M_PRIO, y + 4.3);

    color(C.slate500);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    const reco = (rec.nextRecommended ?? "Inspection recommended");
    const recoLines = doc.splitTextToSize(reco, M_RECO - M_PRIO - 28) as string[];
    doc.text(recoLines[0], M_RECO, y + 4.3, { align: "right" });

    y += 7.5;
  });

  y += 3;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — SCENARIO TIMELINE
  // ══════════════════════════════════════════════════════════════════════════
  section(6, "Scenario Timeline & Temporal Progression");

  const unmitigated = scenarioTimeline?.withoutMitigation?.length
    ? scenarioTimeline.withoutMitigation
    : [
        { time: "T+0",   event: "Scenario Trigger Initiated",          impact: "Sub-zero blizzard front hits station sector.",          severity: "WARNING"  as const },
        { time: "T+12h", event: "Thermal Load Surge",                  impact: "Microgrid power draw reaches 274 kW.",                  severity: "HIGH"     as const },
        { time: "T+24h", event: "Generator 2 Temperature Warning",     impact: "Bearing temperature approaches 88°C limit.",            severity: "HIGH"     as const },
        { time: "T+48h", event: "Mission Readiness Impact",            impact: "Energy readiness falls below 65%.",                     severity: "CRITICAL" as const },
      ];

  // Sub-heading: Unmitigated
  ensure(6);
  color(C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("WITHOUT MITIGATION", ML + 2, y);
  y += 4;

  const TL_TIME   = ML + 3;
  const TL_EVENT  = ML + 24;
  const TL_IMPACT = ML + 88;
  const TL_SEV    = PW - MR - 3;

  unmitigated.slice(0, 4).forEach((ev) => {
    ensure(7);
    fill([248, 250, 252]); stroke(C.slate300);
    doc.roundedRect(ML, y, CW, 6, 0.8, 0.8, "FD");

    color(C.sky);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(ev.time, TL_TIME, y + 4.2);

    color(C.navy);
    const eventLines = doc.splitTextToSize(ev.event, TL_IMPACT - TL_EVENT - 3) as string[];
    doc.text(eventLines[0], TL_EVENT, y + 4.2);

    color(C.slate500);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const impactLines = doc.splitTextToSize(ev.impact, TL_SEV - TL_IMPACT - 22) as string[];
    doc.text(impactLines[0], TL_IMPACT, y + 4.2);

    const [, sfg] = sevColor(ev.severity);
    color(sfg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(ev.severity, TL_SEV, y + 4.2, { align: "right" });

    y += 7;
  });

  // Sub-heading: Mitigated
  const mitigated = scenarioTimeline?.withMitigation;
  if (mitigated?.length) {
    y += 2;
    ensure(6);
    color(C.green);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("WITH RECOMMENDED MITIGATION", ML + 2, y);
    y += 4;

    mitigated.slice(0, 3).forEach((ev) => {
      ensure(7);
      fill(C.greenBg); stroke(C.green);
      doc.roundedRect(ML, y, CW, 6, 0.8, 0.8, "FD");

      color(C.sky);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(ev.time, TL_TIME, y + 4.2);

      color(C.navy);
      const eventLines = doc.splitTextToSize(ev.event, TL_IMPACT - TL_EVENT - 3) as string[];
      doc.text(eventLines[0], TL_EVENT, y + 4.2);

      color(C.slate500);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      const impactLines = doc.splitTextToSize(ev.impact, TL_SEV - TL_IMPACT - 22) as string[];
      doc.text(impactLines[0], TL_IMPACT, y + 4.2);

      y += 7;
    });
  }

  y += 3;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 7 — LOGISTICS
  // ══════════════════════════════════════════════════════════════════════════
  section(7, "Logistics & Resupply Route Status");

  const route = currentRoute ?? {
    name: "Goa to Maitri Overland Supply Corridors",
    from: "Mormugao Port (Goa)",
    to: `${stationName} Station`,
    weatherCondition: "Severe Cold",
    estimatedEtaHours: 96,
    delayHours: 24,
    routeRisk: "HIGH",
    supplyGapDetected: true,
  };

  ensure(24);

  // Left info block — occupies left 55% of content width
  const LEFT_MAX = 100; // max x for left column text
  const RIGHT_START = ML + 105; // right column start

  fill([248, 250, 252]); stroke(C.slate300);
  doc.roundedRect(ML, y, CW, 20, 1.5, 1.5, "FD");

  color(C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("ORIGIN",      ML + 5, y + 5.5);
  doc.text("DESTINATION", ML + 5, y + 10.5);
  doc.text("WEATHER",     ML + 5, y + 15.5);

  color(C.navy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const fromLines = doc.splitTextToSize(route.from, LEFT_MAX - ML - 26) as string[];
  doc.text(fromLines[0], ML + 26, y + 5.5);
  const toLines = doc.splitTextToSize(route.to, LEFT_MAX - ML - 26) as string[];
  doc.text(toLines[0], ML + 26, y + 10.5);
  doc.text(route.weatherCondition ?? "Katabatic Winds", ML + 26, y + 15.5);

  // Right values
  color(C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("ETA",         RIGHT_START, y + 5.5);
  doc.text("DELAY",       RIGHT_START, y + 10.5);
  doc.text("ROUTE RISK",  RIGHT_START, y + 15.5);

  color(C.navy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`${route.estimatedEtaHours}h`,      RIGHT_START + 20, y + 5.5);
  doc.text(`+${route.delayHours ?? 0}h`,       RIGHT_START + 20, y + 10.5);
  doc.text(`${route.routeRisk ?? "MODERATE"}`, RIGHT_START + 20, y + 15.5);

  y += 22;

  // Supply gap badge — full width
  const hasSupplyGap = (route.delayHours ?? 0) > 18 || route.supplyGapDetected || missionReport.fuelAutonomyDays < 15;
  ensure(10);
  if (hasSupplyGap) {
    fill(C.redBg); stroke(C.red);
    doc.roundedRect(ML, y, CW, 8, 1, 1, "FD");
    color(C.red);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("⚠  SUPPLY GAP DETECTED — Delay exceeds critical resupply threshold", ML + CW / 2, y + 5.2, { align: "center" });
  } else {
    fill(C.greenBg); stroke(C.green);
    doc.roundedRect(ML, y, CW, 8, 1, 1, "FD");
    color(C.green);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("✓  SUPPLY CORRIDOR SECURE — Nominal resupply ETA window", ML + CW / 2, y + 5.2, { align: "center" });
  }

  y += 12;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 8 — INTER-STATION COORDINATION
  // ══════════════════════════════════════════════════════════════════════════
  section(8, "Inter-Station Coordination (Maitri ↔ Bharati)");

  const maitri  = interStationCoordination?.maitri  ?? { missionReadinessPct: 78, fuelDays: 14, risk: "HIGH" };
  const bharati = interStationCoordination?.bharati ?? { missionReadinessPct: 86, fuelDays: 32, risk: "LOW"  };
  const opp = interStationCoordination?.supportOpportunities?.[0];

  ensure(34);

  // Three-column layout: Maitri card | Centre | Bharati card
  const CARD_W = 58;
  const MID_W  = CW - CARD_W * 2 - 6;
  const MID_X  = ML + CARD_W + 3;

  const cardH = 30;

  // Maitri card
  const [, mRiskFg] = sevColor(maitri.risk === "HIGH" ? "HIGH" : maitri.risk === "CRITICAL" ? "CRITICAL" : maitri.risk === "MEDIUM" ? "WARNING" : "OK");
  fill([248, 250, 252]); stroke(mRiskFg);
  doc.roundedRect(ML, y, CARD_W, cardH, 1.5, 1.5, "FD");
  color(C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("MAITRI", ML + CARD_W / 2, y + 7, { align: "center" });
  color(C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("STATION", ML + CARD_W / 2, y + 11, { align: "center" });
  ruleAt(y + 14, ML + 3, ML + CARD_W - 3);

  color(C.slate700);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Readiness:  ${maitri.missionReadinessPct}%`, ML + 5, y + 19);
  doc.text(`Fuel:       ${maitri.fuelDays} days`,        ML + 5, y + 24);
  color(mRiskFg);
  doc.setFont("helvetica", "bold");
  doc.text(`Risk: ${maitri.risk}`, ML + 5, y + 29);

  // Bharati card
  const bharatiX = ML + CARD_W + 3 + MID_W + 3;
  const [, bRiskFg] = sevColor(bharati.risk === "HIGH" ? "HIGH" : bharati.risk === "CRITICAL" ? "CRITICAL" : bharati.risk === "MEDIUM" ? "WARNING" : "OK");
  fill([248, 250, 252]); stroke(bRiskFg);
  doc.roundedRect(bharatiX, y, CARD_W, cardH, 1.5, 1.5, "FD");
  color(C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("BHARATI", bharatiX + CARD_W / 2, y + 7, { align: "center" });
  color(C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("STATION", bharatiX + CARD_W / 2, y + 11, { align: "center" });
  ruleAt(y + 14, bharatiX + 3, bharatiX + CARD_W - 3);

  color(C.slate700);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Readiness:  ${bharati.missionReadinessPct}%`, bharatiX + 5, y + 19);
  doc.text(`Fuel:       ${bharati.fuelDays} days`,        bharatiX + 5, y + 24);
  color(bRiskFg);
  doc.setFont("helvetica", "bold");
  doc.text(`Risk: ${bharati.risk}`, bharatiX + 5, y + 29);

  // Centre panel
  if (opp) {
    fill(C.amberBg); stroke(C.amber);
    doc.roundedRect(MID_X, y, MID_W, cardH, 1.5, 1.5, "FD");
    color(C.amber);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    const oppTitle = doc.splitTextToSize("POTENTIAL SUPPORT OPPORTUNITY", MID_W - 4) as string[];
    doc.text(oppTitle, MID_X + MID_W / 2, y + 6, { align: "center" });

    color(C.slate700);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(`Resource: ${opp.resource}`, MID_X + MID_W / 2, y + 14, { align: "center" });
    const flowText = `${opp.fromStation.toUpperCase()} → ${opp.toStation.toUpperCase()}`;
    doc.text(flowText, MID_X + MID_W / 2, y + 19, { align: "center" });
    doc.text(`Window: ${opp.estimatedWindowDays}d`, MID_X + MID_W / 2, y + 24, { align: "center" });
  } else {
    fill(C.greenBg); stroke(C.green);
    doc.roundedRect(MID_X, y, MID_W, cardH, 1.5, 1.5, "FD");
    color(C.green);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    const indTitle = doc.splitTextToSize("INDEPENDENT OPERATIONS", MID_W - 4) as string[];
    doc.text(indTitle, MID_X + MID_W / 2, y + 10, { align: "center" });
    color(C.slate700);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const balText = doc.splitTextToSize("Both stations within autonomy bounds", MID_W - 4) as string[];
    doc.text(balText, MID_X + MID_W / 2, y + 18, { align: "center" });
  }

  y += cardH + 4;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 9 — COMMUNICATION HEALTH
  // ══════════════════════════════════════════════════════════════════════════
  section(9, "Communication Health & Telemetry Link");

  const comm = communicationHealth ?? {
    overallScore:      missionReport.communicationScore,
    status:            missionReport.communicationStatus,
    latencyMs:         missionReport.communicationLatencyMs,
    signalStrengthPct: 82,
    dataFreshness:     "NOMINAL",
  };

  ensure(20);
  fill([248, 250, 252]); stroke(C.slate300);
  doc.roundedRect(ML, y, CW, 18, 1.5, 1.5, "FD");

  // Two columns
  const COMM_L = ML + 6;
  const COMM_R = ML + CW / 2 + 5;

  const commPairs: [string, string][] = [
    ["Link Health Score",  `${comm.overallScore}%`],
    ["Signal Status",      comm.status],
    ["Data Freshness",     comm.dataFreshness],
  ];
  const commPairsR: [string, string][] = [
    ["Satellite Latency",  `${comm.latencyMs} ms`],
    ["Signal Strength",    `${comm.signalStrengthPct}%`],
    ["Relay Mode",         "Inmarsat / GSAT"],
  ];

  commPairs.forEach(([lbl, val], i) => {
    color(C.slate500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(lbl, COMM_L, y + 5 + i * 4.5);
    color(C.navy);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(val, COMM_L + 36, y + 5 + i * 4.5);
  });

  commPairsR.forEach(([lbl, val], i) => {
    color(C.slate500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(lbl, COMM_R, y + 5 + i * 4.5);
    color(C.navy);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(val, COMM_R + 36, y + 5 + i * 4.5);
  });

  y += 22;

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 10 — MITIGATION / OUTCOME
  // ══════════════════════════════════════════════════════════════════════════
  section(10, "Mitigation Strategies & Projected Outcome");

  const beforeReadiness = cascadeResult?.missionRisk ? 58 : 72;
  const afterReadiness  = cascadeResult?.missionRisk ? 79 : 86;
  const beforeRisk      = cascadeResult?.missionRisk?.simulated  ?? "HIGH";
  const afterRisk       = cascadeResult?.missionRisk?.afterAction ?? "MEDIUM";

  ensure(26);
  fill([248, 250, 252]); stroke(C.slate300);
  doc.roundedRect(ML, y, CW, 22, 1.5, 1.5, "FD");

  color(C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PROJECTED BENEFIT SUMMARY", ML + 5, y + 6.5);

  ruleAt(y + 9, ML + 4, PW - MR - 4);

  color(C.red);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("BEFORE:", ML + 5, y + 14.5);
  color(C.slate700);
  doc.setFont("helvetica", "normal");
  doc.text(`Mission Readiness ${beforeReadiness}%   ·   Risk Level: ${beforeRisk}`, ML + 22, y + 14.5);

  color(C.green);
  doc.setFont("helvetica", "bold");
  doc.text("AFTER:", ML + 5, y + 19.5);
  color(C.slate700);
  doc.setFont("helvetica", "normal");
  doc.text(`Mission Readiness ${afterReadiness}%   ·   Risk Level: ${afterRisk}`, ML + 22, y + 19.5);

  y += 26;

  // Recommended actions
  const actions = cascadeResult?.recommendedMitigations?.length
    ? cascadeResult.recommendedMitigations.slice(0, 3)
    : [
        { title: "Load Shedding: Auxiliary Labs",           riskReduction: "-18% Power Draw"      },
        { title: "Pre-heat Intakes & Generator 2 Sync",     riskReduction: "-14°C Thermal Stress"  },
        { title: "Advance Resupply — Helicopter Window",    riskReduction: "Supply Gap Closed"     },
      ];

  ensure(8);
  color(C.slate500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("RECOMMENDED ACTIONS:", ML + 2, y);
  y += 4;

  actions.slice(0, 3).forEach((act) => {
    ensure(8);
    fill(C.greenBg); stroke(C.green);
    doc.roundedRect(ML, y, CW, 7, 0.8, 0.8, "FD");

    color(C.green);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const actTitle = doc.splitTextToSize(`✓  ${act.title}`, CW - 45) as string[];
    doc.text(actTitle[0], ML + 3, y + 4.5);

    color(C.navy);
    doc.setFont("helvetica", "bold");
    doc.text(act.riskReduction, PW - MR - 3, y + 4.5, { align: "right" });

    y += 8.5;
  });

  y += 3;

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER ON ALL PAGES
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    stroke(C.slate300);
    doc.setLineWidth(0.3);
    doc.line(ML, PH - 12, PW - MR, PH - 12);

    color(C.slate500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text("ANTARCTIC DIGITAL TWIN · POLAR RESEARCH COMMAND BRIEFING", ML, PH - 7.5);

    doc.setFont("helvetica", "normal");
    color(C.slate300);
    doc.text("Simulated / Decision Support Model · Smart India Hackathon Prototype", ML + 90, PH - 7.5);

    color(C.slate500);
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${p} of ${totalPages}`, PW - MR, PH - 7.5, { align: "right" });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const cleanDate = new Date().toISOString().slice(0, 10);
  doc.save(`Antarctic_Mission_Report_${stationName}_${cleanDate}.pdf`);
}


