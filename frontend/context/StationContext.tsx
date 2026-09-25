"use client";

import React, { createContext, useContext, useState } from "react";

type StationId = "maitri" | "bharati";

interface StationContextType {
  selectedStation: StationId;
  setSelectedStation: (station: StationId) => void;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

export const StationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStation, setSelectedStation] = useState<StationId>("maitri");

  return (
    <StationContext.Provider value={{ selectedStation, setSelectedStation }}>
      {children}
    </StationContext.Provider>
  );
};

export const useStation = (): StationContextType => {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error("useStation must be used within a StationProvider");
  }
  return context;
};
