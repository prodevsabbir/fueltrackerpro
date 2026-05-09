import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, MapPin, Star, Send, User, ShieldCheck, CheckCircle2, XCircle, ExternalLink, Navigation, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { stationService } from '../../../helpers/stationService';
import { authService } from '../../../helpers/authService';
import { toast } from 'react-toastify';
import { formatTimeAgo } from '../../../helpers/dateUtils';

const StationDetails = ({ station, onBack }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [isOverprice, setIsOverprice] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedIssues, setSelectedIssues] = useState([]);
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
    if (userRating === 0) {
      toast.warn('Please select a star rating before submitting.');
      return;
    }
    
    setPosting(true);
    try {
      const response = await stationService.createReview(
        station._id, 
        userRating, 
        comment, 
        selectedIssues.includes('Overpricing'),
        selectedIssues
      );
      if (response.status === 'ok') {
        toast.success('Feedback posted to network!');
        setComment('');
        setIsOverprice(false);
        setSelectedIssues([]);
        setUserRating(0);
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post review');
    } finally {
      setPosting(false);
    }
  };

  const viewOnMap = () => {
    const { coordinates } = station.location;
    if (coordinates && coordinates.lat && coordinates.lng) {
      if (navigator.geolocation) {
        toast.info("Calculating optimal route...", { autoClose: 1500 });
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${coordinates.lat},${coordinates.lng}`, '_blank');
          },
          (error) => {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`, '_blank');
          }
        );
      } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`, '_blank');
      }
    } else {
      toast.warn('Coordinates not available for this station');
    }
  };


  const handleVote = async (reviewId, type) => {
    try {
      const response = await stationService.voteReview(reviewId, type);
      if (response.status === 'ok') {
        setReviews(prev => prev.map(r => r._id === reviewId ? response.data : r));
        toast.success(type === 'up' ? 'Confidence verified' : 'Report marked as doubtful', {
          position: "bottom-right",
          autoClose: 2000,
          theme: "dark"
        });
      }
    } catch (error) {
      console.error('Voting failed', error);
      toast.error('Sign in required to verify intelligence', {
        position: "bottom-right",
        theme: "dark"
      });
    }
  };

  const calculateTrust = (report) => {
    const up = report.upvotes?.length || 0;
    const down = report.downvotes?.length || 0;
    if (up + down === 0) return 100;
    return Math.round((up / (up + down)) * 100);
  };

  const getAggregateTrust = () => {
    if (reviews.length === 0) return 100;
    const totalTrust = reviews.reduce((acc, r) => acc + calculateTrust(r), 0);
    return Math.round(totalTrust / reviews.length);
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold text-xs md:text-sm transition-all">
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">{t.pumps.back}</span>
          <span className="sm:hidden">{t.pumps.prev}</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{getAggregateTrust()}% {t.pumps.trustScore}</span>
          </div>
          <div className={`status-pill px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            station.status === 'available' ? 'pill-available' : station.status === 'limited' ? 'pill-limited' : 'pill-out'
          }`}>
            {station.status === 'available' ? t.pumps.available.toUpperCase() : station.status === 'limited' ? t.pumps.limited.toUpperCase() : t.pumps.out.toUpperCase()}
          </div>
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
            onClick={viewOnMap}
            className="w-full md:w-auto bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10"
          >
            <Navigation size={18} className="text-amber-500" />
            {t.pumps.viewMap}
          </button>
        </div>

        {/* Fuel Categories Section */}
        <div className="mb-12">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <CheckCircle2 size={18} className="text-emerald-500" />
            {t.pumps.categories.toUpperCase()} & {t.pumps.pricing.toUpperCase()}
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
                        <span className="text-[10px] font-bold text-slate-400">{t.pumps.unit}</span>
                     </div>
                     <span className={`text-[9px] font-black uppercase mt-2 px-2 py-1 rounded-lg w-fit ${
                       fuel.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 
                       fuel.status === 'limited' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                     }`}>
                        {fuel.status === 'available' ? t.pumps.available.toUpperCase() : fuel.status === 'limited' ? t.pumps.limited.toUpperCase() : t.pumps.out.toUpperCase()}
                     </span>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Rider Feedback Section */}
        <div className="border-t border-slate-100 pt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Star size={28} className="text-amber-500" fill="currentColor" />
                {t.pumps.feedback}
              </h3>
              {reviews.length > 0 && (() => {
                const avg = (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1);
                return (
                  <div className="flex items-center gap-3 ml-1">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} className={s <= Math.round(avg) ? 'text-amber-400' : 'text-slate-200'} fill={s <= Math.round(avg) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-amber-500">{avg}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-2">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="flex flex-wrap md:justify-end gap-2 max-w-full md:max-w-[60%]">
              {[
                { id: 'Overpricing', label: t.reports.overprice, icon: <XCircle size={14} /> },
                { id: 'Long Queue', label: t.reports.queue, icon: <Navigation size={14} /> },
                { id: 'Bad Behavior', label: t.reports.behavior, icon: <User size={14} /> },
                { id: 'Short Measure', label: t.reports.measure, icon: <Fuel size={14} /> },
                { id: 'Fuel Out', label: t.reports.out, icon: <XCircle size={14} /> },
              ].map(issue => (
                <button 
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssues(prev => 
                      prev.includes(issue.id) ? prev.filter(i => i !== issue.id) : [...prev, issue.id]
                    );
                    if (issue.id === 'Overpricing') setIsOverprice(!isOverprice);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 shadow-sm ${
                    selectedIssues.includes(issue.id)
                    ? 'bg-red-50 border-red-500 text-red-600 shadow-red-100 scale-105' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {issue.icon}
                  {issue.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 mb-10 shadow-2xl shadow-slate-100/50 flex flex-col gap-4 focus-within:ring-4 ring-amber-500/5 transition-all">
             <div className="flex flex-col gap-2">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Rating</span>
               <div className="flex items-center gap-1.5">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     type="button"
                     onClick={() => setUserRating(star)}
                     onMouseEnter={() => setHoverRating(star)}
                     onMouseLeave={() => setHoverRating(0)}
                     className="transition-transform hover:scale-125 active:scale-110"
                   >
                     <Star
                       size={28}
                       className={`transition-colors ${
                         star <= (hoverRating || userRating)
                           ? 'text-amber-400'
                           : 'text-slate-200'
                       }`}
                       fill={star <= (hoverRating || userRating) ? 'currentColor' : 'none'}
                     />
                   </button>
                 ))}
                 {userRating > 0 && (
                   <span className="ml-2 text-xs font-black text-amber-500">
                     {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][userRating]}
                   </span>
                 )}
               </div>
             </div>

             <div className="w-full h-px bg-slate-50" />

             <textarea 
               value={comment} 
               onChange={(e) => setComment(e.target.value)} 
               placeholder={t.pumps.placeholder} 
               className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm md:text-base font-medium text-slate-700 resize-none h-24 md:h-32" 
             />
             <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  {userRating > 0 ? `${userRating} star${userRating > 1 ? 's' : ''} selected` : 'Select stars above'}
                </span>
                <button 
                  onClick={handlePost} 
                  disabled={posting || !comment.trim() || userRating === 0}
                  className="bg-[#1e293b] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/20 disabled:opacity-50"
                >
                  {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={18} className="text-amber-500" />}
                  {t.pumps.post}
                </button>
             </div>
          </div>
          
          <div className="space-y-6">
            {loadingReviews ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : reviews.length > 0 ? (
              reviews.map(c => {
                const trustRate = calculateTrust(c);
                return (
                  <div 
                    key={c._id} 
                    className={`p-6 md:p-8 rounded-[32px] border transition-all ${
                      c.isOverprice 
                      ? 'bg-red-50/30 border-red-100 shadow-md ring-1 ring-red-500/5' 
                      : 'bg-white border-slate-50 shadow-sm'
                    } flex flex-col gap-4 hover:border-slate-200`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner shrink-0">
                           <User size={20} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900 tracking-tight">{c.userName || 'Anonymous Rider'}</span>
                              {c.isVerified && <ShieldCheck size={14} className="text-blue-500" />}
                           </div>
                           <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-0.5">
                                 {[1,2,3,4,5].map(s => (
                                   <Star key={s} size={10} className={s <= (c.rating || 0) ? 'text-amber-400' : 'text-slate-200'} fill={s <= (c.rating || 0) ? 'currentColor' : 'none'} />
                                 ))}
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none border-l border-slate-100 pl-2">{formatTimeAgo(c.createdAt, t)}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 sm:justify-end">
                        {c.reportedIssues && c.reportedIssues.length > 0 && c.reportedIssues.map((issue, idx) => (
                          <div key={idx} className="bg-red-500 text-white px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-500/10">
                            <XCircle size={8} />
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className={`text-sm md:text-base font-bold leading-relaxed ${c.isOverprice ? 'text-red-900' : 'text-slate-600'}`}>
                      "{c.comment}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50/50">
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleVote(c._id, 'up')}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                              c.upvotes?.includes(currentUser?._id) ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'
                            }`}
                          >
                             <ThumbsUp size={14} /> Confirm
                          </button>
                          <button 
                            onClick={() => handleVote(c._id, 'down')}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                              c.downvotes?.includes(currentUser?._id) ? 'text-red-600' : 'text-slate-400 hover:text-red-500'
                            }`}
                          >
                             <ThumbsDown size={14} /> False
                          </button>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-500 ${trustRate > 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${trustRate}%` }}></div>
                          </div>
                          <span className={`text-[10px] font-black ${trustRate > 50 ? 'text-emerald-600' : 'text-red-600'}`}>{trustRate}% TRUST</span>
                       </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <p className="text-sm md:text-base font-black uppercase tracking-[0.4em] text-slate-400 text-center">{t.pumps.noFeedback.toUpperCase()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetails;
