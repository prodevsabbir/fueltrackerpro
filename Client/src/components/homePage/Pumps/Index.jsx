import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Fuel, MapPin, Clock, Verified, Star, ChevronRight, Navigation } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { StationCardSkeleton } from '../../shared/Skeleton';
import { stationService } from '../../../helpers/stationService';
import { formatTimeAgo } from '../../../helpers/dateUtils';

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

const PumpList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [coords, setCoords] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth < 768;

  const categories = useMemo(() => [
    { id: 'all', name: 'ALL' },
    { id: 'octane', name: t.pumps.octane.toUpperCase() },
    { id: 'petrol', name: t.pumps.petrol.toUpperCase() },
    { id: 'diesel', name: t.pumps.diesel.toUpperCase() }
  ], [t]);

  // 🛰️ GEOLOCATION INTELLIGENCE: Capture user's live position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Geolocation denied", error)
      );
    }
  }, []);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 5,
        category: activeCategory !== 'all' ? activeCategory : undefined,
        lat: coords?.lat,
        lng: coords?.lng
      };
      
      let response;
      if (coords?.lat && coords?.lng) {
        response = await stationService.getNearbyStations(coords.lat, coords.lng, 10);
        if (Array.isArray(response)) {
          response = response.slice(0, 5);
        }
      } else {
        response = await stationService.getAllStations(params);
      }
      
      let liveStations = [];
      if (Array.isArray(response)) {
        liveStations = response;
      } else if (response && response.stations && Array.isArray(response.stations)) {
        liveStations = response.stations;
      }

      setStations(liveStations);
    } catch (error) {
      console.error('Data link failed', error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [activeCategory, coords]);


  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-2 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t.pumps.title}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.pumps.subtitle}</p>
        </div>
        <button onClick={() => navigate('/map')} className="text-amber-600 font-black text-[10px] md:text-xs uppercase tracking-widest hover:underline flex items-center gap-1.5 group transition-all">
          {t.pumps.viewMap} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-4 md:pb-6 scrollbar-hide px-2">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeCategory === cat.id 
              ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' 
              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      
      <div className="space-y-3 md:space-y-4 px-2">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <StationCardSkeleton key={i} />)}
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 md:space-y-4">
              {stations.length > 0 ? stations.map((pump) => {
                const fuelInfo = pump?.fuels?.find(f => f.type === (activeCategory === 'all' ? pump?.primaryCategory : activeCategory)) || pump?.fuels?.[0];
                
                return (
                  <motion.div 
                    key={pump?._id} 
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/stations/${pump?._id}`)}
                    className="bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-1 md:w-1.5 h-full ${
                      pump?.status === 'available' ? 'bg-emerald-500' : pump?.status === 'limited' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>

                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-amber-500 transition-all duration-300">
                          <Fuel size={isMobile ? 18 : 20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors leading-tight">{pump?.name}</h3>
                            {pump?.verified && <Verified size={14} className="text-blue-500 flex-shrink-0" />}
                          </div>
                          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1 line-clamp-1">
                            <MapPin size={10} className="text-slate-300" /> {pump?.location?.subArea}, {pump?.location?.city}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-sm ${
                        pump?.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        pump?.status === 'limited' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {pump?.status === 'available' ? t.pumps.available.toUpperCase() : pump?.status === 'limited' ? t.pumps.limited.toUpperCase() : t.pumps.out.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[7px] md:text-[8px] uppercase font-black text-slate-300 tracking-[0.2em] mb-0.5">
                           {fuelInfo?.type || 'FUEL'}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base md:text-lg font-black text-slate-900">৳ {fuelInfo?.price || '0'}</span>
                          <span className="text-[8px] font-bold text-slate-400">/L</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                         <div className="flex items-center gap-1.5">
                           {coords?.lat && coords?.lng && pump?.location?.coordinates && (
                             <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${pump.location.coordinates.lat},${pump.location.coordinates.lng}`, '_blank');
                                }}
                                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg cursor-pointer transition-colors"
                             >
                                <Navigation size={9} className="text-blue-500" />
                                <span className="text-[9px] md:text-[10px] font-black text-blue-700">
                                  {getDistance(coords.lat, coords.lng, pump.location.coordinates.lat, pump.location.coordinates.lng)}
                                </span>
                             </div>
                           )}
                           <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg">
                              <Star size={9} className="text-amber-500" fill="currentColor" />
                              <span className="text-[9px] md:text-[10px] font-black text-amber-700">{pump?.rating || '4.5'}</span>
                           </div>
                         </div>
                         <p className="text-[8px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                           <Clock size={8} className="text-slate-300" /> {formatTimeAgo(pump?.updatedAt, t)}
                         </p>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="py-10 text-center opacity-30">
                  <p className="text-xs font-black uppercase tracking-widest">No local stations detected</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <button 
        onClick={() => navigate('/stations')} 
        className="w-full py-5 mt-8 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 font-black text-xs uppercase tracking-[0.4em] hover:text-amber-600 hover:border-amber-200 hover:bg-white transition-all shadow-inner active:scale-[0.98]"
      >
        {t.pumps.seeAll}
      </button>
    </div>
  );
};

export default React.memo(PumpList);
