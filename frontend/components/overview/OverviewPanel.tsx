"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useStation } from "@/context/StationContext";
import { useLink } from "@/context/LinkContext";
import { StationCurrent, Anomaly } from "@/lib/types";
import {
  getStationCurrent,
  getStationAnomalies,
} from "@/lib/api";
import { STATION_METADATA } from "@/lib/mockData";

import { AnomalyBanner } from "../shared/AnomalyBanner";
import { AntarcticaMap, STATIONS } from "../shared/AntarcticaMap";
import { SolarBadge } from "../shared/SolarBadge";
import { WeatherSection } from "./WeatherSection";
import { EnergySection } from "./EnergySection";
import { LogisticsSection } from "./LogisticsSection";

import {
  MapPin,
  Users,
  WifiOff,
  CheckCircle2,
  Building2,
  Mountain,
  Radio,
  CalendarDays,
  ArrowUpRight,
  Satellite,
} from "lucide-react";

export const OverviewPanel: React.FC = () => {
  const { selectedStation } = useStation();
  const { connected, isRestoring } = useLink();

  // =========================================================
  // TELEMETRY STATE
  // =========================================================

  const [currentData, setCurrentData] =
    useState<StationCurrent | null>(null);

  const [anomalies, setAnomalies] =
    useState<Anomaly[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const [usingCachedData, setUsingCachedData] =
    useState<boolean>(false);

  /*
   * Stores the last successfully loaded telemetry.
   *
   * If the real backend fails later, we can continue showing
   * the last successful station state instead of blanking
   * the entire dashboard.
   */
  const previousDataRef = useRef<{
    current: StationCurrent | null;
    anomalies: Anomaly[];
  }>({
    current: null,
    anomalies: [],
  });

  // =========================================================
  // STATION INFORMATION
  // =========================================================

  const stationDescriptions = {
    maitri: {
      short:
        "India's second Antarctic research station on the Schirmacher Oasis, supporting year-round scientific research and serving as a gateway to the mountains of central Dronning Maud Land.",

      full: `In 1988, an ice-free rocky area on the Schirmacher Oasis was selected to build India's second research station, Maitri. The station was erected on steel stilts and has since stood the test of time. Maitri also serves as a gateway to one of the largest mountain chains in central Dronning Maud Land, located south of Schirmacher.
It is an inland station about 100 km from the shore, at an elevation of approximately 50 metres above sea level. The station can support 25 personnel in the main building during both summer and winter, with an additional summer capacity of around 40 people through containerized living modules.
The station consists of a main building, fuel farm, fuel station, lake water pump house, summer camp and several smaller containerized modules. The main building provides regulated power supply, automated heating, hot and cold running water, incinerator toilets, cold storage, PA system, living and dining areas, lounge facilities and containerized laboratory space.
Communication is provided through dedicated satellite channels, enabling voice, video and data connectivity with mainland India.`,

      image: "/images/stations/Maitri.jpg",

      location: "Schirmacher Oasis",
      establishedLabel: "Established",
      established: "1988",
      capacity: "25 personnel",
      extraCapacity: "≈40 summer",
      elevation: "≈50 m",
      connectivity: "Dedicated satellite",
    },

    bharati: {
      short:
        "A modern Indian Antarctic research station between Thala Fjord and Quilty Bay, designed to support year-round scientific research under the Indian Antarctic Programme.",

      full: `About 3,000 km east of Maitri, the Indian research base Bharati is located between Thala Fjord and Quilty Bay, east of Stornes Peninsula in Antarctica. It lies at approximately 69° 24.41' S, 76° 11.72' E and about 35 metres above sea level.
The station, with a very small footprint, was commissioned on 18 March 2012 to facilitate year-round scientific research activities under the Indian Antarctic Programme.
Bharati can support 47 personnel on a twin-sharing basis in the main building during both summer and winter. An additional 25 personnel can be accommodated in emergency shelters and summer camps during summer, giving the station a total capacity of up to 72 people.
The station consists of a main building, fuel farm, fuel station, sea water pump house, summer camp and several smaller containerized modules. The main building provides regulated power supply, automated heating and air conditioning, hot and cold running water, flush toilets, sauna, cold storage, PA system, living and dining areas, lounge facilities and laboratory space.
Communication is provided through dedicated satellite channels, enabling voice, video and data connectivity with mainland India.`,

      image: "/images/stations/Bharati.jpg",

      location: "Stornes Peninsula",
      establishedLabel: "Commissioned",
      established: "2012",
      capacity: "72 personnel",
      extraCapacity: "47 main building",
      elevation: "≈35 m",
      connectivity: "Dedicated satellite",
    },
  };

  // =========================================================
  // HERO CONSTANTS
  // Photo credit: confirm the actual source of these images
  // and update the constant below if it is wrong.
  // =========================================================

  const PHOTO_CREDIT = "Image: Indian Antarctic Programme (NCPOR)";

  /**
   * objectPosition lets you tune the crop focus per station.
   * Drop a replacement image at the same path and only change
   * this constant — no other code change required.
   */
  const heroObjectPosition: Record<string, string> = {
    maitri:  "center 45%",
    bharati: "center 40%",
  };

  const [heroImgLoaded, setHeroImgLoaded] = useState(false);

  // Reset fade whenever the station changes so the new image fades in too.
  useEffect(() => {
    setHeroImgLoaded(false);
  }, [selectedStation]);

  const stationInfo =
    stationDescriptions[selectedStation];

  // =========================================================
  // LOAD TELEMETRY
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const loadStationData = async () => {
      setLoading(true);
      setError(null);
      setUsingCachedData(false);

      try {
        const [current, anoms] = await Promise.all([
          getStationCurrent(selectedStation),
          getStationAnomalies(selectedStation),
        ]);

        if (!isMounted) return;

        // Store fresh data
        setCurrentData(current);
        setAnomalies(anoms);

        // Save successful response as cached data
        previousDataRef.current = {
          current,
          anomalies: anoms,
        };

        setError(null);
        setUsingCachedData(false);
      } catch (err) {
        console.error(
          "Failed to load station telemetry:",
          err
        );

        if (!isMounted) return;

        const cachedCurrent =
          previousDataRef.current.current;

        const cachedAnomalies =
          previousDataRef.current.anomalies;

        /*
         * If we have previously received valid telemetry,
         * continue displaying it.
         */
        if (cachedCurrent) {
          setCurrentData(cachedCurrent);
          setAnomalies(cachedAnomalies);
          setUsingCachedData(true);
        }

        setError(
          "Live telemetry unavailable. Showing the last available station state."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStationData();

    return () => {
      isMounted = false;
    };
  }, [selectedStation]);

  // =========================================================
  // STATION METADATA
  // =========================================================

  const meta =
    STATION_METADATA[selectedStation] ||
    STATION_METADATA.maitri;

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading || !currentData) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-ops-text-2">

          <div className="relative">
            <div className="w-10 h-10 border-2 border-white/10 rounded-full" />

            <div className="absolute inset-0 w-10 h-10 border-2 border-ops-teal border-t-transparent rounded-full animate-spin" />
          </div>

          <div className="text-center">
            <p className="font-semibold text-ops-text">
              Connecting to Digital Twin
            </p>

            <p className="text-xs text-ops-text-3 mt-1">
              Synchronizing {meta.name} telemetry...
            </p>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // NO DATA AVAILABLE
  // =========================================================

  if (!loading && !currentData) {
    return (
      <div className="min-h-[420px] flex items-center justify-center p-6">

        <div className="max-w-md w-full rounded-3xl border border-ops-red/30 bg-ops-card p-8 text-center shadow-lg ring-1 ring-white/10">

          <div className="mx-auto w-12 h-12 rounded-2xl bg-ops-red/20 flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-ops-red" />
          </div>

          <h2 className="text-lg font-bold text-white mt-4">
            Telemetry Unavailable
          </h2>

          <p className="text-sm text-ops-text-2 mt-2 leading-6">
            Unable to retrieve station telemetry at the moment.
            Please verify the communication link and try again.
          </p>

          <div className="mt-5 px-3 py-2 rounded-xl bg-ops-red/20 border border-ops-red/40 text-[10px] font-bold uppercase tracking-wider text-ops-red">
            No Cached Data Available
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-7">

      {/* =====================================================
          TELEMETRY ERROR / CACHED DATA
      ===================================================== */}

      {error && usingCachedData && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-ops-amber/15 via-ops-panel to-ops-panel border border-ops-amber/30 shadow-md ring-1 ring-white/5">

          <div className="flex items-center gap-3">

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-amber/20">
              <WifiOff className="w-5 h-5 text-ops-amber" />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <span className="text-xs font-bold uppercase tracking-wider text-ops-amber">
                  Live Telemetry Unavailable
                </span>

                <span className="hidden sm:inline text-ops-amber/50">
                  •
                </span>

                <span className="text-xs text-ops-text-2">
                  Cached Station State
                </span>

              </div>

              <p className="text-xs text-ops-text-3 mt-1">
                {error}
              </p>

            </div>
          </div>

          <span className="self-start md:self-auto px-3 py-1.5 rounded-lg bg-ops-amber/20 border border-ops-amber/40 text-[10px] font-bold uppercase tracking-wide text-ops-amber">
            Cached Telemetry
          </span>

        </div>
      )}

      {/* =====================================================
          DEGRADED COMMUNICATION
      ===================================================== */}

      {!connected && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-ops-amber/15 via-ops-panel to-ops-panel border border-ops-amber/30 shadow-md ring-1 ring-white/5">

          <div className="flex items-center gap-3">

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-amber/20">
              <WifiOff className="w-5 h-5 text-ops-amber" />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <span className="text-xs font-bold uppercase tracking-wider text-ops-amber">
                  Communication Link Degraded
                </span>

                <span className="hidden sm:inline text-ops-amber/50">
                  •
                </span>

                <span className="text-xs text-ops-text-2">
                  Polar Backhaul Stalled
                </span>

              </div>

              <p className="text-xs text-ops-text-3 mt-1">
                Displaying the last synchronized station state.
              </p>

            </div>
          </div>

          <span className="self-start md:self-auto px-3 py-1.5 rounded-lg bg-ops-amber/20 border border-ops-amber/40 text-[10px] font-bold uppercase tracking-wide text-ops-amber">
            Cached Telemetry
          </span>

        </div>
      )}

      {/* =====================================================
          RESTORATION NOTICE
      ===================================================== */}

      {isRestoring && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-ops-green/15 via-ops-panel to-ops-panel border border-ops-green/30 shadow-md ring-1 ring-white/5">

          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-green/20">
            <CheckCircle2 className="w-5 h-5 text-ops-green" />
          </div>

          <div>

            <span className="text-xs font-bold uppercase tracking-wider text-ops-green">
              Link Restored
            </span>

            <p className="text-xs text-ops-text-2 mt-1">
              Synchronizing station telemetry state with polar ground station...
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          STATION HERO — full-bleed background image
      ===================================================== */}

      <section
        className="relative overflow-hidden rounded-[28px] bg-[#233B48] shadow-[0_12px_35px_rgba(34,57,70,0.14)] min-h-[440px] lg:min-h-[480px]"
      >

        {/* ── LAYER 0: background image (absolute, fills section) ─────── */}

        <div className="absolute inset-0">
          <Image
            key={stationInfo.image}
            src={stationInfo.image}
            alt={`${meta.name} Research Station`}
            fill
            priority
            sizes="100vw"
            quality={85}
            className={[
              "object-cover motion-reduce:transition-none",
              "transition-opacity  duration-700",
              "transition-transform duration-[1200ms] ease-out",
              heroImgLoaded
                ? "opacity-100 scale-100"
                : "opacity-0 scale-[1.03]",
            ].join(" ")}
            style={{ objectPosition: heroObjectPosition[selectedStation] ?? "center 45%" }}
            onLoad={() => setHeroImgLoaded(true)}
          />
        </div>

        {/* ── LAYER 1: horizontal gradient (left dark → right lighter) ── */}
        {/*   Left edge: #0E2230 @ 95% → right: #0E2230 @ 40%            */}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(14,34,48,0.95) 0%, rgba(14,34,48,0.70) 45%, rgba(14,34,48,0.40) 100%)",
          }}
        />

        {/* ── LAYER 2: vertical gradient (bottom dark → top lighter) ──── */}
        {/*   Bottom: #0A1A26 @ 90% → top: #0A1A26 @ 35%                  */}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,26,38,0.90) 0%, rgba(10,26,38,0.55) 35%, rgba(10,26,38,0.35) 100%)",
          }}
        />

        {/* ── LAYER 3: vignette (radial, corners only) ─────────────────── */}

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 45%, rgba(6,16,24,0.55) 100%)",
          }}
        />

        {/* ── LAYER 4: content (z-10) ────────────────────────────────── */}

        <div className="relative z-10 flex flex-col justify-between min-h-[440px] lg:min-h-[480px] p-6 sm:p-8 lg:p-10">

          {/* Top row: "Indian Antarctic Programme" chip */}

          <div className="flex items-start justify-between">

            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7F4EA]/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.14em] text-[#536B73] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B98232]" />
              Indian Antarctic Programme
            </span>

          </div>

          {/* ── Main content column (max-w-2xl keeps text readable) ──── */}

          <div className="max-w-2xl">

            {/* Station ID pill row */}

            <div className="flex flex-wrap items-center gap-2 mb-4">

              <span className="px-3 py-1 rounded-lg bg-[#DDEEEF]/15 border border-[#DDEEEF]/20 text-[10px] font-bold tracking-[0.12em] uppercase text-[#CDE2E4]">
                Station ID: {meta.id}
              </span>

              <span className="px-3 py-1 rounded-lg bg-[#DCEBDD]/15 border border-[#DCEBDD]/20 text-[10px] font-semibold text-[#B9D6C9]">
                ● Operational
              </span>

              <SolarBadge
                lat={STATIONS.find((s) => s.id === selectedStation)?.lat ?? -70.76}
                lon={STATIONS.find((s) => s.id === selectedStation)?.lon ?? 11.73}
              />

            </div>

            {/* Title */}

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {meta.name}
              <span className="block text-[#9FC7C9] mt-1">
                Research Station
              </span>
            </h1>

            {/* Coordinates */}

            <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-[#C5D6D9]">
              <MapPin className="w-4 h-4 text-[#8EC0C2]" />
              <span>{meta.coordinates}</span>
              <span className="text-[#718D96]">•</span>
              <span>{meta.region}</span>
            </div>

            {/* Description — white/90 gives ≥ 4.5:1 against the overlay */}

            <p className="mt-5 text-sm leading-6 text-white/90">
              {stationInfo.short}
            </p>

            {/* =================================================
                STATION STATS (2 cols mobile / 4 cols sm+)
            ================================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-7">

              {/* Capacity */}

              <div className="rounded-2xl bg-white/[0.07] border border-white/[0.10] p-3.5">

                <div className="flex items-center gap-2 text-[#8DBFC0]">
                  <Users className="w-4 h-4" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">
                    Capacity
                  </span>
                </div>

                <p className="text-sm font-bold text-white mt-2">
                  {stationInfo.capacity}
                </p>

              </div>

              {/* Elevation */}

              <div className="rounded-2xl bg-white/[0.07] border border-white/[0.10] p-3.5">

                <div className="flex items-center gap-2 text-[#D2B477]">
                  <Mountain className="w-4 h-4" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">
                    Elevation
                  </span>
                </div>

                <p className="text-sm font-bold text-white mt-2">
                  {stationInfo.elevation}
                </p>

              </div>

              {/* Established */}

              <div className="rounded-2xl bg-white/[0.07] border border-white/[0.10] p-3.5">

                <div className="flex items-center gap-2 text-[#A9C6D0]">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">
                    {stationInfo.establishedLabel}
                  </span>
                </div>

                <p className="text-sm font-bold text-white mt-2">
                  {stationInfo.established}
                </p>

              </div>

              {/* Satellite link */}

              <div className="rounded-2xl bg-white/[0.07] border border-white/[0.10] p-3.5">

                <div className="flex items-center gap-2 text-[#B8D4C8]">
                  <Satellite className="w-4 h-4" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">
                    Link
                  </span>
                </div>

                <p className="text-[11px] font-bold text-white mt-2">
                  Satellite
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ── Photo credit chip (bottom-right, z-10) ─────────────────── */}

        <div className="absolute bottom-4 right-5 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[9px] font-medium text-white/60 tracking-wide">
            {PHOTO_CREDIT}
          </span>
        </div>

      </section>


      {/* =====================================================
          ANTARCTIC STATION MAP
      ===================================================== */}

      <AntarcticaMap />

      {/* =====================================================
          STATION PROFILE
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-ops-panel shadow-[0_5px_22px_rgba(0,0,0,0.3)] ring-1 ring-white/5">

        {/* Colored top line */}

        <div className="h-1.5 bg-gradient-to-r from-ops-teal via-ops-ice to-ops-amber" />

        <div className="p-6 lg:p-8">

          {/* Heading */}

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-ops-card border border-white/10 text-ops-teal shadow-inner">
                <Building2 className="w-5 h-5" />
              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-ops-text-3">
                  Station Profile
                </p>

                <h2 className="text-xl font-bold text-ops-text mt-0.5">
                  Life & Operations at {meta.name}
                </h2>

              </div>

            </div>

            <div className="flex items-center gap-2 text-xs text-ops-text-2">

              <Radio className="w-3.5 h-3.5 text-ops-teal" />

              <span>
                {stationInfo.connectivity}
              </span>

            </div>

          </div>

          {/* Highlight cards */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">

            {/* Location */}

            <div className="group p-4 rounded-2xl bg-ops-card/80 border border-white/10 hover:bg-ops-card hover:border-white/20 ring-1 ring-white/5 transition-all">

              <div className="flex items-center justify-between">

                <div className="w-9 h-9 rounded-xl bg-ops-teal/15 border border-ops-teal/30 flex items-center justify-center">

                  <Mountain className="w-4 h-4 text-ops-teal" />

                </div>

                <ArrowUpRight className="w-3.5 h-3.5 text-ops-text-3 group-hover:text-ops-text-2 transition-colors" />

              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-ops-text-3 mt-4">
                Location
              </p>

              <p className="text-sm font-bold text-ops-text mt-1">
                {stationInfo.location}
              </p>

            </div>

            {/* Established */}

            <div className="group p-4 rounded-2xl bg-ops-card/80 border border-white/10 hover:bg-ops-card hover:border-white/20 ring-1 ring-white/5 transition-all">

              <div className="flex items-center justify-between">

                <div className="w-9 h-9 rounded-xl bg-ops-violet/15 border border-ops-violet/30 flex items-center justify-center">

                  <CalendarDays className="w-4 h-4 text-ops-violet" />

                </div>

                <ArrowUpRight className="w-3.5 h-3.5 text-ops-text-3 group-hover:text-ops-text-2 transition-colors" />

              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-ops-text-3 mt-4">
                {stationInfo.establishedLabel}
              </p>

              <p className="text-sm font-bold text-ops-text mt-1">
                {stationInfo.established}
              </p>

            </div>

            {/* Capacity */}

            <div className="group p-4 rounded-2xl bg-ops-card/80 border border-white/10 hover:bg-ops-card hover:border-white/20 ring-1 ring-white/5 transition-all">

              <div className="flex items-center justify-between">

                <div className="w-9 h-9 rounded-xl bg-ops-amber/15 border border-ops-amber/30 flex items-center justify-center">

                  <Users className="w-4 h-4 text-ops-amber" />

                </div>

                <ArrowUpRight className="w-3.5 h-3.5 text-ops-text-3 group-hover:text-ops-text-2 transition-colors" />

              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-ops-text-3 mt-4">
                Total Capacity
              </p>

              <p className="text-sm font-bold text-ops-text mt-1">
                {stationInfo.capacity}
              </p>

            </div>

            {/* Connectivity */}

            <div className="group p-4 rounded-2xl bg-ops-card/80 border border-white/10 hover:bg-ops-card hover:border-white/20 ring-1 ring-white/5 transition-all">

              <div className="flex items-center justify-between">

                <div className="w-9 h-9 rounded-xl bg-ops-green/15 border border-ops-green/30 flex items-center justify-center">

                  <Satellite className="w-4 h-4 text-ops-green" />

                </div>

                <ArrowUpRight className="w-3.5 h-3.5 text-ops-text-3 group-hover:text-ops-text-2 transition-colors" />

              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-ops-text-3 mt-4">
                Connectivity
              </p>

              <p className="text-sm font-bold text-ops-text mt-1">
                Satellite
              </p>

            </div>

          </div>

          {/* Description */}

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">

            <div className="hidden lg:block w-1 rounded-full bg-gradient-to-b from-ops-teal via-ops-ice to-ops-amber" />

            <div>

              <p className="text-sm leading-7 text-ops-text-2 whitespace-pre-line">
                {stationInfo.full}
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          ANOMALIES
      ===================================================== */}

      <AnomalyBanner
        anomalies={anomalies}
        stationName={meta.name}
        timestamp="14:32 UTC"
      />

      {/* =====================================================
          OPERATIONAL TELEMETRY
      ===================================================== */}

      <div className="space-y-7">

        <WeatherSection
          weather={currentData.weather}
        />

        <div className="space-y-7 w-full">

          {/* ENERGY — FULL WIDTH */}

          <div className="w-full">
            <EnergySection
              energy={currentData.energy}
            />
          </div>

          {/* LOGISTICS — FULL WIDTH BELOW ENERGY */}

          <div className="w-full">
            <LogisticsSection
              logistics={currentData.logistics}
            />
          </div>

        </div>

      </div>

    </div>
  );
};