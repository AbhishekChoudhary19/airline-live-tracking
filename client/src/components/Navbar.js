import React, { useState, useEffect } from 'react';
import { useFlights } from '../context/FlightContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab, showToast, setShowAuth, setShowAlertSettings }) => {
  const { connected, setSearchQuery, searchQuery, loadFlight, setSelectedFlight } = useFlights();
  const { user, logout } = useAuth();
  const [localQ, setLocalQ] = useState('');
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleSearch = () => {
    const q = localQ.trim().toUpperCase();
    if (!q) return;
    if (q.startsWith('AWB') || /^\d{11}$/.test(q)) {
      setActiveTab(3);
      showToast(`Searching cargo: ${q}`, 2000);
    } else {
      setSearchQuery(q);
      setActiveTab(0);
      loadFlight(q).then(f => {
        if (f) setSelectedFlight(f);
        else showToast('Flight not found. Try AI101 or 6E456', 2500);
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down & past threshold
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const tabs = [
    { label: 'Live Map', icon: 'fa-map' },
    { label: 'Flights', icon: 'fa-list' },
    { label: 'Airports', icon: 'fa-plane-departure' },
    { label: 'Cargo', icon: 'fa-box' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[2000] glass transition-transform duration-500 ${showNavbar ? 'translate-y-0' : '-translate-y-full shadow-2xl'}`}>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-sky-500/20 group-hover:rotate-12 transition-transform animate-glow">✈️</div>
          <span className="logo-font text-2xl font-black tracking-tighter hidden sm:block animate-gradient bg-gradient-to-r from-sky-400 to-white text-transparent bg-clip-text">AeroLive</span>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center bg-white/5 rounded-3xl px-5 py-2 border border-white/10 flex-1 max-w-lg">
          <input
            value={localQ}
            onChange={e => setLocalQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            type="text"
            placeholder="Search flight or AWB..."
            className="bg-transparent outline-none flex-1 text-sm placeholder-zinc-400"
          />
          <button
            onClick={handleSearch}
            className="ml-3 px-5 py-1.5 bg-white text-zinc-900 rounded-3xl font-semibold text-xs hover:bg-sky-400 hover:text-white transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-magnifying-glass"></i> TRACK
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`hidden lg:flex items-center gap-1.5 transition-colors ${activeTab === i ? 'text-sky-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 pl-4 border-l border-white/10">
            <div className={`w-2 h-2 rounded-full status-dot ${connected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            <span className="text-xs text-zinc-400 hidden sm:block">{connected ? 'LIVE' : 'OFFLINE'}</span>
          </div>



          {/* User */}
          {user ? (
            <div className="relative group">
              <div className="w-9 h-9 rounded-2xl overflow-hidden border-2 border-sky-500/30 cursor-pointer hover:scale-110 transition-transform active:scale-95 shadow-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute right-0 top-12 glass rounded-3xl p-3 w-56 hidden group-hover:block z-[3000] border border-white/10 shadow-2xl animate-fade-in">
                <div className="px-3 py-2 border-b border-white/5 mb-2">
                   <p className="text-sm font-bold truncate text-white">{user.name}</p>
                   <p className="text-[10px] font-medium text-zinc-500 truncate">{user.email}</p>
                </div>

                <button 
                  onClick={logout} 
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-xs font-semibold text-red-400 transition-all"
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 rounded-2xl text-xs font-semibold transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden flex border-t border-white/10">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 text-xs flex flex-col items-center gap-1 transition-colors ${activeTab === i ? 'text-sky-400' : 'text-zinc-500'}`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
