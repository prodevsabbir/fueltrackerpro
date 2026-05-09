import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { authService } from '../../helpers/authService';
import { toast } from 'react-toastify';
import { HelpCircle } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

const NotificationListener = () => {
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(SOCKET_URL, {
      query: { 
        userId: user._id,
        role: user.role 
      }
    });

    socket.on('connect', () => {
      console.log('📡 Connected to notification socket');
    });

    socket.on('helpline_resolved', (data) => {
      toast.info(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-amber-500" />
            <span className="font-black text-[10px] uppercase tracking-widest">Support Update</span>
          </div>
          <p className="text-xs font-bold text-slate-700">Admin replied to: {data.subject}</p>
          <p className="text-[10px] text-slate-400 font-bold italic line-clamp-1">"{data.reply}"</p>
        </div>,
        {
          autoClose: 6000,
          icon: false
        }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  return null;
};

export default NotificationListener;
