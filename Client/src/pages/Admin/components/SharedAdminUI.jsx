import React from 'react';

export const StatCard = ({ title, value, color, icon, trend, detail }) => (
  <div className={`bg-white rounded-2xl p-3 md:p-4 border ${color || 'border-slate-200'} border-l-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow`}>
     <div className="flex justify-between items-start mb-1 md:mb-2">
       <h3 className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
       {icon && <div className="text-slate-300 group-hover:text-amber-500 transition-colors">{icon}</div>}
     </div>
     <div className="flex flex-col items-start gap-1">
       <div className="flex items-end gap-2">
         <p className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
         {trend && <span className="text-[9px] md:text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">{trend}</span>}
       </div>
       {detail && <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{detail}</p>}
     </div>
  </div>
);

export const PageBtn = ({ active, label, icon, disabled, onClick }) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
      active ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
    } ${disabled ? 'opacity-30 disabled:hover:bg-transparent cursor-not-allowed' : ''}`}
  >
     {icon || label}
  </button>
);
