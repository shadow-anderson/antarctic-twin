00:00
Hi, myself Umang Pal and I am presenting Polar Twin. 
00:00
Hi, myself Umang Pal and I am presenting Polar Twin. An answer to problem statement 26060. 
00:04
An answer to problem statement 26060.      
00:06
Maitri and Bharati station sit in Antarctica. 
00:09
Remote and satellite linked. 
00:10
The first generator fails or a Blizzard hits. 
00:14
Mission Control has no real time picture of what's happening on the ground. 
00:19
Polar Twin is a live digital twin that gives them control. 
00:23
Honestly labeled, real versus simulated, built and deployed.
00:29
We have just switched to Bharati station.
00:32
This is the overview tab.
00:34
Every number you see here has a declared origin.
00:39
Tagged real, simulated or derived.
00:43
And this is our what if command center.
00:46
Let's say a generator fails. 
00:48
I hit run simulation. 
00:50
That request goes to a fastAPI backend. 
00:54
It takes the station's current state, applies the scenario's cascade multipliers, and recomputes resource and operational impacts. 
01:01
This is not a scripted response. 
01:03
Every run goes through the model.  
01:05
Simulation verdict: days until the situation turns critical; Urgency  Level: Urgent, Warning, or Monitor. 
01:10
 For a station 14,000 kilometers away, knowing that number before the failure compounds.
01:16
That's the entire point of the system.
01:20
Scrolling further, the Mission Readiness score has updated to reflect the active scenario. 
01:26
Baseline vs Simulated, showing exactly how many points each subsystem category lost. 
01:31
And the Explainable Risk Panel tells you in plain English why risk is high because the primary generator is offline and secondary generation is operating near maximum continuous rating without redundancy.
01:48
If we scroll a little down, we have the scenario timeline which lays out that same failure R by R unmitigated versus with mitigation applied.
02:00
And below this we have the Cascading Risk Engine which transists one failure through 6 interconnected subsystems.
02:08
Comms to logistics.
02:11
So how do we know what you just saw was real computation and not a display trick? 
02:18
This chip the data provenance Ledger. 
02:21
weather is a real archived NCPOR and IMD data.
02:25
Energy and logistics is a seeded simulation model. 
02:29
Forecasts and that verdict,"What-if" you just saw is derived and computed live.
02:36
Nothing on the screen pretends to be something it isn't.
02:41
3D Digital Twin is a full spatial representation of the Station 8 independently toggleable layers energy, infra, environment, logistics, communication, asset health, alerts and data flow.
02:54
The top ticker shows live metric.
02:57
Temperature, wind speed, power load, battery stage and fuel days. 
03:01
Click any 3D asset here. 
03:03
The generator block and the right hand inspector panel opens with its telemetry, dependencies and status.
03:11
I can toggle individual layers, hide logistics, hide environment, isolate the power subsystem, giving operators, a focused view for each discipline. 
03:21
Bottom filter tabs let you jump between power structure, water, logistics, and science subsystems.
03:28
Instantly.
03:32
And here is the forecast tab.
03:35
30 day depletion horizon. 
03:36
The system runs a daily linear burn against current reserves. 
03:40
That hero at the top the nearest threshold crossing: how many days until diesel or food hits the 15 day warning line or the seven day critical emergency line.
03:53
Diesel on the left, Food on the right. 
03:56
Both charts update whenever station data refreshes.
04:01
And below this the full inventory, fuel, battery, water, food, medical, each with its own depletion trend and a direct action "shift non critical heating loads within phase".
04:16
And here comes the ASSETS tab,  *13 physical nodes, tracked across the station.
04:22
Click 3D Schematic.
04:24
This is a live threeJS render of the station layout.
04:28
Main building generators, water systems, logistics stores.
04:33
Each beacon is colored by asset status.
04:37
Healthy, warning or critical.
04:40
Click any building and you will get full diagnostics right below.
04:46
Maitri and Bharti render with structure differences.
04:50
That's Maitri Main building raised on stilts, exactly as built.
04:59
The Logistics tab covers 2 capabilities, the Road simulator, which models maritime and overland resupply paths under polar conditions.
05:10
And the Interstation Coordination Panel that lets operators plan mutual contingency support between Mathuri and Bharti when 1 station needs emergency resources.
05:25
And finally, the Mission Report. 
05:27
1 button generates a 10 section Executive Intelligence briefing that consolidates everything we just saw. 
05:32
It can be exported as a PDF or printed. 
05:36
Designed for the moment an operator needs to brief command before communication goes dark.
05:44
The same dashboard also runs natively on Android. 
05:48
Same data, same tabs, no separate build to maintain.
05:54
This is the overview tab.
05:57
Here comes the asset tab.
06:03
And here you can see the maitri and Bharati simulations.
06:09
Here comes the forecast.
06:14
And in assets, we can also see the schematic as well.
06:20
Details are here.