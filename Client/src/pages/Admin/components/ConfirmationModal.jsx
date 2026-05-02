import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check, Trash2, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning', // 'warning', 'danger', 'success'
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  const themes = {
    danger: {
      icon: <Trash2 className="text-red-500" size={24} />,
      bg: 'bg-red-50',
      border: 'border-red-100',
      button: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
      glow: 'shadow-red-500/10'
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
      glow: 'shadow-amber-500/10'
    },
    success: {
      icon: <Check className="text-emerald-500" size={24} />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
      glow: 'shadow-emerald-500/10'
    }
  };

  const theme = themes[type] || themes.warning;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl ${theme.glow} border border-slate-100`}
          >
            {/* Top Pattern Decoration */}
            <div className={`absolute top-0 left-0 w-full h-24 ${theme.bg} opacity-50 pointer-events-none`} style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

            <div className="relative p-10 pt-12 text-center">
              {/* Icon Circle */}
              <div className={`w-20 h-20 mx-auto rounded-3xl ${theme.bg} flex items-center justify-center mb-6 shadow-inner border ${theme.border}`}>
                 {theme.icon}
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                {title}
              </h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed px-4">
                {message}
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
                <button 
                  onClick={onClose}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full sm:flex-1 py-4 px-6 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${theme.button}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            {/* Subtle Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
