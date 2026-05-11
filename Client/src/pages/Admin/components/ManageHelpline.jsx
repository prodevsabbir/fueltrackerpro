import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, User, Mail, Phone, Clock, 
  CheckCircle2, AlertCircle, Send, Search, Filter, Loader2,
  Trash2, X, ChevronLeft, ChevronRight, Activity, ShieldCheck, 
  MessageSquare, Eye, RefreshCw
} from 'lucide-react';
import { helplineService } from '../../../helpers/helplineService';
import { useLanguage } from '../../../context/LanguageContext';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { StatCardSkeleton, TableSkeleton } from './Skeleton';
import { PageBtn } from './SharedAdminUI';
import ConfirmationModal from './ConfirmationModal';

const statusStyle = (s) => {
  if (s === 'resolved') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (s === 'pending')  return 'text-amber-600 bg-amber-50 border-amber-100';
  return 'text-blue-600 bg-blue-50 border-blue-100';
};

const ManageHelpline = () => {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });
  const limit = 10;

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await helplineService.getAllRequests();
      if (response.status === 'ok') {
        setRequests(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch help requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000');
    
    socket.on('new_helpline_request', (newReq) => {
      setRequests(prev => [newReq, ...prev]);
      toast.info(`New help request from ${newReq.name}!`, {
        icon: <HelpCircle className="text-amber-500" size={16} />
      });
    });

    socket.on('helpline_resolved', (updatedReq) => {
      setRequests(prev => prev.map(r => r._id === updatedReq.id ? { ...r, status: updatedReq.status, adminReply: updatedReq.reply } : r));
    });

    return () => socket.disconnect();
  }, []);

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setUpdating(true);
    try {
      const response = await helplineService.updateRequest(id, {
        adminReply: replyText,
        status: 'resolved'
      });
      if (response.status === 'ok') {
        toast.success('Reply submitted and marked as resolved');
        setRequests(prev => prev.map(r => r._id === id ? response.data : r));
        setSelectedRequest(null);
        setReplyText('');
      }
    } catch (error) {
      toast.error('Failed to update request');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await helplineService.deleteRequest(confirmDialog.id);
      toast.success('Request deleted successfully');
      setRequests(prev => prev.filter(r => r._id !== confirmDialog.id));
      setConfirmDialog({ isOpen: false, id: null });
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedRequests = filteredRequests.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredRequests.length / limit);

  const openModal = (req, viewOnly = false) => {
    setSelectedRequest(req);
    setIsViewOnly(viewOnly);
    setReplyText(req.adminReply || '');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading && requests.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : [
          { label: t.admin.total,      value: stats.total,      icon: HelpCircle,    bg: 'bg-slate-900' },
          { label: t.admin.resolved,   value: stats.resolved,   icon: ShieldCheck,   bg: 'bg-emerald-500' },
          { label: t.admin.pending,    value: stats.pending,    icon: Clock,         bg: 'bg-amber-500' },
          { label: t.admin.inProgress, value: stats.inProgress, icon: Activity,      bg: 'bg-blue-500' },
        ].map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{value}</p>
            </div>
            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center ${bg} shadow-lg`}>
              <Icon size={16} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t.admin.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
          >
            <option value="all">{t.admin.allStatus}</option>
            <option value="pending">{t.admin.pending.toUpperCase()}</option>
            <option value="in-progress">{t.admin.inProgress.toUpperCase()}</option>
            <option value="resolved">{t.admin.resolved.toUpperCase()}</option>
          </select>
          <button 
            onClick={fetchRequests}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">{t.admin.userInfo}</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4">{t.admin.subjectMessage}</th>
                <th className="px-4 py-4 text-center">{t.admin.date}</th>
                <th className="px-6 py-4 text-right">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
              {loading && requests.length === 0 ? (
                <TableSkeleton rows={7} cols={5} />
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <MessageSquare size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">{t.helpline.noRequests}</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRequests.map(req => (
                <tr key={req._id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 transition-all group-hover:bg-[#3E291D] ${
                        req.userId ? 'bg-amber-100 text-amber-600 group-hover:text-amber-500' : 'bg-slate-50 text-slate-400 group-hover:text-slate-300'
                      }`}>
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">{req.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{req.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${statusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 truncate">{req.subject}</p>
                    <p className="text-[10px] font-bold text-slate-500 line-clamp-1 italic">"{req.message}"</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</p>
                    <p className="text-[8px] font-bold text-slate-300 mt-0.5">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openModal(req, true)}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                        title={t.admin.view}
                      >
                        <Eye size={13} />
                      </button>
                      {req.adminReply ? (
                         <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            <CheckCircle2 size={12} />
                            <span className="text-[8px] font-black uppercase tracking-widest">{t.admin.resolved}</span>
                         </div>
                      ) : (
                        <button 
                          onClick={() => openModal(req, false)}
                          className="bg-slate-900 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
                        >
                          <Send size={10} className="text-amber-500" />
                          {t.admin.reply}
                        </button>
                      )}
                      <button 
                        onClick={() => setConfirmDialog({ isOpen: true, id: req._id })}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
                        title={t.admin.delete}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {t.admin.showing} {paginatedRequests.length > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, filteredRequests.length)} {t.admin.of} {filteredRequests.length}
          </span>
          <div className="flex items-center gap-1">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => p - 1)} 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {(() => {
              const maxVisible = 7;
              let start = Math.max(1, page - Math.floor(maxVisible / 2));
              let end = Math.min(totalPages, start + maxVisible - 1);
              if (end === totalPages) start = Math.max(1, end - maxVisible + 1);
              
              return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                <PageBtn key={p} active={page === p} onClick={() => setPage(p)} label={p.toString()} />
              ));
            })()}
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => p + 1)} 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Reply/View Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setSelectedRequest(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                      {isViewOnly ? <Eye size={24} /> : <HelpCircle size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {isViewOnly ? t.admin.detailsTitle : t.admin.resolveTitle}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {isViewOnly ? `Viewing request from` : `Replying to`} {selectedRequest.name}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.admin.userContact}</p>
                      <p className="text-[10px] font-bold text-slate-700 mt-1 flex items-center gap-2">
                        <Mail size={10} /> {selectedRequest.email}
                        {selectedRequest.phone && <span className="flex items-center gap-1 ml-2"><Phone size={10} /> {selectedRequest.phone}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Message</p>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{selectedRequest.message}"</p>
                    </div>
                    {(isViewOnly && selectedRequest.adminReply) && (
                      <div>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">{t.helpline.officialResponse}</p>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed">"{selectedRequest.adminReply}"</p>
                      </div>
                    )}
                    {!isViewOnly && (
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{t.admin.adminReply}</p>
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t.admin.replyPlaceholder}
                          className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 transition-all h-32 resize-none shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    {isViewOnly ? t.admin.close : t.admin.cancel}
                  </button>
                  {!isViewOnly && (
                    <button 
                      onClick={() => handleReply(selectedRequest._id)}
                      disabled={updating || !replyText.trim()}
                      className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 disabled:opacity-50"
                    >
                      {updating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="text-amber-500" />}
                      {t.admin.sendResolve}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={confirmDialog.isOpen}
        title="Delete Request?"
        message="This will permanently remove this help request from the system. This action cannot be undone."
        type="danger"
        confirmText="Delete Permanently"
        onConfirm={handleDelete}
        onClose={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </motion.div>
  );
};

export default ManageHelpline;
