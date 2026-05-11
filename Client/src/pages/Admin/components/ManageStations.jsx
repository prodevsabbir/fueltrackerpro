import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Edit3, Trash2, ChevronLeft, ChevronRight, Map, CheckCircle2, Eye, Activity, ShieldCheck, Clock, Check, X } from 'lucide-react';
import { StatCardSkeleton, TableSkeleton, MobileCardSkeleton } from './Skeleton';
import { BsFillFuelPumpFill } from 'react-icons/bs';
import { io } from 'socket.io-client';
import { stationService } from '../../../helpers/stationService';
import { adminService } from '../../../helpers/adminService';
import { toast } from 'react-toastify';
import StationModal from '../StationModal';
import MapStationCreator from './MapStationCreator';
import ConfirmationModal from './ConfirmationModal';
import { PageBtn } from './SharedAdminUI';
import 'leaflet/dist/leaflet.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const statusStyle = (s) => {
  if (s === 'approved') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (s === 'pending')  return 'text-amber-600 bg-amber-50 border-amber-100';
  return 'text-red-600 bg-red-50 border-red-100';
};

const ManageStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('all');
  const [fuelType, setFuelType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, rejected: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isMapCreatorOpen, setIsMapCreatorOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: () => {} });

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await stationService.getAllStations({
        search: search.trim() || undefined, limit: 10, page,
        approvalStatus: approvalStatus !== 'all' ? approvalStatus : undefined,
        fuelType: fuelType !== 'all' ? fuelType : undefined, sortBy
      });
      const data = res?.stations || res?.data || [];
      setStations(Array.isArray(data) ? data : []);
      if (res?.meta) setMeta(res.meta);
    } catch { toast.error('Failed to load stations'); setStations([]); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await adminService.getDashboardStats();
      setStats({ total: res.totalStations||0, verified: res.verifiedStations||0, pending: res.pendingStations||0, rejected: res.rejectedStations||0 });
    } catch {}
  };

  useEffect(() => { const t = setTimeout(fetchStations, 400); return () => clearTimeout(t); }, [search, approvalStatus, fuelType, sortBy, page]);
  useEffect(() => { setPage(1); }, [search, approvalStatus, fuelType, sortBy]);
  useEffect(() => { fetchStats(); }, [stations]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('station_created', () => { fetchStations(); fetchStats(); });
    socket.on('station_updated', () => { fetchStations(); fetchStats(); });
    return () => socket.disconnect();
  }, []);

  const handleEditStation = (s) => { setSelectedStation(s); setIsModalOpen(true); };

  const handleApprove = (station) => {
    setConfirmDialog({
      isOpen: true, type: 'success', title: 'Approve Station?',
      message: `Verify "${station.name}" and make it live on the public map?`,
      confirmText: 'Verify Now',
      onConfirm: async () => {
        try { await adminService.updateStation(station._id, { approvalStatus: 'approved', verified: true }); toast.success('Station approved!'); fetchStations(); }
        catch { toast.error('Failed to approve'); }
      }
    });
  };

  const handleReject = (station) => {
    setConfirmDialog({
      isOpen: true, type: 'danger', title: 'Reject Discovery?',
      message: `Reject "${station.name}"? It will be flagged and removed from the queue.`,
      confirmText: 'Reject', onConfirm: async () => {
        try { await adminService.updateStation(station._id, { approvalStatus: 'rejected', verified: false }); toast.info('Rejected'); fetchStations(); }
        catch { toast.error('Failed to reject'); }
      }
    });
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true, type: 'danger', title: 'Delete Station?',
      message: 'This cannot be undone. The station will be permanently removed.',
      confirmText: 'Delete', onConfirm: async () => {
        try { await adminService.deleteStation(id); toast.success('Deleted'); fetchStations(); }
        catch { toast.error('Failed to delete'); }
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <StationModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchStations(); }} station={selectedStation} onRefresh={fetchStations} />
      <MapStationCreator isOpen={isMapCreatorOpen} onClose={() => setIsMapCreatorOpen(false)} onRefresh={fetchStations} />

      {/* Stats — 2x2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading && stats.total === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : [
          { label: 'Total', value: stats.total,    icon: Activity,    bg: 'bg-slate-900' },
          { label: 'Verified', value: stats.verified, icon: ShieldCheck, bg: 'bg-emerald-500' },
          { label: 'Pending', value: stats.pending,  icon: Clock,       bg: 'bg-amber-500' },
          { label: 'Rejected', value: stats.rejected, icon: Trash2,      bg: 'bg-red-500' },
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
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search stations..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all" />
          </div>
          <button onClick={() => setIsMapCreatorOpen(true)}
            className="bg-amber-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-amber-700 transition-all flex items-center gap-1.5 shrink-0">
            <Map size={12} /> Add
          </button>
        </div>
        <div className="flex gap-2">
          <select value={approvalStatus} onChange={e => setApprovalStatus(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] font-bold text-slate-600 outline-none">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={fuelType} onChange={e => setFuelType(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] font-bold text-slate-600 outline-none">
            <option value="all">All Fuels</option>
            <option value="Octane">Octane</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="LPG">LPG</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] font-bold text-slate-700 outline-none">
            <option value="newest">Newest</option>
            <option value="rating">Rating</option>
            <option value="price-low">Price ↑</option>
          </select>
        </div>
      </div>

      {/* Station List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-3">Station Info</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Verified</th>
                <th className="px-4 py-3 text-center">Contributor</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
              {loading ? (
                <TableSkeleton rows={7} cols={5} />
              ) : stations.length === 0 ? (
                <tr><td colSpan="5" className="py-16 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No stations found</td></tr>
              ) : stations.map(station => (
                <tr key={station._id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden group-hover:bg-[#3E291D] group-hover:text-amber-500 transition-all shrink-0">
                        {station?.image?.secure_url ? <img src={station.image.secure_url} alt="" className="w-full h-full object-cover" /> : <BsFillFuelPumpFill size={16} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xs group-hover:text-amber-600 transition-colors leading-tight">{station?.name || 'Unnamed'}</p>
                        <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={8} /> {station?.location?.subArea || station?.location?.area || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${statusStyle(station?.approvalStatus)}`}>
                      {station?.approvalStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {station?.approvalStatus === 'approved' ? (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto"><CheckCircle2 size={10} strokeWidth={3} /></div>
                    ) : station?.approvalStatus === 'pending' ? (
                      <span className="text-[8px] font-black uppercase text-amber-500">Pending</span>
                    ) : (
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto"><X size={10} strokeWidth={3} /></div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${station?.creatorRole === 'admin' ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'}`}>
                      {station?.creatorRole || 'System'}
                    </span>
                    {station?.createdBy?.name && <p className="text-[8px] text-slate-400 mt-0.5 truncate max-w-[80px] mx-auto">{station.createdBy.name}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {station?.approvalStatus === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(station)} className="p-1.5 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 transition-all"><Check size={12} strokeWidth={3} /></button>
                          <button onClick={() => handleReject(station)} className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-all"><X size={12} strokeWidth={3} /></button>
                        </>
                      )}
                      <button onClick={() => handleEditStation(station)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"><Eye size={12} /></button>
                      <button onClick={() => handleEditStation(station)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all"><Edit3 size={12} /></button>
                      <button onClick={() => handleDelete(station._id)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <MobileCardSkeleton count={5} />
          ) : stations.length === 0 ? (
            <p className="py-14 text-center text-slate-400 text-[10px] font-black uppercase">No stations found</p>
          ) : stations.map(station => (
            <div key={station._id} className="p-3 flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden shrink-0">
                {station?.image?.secure_url ? <img src={station.image.secure_url} alt="" className="w-full h-full object-cover" /> : <BsFillFuelPumpFill size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-xs leading-tight truncate">{station?.name || 'Unnamed'}</p>
                    <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                      <MapPin size={8} /> {station?.location?.subArea || station?.location?.area || 'Unknown'}
                    </p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${statusStyle(station?.approvalStatus)}`}>
                    {station?.approvalStatus || 'pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${station?.creatorRole === 'admin' ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'}`}>
                    {station?.creatorRole || 'System'}
                  </span>
                  {station?.createdBy?.name && <span className="text-[8px] text-slate-400 font-bold truncate max-w-[100px]">by {station.createdBy.name}</span>}
                  <div className="ml-auto flex items-center gap-1.5">
                    {station?.approvalStatus === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(station)} className="p-1.5 bg-emerald-500 rounded-lg text-white"><Check size={11} strokeWidth={3} /></button>
                        <button onClick={() => handleReject(station)} className="p-1.5 bg-red-500 rounded-lg text-white"><X size={11} strokeWidth={3} /></button>
                      </>
                    )}
                    <button onClick={() => handleEditStation(station)} className="p-1.5 border border-slate-200 rounded-lg text-slate-400"><Eye size={11} /></button>
                    <button onClick={() => handleDelete(station._id)} className="p-1.5 border border-slate-200 rounded-lg text-red-400"><Trash2 size={11} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
            {stations.length > 0 ? (meta.page-1)*meta.limit+1 : 0}–{Math.min(meta.page*meta.limit, meta.total)} of {meta.total}
          </span>
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button disabled={meta.page<=1} onClick={() => setPage(p=>p-1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30">
              <ChevronLeft size={13} />
            </button>
            {(() => {
              const totalPages = meta.totalPages || 1;
              const currentPage = meta.page;
              
              const generatePages = (current, total) => {
                if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
                const pages = [];
                for (let i = 1; i <= total; i++) {
                  if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
                    pages.push(i);
                  }
                }
                const withDots = [];
                let prev = null;
                for (let i of pages) {
                  if (prev) {
                    if (i - prev === 2) withDots.push(prev + 1);
                    else if (i - prev > 2) withDots.push('...');
                  }
                  withDots.push(i);
                  prev = i;
                }
                return withDots;
              };

              return generatePages(currentPage, totalPages).map((p, idx) => (
                p === '...' ? (
                  <span key={`dots-${idx}`} className="px-1 text-slate-400 font-black">...</span>
                ) : (
                  <PageBtn key={p} active={currentPage === p} onClick={() => setPage(p)} label={p.toString()} />
                )
              ));
            })()}
            <button disabled={meta.page>=meta.totalPages} onClick={() => setPage(p=>p+1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal {...confirmDialog} onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} />
    </motion.div>
  );
};

export default ManageStations;
