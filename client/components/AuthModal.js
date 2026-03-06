"use client";
import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Shield, ArrowRight, AlertCircle, CheckCircle2, Fingerprint, Leaf, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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

// ─── OTP Input Grid ───────────────────────────────────────────────────────────
const OtpInput = ({ otp, setOtp }) => {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/, '');
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };
  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };
  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-14 text-center text-xl font-black rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] outline-none text-slate-800 transition-all duration-200"
        />
      ))}
    </div>
  );
};

// ─── Main AuthModal Component ─────────────────────────────────────────────────
export default function AuthModal({ isOpen, onClose }) {
  // 'login' | 'register' | 'otp'
  const [screen, setScreen] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Farmer',
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setScreen('login'); setError(''); setSuccess('');
      setOtp(['', '', '', '', '', '']);
      setFormData({ name: '', phone: '', email: '', password: '', role: 'Farmer' });
    }
  }, [isOpen]);

  // OTP countdown timer
  useEffect(() => {
    if (screen !== 'otp') return;
    setOtpTimer(30);
    const t = setInterval(() => setOtpTimer(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [screen]);

  const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }));

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
      setSuccess('Welcome back! Loading your workspace...');
      setTimeout(() => { onClose(); window.location.reload(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect email or password. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Submit Register ───────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid 10-digit mobile number.'); return;
    }
    setLoading(true); setError('');
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await axios.post(`${base}/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      });
      const data = res.data;
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data));
      setSuccess('Account created! Setting up your workspace...');
      setTimeout(() => { onClose(); window.location.reload(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. This email may already be registered.');
    } finally { setLoading(false); }
  };

  // ── OTP Verify (UI simulation — wire to backend when SMS provider ready) ──
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true); setError('');
    // Simulate API call — replace with real OTP endpoint
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess('Phone verified! Creating your account...');
    setTimeout(() => handleRegister({ preventDefault: () => {} }), 800);
  };

  // ── Google Sign-In (stub — implement Google OAuth next) ──────────────────
  const handleGoogleSignIn = () => {
    setError('Google Sign-In is being configured. Please use email for now.');
  };

  // ─────────────────────────────────────────────────────────────────────────
  const isRegister = screen === 'register';
  const isOtp = screen === 'otp';

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 px-8 pt-10 pb-8 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-xl" />

              {/* Back button for OTP screen */}
              {isOtp && (
                <button onClick={() => setScreen('register')} className="absolute top-5 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold">
                  <ChevronLeft size={16} /> Back
                </button>
              )}

              {/* Close button */}
              <button onClick={onClose} className="absolute top-5 right-6 text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full">
                <X size={18} />
              </button>

              {/* Brand mark */}
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Leaf size={18} className="text-white" fill="currentColor" />
                </div>
                <span className="text-white font-black text-sm tracking-wider">AGROVISION <span className="text-emerald-400">AI</span></span>
              </div>

              <div className="relative z-10">
                <h2 className="text-white font-black text-3xl leading-tight tracking-tight">
                  {isOtp ? 'Verify Your\nPhone' : isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                  {isOtp
                    ? `Enter the 6-digit code sent to +91 ${formData.phone.slice(-4).padStart(10, '•')}`
                    : isRegister
                    ? 'Join the global agricultural intelligence network'
                    : 'Sign in to access your AI diagnostic dashboard'}
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

              {/* ─── OTP Screen ─── */}
              {isOtp && (
                <form onSubmit={handleOtpVerify} className="space-y-6">
                  <OtpInput otp={otp} setOtp={setOtp} />
                  <p className="text-center text-xs text-slate-400">
                    {otpTimer > 0 ? (
                      <>Resend code in <span className="font-black text-slate-700">{otpTimer}s</span></>
                    ) : (
                      <button type="button" onClick={() => setOtpTimer(30)} className="font-black text-emerald-600 hover:underline">Resend OTP</button>
                    )}
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</> : <><Shield size={18} /> Verify & Create Account</>}
                  </button>
                </form>
              )}

              {/* ─── Login Screen ─── */}
              {!isOtp && !isRegister && (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Google SSO */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <GoogleIcon /> Continue with Google
                  </button>

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
              {!isOtp && isRegister && (
                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Google SSO */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <GoogleIcon /> Sign up with Google
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-400 font-semibold">or register with email</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <InputField icon={User} placeholder="Full name" value={formData.name} onChange={set('name')} required />

                  {/* Phone number row with send OTP */}
                  <div className="relative flex gap-2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none z-10">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      placeholder="Mobile number (10 digits)"
                      value={formData.phone}
                      onChange={set('phone')}
                      maxLength={10}
                      className="flex-1 pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 focus:bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.phone.length === 10) { setScreen('otp'); setError(''); }
                        else setError('Enter a valid 10-digit mobile number first.');
                      }}
                      className="shrink-0 px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 whitespace-nowrap"
                    >
                      Send OTP
                    </button>
                  </div>

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
              {!isOtp && (
                <p className="text-center text-sm text-slate-500 mt-6">
                  {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    onClick={() => { setScreen(isRegister ? 'login' : 'register'); setError(''); setSuccess(''); }}
                    className="font-black text-emerald-600 hover:underline"
                  >
                    {isRegister ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
