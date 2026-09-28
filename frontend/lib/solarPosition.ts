/* =========================================================
   NOAA Simplified Solar Position (Meeus-based)
   Pure-math utility — no React, no DOM.
   Reference: NOAA Solar Calculator spreadsheet.
========================================================= */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Compute the solar elevation angle in degrees for a given
 * geographic position and UTC date/time.
 *
 * Returns positive values when the sun is above the horizon,
 * negative when below.
 */
export function computeSolarElevationDeg(
  latDeg: number,
  lonDeg: number,
  dateUtc: Date
): number {
  // 1. Julian Day
  const JD = dateUtc.getTime() / 86_400_000 + 2_440_587.5;

  // 2. Julian Century
  const T = (JD - 2_451_545.0) / 36_525;

  // 3. Geometric Mean Longitude of Sun (deg), normalised to [0,360)
  let L0 = 280.46646 + T * (36000.76983 + T * 0.0003032);
  L0 = ((L0 % 360) + 360) % 360;

  // 4. Geometric Mean Anomaly of Sun (deg)
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);

  // 5. Eccentricity of Earth's orbit
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  // 6. Sun's Equation of Center (deg)
  const M_rad = M * DEG2RAD;
  const C =
    Math.sin(M_rad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * M_rad) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * M_rad) * 0.000289;

  // 7. Sun's True Longitude (deg)
  const trueLong = L0 + C;

  // 8. Sun's Apparent Longitude (deg)
  const omega = 125.04 - 1934.136 * T;
  const omega_rad = omega * DEG2RAD;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega_rad);

  // 9. Mean Obliquity of Ecliptic (deg)
  const epsilon0 =
    23 +
    (26 +
      (21.448 -
        T * (46.815 + T * (0.00059 - T * 0.001813))) /
        60) /
    60;

  // 10. Obliquity Correction (deg)
  const epsilon = epsilon0 + 0.00256 * Math.cos(omega_rad);

  // 11. Sun's Declination (deg)
  const epsilon_rad = epsilon * DEG2RAD;
  const lambda_rad = lambda * DEG2RAD;
  const delta_rad = Math.asin(
    Math.sin(epsilon_rad) * Math.sin(lambda_rad)
  );
  const delta = delta_rad * RAD2DEG;

  // 12. Equation of Time (minutes)
  const y = Math.tan(epsilon_rad / 2) ** 2;
  const L0_rad = L0 * DEG2RAD;
  const EoT_rad =
    y * Math.sin(2 * L0_rad) -
    2 * e * Math.sin(M_rad) +
    4 * e * y * Math.sin(M_rad) * Math.cos(2 * L0_rad) -
    0.5 * y * y * Math.sin(4 * L0_rad) -
    1.25 * e * e * Math.sin(2 * M_rad);
  // EoT_rad is in radians; convert to degrees, then ×4 → minutes
  const EoT_minutes = 4 * (EoT_rad * RAD2DEG);

  // 13. True Solar Time (minutes)
  const utcMinutes =
    dateUtc.getUTCHours() * 60 +
    dateUtc.getUTCMinutes() +
    dateUtc.getUTCSeconds() / 60;
  let trueSolarTime = (utcMinutes + EoT_minutes + 4 * lonDeg) % 1440;
  if (trueSolarTime < 0) trueSolarTime += 1440;

  // 14. Hour Angle (deg)
  let HA = trueSolarTime / 4 - 180;
  if (HA < -180) HA += 360;

  // 15. Solar Zenith Angle (deg)
  const latRad = latDeg * DEG2RAD;
  const HA_rad = HA * DEG2RAD;
  let cosZenith =
    Math.sin(latRad) * Math.sin(delta_rad) +
    Math.cos(latRad) * Math.cos(delta_rad) * Math.cos(HA_rad);

  // Clamp for floating-point safety
  cosZenith = Math.max(-1, Math.min(1, cosZenith));
  const zenith = Math.acos(cosZenith) * RAD2DEG;

  // 16. Solar Elevation (deg)
  return 90 - zenith;
}

/* =========================================================
   SOLAR STATE CLASSIFICATION
========================================================= */

export type SolarState = "Polar Day" | "Civil Twilight" | "Polar Night";

export function classifySolarState(elevationDeg: number): SolarState {
  if (elevationDeg >= 0) return "Polar Day";
  if (elevationDeg >= -6) return "Civil Twilight";
  return "Polar Night";
}
