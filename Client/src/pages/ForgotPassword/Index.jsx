import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Fuel, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-toastify';

const emailSchema = z.object({
  email: z.string().email('Invalid email address')
});

const otpSchema = z.object({
  otp: z.string().min(4, 'OTP is required')
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forms for each step
  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm({
    resolver: zodResolver(emailSchema)
  });

  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm({
    resolver: zodResolver(otpSchema)
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passErrors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onEmailSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/user/forget-password', { email: data.email });
      if (response.data.status === 'ok') {
        setEmail(data.email);
        toast.success('OTP sent to your email');
        setStep(2);
      }
    } catch (error) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/user/verify-otp', { email, otp: data.otp });
      if (response.data.status === 'ok') {
        setToken(response.data.data.token);
        toast.success('OTP verified successfully');
        setStep(3);
      }
    } catch (error) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post(`/user/reset-password/${token}`, { 
        password: data.password,
        confirmPassword: data.confirmPassword 
      });
      if (response.data.status === 'ok') {
        toast.success('Password reset successfully! Please login.');
        navigate('/login');
      }
    } catch (error) {
      // Handled by global interceptor
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
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          
          <div className="flex flex-col items-center mb-10 text-center relative z-10">
            <div className="bg-amber-500 p-4 rounded-3xl shadow-xl shadow-amber-500/20 mb-6">
              <Fuel className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {step === 1 && "Recover Account"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "New Password"}
            </h1>
            <p className="text-slate-400 font-bold text-sm">
              {step === 1 && "Enter your email to receive an OTP."}
              {step === 2 && `We sent a code to ${email}`}
              {step === 3 && "Create a secure new password."}
            </p>
          </div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {/* STEP 1: EMAIL */}
              {step === 1 && (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleEmailSubmit(onEmailSubmit)} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</label>
                      {emailErrors.email && <span className="text-[9px] font-black text-red-500 uppercase">{emailErrors.email.message}</span>}
                    </div>
                    <div className={`relative group ${emailErrors.email ? 'ring-2 ring-red-100' : ''}`}>
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${emailErrors.email ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                      <input 
                        {...registerEmail('email')}
                        type="email" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <>Send OTP <ArrowRight size={18} className="text-amber-500" /></>}
                  </button>
                </motion.form>
              )}

              {/* STEP 2: OTP */}
              {step === 2 && (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleOtpSubmit(onOtpSubmit)} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Enter OTP</label>
                      {otpErrors.otp && <span className="text-[9px] font-black text-red-500 uppercase">{otpErrors.otp.message}</span>}
                    </div>
                    <div className={`relative group ${otpErrors.otp ? 'ring-2 ring-red-100' : ''}`}>
                      <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${otpErrors.otp ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                      <input 
                        {...registerOtp('otp')}
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all tracking-[0.5em]"
                        placeholder="••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <>Verify Code <CheckCircle2 size={18} className="text-amber-500" /></>}
                  </button>
                </motion.form>
              )}

              {/* STEP 3: NEW PASSWORD */}
              {step === 3 && (
                <motion.form 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handlePasswordSubmit(onPasswordSubmit)} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">New Password</label>
                      {passErrors.password && <span className="text-[9px] font-black text-red-500 uppercase">{passErrors.password.message}</span>}
                    </div>
                    <div className={`relative group ${passErrors.password ? 'ring-2 ring-red-100' : ''}`}>
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${passErrors.password ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                      <input 
                        {...registerPassword('password')}
                        type={showPassword ? "text" : "password"} 
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

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Confirm Password</label>
                      {passErrors.confirmPassword && <span className="text-[9px] font-black text-red-500 uppercase">{passErrors.confirmPassword.message}</span>}
                    </div>
                    <div className={`relative group ${passErrors.confirmPassword ? 'ring-2 ring-red-100' : ''}`}>
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${passErrors.confirmPassword ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500'}`} size={18} />
                      <input 
                        {...registerPassword('confirmPassword')}
                        type={showPassword ? "text" : "password"} 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-amber-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <>Reset Password <CheckCircle2 size={18} className="text-amber-500" /></>}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-10 text-center text-sm font-bold text-slate-400 relative z-10">
            Remembered your password?{' '}
            <Link to="/login" className="text-amber-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
