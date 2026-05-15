import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle2, Info, Clock, Loader2, RefreshCw } from 'lucide-react';
import { adminService } from '../../../helpers/adminService';

const Notifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setAlerts(data?.alerts || []);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return <AlertTriangle size={18} className="text-red-500" />;
      case 'success': return <CheckCircle2 size={18} className="text-emerald-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            System Alerts {unreadCount > 0 && <div className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</div>}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage platform notifications and warnings</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchAlerts} className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400">
             <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
           </button>
           <button className="text-xs font-black text-amber-600 hover:underline tracking-widest uppercase">Mark all as read</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-slate-300">
             <Loader2 size={32} className="animate-spin mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest">Fetching Live Alerts...</p>
          </div>
        ) : alerts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {alerts.map(note => (
              <div key={note.id} className={`p-4 md:p-6 flex items-start gap-3 md:gap-4 transition-colors hover:bg-slate-50 ${!note.read ? 'bg-amber-50/30' : ''}`}>
                <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${!note.read ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                  {getIcon(note.type)}
                </div>
                <div className="flex-1 pt-0.5 md:pt-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-1 gap-1 md:gap-0">
                    <h4 className={`text-xs md:text-sm font-bold truncate ${!note.read ? 'text-slate-900' : 'text-slate-700'}`}>{note.title}</h4>
                    <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                      <Clock size={10} /> {note.time}
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 leading-snug line-clamp-2 md:line-clamp-none">{note.desc}</p>
                </div>
                {!note.read && <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 md:mt-3 shadow-sm shadow-amber-500/50 shrink-0"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-slate-300">
             <Bell size={48} strokeWidth={1} className="mb-4 opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest">No system alerts at the moment</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
