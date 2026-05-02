import React, { useState, useEffect } from 'react';
import { Fuel, Menu, User, PlusCircle, Globe, X, Map as MapIcon, Settings, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

const Navbar = () => {
  const { lang, toggleLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login');
  };

  const menuItems = [
    { label: t.pumps.viewMap, icon: <MapIcon size={18} />, path: '/map' },
    { label: t.navbar.register, icon: <PlusCircle size={18} />, path: '/register' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[2000] w-full bg-white/95 backdrop-blur-md border-b border-slate-200 py-2 md:py-2.5 flex justify-center shadow-sm">
      <div className="w-full max-w-7xl px-4 h-14 md:h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 no-underline shrink-0">
          <div className="bg-amber-500 p-1.5 md:p-2 rounded-xl shadow-lg shadow-amber-500/20">
            <Fuel className="text-white" size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm md:text-lg font-black tracking-tighter text-slate-900 leading-none uppercase whitespace-nowrap">
              FUEL<span className="text-amber-500">TRACKER</span>
            </span>
            <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">
              {t.navbar.intel}
            </span>
          </div>
        </Link>

        {/* Desktop Action Section */}
        <div className="hidden lg:flex items-center gap-4">
          <button 
            onClick={toggleLang}
            className="flex items-center justify-center gap-1.5 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
          >
            <Globe size={14} className="text-amber-500" />
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>

          {user ? (
            <div className="flex items-center gap-6 border-l border-slate-100 pl-6">
               <div className="flex items-center gap-3 group cursor-pointer relative">
                  <div className="text-right hidden md:block">
                     <p className="text-[11px] font-black text-slate-900 leading-tight tracking-tight uppercase">{user.name}</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center group-hover:border-amber-500 transition-all">
                       {user?.profileImage?.secure_url ? (
                         <img src={user.profileImage.secure_url} alt={user.name} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-slate-400 font-black text-xs">{user?.name?.[0]?.toUpperCase()}</span>
                       )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                  </div>

                  {/* Desktop Hover Menu */}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-[24px] shadow-2xl shadow-slate-900/10 border border-slate-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-[2010]">
                     <div className="px-4 pb-3 mb-2 border-b border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Account</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
                     </div>
                     
                     {user.role !== 'rider' && (
                       <Link to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard/pump'} className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                          <LayoutDashboard size={16} className="text-slate-400" />
                          {t.navbar.dashboard}
                       </Link>
                     )}

                     <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        <Settings size={16} className="text-slate-400" />
                        {t.navbar.settings}
                     </Link>

                     <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-red-600 hover:bg-red-50 transition-all uppercase tracking-widest mt-1 border-t border-slate-50 pt-3"
                     >
                        <LogOut size={16} />
                        {t.navbar.logout}
                     </button>
                  </div>
               </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
                 <Link to="/register" className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-amber-600 transition-colors">
                   <PlusCircle size={16} />
                   {t.navbar.register}
                 </Link>
              </div>
              <Link to="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-900/10">
                <User size={14} className="text-amber-500" />
                <span>{t.navbar.login}</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 bg-slate-100 rounded-xl active:scale-95 transition-all border border-slate-200 overflow-hidden flex items-center justify-center ${user ? 'w-10 h-10' : 'w-10 h-10 text-slate-700 bg-slate-100'}`}
          >
            {isOpen ? (
              <X size={20} className="text-slate-700" />
            ) : user ? (
              user?.profileImage?.secure_url ? (
                <img src={user.profileImage.secure_url} alt={user.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-slate-500 font-black text-sm">{user?.name?.[0]?.toUpperCase()}</span>
              )
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-white border-b border-slate-200 lg:hidden overflow-hidden shadow-2xl"
          >
            <div className="p-4 flex flex-col gap-2.5">
              {/* User Profile Header */}
              {user && (
                <div className="flex items-center gap-3 p-3 mb-1 bg-slate-50 rounded-[16px] border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {user?.profileImage?.secure_url ? (
                      <img src={user.profileImage.secure_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 truncate leading-tight">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest mt-0.5">{user.role}</p>
                  </div>
                </div>
              )}

              {/* Main Links */}
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 bg-white rounded-[14px] text-xs font-black text-slate-700 uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100"
                >
                  <div className="text-amber-500">{item.icon}</div>
                  {item.label}
                </Link>
              ))}

              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-2.5 mt-1">
                <button 
                  onClick={() => { toggleLang(); setIsOpen(false); }}
                  className="flex items-center justify-center gap-2 p-3.5 bg-white rounded-[14px] border border-slate-100 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Globe size={16} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                    {lang === 'en' ? 'বাংলা' : 'English'}
                  </span>
                </button>

                {user ? (
                   <Link 
                     to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard/pump'} 
                     onClick={() => setIsOpen(false)}
                     className="flex items-center justify-center gap-2 p-3.5 bg-slate-900 text-white rounded-[14px] hover:bg-black transition-all shadow-md shadow-slate-900/10"
                   >
                     <LayoutDashboard size={16} className="text-amber-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest">
                       {t.navbar.dashboard}
                     </span>
                   </Link>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 p-3.5 bg-slate-900 text-white rounded-[14px] hover:bg-black transition-all shadow-md shadow-slate-900/10"
                  >
                    <LogIn size={16} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t.navbar.login}
                    </span>
                  </Link>
                )}
              </div>

              {/* Secondary Actions */}
              {user && (
                 <div className="grid grid-cols-2 gap-2.5 mt-0.5">
                   <Link 
                     to="/settings"
                     onClick={() => setIsOpen(false)}
                     className="flex items-center justify-center gap-2 p-3.5 bg-white rounded-[14px] border border-slate-100 hover:bg-slate-50 transition-all shadow-sm"
                   >
                     <Settings size={16} className="text-slate-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                       {t.navbar.settings}
                     </span>
                   </Link>
                   <button 
                     onClick={handleLogout}
                     className="flex items-center justify-center gap-2 p-3.5 bg-red-50 rounded-[14px] border border-red-100 hover:bg-red-100 transition-all text-red-600 shadow-sm"
                   >
                     <LogOut size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">
                       {t.navbar.logout}
                     </span>
                   </button>
                 </div>
              )}

              {/* Branding Subtext */}
              <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] py-3 mt-1">
                Powered by Community Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
