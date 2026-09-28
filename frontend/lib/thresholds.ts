/**
 * Threshold constants for resource autonomy.
 * These mirror the backend forecast constants in
 * backend/app/api/stations.py::compute_forecast() — keep in sync.
 */

export const WARNING_DAYS = 15;
export const CRITICAL_DAYS = 7;

export type ResourceStatus = "nominal" | "warning" | "critical";

/**
 * Classify a days-remaining number into nominal / warning / critical.
 * Matches the server-side logic in build_resource_forecast().
 */
export function daysStatus(days: number | null): ResourceStatus {
  if (days === null) return "nominal";
  if (days <= CRITICAL_DAYS) return "critical";
  if (days <= WARNING_DAYS) return "warning";
  return "nominal";
}
