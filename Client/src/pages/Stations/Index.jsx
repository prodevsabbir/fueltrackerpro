import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Fuel, MapPin, Verified, Star, ArrowLeft, Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, Navigation, Clock, Loader2, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { stationService } from '../../helpers/stationService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo } from '../../helpers/dateUtils';

// Haversine distance calculator
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  if (d < 1) return `${Math.round(d * 1000)}m`;
  return `${d.toFixed(1)}km`;
};

const StationSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm animate-pulse flex flex-col h-full space-y-3">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-100 rounded-2xl"></div>
      <div className="w-16 h-5 bg-slate-50 rounded-lg"></div>
    </div>
    <div className="space-y-2 flex-1 pt-1">
      <div className="h-4 md:h-5 w-3/4 bg-slate-100 rounded-lg"></div>
      <div className="h-2 md:h-3 w-1/2 bg-slate-50 rounded-lg"></div>
    </div>
    <div className="pt-3 md:pt-4 border-t border-slate-50 flex justify-between items-center">
      <div className="space-y-1">
         <div className="w-10 h-2 bg-slate-50 rounded-md"></div>
         <div className="w-16 md:w-20 h-5 md:h-6 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="space-y-1.5 items-end flex flex-col">
         <div className="w-14 h-4 bg-slate-50 rounded-md"></div>
         <div className="w-16 h-3 bg-slate-50 rounded-md"></div>
      </div>
    </div>
  </div>
);

const Stations = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  
  const [userLocation, setUserLocation] = useState(null);
  const [locationErrorShown, setLocationErrorShown] = useState(false);

  const categories = useMemo(() => [
    { id: 'all', name: 'ALL' },
    { id: 'octane', name: t.pumps.octane.toUpperCase() },
    { id: 'petrol', name: t.pumps.petrol.toUpperCase() },
    { id: 'diesel', name: t.pumps.diesel.toUpperCase() }
  ], [t]);

  const location = useLocation();

  // ── SYNC SEARCH FROM URL ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      setCurrentPage(1);
    }
  }, [location.search]);

  // ── INTELLIGENT LOCATION DETECTION ──
  useEffect(() => {
    const locateUser = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (error) => {
            if (user?.location?.coordinates) {
              setUserLocation({ lat: user.location.coordinates[1], lng: user.location.coordinates[0] });
            } else if (!locationErrorShown) {
              toast.warning("Please turn on location to find nearby stations accurately.", { autoClose: 5000 });
              setLocationErrorShown(true);
            }
          }
        );
      } else {
        if (user?.location?.coordinates) {
          setUserLocation({ lat: user.location.coordinates[1], lng: user.location.coordinates[0] });
        } else if (!locationErrorShown) {
          toast.warning("Location not supported. Please update profile or turn on GPS.", { autoClose: 5000 });
          setLocationErrorShown(true);
        }
      }
    };
    
    if (!userLocation) {
      locateUser();
    }
  }, [user, locationErrorShown, userLocation]);

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

      if (userLocation?.lat && userLocation?.lng) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      
      const response = await stationService.getAllStations(params);
      
      if (Array.isArray(response)) {
        setStations(response);
        setTotalPages(1);
      } else if (response && response.stations) {
        setStations(response.stations);
        if (response.meta) {
          const maxAllowedPages = 5; 
          setTotalPages(Math.min(response.meta.totalPages || 1, maxAllowedPages));
        }
      } else {
        setStations([]);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Network Error: Discovery offline");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [currentPage, searchQuery, activeStatus, activeCategory, sortBy, userLocation]);


  useEffect(() => { window.scrollTo(0, 0); }, [currentPage]);

  return (
    <div className="w-full flex flex-col items-center bg-[#FAFAFB] min-h-screen pt-24 md:pt-32 pb-20 overflow-x-hidden">
      <div className="w-full max-w-7xl px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 flex items-center justify-center shadow-sm">
              <ArrowLeft size={18} />
            </button>
            <div>
               <h1 className="text-xl md:text-2xl font-black text-[#1e293b] tracking-tight leading-none">{t.pumps.title}</h1>
               <p className="text-[#94a3b8] font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] mt-1.5">{t.pumps.subtitle}</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder={t.pumps.search}
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
              className="w-full bg-white border border-slate-200 rounded-2xl md:rounded-3xl py-3 md:py-3.5 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
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
              <div className="flex-1 md:flex-none flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm group hover:border-amber-500 transition-all">
                <Filter size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                <select value={activeStatus} onChange={(e) => {setActiveStatus(e.target.value); setCurrentPage(1);}} className="bg-transparent border-none text-[9px] font-black text-slate-600 outline-none cursor-pointer uppercase tracking-widest w-full">
                    <option value="all">{t.pumps.filter}:</option>
                    <option value="available">{t.pumps.available.toUpperCase()}</option>
                    <option value="limited">{t.pumps.limited.toUpperCase()}</option>
                    <option value="out">{t.pumps.out.toUpperCase()}</option>
                </select>
              </div>

              <div className="flex-1 md:flex-none flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm group hover:border-amber-500 transition-all">
                <SlidersHorizontal size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                <select value={sortBy} onChange={(e) => {setSortBy(e.target.value); setCurrentPage(1);}} className="bg-transparent border-none text-[9px] font-black text-slate-600 outline-none cursor-pointer uppercase tracking-widest w-full">
                    <option value="distance">{t.pumps.nearest}</option>
                    <option value="rating">{t.pumps.rating.toUpperCase()}</option>
                    <option value="price-low">{t.pumps.priceLow.toUpperCase()}</option>
                    <option value="price-high">{t.pumps.priceHigh.toUpperCase()}</option>
                </select>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-12">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => <StationSkeleton key={i} />)
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
                    className="bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full"
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      pump.status === 'available' ? 'bg-emerald-500' : pump.status === 'limited' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>

                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-amber-500 transition-all duration-300">
                        <Fuel size={18} />
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-sm ${
                        pump.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        pump.status === 'limited' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {pump.status === 'available' ? t.pumps.available.toUpperCase() : pump.status === 'limited' ? t.pumps.limited.toUpperCase() : t.pumps.out.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight leading-tight group-hover:text-amber-600 transition-colors truncate">{pump.name}</h3>
                        {pump.verified && <Verified size={14} className="text-blue-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-bold flex items-center gap-1 line-clamp-1 mb-3 md:mb-4">
                        <MapPin size={10} className="text-slate-300" /> {pump.location.subArea}, {pump.location.city}
                      </p>
                    </div>

                    <div className="pt-3 md:pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[7px] md:text-[8px] uppercase font-black text-slate-300 tracking-[0.2em] mb-0.5">
                          {fuelInfo?.type || 'FUEL'}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base md:text-lg font-black text-slate-900">৳ {fuelInfo?.price || '0'}</span>
                          <span className="text-[8px] font-bold text-slate-400">/L</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <div className="flex items-center justify-end gap-1.5">
                           {userLocation && pump.location?.coordinates && (
                             <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${pump.location.coordinates.lat},${pump.location.coordinates.lng}`, '_blank');
                                }}
                                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg cursor-pointer transition-colors"
                             >
                                <Navigation size={9} className="text-blue-500" />
                                <span className="text-[9px] md:text-[10px] font-black text-blue-700">
                                  {getDistance(userLocation.lat, userLocation.lng, pump.location.coordinates.lat, pump.location.coordinates.lng)}
                                </span>
                             </div>
                           )}
                           <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg">
                              <Star size={9} className="text-amber-500" fill="currentColor" />
                              <span className="text-[9px] md:text-[10px] font-black text-amber-700">{pump.rating || '4.5'}</span>
                           </div>
                        </div>
                        <p className="text-[8px] font-bold text-slate-400 flex items-center justify-end gap-1 uppercase tracking-wider">
                          <Clock size={8} /> {formatTimeAgo(pump.updatedAt, t)}
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
