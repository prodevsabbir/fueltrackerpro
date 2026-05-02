import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, MessageSquare, 
  Settings, Activity, User, LogOut,
  Bell, BarChart2, Menu, X, ChevronRight
} from 'lucide-react';
import { BsFillFuelPumpFill } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
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

  const activeLabel = NAV_ITEMS.find(n => n.key === activeTab)?.label || activeTab;

  return (
    <div className="fixed inset-0 z-[3000] flex bg-[#FAFAFB] font-inter overflow-hidden">

      {/* ─── MOBILE OVERLAY ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR ─── */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.div
            initial={false}
            animate={{ x: sidebarOpen ? 0 : '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed md:relative md:translate-x-0 md:flex w-64 bg-[#3E291D] flex-col h-full shadow-2xl z-40 shrink-0"
            style={{ display: 'flex' }}
          >
            {/* Logo */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-1.5 rounded-lg">
                  <BsFillFuelPumpFill className="text-white" size={18} />
                </div>
                <span className="text-white font-black text-base tracking-tight">
                  FUEL<span className="text-amber-500">TRACKER</span>
                  <span className="bg-red-600 text-white text-[7px] px-1 py-0.5 rounded ml-1 align-top uppercase">Admin</span>
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* User Profile */}
            <div className="px-5 py-3 flex items-center gap-3 border-b border-white/5 mb-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 overflow-hidden border-2 border-amber-400 shrink-0">
                {currentUser?.profileImage?.secure_url ? (
                  <img src={currentUser.profileImage.secure_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-white m-auto mt-1.5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">{currentUser?.name}</p>
                <p className="text-amber-500 font-bold text-[9px] uppercase tracking-widest">{currentUser?.role}</p>
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide space-y-5">
              <div>
                <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em] mb-1.5 px-2">Main</p>
                {NAV_ITEMS.filter(n => n.group === 'main').map(item => (
                  <SidebarItem key={item.key} icon={item.icon} label={item.label}
                    active={activeTab === item.key} onClick={() => handleNav(item.key)} />
                ))}
              </div>
              <div>
                <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em] mb-1.5 px-2">System</p>
                {NAV_ITEMS.filter(n => n.group === 'system').map(item => (
                  <SidebarItem key={item.key} icon={item.icon} label={item.label}
                    active={activeTab === item.key} onClick={() => handleNav(item.key)} />
                ))}
              </div>
            </div>

            {/* Sign Out */}
            <div className="p-3 border-t border-white/5">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 text-white/40 hover:text-amber-500 hover:bg-white/5 p-3 rounded-xl transition-all text-sm font-bold">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">

        {/* Top Header */}
        <div className="h-14 md:h-[72px] bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-base md:text-xl font-black text-slate-900 tracking-tight capitalize leading-tight">{activeLabel}</h1>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Manage System Data</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
              {currentUser?.profileImage?.secure_url ? (
                <img src={currentUser.profileImage.secure_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <User size={14} className="text-slate-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 scrollbar-hide bg-[#FAFAFB] pb-20 md:pb-8">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>

        {/* ─── MOBILE BOTTOM NAV ─── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#3E291D] border-t border-white/10 flex items-center justify-around px-2 h-16 safe-area-inset-bottom">
          {BOTTOM_NAV.map(key => {
            const item = NAV_ITEMS.find(n => n.key === key);
            if (!item) return null;
            const Icon = item.icon;
            const isActive = activeTab === key;
            return (
              <button key={key} onClick={() => handleNav(key)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${isActive ? 'text-amber-500' : 'text-white/40'}`}>
                <Icon size={20} className={isActive ? 'text-amber-500' : 'text-white/40'} />
                <span className={`text-[8px] font-black uppercase tracking-wider ${isActive ? 'text-amber-500' : 'text-white/40'}`}>
                  {item.label.slice(0, 5)}
                </span>
                {isActive && <span className="w-1 h-1 bg-amber-500 rounded-full mt-0.5" />}
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
    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-0.5 ${
      active ? 'bg-amber-500/15 text-amber-500' : 'text-white/60 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={17} className={active ? 'text-amber-500' : 'text-white/40'} />
      <span className="text-sm font-bold">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{badge}</span>
    )}
    {active && <ChevronRight size={14} className="text-amber-500/60" />}
  </button>
);

export default AdminDashboard;
