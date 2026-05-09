import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Send, User, Mail, MessageSquare, Loader2, Phone, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { helplineService } from '../../helpers/helplineService';
import { authService } from '../../helpers/authService';
import { toast } from 'react-toastify';

const Helpline = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = authService.getCurrentUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isGuest = !currentUser;
    
    if (!formData.message.trim()) {
      toast.error(t.helpline.error);
      return;
    }

    if (isGuest && !formData.email.trim()) {
      toast.error(t.helpline.errorEmail);
      return;
    }

    setLoading(true);
    try {
      const response = await helplineService.createRequest(formData);
      if (response.status === 'ok') {
        toast.success(t.helpline.success);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setIsOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[320px] md:w-[380px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="bg-slate-900 p-6 text-white relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-none">{t.helpline.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.helpline.subtitle}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-3">
                {currentUser ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                       <CheckCircle2 size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.helpline.verified}</p>
                       <p className="text-xs font-bold text-slate-700">{currentUser.name}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative group">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder={t.helpline.placeholderName}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative group">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                        <input 
                          type="text" 
                          placeholder={t.helpline.placeholderEmail}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all"
                        />
                      </div>
                      <div className="relative group">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                        <input 
                          type="text" 
                          placeholder={t.helpline.placeholderPhone}
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="relative group">
                  <MessageSquare size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder={t.helpline.placeholderSubject}
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <textarea 
                  placeholder={t.helpline.placeholderMessage}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all h-24 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="text-amber-500" />}
                {t.helpline.submit}
              </button>

              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                {t.helpline.responseNote}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-white text-slate-900 rotate-90' : 'bg-slate-900 text-amber-500'
        }`}
      >
        {isOpen ? <X size={28} /> : <HelpCircle size={28} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};

export default Helpline;
