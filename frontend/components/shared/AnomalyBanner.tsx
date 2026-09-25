"use client";

import React, { useState, useEffect } from "react";
import { Anomaly } from "@/lib/types";
import {
  AlertCircle,
  X,
  TriangleAlert,
  Activity,
} from "lucide-react";

interface AnomalyBannerProps {
  anomalies: Anomaly[];
  stationName: string;
  timestamp?: string;
  onDismissAll?: () => void;
}

export const AnomalyBanner: React.FC<AnomalyBannerProps> = ({
  anomalies,
  stationName,
  timestamp = "14:32 UTC",
}) => {
  const [activeAnomalies, setActiveAnomalies] = useState<Anomaly[]>(anomalies);

  useEffect(() => {
    setActiveAnomalies(anomalies);
  }, [anomalies]);

  if (!activeAnomalies || activeAnomalies.length === 0) {
    return null;
  }

  const handleDismiss = (index: number) => {
    setActiveAnomalies((prev) => prev.filter((_, i) => i !== index));
  };

  const getSeverityStyle = (
    severity: "low" | "medium" | "high"
  ) => {
    switch (severity) {
      case "high":
        return {
          container:
            "bg-gradient-to-r from-[#F9E4E4] via-[#FBEAEA] to-[#F6E1E4]",
          border: "border-[#E7C3C7]",
          accent: "bg-[#C96868]",
          iconBg: "bg-[#F2D0D3]",
          iconColor: "text-[#B4515A]",
          title: "text-[#8F3942]",
          description: "text-[#71464B]",
          badge: "bg-[#C96868] text-white",
          meta: "text-[#967075]",
        };

      case "medium":
        return {
          container:
            "bg-gradient-to-r from-[#FAF0DC] via-[#FBF3E3] to-[#F5EBD7]",
          border: "border-[#E8D7B8]",
          accent: "bg-[#C28A3D]",
          iconBg: "bg-[#F1DFC0]",
          iconColor: "text-[#AA742C]",
          title: "text-[#805C26]",
          description: "text-[#705635]",
          badge: "bg-[#D09A48] text-white",
          meta: "text-[#948064]",
        };

      case "low":
      default:
        return {
          container:
            "bg-gradient-to-r from-[#E2F0F0] via-[#E9F4F3] to-[#E3EFED]",
          border: "border-[#C9DEDC]",
          accent: "bg-[#4F8B88]",
          iconBg: "bg-[#D3E8E6]",
          iconColor: "text-[#3D7775]",
          title: "text-[#376B69]",
          description: "text-[#496563]",
          badge: "bg-[#5D9692] text-white",
          meta: "text-[#708987]",
        };
    }
  };

  const formatVariableName = (v: string) => {
    return v
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="space-y-3.5 mb-7">
      {activeAnomalies.map((anomaly, index) => {
        const style = getSeverityStyle(anomaly.severity);

        return (
          <div
            key={`${anomaly.variable}-${index}`}
            className={`relative overflow-hidden flex items-center justify-between gap-4 p-4 lg:px-5 lg:py-4 rounded-2xl border shadow-[0_5px_18px_rgba(70,70,60,0.06)] transition-all duration-200 ${style.container} ${style.border}`}
          >
            {/* Severity accent */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.accent}`}
            />

            {/* Main content */}
            <div className="flex items-start gap-3.5 min-w-0 pl-1">

              {/* Icon */}
              <div
                className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-xl ${style.iconBg}`}
              >
                {anomaly.severity === "high" ? (
                  <TriangleAlert
                    className={`w-5 h-5 ${style.iconColor}`}
                  />
                ) : (
                  <AlertCircle
                    className={`w-5 h-5 ${style.iconColor}`}
                  />
                )}
              </div>

              {/* Text */}
              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">

                  <span
                    className={`text-[11px] font-bold tracking-[0.1em] uppercase ${style.title}`}
                  >
                    Environmental Anomaly Detected
                  </span>

                  <span className={`text-[10px] ${style.meta}`}>
                    {stationName} Station
                  </span>

                  <span className={`hidden sm:inline text-[10px] ${style.meta}`}>
                    •
                  </span>

                  <span className={`text-[10px] ${style.meta}`}>
                    {timestamp}
                  </span>
                </div>

                <p
                  className={`text-sm mt-1 leading-relaxed ${style.description}`}
                >
                  <span className="font-bold">
                    {formatVariableName(anomaly.variable)}
                  </span>{" "}
                  is significantly above baseline{" "}
                  <span className="font-semibold">
                    ({anomaly.value.toFixed(1)}
                  </span>{" "}
                  vs baseline mean{" "}
                  <span className="font-semibold">
                    {anomaly.baseline_mean.toFixed(1)} ±{" "}
                    {anomaly.baseline_stddev.toFixed(1)})
                  </span>
                </p>

              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 shrink-0">

              <div className="hidden sm:flex items-center gap-1.5">
                <Activity className={`w-3.5 h-3.5 ${style.iconColor}`} />

                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${style.meta}`}
                >
                  Monitoring
                </span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${style.badge}`}
              >
                {anomaly.severity}
              </span>

              <button
                onClick={() => handleDismiss(index)}
                className={`p-1.5 rounded-lg ${style.iconColor} hover:bg-black/5 transition-colors`}
                title="Dismiss anomaly"
                aria-label="Dismiss anomaly"
              >
                <X className="w-4 h-4" />
              </button>

            </div>
          </div>
        );
      })}
    </div>
  );
};