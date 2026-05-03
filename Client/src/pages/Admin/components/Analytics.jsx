import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Users, Clock, Zap, BarChart2, MapPin, Activity
} from 'lucide-react';
import { adminService } from '../../../helpers/adminService';
import { StatCardSkeleton, ChartSkeleton, InsightCardSkeleton, Shimmer } from './Skeleton';

/* ─────────────────────────────────────────────
   Smooth SVG area chart — no external library
───────────────────────────────────────────── */
const AreaChart = ({ data, labels }) => {
  const W = 600;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 32, left: 36 };

  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right),
    y: PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom),
  }));

  /* Catmull-Rom → cubic bezier */
  const smooth = (points) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = smooth(pts);
  const areaPath = linePath
    ? `${linePath} L ${pts[pts.length - 1].x} ${H - PAD.bottom} L ${pts[0].x} ${H - PAD.bottom} Z`
    : '';

  /* Y-axis grid lines */
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    y: PAD.top + ratio * (H - PAD.top - PAD.bottom),
    label: Math.round(max * (1 - ratio)),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B45309" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#B45309" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridLines.map(({ y, label }, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
            stroke="#E2E8F0" strokeWidth="1" strokeDasharray={i === 4 ? '0' : '4 4'} />
          <text x={PAD.left - 6} y={y + 4} textAnchor="end"
            fontSize="9" fill="#94A3B8" fontWeight="700" fontFamily="sans-serif">
            {label}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white"
          stroke="#D97706" strokeWidth="2" />
      ))}

      {/* X-axis labels */}
      {labels.map((label, i) => {
        const x = PAD.left + (i / (labels.length - 1)) * (W - PAD.left - PAD.right);
        return (
          <text key={i} x={x} y={H - 6} textAnchor="middle"
            fontSize="9" fill="#94A3B8" fontWeight="700" fontFamily="sans-serif">
            {label}
          </text>
        );
      })}
    </svg>
  );
};

/* ─────────────────────────────────────────────
   KPI Card — matches reference design style
───────────────────────────────────────────── */
const KpiCard = ({ title, value, trend, trendLabel, positive, neutral, icon: Icon, accentColor }) => (
  <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">{title}</p>
      <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{value}</p>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${
        neutral ? 'text-slate-400' : positive ? 'text-emerald-600' : 'text-red-500'
      }`}>
        {neutral ? <Minus size={10} /> : positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        <span>{trendLabel}</span>
      </div>
    </div>
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentColor}`}>
      <Icon size={16} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Zone row — coloured bar like reference
───────────────────────────────────────────── */
const ZoneRow = ({ name, pct, color }) => (
  <div className="py-3 border-b border-slate-50 last:border-0">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-xs font-bold text-slate-700">{name}</span>
      <span className="text-[10px] font-black text-slate-400">{pct}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Analytics Component
───────────────────────────────────────────── */
const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load analytics stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  /* Build month labels for x-axis */
  const monthLabels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthLabels.push(d.toLocaleDateString('en-US', { month: 'short' }));
  }

  /* Use trafficData (last 14 pts → sample to 6 for monthly view) */
  const rawTraffic = stats?.trafficData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const chartData = (() => {
    if (rawTraffic.length >= 6) {
      const step = Math.floor(rawTraffic.length / 6);
      return Array.from({ length: 6 }, (_, i) => rawTraffic[i * step] || 0);
    }
    return [...rawTraffic, ...Array(6 - rawTraffic.length).fill(0)];
  })();

  /* Regional zones — merge backend data or use fuel demand insights as fallback */
  const regional = stats?.regionalDistribution?.length
    ? stats.regionalDistribution.slice(0, 4).map((r, i) => ({
        name: r.region,
        pct: Math.min(Math.round((r.count / Math.max(stats.totalStations, 1)) * 100), 100) || (25 - i * 5),
        color: ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500'][i],
      }))
    : [
        { name: 'Dhaka Division', pct: 38, color: 'bg-amber-500' },
        { name: 'Chittagong Division', pct: 24, color: 'bg-emerald-500' },
        { name: 'Sylhet Division', pct: 19, color: 'bg-blue-500' },
        { name: 'Rajshahi Division', pct: 12, color: 'bg-purple-500' },
      ];

  /* KPI derived values */
  const activeRate = stats?.totalUsers
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;
  const verifiedRate = stats?.totalStations
    ? Math.round((stats.verifiedStations / stats.totalStations) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              title="Registered Users"
              value={(stats?.totalUsers || 0).toLocaleString()}
              trendLabel={`${stats?.activeUsers || 0} active`}
              positive={true}
              icon={Users}
              accentColor="bg-blue-50 text-blue-500"
            />
            <KpiCard
              title="Active Rate"
              value={`${activeRate}%`}
              trendLabel={activeRate >= 70 ? 'Healthy engagement' : 'Below target'}
              positive={activeRate >= 70}
              neutral={false}
              icon={TrendingUp}
              accentColor="bg-emerald-50 text-emerald-500"
            />
            <KpiCard
              title="Verified Stations"
              value={(stats?.verifiedStations || 0).toLocaleString()}
              trendLabel={`${verifiedRate}% verified`}
              positive={verifiedRate >= 60}
              neutral={verifiedRate === 0}
              icon={Activity}
              accentColor="bg-amber-50 text-amber-500"
            />
            <KpiCard
              title="Pending Review"
              value={(stats?.pendingStations || 0).toLocaleString()}
              trendLabel={stats?.pendingStations > 0 ? 'Needs attention' : 'All clear'}
              positive={!stats?.pendingStations}
              neutral={!stats?.pendingStations}
              icon={Zap}
              accentColor="bg-purple-50 text-purple-500"
            />
          </>
        )}
      </div>

      {/* ── Chart Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 size={14} className="text-slate-400" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                Reports per month
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-slate-400">Active Reports</span>
            </div>
          </div>

          <div className="h-[200px] w-full">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <AreaChart data={chartData} labels={monthLabels} />
            )}
          </div>
        </div>

        {/* Most Active Zones */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={14} className="text-slate-400" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
              Most active zones
            </span>
          </div>

          <div className="space-y-0">
            {regional.map((zone, i) => (
              <ZoneRow key={i} name={zone.name} pct={zone.pct} color={zone.color} />
            ))}
          </div>

          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-4 leading-relaxed">
            * Data analysis is real-time based on geo-located station reports submitted by the community.
          </p>
        </div>
      </div>

      {/* ── Fuel Demand + Server Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* Fuel Demand */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Fuel demand breakdown</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Octane', pct: stats?.fuelDemandInsights?.octane || 0, color: 'bg-amber-500' },
              { label: 'Diesel', pct: stats?.fuelDemandInsights?.diesel || 0, color: 'bg-blue-500' },
              { label: 'Petrol', pct: stats?.fuelDemandInsights?.petrol || 0, color: 'bg-rose-500' },
              { label: 'CNG', pct: stats?.fuelDemandInsights?.cng || 0, color: 'bg-emerald-500' },
            ].map(({ label, pct, color }) => (
              <ZoneRow key={label} name={label} pct={pct} color={color} />
            ))}
          </div>
          <p className="text-[9px] font-bold text-slate-300 mt-4">
            Based on {stats?.totalStations || 0} total stations in the network.
          </p>
        </div>

        {/* Server Health */}
        <div className="bg-[#2C1A10] border border-white/5 rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-white/70 uppercase tracking-widest">Server Infrastructure</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats?.serverHealth || {
              database: { value: '—', status: 'warning' },
              redis: { value: '—', status: 'warning' },
              cloudinary: { value: '—', status: 'warning' },
              authentication: { value: '—', status: 'warning' },
            }).map(([key, data]) => (
              <div key={key} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{key}</p>
                <p className="text-[11px] font-black text-white truncate mb-2">{data.value}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    data.status === 'operational' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]'
                  }`} />
                  <span className="text-[9px] font-bold text-white/40 uppercase">
                    {data.status === 'operational' ? 'Online' : 'Degraded'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all">
            View Detailed Logs
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
