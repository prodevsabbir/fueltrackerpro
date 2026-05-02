import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Star, Trash2, ChevronLeft, ChevronRight, MessageSquare, MapPin } from 'lucide-react';
import { adminService } from '../../../helpers/adminService';
import { toast } from 'react-toastify';
import { PageBtn } from './SharedAdminUI';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [rating, setRating] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllReviews({ 
        limit: 10,
        page,
        rating: rating !== 'all' ? rating : undefined
      });
      setReviews(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [rating, page]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [rating]);

  const handleDeleteReview = async (id) => {
    // Simulated delete for now (could connect to a deleteReview endpoint later)
    if (window.confirm('Are you sure you want to delete this review?')) {
      toast.info('Review deletion requested. (Endpoint pending)');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Toolbar */}
      <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
         <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500">
            <span className="uppercase tracking-widest text-[9px] font-black">Filter Rating:</span>
            <select value={rating} onChange={(e) => setRating(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] md:text-xs font-bold text-slate-700 outline-none flex-1 md:flex-none">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Review Content</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan="5" className="py-16 text-center"><Loader2 className="animate-spin text-amber-500 mx-auto" /></td></tr>
              ) : reviews.length > 0 ? reviews.map(review => (
                <tr key={review._id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-black overflow-hidden border border-amber-200 shadow-sm shrink-0">
                        {review.userId?.profileImage?.secure_url ? (
                          <img src={review.userId.profileImage.secure_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          review.userId?.name?.[0]?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-slate-900 text-xs truncate leading-tight">{review.userId?.name || 'Unknown User'}</span>
                        <span className="text-[9px] text-slate-400 font-normal truncate mt-0.5">{review.userId?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                     <p className="font-black text-slate-900 text-xs truncate max-w-[150px] leading-tight">{review.stationId?.name || 'Unknown Station'}</p>
                     <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest mt-0.5">
                       <MapPin size={8} /> {review.stationId?.location?.subArea || 'N/A'}
                     </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-slate-500 max-w-xs truncate font-medium">
                      {review.comment || 'No comment provided'}
                    </p>
                    <span className="text-[8px] text-slate-400 mt-0.5 block">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-amber-500 text-[10px] font-black bg-amber-50 px-2 py-0.5 rounded-md w-fit mx-auto border border-amber-100">
                      <Star size={10} fill="currentColor" /> {review.rating || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="py-16 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No reviews found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="py-14 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>
          ) : reviews.length === 0 ? (
            <p className="py-14 text-center text-slate-400 text-[10px] font-black uppercase">No reviews found</p>
          ) : reviews.map(review => (
            <div key={review._id} className="p-3 flex items-start gap-3">
               <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-black overflow-hidden border border-amber-200 shrink-0">
                  {review.userId?.profileImage?.secure_url ? <img src={review.userId.profileImage.secure_url} alt="" className="w-full h-full object-cover" /> : (review.userId?.name?.[0]?.toUpperCase() || 'U')}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                     <div className="min-w-0">
                        <p className="font-black text-slate-900 text-xs leading-tight truncate">{review.userId?.name || 'Unknown User'}</p>
                        <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5">{review.userId?.email || 'N/A'}</p>
                     </div>
                     <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 shrink-0">
                        <Star size={10} fill="currentColor" /> {review.rating || 0}
                     </div>
                  </div>
                  
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                     <p className="text-[10px] font-black text-slate-700 truncate">{review.stationId?.name || 'Unknown Station'}</p>
                     <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{review.comment || 'No comment provided'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                     <span className="text-[8px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                     <button onClick={() => handleDeleteReview(review._id)} className="p-1.5 border border-slate-200 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 size={11} />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
              {reviews.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
           </span>
           <div className="flex items-center gap-1 mx-auto sm:mx-0">
              <button disabled={meta.page <= 1} onClick={() => setPage(p => p - 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30">
                 <ChevronLeft size={13} />
              </button>
              {[...Array(Math.min(meta.totalPages || 1, 5))].map((_, i) => (
                 <PageBtn key={i} active={meta.page === i + 1} onClick={() => setPage(i + 1)} label={(i + 1).toString()} />
              ))}
              <button disabled={meta.page >= meta.totalPages} onClick={() => setPage(p => p + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30">
                 <ChevronRight size={13} />
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageReviews;
