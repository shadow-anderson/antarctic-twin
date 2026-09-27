import {
  StationCurrent,
  Anomaly,
  WhatIfResult,
  LinkStatus,
  AssetNode,
  AssetDetail,
  ScenarioTrigger,
} from "./types";

/*
 * ============================================================
 * API CONFIGURATION
 * ============================================================
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function getApiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}


/*
 * ============================================================
 * STATION CURRENT DATA
 * GET /stations/{stationId}/current
 * ============================================================
 */

export async function getStationCurrent(
  stationId: string
): Promise<StationCurrent> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const res = await fetch(
    getApiUrl(`/stations/${stationId}/current`),
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch station data (${res.status})`);
  }

  return res.json();
}


/*
 * ============================================================
 * STATION ANOMALIES
 * GET /stations/{stationId}/anomalies
 * ============================================================
 */

export async function getStationAnomalies(
  stationId: string
): Promise<Anomaly[]> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const res = await fetch(
    getApiUrl(`/stations/${stationId}/anomalies`),
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch station anomalies (${res.status})`);
  }

  return res.json();
}


/*
 * ============================================================
 * WHAT-IF SIMULATION
 * POST /stations/{stationId}/simulate
 * ============================================================
 */

export async function simulateWhatIf(
  stationId: string,
  trigger: ScenarioTrigger
): Promise<WhatIfResult> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const res = await fetch(
    getApiUrl(`/stations/${stationId}/simulate`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger }),
    }
  );

  if (!res.ok) {
    throw new Error(`What-if simulation failed (${res.status})`);
  }

  return res.json();
}


/*
 * ============================================================
 * LINK STATUS
 * GET /link/status
 * ============================================================
 */

export async function getLinkStatus(): Promise<LinkStatus> {
  if (!API_BASE_URL) {
    return { connected: true, last_synced: "--:-- UTC" };
  }

  try {
    const res = await fetch(getApiUrl("/link/status"), {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch link status (${res.status})`);
    }

    return res.json();
  } catch (error) {
    console.error("getLinkStatus failed:", error);
    return { connected: true, last_synced: "--:-- UTC" };
  }
}


/*
 * ============================================================
 * LINK TOGGLE
 * POST /link/toggle
 * ============================================================
 */

export async function toggleLink(): Promise<LinkStatus> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const res = await fetch(getApiUrl("/link/toggle"), {
    method: "POST",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle link status (${res.status})`);
  }

  return res.json();
}


/*
 * ============================================================
 * UTC MISSION TIME
 * GET /system/time
 * ============================================================
 */

export async function getMissionTime(): Promise<string> {
  if (!API_BASE_URL) {
    const now = new Date();
    return `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")} UTC`;
  }

  try {
    const res = await fetch(getApiUrl("/system/time"), {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return data.utc_time;
    }
  } catch (error) {
    console.error("getMissionTime failed:", error);
  }

  const now = new Date();
  return `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")} UTC`;
}


/*
 * ============================================================
 * ASSET TREE
 * GET /stations/{stationId}/assets
 * ============================================================
 */

export async function getAssetTree(stationId: string): Promise<AssetNode[]> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const res = await fetch(getApiUrl(`/stations/${stationId}/assets`), {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch asset tree (${res.status})`);
  }

  return res.json();
}


/*
 * ============================================================
 * ASSET DETAIL
 * GET /stations/{stationId}/assets/{assetId}
 * ============================================================
 */

export async function getAssetDetail(
  stationId: string,
  assetId: string
): Promise<AssetDetail | null> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const res = await fetch(getApiUrl(`/stations/${stationId}/assets/${assetId}`), {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch asset detail (${res.status})`);
  }

  return res.json();
}