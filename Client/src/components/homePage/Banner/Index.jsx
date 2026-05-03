import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, Fuel, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { stationService } from '../../../helpers/stationService';
import { motion, AnimatePresence } from 'framer-motion';

const Banner = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ── CLICK OUTSIDE INTELLIGENCE ──
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── LIVE SEARCH INTELLIGENCE ──
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const response = await stationService.getAllStations({ 
          search: query, 
          limit: 3 
        });
        
        const stations = Array.isArray(response) ? response : response.stations || [];
        setResults(stations.slice(0, 3));
      } catch (error) {
        console.error("Live search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setShowDropdown(false);
    if (query.trim()) {
      navigate(`/stations?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/stations');
    }
  };

  return (
    <section className="w-full bg-white rounded-2xl md:rounded-[32px] p-4 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative">
      {/* Decorative Glow Container - Clipped */}
      <div className="absolute inset-0 rounded-2xl md:rounded-[32px] overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[80px] rounded-full -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full -ml-24 -mb-24"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Live Indicator - Fixed Width */}
        <div className="inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full text-amber-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4 whitespace-nowrap min-w-[110px] md:min-w-[130px] justify-center">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
          {t.hero.live}
        </div>
        
        {/* Title - Preserve height and prevent width jumps */}
        <h1 className="text-xl md:text-5xl font-black text-slate-900 mb-2 md:mb-3 tracking-tighter leading-tight min-h-[1.2em] flex flex-wrap justify-center items-center">
          <span className="whitespace-nowrap">{t.hero.title1}</span>
          <span className="text-amber-500 ml-1.5 md:ml-2 whitespace-nowrap">{t.hero.title2}</span>
        </h1>

        {/* Description - Stable height to prevent content jumping below */}
        <p className="text-slate-500 font-medium text-[10px] md:text-base max-w-lg md:max-w-xl mb-6 md:mb-8 leading-relaxed min-h-[3em] md:min-h-[2.5em] flex items-center justify-center px-2">
          {t.hero.desc}
        </p>
        
        <div ref={dropdownRef} className="relative w-full max-w-2xl">
          <form 
            onSubmit={handleSearch}
            className="w-full bg-slate-50 p-1 md:p-1.5 rounded-xl md:rounded-2xl flex flex-col md:flex-row items-center gap-1 md:gap-2 border border-slate-200 shadow-inner"
          >
            <div className="flex items-center flex-1 w-full px-2 md:px-3">
              <Search className="text-slate-400 shrink-0" size={14} md:size={18} />
              <input 
                type="text" 
                placeholder={t.hero.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
                className="w-full bg-transparent border-none py-2 md:py-3 px-2 md:px-3 font-bold text-slate-700 outline-none placeholder:text-slate-400 text-xs md:text-base"
              />
              {isSearching && <Loader2 size={16} className="animate-spin text-amber-500 mr-2" />}
            </div>
          </form>

          {/* ── FLOATING LIVE RESULTS ── */}
          <AnimatePresence>
            {showDropdown && (query.trim().length >= 2) && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-xl border border-white rounded-[24px] shadow-2xl shadow-slate-900/10 overflow-hidden z-[100]"
              >
                {isSearching ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-slate-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                          <div className="h-2 bg-slate-50 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {results.map((station) => (
                      <button
                        key={station._id}
                        onClick={() => navigate(`/stations/${station._id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-slate-100 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10 group-hover:bg-amber-500 transition-colors">
                            <Fuel size={16} />
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{station.name}</h4>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <MapPin size={10} />
                              <span>{station.location.subArea}, {station.location.city}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                             station.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                             {station.status}
                           </div>
                           <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))}
                    <button 
                      onClick={handleSearch}
                      className="w-full py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors border-t border-slate-50 mt-1"
                    >
                      View All Matching Stations
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center flex flex-col items-center gap-2">
                    <Search size={24} className="text-slate-200" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No exact match found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Banner;
