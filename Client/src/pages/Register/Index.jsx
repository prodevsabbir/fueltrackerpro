import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Fuel, User as UserIcon, Mail, Lock, Phone, 
  ArrowRight, ShieldCheck, Truck, Loader2, 
  Eye, EyeOff, CheckCircle2, AlertCircle, ChevronDown 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../helpers/authService';
import { toast } from 'react-toastify';

// Validation Schema matching Backend perfectly
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits').optional().or(z.literal('')),
  password: z.string().min(6, 'Min 6 characters').max(16, 'Max 16 characters'),
  role: z.enum(['rider', 'owner']).default('rider'),
  vehicleType: z.string().optional()
});

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('rider');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'rider'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Ensure role is exactly what was selected
      const response = await authService.register(
        data.name,
        data.email,
        data.phone,
        data.password,
        selectedRole,
        data.vehicleType
      );
      
      if (response.success) {
        toast.success(t.auth?.registerSuccess || 'Account created successfully!');
        // Small delay for UX
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFB] pt-28 pb-10 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[550px]"
      >
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-amber-500 p-4 rounded-3xl shadow-xl shadow-amber-500/20 mb-6">
              <Fuel className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {t.auth.registerTitle}
            </h1>
            <p className="text-slate-400 font-bold text-sm">
              {t.auth.registerSubtitle}
            </p>
          </div>

          {/* Role Selector UI */}
          <div className="mb-10">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-4">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
               <button 
                 type="button"
                 onClick={() => handleRoleSelect('rider')}
                 className={`group flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all relative overflow-hidden ${
                   selectedRole === 'rider' 
                   ? 'border-amber-500 bg-amber-50/50' 
                   : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                 }`}
               >
                  <div className={`p-3 rounded-2xl transition-all ${selectedRole === 'rider' ? 'bg-amber-500 text-white' : 'bg-white text-slate-300'}`}>
                    <Truck size={24} />
                  </div>
                  <div className="text-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest block ${selectedRole === 'rider' ? 'text-amber-700' : 'text-slate-400'}`}>
                      {t.auth.rider}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase mt-1 block">Regular User</span>
                  </div>
                  {selectedRole === 'rider' && <CheckCircle2 className="absolute top-3 right-3 text-amber-500" size={16} />}
               </button>

               <button 
                 type="button"
                 onClick={() => handleRoleSelect('owner')}
                 className={`group flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all relative overflow-hidden ${
                   selectedRole === 'owner' 
                   ? 'border-slate-900 bg-slate-50' 
                   : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                 }`}
               >
                  <div className={`p-3 rounded-2xl transition-all ${selectedRole === 'owner' ? 'bg-slate-900 text-white' : 'bg-white text-slate-300'}`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div className="text-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest block ${selectedRole === 'owner' ? 'text-slate-900' : 'text-slate-400'}`}>
                      {t.auth.owner}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase mt-1 block">Pump Manager</span>
                  </div>
                  {selectedRole === 'owner' && <CheckCircle2 className="absolute top-3 right-3 text-slate-900" size={16} />}
               </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.auth.name}</label>
                {errors.name && <span className="text-[9px] font-black text-red-500 uppercase">{errors.name.message}</span>}
              </div>
              <div className={`relative group transition-all ${errors.name ? 'ring-2 ring-red-100' : ''}`}>
                <UserIcon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                <input 
                  {...register('name')}
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all"
                  placeholder="e.g. John Wick"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.auth.email}</label>
                {errors.email && <span className="text-[9px] font-black text-red-500 uppercase">{errors.email.message}</span>}
              </div>
              <div className={`relative group transition-all ${errors.email ? 'ring-2 ring-red-100' : ''}`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                <input 
                  {...register('email')}
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.auth.phone}</label>
                {errors.phone && <span className="text-[9px] font-black text-red-500 uppercase">{errors.phone.message}</span>}
              </div>
              <div className={`relative group transition-all ${errors.phone ? 'ring-2 ring-red-100' : ''}`}>
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.phone ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                <input 
                  {...register('phone')}
                  type="tel" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all"
                  placeholder="+880 1XXX XXXXXX"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.auth.password}</label>
                {errors.password && <span className="text-[9px] font-black text-red-500 uppercase">{errors.password.message}</span>}
              </div>
              <div className={`relative group transition-all ${errors.password ? 'ring-2 ring-red-100' : ''}`}>
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                <input 
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-all"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Vehicle Type (Only for Rider) */}
            <AnimatePresence>
              {selectedRole === 'rider' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vehicle Type</label>
                    {errors.vehicleType && <span className="text-[9px] font-black text-red-500 uppercase">{errors.vehicleType.message}</span>}
                  </div>
                  <div className={`relative group transition-all ${errors.vehicleType ? 'ring-2 ring-red-100' : ''}`}>
                    <Truck className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.vehicleType ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                    <select 
                      {...register('vehicleType')}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all appearance-none"
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="Bike">Motorcycle / Bike</option>
                      <option value="Car">Private Car</option>
                      <option value="Truck">Truck / Pickup</option>
                      <option value="Bus">Bus</option>
                      <option value="CNG">CNG / Auto Rickshaw</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 mt-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-amber-500" />
              ) : (
                <>
                  {t.auth.registerBtn}
                  <ArrowRight size={18} className="text-amber-500" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-bold text-slate-400">
            {t.auth.hasAccount}{' '}
            <Link to="/login" className="text-amber-600 hover:underline">
              {t.auth.loginBtn}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
