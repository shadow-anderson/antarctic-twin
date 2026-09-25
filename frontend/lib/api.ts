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

/*
 * ============================================================
 * API CONFIGURATION
 * ============================================================
 *
 * NEXT_PUBLIC_USE_MOCK=true
 *      → Use deterministic mock data
 *
 * NEXT_PUBLIC_USE_MOCK=false
 *      → Use the real backend API
 *
 * This allows us to switch from mock → real backend without
 * changing the components.
 */

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";


/*
 * ============================================================
 * HELPER
 * ============================================================
 */

function getApiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}


/*
 * ============================================================
 * STATION CURRENT DATA
 * ============================================================
 */

export async function getStationCurrent(
  stationId: string
): Promise<StationCurrent> {

  // -------------------------
  // MOCK MODE
  // -------------------------
  if (USE_MOCK) {
    return stationId === "bharati"
      ? MOCK_CURRENT_BHARATI
      : MOCK_CURRENT_MAITRI;
  }

  // -------------------------
  // REAL API MODE
  // -------------------------
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  try {
    const res = await fetch(
      getApiUrl(`/stations/${stationId}/current`),
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch station data (${res.status})`
      );
    }

    return await res.json();

  } catch (error) {
    console.error("getStationCurrent failed:", error);

    throw error;
  }
}


/*
 * ============================================================
 * STATION ANOMALIES
 * ============================================================
 */

export async function getStationAnomalies(
  stationId: string
): Promise<Anomaly[]> {

  // -------------------------
  // MOCK MODE
  // -------------------------
  if (USE_MOCK) {
    return stationId === "bharati"
      ? [...MOCK_ANOMALIES_BHARATI]
      : [...MOCK_ANOMALIES_MAITRI];
  }

  // -------------------------
  // REAL API MODE
  // -------------------------
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  try {
    const res = await fetch(
      getApiUrl(`/stations/${stationId}/anomalies`),
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch station anomalies (${res.status})`
      );
    }

    return await res.json();

  } catch (error) {
    console.error("getStationAnomalies failed:", error);

    throw error;
  }
}


/*
 * ============================================================
 * WHAT-IF SIMULATION
 * ============================================================
 */

export async function simulateWhatIf(
  stationId: string,
  trigger: ScenarioTrigger
): Promise<WhatIfResult> {

  // -------------------------
  // MOCK MODE
  // -------------------------
  if (USE_MOCK) {

    // Keep the demo simulation delay.
    await new Promise((resolve) =>
      setTimeout(resolve, 600)
    );

    return (
      MOCK_WHATIF_RESULTS[trigger] ||
      MOCK_WHATIF_RESULTS.generator_failure
    );
  }

  // -------------------------
  // REAL API MODE
  // -------------------------
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  try {
    const res = await fetch(
      getApiUrl(`/stations/${stationId}/simulate`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trigger,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        `What-if simulation failed (${res.status})`
      );
    }

    return await res.json();

  } catch (error) {
    console.error("simulateWhatIf failed:", error);

    throw error;
  }
}


/*
 * ============================================================
 * LINK STATUS
 * ============================================================
 *
 * There is currently no real endpoint defined for this.
 * Therefore this remains mock data until the backend contract
 * provides a link-status endpoint.
 */

export async function getLinkStatus(): Promise<LinkStatus> {
  return MOCK_LINK_INITIAL;
}


/*
 * ============================================================
 * ASSET TREE
 * ============================================================
 *
 * Currently mock-only because no real asset endpoint has
 * been defined yet.
 */

export async function getAssetTree(): Promise<AssetNode[]> {
  return ASSET_TREE_DATA;
}


/*
 * ============================================================
 * ASSET DETAIL
 * ============================================================
 *
 * Currently mock-only because no real asset-detail endpoint
 * has been defined yet.
 */

export async function getAssetDetail(
  assetId: string
): Promise<AssetDetail | null> {
  return MOCK_ASSET_DETAILS[assetId] || null;
}