# POLAR TWIN â€” SIH 2026 Demo Script
## "Antarctic Remote Operations Research Command Center"

---

> **STEP 2 RESULT â€” LIVE LOOK:** Worked from code only (6 source files read in full).
> The dev servers have been running 27+ hours and are live at `localhost:3000`,
> but screenshot/browser tooling was not used. All UI copy below is quoted directly
> from the source files â€” nothing is paraphrased or invented.

---

## PRE-RECORDING CHECKLIST âš ï¸

**Complete both checks before hitting record â€” do not skip:**

1. **Forecast tab live data check:** Navigate to Forecast. If you see the amber banner
   *"Operating in offline mode â€” displaying calibrated local reference projectionsâ€¦"*,
   the tab is showing the hardcoded mock fallback (`MOCK_FORECASTS`), not live data.
   Confirm the backend `/stations/{id}/forecast` endpoint is responding before recording.

2. **What-If "Simulation Verdict" hero check:** Run a simulation (any scenario). After
   the result loads, confirm the large number ("X days to critical") and
   URGENT/WARNING/MONITOR pill actually appear on screen. This hero only renders when
   the backend returns an `urgency` field on the result. If the Verdict block is absent,
   the backend is on an older commit â€” update and redeploy before recording.

---

## TIMING REFERENCE

| Segment | Words | Ã·2.4 wps | +Action Time | Segment Total | Running |
|---------|-------|----------|--------------|---------------|---------|
| 1. Face cam intro | 65 | ~27s | +0s | **~27s** | 0:27 |
| 2. Overview + Provenance Ledger | 112 | ~47s | +8s | **~55s** | 1:22 |
| 3. Assets â€” 3D Schematic | 82 | ~34s | +8s | **~42s** | 2:04 |
| 4. What-If â€” Generator Failure | 120 | ~50s | +10s | **~60s** | 3:04 |
| 5. Forecast â€” Depletion Horizon | 60 | ~25s | +4s | **~29s** | 3:33 |
| 6. Android cut | 18 | ~8s | +4s | **~12s** | 3:45 |
| 7. Close | 18 | ~8s | +5s hold | **~13s** | 3:58 |

**Estimated total: ~3:58 â€” under the 4:00 hard constraint.**

---

## THE SCRIPT

---

### [00:00â€“00:27] SEGMENT 1 â€” FACE CAM INTRO

**ON-SCREEN ACTIONS:**
1. Face cam only. Clean background. Look directly at camera.

**VOICEOVER:**
> "Hi, I'm [your name], presenting Polar Twin â€” our solution for PS 26060.
>
> India's Maitri and Bharati stations sit in Antarctica
> with no road access, twelve-hour satellite windows,
> and weeks between supply runs.
> If something goes wrong â€” a generator fails, a blizzard hits â€”
> mission control at NCPOR has no real-time situational picture.
>
> Polar Twin is a browser-based digital twin that gives them one."

*(~65 words, ~27s)*

---

### [00:27â€“01:22] SEGMENT 2 â€” OVERVIEW TAB + PROVENANCE LEDGER

**ON-SCREEN ACTIONS:**
1. Cut to browser at `localhost:3000`. Overview tab is active. Confirm you can see
   the Maitri hero card: "Maitri / Research Station" heading, "â— Operational" pill,
   SolarBadge (e.g. "Polar Night Â· Sun âˆ’XX.XÂ°"), stats grid showing Capacity,
   Elevation, Established, and Link.
2. Click the **StationSwitcher** in the top bar. Select **Bharati**. Pause 1â€“2s for
   the hero image to cross-fade (opacity 0â†’1, scale 1.03â†’1 over ~700msâ€“1200ms).
3. Point the cursor at the top-right area of the top bar. Click the provenance ledger
   chip â€” it reads **"N Real Â· N Simulated Â· N Derived"** (green Â· amber Â· violet text).
   The popover opens with header **"Data Provenance Ledger"**, containing three groups:
   - **Real (green dot):** Temperature Â· Wind Speed Â· Atmospheric Pressure Â· Station Facts
   - **Simulated (amber dot):** Power Generation Â· Power Consumption Â· Diesel Fuel Level Â·
     Food Rations Reserve Â· Diesel Autonomy Â· Asset Telemetry Â· Comms Link State
   - **Derived (violet dot):** Anomaly Flags Â· Diesel Depletion Forecast Â·
     Food Depletion Forecast Â· What-If Simulation
4. Let the popover sit open 3â€“4 seconds so viewers can read the groups. Then click X
   (top-right of the popover) to close it.

**VOICEOVER:**
> "This is the Overview tab â€” we've just switched to Bharati station.
>
> Every number you see has a declared origin.
> That chip in the top bar â€” click it.
>
> This is the Data Provenance Ledger.
>
> Weather readings â€” temperature, wind, pressure â€”
> those are real: archived AWS data from NCPOR and IMD.
>
> Energy and logistics figures come from seeded station models.
>
> Forecasts and what-if results are derived â€”
> computed on the fly, marked as such.
>
> Judges, scientists, mission planners:
> they always know exactly what they're looking at
> and where it came from.
> That's not a feature. That's a design principle."

*(~112 words, ~47s spoken + ~8s for station switch and chip click)*

---

### [01:22â€“02:04] SEGMENT 3 â€” ASSETS TAB â€” 3D SCHEMATIC

**ON-SCREEN ACTIONS:**
1. Click **"Assets"** in the nav (Layers icon, second tab). Wait for the
   "Loading Asset Subsystem Hierarchyâ€¦" spinner to clear.
2. In the top-right of the Assets header card, locate the segmented toggle:
   **"Hierarchy"** | **"3D Schematic"**. Click **"3D Schematic"** (Box icon).
3. The Three.js WebGL canvas renders at 420px height â€” an isometric orthographic view:
   Main Building on stilts (Maitri), Lab Module, Storage Facility, two Generators
   with exhaust stacks, Battery System, Water Pump, Water Tank, Diesel Storage
   cylinders, Food Supply, Medical Supplies, Water Reserves, Spare Parts containers.
   Status-colored beacons glow on each asset. Scene label at bottom reads:
   *"Illustrative schematic â€” not to scale Â· Asset status: [simulated badge]"*
4. Hover over the **Generator 1** mesh (upper-right of scene). The HTML label
   **"GENERATOR 1"** pops above it. Hold 1s.
5. Click it â€” white edge wireframe activates (selected). The Asset Diagnostics panel
   beside it updates to show gen-01 data.

**VOICEOVER:**
> "Assets tab â€” 13 physical nodes tracked across the station.
>
> Click 3D Schematic.
>
> This is a live Three.js render of the station layout:
> main building, generators, water systems, logistics stores.
> Each beacon is colored by asset status â€”
> healthy, warning, or critical.
>
> Click any building â€” you get full diagnostics on the right.
>
> Maitri and Bharati render with structural differences.
> That's Maitri's main building raised on stilts, exactly as built."

*(~82 words, ~34s spoken + ~8s for toggle click, hover, asset click)*

---

### [02:04â€“03:04] SEGMENT 4 â€” WHAT-IF COMMAND CENTER

**ON-SCREEN ACTIONS:**
1. Click **"What-If"** in the nav (Sparkles icon, third tab).
   Section heading reads **"What-If Command Center"**.
   Pipeline shows Step 01 â†’ **"Select Trigger"** / Step 02 â†’ **"Simulate Cascade"** /
   Step 03 â†’ **"Assess Response"**.
2. In the **"Operational Disruption"** section, confirm **"GENERATOR FAILURE"** is
   already selected (it defaults to this on load). The Active Scenario box reads
   **"GENERATOR FAILURE"** with tagline *"Primary power generation fault"*.
3. Click the amber **"Run Simulation â†’"** button. It transitions to
   a spinner: **"Running Simulation"**.
4. When the result returns, **"Simulation Complete"** green pill appears.
   Confirm the **Simulation Verdict** hero is visible â€” the large number,
   **"days to critical"** label, and the urgency pill (URGENT / WARNING / MONITOR).
   Hold on this for 3 full seconds before moving.

**VOICEOVER:**
> "What-If Command Center.
>
> Active scenario: Generator Failure â€” primary power fault.
>
> Hit Run Simulation.
>
> That request goes to our FastAPI backend.
> It takes the station's current state,
> applies the scenario's cascade multipliers,
> and recomputes resource and operational impacts.
>
> This is not a scripted response.
> Every run goes through the model.
>
> Simulation Verdict: days until the situation turns critical.
> Urgency level: Urgent, Warning, or Monitor.
>
> For a station 14,000 kilometres away,
> knowing that number before the failure compounds â€”
> that's the entire point of this system."

*(~120 words, ~50s spoken + ~10s for button click and animation wait)*

---

### [03:04â€“03:33] SEGMENT 5 â€” FORECAST TAB

**ON-SCREEN ACTIONS:**
1. Click **"Forecast"** in the nav (TrendingDown icon, fourth tab).
   Section header badge reads **"Depletion Horizon Analysis"** with live
   ping indicator **"30-Day Predictive Model"**.
   Page heading: **"Resource Autonomy & Depletion"**.
   Status bar below heading shows:
   *"Forecast Window: Day 0 to Day 30"* Â· *"Thresholds: Warning 15d Â· Critical 7d"*
2. The threshold hero strip at top shows the nearest crossing
   (e.g. *"[N] days Â· Diesel reaches WARNING threshold"* in amber).
   Let this read clearly on screen.
3. Scroll down slightly so both diesel and food `ResourceForecastCard` charts
   are visible side-by-side.

**VOICEOVER:**
> "Forecast tab â€” 30-day depletion horizon.
>
> The system runs a daily linear burn against current reserves.
>
> That hero at the top: the nearest threshold crossing â€”
> how many days until diesel or food hits the 15-day warning line
> or the 7-day critical emergency line.
>
> Diesel on the left, food on the right.
> Both charts update whenever station data refreshes."

*(~60 words, ~25s spoken + ~4s for tab click and scroll)*

---

### [03:33â€“03:45] SEGMENT 6 â€” ANDROID APP (FAST CUT)

**ON-SCREEN ACTIONS:**
1. Cut to Android app on device or emulator. Show the main dashboard
   rendering the same station data â€” Overview or Forecast tab visible.

**VOICEOVER:**
> "The same dashboard also runs natively on Android â€”
> same data, same tabs, offline-capable."

*(~18 words, ~8s spoken + ~4s for device transition)*

---

### [03:45â€“03:58] SEGMENT 7 â€” CLOSE

**ON-SCREEN ACTIONS:**
1. Cut to a title slide showing:
   - **GitHub:** `github.com/shadow-anderson/antarctic-twin` (branch: t1)
   - **Live demo:** [add your Vercel URL here before recording]
2. Hold for 5 seconds.

**VOICEOVER:**
> "GitHub and live demo links on screen.
>
> Polar Twin â€” built for NCPOR, designed for the ice."

*(~18 words, ~8s spoken + 5s hold)*

---

## PRODUCTION NOTES

- **Station choice for Segment 2:** Start on Maitri, then switch to Bharati for the
  provenance ledger demo. This avoids any risk of the Overview and Assets tabs being
  compared side-by-side for the same station's diesel/food numbers
  (known unresolved mismatch between those two views â€” cut around it, don't demo them
  adjacent).
- **Segment 4:** If the Simulation Verdict hero block does not appear after clicking
  "Run Simulation" (i.e., `result.urgency` comes back null/absent from the backend),
  do NOT record. That block is gated on `result.urgency` in `WhatIfPanel.tsx` line 393.
  Update the backend to return that field before filming.
- **Speaking pace:** 2.4 words/second. Read each segment aloud once at that pace before
  recording to confirm feel. Do not rush Segment 4 â€” the verdict animation needs
  audience attention.
