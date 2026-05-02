import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Fuel, Mail, Lock, ArrowRight, Github, Chrome, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password, data.rememberMe);
      if (result.success) {
        toast.success(t.auth?.loginSuccess || 'Logged in successfully!');
        if (result.user.role === 'owner') {
          navigate('/dashboard/pump');
        } else if (result.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFB] pt-20 pb-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px]"
      >
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-amber-500 p-4 rounded-3xl shadow-xl shadow-amber-500/20 mb-6">
              <Fuel className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {t.auth.loginTitle}
            </h1>
            <p className="text-slate-400 font-bold text-sm">
              {t.auth.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.auth.email}</label>
                {errors.email && <span className="text-[9px] font-black text-red-500 uppercase">{errors.email.message}</span>}
              </div>
              <div className={`relative group ${errors.email ? 'ring-2 ring-red-100' : ''}`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                <input 
                  {...register('email')}
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.auth.password}</label>
                <Link to="/forgot-password" className="text-[9px] font-black uppercase text-amber-600 hover:underline">
                  {t.auth.forgot}
                </Link>
              </div>
              <div className={`relative group ${errors.password ? 'ring-2 ring-red-100' : ''}`}>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1">
               <input 
                 {...register('rememberMe')}
                 type="checkbox" 
                 id="remember"
                 className="w-4 h-4 rounded border-slate-200 text-amber-500 focus:ring-amber-500"
               />
               <label htmlFor="remember" className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">
                  Remember me for 30 days
               </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-amber-500" />
              ) : (
                <>
                  {t.auth.loginBtn}
                  <ArrowRight size={18} className="text-amber-500" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-300">{t.auth.socialLogin}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 py-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                <Chrome size={18} className="text-slate-600" />
                <span className="text-[10px] font-black text-slate-600">Google</span>
             </button>
             <button className="flex items-center justify-center gap-2 py-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                <Github size={18} className="text-slate-600" />
                <span className="text-[10px] font-black text-slate-600">Github</span>
             </button>
          </div>

          <p className="mt-10 text-center text-sm font-bold text-slate-400">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-amber-600 hover:underline">
              {t.auth.registerBtn}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
