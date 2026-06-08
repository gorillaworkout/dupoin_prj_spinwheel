"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type Prize = {
  id: string;
  name: string;
  percentage: number; // 0-100, replaces weight
  color: string;
  stock: number;
};

export type PrizeLog = {
  id: string;
  prizeId: string;
  prizeName: string;
  prizeColor: string;
  timestamp: number; // Date.now()
};

export type BackgroundSettings = {
  type: "color" | "image";
  value: string;
};

export type AudioSettings = {
  enabled: boolean;
};

interface WheelContextType {
  prizes: Prize[];
  setPrizes: React.Dispatch<React.SetStateAction<Prize[]>>;
  addPrize: (prize: Omit<Prize, "id">) => void;
  removePrize: (id: string) => void;
  updatePrize: (id: string, updated: Partial<Prize>) => void;
  background: BackgroundSettings;
  setBackground: React.Dispatch<React.SetStateAction<BackgroundSettings>>;
  audioSettings: AudioSettings;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
  prizeLogs: PrizeLog[];
  addPrizeLog: (prize: Prize) => void;
  clearPrizeLogs: () => void;
}

const defaultPrizes: Prize[] = [
  { id: "1", name: "IPhone 15", percentage: 1, color: "#ef4444", stock: 1 },
  { id: "2", name: "Voucher 100k", percentage: 15, color: "#3b82f6", stock: 10 },
  { id: "3", name: "Mug Cantik", percentage: 25, color: "#10b981", stock: 50 },
  { id: "4", name: "Kaos", percentage: 20, color: "#f59e0b", stock: 20 },
  { id: "5", name: "Zonk", percentage: 25, color: "#6b7280", stock: 999 },
  { id: "6", name: "Voucher 50k", percentage: 14, color: "#8b5cf6", stock: 20 },
];

const defaultBackground: BackgroundSettings = {
  type: "color",
  value: "#0f172a",
};

const WheelContext = createContext<WheelContextType | undefined>(undefined);

export function WheelProvider({ children }: { children: React.ReactNode }) {
  const [prizes, setPrizes] = useState<Prize[]>(defaultPrizes);
  const [background, setBackground] = useState<BackgroundSettings>(defaultBackground);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({ enabled: true });
  const [prizeLogs, setPrizeLogs] = useState<PrizeLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const backgroundHydratedRef = useRef(false);

  // Load from localStorage
  useEffect(() => {
    const savedPrizes = localStorage.getItem("spinwheel_prizes");
    const savedBackground = localStorage.getItem("spinwheel_background");
    const savedAudio = localStorage.getItem("spinwheel_audio");
    const savedLogs = localStorage.getItem("spinwheel_logs");

    if (savedPrizes) {
      const parsed = JSON.parse(savedPrizes);
      // Migrate old weight-based prizes to percentage
      const migrated = parsed.map((p: any) => {
        if (p.weight !== undefined && p.percentage === undefined) {
          return { ...p, percentage: p.weight, weight: undefined };
        }
        return p;
      });
      setPrizes(migrated);
    }
    if (savedBackground) setBackground(JSON.parse(savedBackground));
    if (savedAudio) setAudioSettings(JSON.parse(savedAudio));
    if (savedLogs) setPrizeLogs(JSON.parse(savedLogs));

    fetch("/api/background")
      .then((res) => res.json())
      .then((data) => {
        if (data?.background) {
          setBackground(data.background);
          localStorage.setItem("spinwheel_background", JSON.stringify(data.background));
        }
      })
      .catch(() => {})
      .finally(() => {
        backgroundHydratedRef.current = true;
        setIsLoaded(true);
      });
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("spinwheel_prizes", JSON.stringify(prizes));
      localStorage.setItem("spinwheel_background", JSON.stringify(background));
      localStorage.setItem("spinwheel_audio", JSON.stringify(audioSettings));
      localStorage.setItem("spinwheel_logs", JSON.stringify(prizeLogs));

      if (backgroundHydratedRef.current) {
        fetch("/api/background", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ background }),
        }).catch(() => {});
      }
    }
  }, [prizes, background, audioSettings, prizeLogs, isLoaded]);

  const addPrize = (prize: Omit<Prize, "id">) => {
    setPrizes((prev) => [...prev, { ...prize, id: Date.now().toString() }]);
  };

  const removePrize = (id: string) => {
    setPrizes((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePrize = (id: string, updated: Partial<Prize>) => {
    setPrizes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const addPrizeLog = (prize: Prize) => {
    const log: PrizeLog = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      prizeId: prize.id,
      prizeName: prize.name,
      prizeColor: prize.color,
      timestamp: Date.now(),
    };
    setPrizeLogs((prev) => [log, ...prev]); // newest first
  };

  const clearPrizeLogs = () => {
    setPrizeLogs([]);
  };

  return (
    <WheelContext.Provider
      value={{
        prizes,
        setPrizes,
        addPrize,
        removePrize,
        updatePrize,
        background,
        setBackground,
        audioSettings,
        setAudioSettings,
        prizeLogs,
        addPrizeLog,
        clearPrizeLogs,
      }}
    >
      {children}
    </WheelContext.Provider>
  );
}

export function useWheel() {
  const context = useContext(WheelContext);
  if (context === undefined) {
    throw new Error("useWheel must be used within a WheelProvider");
  }
  return context;
}
