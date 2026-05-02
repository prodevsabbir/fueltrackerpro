import React from 'react';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
);

export const StationCardSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm h-[155px] flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-48 h-3" />
        </div>
      </div>
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-16 h-6" />
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="w-12 h-4 ml-auto" />
        <Skeleton className="w-20 h-3 ml-auto" />
      </div>
    </div>
  </div>
);

export const MapSkeleton = () => (
  <div className="relative w-full h-[400px] rounded-[32px] overflow-hidden bg-slate-100 border border-slate-200 shadow-xl">
    <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
    <div className="absolute bottom-4 left-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-2xl w-[170px] space-y-3">
       <Skeleton className="w-12 h-2" />
       <Skeleton className="w-24 h-4" />
       <Skeleton className="w-20 h-3" />
       <div className="pt-3 border-t border-slate-50 flex justify-between">
          <Skeleton className="w-10 h-2" />
          <Skeleton className="w-4 h-4" />
       </div>
    </div>
  </div>
);

export const StationDetailSkeleton = () => (
  <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 min-h-[800px]">
    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between">
       <Skeleton className="w-20 h-6" />
       <Skeleton className="w-24 h-6 rounded-full" />
    </div>
    <div className="p-8">
       <div className="flex gap-4 mb-10">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-3">
             <Skeleton className="w-64 h-8" />
             <Skeleton className="w-40 h-4" />
          </div>
       </div>
       <div className="space-y-6 mb-12">
          <Skeleton className="w-48 h-4" />
          <div className="grid grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
       </div>
       <div className="border-t border-slate-100 pt-10 space-y-6">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-full h-32 rounded-2xl" />
          <div className="space-y-4">
             {[1,2].map(i => <Skeleton key={i} className="w-full h-24 rounded-2xl" />)}
          </div>
       </div>
    </div>
  </div>
);

export default Skeleton;
