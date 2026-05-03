import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, MessageSquare, 
  Settings, Activity, User, LogOut,
  Bell, BarChart2, Menu, X, ChevronRight, Globe, Home
} from 'lucide-react';
import { BsFillFuelPumpFill } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

// Import Sub-components
import Overview from './components/Overview';
import ManageStations from './components/ManageStations';
import ManageUsers from './components/ManageUsers';
import ManageReviews from './components/ManageReviews';
import Analytics from './components/Analytics';
import Notifications from './components/Notifications';
import SettingsComponent from './components/Settings';

const NAV_ITEMS = [
  { key: 'overview',      icon: LayoutDashboard,     label: 'Overview',       group: 'main' },
  { key: 'stations',      icon: BsFillFuelPumpFill,   label: 'Stations',       group: 'main' },
  { key: 'users',         icon: Users,                label: 'Users',          group: 'main' },
  { key: 'reviews',       icon: MessageSquare,        label: 'Reviews',        group: 'main' },
  { key: 'analytics',     icon: BarChart2,            label: 'Analytics',      group: 'system' },
  { key: 'notifications', icon: Bell,                 label: 'Notifications',  group: 'system' },
  { key: 'settings',      icon: Settings,             label: 'Settings',       group: 'system' },
];

const BOTTOM_NAV = ['overview', 'stations', 'users', 'analytics', 'settings'];

const AdminDashboard = () => {
  const { user: currentUser, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNav = (key) => {
    setActiveTab(key);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':       return <Overview key="overview" />;
      case 'stations':       return <ManageStations key="stations" />;
      case 'users':          return <ManageUsers key="users" />;
      case 'reviews':        return <ManageReviews key="reviews" />;
      case 'analytics':      return <Analytics key="analytics" />;
      case 'notifications':  return <Notifications key="notifications" />;
      case 'settings':       return <SettingsComponent key="settings" />;
      default: return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="h-full flex items-center justify-center">
          <div className="text-center">
            <Activity size={48} className="text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-400">Section Under Construction</h2>
          </div>
        </motion.div>
      );
    }
  };

  const activeItem = NAV_ITEMS.find(n => n.key === activeTab);
  const activeLabel = activeItem?.label || activeTab;

  return (
    <div className="fixed inset-0 z-[3000] flex bg-[#F5F5F7] font-inter overflow-hidden">

      {/* ─── MOBILE OVERLAY ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR ─── */}
      {/* Desktop: always visible. Mobile: slides in/out */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={`
          fixed md:relative inset-y-0 left-0
          w-[240px] bg-[#2C1A10] flex flex-col h-full shadow-2xl z-40 shrink-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-1.5 rounded-lg shadow-lg shadow-amber-500/30">
              <BsFillFuelPumpFill className="text-white" size={16} />
            </div>
            <div>
              <span className="text-white font-black text-sm tracking-tight block">
                FUEL<span className="text-amber-500">TRACKER</span>
              </span>
              <span className="text-[8px] font-black text-red-400 uppercase tracking-[0.2em]">Admin Panel</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white p-1 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 flex items-center gap-3 mx-3 my-3 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 overflow-hidden border-2 border-amber-400/50 shrink-0 shadow-lg shadow-amber-500/20">
            {currentUser?.profileImage?.secure_url ? (
              <img src={currentUser.profileImage.secure_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-black text-base flex items-center justify-center h-full">
                {currentUser?.name?.[0]?.toUpperCase() || 'A'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-xs leading-tight truncate">{currentUser?.name}</p>
            <p className="text-amber-500 font-bold text-[9px] uppercase tracking-widest mt-0.5">{currentUser?.role}</p>
          </div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 shadow shadow-emerald-400/50" title="Online" />
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide space-y-6 mt-2">
          <div>
            <p className="text-white/25 text-[8px] font-black uppercase tracking-[0.25em] mb-2 px-2">Main</p>
            {NAV_ITEMS.filter(n => n.group === 'main').map(item => (
              <SidebarItem key={item.key} icon={item.icon} label={item.label}
                active={activeTab === item.key} onClick={() => handleNav(item.key)} />
            ))}
          </div>
          <div>
            <p className="text-white/25 text-[8px] font-black uppercase tracking-[0.25em] mb-2 px-2">System</p>
            {NAV_ITEMS.filter(n => n.group === 'system').map(item => (
              <SidebarItem key={item.key} icon={item.icon} label={item.label}
                active={activeTab === item.key} onClick={() => handleNav(item.key)}
                badge={item.key === 'notifications' ? 2 : undefined}
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link to="/"
            className="w-full flex items-center gap-3 text-white/40 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold">
            <Home size={15} />
            Back to Site
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 text-white/40 hover:text-red-400 hover:bg-red-500/5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">

        {/* ─── TOP BAR ─── */}
        <div className="h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm z-20">
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              <Menu size={18} />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Admin</span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight capitalize">{activeLabel}</h1>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Manage System Data</p>
            </div>
          </div>

          {/* Right: lang toggle + bell + user */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all"
            >
              <Globe size={12} className="text-amber-500" />
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => handleNav('notifications')}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 hover:bg-amber-50 hover:border-amber-200 transition-all text-slate-500 hover:text-amber-600"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-100 hidden sm:block" />

            {/* User Avatar + Name */}
            <div className="flex items-center gap-2.5">
              <div className="hidden md:block text-right">
                <p className="text-[11px] font-black text-slate-900 leading-tight tracking-tight">{currentUser?.name}</p>
                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">{currentUser?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 transition-colors shrink-0 cursor-pointer">
                {currentUser?.profileImage?.secure_url ? (
                  <img src={currentUser.profileImage.secure_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber-500 flex items-center justify-center">
                    <span className="text-white font-black text-sm">
                      {currentUser?.name?.[0]?.toUpperCase() || 'A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── CONTENT AREA ─── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide bg-[#F5F5F7] pb-20 md:pb-8">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>

        {/* ─── MOBILE BOTTOM NAV ─── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2C1A10] border-t border-white/10 flex items-center justify-around px-2 h-16">
          {BOTTOM_NAV.map(key => {
            const item = NAV_ITEMS.find(n => n.key === key);
            if (!item) return null;
            const Icon = item.icon;
            const isActive = activeTab === key;
            return (
              <button key={key} onClick={() => handleNav(key)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${isActive ? 'text-amber-500' : 'text-white/40 hover:text-white/70'}`}>
                <Icon size={20} />
                <span className={`text-[8px] font-black uppercase tracking-wider`}>
                  {item.label.slice(0, 5)}
                </span>
                {isActive && <span className="w-1 h-1 bg-amber-500 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-0.5 ${
      active
        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={16} className={active ? 'text-amber-400' : 'text-white/30'} />
      <span className="text-xs font-bold">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {badge && (
        <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center">{badge}</span>
      )}
      {active && <ChevronRight size={12} className="text-amber-400/60" />}
    </div>
  </button>
);

export default AdminDashboard;
