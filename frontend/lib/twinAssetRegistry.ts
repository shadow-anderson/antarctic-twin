/**
 * POLARIS-STYLE ASSET REGISTRY
 * Deterministic data for the 3D Twin page.
 * All values are fixed — no random generation.
 * Station-specific data is keyed by stationId.
 */

export type TwinAssetStatus = "nominal" | "warning" | "degraded" | "critical";
export type TwinAssetCategory =
  | "power"
  | "hvac"
  | "water"
  | "logistics"
  | "comms"
  | "structure"
  | "science";

export type TwinLayerId =
  | "energy"
  | "infrastructure"
  | "environment"
  | "logistics"
  | "communication"
  | "assetHealth"
  | "alerts"
  | "dataFlow";

export interface TwinTelemetryField {
  label: string;
  value: string;
  unit?: string;
}

export interface TwinAsset {
  id: string;
  name: string;
  shortId: string;
  type: string;
  category: TwinAssetCategory;
  layer: TwinLayerId;
  description: string;

  // 3D placement — matches ASSET_DEFS positions in StationSchematic
  position: [number, number, number];
  schematicId: string; // maps to the id in ASSET_DEFS in StationSchematic.tsx

  // Health metrics (deterministic per station)
  maitri: {
    status: TwinAssetStatus;
    healthPct: number;
    failureProbPct: number;
    rulHours: number;
    telemetry: TwinTelemetryField[];
    dependencies: string[]; // other asset IDs this asset feeds into
  };
  bharati: {
    status: TwinAssetStatus;
    healthPct: number;
    failureProbPct: number;
    rulHours: number;
    telemetry: TwinTelemetryField[];
    dependencies: string[];
  };
}

export const TWIN_ASSET_REGISTRY: TwinAsset[] = [
  /* ── POWER GENERATION ── */
  {
    id: "gen-01",
    name: "Diesel Generator 01",
    shortId: "GEN-01",
    type: "Diesel Generator",
    category: "power",
    layer: "energy",
    description: "Primary 250 kW diesel genset providing base load to main power bus.",
    position: [2.0, 0, -2.5],
    schematicId: "gen-01",
    maitri: {
      status: "nominal",
      healthPct: 91,
      failureProbPct: 6,
      rulHours: 1840,
      telemetry: [
        { label: "Output", value: "218", unit: "kW" },
        { label: "Load Factor", value: "87", unit: "%" },
        { label: "Temperature", value: "76", unit: "°C" },
        { label: "Fuel Flow", value: "9.1", unit: "L/h" },
        { label: "Runtime (Total)", value: "14 820", unit: "h" },
        { label: "Vibration", value: "3.8", unit: "mm/s" },
      ],
      dependencies: ["battery-sys", "bld-main", "bld-lab", "hvac-01"],
    },
    bharati: {
      status: "nominal",
      healthPct: 94,
      failureProbPct: 4,
      rulHours: 2310,
      telemetry: [
        { label: "Output", value: "232", unit: "kW" },
        { label: "Load Factor", value: "80", unit: "%" },
        { label: "Temperature", value: "71", unit: "°C" },
        { label: "Fuel Flow", value: "8.4", unit: "L/h" },
        { label: "Runtime (Total)", value: "11 420", unit: "h" },
        { label: "Vibration", value: "2.9", unit: "mm/s" },
      ],
      dependencies: ["battery-sys", "bld-main", "bld-lab", "hvac-01"],
    },
  },
  {
    id: "gen-02",
    name: "Diesel Generator 02",
    shortId: "GEN-02",
    type: "Diesel Generator",
    category: "power",
    layer: "energy",
    description: "Secondary 250 kW diesel genset — warm standby / load sharing.",
    position: [3.5, 0, -2.5],
    schematicId: "gen-02",
    maitri: {
      status: "warning",
      healthPct: 76,
      failureProbPct: 18,
      rulHours: 420,
      telemetry: [
        { label: "Output", value: "142", unit: "kW" },
        { label: "Load Factor", value: "57", unit: "%" },
        { label: "Temperature", value: "82", unit: "°C" },
        { label: "Fuel Flow", value: "6.7", unit: "L/h" },
        { label: "Runtime (Total)", value: "19 340", unit: "h" },
        { label: "Vibration", value: "6.2", unit: "mm/s ⚠" },
      ],
      dependencies: ["battery-sys", "bld-storage"],
    },
    bharati: {
      status: "nominal",
      healthPct: 88,
      failureProbPct: 8,
      rulHours: 1640,
      telemetry: [
        { label: "Output", value: "168", unit: "kW" },
        { label: "Load Factor", value: "67", unit: "%" },
        { label: "Temperature", value: "74", unit: "°C" },
        { label: "Fuel Flow", value: "7.2", unit: "L/h" },
        { label: "Runtime (Total)", value: "9 820", unit: "h" },
        { label: "Vibration", value: "2.4", unit: "mm/s" },
      ],
      dependencies: ["battery-sys", "bld-storage"],
    },
  },

  /* ── BATTERY / BESS ── */
  {
    id: "battery-sys",
    name: "Battery Energy Storage",
    shortId: "BESS-01",
    type: "Li-Ion BESS",
    category: "power",
    layer: "energy",
    description: "360 kWh lithium-ion battery energy storage system. Provides short-term buffer and peak shaving.",
    position: [2.7, 0, -1.2],
    schematicId: "battery-sys",
    maitri: {
      status: "nominal",
      healthPct: 84,
      failureProbPct: 7,
      rulHours: 3100,
      telemetry: [
        { label: "SOC", value: "68", unit: "%" },
        { label: "Voltage", value: "748", unit: "V" },
        { label: "Current", value: "+94", unit: "A" },
        { label: "Temperature", value: "24", unit: "°C" },
        { label: "Charge Rate", value: "+70", unit: "kW" },
        { label: "Capacity", value: "360", unit: "kWh" },
      ],
      dependencies: ["bld-main", "bld-lab", "hvac-01"],
    },
    bharati: {
      status: "nominal",
      healthPct: 91,
      failureProbPct: 4,
      rulHours: 4200,
      telemetry: [
        { label: "SOC", value: "74", unit: "%" },
        { label: "Voltage", value: "812", unit: "V" },
        { label: "Current", value: "+88", unit: "A" },
        { label: "Temperature", value: "22", unit: "°C" },
        { label: "Charge Rate", value: "+66", unit: "kW" },
        { label: "Capacity", value: "480", unit: "kWh" },
      ],
      dependencies: ["bld-main", "bld-lab", "hvac-01"],
    },
  },

  /* ── HVAC ── */
  {
    id: "hvac-01",
    name: "HVAC System",
    shortId: "HVAC-01",
    type: "Climate Control",
    category: "hvac",
    layer: "infrastructure",
    description: "Integrated heating, ventilation, and air conditioning for main habitation module.",
    position: [-0.2, 0, -1.5],
    schematicId: "bld-lab",
    maitri: {
      status: "nominal",
      healthPct: 88,
      failureProbPct: 9,
      rulHours: 760,
      telemetry: [
        { label: "Supply Temp", value: "21", unit: "°C" },
        { label: "Return Temp", value: "18", unit: "°C" },
        { label: "Load", value: "62", unit: "%" },
        { label: "Efficiency", value: "89", unit: "%" },
        { label: "Flow Rate", value: "2.4", unit: "m³/s" },
        { label: "State", value: "HEATING", unit: "" },
      ],
      dependencies: ["bld-main"],
    },
    bharati: {
      status: "nominal",
      healthPct: 92,
      failureProbPct: 5,
      rulHours: 1100,
      telemetry: [
        { label: "Supply Temp", value: "22", unit: "°C" },
        { label: "Return Temp", value: "19", unit: "°C" },
        { label: "Load", value: "54", unit: "%" },
        { label: "Efficiency", value: "93", unit: "%" },
        { label: "Flow Rate", value: "2.8", unit: "m³/s" },
        { label: "State", value: "HEATING", unit: "" },
      ],
      dependencies: ["bld-main"],
    },
  },

  /* ── WATER ── */
  {
    id: "water-pump",
    name: "Water Pump House",
    shortId: "WPH-01",
    type: "Water System",
    category: "water",
    layer: "infrastructure",
    description:
      "Maitri: Lake Priyadarshini intake pump system. Bharati: Sea water desalination primary feed pump.",
    position: [-3.0, 0, 2.0],
    schematicId: "water-pump",
    maitri: {
      status: "warning",
      healthPct: 79,
      failureProbPct: 14,
      rulHours: 340,
      telemetry: [
        { label: "Flow Rate", value: "3.2", unit: "m³/h" },
        { label: "Pressure", value: "2.8", unit: "bar" },
        { label: "Temp (intake)", value: "-0.4", unit: "°C ⚠" },
        { label: "Power Draw", value: "4.1", unit: "kW" },
        { label: "Buffer Tank", value: "82", unit: "%" },
      ],
      dependencies: ["water-storage", "bld-main"],
    },
    bharati: {
      status: "warning",
      healthPct: 82,
      failureProbPct: 11,
      rulHours: 610,
      telemetry: [
        { label: "Flow Rate", value: "4.8", unit: "m³/h" },
        { label: "Delta-P", value: "3.5", unit: "bar ⚠" },
        { label: "Salinity", value: "28", unit: "PSU" },
        { label: "Power Draw", value: "6.2", unit: "kW" },
        { label: "Buffer Tank", value: "74", unit: "%" },
      ],
      dependencies: ["water-storage", "bld-main"],
    },
  },
  {
    id: "water-storage",
    name: "Water Storage Tank",
    shortId: "WST-01",
    type: "Water Storage",
    category: "water",
    layer: "logistics",
    description: "Insulated potable water reservoir with trace heating circuit.",
    position: [-1.5, 0, 2.0],
    schematicId: "water-storage",
    maitri: {
      status: "nominal",
      healthPct: 95,
      failureProbPct: 2,
      rulHours: 8760,
      telemetry: [
        { label: "Volume", value: "14 800", unit: "L" },
        { label: "Level", value: "78", unit: "%" },
        { label: "Water Temp", value: "+4", unit: "°C" },
        { label: "Trace Heat", value: "ON", unit: "" },
      ],
      dependencies: ["bld-main"],
    },
    bharati: {
      status: "nominal",
      healthPct: 97,
      failureProbPct: 1,
      rulHours: 8760,
      telemetry: [
        { label: "Volume", value: "22 000", unit: "L" },
        { label: "Level", value: "85", unit: "%" },
        { label: "Water Temp", value: "+6", unit: "°C" },
        { label: "Trace Heat", value: "ON", unit: "" },
      ],
      dependencies: ["bld-main"],
    },
  },

  /* ── FUEL/LOGISTICS ── */
  {
    id: "log-diesel",
    name: "Diesel Fuel Storage",
    shortId: "FUEL-01",
    type: "Fuel Storage",
    category: "logistics",
    layer: "logistics",
    description: "Above-ground heated diesel storage. Feeds primary and secondary generators.",
    position: [1.5, 0, 1.0],
    schematicId: "log-diesel",
    maitri: {
      status: "warning",
      healthPct: 100,
      failureProbPct: 0,
      rulHours: 9999,
      telemetry: [
        { label: "Level", value: "62", unit: "%" },
        { label: "Volume", value: "18 600", unit: "L" },
        { label: "Temp", value: "-2", unit: "°C" },
        { label: "Burn Rate", value: "9.1", unit: "L/h" },
        { label: "Days Remaining", value: "8.4", unit: "days ⚠" },
      ],
      dependencies: ["gen-01", "gen-02"],
    },
    bharati: {
      status: "nominal",
      healthPct: 100,
      failureProbPct: 0,
      rulHours: 9999,
      telemetry: [
        { label: "Level", value: "78", unit: "%" },
        { label: "Volume", value: "23 400", unit: "L" },
        { label: "Temp", value: "0", unit: "°C" },
        { label: "Burn Rate", value: "8.4", unit: "L/h" },
        { label: "Days Remaining", value: "11.6", unit: "days" },
      ],
      dependencies: ["gen-01", "gen-02"],
    },
  },
  {
    id: "log-food",
    name: "Food Supply Store",
    shortId: "FOOD-01",
    type: "Food Storage",
    category: "logistics",
    layer: "logistics",
    description: "Refrigerated and dry food stores. Supports full wintering team.",
    position: [1.5, 0, 2.5],
    schematicId: "log-food",
    maitri: {
      status: "nominal",
      healthPct: 100,
      failureProbPct: 0,
      rulHours: 9999,
      telemetry: [
        { label: "Days Remaining", value: "42", unit: "days" },
        { label: "Frozen Store", value: "68", unit: "%" },
        { label: "Dry Store", value: "81", unit: "%" },
        { label: "Store Temp", value: "-18", unit: "°C" },
      ],
      dependencies: ["bld-main"],
    },
    bharati: {
      status: "nominal",
      healthPct: 100,
      failureProbPct: 0,
      rulHours: 9999,
      telemetry: [
        { label: "Days Remaining", value: "56", unit: "days" },
        { label: "Frozen Store", value: "74", unit: "%" },
        { label: "Dry Store", value: "88", unit: "%" },
        { label: "Store Temp", value: "-18", unit: "°C" },
      ],
      dependencies: ["bld-main"],
    },
  },

  /* ── COMMUNICATION ── */
  {
    id: "antenna-01",
    name: "Satellite Comms Antenna",
    shortId: "SAT-01",
    type: "Communications",
    category: "comms",
    layer: "communication",
    description: "ISRO VSAT antenna for telemetry, voice, and data link with NCPOR Goa.",
    position: [-2.5, 0, -1.5],
    schematicId: "bld-main",
    maitri: {
      status: "nominal",
      healthPct: 97,
      failureProbPct: 2,
      rulHours: 9999,
      telemetry: [
        { label: "Signal", value: "-68", unit: "dBm" },
        { label: "Latency", value: "480", unit: "ms" },
        { label: "Uplink", value: "2.1", unit: "Mbps" },
        { label: "Downlink", value: "4.8", unit: "Mbps" },
        { label: "Last Sync", value: "02:14", unit: "UTC" },
        { label: "Status", value: "NOMINAL", unit: "" },
      ],
      dependencies: [],
    },
    bharati: {
      status: "nominal",
      healthPct: 99,
      failureProbPct: 1,
      rulHours: 9999,
      telemetry: [
        { label: "Signal", value: "-64", unit: "dBm" },
        { label: "Latency", value: "390", unit: "ms" },
        { label: "Uplink", value: "3.4", unit: "Mbps" },
        { label: "Downlink", value: "7.2", unit: "Mbps" },
        { label: "Last Sync", value: "02:18", unit: "UTC" },
        { label: "Status", value: "NOMINAL", unit: "" },
      ],
      dependencies: [],
    },
  },

  /* ── MAIN BUILDING ── */
  {
    id: "bld-main",
    name: "Main Station Building",
    shortId: "MAIN-01",
    type: "Habitation Module",
    category: "structure",
    layer: "infrastructure",
    description:
      "Central habitation module housing crew quarters, control room, medical bay, and common areas.",
    position: [-2.5, 0, -1.5],
    schematicId: "bld-main",
    maitri: {
      status: "nominal",
      healthPct: 88,
      failureProbPct: 3,
      rulHours: 9999,
      telemetry: [
        { label: "Internal Temp", value: "20", unit: "°C" },
        { label: "Humidity", value: "38", unit: "%" },
        { label: "CO₂", value: "412", unit: "ppm" },
        { label: "Pressure", value: "1012", unit: "hPa" },
        { label: "Occupancy", value: "24", unit: "personnel" },
      ],
      dependencies: [],
    },
    bharati: {
      status: "nominal",
      healthPct: 93,
      failureProbPct: 2,
      rulHours: 9999,
      telemetry: [
        { label: "Internal Temp", value: "21", unit: "°C" },
        { label: "Humidity", value: "42", unit: "%" },
        { label: "CO₂", value: "408", unit: "ppm" },
        { label: "Pressure", value: "1008", unit: "hPa" },
        { label: "Occupancy", value: "28", unit: "personnel" },
      ],
      dependencies: [],
    },
  },

  /* ── LAB MODULE ── */
  {
    id: "bld-lab",
    name: "Science Laboratory",
    shortId: "LAB-01",
    type: "Laboratory Module",
    category: "science",
    layer: "infrastructure",
    description: "Atmospheric science, glaciology, and geophysics laboratory.",
    position: [-0.2, 0, -1.5],
    schematicId: "bld-lab",
    maitri: {
      status: "nominal",
      healthPct: 91,
      failureProbPct: 3,
      rulHours: 9999,
      telemetry: [
        { label: "Internal Temp", value: "19", unit: "°C" },
        { label: "Instruments", value: "12", unit: "active" },
        { label: "Power Draw", value: "18", unit: "kW" },
        { label: "Data Rate", value: "1.2", unit: "GB/day" },
      ],
      dependencies: ["gen-01", "battery-sys"],
    },
    bharati: {
      status: "nominal",
      healthPct: 95,
      failureProbPct: 2,
      rulHours: 9999,
      telemetry: [
        { label: "Internal Temp", value: "20", unit: "°C" },
        { label: "Instruments", value: "18", unit: "active" },
        { label: "Power Draw", value: "24", unit: "kW" },
        { label: "Data Rate", value: "2.1", unit: "GB/day" },
      ],
      dependencies: ["gen-01", "battery-sys"],
    },
  },

  /* ── SOLAR ARRAY ── */
  {
    id: "solar-array",
    name: "Bifacial Solar Array",
    shortId: "PV-01",
    type: "Photovoltaic System",
    category: "power",
    layer: "energy",
    description: "High-albedo bifacial solar PV panels capturing direct and snow-reflected solar radiation.",
    position: [-4.5, 0, -0.5],
    schematicId: "solar-array",
    maitri: {
      status: "nominal",
      healthPct: 92,
      failureProbPct: 5,
      rulHours: 7200,
      telemetry: [
        { label: "Generation", value: "38.4", unit: "kW" },
        { label: "Irradiance", value: "410", unit: "W/m²" },
        { label: "Panel Temp", value: "-8.2", unit: "°C" },
        { label: "Inverter Eff.", value: "97.4", unit: "%" },
        { label: "Albedo Gain", value: "+22", unit: "%" },
      ],
      dependencies: ["battery-sys"],
    },
    bharati: {
      status: "nominal",
      healthPct: 96,
      failureProbPct: 3,
      rulHours: 8500,
      telemetry: [
        { label: "Generation", value: "45.2", unit: "kW" },
        { label: "Irradiance", value: "445", unit: "W/m²" },
        { label: "Panel Temp", value: "-6.1", unit: "°C" },
        { label: "Inverter Eff.", value: "98.1", unit: "%" },
        { label: "Albedo Gain", value: "+25", unit: "%" },
      ],
      dependencies: ["battery-sys"],
    },
  },

  /* ── WEATHER & ENVIRONMENTAL SENSORS ── */
  {
    id: "met-mast",
    name: "Automated Weather Station (IMD AWS)",
    shortId: "AWS-01",
    type: "Meteorological Mast",
    category: "science",
    layer: "environment",
    description: "IMD-certified polar automatic weather station with ultrasonic sonic anemometers, barometers, and solar flux radiometers.",
    position: [-4.0, 0, -3.0],
    schematicId: "met-mast",
    maitri: {
      status: "nominal",
      healthPct: 98,
      failureProbPct: 2,
      rulHours: 9999,
      telemetry: [
        { label: "Ambient Temp", value: "-14.2", unit: "°C" },
        { label: "Wind Velocity", value: "11.4", unit: "m/s" },
        { label: "Wind Gust", value: "18.2", unit: "m/s" },
        { label: "Baro Pressure", value: "984", unit: "hPa" },
        { label: "Relative Humidity", value: "62", unit: "%" },
      ],
      dependencies: ["antenna-01"],
    },
    bharati: {
      status: "nominal",
      healthPct: 99,
      failureProbPct: 1,
      rulHours: 9999,
      telemetry: [
        { label: "Ambient Temp", value: "-8.6", unit: "°C" },
        { label: "Wind Velocity", value: "8.7", unit: "m/s" },
        { label: "Wind Gust", value: "14.1", unit: "m/s" },
        { label: "Baro Pressure", value: "992", unit: "hPa" },
        { label: "Relative Humidity", value: "71", unit: "%" },
      ],
      dependencies: ["antenna-01"],
    },
  },

  /* ── COLD STORAGE FACILITY ── */
  {
    id: "bld-storage",
    name: "Central Logistics & Storage Facility",
    shortId: "STR-01",
    type: "Cold Storage Warehouse",
    category: "logistics",
    layer: "logistics",
    description: "Heavy logistics depot housing polar expedition spare parts, mechanical equipment, and dry reserve supplies.",
    position: [-2.5, 0, 0.2],
    schematicId: "bld-storage",
    maitri: {
      status: "nominal",
      healthPct: 89,
      failureProbPct: 4,
      rulHours: 9999,
      telemetry: [
        { label: "Inventory Level", value: "76", unit: "%" },
        { label: "Internal Temp", value: "-2.0", unit: "°C" },
        { label: "Critical Spares", value: "94", unit: "%" },
        { label: "Security Status", value: "SEALED", unit: "" },
      ],
      dependencies: ["bld-main"],
    },
    bharati: {
      status: "nominal",
      healthPct: 94,
      failureProbPct: 2,
      rulHours: 9999,
      telemetry: [
        { label: "Inventory Level", value: "84", unit: "%" },
        { label: "Internal Temp", value: "-1.5", unit: "°C" },
        { label: "Critical Spares", value: "98", unit: "%" },
        { label: "Security Status", value: "SEALED", unit: "" },
      ],
      dependencies: ["bld-main"],
    },
  },
];

/** Map from schematicId → asset for fast lookup */
export const ASSET_BY_SCHEMATIC_ID: Record<string, TwinAsset> = {};
for (const asset of TWIN_ASSET_REGISTRY) {
  if (!ASSET_BY_SCHEMATIC_ID[asset.schematicId]) {
    ASSET_BY_SCHEMATIC_ID[asset.schematicId] = asset;
  }
}

/** Get station-specific data for an asset */
export function getStationData(
  asset: TwinAsset,
  stationId: "maitri" | "bharati"
) {
  return stationId === "maitri" ? asset.maitri : asset.bharati;
}

/** Convert TwinAssetStatus → AssetStatus used by schematic */
export function toSchematicStatus(
  status: TwinAssetStatus
): "healthy" | "warning" | "critical" {
  switch (status) {
    case "nominal":
      return "healthy";
    case "warning":
      return "warning";
    case "degraded":
      return "warning";
    case "critical":
      return "critical";
  }
}

export const TWIN_LAYERS: { id: TwinLayerId; label: string; description: string }[] = [
  { id: "energy", label: "Energy", description: "Power generation and storage" },
  { id: "infrastructure", label: "Infrastructure", description: "Buildings and HVAC" },
  { id: "environment", label: "Environment", description: "Weather and sensors" },
  { id: "logistics", label: "Logistics", description: "Fuel, food, and supplies" },
  { id: "communication", label: "Communication", description: "Satellite and comms" },
  { id: "assetHealth", label: "Asset Health", description: "Equipment health overlay" },
  { id: "alerts", label: "Alerts", description: "Active alert indicators" },
  { id: "dataFlow", label: "Data Flow", description: "System data connections" },
];
