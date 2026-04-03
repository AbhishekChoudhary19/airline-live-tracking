import React, { useEffect, useState } from 'react';
import { useFlights } from '../context/FlightContext';

const SimulatorOverlay = () => {
  const { isSimulating, setSimulating, selectedFlight } = useFlights();
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);

  useEffect(() => {
    if (!isSimulating) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') setPitch(prev => Math.max(prev - 2, -30));
      if (e.key === 'ArrowDown') setPitch(prev => Math.min(prev + 2, 30));
      if (e.key === 'ArrowLeft') setRoll(prev => Math.max(prev - 5, -45));
      if (e.key === 'ArrowRight') setRoll(prev => Math.min(prev + 5, 45));
      if (e.key === 'Escape') setSimulating(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSimulating, setSimulating]);

  // Autolevel effect
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
        setPitch(prev => prev * 0.95);
        setRoll(prev => prev * 0.9);
    }, 50);
    return () => clearInterval(interval);
  }, [isSimulating]);

  if (!isSimulating) return null;

  return (
    <div className="fixed inset-0 z-[5000] bg-[#09090b]/80 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
      {/* Top Header */}
      <div className="absolute top-10 left-10 z-10">
        <button onClick={() => setSimulating(false)} className="glass px-8 py-4 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all border border-white/10 text-white flex items-center gap-3 active:scale-95">
          <i className="fa-solid fa-plane-arrival"></i> Disconnect Simulator
        </button>
      </div>

      <div className="absolute top-10 right-10 flex flex-col items-end text-white text-right z-10">
        <div className="text-[10px] font-black text-sky-400 mb-1 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span> Virtual Cockpit Connected
        </div>
        <div className="text-3xl font-black logo-font tracking-tighter">{selectedFlight?.callsign || 'PILOT_HUD'}</div>
        <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">{selectedFlight?.airline || 'Private Operations'}</div>
      </div>

      {/* Flight HUD Visuals */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
        
        {/* Scrabble Horizon Lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 transition-transform duration-300" style={{ transform: `rotate(${roll}deg) translateY(${pitch * 8}px)` }}>
            <div className="w-[200vw] h-px bg-emerald-400 shadow-[0_0_20px_#4ade80]"></div>
            <div className="absolute w-[200vw] h-px bg-emerald-400/30 -translate-y-40"></div>
            <div className="absolute w-[200vw] h-px bg-emerald-400/30 translate-y-40"></div>
        </div>

        {/* 3D Plane Visual */}
        <div className="perspective-1000 preserve-3d" style={{ transform: `perspective(1000px) rotateX(${pitch}deg) rotateZ(${roll}deg)` }}>
          <div className="text-white text-9xl drop-shadow-[0_0_100px_rgba(56,189,248,0.4)] transition-transform duration-150">
            <i className="fa-solid fa-plane"></i>
          </div>
        </div>

        {/* Interactive Dials & Gauges */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-4xl p-10 flex flex-col items-center">
            <div className="flex gap-12 mb-10 w-full justify-center">
                <div className="flex flex-col items-center">
                    <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-widest font-black">Pitch Angle</div>
                    <div className="w-48 h-1.5 bg-zinc-900 rounded-full border border-white/5 overflow-hidden relative shadow-inner">
                        <div className="absolute top-0 bottom-0 bg-sky-400 shadow-[0_0_10px_#38bdf8]" style={{ left: '50%', width: `${Math.abs(pitch)}%`, transform: pitch < 0 ? 'translateX(-100%)' : 'none' }}></div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-widest font-black">Roll Factor</div>
                    <div className="w-48 h-1.5 bg-zinc-900 rounded-full border border-white/5 overflow-hidden relative shadow-inner">
                        <div className="absolute top-0 bottom-0 bg-emerald-400 shadow-[0_0_10px_#4ade80]" style={{ left: '50%', width: `${Math.abs(roll)}%`, transform: roll < 0 ? 'translateX(-100%)' : 'none' }}></div>
                    </div>
                </div>
            </div>

            <div className="glass rounded-full px-10 py-4 border border-white/10 flex items-center gap-6 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400"><i className="fa-solid fa-arrow-up-down"></i></div>
                    <div className="text-[10px] font-black uppercase text-zinc-400">Arrows: Vector Control</div>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400"><span className="text-[10px] font-black">ESC</span></div>
                    <div className="text-[10px] font-black uppercase text-zinc-400">Emergency Disconnect</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorOverlay;
