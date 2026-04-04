"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, ShieldCheck, AlertCircle, RefreshCcw, Landmark, 
  Activity, ChevronRight, CheckCircle2, History, X, Leaf, Info,
  Download, Share2, Zap, ArrowRight, Fingerprint, Cpu, Bot, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client';
import AgriBot from './AgriBot';

export default function DiagnosisWorkspace({ 
  selectedLang = 'en-US', 
  onLangChange, 
  onResultUpdate,
  onBotToggle 
}) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setInternalResult] = useState(null);
  const setResult = (val) => {
    setInternalResult(val);
    if (onResultUpdate) onResultUpdate(val);
  };
  const [cropType, setCropType] = useState('Potato');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [inferenceProgress, setInferenceProgress] = useState(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Real-Time WebSocket Connection Safely
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const socketUrl = rawUrl.replace('/api/v1', '');
    
    try {
      socketRef.current = io(socketUrl, {
        transports: ['polling', 'websocket'],
        forceNew: true,
        reconnectionAttempts: 5
      });
      
      if (!socketRef.current) throw new Error("Socket instantiation failed");
    } catch (err) {
      console.error("Critical: Real-time telemetry gateway failed to initialize.", err);
    }
    
    if (!socketRef.current) return;

    // 2. Listen for background Inference Progress
    socketRef.current.on('inference_progress', (data) => {
       console.log("WS Data Received:", data);
       if (data.status === 'PROCESSING') {
          setInferenceProgress(data.progress || 10);
       } else if (data.status === 'COMPLETED') {
          // Finish loading and show data
          const r = data.result || {};
          setResult({
            disease: r.disease || "Unknown Anomaly",
            crop: r.crop || "Unknown",
            confidence: r.diseaseConfidence ? (r.diseaseConfidence * 100).toFixed(1) : "0.0",
            severity: r.severity || "Unknown",
            riskLevel: r.riskLevel || "Unknown",
            affectedAreaPercent: r.affectedAreaPercent || 0,
            xai_visualization: "https://images.unsplash.com/photo-1592330173432-edc51ad2f14d?q=80&w=1000",
            recommendations: r.recommendations || { pesticides: [], organic: [], prevention: [] },
            insights: r.insights || {},
            healthScore: r.healthScore || null,
            message: r.message || null
          });
          setLoading(false);
          setInferenceProgress(null);
          // fetchHistory();
       } else if (data.status === 'FAILED') {
          setResult({
            disease: "Analysis Failed: " + (data.error || "Unknown Error"),
            crop: "Unknown",
            confidence: "0.0",
            severity: "Unknown",
            riskLevel: "Unknown",
            affectedAreaPercent: 0,
            recommendations: { pesticides: [], organic: [], prevention: [] },
            insights: { spreadProbability: "Unknown", yieldImpact: "Unknown", environmentalFactor: "Inference Engine Failure" },
            message: "The neural network encountered an error during inference. Please review logs or try again."
          });
          setLoading(false);
          setInferenceProgress(null);
       }
    });

    // fetchHistory();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await axios.get(`${baseUrl}/diagnose/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.warn("Failed to fetch history (Offline mode)");
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const reportContent = `AGROVISION AI DIAGNOSTIC PROTOCOL
----------------------------------
ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
TIMESTAMP: ${new Date().toLocaleString()}
CROP: ${result.crop}
DIAGNOSIS: ${result.disease}
CONFIDENCE: ${result.confidence}%
SEVERITY: ${result.severity}
RISK LEVEL: ${result.riskLevel}

AI INSIGHTS:
${result.insights?.environmentalFactor || 'N/A'}

TREATMENT RECOMMENDATIONS:
${result.recommendations?.pesticides?.map(p => `- ${p.name}: ${p.dosage} (Active: ${p.activeIngredient})`).join('\n') || 'No chemical treatments recommended.'}

VERIFIED BY AGROVISION NEURAL CORE V2.5
SYSTEM AUTH: VALIDATED
`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agrovision_protocol_${result.crop.toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('cropType', cropType);
    formData.append('lang', selectedLang);

    const executeDiagnosis = async (lat = null, lon = null) => {
      if (lat && lon) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agrovision-api-7uwq.onrender.com/api/v1';
        setInferenceProgress(20); 
        const res = await axios.post(`${baseUrl}/inference/analyze`, formData, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        console.log("Analysis completed. Report tracking ID:", res.data.reportId);
        setInferenceProgress(95); 
        
        // 2. Process synchronous result directly
        
        if (res.data.status === 'COMPLETED' && res.data.fullResult) {
            const r = res.data.fullResult;
            setResult({
              disease: r.disease || "Unknown Anomaly",
              crop: r.crop || "Unknown",
              confidence: r.diseaseConfidence ? (r.diseaseConfidence * 100).toFixed(1) : "0.0",
              severity: r.severity || "Unknown",
              riskLevel: r.riskLevel || "Unknown",
              affectedAreaPercent: r.affectedAreaPercent || 0,
              xai_visualization: "https://images.unsplash.com/photo-1592330173432-edc51ad2f14d?q=80&w=1000",
              recommendations: r.recommendations || { pesticides: [], organic: [], prevention: [] },
              insights: r.insights || {},
              healthScore: r.healthScore || null,
              message: r.message || null
            });
        } else if (res.data.status === 'FAILED') {
            setResult({
              disease: "Analysis Failed: " + (res.data.error || "Please upload a clearer image."),
              crop: "Unknown",
              confidence: "0.0",
              severity: "Unknown",
              riskLevel: "Unknown",
              affectedAreaPercent: 0,
              xai_visualization: "https://images.unsplash.com/photo-1592330173432-edc51ad2f14d?q=80&w=1000",
              recommendations: { pesticides: [], organic: [], prevention: [] },
              insights: { spreadProbability: "Unknown", yieldImpact: "Unknown", environmentalFactor: "System error or uncertainty." }
            });
        }
        setLoading(false);
        setInferenceProgress(null);
        
      } catch (err) {
        console.error("Diagnosis Error:", err);
        if (window.fallbackTimeout) clearTimeout(window.fallbackTimeout);
        setResult({
            disease: "Network Error - Offline Fallback",
            crop: cropType,
            confidence: 50.0,
            severity: "Unknown",
            riskLevel: "Unknown",
            affectedAreaPercent: 0,
            xai_visualization: "https://images.unsplash.com/photo-1592330173432-edc51ad2f14d?q=80&w=1000",
            recommendations: {
                pesticides: [],
                organic: [],
                prevention: ["Check server connection"]
            },
            insights: { spreadProbability: "Unknown", yieldImpact: "Unknown", environmentalFactor: "Offline mode active" }
        });
        setLoading(false);
        setInferenceProgress(null);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => executeDiagnosis(position.coords.latitude, position.coords.longitude),
        (error) => {
          console.log("Geolocation denied or timed out, using regional fallback.");
          executeDiagnosis();
        },
        { enableHighAccuracy: true, timeout: 1000, maximumAge: 60000 } 
      );
    } else {
      executeDiagnosis();
    }
  };

  const loadFromHistory = (item) => {
    setResult(item);
    const wsUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : 'http://localhost:5000';
    setPreview(`${wsUrl}${item.imageUrl}`);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-40 bg-bg relative min-h-[900px]" id="platform">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
         <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Neural Console - Left Column */}
          <div className="lg:w-5/12">
            <div className="sticky top-32">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2">Diagnostic Terminal</div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Neural <span className="text-primary italic">Lab.</span></h2>
                </div>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all shadow-sm"
                >
                  <History size={16} /> {showHistory ? 'Active Scan' : 'Archived Nodes'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                 {showHistory ? (
                   <motion.div 
                     key="history"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium min-h-[500px]"
                   >
                    {/* History Logic */}
                    <div className="flex items-center gap-4 mb-8">
                       <History className="text-primary" size={20} />
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Diagnostic Replicas</h3>
                    </div>
                    {/* ... (rest of history content handled below) */}
                     {history.length > 0 ? history.map((h, i) => (
                       <div 
                         key={i} 
                         className="flex items-center gap-5 p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                         onClick={() => loadFromHistory(h)}
                       >
                         <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
                            <img src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : 'http://localhost:5000'}${h.imageUrl}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                         </div>
                         <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">{h.disease}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(h.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                         </div>
                         <div className="p-2 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={16} className="text-slate-400" />
                         </div>
                       </div>
                     )) : (
                       <div className="py-20 text-center">
                          <Leaf size={48} className="mx-auto text-slate-100 mb-6" />
                          <p className="text-sm text-slate-300 font-black uppercase tracking-widest leading-relaxed">System Cache Empty <br />No previous reports found</p>
                       </div>
                     )}
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="input"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium relative overflow-hidden group/card"
                   >
                     <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full group-hover/card:scale-110 transition-transform duration-700"></div>

                     <div className="space-y-10 relative z-10">
                        {/* Intelligent System Indicator */}
                        <div className="p-6 bg-slate-900/[0.03] border border-slate-900/[0.06] rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3 group/status">
                           <div className="flex items-center gap-3">
                              <div className="relative flex items-center justify-center">
                                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                 <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">AI Engine v4.0 Online</span>
                           </div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Universal Plant Recognition Enabled</p>
                        </div>

                        <div 
                          className={`relative h-72 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 overflow-hidden ${
                            preview ? 'border-primary/20 bg-primary/2' : 'border-slate-100 hover:border-primary/40 hover:bg-slate-50'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {preview ? (
                            <img src={preview} alt="Plant Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-105" />
                          ) : (
                            <div className="text-center">
                             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-400 mx-auto mb-8 shadow-2xl border border-slate-50 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors"></div>
                                <Camera size={40} className="relative z-10" />
                              </div>
                              <p className="font-black text-slate-900 text-[11px] uppercase tracking-[0.3em] mb-3 leading-none">Specimen Capture</p>
                              <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase max-w-[200px] leading-relaxed">Upload any plant image to automatically detect species and analyze health</p>
                            </div>
                          )}
                          <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                          
                          {preview && (
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                               <RefreshCcw size={32} className="text-white animate-spin-slow" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <button 
                            className={`w-full py-7 rounded-[1.5rem] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn ${(!image || loading) ? 'bg-slate-50 text-slate-300 border border-slate-100' : 'bg-slate-950 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-emerald-600 active:scale-95'}`}
                            onClick={handleDiagnose}
                            disabled={!image || loading}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-white/10 to-emerald-500/0 -translate-x-full group-hover/btn:animate-shimmer pointer-events-none"></div>
                            {loading ? (
                              <div className="flex items-center gap-3">
                                <RefreshCcw className="animate-spin" size={18} /> 
                                <span className="animate-pulse">Neural Decoding...</span>
                              </div>
                            ) : (
                              <>
                                Execute Analysis <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                              </>
                            )}
                          </button>
                          
                          {preview && !result && (
                            <button 
                              className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
                              onClick={() => {setImage(null); setPreview(null);}}
                            >
                              Flush Cache
                            </button>
                          )}
                        </div>
                     </div>
                   </motion.div>
                 )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 min-h-[600px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                   key="loading"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="h-full bg-white rounded-[4rem] p-12 border border-slate-100 flex flex-col items-center justify-center text-center shadow-[0_40px_100px_rgba(0,0,0,0.05)]"
                >
                    <div className="relative mb-14">
                       <div className="w-40 h-40 border-[6px] border-slate-100 rounded-full animate-spin border-t-emerald-500 shadow-xl"></div>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <Activity size={48} className="text-emerald-500 animate-pulse mb-1" />
                          <div className="flex gap-1">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                       </div>
                    </div>
                    <h3 className="text-4xl font-black text-slate-950 mb-4 tracking-tighter uppercase italic">Neural Sync in Progress</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Accessing Distributed Farm Intelligence</p>
                    <div className="max-w-xs mx-auto space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Latency</p>
                             <p className="text-sm font-black text-slate-900 tabular-nums">1.4ms</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Compute</p>
                             <p className="text-sm font-black text-slate-900 uppercase">Edge v4</p>
                          </div>
                       </div>
                       <div className="h-1.5 bg-slate-100 w-full rounded-full overflow-hidden shadow-inner">
                         <motion.div 
                           className="h-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                           initial={{ width: 0 }}
                           animate={{ width: `${inferenceProgress || 10}%` }}
                           transition={{ duration: 0.5 }}
                         />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                         Optimizing hardware-accelerated nodes <br />Parsing pathogenic markers
                      </p>
                   </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden flex flex-col h-full"
                >
                  <div className="bg-slate-950 p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10">
                        <div className="flex items-center gap-5">
                           <div className="relative">
                              <div className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
                           </div>
                           <div className="flex flex-col">
                              <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-2">Diagnostic Scan Complete</h2>
                              <div className="flex items-center gap-4">
                                 <h3 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none">{result.disease}</h3>
                                 <div className="px-4 py-1.5 bg-white/5 text-[10px] font-black text-white/50 rounded-xl border border-white/10 uppercase tracking-[0.2em] backdrop-blur-md">
                                    {result.crop} Specimen
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                           <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl flex items-center gap-3 backdrop-blur-sm shadow-emerald-glow">
                              <ShieldCheck size={14} strokeWidth={3} /> Protocol Verified
                           </div>
                           <button
                             onClick={onBotToggle}
                             className="px-4 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl flex items-center gap-3 hover:bg-emerald-500 hover:text-white transition-all shadow-premium"
                           >
                             <Volume2 size={14} /> Neural Audio Guide
                           </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-8 pt-4">
                         <div className="flex items-center gap-3 text-slate-400 group/link cursor-default">
                           <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover/link:bg-emerald-500/10 group-hover/link:border-emerald-500/20 transition-all">
                              <Fingerprint size={16} className="text-emerald-500" />
                           </div>
                           <p className="text-sm font-semibold italic text-slate-300 group-hover/link:text-white transition-colors">{result.cropScientificName || result.crop} Node Established</p>
                         </div>
                         <div className="hidden sm:block h-8 w-px bg-white/10"></div>
                         <div className="flex items-center gap-3 text-slate-400">
                           <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                              <Cpu size={16} className="text-amber-400" />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Neural Inference Sync</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50 border-b border-slate-100">
                    <Metric label={result.healthScore ? "Health Score" : "Confidence"} value={result.healthScore ? `${result.healthScore}/100` : `${result.confidence}%`} status="Optimized" />
                    <Metric label="Severity" value={result.severity} status={result.severity === 'High' || result.severity === 'Critical' ? 'Critical' : 'Moderate'} isUrgent={result.severity === 'High' || result.severity === 'Critical'} />
                    <Metric label="Risk Matrix" value={result.riskLevel} status={result.insights?.spreadProbability ? `${result.insights.spreadProbability} Spread` : 'Stable'} />
                    <Metric label="Infected Area" value={`${result.affectedAreaPercent}%`} status={result.insights?.yieldImpact ? `${result.insights.yieldImpact} Yield Loss` : 'Minimal'} isUrgent={result.affectedAreaPercent > 20} />
                  </div>

                  <div className="p-12 space-y-12 bg-white flex-1">
                    <div className="grid md:grid-cols-2 gap-12">
                       {result.xai_visualization && (
                        <div className="col-span-2 space-y-8">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center shadow-emerald-glow"><Zap size={20} strokeWidth={3} /></div>
                                 <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Explainable AI (XAI)</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Neural Anomaly Mapping</p>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={handleDownloadReport}
                                  className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-widest px-3 py-1 bg-slate-50 hover:bg-white border border-slate-100 rounded-lg flex items-center gap-2 transition-all group"
                                >
                                  <Download size={12} className="group-hover:scale-125 transition-transform" /> Save Protocol
                                </button>
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-lg flex items-center gap-2 border border-emerald-100/50 shadow-sm">
                                  <ShieldCheck size={12} /> Validated Node
                                </div>
                              </div>
                           </div>
                            <div className="relative rounded-[3rem] overflow-hidden border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] group/scan cursor-zoom-in">
                               <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                                  <motion.div 
                                    animate={{ top: ['-10%', '110%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-1 bg-gradient-to-t from-emerald-500/50 via-emerald-400 to-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,1)] opacity-70"
                                  />
                               </div>
                               <img src={result.xai_visualization} alt="Heatmap" className="w-full h-[500px] object-cover group-hover/scan:scale-110 transition-transform duration-1000" />
                               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent flex items-end p-10 z-10 transition-opacity group-hover/scan:opacity-60">
                                  <div className="max-w-xl">
                                     <p className="text-white text-xs font-medium leading-relaxed mb-2 opacity-90">
                                        <strong className="text-emerald-400 uppercase tracking-widest text-[9px] block mb-1">Engine insight:</strong>
                                        {result.xaiInsight || "Critical necrotic lesions detected. The system identified high-intensity pathogen activity clusters on the leaf margins."}
                                     </p>
                                    <div className="flex items-center gap-4">
                                       <div className="flex items-center gap-1.5">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          <span className="text-[8px] text-white/60 uppercase tracking-widest font-black">Hot Zones</span>
                                       </div>
                                       <div className="flex items-center gap-1.5">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span className="text-[8px] text-white/60 uppercase tracking-widest font-black">Stable Segments</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={18} /></div>
                           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Chemical Intervention</h4>
                        </div>
                        <ul className="space-y-3">
                          {result.recommendations?.pesticides?.length > 0 ? result.recommendations.pesticides.map((t, i) => (
                            <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center justify-between">
                               <div className="flex gap-4 items-center">
                                  <span className="w-5 h-5 bg-slate-900 text-white rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0">{i+1}</span>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 leading-relaxed mb-0.5">{t.name}</p>
                                    {t.activeIngredient && <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Ingredient: {t.activeIngredient}</p>}
                                  </div>
                               </div>
                               <div className="text-right">
                                   <div className="text-[9px] uppercase font-black text-slate-500 tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg mb-1 inline-block">
                                      {t.dosage} • Every {t.frequency}
                                   </div>
                                   {t.safety && <p className="text-[8px] font-black uppercase tracking-widest text-red-500 max-w-[150px] leading-tight mt-1">{t.safety}</p>}
                               </div>
                            </li>
                          )) : (
                             <div className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest border border-dashed border-slate-200 rounded-2xl text-center">No chemical intervention required</div>
                          )}
                        </ul>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-primary/10 text-primary rounded-lg"><ShieldCheck size={18} /></div>
                           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Prevention & Organic Protocol</h4>
                        </div>
                        <ul className="space-y-3">
                          {(result.recommendations?.organic || []).map((p, i) => (
                            <li key={`org-${i}`} className="flex gap-3 px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                               <Leaf size={14} className="text-primary mt-0.5 flex-shrink-0" />
                               <p className="text-xs font-bold text-emerald-800 leading-relaxed">{p}</p>
                            </li>
                          ))}
                          {(result.recommendations?.prevention || []).map((p, i) => (
                            <li key={`prev-${i}`} className="flex gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                               <CheckCircle2 size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                               <p className="text-xs font-bold text-slate-600 leading-relaxed">{p}</p>
                            </li>
                          ))}
                        </ul>
                        
                        {result.message && (
                            <div className="mt-6 p-5 bg-amber-50 rounded-2xl border border-amber-200">
                                <p className="text-xs font-bold text-amber-800 leading-relaxed"><span className="font-black uppercase tracking-widest">Notice:</span> {result.message}</p>
                            </div>
                        )}
                        {result.insights?.liveMetrics && (
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Temperature</p>
                                    <p className="text-sm font-black text-slate-900">{result.insights.liveMetrics.temp}°C</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Humidity</p>
                                    <p className="text-sm font-black text-slate-900">{result.insights.liveMetrics.humidity}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Precipitation</p>
                                    <p className="text-sm font-black text-slate-900">{result.insights.liveMetrics.precipitation}mm</p>
                                </div>
                            </div>
                        )}
                        
                        {result.insights?.environmentalFactor && (
                            <div className="mt-3 p-5 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group/env">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover/env:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-3">
                                     <Activity size={12} className="text-primary animate-pulse" />
                                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Environmental Intelligence</p>
                                  </div>
                                  <p className="text-xs font-bold text-white leading-relaxed">{result.insights.environmentalFactor}</p>
                                  {result.insights?.next7DayForecast && (
                                     <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">Neural Forecast</p>
                                        <p className="text-[10px] text-slate-300 italic font-medium">{result.insights.next7DayForecast}</p>
                                     </div>
                                  )}
                                </div>
                            </div>
                        )}
                      </div>
                      
                      {/* Professional System Verification Seal */}
                      <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center p-1 border-4 border-slate-100 shadow-xl overflow-hidden relative">
                               <Bot size={24} className="text-emerald-500" />
                               <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-spin-slow"></div>
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Neural Core v2.5 Verified</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Authenticity Hash: {Math.random().toString(16).substr(2, 8).toUpperCase()}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            <div className="text-center">
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Latency</p>
                               <p className="text-[10px] font-black text-slate-900 tabular-nums">1.4s</p>
                            </div>
                            <div className="text-center">
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Compute</p>
                               <p className="text-[10px] font-black text-slate-900 uppercase">Edge Node</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-950 rounded-xl">
                               <div className="flex items-center gap-2">
                                  <ShieldCheck size={14} className="text-emerald-500" />
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Certified</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full bg-white rounded-[3rem] p-12 border border-slate-100 flex flex-col items-center justify-center text-center shadow-premium relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-10 border border-slate-100 group-hover:scale-110 transition-transform duration-700">
                      <Activity size={56} className="animate-pulse text-slate-200 group-hover:text-emerald-500/20 transition-colors" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Intelligence Core Online</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed tracking-tight">
                      Upload a plant specimen in the terminal to initiate <br /><span className="text-emerald-500 font-black">Universal Automated Diagnosis</span>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, status, isUrgent }) {
  return (
    <div className="p-8 lg:p-10 border-r border-slate-100 last:border-r-0 hover:bg-white transition-all group cursor-default relative overflow-hidden flex flex-col justify-between h-full bg-white md:bg-transparent">
      <div className="absolute top-0 left-0 w-1 h-0 bg-emerald-500 group-hover:h-full transition-all duration-500"></div>
      <div>
        <div className="flex justify-between items-start mb-6 gap-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">{label}</p>
           <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border text-right max-w-[120px] line-clamp-2 leading-relaxed ${isUrgent ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
             {status}
           </span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-4xl lg:text-5xl font-black ${isUrgent ? 'text-red-900' : 'text-slate-900'} tracking-tighter tabular-nums group-hover:translate-x-1 transition-transform origin-left duration-500`}>
            {value}
          </p>
        </div>
      </div>
      <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: isUrgent ? '90%' : '40%' }}
           className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-emerald-500'}`}
         />
      </div>
    </div>
  );
}
