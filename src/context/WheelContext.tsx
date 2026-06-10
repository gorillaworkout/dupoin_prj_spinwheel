"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type Prize = {
  id: string;
  name: string;
  percentage: number;
  color: string;
  stock: number;
};

export type PrizeLog = {
  id: string;
  prizeId: string;
  prizeName: string;
  prizeColor: string;
  timestamp: number;
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

const defaultBackground: BackgroundSettings = {
  type: "color",
  value: "#0f172a",
};

const WheelContext = createContext<WheelContextType | undefined>(undefined);

export function WheelProvider({ children }: { children: React.ReactNode }) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [background, setBackground] = useState<BackgroundSettings>(defaultBackground);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({ enabled: true });
  const [prizeLogs, setPrizeLogs] = useState<PrizeLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const settingsSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load everything from DB on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [prizesRes, settingsRes, logsRes] = await Promise.all([
          fetch("/api/prizes"),
          fetch("/api/settings"),
          fetch("/api/logs"),
        ]);

        if (prizesRes.ok) {
          const data = await prizesRes.json();
          setPrizes(data.prizes || []);
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.background) setBackground(data.background);
          if (data.audio) setAudioSettings(data.audio);
        }

        if (logsRes.ok) {
          const data = await logsRes.json();
          setPrizeLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadAll();
  }, []);

  // Debounced save prizes to DB
  const savePrizes = useCallback(async (updatedPrizes: Prize[]) => {
    try {
      await fetch("/api/prizes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizes: updatedPrizes }),
      });
    } catch (err) {
      console.error("Failed to save prizes:", err);
    }
  }, []);

  // Debounced save settings
  const saveSettings = useCallback(async (bg: BackgroundSettings, audio: AudioSettings) => {
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "background", value: bg }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "audio", value: audio }),
        }),
      ]);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }, []);

  // Watch prizes changes → debounce save
  useEffect(() => {
    if (!isLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePrizes(prizes);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [prizes, isLoaded, savePrizes]);

  // Watch background/audio changes → debounce save
  useEffect(() => {
    if (!isLoaded) return;
    if (settingsSaveTimerRef.current) clearTimeout(settingsSaveTimerRef.current);
    settingsSaveTimerRef.current = setTimeout(() => {
      saveSettings(background, audioSettings);
    }, 500);
    return () => {
      if (settingsSaveTimerRef.current) clearTimeout(settingsSaveTimerRef.current);
    };
  }, [background, audioSettings, isLoaded, saveSettings]);

  const addPrize = async (prize: Omit<Prize, "id">) => {
    try {
      const res = await fetch("/api/prizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prize),
      });
      const data = await res.json();
      if (res.ok && data.prize) {
        setPrizes((prev) => [...prev, data.prize]);
      }
    } catch (err) {
      console.error("Failed to add prize:", err);
    }
  };

  const removePrize = async (id: string) => {
    try {
      await fetch(`/api/prizes?id=${id}`, { method: "DELETE" });
      setPrizes((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to remove prize:", err);
    }
  };

  const updatePrize = async (id: string, updated: Partial<Prize>) => {
    setPrizes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    try {
      await fetch("/api/prizes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updated }),
      });
    } catch (err) {
      console.error("Failed to update prize:", err);
    }
  };

  const addPrizeLog = async (prize: Prize) => {
    const log: PrizeLog = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      prizeId: prize.id,
      prizeName: prize.name,
      prizeColor: prize.color,
      timestamp: Date.now(),
    };
    setPrizeLogs((prev) => [log, ...prev]);

    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizeId: prize.id, prizeName: prize.name, prizeColor: prize.color }),
      });
    } catch (err) {
      console.error("Failed to save log:", err);
    }
  };

  const clearPrizeLogs = async () => {
    setPrizeLogs([]);
    try {
      await fetch("/api/logs", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
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
