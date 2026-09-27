import {
  ScenarioDefinition,
  ForecastPoint,
  StationForecast,
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

function generateMockProjection(daysRemaining: number, burnRate: number = 1.0): ForecastPoint[] {
  return Array.from({ length: 31 }, (_, day) => ({
    day,
    days_remaining: Math.max(0, Number((daysRemaining - day * burnRate).toFixed(1))),
  }));
}

export const MOCK_FORECASTS: Record<string, StationForecast> = {
  maitri: {
    station_id: "maitri",
    diesel: {
      resource: "diesel",
      current_days_remaining: 42.0,
      burn_rate_multiplier: 1.0,
      status: "nominal",
      daily_projection: generateMockProjection(42.0, 1.0),
      threshold_crossings: [
        { threshold_label: "warning", threshold_days: 15.0, projected_day: 27 },
        { threshold_label: "critical", threshold_days: 7.0, projected_day: null },
      ],
    },
    food: {
      resource: "food",
      current_days_remaining: 68.0,
      burn_rate_multiplier: 1.0,
      status: "nominal",
      daily_projection: generateMockProjection(68.0, 1.0),
      threshold_crossings: [
        { threshold_label: "warning", threshold_days: 15.0, projected_day: null },
        { threshold_label: "critical", threshold_days: 7.0, projected_day: null },
      ],
    },
  },
  bharati: {
    station_id: "bharati",
    diesel: {
      resource: "diesel",
      current_days_remaining: 37.0,
      burn_rate_multiplier: 1.0,
      status: "nominal",
      daily_projection: generateMockProjection(37.0, 1.0),
      threshold_crossings: [
        { threshold_label: "warning", threshold_days: 15.0, projected_day: 22 },
        { threshold_label: "critical", threshold_days: 7.0, projected_day: 30 },
      ],
    },
    food: {
      resource: "food",
      current_days_remaining: 74.0,
      burn_rate_multiplier: 1.0,
      status: "nominal",
      daily_projection: generateMockProjection(74.0, 1.0),
      threshold_crossings: [
        { threshold_label: "warning", threshold_days: 15.0, projected_day: null },
        { threshold_label: "critical", threshold_days: 7.0, projected_day: null },
      ],
    },
  },
};

