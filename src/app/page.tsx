"use client";

import React, { useEffect, useState } from "react";
import Wheel from "@/components/Wheel";
import { useWheel } from "@/context/WheelContext";
import { Settings as SettingsIcon } from "lucide-react";

export default function Home() {
  const { background } = useWheel();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const backgroundStyle = background.type === 'color'
    ? { backgroundColor: background.value }
    : { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <main
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center transition-all duration-700 ease-in-out"
      style={backgroundStyle}
    >
      {background.type === 'image' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0"></div>
      )}

      {/* Header */}
      <div className="absolute top-8 left-8 z-10 text-white drop-shadow-lg">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
          Super Spinwheel
        </h1>
        <p className="text-slate-200 mt-2 text-sm md:text-base font-medium opacity-80">
          Semoga Beruntung!
        </p>
      </div>

      {/* Admin Link */}
      <a
        href="/admin"
        className="absolute top-6 right-6 z-40 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition shadow-lg"
        title="Admin Panel"
      >
        <SettingsIcon className="w-6 h-6" />
      </a>

      <div className="z-10 w-full max-w-4xl px-4 flex flex-col items-center">
        <Wheel />
      </div>
    </main>
  );
}
