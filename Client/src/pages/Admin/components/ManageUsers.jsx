import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../../helpers/adminService';
import { toast } from 'react-toastify';
import { StatCard, PageBtn } from './SharedAdminUI';
import { StatCardSkeleton, TableSkeleton, MobileCardSkeleton } from './Skeleton';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.allSettled([
        adminService.getAllUsers({
          page, limit: 10, 
          search: search.trim() || undefined,
          role: role !== 'all' ? role : undefined,
          status: status !== 'all' ? status : undefined
        }),
        adminService.getDashboardStats()
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value?.data || []);
        if (usersRes.value?.meta) setMeta(usersRes.value.meta);
      }
      
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Part of the dashboard failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [page, search, role, status]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, role, status]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await adminService.updateUserStatus(user._id, newStatus);
      toast.success(`User ${user.name} is now ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl mx-auto space-y-6">
       
       {/* Top Stats Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading && !stats ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard title="TOTAL" value={stats?.totalUsers || 0} color="border-slate-200" />
              <StatCard title="ACTIVE" value={stats?.activeUsers || 0} color="border-emerald-500" />
              <StatCard title="SUSPENDED" value={(stats?.totalUsers || 0) - (stats?.activeUsers || 0)} color="border-red-500" />
              <StatCard title="NEW THIS MONTH" value={0} color="border-blue-500" />
            </>
          )}
       </div>

       {/* Toolbar */}
       <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
             <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search name, email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all"
                />
             </div>
             <button className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-amber-700 transition-all flex items-center gap-1.5 shrink-0">
                <Plus size={12} /> Add
             </button>
          </div>
          <div className="flex gap-2">
             <select value={role} onChange={(e) => setRole(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 outline-none">
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="rider">Rider</option>
             </select>
             <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 outline-none">
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
             </select>
          </div>
       </div>

       {/* Users — MOBILE CARDS / DESKTOP TABLE */}
       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto min-h-[400px]">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Points</th>
                      <th className="px-6 py-4 text-center">Role</th>
                      <th className="px-6 py-4">Address</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-100">
                   {loading ? (
                     <TableSkeleton rows={6} cols={7} />
                   ) : users.map(user => (
                     <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-black overflow-hidden border border-amber-200 shadow-sm">
                                 {user.profileImage?.secure_url ? (
                                    <img src={user.profileImage.secure_url} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                    user.name ? user.name[0].toUpperCase() : 'U'
                                 )}
                              </div>
                              <span className="font-black text-slate-900 group-hover:text-amber-600 transition-colors">{user.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{user.email}</td>
                        <td className="px-6 py-4 text-center">
                           {user.status === 'active' ? (
                             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">Active</span>
                           ) : (
                             <span className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 px-3 py-1 rounded-md shadow-sm">Banned</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex items-center justify-center gap-1.5 text-amber-500 text-xs font-black">
                              <Star size={14} fill="currentColor" /> {user.points || 0}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">{user.role}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-[150px]">{user.city ? `${user.city}, ${user.country}` : 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-3">
                              <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Details</button>
                              {user.status === 'active' ? (
                                <button onClick={() => handleToggleStatus(user)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-2 py-1 rounded">Block</button>
                              ) : (
                                <button onClick={() => handleToggleStatus(user)} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded">Activate</button>
                              )}
                           </div>
                        </td>
                     </tr>
                   ))}
                   {!loading && users.length === 0 && (
                     <tr><td colSpan="7" className="py-20 text-center text-slate-400 text-xs font-black uppercase tracking-widest">No users found</td></tr>
                   )}
                </tbody>
             </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
             {loading ? (
               <MobileCardSkeleton count={5} />
             ) : users.length === 0 ? (
               <p className="py-16 text-center text-slate-400 text-xs font-black uppercase tracking-widest">No users found</p>
             ) : users.map(user => (
               <div key={user._id} className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-black overflow-hidden border border-amber-200 shrink-0">
                     {user.profileImage?.secure_url ? <img src={user.profileImage.secure_url} alt="" className="w-full h-full object-cover" /> : (user.name?.[0]?.toUpperCase() || 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-slate-900 text-sm truncate">{user.name}</p>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${
                          user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-900 text-white'
                        }`}>{user.status}</span>
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{user.email}</p>
                     <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{user.role}</span>
                        <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black"><Star size={10} fill="currentColor" /> {user.points || 0}</div>
                        <div className="ml-auto flex gap-2">
                           {user.status === 'active' ? (
                             <button onClick={() => handleToggleStatus(user)} className="text-[9px] font-black uppercase text-red-500 bg-red-50 px-2 py-1 rounded">Block</button>
                           ) : (
                             <button onClick={() => handleToggleStatus(user)} className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Activate</button>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                {users.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
             </span>
             <div className="flex items-center gap-1 mx-auto sm:mx-0">
                <button disabled={meta.page <= 1} onClick={() => setPage(p => p - 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30">
                   <ChevronLeft size={14} />
                </button>
                {[...Array(Math.min(meta.totalPages || 1, 5))].map((_, i) => (
                   <PageBtn key={i} active={meta.page === i + 1} onClick={() => setPage(i + 1)} label={(i + 1).toString()} />
                ))}
                <button disabled={meta.page >= meta.totalPages} onClick={() => setPage(p => p + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30">
                   <ChevronRight size={14} />
                </button>
             </div>
          </div>
       </div>
    </motion.div>
  );
};

export default ManageUsers;
