import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AlertSettings = ({ onClose, showToast }) => {
  const { user, updateProfile } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [prefs, setPrefs] = useState(user?.alertPrefs || { email: true, sms: false });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ phone, alertPrefs: prefs });
      showToast('Alert preferences saved! 🔔', 2000);
      onClose();
    } catch (err) {
      showToast('Failed to save settings', 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 shadow-2xl" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="glass rounded-[2.5rem] p-10 w-full max-w-lg border border-white/10 animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500"></div>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Flight Alerts</h2>
            <p className="text-zinc-400 text-sm font-medium">Get real-time updates on your missions</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
             <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="space-y-8">
          {/* Phone Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400 ml-1">Mobile Number</label>
            <div className="relative">
              <i className="fa-solid fa-phone absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm"></i>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-white/5 rounded-2xl pl-12 pr-5 py-4 outline-none border border-white/10 focus:border-sky-500 transition-all font-medium text-white placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Alert Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPrefs({ ...prefs, email: !prefs.email })}
              className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${prefs.email ? 'bg-sky-500/10 border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-60'}`}
            >
              <i className={`fa-solid fa-envelope text-2xl ${prefs.email ? 'text-sky-400' : 'text-zinc-500'}`}></i>
              <span className="text-xs font-bold tracking-widest uppercase">Email Alerts</span>
              <div className={`mt-2 w-8 h-4 rounded-full relative transition-all ${prefs.email ? 'bg-sky-500' : 'bg-zinc-700'}`}>
                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${prefs.email ? 'right-1' : 'left-1'}`}></div>
              </div>
            </button>

            <button
              onClick={() => setPrefs({ ...prefs, sms: !prefs.sms })}
              className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${prefs.sms ? 'bg-violet-500/10 border-violet-500/50 shadow-[0_0_20px_rgba(124,58,237,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-60'}`}
            >
              <i className={`fa-solid fa-mobile-screen text-2xl ${prefs.sms ? 'text-violet-400' : 'text-zinc-500'}`}></i>
              <span className="text-xs font-bold tracking-widest uppercase">SMS Alerts</span>
              <div className={`mt-2 w-8 h-4 rounded-full relative transition-all ${prefs.sms ? 'bg-violet-500' : 'bg-zinc-700'}`}>
                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${prefs.sms ? 'right-1' : 'left-1'}`}></div>
              </div>
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)' }}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <i className="fa-solid fa-check"></i>}
            Save Intelligence Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertSettings;
