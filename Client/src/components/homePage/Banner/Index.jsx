import React from 'react';
import { Search, Navigation } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const Banner = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full bg-white rounded-2xl md:rounded-[32px] p-4 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[80px] rounded-full -mr-24 -mt-24"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full -ml-24 -mb-24"></div>

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Live Indicator - Fixed Width */}
        <div className="inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full text-amber-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4 whitespace-nowrap min-w-[110px] md:min-w-[130px] justify-center">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
          {t.hero.live}
        </div>
        
        {/* Title - Preserve height and prevent width jumps */}
        <h1 className="text-xl md:text-5xl font-black text-slate-900 mb-2 md:mb-3 tracking-tighter leading-tight min-h-[1.2em] flex flex-wrap justify-center items-center">
          <span className="whitespace-nowrap">{t.hero.title1}</span>
          <span className="text-amber-500 ml-1.5 md:ml-2 whitespace-nowrap">{t.hero.title2}</span>
        </h1>

        {/* Description - Stable height to prevent content jumping below */}
        <p className="text-slate-500 font-medium text-[10px] md:text-base max-w-lg md:max-w-xl mb-6 md:mb-8 leading-relaxed min-h-[3em] md:min-h-[2.5em] flex items-center justify-center px-2">
          {t.hero.desc}
        </p>
        
        {/* Search Container - Stable structure */}
        <div className="w-full max-w-2xl bg-slate-50 p-1 md:p-1.5 rounded-xl md:rounded-2xl flex flex-col md:flex-row items-center gap-1 md:gap-2 border border-slate-200 shadow-inner">
          <div className="flex items-center flex-1 w-full px-2 md:px-3">
            <Search className="text-slate-400 shrink-0" size={14} md:size={18} />
            <input 
              type="text" 
              placeholder={t.hero.searchPlaceholder}
              className="w-full bg-transparent border-none py-2 md:py-3 px-2 md:px-3 font-bold text-slate-700 outline-none placeholder:text-slate-400 text-xs md:text-base"
            />
          </div>
          {/* Search Button - Fixed Width */}
          <button className="w-full md:w-auto bg-slate-900 text-white px-6 md:px-10 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-sm flex items-center justify-center gap-2 hover:bg-black transition-all md:min-w-[150px] shrink-0">
            <Navigation size={14} />
            <span className="whitespace-nowrap">{t.hero.searchBtn}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Banner;
