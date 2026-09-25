import {
  StationCurrent,
  Anomaly,
  WhatIfResult,
  LinkStatus,
  AssetNode,
  AssetDetail,
  ScenarioDefinition,
  ScenarioTrigger
} from "./types";

export const STATION_METADATA = {
  maitri: {
    id: "maitri",
    name: "Maitri",
    tag: "Antarctic Research Station",
    coordinates: "70°45′57″ S, 11°44′09″ E",
    region: "Schirmacher Oasis, Queen Maud Land",
    capacity: 25,
    established: 1989,
    elevation: "117 m",
  },
  bharati: {
    id: "bharati",
    name: "Bharati",
    tag: "Antarctic Research Station",
    coordinates: "69°24′29″ S, 76°11′14″ E",
    region: "Larsemann Hills, East Antarctica",
    capacity: 47,
    established: 2012,
    elevation: "35 m",
  },
};

export const MOCK_CURRENT_MAITRI: StationCurrent = {
  station_id: "maitri",
  timestamp: "2026-09-26T14:32:00Z",
  weather: {
    temperature_c: { value: -32.8, source: "real" },
    wind_speed_ms: { value: 18.6, source: "real" },
    pressure_hpa: { value: 964.2, source: "real" },
  },
  energy: {
    generation_kw: { value: 510, source: "simulated" },
    consumption_kw: { value: 428, source: "simulated" },
    diesel_pct: { value: 76, source: "simulated" },
  },
  logistics: {
    food_days_remaining: { value: 32, source: "derived" },
    diesel_days_remaining: { value: 41, source: "derived" },
  },
};

export const MOCK_CURRENT_BHARATI: StationCurrent = {
  station_id: "bharati",
  timestamp: "2026-09-26T14:32:00Z",
  weather: {
    temperature_c: { value: -24.1, source: "real" },
    wind_speed_ms: { value: 9.3, source: "real" },
    pressure_hpa: { value: 982.5, source: "real" },
  },
  energy: {
    generation_kw: { value: 380, source: "simulated" },
    consumption_kw: { value: 310, source: "simulated" },
    diesel_pct: { value: 84, source: "simulated" },
  },
  logistics: {
    food_days_remaining: { value: 54, source: "derived" },
    diesel_days_remaining: { value: 65, source: "derived" },
  },
};

export const MOCK_ANOMALIES_MAITRI: Anomaly[] = [
  {
    variable: "wind_speed",
    value: 18.6,
    baseline_mean: 8.4,
    baseline_stddev: 2.3,
    severity: "medium",
  },
];

export const MOCK_ANOMALIES_BHARATI: Anomaly[] = [];

export const ASSET_TREE_DATA: AssetNode[] = [
  {
    id: "power",
    label: "POWER",
    status: "warning",
    children: [
      { id: "gen-01", label: "Generator 01", status: "healthy" },
      { id: "gen-02", label: "Generator 02", status: "warning" },
      { id: "battery-sys", label: "Battery System", status: "healthy" },
    ],
  },
  {
    id: "water",
    label: "WATER",
    status: "healthy",
    children: [
      { id: "water-pump", label: "Pump", status: "healthy" },
      { id: "water-storage", label: "Storage", status: "healthy" },
    ],
  },
  {
    id: "buildings",
    label: "BUILDINGS",
    status: "healthy",
    children: [
      { id: "bld-main", label: "Main Building", status: "healthy" },
      { id: "bld-lab", label: "Laboratory", status: "healthy" },
      { id: "bld-storage", label: "Storage", status: "healthy" },
    ],
  },
  {
    id: "logistics",
    label: "LOGISTICS",
    status: "warning",
    children: [
      { id: "log-food", label: "Food", status: "healthy" },
      { id: "log-diesel", label: "Diesel", status: "warning" },
      { id: "log-medical", label: "Medical", status: "healthy" },
      { id: "log-water", label: "Water", status: "healthy" },
      { id: "log-spares", label: "Spares", status: "healthy" },
    ],
  },
];

export const MOCK_ASSET_DETAILS: Record<string, AssetDetail> = {
  "gen-01": {
    id: "gen-01",
    name: "Generator 01",
    category: "POWER INFRASTRUCTURE",
    status: "healthy",
    health_pct: 96,
    temperature_c: 72,
    vibration_mms: 2.1,
    efficiency_pct: 91,
    runtime_hours: 3248,
    operational_status: "Operational",
    last_inspected: "2026-09-18 09:00 UTC",
    telemetry_source: "simulated",
    specs: [
      { label: "Rated Output", value: "250 kW" },
      { label: "Fuel Rate", value: "38.2 L/h" },
      { label: "Alternator Voltage", value: "415 V 3-Phase" },
      { label: "Oil Pressure", value: "4.8 bar" },
    ],
  },
  "gen-02": {
    id: "gen-02",
    name: "Generator 02",
    category: "POWER INFRASTRUCTURE",
    status: "warning",
    health_pct: 74,
    temperature_c: 88,
    vibration_mms: 4.8,
    efficiency_pct: 82,
    runtime_hours: 5120,
    operational_status: "Elevated Thermal State",
    last_inspected: "2026-09-10 11:30 UTC",
    telemetry_source: "simulated",
    specs: [
      { label: "Rated Output", value: "250 kW" },
      { label: "Fuel Rate", value: "44.1 L/h" },
      { label: "Alternator Voltage", value: "408 V 3-Phase" },
      { label: "Oil Pressure", value: "3.9 bar" },
    ],
  },
  "battery-sys": {
    id: "battery-sys",
    name: "Battery System",
    category: "POWER INFRASTRUCTURE",
    status: "healthy",
    health_pct: 98,
    temperature_c: 19,
    vibration_mms: 0.1,
    efficiency_pct: 95,
    runtime_hours: 8760,
    operational_status: "Float Charging",
    last_inspected: "2026-09-22 14:00 UTC",
    telemetry_source: "simulated",
    specs: [
      { label: "Capacity", value: "360 kWh" },
      { label: "State of Charge", value: "92%" },
      { label: "Cycle Count", value: "412" },
      { label: "Bus Voltage", value: "480 V DC" },
    ],
  },
  "water-pump": {
    id: "water-pump",
    name: "Primary Meltwater Pump",
    category: "WATER LIFESUPPORT",
    status: "healthy",
    health_pct: 94,
    temperature_c: 42,
    vibration_mms: 1.8,
    efficiency_pct: 89,
    runtime_hours: 1920,
    operational_status: "Operational",
    last_inspected: "2026-09-21 08:30 UTC",
    telemetry_source: "simulated",
    specs: [
      { label: "Flow Rate", value: "4.5 m³/h" },
      { label: "Discharge Pressure", value: "3.2 bar" },
      { label: "Trace Heating", value: "Active (+4°C)" },
    ],
  },
  "water-storage": {
    id: "water-storage",
    name: "Insulated Reservoir",
    category: "WATER LIFESUPPORT",
    status: "healthy",
    health_pct: 99,
    temperature_c: 6,
    vibration_mms: 0.0,
    efficiency_pct: 100,
    runtime_hours: 14600,
    operational_status: "Holding Nominal",
    last_inspected: "2026-09-24 16:00 UTC",
    telemetry_source: "simulated",
    specs: [
      { label: "Current Volume", value: "18,400 L" },
      { label: "Capacity", value: "25,000 L" },
      { label: "Immersion Heaters", value: "Standby (Auto)" },
    ],
  },
  "bld-main": {
    id: "bld-main",
    name: "Main Habitation Module",
    category: "BUILDINGS & HABITAT",
    status: "healthy",
    health_pct: 95,
    temperature_c: 21,
    vibration_mms: 0.2,
    efficiency_pct: 93,
    runtime_hours: 26280,
    operational_status: "Nominal Pressurization",
    last_inspected: "2026-09-20 10:00 UTC",
    telemetry_source: "simulated",
    specs: [
      { label: "Internal Pressure", value: "1013 hPa" },
      { label: "HVAC Return Air", value: "+21.4°C" },
      { label: "Airlock Cycles / Day", value: "18" },
    ],
  },
  "bld-lab": {
    id: "bld-lab",
    name: "Scientific Laboratory",
    category: "BUILDINGS & HABITAT",
    status: "healthy",
    health_pct: 97,
    temperature_c: 20,
    vibration_mms: 0.4,
    efficiency_pct: 96,
    runtime_hours: 21900,
    operational_status: "Active Research Operations",
    last_inspected: "2026-09-23 11:00 UTC",
    telemetry_source: "simulated",
    specs: [
      { label: "Clean Room Filter", value: "99.97% HEPA" },
      { label: "Clean Air Delta-P", value: "45 Pa" },
      { label: "Instrument Load", value: "42 kW" },
    ],
  },
  "bld-storage": {
    id: "bld-storage",
    name: "Cold Logistics Bunker",
    category: "BUILDINGS & HABITAT",
    status: "healthy",
    health_pct: 92,
    temperature_c: -8,
    vibration_mms: 0.1,
    efficiency_pct: 90,
    runtime_hours: 31000,
    operational_status: "Stable Sub-Zero Storage",
    last_inspected: "2026-09-15 15:00 UTC",
    telemetry_source: "simulated",
    specs: [
      { label: "Insulation R-Value", value: "R-48" },
      { label: "Fire Suppression", value: "Inert Gas Armed" },
    ],
  },
  "log-food": {
    id: "log-food",
    name: "Food & Rations Stockpile",
    category: "LOGISTICS & SURVIVAL",
    status: "healthy",
    health_pct: 90,
    operational_status: "32 Days at Standard Burn Rate",
    last_inspected: "2026-09-25 08:00 UTC",
    telemetry_source: "derived",
    specs: [
      { label: "Dry Freeze Rations", value: "1,840 kg" },
      { label: "Frozen Provisions", value: "980 kg" },
      { label: "Per Capita Daily", value: "3,200 kcal" },
    ],
  },
  "log-diesel": {
    id: "log-diesel",
    name: "Arctic Fuel Reserves",
    category: "LOGISTICS & SURVIVAL",
    status: "warning",
    health_pct: 76,
    operational_status: "41 Days Reserve (Threshold 45d)",
    last_inspected: "2026-09-25 12:00 UTC",
    telemetry_source: "derived",
    specs: [
      { label: "Tank 1 (Main)", value: "76% (48,000 L)" },
      { label: "Tank 2 (Reserve)", value: "62% (39,000 L)" },
      { label: "Consumption Trend", value: "1,640 L/day" },
    ],
  },
  "log-medical": {
    id: "log-medical",
    name: "Medical Clinic Infirmary",
    category: "LOGISTICS & SURVIVAL",
    status: "healthy",
    health_pct: 99,
    operational_status: "100% Critical Supplies Green",
    last_inspected: "2026-09-24 14:00 UTC",
    telemetry_source: "derived",
    specs: [
      { label: "O2 Cylinders", value: "12 / 12 Full" },
      { label: "Trauma Packs", value: "Certified Exp 2028" },
      { label: "Telemedicine Link", value: "Ready" },
    ],
  },
  "log-water": {
    id: "log-water",
    name: "Potable Water Buffer",
    category: "LOGISTICS & SURVIVAL",
    status: "healthy",
    health_pct: 94,
    operational_status: "18,400 L Available",
    last_inspected: "2026-09-25 06:00 UTC",
    telemetry_source: "derived",
    specs: [
      { label: "Daily Consumption", value: "1,100 L/day" },
      { label: "Autonomous Reserve", value: "16.7 Days" },
    ],
  },
  "log-spares": {
    id: "log-spares",
    name: "Mechanical & Electrical Spares",
    category: "LOGISTICS & SURVIVAL",
    status: "healthy",
    health_pct: 91,
    operational_status: "Critical Spares Inventory Complete",
    last_inspected: "2026-09-19 16:30 UTC",
    telemetry_source: "derived",
    specs: [
      { label: "Gen Injector Kits", value: "4 units" },
      { label: "HVAC Belts & Motors", value: "8 sets" },
      { label: "Cable Splice Kits", value: "12 kits" },
    ],
  },
};

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: "generator_failure",
    title: "GENERATOR FAILURE",
    tagline: "Primary power generation fault",
    description: "Simulate loss of primary generation capacity.",
    impact_summary: [
      "Generator offline",
      "Available generation reduced",
      "Critical loads prioritized",
      "Backup capacity activated",
    ],
  },
  {
    id: "blizzard",
    title: "BLIZZARD",
    tagline: "Severe environmental storm",
    description: "Simulate severe environmental conditions.",
    impact_summary: [
      "Ambient temp drops below -42°C",
      "Wind sustained above 32 m/s",
      "Structural thermal load spikes",
      "Outside work strictly suspended",
    ],
  },
  {
    id: "resupply_delay",
    title: "RESUPPLY DELAY",
    tagline: "Logistics replenishment hold",
    description: "Simulate delayed logistics replenishment.",
    impact_summary: [
      "Vessel navigation blocked by sea ice",
      "Fuel delivery pushed back 45 days",
      "Food rations conservation triggered",
      "Secondary module power shaved",
    ],
  },
];

export const MOCK_WHATIF_RESULTS: Record<ScenarioTrigger, WhatIfResult> = {
  generator_failure: {
    timeline: [
      { day: 0, event: "Generator failure detected on primary power bus" },
      { day: 1, event: "Backup generation activated; non-critical lab heaters throttled" },
      { day: 2, event: "Fuel consumption increases by 18% on secondary unit" },
      { day: 3, event: "Scheduled maintenance window required for injector rebuild" },
    ],
    recommendations: [
      "Activate backup generation immediately",
      "Prioritize critical life-support and habitat heating loads",
      "Schedule emergency generator mechanical inspection",
      "Monitor diesel reserve drawdown rate",
    ],
  },
  blizzard: {
    timeline: [
      { day: 0, event: "Category 3 Blizzard warning triggered; wind gusting 32 m/s" },
      { day: 1, event: "External HVAC intake filters iced; switch to recirculated mode" },
      { day: 2, event: "Station structural thermal leakage increases generator load to 490 kW" },
      { day: 3, event: "Blizzard winds subside; external antenna alignment verification required" },
    ],
    recommendations: [
      "Seal outer airlocks and engage emergency perimeter heating",
      "Preheat secondary backup generators to avoid cold-start stall",
      "Lock down external transport and outside scientific array tasks",
      "Reroute vital satellite comms to redundant radome feed",
    ],
  },
  resupply_delay: {
    timeline: [
      { day: 0, event: "Supply vessel polar ice encounter; arrival delayed by 45 days" },
      { day: 1, event: "Logistics audit locks current diesel stock at 41 days reserve" },
      { day: 2, event: "Thermal setpoint reduced to 18°C across non-habitation modules" },
      { day: 3, event: "Extended ration schedule initiated; medical supplies verified stable" },
    ],
    recommendations: [
      "Reduce non-essential research power usage during night hours",
      "Implement stage-1 fuel conservation protocol",
      "Re-evaluate food inventory expiry horizons and freeze-dry balance",
      "Coordinate with Bharati station for inter-station supply contingency",
    ],
  },
};

export const MOCK_LINK_INITIAL: LinkStatus = {
  connected: true,
  last_synced: "14:32 UTC",
};
