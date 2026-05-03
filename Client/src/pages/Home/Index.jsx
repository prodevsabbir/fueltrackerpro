import React from 'react';
import Banner from '../../components/homePage/Banner/Index';
import PumpList from '../../components/homePage/Pumps/Index';
import MapView from '../../components/homePage/Map/Index';
import UserReports from '../../components/homePage/Reviews/Index';
import { useLanguage } from '../../context/LanguageContext';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FAFAFB]">
      {/* Main Content Area */}
      <div className="w-full max-w-7xl px-2 md:px-4 pt-20 md:pt-24 pb-8 md:pb-16 flex flex-col items-center">

        
        {/* Banner Section */}
        <div className="w-full mb-6 md:mb-8">
          <Banner />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Main List Section */}
          <div className="lg:col-span-7 w-full order-2 lg:order-1">
            <PumpList />
          </div>
          
          {/* Sidebar Section */}
          <div className="lg:col-span-5 w-full order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="mb-4 px-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.sidebar.overview}</p>
            </div>
            <MapView />
            
            <div className="mt-6 p-6 bg-slate-900 rounded-[24px] text-white shadow-xl relative overflow-hidden hidden lg:block">
               <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full -mr-12 -mt-12 blur-xl"></div>
               <h4 className="text-base font-black mb-1.5 text-amber-500">{t.sidebar.tipTitle}</h4>
               <p className="text-xs font-medium opacity-70 leading-relaxed">
                 {t.sidebar.tipDesc}
               </p>
            </div>
          </div>
        </div>

        {/* Intelligence Section */}
        <div className="mt-8 w-full">
          <UserReports />
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
            {t.footer.copy}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
