import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Fuel, CheckCircle2, Activity, TrendingUp, Star, Plus, AlertCircle } from 'lucide-react';
import { adminService } from '../../../helpers/adminService';
import { StatCard } from './SharedAdminUI';
import { StatCardSkeleton, InsightCardSkeleton, Shimmer } from './Skeleton';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard 
              title="TOTAL USERS" 
              value={stats?.totalUsers || 0} 
              icon={<Users size={20} />} 
              color="border-blue-500" 
              detail={`${stats?.activeUsers || 0} Active Now`}
            />
            <StatCard 
              title="VERIFIED STATIONS" 
              value={stats?.verifiedStations || 0} 
              icon={<CheckCircle2 size={20} />} 
              color="border-emerald-500" 
              detail={`${stats?.totalStations || 0} Total Stations`}
            />
            <StatCard 
              title="PENDING APPROVAL" 
              value={stats?.pendingStations || 0} 
              icon={<AlertCircle size={20} />} 
              color="border-amber-500" 
              detail={`${stats?.rejectedStations || 0} Rejected`}
            />
            <StatCard 
              title="SYSTEM HEALTH" 
              value={stats?.serverHealth?.database?.status === 'operational' ? 'Stable' : 'Issues'} 
              icon={<Activity size={20} />} 
              color="border-slate-400" 
              detail="All Systems Green"
            />
          </>
        )}
      </div>

      {/* Detailed Insights Row */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InsightCardSkeleton />
          <InsightCardSkeleton />
          <div className="bg-[#3E291D] rounded-[24px] p-6 space-y-4">
            <Shimmer className="h-2.5 w-32 rounded bg-white/10" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl space-y-2">
                  <Shimmer className="h-2 w-16 rounded bg-white/10" />
                  <Shimmer className="h-3 w-20 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Demand */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Fuel Demand Insights</h3>
          <div className="space-y-4">
            {Object.entries(stats?.fuelDemandInsights || {}).map(([fuel, value]) => (
              <div key={fuel} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-500">{fuel}</span>
                  <span className="text-slate-900">{value}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${value}%` }}
                    className={`h-full rounded-full ${
                      fuel === 'octane' ? 'bg-amber-500' : 
                      fuel === 'diesel' ? 'bg-slate-700' : 
                      fuel === 'petrol' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Regional Distribution</h3>
          <div className="space-y-3">
            {(stats?.regionalDistribution || []).map((reg, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs">{i+1}</div>
                  <span className="text-xs font-bold text-slate-700">{reg.region}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">{reg.count} Stations</p>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase">{reg.growth} Growth</p>
                </div>
              </div>
            ))}
            {(!stats?.regionalDistribution?.length) && <p className="text-[10px] text-slate-400 text-center py-10">No regional data available yet</p>}
          </div>
        </div>

        {/* Infrastructure Health */}
        <div className="bg-[#3E291D] rounded-[24px] p-6 text-white shadow-xl shadow-[#3E291D]/20">
          <h3 className="text-xs font-black text-amber-500/50 uppercase tracking-widest mb-6">Server Infrastructure</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats?.serverHealth || {}).map(([key, data]) => (
              <div key={key} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[8px] font-black text-white/40 uppercase mb-1">{key}</p>
                <p className="text-[10px] font-black text-white truncate">{data.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  <span className="text-[7px] font-bold uppercase text-white/60">{data.status}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-[#3E291D]"><Activity size={20} /></div>
                <div>
                   <p className="text-xs font-black text-white">System Load: Normal</p>
                   <p className="text-[9px] font-bold text-white/40">Healthy Latency: 42ms</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      )}
    </motion.div>
  );
};

export default Overview;
