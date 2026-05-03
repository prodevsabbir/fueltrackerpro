import React from 'react';

/* ─── Base shimmer block ─── */
export const Shimmer = ({ className = '' }) => (
  <div
    className={`bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:400%_100%] animate-[shimmer_1.4s_ease_infinite] rounded-lg ${className}`}
    style={{
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.4s ease infinite',
    }}
  />
);

/* Inject keyframe once */
if (typeof document !== 'undefined' && !document.getElementById('sk-keyframe')) {
  const style = document.createElement('style');
  style.id = 'sk-keyframe';
  style.textContent = `
    @keyframes shimmer {
      0%   { background-position: 100% 50%; }
      100% { background-position: 0%   50%; }
    }
  `;
  document.head.appendChild(style);
}

/* ─── Stat card skeleton (4-col grid) ─── */
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-100 p-4 md:p-5 shadow-sm flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <Shimmer className="h-2.5 w-24 rounded" />
      <Shimmer className="h-8 w-8 rounded-xl" />
    </div>
    <Shimmer className="h-8 w-16 rounded" />
    <Shimmer className="h-2 w-20 rounded" />
  </div>
);

/* ─── Table row skeleton ─── */
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <Shimmer className={`h-3 rounded ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16 ml-auto' : 'w-20'}`} />
      </td>
    ))}
  </tr>
);

/* ─── Table skeleton (header + rows) ─── */
export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <table className="w-full border-collapse">
    <thead>
      <tr className="bg-slate-50 border-b border-slate-100">
        {Array.from({ length: cols }).map((_, i) => (
          <th key={i} className="px-5 py-3">
            <Shimmer className="h-2.5 w-16 rounded" />
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-50">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </tbody>
  </table>
);

/* ─── Mobile card skeleton ─── */
export const MobileCardSkeleton = ({ count = 5 }) => (
  <div className="divide-y divide-slate-100">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 flex items-start gap-3">
        <Shimmer className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-36 rounded" />
          <Shimmer className="h-2.5 w-24 rounded" />
          <Shimmer className="h-2 w-16 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Settings section skeleton ─── */
export const SettingsSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6 pb-20">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Shimmer className="w-9 h-9 rounded-xl" />
          <Shimmer className="h-3 w-40 rounded" />
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: i === 1 ? 3 : 2 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <Shimmer className="h-2.5 w-28 rounded" />
                <Shimmer className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ─── Chart skeleton ─── */
export const ChartSkeleton = () => (
  <div className="space-y-3 pt-4">
    <div className="flex items-end gap-1.5 h-40 w-full px-2">
      {[40, 65, 50, 80, 55, 90, 70, 45, 75, 60, 85, 50].map((h, i) => (
        <Shimmer key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
    <div className="flex justify-between px-2">
      {['Jan','Feb','Mar','Apr','May','Jun'].map(m => (
        <Shimmer key={m} className="h-2 w-6 rounded" />
      ))}
    </div>
  </div>
);

/* ─── Overview insight card skeleton ─── */
export const InsightCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
    <Shimmer className="h-2.5 w-32 rounded" />
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <div className="flex justify-between">
          <Shimmer className="h-2.5 w-20 rounded" />
          <Shimmer className="h-2.5 w-10 rounded" />
        </div>
        <Shimmer className="h-1.5 w-full rounded-full" />
      </div>
    ))}
  </div>
);
