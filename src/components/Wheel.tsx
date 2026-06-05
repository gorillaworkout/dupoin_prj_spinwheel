"use client";

import React, { useState, useRef, useEffect } from "react";
import { Prize, useWheel } from "@/context/WheelContext";
import { playSuccessSound, playTickSound } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function Wheel() {
  const { prizes, updatePrize, audioSettings } = useWheel();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Prize | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const numSlices = prizes.length;
  const sliceAngle = 360 / numSlices;

  // Render SVG Slices
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const getWinnerByWeight = () => {
    // Only pick from prizes that have stock > 0
    const availablePrizes = prizes.map((prize, index) => ({ prize, index })).filter(p => p.prize.stock > 0);
    
    if (availablePrizes.length === 0) return { prize: prizes[0], index: 0 }; // Fallback

    const totalWeight = availablePrizes.reduce((acc, p) => acc + p.prize.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < availablePrizes.length; i++) {
      if (random < availablePrizes[i].prize.weight) {
        return availablePrizes[i];
      }
      random -= availablePrizes[i].prize.weight;
    }
    return availablePrizes[0];
  };

  const spin = () => {
    // Check if there are any available prizes
    const hasStock = prizes.some(p => p.stock > 0);
    if (isSpinning || prizes.length === 0 || !hasStock) return;
    setIsSpinning(true);
    setWinner(null);

    const { prize, index } = getWinnerByWeight();

    // Calculate where to stop
    // The pointer is at the top (270 degrees in SVG, or 0 degrees if we rotate the whole SVG -90)
    // We want the center of the winning slice to be at the top pointer.
    
    // Each slice starts at index * sliceAngle and ends at (index + 1) * sliceAngle
    // Center of slice is index * sliceAngle + sliceAngle / 2
    // If the wheel rotates by R, the slice moves by R. 
    // To bring a slice's center to the top (which is 0 degrees or 360/0), 
    // we need: center_angle + R = 360 * k (mod 360) => R = 360 - center_angle
    
    const sliceCenter = index * sliceAngle + sliceAngle / 2;
    const targetRotation = 360 - sliceCenter;
    
    // Add extra spins (e.g., 5 full rotations)
    const extraSpins = 360 * 5;
    
    // Add randomness inside the slice so it doesn't always land in the exact center
    // We reduce this to 60% of slice width so it doesn't land too close to the borders
    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.6);
    
    // Total new rotation relative to 0
    const finalRotation = targetRotation + extraSpins + randomOffset;
    
    // Since rotation state might already be large from previous spins, 
    // we calculate how much to add to current rotation to reach the equivalent angle
    const currentRotMod = rotation % 360;
    const diff = finalRotation - currentRotMod;
    const newRotation = rotation + diff + extraSpins; // add spins again to ensure it spins forward

    setRotation(newRotation);

    // Play tick sound every ~100ms while spinning if audio is enabled
    let tickInterval: NodeJS.Timeout;
    if (audioSettings.enabled) {
      tickInterval = setInterval(() => {
        playTickSound();
      }, 150);
    }

    // Wait for transition to finish
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(prize);
      
      // Decrease stock
      updatePrize(prize.id, { stock: Math.max(0, prize.stock - 1) });

      if (audioSettings.enabled) {
        clearInterval(tickInterval);
        playSuccessSound();
      }
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
    }, 5000); // matches the transition duration
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Pointer */}
      <div className="absolute top-[-10px] z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600 filter drop-shadow-md"></div>
      
      {/* Wheel Container */}
      <div 
        className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] rounded-full border-4 border-white/20 shadow-2xl overflow-hidden transition-transform duration-[5000ms] ease-[cubic-bezier(0.25,0.1,0.15,1)]"
        style={{ transform: `rotate(${rotation}deg)` }}
        ref={wheelRef}
      >
        <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
          {prizes.map((prize, i) => {
            const percent = 1 / numSlices;
            const startX = getCoordinatesForPercent(0)[0];
            const startY = getCoordinatesForPercent(0)[1];
            const endX = getCoordinatesForPercent(percent)[0];
            const endY = getCoordinatesForPercent(percent)[1];

            // If there's only 1 prize, it's a full circle
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = prizes.length === 1 
              ? `M -1 0 A 1 1 0 1 1 1 0 A 1 1 0 1 1 -1 0`
              : [
                  `M ${startX} ${startY}`,
                  `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  `L 0 0`,
                ].join(" ");

            return (
              <g key={prize.id} style={{ transform: `rotate(${i * sliceAngle}deg)` }}>
                <path d={pathData} fill={prize.color} />
              </g>
            );
          })}
        </svg>

        {/* Text Layer */}
        {prizes.map((prize, i) => {
          // Subtract 90 degrees because our SVG is rotated by -90 degrees (starting at Top instead of Right)
          const rotationAngle = i * sliceAngle + sliceAngle / 2 - 90;
          return (
            <div
              key={`text-${prize.id}`}
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center font-bold text-white text-sm sm:text-base md:text-xl drop-shadow-md"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
              }}
            >
              <div 
                className="w-1/2 flex justify-center pl-4 sm:pl-6 md:pl-8"
                style={{
                  transform: "translateX(50%)",
                  opacity: prize.stock > 0 ? 1 : 0.3 // Dim out of stock items
                }}
              >
                <span className="truncate max-w-[80px] sm:max-w-[100px] md:max-w-[150px] inline-block text-center flex flex-col items-center">
                  <span>{prize.name}</span>
                  {prize.stock <= 0 && <span className="text-[10px] text-red-200 uppercase bg-red-900/50 px-1 rounded">Habis</span>}
                </span>
              </div>
            </div>
          );
        })}

        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-inner border-4 border-slate-200 z-10 flex items-center justify-center">
          <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || prizes.length === 0 || !prizes.some(p => p.stock > 0)}
        className="mt-12 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xl"
      >
        {isSpinning ? "Spinning..." : (!prizes.some(p => p.stock > 0) ? "Stok Habis" : "SPIN!")}
      </button>

      {/* Winner Modal/Alert */}
      {winner && !isSpinning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">Selamat!</h2>
            <p className="text-xl text-slate-200 mb-6 text-center">
              Kamu mendapatkan
            </p>
            <div 
              className="px-6 py-3 rounded-xl font-bold text-2xl text-white shadow-inner w-full text-center truncate mb-8"
              style={{ backgroundColor: winner.color }}
            >
              {winner.name}
            </div>
            <button
              onClick={() => setWinner(null)}
              className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition shadow-lg w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
