"use client";
import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, ArrowRight, AlertCircle, CheckCircle, Fingerprint, LockKeyhole } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Farmer'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        ...formData,
        email: formData.email.toLowerCase().trim()
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      setSuccess(`Authorization successful. Initializing secure neural session...`);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Auth Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Access denied. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] flex flex-col md:flex-row"
          >
            {/* Visual Sidebar */}
            <div className="hidden md:flex w-5/12 bg-slate-900 p-10 flex-col justify-between text-white relative">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-primary/20">
                     <LockKeyhole size={24} />
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter leading-none mb-6">Secure <br />Access <span className="text-primary italic">Node.</span></h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Accessing centralized agricultural intelligence clusters across regional territories.
                  </p>
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                     <CheckCircle size={14} /> ISO 27001 Protocol
                  </div>
               </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 p-10 lg:p-14 relative">
              <button 
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full" 
                onClick={onClose}
              >
                <X size={20} />
              </button>

              <div className="mb-10">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Enterprise Terminal</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                  {isLogin ? 'Welcome Back' : 'System Enrollment'}
                </h2>
              </div>

              {error && (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                >
                  <AlertCircle size={18} /> {error}
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                >
                  <Fingerprint size={18} className="animate-pulse" /> {success}
                </motion.div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="group">
                    <div className="relative">
                      <User className="absolute left-5 top-5 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Operator Name" 
                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-black text-xs transition-all tracking-tight"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-5 top-5 text-slate-300 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="Terminal ID (Email)" 
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-black text-xs transition-all tracking-tight"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-5 top-5 text-slate-300 transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="Access Key (Password)" 
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-black text-xs transition-all tracking-tight"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                {!isLogin && (
                  <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    {['Farmer', 'Agronomist', 'Admin'].map(r => (
                      <button 
                        key={r}
                        type="button"
                        className={`flex-1 py-3 text-[9px] font-black rounded-xl transition-all uppercase tracking-widest ${formData.role === r ? 'bg-white shadow-sm text-primary border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setFormData({...formData, role: r})}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-4 mt-8"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                       Decrypting Credentials...
                    </div>
                  ) : (
                    <>
                      {isLogin ? 'Initiate Log In' : 'Enroll Operator'} <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-10 text-center">
                <button 
                  className="text-[10px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-[0.2em] border-b border-transparent hover:border-primary"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "New Operator? Request Enrollment" : "Existing Terminal? Sign In Here"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
