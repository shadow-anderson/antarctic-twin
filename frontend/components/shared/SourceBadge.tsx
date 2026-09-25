import React from "react";
import { DataSource } from "@/lib/types";

interface SourceBadgeProps {
  source: DataSource;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  className = "",
}) => {
  const configs = {
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

  const config = configs[source] || configs.real;

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
      title={`Data Provenance: ${config.label}`}
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