"use client";
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Leaf, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Google Icon SVG component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ─── Reusable Input Field ─────────────────────────────────────────────────────
const InputField = ({ icon: Icon, type = 'text', placeholder, value, onChange, required, children }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="group relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
        <Icon size={18} />
      </div>
      <input
        type={isPassword ? (showPwd ? 'text' : 'password') : type}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all duration-200"
        required={required}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
      {isPassword && (
        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
      {children}
    </div>
  );
};

// ─── Main Modal Content (Wrapped underneath so hooks work) ──────────────────
const AuthModalContentUI = ({ onClose, screen, setScreen, error, setError, success, setSuccess, loading, setLoading, formData, setFormData, handleLogin, handleRegister }) => {
  const isRegister = screen === 'register';
  const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }));

  // ── Google Server Auth ────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true); setError('');
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await axios.post(`${base}/auth/google`, { token: credentialResponse.credential });
      const data = res.data;
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data));
      
      // Set cookies for Next.js Middleware compatibility
      const token = data.access_token || data.token;
      const role = data.user?.role || data.role || 'Farmer';
      document.cookie = `auth-token=${token}; path=/; max-age=604800; samesite=lax`;
      document.cookie = `user-role=${role}; path=/; max-age=604800; samesite=lax`;

      setSuccess('Google authorization successful! Loading workspace...');
      setTimeout(() => { onClose(); window.location.reload(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Auth failed on server.');
      setLoading(false);
    }
  };
  
  const handleGoogleError = () => {
    setError('Google Sign-In popup was closed or failed.');
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-[0_60px_120px_rgba(0,0,0,0.25)] overflow-hidden"
          >
            {/* ── Header strip ── */}
            <div className="bg-slate-950 px-8 pt-12 pb-10 relative overflow-hidden">
              {/* Neural Grid Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-slate-900"></div>

              {/* Close button */}
              <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all p-2 bg-white/5 hover:bg-white/10 rounded-xl z-20">
                <X size={20} />
              </button>

              {/* Brand mark */}
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] relative group">
                  <Leaf size={22} className="text-white group-hover:scale-110 transition-transform" fill="currentColor" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div className="flex flex-col">
                   <span className="text-white font-black text-sm tracking-widest uppercase">AGROVISION <span className="text-emerald-400">AI</span></span>
                   <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-[0.4em] mt-1">Auth Protocol Active</span>
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-white font-black text-3xl leading-none tracking-tighter uppercase">
                  {isRegister ? 'New Account' : 'Welcome Sync'}
                </h2>
                <p className="text-slate-400 text-[11px] mt-3 font-black uppercase tracking-widest">
                  {isRegister
                    ? 'Join the global agricultural sync'
                    : 'Access your neural dashboard'}
                </p>
              </div>
            </div>

            {/* ── Form Body ── */}
            <div className="px-8 py-7">
              <AnimatePresence mode="wait">
                {/* ── Alerts ── */}
                {(error || success) && (
                  <motion.div
                    key={error || success}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mb-5 p-4 rounded-2xl flex items-start gap-3 text-sm font-medium ${
                      error ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                    }`}
                  >
                    {error ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
                    {error || success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Login Screen ─── */}
              {!isRegister && (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Google SSO */}
                  <div className="flex justify-center mb-1">
                    {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        width="100%"
                        text="continue_with"
                        shape="pill"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setError('Google OAuth is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.')}
                        className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <GoogleIcon /> Continue with Google
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-400 font-semibold">or sign in with email</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <InputField icon={Mail} type="email" placeholder="Email address" value={formData.email} onChange={set('email')} required />
                  <InputField icon={Lock} type="password" placeholder="Password" value={formData.password} onChange={set('password')} required />

                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-emerald-600 font-semibold hover:underline">Forgot password?</button>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 mt-2"
                  >
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</> : <>Sign In <ArrowRight size={18} /></>}
                  </motion.button>
                </form>
              )}

              {/* ─── Register Screen ─── */}
              {isRegister && (
                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Google SSO */}
                  <div className="flex justify-center mb-1">
                    {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        width="100%"
                        text="signup_with"
                        shape="pill"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setError('Google OAuth is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.')}
                        className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <GoogleIcon /> Sign up with Google
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-400 font-semibold">or register with email</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <InputField icon={User} placeholder="Full name" value={formData.name} onChange={set('name')} required />
                  <InputField icon={Mail} type="email" placeholder="Email address" value={formData.email} onChange={set('email')} required />
                  <InputField icon={Lock} type="password" placeholder="Create password (min 8 chars)" value={formData.password} onChange={set('password')} required />

                  {/* Role selector */}
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                    {['Farmer', 'Agronomist', 'Admin'].map(r => (
                      <button
                        key={r} type="button"
                        className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${formData.role === r ? 'bg-white shadow-sm text-emerald-600 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setFormData(f => ({ ...f, role: r }))}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 mt-2"
                  >
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</> : <>Create Account <ArrowRight size={18} /></>}
                  </motion.button>

                  <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                    By signing up you agree to our{' '}
                    <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">Terms of Service</span>
                    {' '}&amp;{' '}
                    <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>
                  </p>
                </form>
              )}

              {/* ─── Toggle ─── */}
              <p className="text-center text-sm text-slate-500 mt-6">
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  onClick={() => { setScreen(isRegister ? 'login' : 'register'); setError(''); setSuccess(''); }}
                  className="font-black text-emerald-600 hover:underline"
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
    </AnimatePresence>
  );
};

// ─── Main AuthModal Component (The Wrapper) ──────────────────────────────────
export default function AuthModal({ isOpen, onClose, initialScreen }) {
  const [screen, setScreen] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'Farmer',
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setScreen(initialScreen || 'login'); setError(''); setSuccess('');
      setFormData({ name: '', email: '', password: '', role: 'Farmer' });
    }
  }, [isOpen, initialScreen]);

  // ── Submit Login ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await axios.post(`${base}/auth/login`, {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      const data = res.data;
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data));
      
      // Set cookies for Next.js Middleware compatibility
      const token = data.access_token || data.token;
      const role = data.user?.role || data.role || 'Farmer';
      document.cookie = `auth-token=${token}; path=/; max-age=604800; samesite=lax`;
      document.cookie = `user-role=${role}; path=/; max-age=604800; samesite=lax`;

      setSuccess('Welcome back! Loading your workspace...');
      setTimeout(() => { onClose(); window.location.reload(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect email or password. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Submit Register ───────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true); setError('');
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await axios.post(`${base}/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
      });
      const data = res.data;
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data));
      
      // Set cookies for Next.js Middleware compatibility
      const token = data.access_token || data.token;
      const role = data.user?.role || data.role || 'Farmer';
      document.cookie = `auth-token=${token}; path=/; max-age=604800; samesite=lax`;
      document.cookie = `user-role=${role}; path=/; max-age=604800; samesite=lax`;

      setSuccess('Account created! Setting up your workspace...');
      setTimeout(() => { onClose(); window.location.reload(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. This email may already be registered.');
    } finally { setLoading(false); }
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id';

  if (!isOpen) return null;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthModalContentUI 
        onClose={onClose} screen={screen} setScreen={setScreen} 
        error={error} setError={setError} success={success} setSuccess={setSuccess}
        loading={loading} setLoading={setLoading} formData={formData} setFormData={setFormData}
        handleLogin={handleLogin} handleRegister={handleRegister}
      />
    </GoogleOAuthProvider>
  );
}
