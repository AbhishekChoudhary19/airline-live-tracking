import React, { useState, useEffect } from 'react';
import { useFlights } from '../context/FlightContext';
import { cargoAPI } from '../services/api';

const Hero = ({ showToast }) => {
  const { flights, stats, loadFlight, loadFlightsByRoute, setSelectedFlight, routeFilter, setRouteFilter } = useFlights();
  const [mode, setMode] = useState(0); // 0=flight, 1=route, 2=cargo
  const [flightInput, setFlightInput] = useState('');
  const [from, setFrom] = useState('BLR');
  const [to, setTo] = useState('DEL');
  const [awb, setAwb] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} IST`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTrackFlight = async () => {
    if (!flightInput.trim()) return;
    showToast(`Searching for ${flightInput.trim().toUpperCase()}...`, 1500);
    const f = await loadFlight(flightInput.trim().toUpperCase());
    if (f) {
      setSelectedFlight(f);
      showToast(`Tracking ${flightInput.toUpperCase()} live ✈️`, 2500);
      setFlightInput('');
    } else {
      showToast(`Flight ${flightInput.toUpperCase()} not found. Try one of the recent flights below.`, 3500);
    }
  };

  const handleTrackRoute = async () => {
    if (!from.trim() && !to.trim()) return;
    showToast(`Searching flights: ${from.toUpperCase() || 'Any'} → ${to.toUpperCase() || 'Any'}...`, 2000);
    const results = await loadFlightsByRoute(from.trim(), to.trim());
    if (results.length > 0) {
      showToast(`Found ${results.length} live flights on this route! ✈️`, 2500);
      // Scroll to map
      document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(`No live flights found for ${from} → ${to} right now.`, 3000);
    }
  };

  const handleTrackCargo = async () => {
    const id = awb.trim().toUpperCase() || 'AWB998877665';
    try {
      await cargoAPI.getByAWB(id);
      showToast(`Live tracking started for ${id}`, 2500);
    } catch { showToast('AWB not found. Try AWB998877665', 2500); }
  };

  return (
    <div className="relative min-h-[88vh] flex items-center overflow-hidden">
      
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/HEADER-BG.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-zinc-950/70 z-0"></div>

      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle at 30% 40%, rgba(56,189,248,0.1) 0%, transparent 60%)' }}></div>
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle at 70% 60%, rgba(139,92,246,0.1) 0%, transparent 50%)' }}></div>

      {/* Floating Decoration: Aircraft */}
      <div className="absolute top-1/4 right-[10%] text-sky-400/20 text-9xl animate-float-delayed pointer-events-none z-0 hidden lg:block">
        <i className="fa-solid fa-plane-up"></i>
      </div>
      <div className="absolute bottom-1/4 left-[5%] text-indigo-500/10 text-8xl animate-float pointer-events-none z-0 hidden lg:block">
        <i className="fa-solid fa-cloud"></i>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-20 lg:pt-28 pb-16 relative z-10 w-full parallax-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left */}
          <div className="lg:col-span-5 reveal active">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-medium px-5 py-2 rounded-3xl border border-white/20 mb-6 glass animate-glow">
              <div className="w-2 h-2 bg-emerald-400 rounded-full status-dot"></div>
              {flights.length > 0 ? `${flights.length} flights tracked live right now` : 'Connecting to live radar...'}
            </div>

            <h1 className="logo-font text-6xl lg:text-7xl font-semibold tracking-tighter leading-none mb-6">
              TRACK ANY<br />FLIGHT OR<br />
              <span className="text-transparent bg-clip-text animate-gradient" style={{ backgroundImage: 'linear-gradient(to right, #38bdf8, #818cf8, #38bdf8)' }}>CARGO</span>
              <br />IN REAL TIME
            </h1>

            <p className="text-xl text-zinc-300 max-w-md reveal delay-200">
              Live GPS • Weather • Delays • Gates • Baggage • AWB Cargo
            </p>

            {flights.length > 0 && (
              <div className="flex gap-8 mt-12 reveal delay-400">
                <div className="animate-float">
                  <div className="text-4xl font-semibold text-emerald-400">{stats.airborne ?? flights.filter(f => !f.onGround).length}</div>
                  <div className="text-xs tracking-widest text-zinc-500">AIRBORNE</div>
                </div>
                <div className="animate-float-delayed">
                  <div className="text-4xl font-semibold text-amber-400">{stats.onGround ?? flights.filter(f => f.onGround).length}</div>
                  <div className="text-xs tracking-widests text-zinc-500">ON GROUND</div>
                </div>
                <div className="animate-float">
                  <div className="text-4xl font-semibold text-sky-400">{stats.total ?? flights.length}</div>
                  <div className="text-xs tracking-widest text-zinc-500">TOTAL TRACKED</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Search Card */}
          <div className="lg:col-span-7 reveal active">
            <div className="glass rounded-[3rem] p-8 lg:p-10 shadow-2xl max-w-2xl mx-auto lg:ml-auto shine-effect">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1 text-sm bg-white/5 rounded-2xl p-1">
                  {['Flight Number', 'Route', 'Cargo AWB'].map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setMode(i)}
                      className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === i ? 'bg-white/15 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-zinc-400 font-mono">{time}</div>
              </div>

              {/* Flight search */}
              {mode === 0 && (
                <div className="space-y-5 animate-slide-up">
                  <input
                    value={flightInput}
                    onChange={e => setFlightInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTrackFlight()}
                    type="text"
                    placeholder="AI101 • 6E456 • SG234"
                    className="w-full bg-white/5 text-3xl placeholder-zinc-600 rounded-[2rem] px-8 py-7 outline-none border border-white/5 focus:border-sky-500/50 transition-all font-bold"
                  />
                  <button
                    onClick={handleTrackFlight}
                    className="w-full py-6 rounded-[2rem] text-xl font-black tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-sky-500/20"
                    style={{ background: 'linear-gradient(to right, #0ea5e9, #7c3aed)' }}
                  >
                    <i className="fa-solid fa-paper-plane"></i> TRACK FLIGHT NOW
                  </button>
                </div>
              )}

              {/* Route search */}
              {mode === 1 && (
                <div className="space-y-5 animate-slide-up">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest absolute left-6 top-3 uppercase">Origin</label>
                      <input value={from} onChange={e => setFrom(e.target.value)} type="text"
                        className="w-full bg-white/5 text-3xl placeholder-zinc-500 rounded-[2rem] px-6 pt-8 pb-4 outline-none border border-white/5 focus:border-sky-500/50 transition-all font-bold" />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-widest absolute left-6 top-3 uppercase">Destination</label>
                      <input value={to} onChange={e => setTo(e.target.value)} type="text"
                        className="w-full bg-white/5 text-3xl placeholder-zinc-500 rounded-[2rem] px-6 pt-8 pb-4 outline-none border border-white/5 focus:border-sky-500/50 transition-all font-bold" />
                    </div>
                  </div>
                  <button
                    onClick={handleTrackRoute}
                    className="w-full py-6 rounded-[2rem] text-xl font-black tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-indigo-500/20"
                    style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
                  >
                    SHOW LIVE FLIGHTS
                  </button>
                  {(routeFilter.from || routeFilter.to) && (
                    <button 
                      onClick={() => { setRouteFilter({ from: '', to: '' }); showToast('Route filter cleared', 1500); }}
                      className="w-full py-3 text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      CLEAR ROUTE FILTER
                    </button>
                  )}
                </div>
              )}

              {/* Cargo search */}
              {mode === 2 && (
                <div className="space-y-5 animate-slide-up">
                  <input
                    value={awb}
                    onChange={e => setAwb(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTrackCargo()}
                    type="text"
                    placeholder="AWB998877665"
                    className="w-full bg-white/5 text-3xl placeholder-zinc-600 rounded-[2rem] px-8 py-7 outline-none border border-white/5 focus:border-emerald-500/50 transition-all font-bold"
                  />
                  <button
                    onClick={handleTrackCargo}
                    className="w-full py-6 rounded-[2rem] text-xl font-black tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-emerald-500/20"
                    style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
                  >
                    <i className="fa-solid fa-box"></i> TRACK CARGO NOW
                  </button>
                </div>
              )}

              {/* Quick access */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] mb-4 flex items-center gap-2 uppercase">
                  <i className="fa-solid fa-history"></i> Recent Lookups
                </p>
                <div className="flex flex-wrap gap-2">
                  {['AI101', '6E456', 'SG234'].map(f => (
                    <button key={f} onClick={() => { setFlightInput(f); setMode(0); }}
                      className="glass text-xs font-bold px-5 py-2 rounded-full hover:bg-white/10 transition-all border border-white/5">{f}</button>
                  ))}
                  <button onClick={() => { setAwb('AWB998877665'); setMode(2); }}
                    className="glass text-xs font-bold px-5 py-2 rounded-full hover:bg-white/10 transition-all border border-emerald-500/20 text-emerald-400">
                    AWB998877665
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
