import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Fuel, MapPin, Verified, Star, ArrowLeft, Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, Navigation, Clock, Loader2, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { stationService } from '../../helpers/stationService';
import { toast } from 'react-toastify';

const StationSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm animate-pulse space-y-6">
    <div className="flex justify-between items-start">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
      <div className="w-20 h-6 bg-slate-50 rounded-xl"></div>
    </div>
    <div className="space-y-3">
      <div className="h-6 w-3/4 bg-slate-100 rounded-lg"></div>
      <div className="h-4 w-1/2 bg-slate-50 rounded-lg"></div>
    </div>
    <div className="flex gap-2">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-12 flex-1 bg-slate-50 rounded-xl"></div>)}
    </div>
    <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
      <div className="w-24 h-10 bg-slate-100 rounded-xl"></div>
      <div className="w-16 h-6 bg-slate-50 rounded-xl"></div>
    </div>
  </div>
);

const Stations = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const categories = useMemo(() => [
    { id: 'all', name: 'ALL' },
    { id: 'octane', name: 'OCTANE' },
    { id: 'petrol', name: 'PETROL' },
    { id: 'diesel', name: 'DIESEL' }
  ], []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: activeStatus !== 'all' ? activeStatus : undefined,
        category: activeCategory !== 'all' ? activeCategory : undefined,
        sortBy
      };
      
      const response = await stationService.getAllStations(params);
      
      // 🛡️ ADAPTIVE PARSING: Handle both direct arrays and { stations, meta } objects
      if (Array.isArray(response)) {
        setStations(response);
        setTotalPages(1);
      } else if (response && response.stations) {
        setStations(response.stations);
        if (response.meta) {
          setTotalPages(response.meta.totalPages || 1);
        }
      } else {
        setStations([]);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Network Error: Discovery offline");
    } finally {
      setTimeout(() => setLoading(false), 800); // Smooth transition
    }
  };

  useEffect(() => {
    fetchStations();
  }, [currentPage, searchQuery, activeStatus, activeCategory, sortBy]);

  const formatTime = (isoString) => {
    if (!isoString) return "Just now";
    const diff = Math.floor((new Date() - new Date(isoString)) / (1000 * 60));
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  useEffect(() => { window.scrollTo(0, 0); }, [currentPage]);

  return (
    <div className="w-full flex flex-col items-center bg-[#FAFAFB] min-h-screen pt-24 md:pt-32 pb-20 overflow-x-hidden">
      <div className="w-full max-w-7xl px-4 md:px-8">
        
        {/* PREMIUM TACTICAL HEADER (Matching User Image) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/map')} className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 flex items-center justify-center shadow-sm">
              <ArrowLeft size={18} />
            </button>
            <div>
               <h1 className="text-xl md:text-2xl font-black text-[#1e293b] tracking-tight leading-none">Nearby Stations</h1>
               <p className="text-[#94a3b8] font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] mt-1.5">COMMUNITY INTELLIGENCE</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
              className="w-full bg-white border border-slate-200 rounded-2xl md:rounded-3xl py-3 md:py-3.5 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* INTELLIGENCE FILTER ROW (Matching User Image) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
           {/* Fuel Tabs */}
           <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl overflow-x-auto scrollbar-hide">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => {setActiveCategory(cat.id); setCurrentPage(1);}}
                  className={`px-4 md:px-6 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat.id 
                    ? 'bg-white text-slate-900 shadow-md' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
           </div>

           <div className="flex items-center gap-3">
              {/* Status Dropdown */}
              <div className="flex-1 md:flex-none flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm group hover:border-amber-500 transition-all">
                <Filter size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                <select value={activeStatus} onChange={(e) => {setActiveStatus(e.target.value); setCurrentPage(1);}} className="bg-transparent border-none text-[9px] font-black text-slate-600 outline-none cursor-pointer uppercase tracking-widest w-full">
                    <option value="all">ALL STATUS:</option>
                    <option value="available">AVAILABLE</option>
                    <option value="limited">LIMITED</option>
                    <option value="out">CLOSED</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex-1 md:flex-none flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm group hover:border-amber-500 transition-all">
                <SlidersHorizontal size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                <select value={sortBy} onChange={(e) => {setSortBy(e.target.value); setCurrentPage(1);}} className="bg-transparent border-none text-[9px] font-black text-slate-600 outline-none cursor-pointer uppercase tracking-widest w-full">
                    <option value="rating">TOP RATED</option>
                    <option value="price-low">PRICE: LOW</option>
                    <option value="price-high">PRICE: HIGH</option>
                </select>
              </div>
           </div>
        </div>

        {/* STATIONS GRID - COMPACT & RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <StationSkeleton key={i} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {stations.length > 0 ? stations.map((pump) => {
                const fuelInfo = pump.fuels.find(f => f.type === (activeCategory === 'all' ? pump.primaryCategory : activeCategory)) || pump.fuels[0];
                
                return (
                  <motion.div 
                    layout 
                    key={pump._id} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    onClick={() => navigate(`/stations/${pump._id}`)} 
                    className="bg-white border border-slate-100 rounded-[32px] p-5 md:p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full"
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      pump.status === 'available' ? 'bg-emerald-500' : pump.status === 'limited' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-amber-500 transition-all duration-300">
                        <Fuel size={20} md:size={24} />
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                        pump.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        pump.status === 'limited' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {pump.status}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-amber-600 transition-colors truncate">{pump.name}</h3>
                        {pump.verified && <Verified size={14} className="text-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-400 font-bold flex items-center gap-1.5 line-clamp-1 mb-6">
                        <MapPin size={12} className="text-slate-300" /> {pump.location.address}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[7px] md:text-[8px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">
                          {fuelInfo?.type || 'FUEL'}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl md:text-2xl font-black text-slate-900">৳ {fuelInfo?.price || '0'}</span>
                          <span className="text-[8px] font-bold text-slate-400">/L</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 bg-amber-50 px-2 py-1 rounded-lg mb-2 inline-flex">
                           <Star size={10} className="text-amber-500" fill="currentColor" />
                           <span className="text-[10px] font-black text-amber-700">{pump.rating || '4.5'}</span>
                        </div>
                        <p className="text-[8px] font-bold text-slate-400 flex items-center justify-end gap-1 uppercase tracking-wider">
                          <Clock size={8} /> {formatTime(pump.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Search size={32} /></div>
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No stations found</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Adjust filters or search radius</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* PAGINATION SECTION - COMPACT */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 md:gap-3">
             <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center transition-all hover:border-amber-500 hover:text-amber-500 disabled:opacity-30 shadow-sm"><ChevronLeft size={18} /></button>
             <div className="flex items-center gap-1.5 md:gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl text-[10px] md:text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}>{i + 1}</button>
                ))}
             </div>
             <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center transition-all hover:border-amber-500 hover:text-amber-500 disabled:opacity-30 shadow-sm"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default Stations;
