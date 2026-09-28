import React from "react";
import { DataSource } from "@/lib/types";

interface SourceBadgeProps {
  source: DataSource;
  className?: string;
  size?: "xs" | "sm";
  variant?: "light" | "dark";
  origin?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  className = "",
  size = "sm",
  variant = "light",
  origin,
}) => {
  const lightConfigs = {
    real: {
      label: "Real",
      textColor: "text-[#39735F]",
      bgColor: "bg-[#E5F0EA]",
      borderColor: "border-[#D2E3DA]",
      dotColor: "bg-[#4F806A]",
    },

    simulated: {
      label: "Simulated",
      textColor: "text-[#956E31]",
      bgColor: "bg-[#F5EDDD]",
      borderColor: "border-[#E7D9BC]",
      dotColor: "bg-[#B98232]",
    },

    derived: {
      label: "Derived",
      textColor: "text-[#69658A]",
      bgColor: "bg-[#ECEAF3]",
      borderColor: "border-[#DDD9E8]",
      dotColor: "bg-[#756B91]",
    },
  };

  const darkConfigs = {
    real: {
      label: "Real",
      textColor: "text-[#7FD1AE]",
      bgColor: "bg-[#4FB58A]/15",
      borderColor: "border-[#4FB58A]/30",
      dotColor: "bg-[#7FD1AE]",
    },

    simulated: {
      label: "Simulated",
      textColor: "text-[#E4B865]",
      bgColor: "bg-[#D9A441]/15",
      borderColor: "border-[#D9A441]/30",
      dotColor: "bg-[#E4B865]",
    },

    derived: {
      label: "Derived",
      textColor: "text-[#B7AFE0]",
      bgColor: "bg-[#8F86B8]/15",
      borderColor: "border-[#8F86B8]/30",
      dotColor: "bg-[#B7AFE0]",
    },
  };

  const configs = variant === "dark" ? darkConfigs : lightConfigs;
  const config = configs[source] || configs.real;

  const tooltipTitle = origin
    ? `Data Provenance: ${config.label} — ${origin}`
    : `Data Provenance: ${config.label}`;

  if (size === "xs") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[9px] font-semibold tracking-wide whitespace-nowrap ${config.textColor} ${className}`}
        title={tooltipTitle}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`}
        />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span
      className={`
  inline-flex items-center gap-1.5
  px-2.5 py-1
  rounded-full
  border
  text-[10px]
  font-semibold
  tracking-wide
  whitespace-nowrap
        ${config.bgColor}
        ${config.borderColor}
        ${config.textColor}
        ${className}
      `}
      title={tooltipTitle}
    >
      <span
        className={`
          w-1.5 h-1.5
          rounded-full
          ${config.dotColor}
        `}
      />

      <span>{config.label}</span>
    </span>
  );
};