import React, { useEffect, useState } from 'react';

interface MuzzleFlashProps {
  trigger: boolean;
}

export const MuzzleFlash: React.FC<MuzzleFlashProps> = ({ trigger }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Screen flash overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 opacity-90 animate-ping" />
      <div className="absolute inset-0 bg-white opacity-80 animate-pulse" />
      
      {/* Muzzle burst center blast */}
      <div className="relative w-72 h-72 rounded-full bg-amber-200 blur-2xl opacity-90 scale-150 animate-bounce" />
      <div className="absolute text-center text-amber-950 font-black text-4xl tracking-widest drop-shadow-[0_0_20px_rgba(255,215,0,1)] uppercase">
        💥 BANG! 模拟发令枪响!
      </div>
    </div>
  );
};
