import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle2, Info, Clock } from 'lucide-react';

const Notifications = () => {
  const notifications = [
    { id: 1, type: 'alert', title: 'High Server Load Detected', time: '10 mins ago', desc: 'CPU usage exceeded 85% for the last 5 minutes.', read: false },
    { id: 2, type: 'info', title: 'New Station Verification Pending', time: '1 hour ago', desc: 'Trust Filling Station submitted their registration documents.', read: false },
    { id: 3, type: 'success', title: 'Database Backup Completed', time: '3 hours ago', desc: 'Daily automated backup was successful.', read: true },
    { id: 4, type: 'info', title: 'New User Milestone', time: '1 day ago', desc: 'The platform reached 1,000 registered active users.', read: true },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return <AlertTriangle size={18} className="text-red-500" />;
      case 'success': return <CheckCircle2 size={18} className="text-emerald-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            System Alerts <div className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">2 New</div>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage platform notifications and warnings</p>
        </div>
        <button className="text-xs font-black text-amber-600 hover:underline tracking-widest uppercase">Mark all as read</button>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.map(note => (
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
      </div>
    </motion.div>
  );
};

export default Notifications;
