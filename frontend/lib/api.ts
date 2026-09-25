import {
  StationCurrent,
  Anomaly,
  WhatIfResult,
  LinkStatus,
  AssetNode,
  AssetDetail,
  ScenarioTrigger,
} from "./types";
import {
  MOCK_CURRENT_MAITRI,
  MOCK_CURRENT_BHARATI,
  MOCK_ANOMALIES_MAITRI,
  MOCK_ANOMALIES_BHARATI,
  ASSET_TREE_DATA,
  MOCK_ASSET_DETAILS,
  MOCK_WHATIF_RESULTS,
  MOCK_LINK_INITIAL,
} from "./mockData";

// API Boundary for the Antarctic Twin Console
// Currently powered by deterministic mock datasets matching the API contract
// When backend endpoints are ready, this file will switch to fetch() calls with zero component disruption.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function getStationCurrent(stationId: string): Promise<StationCurrent> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/stations/${stationId}/current`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to deterministic mock data
    }
  }

  // Deterministic mock return
  return stationId === "bharati" ? MOCK_CURRENT_BHARATI : MOCK_CURRENT_MAITRI;
}

export async function getStationAnomalies(stationId: string): Promise<Anomaly[]> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/stations/${stationId}/anomalies`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to deterministic mock data
    }
  }

  return stationId === "bharati" ? [...MOCK_ANOMALIES_BHARATI] : [...MOCK_ANOMALIES_MAITRI];
}

export async function simulateWhatIf(
  stationId: string,
  trigger: ScenarioTrigger
): Promise<WhatIfResult> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/stations/${stationId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to deterministic mock data
    }
  }

  // Quick 600ms delay to reflect computation during demo
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_WHATIF_RESULTS[trigger] || MOCK_WHATIF_RESULTS.generator_failure;
}

export async function getLinkStatus(): Promise<LinkStatus> {
  return MOCK_LINK_INITIAL;
}

export async function getAssetTree(): Promise<AssetNode[]> {
  return ASSET_TREE_DATA;
}

export async function getAssetDetail(assetId: string): Promise<AssetDetail | null> {
  return MOCK_ASSET_DETAILS[assetId] || null;
}
