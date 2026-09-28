import React from "react";
import { DataSource } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";

interface SectionProvenanceProps {
  source: DataSource;
  origin: string;
  caption?: string;
  variant?: "light" | "dark";
  size?: "xs" | "sm";
  className?: string;
}

/**
 * One-line inline provenance indicator for section headers.
 * Renders a SourceBadge followed by a muted origin caption.
 */
export const SectionProvenance: React.FC<SectionProvenanceProps> = ({
  source,
  origin,
  caption,
  variant = "light",
  size = "sm",
  className = "",
}) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <SourceBadge
        source={source}
        size={size}
        variant={variant}
        origin={origin}
      />
      <span className="text-[11px] font-medium text-[#7A8C93] leading-none">
        {caption ?? origin}
      </span>
    </span>
  );
};
