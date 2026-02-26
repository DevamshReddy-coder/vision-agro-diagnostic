"use client";
import React, { useState, useEffect } from 'react';
import { Leaf, Menu, X, User, LogOut, LayoutDashboard, History, Settings, ExternalLink, ChevronDown, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ onLoginClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const sections = ['platform', 'analytics', 'knowledge', 'workflow'];
      const current = sections.find(section => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 120 && rect.bottom >= 120;
        }
        return false;
      });
      if (current) setActiveSection(`#${current}`);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Auth check
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const navLinks = [
    { label: 'Check Crop', href: '#platform', icon: <LayoutDashboard size={18} /> },
    { label: 'Health Insights', href: '#analytics', icon: <History size={18} /> },
    { label: 'Disease Library', href: '#knowledge', icon: <ExternalLink size={18} /> },
    { label: 'How It Works', href: '#workflow', icon: <Settings size={18} /> },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'bg-white/95 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.03)] py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-8 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4 group cursor-pointer lg:min-w-[280px]">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:bg-primary transition-colors"
          >
            <Leaf size={24} fill="currentColor" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-2">
              AGROVISION <span className="text-primary italic">AI</span>
              {isScrolled && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]"
                />
              )}
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 whitespace-nowrap">
              Precision Agricultural Intelligence
            </span>
          </div>
        </div>

        {/* Center: Navigation Nodes */}
        <div className="hidden lg:flex items-center bg-slate-50/50 backdrop-blur-sm p-1 rounded-2xl border border-slate-100/50">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative group overflow-hidden ${
                activeSection === link.href ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="relative z-10">{link.label}</span>
              {activeSection === link.href && (
                <motion.span 
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-white shadow-sm rounded-xl -z-0"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
              {activeSection !== link.href && (
                <span className="absolute inset-0 bg-slate-200/0 group-hover:bg-slate-200/30 -z-0 transition-colors" />
              )}
            </a>
          ))}
        </div>

        {/* Right: Security & Actions */}
        <div className="flex items-center justify-end gap-5 lg:min-w-[280px]">
          {/* Global Event Stream */}
          <NotificationCenter />
          
          {user ? (
            <div className="relative">
              <motion.button 
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all shadow-sm group"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="text-right hidden xl:block">
                  <p className="text-[10px] font-black text-slate-900 leading-none mb-0.5">{user.name}</p>
                  <div className="flex items-center justify-end gap-1.5">
                     <ShieldCheck size={10} className="text-primary" />
                     <p className="text-[8px] text-primary font-black uppercase tracking-widest leading-none">{user.role}</p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-primary transition-colors">
                  <User size={18} />
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-500 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] border border-slate-100 p-2 z-[110]"
                  >
                    <div className="px-5 py-5 border-b border-slate-50 mb-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Connected Session</p>
                      <div className="text-xs font-black text-slate-900 truncate flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        {user.email}
                      </div>
                    </div>
                    <div className="p-1.5 space-y-1">
                      <button className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all uppercase tracking-widest group">
                        <span className="flex items-center gap-3"><Settings size={16} /> Preferences</span>
                        <ChevronDown size={14} className="-rotate-90 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                      <button 
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} /> Secure Exit
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <button 
                className="hidden sm:block text-[10px] font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]"
                onClick={onLoginClick}
              >
                Log In
              </button>
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-slate-900 text-white px-8 py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary transition-all duration-500 h-fit"
                onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Access Lab
              </motion.button>
            </div>
          )}

          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2.5 text-slate-900 bg-slate-50 border border-slate-100 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden origin-top absolute top-full left-0 right-0 z-[90] shadow-2xl"
          >
            <div className="container mx-auto px-8 py-10 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a 
                  key={link.label} 
                  href={link.href} 
                  className={`flex items-center justify-between p-5 text-xs font-black rounded-2xl transition-all uppercase tracking-widest ${
                    activeSection === link.href ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-slate-50 text-slate-900 border border-transparent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${activeSection === link.href ? 'bg-white text-primary shadow-sm' : 'bg-white text-slate-400 shadow-sm'}`}>
                      {link.icon}
                    </div>
                    {link.label}
                  </span>
                  <ChevronDown size={16} className="-rotate-90 opacity-40" />
                </a>
              ))}
              {!user && (
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button 
                    className="py-5 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200"
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onLoginClick) onLoginClick();
                    }}
                  >
                    System Log In
                  </button>
                  <button 
                    className="py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Access Lab
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
