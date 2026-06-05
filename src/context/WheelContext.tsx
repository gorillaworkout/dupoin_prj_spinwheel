"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Prize = {
  id: string;
  name: string;
  weight: number;
  color: string;
  stock: number;
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
}

const defaultPrizes: Prize[] = [
  { id: "1", name: "IPhone 15", weight: 1, color: "#ef4444", stock: 1 },
  { id: "2", name: "Voucher 100k", weight: 20, color: "#3b82f6", stock: 10 },
  { id: "3", name: "Mug Cantik", weight: 50, color: "#10b981", stock: 50 },
  { id: "4", name: "Kaos", weight: 40, color: "#f59e0b", stock: 20 },
  { id: "5", name: "Zonk", weight: 100, color: "#6b7280", stock: 999 },
  { id: "6", name: "Voucher 50k", weight: 30, color: "#8b5cf6", stock: 20 },
];

const defaultBackground: BackgroundSettings = {
  type: "color",
  value: "#0f172a", // Slate 900
};

const WheelContext = createContext<WheelContextType | undefined>(undefined);

export function WheelProvider({ children }: { children: React.ReactNode }) {
  const [prizes, setPrizes] = useState<Prize[]>(defaultPrizes);
  const [background, setBackground] = useState<BackgroundSettings>(defaultBackground);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({ enabled: true });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedPrizes = localStorage.getItem("spinwheel_prizes");
    const savedBackground = localStorage.getItem("spinwheel_background");
    const savedAudio = localStorage.getItem("spinwheel_audio");

    if (savedPrizes) setPrizes(JSON.parse(savedPrizes));
    if (savedBackground) setBackground(JSON.parse(savedBackground));
    if (savedAudio) setAudioSettings(JSON.parse(savedAudio));
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("spinwheel_prizes", JSON.stringify(prizes));
      localStorage.setItem("spinwheel_background", JSON.stringify(background));
      localStorage.setItem("spinwheel_audio", JSON.stringify(audioSettings));
    }
  }, [prizes, background, audioSettings, isLoaded]);

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
