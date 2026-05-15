import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Database, Globe, Save, Mail, Phone, Key, AlertTriangle, Smartphone, UploadCloud, Loader2, X } from 'lucide-react';
import { SettingsSkeleton } from './Skeleton';
import { adminService } from '../../../helpers/adminService';
import { toast } from 'react-toastify';

const Settings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    sessionTimeout: 60,
    maxFailedLogins: 5,
    developerInfo: {
      name: "",
      role: "",
      email: "",
      website: "",
      github: "",
      linkedin: "",
      description: "",
      imageUrl: ""
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Danger Zone State
  const [otpModal, setOtpModal] = useState({ isOpen: false, action: null });
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getSettings();
        if (res.data) setSettings(res.data);
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDevInfoChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      developerInfo: {
        ...prev.developerInfo,
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const initiateDangerAction = async (action) => {
    try {
      await adminService.requestDangerOtp();
      toast.info("Verification code sent to your email");
      setOtpModal({ isOpen: true, action });
      setOtp('');
    } catch (error) {
      toast.error("Failed to request OTP");
    }
  };

  const confirmDangerAction = async () => {
    if (otp.length !== 6) return toast.error("Enter a 6-digit OTP");
    setOtpLoading(true);
    try {
      const res = await adminService.verifyDangerAction(otp, otpModal.action);
      toast.success(res.message || "Action executed successfully");
      setOtpModal({ isOpen: false, action: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP or execution failed");
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* App Configuration */}
      <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="bg-rose-100 p-2 rounded-xl text-rose-600"><Smartphone size={16} md={20} /></div>
          <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-800">App Configuration</h3>
        </div>
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Application Name</label>
              <input type="text" defaultValue="FuelTracker Pro" disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="email" defaultValue="support@fueltracker.com" disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-500 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="tel" defaultValue="+880 1234-567890" disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-500 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Default Currency</label>
              <select disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-500 outline-none">
                <option>BDT (৳)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Global Access Controls */}
      <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Globe size={16} md={20} /></div>
          <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-800">Global Access Controls</h3>
        </div>
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
          <ToggleSwitch 
            title="Platform Maintenance Mode" 
            desc="Disables access to the platform for all non-admin users. Use during major updates." 
            color="bg-amber-500" 
            checked={settings.maintenanceMode} 
            onChange={(val) => handleChange('maintenanceMode', val)}
          />
          <hr className="border-slate-100" />
          <ToggleSwitch 
            title="Allow New Registrations" 
            desc="Toggle whether new users can create accounts via the public app." 
            color="bg-emerald-500" 
            checked={settings.allowRegistrations} 
            onChange={(val) => handleChange('allowRegistrations', val)}
          />
          <hr className="border-slate-100" />
          <ToggleSwitch 
            title="Require Email Verification" 
            desc="Forces users to verify their OTP before accessing the platform." 
            color="bg-emerald-500" 
            checked={settings.requireEmailVerification} 
            onChange={(val) => handleChange('requireEmailVerification', val)}
          />
        </div>
      </div>

      {/* External Integrations */}
      <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><UploadCloud size={16} md={20} /></div>
          <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-800">API & Integrations</h3>
        </div>
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
           <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-500 font-black text-xl border border-slate-100">C</div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-900">Cloudinary Storage</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Used for profile pictures and station images</p>
                 </div>
              </div>
              <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase">Connected</span>
           </div>
           
           <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-red-500 font-black text-xl border border-slate-100">G</div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-900">Google OAuth</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Allows one-click social logins</p>
                 </div>
              </div>
              <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase">Connected</span>
           </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Shield size={16} md={20} /></div>
          <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-800">Security Policies</h3>
        </div>
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Session Timeout (Minutes)</label>
              <input type="number" value={settings.sessionTimeout} onChange={e => handleChange('sessionTimeout', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Max Failed Login Attempts</label>
              <input type="number" value={settings.maxFailedLogins} onChange={e => handleChange('maxFailedLogins', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Developer Intel */}
      <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><SettingsIcon size={16} md={20} /></div>
          <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-800">Developer Intel (About Page)</h3>
        </div>
        <div className="p-4 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Developer Name</label>
              <input type="text" value={settings.developerInfo?.name} onChange={e => handleDevInfoChange('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Professional Role</label>
              <input type="text" value={settings.developerInfo?.role} onChange={e => handleDevInfoChange('role', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Public Email</label>
              <input type="email" value={settings.developerInfo?.email} onChange={e => handleDevInfoChange('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Website / Portfolio</label>
              <input type="url" value={settings.developerInfo?.website} onChange={e => handleDevInfoChange('website', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">GitHub Profile</label>
              <input type="url" value={settings.developerInfo?.github} onChange={e => handleDevInfoChange('github', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">LinkedIn Profile</label>
              <input type="url" value={settings.developerInfo?.linkedin} onChange={e => handleDevInfoChange('linkedin', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Image URL</label>
              <input type="url" value={settings.developerInfo?.imageUrl} onChange={e => handleDevInfoChange('imageUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Short Bio / Description</label>
              <textarea rows={3} value={settings.developerInfo?.description} onChange={e => handleDevInfoChange('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl md:rounded-[24px] border border-red-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
        <div className="p-4 md:p-6 border-b border-red-50 bg-red-50/30 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-xl text-red-600"><AlertTriangle size={16} md={20} /></div>
          <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-red-600">Danger Zone</h3>
        </div>
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-red-100 bg-white">
              <div>
                 <h4 className="font-bold text-sm text-slate-900">Clear Application Cache</h4>
                 <p className="text-xs font-medium text-slate-500 mt-1">Forces all users to re-fetch latest data from the server.</p>
              </div>
              <button onClick={() => initiateDangerAction('clearCache')} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors">Clear Cache</button>
           </div>
           
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-red-100 bg-red-50/50">
              <div>
                 <h4 className="font-bold text-sm text-red-600">Factory Reset Database</h4>
                 <p className="text-xs font-medium text-red-400 mt-1">Permanently deletes all data. Type confirm to execute.</p>
              </div>
              <button onClick={() => initiateDangerAction('factoryReset')} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 text-xs font-black uppercase tracking-widest rounded-xl transition-colors">Erase Data</button>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 sticky bottom-6 z-10">
        <button className="px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all text-center">Discard Changes</button>
        <button onClick={handleSave} disabled={saving} className="bg-[#3E291D] hover:bg-black disabled:opacity-50 text-white px-6 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2 shadow-xl shadow-slate-900/20 transition-all">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="text-amber-500" />} Save Configuration
        </button>
      </div>

      {/* Danger Zone OTP Modal */}
      <AnimatePresence>
        {otpModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border border-red-100"
            >
              <div className="p-6 border-b border-red-50 bg-red-50 flex items-center justify-between text-red-600">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} />
                  <h3 className="text-sm font-black uppercase tracking-widest">Action Authorization</h3>
                </div>
                <button onClick={() => setOtpModal({ isOpen: false, action: null })} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 text-center">
                <Shield size={48} className="mx-auto text-amber-500 mb-4" />
                <h4 className="text-lg font-black text-slate-900 mb-2">2FA Required</h4>
                <p className="text-xs font-bold text-slate-500 mb-6">
                  You are attempting a highly sensitive action: <span className="text-red-600 font-black">{otpModal.action === 'factoryReset' ? 'FACTORY RESET' : 'CLEAR CACHE'}</span>. 
                  <br/>We've sent a 6-digit confirmation code to your email.
                </p>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full text-center tracking-[1em] font-black text-2xl bg-slate-50 border border-slate-200 rounded-xl py-4 outline-none focus:border-red-500 focus:bg-white transition-all mb-6"
                />
                <button 
                  onClick={confirmDangerAction}
                  disabled={otp.length !== 6 || otpLoading}
                  className="w-full bg-red-600 disabled:opacity-50 hover:bg-red-700 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {otpLoading && <Loader2 size={16} className="animate-spin" />} Confirm Execution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

const ToggleSwitch = ({ title, desc, checked, onChange, color }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex-1">
      <h4 className="text-xs md:text-sm font-bold text-slate-900">{title}</h4>
      <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-0.5 max-w-md">{desc}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`w-9 h-5 md:w-11 md:h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:${color}`}></div>
    </label>
  </div>
);

export default Settings;
