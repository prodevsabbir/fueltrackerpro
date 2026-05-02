import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, MapPin, Star, Send, User, ShieldCheck, CheckCircle2, XCircle, ExternalLink, Navigation, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { stationService } from '../../../helpers/stationService';
import { authService } from '../../../helpers/authService';
import { toast } from 'react-toastify';

const StationDetails = ({ station, onBack }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [isOverprice, setIsOverprice] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [posting, setPosting] = useState(false);
  const currentUser = authService.getCurrentUser();

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await stationService.getReviewsByStation(station._id);
      if (response.status === 'ok') {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (station?._id) {
      fetchReviews();
    }
  }, [station?._id]);

  const handlePost = async () => {
    if (!currentUser) {
      toast.info('Please login to post a review');
      return;
    }
    if (!comment.trim()) return;
    
    setPosting(true);
    try {
      // 📡 PURE DATABASE TRANSMISSION
      const response = await stationService.createReview(station._id, 5, comment, isOverprice);
      if (response.status === 'ok') {
        toast.success('Feedback posted to network!');
        setComment('');
        setIsOverprice(false);
        fetchReviews(); // Refresh from DB
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post review');
    } finally {
      setPosting(false);
    }
  };

  const viewOnInternalMap = () => {
    const { coordinates } = station.location;
    if (coordinates && coordinates.lat && coordinates.lng) {
      // Navigate to internal map and pass coordinates via state
      navigate('/map', { 
        state: { 
          center: [coordinates.lat, coordinates.lng],
          zoom: 18,
          selectedStationId: station._id
        } 
      });
    } else {
      toast.warn('Coordinates not available');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "Just now";
    const diff = Math.floor((new Date() - new Date(isoString)) / (1000 * 60));
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold text-xs md:text-sm transition-all">
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Stations</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className={`status-pill px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
          station.status === 'available' ? 'pill-available' : station.status === 'limited' ? 'pill-limited' : 'pill-out'
        }`}>
          {station.status}
        </div>
      </div>

      <div className="p-6 md:p-10">
        {/* Station Identity */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div className="flex gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 shrink-0">
              <Fuel size={32} />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{station.name}</h2>
              <div className="flex flex-col gap-1 mt-2">
                 <p className="text-slate-500 font-black text-xs md:text-base flex items-center gap-2">
                   <MapPin size={18} className="text-amber-500" /> 
                   {station.location.address}, {station.location.subArea}, {station.location.city}
                 </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={viewOnInternalMap}
            className="w-full md:w-auto bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10"
          >
            <Navigation size={18} className="text-amber-500" />
            View on Map
          </button>
        </div>

        {/* Fuel Categories Section */}
        <div className="mb-12">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <CheckCircle2 size={18} className="text-emerald-500" />
            CATEGORIES & PRICING
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {station.fuels.map(fuel => (
               <div key={fuel._id || fuel.type} className={`p-6 rounded-3xl border transition-all ${
                 fuel.status === 'available' ? 'bg-white border-slate-100 shadow-sm' : 
                 fuel.status === 'limited' ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-200 opacity-60'
               }`}>
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{fuel.type}</span>
                     {fuel.status === 'available' ? (
                       <CheckCircle2 size={16} className="text-emerald-500" />
                     ) : fuel.status === 'limited' ? (
                       <Star size={16} className="text-amber-500" fill="currentColor" />
                     ) : (
                       <XCircle size={16} className="text-slate-300" />
                     )}
                  </div>
                  <div className="flex flex-col">
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">৳ {fuel.price}</span>
                        <span className="text-[10px] font-bold text-slate-400">/Ltr</span>
                     </div>
                     <span className={`text-[9px] font-black uppercase mt-2 px-2 py-1 rounded-lg w-fit ${
                       fuel.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 
                       fuel.status === 'limited' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                     }`}>
                        {fuel.status}
                     </span>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Rider Feedback Section - PREMUM ADAPTIVE */}
        <div className="border-t border-slate-100 pt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
              <Star size={24} className="text-amber-500" fill="currentColor" />
              Rider Feedback
            </h3>
            
            {/* Overprice Tactical Toggle */}
            <button 
              onClick={() => setIsOverprice(!isOverprice)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                isOverprice 
                ? 'bg-red-50 border-red-500 text-red-600 shadow-lg shadow-red-500/10' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              <ShieldCheck size={14} className={isOverprice ? 'animate-pulse' : ''} />
              {isOverprice ? 'Reported: Extra Money' : 'Report Overpricing?'}
            </button>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 mb-10 shadow-2xl shadow-slate-100/50 flex flex-col gap-6 focus-within:ring-4 ring-amber-500/5 transition-all">
             <textarea 
               value={comment} 
               onChange={(e) => setComment(e.target.value)} 
               placeholder="There is taking extra money or other details..." 
               className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm md:text-base font-medium text-slate-700 resize-none h-32 md:h-40" 
             />
             <div className="flex justify-end pt-4 border-t border-slate-50">
                <button 
                  onClick={handlePost} 
                  disabled={posting || !comment.trim()}
                  className="bg-[#1e293b] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/20 disabled:opacity-50"
                >
                  {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={18} className="text-amber-500" />}
                  Post Feedback
                </button>
             </div>
          </div>
          
          {/* Feedback Stream */}
          <div className="space-y-6">
            {loadingReviews ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : reviews.length > 0 ? (
              reviews.map(c => (
                <div 
                  key={c._id} 
                  className={`p-6 md:p-8 rounded-[32px] border transition-all ${
                    c.isOverprice 
                    ? 'bg-red-50/30 border-red-100 shadow-md ring-1 ring-red-500/5' 
                    : 'bg-white border-slate-50 shadow-sm'
                  } flex flex-col gap-4 hover:border-slate-200`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                         <User size={20} />
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 tracking-tight">{c.userName || 'Anonymous Rider'}</span>
                            {c.isVerified && <ShieldCheck size={14} className="text-blue-500" />}
                         </div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{formatTime(c.createdAt)}</span>
                      </div>
                    </div>

                    {c.isOverprice && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-500/20 animate-pulse">
                         <XCircle size={10} />
                         Overprice Alert
                      </div>
                    )}
                  </div>
                  <p className={`text-sm md:text-base font-bold leading-relaxed ${c.isOverprice ? 'text-red-900' : 'text-slate-600'}`}>
                    {c.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <p className="text-sm md:text-base font-black uppercase tracking-[0.4em] text-slate-400 text-center">NO FEEDBACK YET. BE THE FIRST!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetails;
