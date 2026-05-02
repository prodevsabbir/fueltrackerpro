import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Fuel, ArrowUpRight, ArrowDownRight, Activity, Zap, Server, MapPin, Database, CheckCircle, Store } from 'lucide-react';
import { adminService } from '../../../helpers/adminService';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalStations: 0,
    verifiedStations: 0,
    fuelDemandInsights: { octane: 0, diesel: 0, petrol: 0, cng: 0 },
    regionalDistribution: [],
    serverHealth: {
      database: { value: "Unknown", status: "warning" },
      redis: { value: "Unknown", status: "warning" },
      cloudinary: { value: "Unknown", status: "warning" },
      authentication: { value: "Unknown", status: "warning" }
    },
    trafficData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error("Failed to load analytics stats", error);
      }
    };
    fetchStats();
  }, []);

  const maxTraffic = Math.max(...stats.trafficData, 10); // Prevent division by zero

  // Format dates for chart
  const dates = [];
  for (let i = 13; i >= 0; i -= 6) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Four Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
         <MiniStat title="Registered Users" value={stats.totalUsers.toLocaleString()} desc="Total users" trend="+New" positive={true} icon={<Users size={16} />} />
         <MiniStat title="Active Accounts" value={stats.activeUsers.toLocaleString()} desc="Currently active" trend="+Good" positive={true} icon={<Activity size={16} />} />
         <MiniStat title="Total Stations" value={stats.totalStations.toLocaleString()} desc="All pumps" trend="+Growth" positive={true} icon={<Store size={16} />} />
         <MiniStat title="Verified Stations" value={stats.verifiedStations.toLocaleString()} desc="Passed review" trend="+Safe" positive={true} icon={<CheckCircle size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="flex items-start md:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight">Platform Growth</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">New Registrations over the last 14 days</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-[10px] md:text-xs font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer">
              <option>Last 14 Days</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 h-48 border-b border-slate-100 pb-2 relative">
             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
                <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
                <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
             </div>
             {/* Dynamic Bars */}
             {stats.trafficData.map((h, i) => {
                const heightPercent = (h / maxTraffic) * 100;
                return (
                  <div key={i} className="w-full flex justify-center group relative cursor-crosshair h-full items-end">
                     <div className="absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                       {h} users
                     </div>
                     <div className="w-full max-w-[24px] bg-amber-100 group-hover:bg-amber-200 rounded-t-sm transition-all duration-300 relative overflow-hidden" style={{ height: `${heightPercent}%` }}>
                       <div className="absolute bottom-0 w-full bg-amber-500 rounded-t-sm" style={{ height: `100%` }}></div>
                     </div>
                  </div>
                )
             })}
          </div>
          <div className="flex justify-between text-[9px] font-black text-slate-300 mt-2 px-2 uppercase">
            <span>{dates[0]}</span>
            <span>{dates[1]}</span>
            <span>{dates[2]}</span>
          </div>
        </div>

        {/* Server Health */}
        <div className="bg-[#3E291D] rounded-2xl p-4 md:p-6 text-white shadow-xl flex flex-col">
          <h3 className="text-[10px] md:text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2 text-slate-100">
            <Database className="text-emerald-400" size={14} /> Server Health
          </h3>
          
          <div className="space-y-6 flex-1">
            <HealthIndicator label="Primary Database" value={stats.serverHealth.database.value} status={stats.serverHealth.database.status} />
            <HealthIndicator label="Caching Layer (Redis)" value={stats.serverHealth.redis.value} status={stats.serverHealth.redis.status} />
            <HealthIndicator label="Image Storage (Cloudinary)" value={stats.serverHealth.cloudinary.value} status={stats.serverHealth.cloudinary.status} />
            <HealthIndicator label="Authentication Service" value={stats.serverHealth.authentication.value} status={stats.serverHealth.authentication.status} />
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-xs font-black uppercase tracking-widest">
              View Detailed Logs
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm">
          <h3 className="text-[10px] md:text-xs font-black tracking-widest uppercase text-slate-800 mb-4 flex items-center gap-2">
            <Fuel className="text-amber-500" size={14} /> Fuel Demand Insights
          </h3>
          <div className="space-y-5">
            <ProgressBar label="Octane" percentage={stats.fuelDemandInsights.octane} color="bg-amber-500" />
            <ProgressBar label="Diesel" percentage={stats.fuelDemandInsights.diesel} color="bg-blue-500" />
            <ProgressBar label="Petrol" percentage={stats.fuelDemandInsights.petrol} color="bg-rose-500" />
            <ProgressBar label="CNG" percentage={stats.fuelDemandInsights.cng} color="bg-emerald-500" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-6 text-center">Based on aggregated fuel availability across {stats.totalStations} stations.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-[10px] md:text-xs font-black tracking-widest uppercase text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="text-amber-500" size={14} /> Regional Distribution
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {stats.regionalDistribution.length > 0 ? stats.regionalDistribution.map((reg, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="font-bold text-sm text-slate-700">{reg.region}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-900">{reg.count} Stations</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${reg.growth.includes('+') ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                    {reg.growth}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-center text-xs font-bold text-slate-400 py-10 uppercase tracking-widest">No stations created yet</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MiniStat = ({ title, value, desc, trend, positive, icon }) => (
  <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500 transition-colors">
    <div className="flex justify-between items-start mb-2">
       <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
         {icon}
       </div>
       <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
         {trend} {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
       </span>
    </div>
    <h4 className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-tight line-clamp-1">{title}</h4>
    <div className="flex items-end justify-between">
      <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
    </div>
    <p className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-1 line-clamp-1">{desc}</p>
  </div>
);

const HealthIndicator = ({ label, value, status }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-bold text-slate-300">{label}</span>
      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${status === 'operational' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
        {value}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'operational' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`}></div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{status === 'operational' ? 'Online' : 'Degraded'}</span>
    </div>
  </div>
);

const ProgressBar = ({ label, percentage, color }) => (
  <div>
    <div className="flex justify-between text-[10px] font-bold mb-1">
      <span className="text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-slate-700 font-black">{percentage}%</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

export default Analytics;
