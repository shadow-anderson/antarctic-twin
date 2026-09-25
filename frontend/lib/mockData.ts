import {
  ScenarioDefinition,
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
