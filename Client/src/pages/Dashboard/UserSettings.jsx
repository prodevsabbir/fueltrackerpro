import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Shield, History, Bookmark, 
  LogOut, Camera, Star, Fuel, AlertCircle, 
  CheckCircle2, Loader2, Save, Key, MapPin
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserSettings = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, logout, updateUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: 'Bangladesh'
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || 'Bangladesh'
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // The backend update schema strictly forbids updating the email.
    // We destruct it out to send only the allowed fields.
    const { email, ...updateData } = formData;
    
    try {
      const response = await api.patch('/user/update-user', updateData);
      if (response.data.status === 'ok') {
        toast.success('Profile updated successfully');
        updateUser({ ...user, ...response.data.data });
      }
    } catch (error) {
      // Global toast handles this
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setLoading(true);
    try {
      await api.patch('/user/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      // Global toast handles this
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setLoading(true);
    try {
      const response = await api.patch('/user/update-user', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status === 'ok') {
        toast.success('Profile picture updated');
        updateUser({ ...user, profileImage: response.data.data.profileImage });
      }
    } catch (error) {
      // Global toast handles this
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading) return null;

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile Settings', sub: 'Identity & Info' },
    { id: 'activity', icon: History, label: 'My Activity', sub: 'Reports & Intel' },
    { id: 'saved', icon: Bookmark, label: 'Saved Stations', sub: 'Quick Access' },
    { id: 'security', icon: Shield, label: 'Security', sub: 'Password & Auth' },
  ];

  return (
    <div className="w-full flex flex-col items-center bg-[#FAFAFB] min-h-screen pt-28 pb-20 px-4">
      <div className="w-full max-w-6xl">
        <div className="mb-12 text-center">
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Account <span className="text-amber-500">Settings</span></h1>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">Manage your digital fuel profile</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
           {/* Sidebar */}
           <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mb-6 flex flex-col items-center text-center">
                 <div className="relative group mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-white shadow-xl overflow-hidden flex items-center justify-center group-hover:border-amber-500 transition-all">
                       {user?.profileImage?.secure_url ? (
                         <img src={user.profileImage.secure_url} alt={user.name} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-slate-300 font-black text-3xl">{user?.name?.[0]?.toUpperCase()}</span>
                       )}
                       <div 
                         onClick={() => fileInputRef.current.click()}
                         className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                       >
                          <Camera size={24} className="text-white" />
                       </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{user?.name}</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.role} • Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
              </div>

              <div className="bg-white p-3 rounded-[40px] border border-slate-100 shadow-sm space-y-2">
                {menuItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full p-4 rounded-[32px] flex items-center gap-4 transition-all group ${
                      activeTab === item.id 
                      ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' 
                      : 'hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === item.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-400 group-hover:text-slate-900'}`}>
                       <item.icon size={18} />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</p>
                       <p className={`text-[9px] font-bold mt-1 opacity-60 ${activeTab === item.id ? 'text-slate-300' : 'text-slate-400'}`}>{item.sub}</p>
                    </div>
                  </button>
                ))}
                <button 
                  onClick={handleLogout}
                  className="w-full p-4 rounded-[32px] flex items-center gap-4 text-red-500 hover:bg-red-50 transition-all group"
                >
                  <div className="p-2.5 rounded-2xl bg-red-50 text-red-400 group-hover:text-red-600 transition-colors">
                    <LogOut size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                </button>
              </div>
           </div>

           {/* Main Content Area */}
           <div className="lg:col-span-8 bg-white rounded-[50px] border border-slate-100 p-8 md:p-12 shadow-sm min-h-[600px]">
              
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="mb-10 flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Profile</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Update your personal information</p>
                      </div>
                      <CheckCircle2 className="text-emerald-500" size={32} />
                   </div>

                   <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                            <div className="relative group">
                               <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                               <input 
                                 type="text" 
                                 value={formData.name}
                                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-amber-500 transition-all font-bold text-slate-700 text-sm" 
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                            <div className="relative group">
                               <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                               <input 
                                 type="email" 
                                 disabled
                                 value={formData.email}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none font-bold text-slate-400 text-sm cursor-not-allowed" 
                               />
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                            <div className="relative group">
                               <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                               <input 
                                 type="tel" 
                                 value={formData.phone}
                                 placeholder="+880 1XXX XXXXXX"
                                 onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-amber-500 transition-all font-bold text-slate-700 text-sm" 
                               />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                            <div className="relative group">
                               <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                               <input 
                                 type="text" 
                                 value={formData.city}
                                 placeholder="Dhaka"
                                 onChange={(e) => setFormData({...formData, city: e.target.value})}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-amber-500 transition-all font-bold text-slate-700 text-sm" 
                               />
                            </div>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-slate-900/10 mt-12 text-xs uppercase tracking-widest disabled:opacity-70"
                      >
                         {loading ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <Save size={18} className="text-amber-500" />}
                         Save Profile Changes
                      </button>
                   </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="mb-10">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security & Privacy</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your password and session</p>
                   </div>

                   <form onSubmit={handleUpdatePassword} className="space-y-6">
                      <div className="space-y-2">
                         <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
                         <div className="relative group">
                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
                            <input 
                              type="password" 
                              required
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-amber-500 transition-all font-bold text-slate-700 text-sm" 
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                            <input 
                              type="password" 
                              required
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:bg-white focus:border-amber-500 transition-all font-bold text-slate-700 text-sm" 
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
                            <input 
                              type="password" 
                              required
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:bg-white focus:border-amber-500 transition-all font-bold text-slate-700 text-sm" 
                            />
                         </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-slate-900/10 mt-12 text-xs uppercase tracking-widest disabled:opacity-70"
                      >
                         {loading ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <Shield size={18} className="text-amber-500" />}
                         Update Security Credentials
                      </button>
                   </form>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="text-center py-20">
                   <History size={48} className="text-slate-100 mx-auto mb-4" />
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">No Recent Activity</h3>
                   <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Your reports and intel will appear here</p>
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="text-center py-20">
                   <Bookmark size={48} className="text-slate-100 mx-auto mb-4" />
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">No Saved Stations</h3>
                   <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Bookmark stations for quick tracking</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
