import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ThumbsUp, ThumbsDown, User, ShieldCheck, MessageSquare, Loader2, Navigation } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { stationService } from '../../../helpers/stationService';
import { toast } from 'react-toastify';
import { formatTimeAgo } from '../../../helpers/dateUtils';

const UserReports = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await stationService.getAllReviews({ limit: 4 });
      if (response.status === 'ok') {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch intelligence reports', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);


  const handleVote = async (reviewId, type) => {
    try {
      const response = await stationService.voteReview(reviewId, type);
      if (response.status === 'ok') {
        setReports(prev => prev.map(r => r._id === reviewId ? response.data : r));
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

  return (
    <section className="mt-12 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={24} />
            {t.reports.title}
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{t.reports.desc}</p>
        </div>
        <button className="bg-amber-500 text-black px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
          <MessageSquare size={18} />
          {t.reports.btn}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
          ))
        ) : reports.length > 0 ? reports.map((report) => {
          const trustRate = calculateTrust(report);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={report._id} 
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-amber-500 transition-all">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                         <span className="text-sm font-bold text-slate-900">{report.userName || report.userId?.name || 'Anonymous'}</span>
                         {report.isVerified && <ShieldCheck size={12} className="text-emerald-500" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {formatTimeAgo(report.createdAt, t)}
                      </span>
                    </div>
                  </div>
                  {report.isOverprice && (
                    <div className="bg-red-50 text-red-500 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse">
                      {t.reports.fraud}
                    </div>
                  )}
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  "{report.comment}"
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Station:</span>
                   <button 
                     onClick={() => report.stationId?._id && navigate(`/stations/${report.stationId._id}`)}
                     className="text-[9px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-500 transition-colors"
                   >
                     {report.stationId?.name || 'Unknown'}
                   </button>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleVote(report._id, 'up')}
                    className={`flex items-center gap-1.5 text-[10px] font-black transition-colors uppercase tracking-widest ${
                      currentUser && report.upvotes?.some(id => id.toString() === currentUser._id.toString()) ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'
                    }`}
                  >
                    <ThumbsUp size={12} /> {t.reports.confirm}
                  </button>
                  <button 
                    onClick={() => handleVote(report._id, 'down')}
                    className={`flex items-center gap-1.5 text-[10px] font-black transition-colors uppercase tracking-widest ${
                      currentUser && report.downvotes?.some(id => id.toString() === currentUser._id.toString()) ? 'text-red-600' : 'text-slate-400 hover:text-red-500'
                    }`}
                  >
                    <ThumbsDown size={12} /> False
                  </button>
                </div>
                <div className="flex items-center gap-1">
                   <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${trustRate > 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${trustRate}%` }}></div>
                   </div>
                   <span className={`text-[9px] font-black ${trustRate > 50 ? 'text-emerald-600' : 'text-red-600'}`}>{trustRate}% {t.reports.trust}</span>
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full py-10 text-center opacity-30 bg-white border border-dashed border-slate-200 rounded-2xl">
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">No community intelligence gathered yet</p>
          </div>
        )}
      </div>

      {reports.length > 0 && (
        <div className="mt-10 flex justify-center">
           <button 
             onClick={() => navigate('/intel')}
             className="group bg-white border-2 border-slate-100 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm flex items-center gap-3 active:scale-95"
           >
             SEE ALL COMMUNITY REPORTS
             <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Navigation size={12} className="rotate-90" />
             </div>
           </button>
        </div>
      )}
    </section>
  );
};

export default UserReports;
