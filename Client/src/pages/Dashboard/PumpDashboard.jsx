import React, { useState } from 'react';
import { Fuel, Edit3, Save, TrendingUp, Users, AlertTriangle, CheckCircle2, XCircle, Star, Clock, MapPin, Coffee, Droplets, Utensils, MessageSquare, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const PumpDashboard = () => {
  const { t } = useLanguage();
  const [stationName, setStationName] = useState("Trust Oil Station");
  const [location, setLocation] = useState("Dhaka - Mymensingh Hwy");
  
  const [fuels, setFuels] = useState([
    { id: 'octane', name: t.pumps.octane, price: '130.00', status: 'available' },
    { id: 'petrol', name: t.pumps.petrol, price: '125.00', status: 'available' },
    { id: 'diesel', name: t.pumps.diesel, price: '110.00', status: 'limited' },
    { id: 'cng', name: t.pumps.cng, price: '45.00', status: 'out' }
  ]);

  const [facilities, setFacilities] = useState([
    { id: 'water', icon: Droplets, name: 'Drinking Water', active: true },
    { id: 'washroom', icon: Coffee, name: 'Restroom', active: true },
    { id: 'cafe', icon: Utensils, name: 'Cafe / Snacks', active: false }
  ]);

  const [comments] = useState([
    { id: 1, user: 'Arif Khan', text: 'Price is accurate. No queue right now.', time: '10 mins ago', rating: 5, verified: true },
    { id: 2, user: 'Sakib Ahmed', text: 'Limited stock, only octane available.', time: '1 hr ago', rating: 3, verified: false },
    { id: 3, user: 'Imran Malik', text: 'Good behavior from staff, but water pump was not working.', time: '3 hrs ago', rating: 4, verified: true }
  ]);

  const updateStatus = (id, newStatus) => {
    setFuels(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
  };

  const toggleFacility = (id) => {
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#FAFAFB] min-h-screen pt-28 pb-20 px-4">
      <div className="w-full max-w-7xl">
        
        {/* Top Management Bar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           <div className="flex gap-5 items-center relative z-10">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl shadow-slate-900/20">
                <Fuel size={32} />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{stationName}</h1>
                    <button className="text-slate-300 hover:text-amber-500 transition-colors"><Edit3 size={16} /></button>
                 </div>
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                    <MapPin size={10} className="text-amber-500" />
                    {location}
                 </p>
              </div>
           </div>
           <div className="flex items-center gap-3 w-full xl:w-auto relative z-10">
              <button className="flex-1 xl:flex-none border border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                Preview Station
              </button>
              <button className="flex-1 xl:flex-none bg-amber-500 text-black px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all">
                <Save size={18} />
                Publish Updates
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Left: Main Management */}
           <div className="lg:col-span-8 space-y-8">
              
              {/* Availability & Price Grid */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={18} className="text-amber-500" />
                      Live Inventory & Pricing
                    </h2>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Active Live</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fuels.map(fuel => (
                      <div key={fuel.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col gap-4">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <div className={`p-2.5 rounded-xl ${fuel.status === 'available' ? 'bg-emerald-100 text-emerald-600' : fuel.status === 'limited' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                  <Fuel size={18} />
                               </div>
                               <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{fuel.name}</span>
                            </div>
                            <div className="flex bg-white rounded-lg p-0.5 border border-slate-100">
                               <input 
                                 type="text" 
                                 defaultValue={fuel.price}
                                 className="w-20 text-right bg-transparent border-none text-base font-black text-slate-900 focus:ring-0 outline-none p-1.5"
                               />
                               <span className="text-[10px] font-black text-slate-400 self-center pr-2 ml-1">BDT</span>
                            </div>
                         </div>

                         <div className="grid grid-cols-3 gap-1.5">
                            {['available', 'limited', 'out'].map(s => (
                               <button 
                                 key={s}
                                 onClick={() => updateStatus(fuel.id, s)}
                                 className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all border ${
                                   fuel.status === s 
                                   ? (s === 'available' ? 'bg-emerald-500 border-emerald-500 text-white' : s === 'limited' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-red-500 border-red-500 text-white')
                                   : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                 }`}
                               >
                                 {t.pumps[s]}
                               </button>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Operating Details & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Clock size={18} className="text-blue-500" />
                       Operating Hours
                    </h2>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">Everyday</span>
                          <span className="text-xs font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">24 Hours / Open</span>
                       </div>
                       <div className="flex items-center justify-between opacity-50">
                          <span className="text-xs font-bold text-slate-500">Friday Break</span>
                          <span className="text-xs font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">1:00 PM - 2:00 PM</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <CheckCircle2 size={18} className="text-emerald-500" />
                       Station Facilities
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                       {facilities.map(fac => (
                          <button 
                            key={fac.id}
                            onClick={() => toggleFacility(fac.id)}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                               fac.active ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'
                            }`}
                          >
                             <div className="flex items-center gap-3">
                                <fac.icon size={16} className={fac.active ? 'text-emerald-500' : 'text-slate-400'} />
                                <span className="text-xs font-bold text-slate-700">{fac.name}</span>
                             </div>
                             {fac.active ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-slate-300" />}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Complete Feedback Feed */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={18} className="text-amber-500" />
                      All Community Feedback
                    </h2>
                    <button className="text-[10px] font-black text-amber-500 uppercase hover:underline">Download Report</button>
                 </div>
                 
                 <div className="space-y-6">
                    {comments.map(c => (
                      <div key={c.id} className="p-6 rounded-2xl border border-slate-50 bg-slate-50/50 group">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
                                  <Users size={20} />
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <span className="text-sm font-black text-slate-800">{c.user}</span>
                                     {c.verified && <ShieldCheck className="text-blue-500" size={14} />}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                     <div className="flex items-center text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                           <Star key={i} size={10} fill={i < c.rating ? "currentColor" : "none"} className={i < c.rating ? "" : "text-slate-200"} />
                                        ))}
                                     </div>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{c.time}</span>
                                  </div>
                               </div>
                            </div>
                            <button className="text-[10px] font-black text-slate-400 hover:text-amber-500 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100">Report</button>
                         </div>
                         <p className="text-sm text-slate-600 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-white">
                            "{c.text}"
                         </p>
                         <div className="mt-4 flex justify-end">
                            <button className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1.5 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-all">
                               <MessageSquare size={12} />
                               Reply to Rider
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Insights & Performance */}
           <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                 <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
                 <div className="flex items-center gap-3 mb-8 relative z-10">
                    <TrendingUp className="text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-widest opacity-60">Performance Summary</span>
                 </div>
                 <div className="space-y-8 relative z-10">
                    <div>
                       <p className="text-5xl font-black text-white tracking-tighter">1,284</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Riders reached today</p>
                       <div className="flex items-center gap-2 mt-3">
                          <span className="text-emerald-500 font-black text-xs">+12.5%</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">vs yesterday</span>
                       </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5 space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reliability Score</span>
                          <span className="text-xs font-black text-amber-500">98.2%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: '98%' }}></div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
                 <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-100 shadow-inner">
                    <Star size={28} fill="currentColor" />
                 </div>
                 <p className="text-4xl font-black text-slate-900 tracking-tight">4.8</p>
                 <div className="flex justify-center text-amber-500 mt-1 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">Overall Rider Satisfaction</p>
                 <div className="mt-8 pt-8 border-t border-slate-50 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                       <span className="text-slate-400">Response Rate</span>
                       <span className="text-slate-900">100%</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                       <span className="text-slate-400">Avg. Queue Time</span>
                       <span className="text-slate-900">~8 Mins</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PumpDashboard;
