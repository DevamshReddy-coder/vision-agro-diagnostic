"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, ShieldCheck, CheckCircle2, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // 1. Establish WebSocket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : 'http://localhost:5000');

    // 2. Listen for critical alerts from the AI / Environment Engine
    socketRef.current.on('alert_critical', (data) => {
      addNotification({
        id: crypto.randomUUID(),
        type: 'CRITICAL',
        title: 'High-Risk Geo-Cluster Detected',
        message: data.payload?.message || 'Regional outbreak probability exceeded safety thresholds.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      });
    });

    // 3. Listen for AI Inference Completion
    socketRef.current.on('inference_progress', (data) => {
      if (data.status === 'COMPLETED') {
        addNotification({
          id: crypto.randomUUID(),
          type: 'SUCCESS',
          title: 'Neural Analysis Complete',
          message: `Inference finished. Classified as: ${data.result?.name || 'Unknown'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        });
      }
    });

    // 4. Mock Initial Data purely for visual context if empty initially
    setNotifications([
      {
        id: 'initial-1',
        type: 'INFO',
        title: 'System Initialized',
        message: 'AgroVision Telemetry Gateway is securely connected.',
        time: 'Just now',
        read: false,
      }
    ]);
    setHasUnread(true);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      socketRef.current.disconnect();
    };
  }, []);

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev].slice(0, 10)); // Keep last 10
    setHasUnread(true);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
       setHasUnread(false);
       // Mark all as read conceptually
       setNotifications(prev => prev.map(n => ({...n, read: true})));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button 
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDropdown}
        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 hover:text-slate-900 transition-colors relative group"
      >
        <Bell size={18} className="group-hover:scale-110 transition-transform" />
        
        {/* Unread Badge indicator */}
        <AnimatePresence>
          {hasUnread && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            >
              <div className="absolute inset-0 w-full h-full bg-red-500 rounded-full animate-ping opacity-50"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-[110]"
          >
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
              <div>
                 <h4 className="text-sm font-black tracking-tight flex items-center gap-2">
                    <History size={16} className="text-emerald-400" /> Activity Log
                 </h4>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Real-Time Event Stream</p>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-white/10 rounded-lg text-white">
                 Live
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto w-full">
               {notifications.length === 0 ? (
                 <div className="p-10 text-center flex flex-col items-center">
                    <ShieldCheck size={32} className="text-slate-200 mb-3" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">System Quiet <br/> No active alerts</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                   {notifications.map((notif) => (
                      <div key={notif.id} className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-slate-50/50' : ''}`}>
                         <div className="mt-0.5 shrink-0">
                            {notif.type === 'CRITICAL' && <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100"><AlertTriangle size={16} /></div>}
                            {notif.type === 'SUCCESS' && <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100"><CheckCircle2 size={16} /></div>}
                            {notif.type === 'INFO' && <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200"><Bell size={16} /></div>}
                         </div>
                         <div>
                            <div className="flex justify-between items-start gap-2 mb-1">
                               <h5 className="text-xs font-black text-slate-900 tracking-tight leading-none">{notif.title}</h5>
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 leading-snug">{notif.message}</p>
                         </div>
                      </div>
                   ))}
                 </div>
               )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-center">
               <button 
                  className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                  onClick={() => setNotifications([])}
               >
                  Clear Terminal Log
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
