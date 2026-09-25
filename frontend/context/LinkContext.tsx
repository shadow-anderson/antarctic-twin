"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface LinkContextType {
  connected: boolean;
  lastSynced: string;
  isRestoring: boolean;
  toggle: () => void;
}

const LinkContext = createContext<LinkContextType | undefined>(undefined);

export const LinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState<boolean>(true);
  const [lastSynced, setLastSynced] = useState<string>("14:32 UTC");
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  const toggle = useCallback(() => {
    if (connected) {
      // Toggle to degraded
      setConnected(false);
      setLastSynced("4m ago (14:28 UTC)");
      setIsRestoring(false);
    } else {
      // Toggle back to live with a short 750ms restoration transition
      setIsRestoring(true);
      setTimeout(() => {
        setConnected(true);
        setLastSynced("14:32 UTC");
        setIsRestoring(false);
      }, 750);
    }
  }, [connected]);

  return (
    <LinkContext.Provider value={{ connected, lastSynced, isRestoring, toggle }}>
      {children}
    </LinkContext.Provider>
  );
};

export const useLink = (): LinkContextType => {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error("useLink must be used within a LinkProvider");
  }
  return context;
};
