"use client";

import React from "react";
import { useOperationalIntelligence } from "@/context/OperationalIntelligenceContext";
import { ROUTE_DEFINITIONS, WeatherCondition, RouteRisk } from "@/lib/intelligence/logisticsEngine";
import {
  Truck,
  Ship,
  Plane,
  CloudSnow,
  Wind,
  ThermometerSnowflake,
  Sun,
  AlertTriangle,
  Clock,
  MapPin,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
  Fuel,
} from "lucide-react";

export const RouteSimulator: React.FC = () => {
  const {
    selectedRouteId,
    setSelectedRouteId,
    logisticsWeather,
    setLogisticsWeather,
    currentRoute,
    routeAlternatives,
    resources,
  } = useOperationalIntelligence();

  const getRiskBadge = (risk: RouteRisk) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-ops-red/15 border-ops-red/30 text-ops-red";
      case "HIGH":
        return "bg-orange-500/15 border-orange-500/30 text-orange-400";
      case "MEDIUM":
        return "bg-ops-amber/15 border-ops-amber/30 text-ops-amber";
      case "LOW":
        return "bg-ops-green/15 border-ops-green/30 text-ops-green";
    }
  };

  const weatherOptions: { id: WeatherCondition; label: string; icon: any }[] = [
    { id: "NORMAL", label: "Normal Weather", icon: Sun },
    { id: "SEVERE_COLD", label: "Severe Cold", icon: ThermometerSnowflake },
    { id: "BLIZZARD", label: "Blizzard", icon: CloudSnow },
    { id: "HIGH_WIND", label: "High Katabatic Wind", icon: Wind },
  ];

  return (
    <div className="rounded-[26px] border border-white/10 bg-ops-panel shadow-[0_6px_20px_rgba(0,0,0,0.22)] overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-7 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ops-teal/15 text-ops-teal border border-ops-teal/25">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ops-text">
                Logistics Route &amp; Resupply Simulation
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white/5 border border-white/10 text-ops-text-3">
                DETERMINISTIC SIMULATION
              </span>
            </div>
            <p className="text-[11px] text-ops-text-2 mt-0.5">
              Simulate route delay, weather hazards, and detect supply depletion gaps
            </p>
          </div>
        </div>

        {/* Route Selector Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-[10px] uppercase font-bold text-ops-text-3">Route:</label>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-ops-card border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-ops-teal cursor-pointer"
          >
            {ROUTE_DEFINITIONS.map((r) => (
              <option key={r.id} value={r.id} className="bg-ops-panel text-white">
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Weather Scenario Buttons */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3 mb-2">
            Simulate Weather Condition On Route
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {weatherOptions.map((wx) => {
              const WxIcon = wx.icon;
              const isSelected = logisticsWeather === wx.id;
              return (
                <button
                  key={wx.id}
                  type="button"
                  onClick={() => setLogisticsWeather(wx.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-ops-teal/20 border-ops-teal text-white shadow-sm"
                      : "bg-ops-card/60 border-white/10 text-ops-text-2 hover:bg-ops-card hover:text-white"
                  }`}
                >
                  <WxIcon className={`w-4 h-4 ${isSelected ? "text-ops-teal" : "text-ops-text-3"}`} />
                  <span>{wx.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Supply Gap Alert Banner (13.4) */}
        {currentRoute.supplyGapDetected && (
          <div className="p-4 rounded-2xl bg-ops-red/15 border border-ops-red/30 flex items-start gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-ops-red shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-ops-red uppercase tracking-wider text-[11px]">
                Critical Logistics Warning: Supply Gap Detected
              </div>
              <p className="text-white mt-1 leading-relaxed">
                {currentRoute.supplyGapDetails}
              </p>
              <p className="text-[10px] text-ops-text-3 mt-1">
                Recommendation: Trigger inter-station support coordination or dispatch priority airlift cargo.
              </p>
            </div>
          </div>
        )}

        {/* Current Route KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-ops-card border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3">Distance</span>
            <div className="text-xl font-black text-ops-text mt-1">
              {currentRoute.distanceKm.toLocaleString()} <span className="text-xs font-semibold">km</span>
            </div>
            <span className="text-[10px] text-ops-text-3">{currentRoute.from} → {currentRoute.to}</span>
          </div>

          <div className="p-4 rounded-xl bg-ops-card border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3">Estimated ETA</span>
            <div className="text-xl font-black text-ops-teal mt-1">
              {Math.round(currentRoute.estimatedEtaHours / 24)} days{" "}
              <span className="text-xs font-normal text-ops-text-3">({currentRoute.estimatedEtaHours}h)</span>
            </div>
            <span className="text-[10px] text-ops-text-3">
              Normal: {Math.round(currentRoute.normalEtaHours / 24)}d
            </span>
          </div>

          <div className="p-4 rounded-xl bg-ops-card border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3">Weather Delay</span>
            <div className={`text-xl font-black mt-1 ${currentRoute.delayHours > 0 ? "text-ops-amber" : "text-ops-green"}`}>
              {currentRoute.delayHours > 0 ? `+${Math.round(currentRoute.delayHours / 24)}d` : "None"}
            </div>
            <span className="text-[10px] text-ops-text-3">
              {currentRoute.delayHours > 0 ? `+${currentRoute.delayHours} hours delay` : "On schedule"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-ops-card border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ops-text-3">Route Risk</span>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase border ${getRiskBadge(currentRoute.routeRisk)}`}>
                {currentRoute.routeRisk}
              </span>
            </div>
            <span className="text-[10px] text-ops-text-3 mt-1 block">Fuel Burn: ×{currentRoute.fuelConsumptionMultiplier.toFixed(2)}</span>
          </div>
        </div>

        {/* Narrative Explanation */}
        <div className="p-4 rounded-xl bg-ops-card/50 border border-white/5 text-xs text-ops-text-2 leading-relaxed">
          <div className="font-bold text-ops-text text-xs mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ops-teal" />
            Route Simulation Assessment
          </div>
          {currentRoute.explanation}
        </div>

        {/* 13.5 Route Alternatives Table */}
        {routeAlternatives.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ops-text-3 mb-2">
              Route Tradeoff Alternatives (Factual Comparison)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-ops-card/80 text-[10px] font-bold uppercase text-ops-text-3 border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-4">Route Option</th>
                    <th className="py-2.5 px-3">Est. ETA</th>
                    <th className="py-2.5 px-3">Route Risk</th>
                    <th className="py-2.5 px-4">Operational Characteristics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {routeAlternatives.map((alt) => (
                    <tr key={alt.route.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-ops-text">
                        {alt.route.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-ops-teal">
                        ~{Math.round(alt.estimatedEtaHours / 24)} days ({alt.estimatedEtaHours}h)
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getRiskBadge(alt.routeRisk)}`}>
                          {alt.routeRisk}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ops-text-2 text-[11px]">
                        {alt.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
