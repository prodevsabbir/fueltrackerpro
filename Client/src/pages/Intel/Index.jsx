import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  ShieldCheck, 
  Navigation, 
  Loader2, 
  ChevronDown,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { stationService } from '../../helpers/stationService';
import { formatTimeAgo } from '../../helpers/dateUtils';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const IntelPage = () => {
  const { t, lang } = useLanguage();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, overprice, verified
  const [sortBy, setSortBy] = useState('latest'); // latest, nearest, trust
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Search Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 2000); // 2 seconds debounce
    return () => clearTimeout(timer);
  }, [search]);

  const fetchReports = async (isNewSearch = false) => {
    setLoading(true);
    try {
      const params = {
        page: isNewSearch ? 1 : page,
        limit: 12,
        search: debouncedSearch,
        sortBy
      };

      if (filter === 'overprice') params.isOverprice = true;
      if (filter === 'verified') params.isVerified = true;
      
      if (sortBy === 'nearest' && userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const response = await stationService.getAllReviews(params);
      if (response.status === 'ok') {
        setReports(response.data);
        setMeta(response.meta);
        if (isNewSearch) setPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch intelligence', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, filter, sortBy, debouncedSearch]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchReports(true);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          handleSortChange('nearest');
          toast.success('Location synchronized for nearest intel');
        },
        () => {
          toast.error('Location permission denied');
        }
      );
    }
  };

  const handleVote = async (reviewId, type) => {
    if (!currentUser) {
      toast.info('Please login to verify intelligence');
      return;
    }
    try {
      const response = await stationService.voteReview(reviewId, type);
      if (response.status === 'ok') {
        setReports(prev => prev.map(r => r._id === reviewId ? response.data : r));
      }
    } catch (error) {
      console.error('Voting failed', error);
    }
  };

  const calculateTrust = (report) => {
    const up = report.upvotes?.length || 0;
    const down = report.downvotes?.length || 0;
    if (up + down === 0) return 100;
    return Math.round((up / (up + down)) * 100);
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-20 px-4 md:px-6 max-w-7xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="mb-10 mt-4 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
             <div className='flex justify-center items-center  gap-3'>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                {t.reports.title}
             </h1>
             <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-amber-500/20 shadow-sm animate-pulse">
                <Zap size={14} className="fill-current" />
                Live Community Intel
             </div>
             </div>
             <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">
                {t.reports.desc}
             </p>
          </div>
          
          <div className="flex flex-col gap-3">
             <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search station, area or city..."
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
             </form>
          </div>
        </motion.div>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full lg:w-auto no-scrollbar">
           {[
             { id: 'all', label: t.reports.all, icon: <AlertCircle size={14} /> },
             { id: 'overprice', label: t.reports.fraud, icon: <AlertCircle size={14} className="text-red-500" /> },
             { id: 'verified', label: t.reports.verified, icon: <ShieldCheck size={14} className="text-blue-500" /> },
           ].map(item => (
             <button 
               key={item.id}
               onClick={() => handleFilterChange(item.id)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                 filter === item.id 
                 ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20' 
                 : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
               }`}
             >
               {item.icon}
               {item.label}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
           <div className="relative group w-full lg:w-48">
              <select 
                value={sortBy}
                onChange={(e) => {
                  if (e.target.value === 'nearest' && !userLocation) {
                    requestLocation();
                  } else {
                    handleSortChange(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-white border-2 border-slate-100 rounded-xl px-5 py-3 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:border-amber-500 outline-none cursor-pointer shadow-sm"
              >
                 <option value="latest">{t.reports.latest}</option>
                 <option value="nearest">{t.reports.nearest}</option>
                 <option value="trust">{t.reports.highestTrust}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
           </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={`skeleton-${i}`} 
              className="h-[280px] md:h-[320px] bg-white border border-slate-100 rounded-2xl md:rounded-[32px] animate-pulse"
            ></div>
          ))
        ) : reports.length > 0 ? (
          reports.map((report, idx) => {
            const trustRate = calculateTrust(report);
            return (
              <div 
                key={report._id} 
                className={`bg-white border transition-all overflow-hidden rounded-2xl md:rounded-[32px] group hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col h-full ${
                  report.isOverprice ? 'border-red-100 ring-1 ring-red-500/5' : 'border-slate-50'
                }`}
              >
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-amber-500 transition-all border border-slate-100 shadow-inner">
                        <User size={20} className="md:w-[22px] md:h-[22px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                           <span className="text-xs md:text-sm font-black text-slate-900">{report.userName || report.userId?.name || 'Anonymous'}</span>
                           {report.isVerified && <ShieldCheck size={12} className="text-blue-500 md:w-3.5 md:h-3.5" />}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <Clock size={8} className="md:w-2.5 md:h-2.5" />
                           <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                             {formatTimeAgo(report.createdAt, t)}
                           </span>
                        </div>
                      </div>
                    </div>
                    {report.isOverprice && (
                      <div className="bg-red-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">
                        {t.reports.fraud}
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs md:text-sm font-bold leading-relaxed mb-4 md:mb-6 italic min-h-[2.5rem] md:min-h-[3rem] flex-1">
                    "{report.comment}"
                  </p>

                  <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-between group-hover:bg-amber-50 group-hover:border-amber-100 transition-all">
                     <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">Station Details</span>
                        <h4 className="text-[10px] md:text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">
                          {report.stationId?.name || 'Unknown Station'}
                        </h4>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 truncate">
                          {report.stationId?.location?.subArea}, {report.stationId?.location?.city}
                        </p>
                     </div>
                     <button 
                       onClick={() => report.stationId?._id && navigate(`/stations/${report.stationId._id}`)}
                       className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white border border-slate-100 flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm shrink-0"
                     >
                       <Navigation size={14} className="md:w-4 md:h-4" />
                     </button>
                  </div>
                </div>
                
                <div className="px-4 md:px-6 py-3 md:py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-5">
                    <button 
                      onClick={() => handleVote(report._id, 'up')}
                      className={`flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black transition-all uppercase tracking-widest ${
                        currentUser && report.upvotes?.some(id => id.toString() === currentUser._id.toString()) 
                        ? 'text-emerald-600 scale-110' 
                        : 'text-slate-400 hover:text-emerald-500'
                      }`}
                    >
                      <ThumbsUp size={12} className="md:w-3.5 md:h-3.5" /> 
                      <span className="hidden sm:inline">{t.reports.confirm}</span>
                      <span className="text-[7px] md:text-[8px] opacity-60">({report.upvotes?.length || 0})</span>
                    </button>
                    <button 
                      onClick={() => handleVote(report._id, 'down')}
                      className={`flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black transition-all uppercase tracking-widest ${
                        currentUser && report.downvotes?.some(id => id.toString() === currentUser._id.toString()) 
                        ? 'text-red-600 scale-110' 
                        : 'text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <ThumbsDown size={12} className="md:w-3.5 md:h-3.5" /> 
                      <span className="hidden sm:inline">False</span>
                      <span className="text-[7px] md:text-[8px] opacity-60">({report.downvotes?.length || 0})</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className={`text-[8px] md:text-[9px] font-black tracking-widest uppercase ${trustRate > 50 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trustRate}% {t.reports.trust}
                     </span>
                     <div className="w-12 md:w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${trustRate > 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${trustRate}%` }}></div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 md:py-32 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-100 rounded-2xl md:rounded-[40px] opacity-60">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                <Search size={32} className="md:w-10 md:h-10" />
             </div>
             <p className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-slate-400 text-center px-4">{t.reports.noResults}</p>
             <button 
               onClick={() => { setSearch(''); setFilter('all'); fetchReports(true); }}
               className="mt-6 text-amber-600 font-black text-xs uppercase tracking-widest hover:underline"
             >
               {t.reports.clearFilters}
             </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="mt-12 md:mt-16 flex flex-wrap justify-center items-center gap-2">
           <button 
             disabled={page === 1}
             onClick={() => setPage(p => p - 1)}
             className="w-10 h-10 md:w-auto md:px-5 md:py-3 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 flex items-center justify-center"
           >
             <span className="hidden md:inline">Prev</span>
             <span className="md:hidden">←</span>
           </button>
           
           <div className="flex items-center gap-1.5 md:gap-2">
              {(() => {
                const pages = [];
                const maxVisible = 5;
                if (meta.totalPages <= maxVisible) {
                  for (let i = 1; i <= meta.totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push('...');
                  const start = Math.max(2, page - 1);
                  const end = Math.min(meta.totalPages - 1, page + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (page < meta.totalPages - 2) pages.push('...');
                  pages.push(meta.totalPages);
                }
                
                return pages.map((p, idx) => p === '...' ? (
                  <span key={`dots-${idx}`} className="px-2 text-slate-300 font-black">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                      page === p 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                      : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}
           </div>

           <button 
             disabled={page === meta.totalPages}
             onClick={() => setPage(p => p + 1)}
             className="w-10 h-10 md:w-auto md:px-5 md:py-3 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 flex items-center justify-center"
           >
             <span className="hidden md:inline">Next</span>
             <span className="md:hidden">→</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default IntelPage;
