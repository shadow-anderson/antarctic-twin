"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getLinkStatus, toggleLink } from "@/lib/api";

interface LinkContextType {
  connected: boolean;
  isLive: boolean;
  lastSynced: string;
  isRestoring: boolean;
  toggle: () => void;
}

const LinkContext = createContext<LinkContextType | undefined>(undefined);

export const LinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>("Simulation Mode");
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    getLinkStatus()
      .then((status) => {
        if (isMounted) {
          setConnected(status.connected);
          setLastSynced(status.last_synced);
          setIsLive(Boolean(status.is_live));
        }
      })
      .catch((err) => {
        console.error("Failed to load initial link status:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggle = useCallback(async () => {
    if (connected) {
      // Toggle to degraded
      try {
        const res = await toggleLink();
        setConnected(res.connected);
        setLastSynced(`Degraded (${res.last_synced})`);
        setIsLive(false);
        setIsRestoring(false);
      } catch (err) {
        console.error("Failed to toggle link:", err);
        setConnected(false);
        setIsLive(false);
        setLastSynced("4m ago");
      }
    } else {
      // Toggle back with a short 750ms restoration transition
      setIsRestoring(true);
      try {
        const res = await toggleLink();
        setTimeout(() => {
          setConnected(res.connected);
          setLastSynced(res.last_synced);
          setIsLive(Boolean(res.is_live));
          setIsRestoring(false);
        }, 750);
      } catch (err) {
        console.error("Failed to restore link:", err);
        setTimeout(() => {
          setConnected(true);
          setLastSynced("Simulation Mode");
          setIsLive(false);
          setIsRestoring(false);
        }, 750);
      }
    }
  }, [connected]);

  return (
    <LinkContext.Provider value={{ connected, isLive, lastSynced, isRestoring, toggle }}>
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
