"use client";

import React, { useEffect, useState } from "react";
import { useStation } from "@/context/StationContext";
import { useLink } from "@/context/LinkContext";
import { StationCurrent, Anomaly } from "@/lib/types";
import { getStationCurrent, getStationAnomalies } from "@/lib/api";
import { STATION_METADATA } from "@/lib/mockData";
import { AnomalyBanner } from "../shared/AnomalyBanner";
import { WeatherSection } from "./WeatherSection";
import { EnergySection } from "./EnergySection";
import { LogisticsSection } from "./LogisticsSection";

import {
  MapPin,
  Users,
  WifiOff,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Mountain,
  Radio,
  CalendarDays,
  Waves,
  ArrowUpRight,
  Satellite,
} from "lucide-react";

export const OverviewPanel: React.FC = () => {
  const { selectedStation } = useStation();
  const { connected, isRestoring } = useLink();

  const [currentData, setCurrentData] = useState<StationCurrent | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

      image: "/images/stations/maitri.jpg",

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

      image: "/images/stations/bharati.jpg",

      location: "Stornes Peninsula",
      establishedLabel: "Commissioned",
      established: "2012",
      capacity: "72 personnel",
      extraCapacity: "47 main building",
      elevation: "≈35 m",
      connectivity: "Dedicated satellite",
    },
  };

  const stationInfo = stationDescriptions[selectedStation];

  // =========================================================
  // LOAD TELEMETRY
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    Promise.all([
      getStationCurrent(selectedStation),
      getStationAnomalies(selectedStation),
    ]).then(([current, anoms]) => {
      if (isMounted) {
        setCurrentData(current);
        setAnomalies(anoms);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedStation]);

  const meta =
    STATION_METADATA[selectedStation] || STATION_METADATA.maitri;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading || !currentData) {
    return (
      <div className="flex items-center justify-center p-20 text-[#647582]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#287C80] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">
            Connecting to Digital Twin Telemetry Feed...
          </span>
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
          DEGRADED COMMUNICATION
      ===================================================== */}

      {!connected && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#F7EBD6] via-[#FAF2E5] to-[#F4E9D8] border border-[#E5D1AB] shadow-sm">

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EBD6AF]">
              <WifiOff className="w-5 h-5 text-[#9A6B25]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#805C25]">
                  Communication Link Degraded
                </span>

                <span className="hidden sm:inline text-[#B28A50]">
                  •
                </span>

                <span className="text-xs text-[#987849]">
                  Polar Backhaul Stalled
                </span>
              </div>

              <p className="text-xs text-[#987849] mt-1">
                Displaying the last synchronized station state.
              </p>
            </div>
          </div>

          <span className="self-start md:self-auto px-3 py-1.5 rounded-lg bg-[#FBF6EC] border border-[#E1CAA0] text-[10px] font-bold uppercase tracking-wide text-[#956E31]">
            Cached Telemetry
          </span>
        </div>
      )}

      {/* =====================================================
          RESTORATION NOTICE
      ===================================================== */}

      {isRestoring && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#E3F0EA] to-[#EEF5F1] border border-[#C8DED4] shadow-sm">

          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D5E9DF]">
            <CheckCircle2 className="w-5 h-5 text-[#3F8068]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#356E5A]">
              Link Restored
            </span>

            <p className="text-xs text-[#6C857A] mt-1">
              Synchronizing station telemetry state with polar ground station...
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          STATION HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-[#233B48] shadow-[0_12px_35px_rgba(34,57,70,0.14)]">

        {/* Background accent */}
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-[#4D8990]/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-[#B98232]/15 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[48%_52%] min-h-[390px]">

          {/* =================================================
              STATION IMAGE
          ================================================= */}

          <div className="relative min-h-[300px] lg:min-h-[390px] overflow-hidden">

            <img
              src={stationInfo.image}
              alt={`${meta.name} Research Station`}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Image overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#152D39]/10 via-transparent to-[#233B48]/90 lg:to-[#233B48]" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#162D38]/75 via-transparent to-transparent" />

            {/* Image label */}
            <div className="absolute left-5 top-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7F4EA]/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.14em] text-[#536B73] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B98232]" />
                Indian Antarctic Programme
              </span>
            </div>

            {/* Image bottom text */}
            <div className="absolute bottom-5 left-5 right-5 lg:hidden">
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#DDE8E8]">
                Station {meta.id}
              </p>

              <p className="text-xl font-bold text-white mt-1">
                {meta.name}
              </p>
            </div>
          </div>

          {/* =================================================
              STATION DETAILS
          ================================================= */}

          <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-9 text-white">

            <div>

              {/* Station ID */}
              <div className="flex flex-wrap items-center gap-2 mb-4">

                <span className="px-3 py-1 rounded-lg bg-[#DDEEEF]/15 border border-[#DDEEEF]/20 text-[10px] font-bold tracking-[0.12em] uppercase text-[#CDE2E4]">
                  Station ID: {meta.id}
                </span>

                <span className="px-3 py-1 rounded-lg bg-[#DCEBDD]/15 border border-[#DCEBDD]/20 text-[10px] font-semibold text-[#B9D6C9]">
                  ● Operational
                </span>

              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {meta.name}
                <span className="block text-[#9FC7C9] mt-1">
                  Research Station
                </span>
              </h1>

              {/* Location */}
              <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-[#C5D6D9]">

                <MapPin className="w-4 h-4 text-[#8EC0C2]" />

                <span>{meta.coordinates}</span>

                <span className="text-[#718D96]">•</span>

                <span>{meta.region}</span>

              </div>

              {/* Description */}
              <p className="mt-5 max-w-xl text-sm leading-6 text-[#C5D2D5]">
                {stationInfo.short}
              </p>
            </div>

            {/* =================================================
                STATION STATS
            ================================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-7">

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
      </section>

      {/* =====================================================
          STATION PROFILE
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[26px] border border-[#D7E2E3] bg-gradient-to-br from-[#FAFBF9] via-[#F5F8F6] to-[#EDF3F2] shadow-[0_5px_22px_rgba(40,60,70,0.06)]">

        {/* Colored top line */}
        <div className="h-1.5 bg-gradient-to-r from-[#287C80] via-[#477A91] to-[#B98232]" />

        <div className="p-6 lg:p-8">

          {/* Heading */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#DDECEE] text-[#287C80]">
                <Building2 className="w-5 h-5" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#82939A]">
                  Station Profile
                </p>

                <h2 className="text-xl font-bold text-[#314654] mt-0.5">
                  Life & Operations at {meta.name}
                </h2>
              </div>

            </div>

            <div className="flex items-center gap-2 text-xs text-[#71828A]">
              <Radio className="w-3.5 h-3.5 text-[#287C80]" />
              <span>{stationInfo.connectivity}</span>
            </div>

          </div>

          {/* Highlight cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">

            <div className="group p-4 rounded-2xl bg-[#EAF2F2] border border-[#D5E3E4] hover:bg-[#E3EEEE] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#D5E7E8] flex items-center justify-center">
                  <Mountain className="w-4 h-4 text-[#477A91]" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#9BAEB5]" />
              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-[#83939A] mt-4">
                Location
              </p>

              <p className="text-sm font-bold text-[#405762] mt-1">
                {stationInfo.location}
              </p>
            </div>

            <div className="group p-4 rounded-2xl bg-[#F1EDF5] border border-[#E0D9E6] hover:bg-[#ECE7F1] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#E6E0EC] flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-[#756B91]" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#A9A1B5]" />
              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-[#8A8498] mt-4">
                {stationInfo.establishedLabel}
              </p>

              <p className="text-sm font-bold text-[#514B63] mt-1">
                {stationInfo.established}
              </p>
            </div>

            <div className="group p-4 rounded-2xl bg-[#F7F0E3] border border-[#E8DCC5] hover:bg-[#F4EBDD] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#EEE1C9] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#A47735]" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#BDA77E]" />
              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-[#998466] mt-4">
                Total Capacity
              </p>

              <p className="text-sm font-bold text-[#665438] mt-1">
                {stationInfo.capacity}
              </p>
            </div>

            <div className="group p-4 rounded-2xl bg-[#EAF2EC] border border-[#D5E3D9] hover:bg-[#E3EEE7] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#D9E9DF] flex items-center justify-center">
                  <Satellite className="w-4 h-4 text-[#4F806A]" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#9BB3A5]" />
              </div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-[#82978A] mt-4">
                Connectivity
              </p>

              <p className="text-sm font-bold text-[#456655] mt-1">
                Satellite
              </p>
            </div>

          </div>

          {/* Description */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">

            <div className="hidden lg:block w-1 rounded-full bg-gradient-to-b from-[#287C80] via-[#477A91] to-[#B98232]" />

            <div>
              <p className="text-sm leading-7 text-[#5F7078] whitespace-pre-line">
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

        <WeatherSection weather={currentData.weather} />

        <div className="space-y-7 w-full">
  {/* ENERGY — FULL WIDTH */}
  <div className="w-full">
    <EnergySection energy={currentData.energy} />
  </div>

  {/* LOGISTICS — FULL WIDTH BELOW ENERGY */}
  <div className="w-full">
    <LogisticsSection logistics={currentData.logistics} />
  </div>
</div>

      </div>
    </div>
  );
};