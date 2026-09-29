# Demo Script

## Overview

Target runtime: 4ΓÇô5 minutes. Intended for the SIH 2026 PS-26060 demo video or
live finals presentation. Narrative arc: two isolated Indian Antarctic stations
are grounded by real archived weather data, every other metric is honestly
labelled simulated or derived, and the system can reason forward ΓÇö simulate a
disruption, project its cascade, and forecast resource depletion ΓÇö not just
display a dashboard.

---

## Pre-demo checklist

Run these before opening OBS or presenting:

- [ ] **Backend commit check.** Hit `https://<your-render-url>/openapi.json` and
  confirm the `paths` object contains `/stations/{station_id}/assets/{asset_id}`
  (added in the hierarchy commit). If it is absent, the deployed service is
  behind `main` ΓÇö trigger a manual redeploy from the Render dashboard before
  recording.
- [ ] **Both stations load.** Visit the app, click **Maitri**, wait for the
  Overview panel to fully populate. Switch to **Bharati**, wait again. If either
  returns a network error, the Render free-tier instance may be cold-starting ΓÇö
  wait 30 seconds and retry.
- [ ] **No stale what-if result.** Switch to the **What-If** tab. If a previous
  simulation result ("Simulation Complete") is visible, refresh the page to
  clear it before recording.
- [ ] **Link indicator shows "Live".** In the top-right of the header, the
  `LinkStatusIndicator` button should read **Live** with a green pulsing dot. If
  it reads **Degraded**, click it once to toggle back. Wait for the
  "Restoring link..." spinner (Γëê 750 ms) to clear before recording.
- [ ] **Station is set to Maitri.** The `StationSwitcher` in the top-left should
  show **Maitri** ΓÇö the scenario numbers in the script are written for Maitri's
  baseline values.
- [ ] **Browser zoom at 100 %.** The provenance ledger chip ("X Real ┬╖ Y
  Simulated ┬╖ Z Derived") is only visible on the `lg` breakpoint and above; at
  reduced zoom it may disappear. Use a 1080p or wider viewport.

---

## Script

### Step 1 ΓÇö Open on the Overview tab (0:00 ΓÇô 0:45)

**Action:** App is already on the **Overview** tab showing Maitri. Camera or
screen capture is running.

**Narration:**

> "This is the Antarctic Digital Twin for India's polar research programme ΓÇö
> Maitri and Bharati stations. The first thing to notice is the header: that
> chip in the top right reads '3 Real ┬╖ 6 Simulated ┬╖ 5 Derived'. Click it."

Click the provenance ledger chip (labeled **Data Provenance Ledger** when open).
The popover expands, listing every tracked metric grouped by source.

> "Every data point in this system carries a source tag ΓÇö Real, Simulated, or
> Derived. Real means measured and archived. Simulated means generated in code
> because NCPOR doesn't publish live operational feeds publicly. Derived means
> computed from those inputs. The pop-up is live ΓÇö it reads the source field off
> the actual API response, not from a hardcoded list."

Close the popover (click the ├ù or click outside it).

---

### Step 2 ΓÇö Weather: the real anchor (0:45 ΓÇô 1:30)

**Action:** Remain on **Overview**, scroll to the weather cards (Temperature,
Wind Speed, Atmospheric Pressure). Each card shows a green dot and the label
**Real**.

**Narration:**

> "The weather section is the one place where the data is measured. It comes
> from the NCPOR and IMD automatic weather station archive ΓÇö CSV files covering
> Maitri from 1985 to December 2016 and Bharati from 2012 to December 2016. The
> API picks the most recent row where all three fields ΓÇö temperature, pressure,
> and wind speed ΓÇö are simultaneously non-null. The observation time shown here
> is that archived row's timestamp, not today's time. This is archival data, and
> the system says so."

Briefly gesture at the observation timestamp displayed in the panel.

> "Everything else on this page ΓÇö power, fuel, reserves ΓÇö carries an amber
> Simulated badge, because those numbers come from a seeded model, not a sensor.
> The distinction is explicit in the UI and in every API response."

---

### Step 3 ΓÇö Assets tab, quick look (1:30 ΓÇô 2:00)

**Action:** Click the **Assets** tab in the top navigation bar.

**Narration:**

> "The Assets tab models the physical subsystems ΓÇö thirteen nodes across power,
> water, buildings, and logistics. The default view is Hierarchy."

Point at the segmented toggle in the top-right of the Assets header.

> "You can switch to the 3D Schematic view here."

Click **3D Schematic** in the toggle. The schematic renders in the panel (height
420 px, below the header).

> "The schematic is illustrative ΓÇö not to scale and not a real floor plan ΓÇö which
> the caption says explicitly. Asset status on both views is simulated telemetry,
> seeded and jittered every three minutes."

Click **Hierarchy** to switch back. In the left-side tree, click **Generator 02**
(shown with a warning status on Maitri).

> "Generator 02 at Maitri is in a warning state ΓÇö high vibration, due for
> inspection. These states are hardcoded baselines with a small deterministic
> jitter; they're not live sensor readings."

---

### Step 4 ΓÇö What-If: run a scenario (2:00 ΓÇô 3:15)

**Action:** Click the **What-If** tab.

**Narration:**

> "The What-If tab is the simulation engine. The panel shows a three-step
> pipeline: Select Trigger ΓåÆ Simulate Cascade ΓåÆ Assess Response."

The scenario picker shows three cards: **GENERATOR FAILURE**, **BLIZZARD**,
**RESUPPLY DELAY**. **GENERATOR FAILURE** is selected by default.

> "Generator Failure is already selected ΓÇö it's the most relevant to the warning
> state we just saw. The scenario parameters are: generation drops to 55 % of
> current output, consumption is unchanged, and diesel burn rate increases by
> 30 %."

Click the **Run Simulation** button (amber, in the section below the picker,
labeled "Run Simulation ΓåÆ").

**Wait** approximately 1ΓÇô2 seconds for the API call to return. The button shows
a spinning **Running Simulation** label during the call. When the response
arrives, the Results section appears with a progress bar that begins filling.

> "The results are being generated now ΓÇö this is a live API call to the backend,
> not a canned response. The backend reads Maitri's current simulated energy
> state, applies the scenario multipliers, computes how many days until diesel
> hits the 15 % operational threshold, and returns a dynamic timeline and
> recommendations."

The cascade playback animates: Impact items appear one by one (typed at 20 ms
per character), then Timeline events, then Recommendations ΓÇö each section
advancing after a 550 ms inter-item pause and a 900 ms section transition.
Observe the **Simulation Verdict** card showing `days_until_critical` and an
urgency badge (URGENT / WARNING / MONITOR depending on computed values).

> "The verdict is computed: days until diesel reaches the 15 % threshold under
> the failure scenario. The urgency tier ΓÇö URGENT if that's under three days,
> WARNING under seven, MONITOR otherwise ΓÇö comes from the same backend
> calculation."

---

### Step 5 ΓÇö Forecast tab: making it concrete (3:15 ΓÇô 3:50)

**Action:** Click the **Forecast** tab.

**Narration:**

> "The Forecast tab projects the same station's diesel and food reserves over
> 30 days using a linear burn model. If consumption exceeds generation, the
> diesel burn rate accelerates above 1├ù; food always depletes at 1├ù regardless.
> The warning threshold is 15 days remaining; critical is 7 days."

Gesture at the threshold lines or crossing annotations on the forecast chart.

> "These projections are derived from simulated inventory numbers ΓÇö they're
> honest about that with a Derived badge. The chart makes it easy to see when
> a threshold is projected to be crossed, which is the kind of forward-view an
> operator actually needs."

---

### Step 6 ΓÇö Comms degradation: the standout beat (3:50 ΓÇô 4:30)

**Action:** Navigate back to the **Overview** tab. Locate the **LinkStatusIndicator**
button in the top-right corner of the header ΓÇö it currently reads **Live** with a
green pulsing dot and a Wifi icon.

**Narration:**

> "The last thing to show is the comms degradation mode. In a real polar
> operation, a satellite link can drop. We simulate that with this toggle."

Click the **Live ┬╖ toggle** button once.

**What happens immediately:** The backend `POST /link/toggle` call fires. The
button text changes from **Live** to **Degraded**, the dot changes from green to
amber, and the Wifi icon changes to WifiOff. The Overview panel shows a banner:
"Communication Link Degraded ΓÇö Polar Backhaul Stalled ΓÇö Displaying the last
synchronized station state." There is no loading spinner ΓÇö the transition is
instant on the UI side once the API responds (the indicator's `duration-200`
CSS transition applies).

> "The link is now degraded. The dashboard keeps displaying the last
> synchronized state ΓÇö it doesn't blank out. This is the graceful-degradation
> path: cached telemetry rather than a broken UI."

Pause for 3ΓÇô4 seconds to let the degraded state be visible.

Click the **Degraded ┬╖ toggle** button once to restore.

**What happens:** The button immediately shows a spinning RefreshCw icon and the
text **Restoring link...** with a teal background. After exactly 750 ms
(a `setTimeout` in `LinkContext.tsx`), the state resolves to **Live**, the green
dot and Wifi icon return, and the Overview panel shows a brief green "Link
Restored ΓÇö Synchronizing station telemetry state with polar ground station..."
banner.

> "The 750-millisecond restoration delay is deliberate ΓÇö it gives the UI time to
> animate the sync handshake. The whole comms toggle is simulated demo
> infrastructure; it's tagged as such with a Simulated badge on the indicator."

---

### Step 7 ΓÇö Close (4:30 ΓÇô 4:50)

**Action:** Return to the **Overview** tab, link showing **Live**, Maitri data
displayed.

**Narration:**

> "To summarise: real archived weather from NCPOR grounds the twin; energy,
> logistics, and asset telemetry are honestly labelled simulated; anomaly
> detection, forecasts, and what-if results are derived from those inputs. Every
> metric carries its source tag in the API response and in the UI. The
> architecture is designed so any simulated field can be replaced by a real feed
> without changing field names or the provenance system."

End recording.

---

## If something breaks mid-recording

- **Backend cold-start (504 / network error on any tab):** Switch to a
  pre-recorded screen-capture backup clip of the same flow, which should be kept
  ready. The Render free tier sleeps after 15 minutes of inactivity ΓÇö the first
  request after a sleep can take 20ΓÇô30 seconds.
- **What-If returns a 422 or the simulation result looks wrong:** Switch
  scenarios. **Resupply Delay** is the most stable scenario because it uses
  all-1.0 multipliers and only tests whether the 45-day delay exceeds current
  reserves ΓÇö it always produces a clean, readable output regardless of the
  jittered state.
- **Provenance ledger chip is not visible:** The chip is hidden below the `lg`
  breakpoint. Widen the browser window or zoom out to 90 % ΓÇö do not proceed
  without the chip being visible since it is a key demo element.

---

## Notes for a live (not recorded) demo

- **Backend warm-up:** Before walking into the room, open the app on your
  machine and click through all four tabs at least once so the Render instance
  is warm. The first cold-start after sleep can take 20ΓÇô30 seconds, which will
  visibly stall the live demo.
- **Fallback clip:** Have a local screen recording of the full flow on a second
  device or in a separate browser tab (as a video file). If the Render backend
  is unreachable during the judging session, play the clip and narrate over it ΓÇö
  judges at SIH typically accept a backup recording when a live network failure
  is the cause.
- **Render vs. `main` drift:** Before the judging session, verify the deployed
  Render URL is serving the same commit as `main` by checking
  `/openapi.json` for the `/assets/{asset_id}` path. If it's missing, the
  deployment is behind and the Assets tab will likely error live.
- **Comms toggle is the most reliable beat:** The toggle does not depend on CSV
  data or a complex computation ΓÇö it just POSTs to `/link/toggle`. Even if the
  rest of the backend is slow, this beat will work cleanly and is visually
  striking. Prioritise reaching this step if time is running short.
