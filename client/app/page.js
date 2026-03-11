"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Map as MapIcon, 
  Activity, 
  Zap, 
  ArrowRight, 
  ChevronRight,
  Database,
  BarChart3,
  Globe,
  Leaf,
  Cpu,
  Fingerprint,
  Layers,
  Cloud,
  ThermometerSun,
  Droplets,
  Wind,
  Sprout,
  LineChart,
  Bot
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const DiagnosisWorkspace = dynamic(() => import('../components/DiagnosisWorkspace'), { ssr: false });
const AnalyticsDashboard = dynamic(() => import('../components/AnalyticsDashboard'), { ssr: false });
const KnowledgeHub = dynamic(() => import('../components/KnowledgeHub'), { ssr: false });
const AuthModal = dynamic(() => import('../components/AuthModal'), { ssr: false });
const HowItWorks = dynamic(() => import('../components/HowItWorks'), { ssr: false });
const Navbar = dynamic(() => import('../components/Navbar'), { ssr: false });
const AgriBot = dynamic(() => import('../components/AgriBot'), { ssr: false });
const FarmerProfile = dynamic(() => import('../components/FarmerProfile'), { ssr: false });

export default function Home() {
  const [authScreen, setAuthScreen] = useState(null); // 'login' | 'register' | null
  const [heroWeather, setHeroWeather] = useState({ temp: 24, humidity: 68, wind: 14, condition: 'Partly Cloudy' });
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botContext, setBotContext] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Fetch live weather for the hero visual hub
    const fetchHeroWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto');
        const data = await res.json();
        if (data.current) {
          const codeMap = { 0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Foggy', 51: 'Drizzle', 61: 'Rainy' };
          setHeroWeather({
            temp: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            wind: Math.round(data.current.wind_speed_10m),
            condition: codeMap[data.current.weather_code] || 'Optimal'
          });
        }
      } catch (err) {
        console.warn("Hero weather sync failed, using calibrated defaults.");
      }
    };
    fetchHeroWeather();
    const interval = setInterval(fetchHeroWeather, 300000); // Sync every 5 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen selection:bg-primary selection:text-white bg-white">
      <AuthModal isOpen={!!authScreen} initialScreen={authScreen || 'login'} onClose={() => setAuthScreen(null)} />
      <Navbar 
        onLoginClick={(type) => setAuthScreen(type)} 
        onBotToggle={() => setIsBotOpen(!isBotOpen)} 
        onProfileOpen={() => setIsProfileOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-16 pb-24 lg:pb-32 overflow-hidden bg-white">
        {/* Cinematic Background Elements - Layered Depth */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-emerald-100/10 rounded-full blur-[180px] -mr-[600px] -mt-[400px]"></div>
        <div className="absolute top-1/2 left-0 w-[1000px] h-[1000px] bg-indigo-50/10 rounded-full blur-[150px] -ml-[500px] -mt-[500px]"></div>

        {/* Floating Data Particles (Ambient Motion) */}
        {[1, 2, 3].map(i => (
          <motion.div
            key={`particle-${i}`}
            animate={{ 
              y: [0, -40, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute w-3 h-3 bg-emerald-500/20 rounded-full blur-xl hidden lg:block`}
            style={{ 
              top: `${20 + i * 20}%`, 
              left: `${15 + i * 25}%` 
            }}
          />
        ))}

        <div className="container mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-32 items-center">
            
            {/* Left Column: Authority & Narrative */}
            <motion.div
              className="lg:col-span-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                    staggerChildren: 0.15
                  }
                }
              }}
            >
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900/[0.03] border border-slate-900/[0.06] rounded-full mb-10 group cursor-default"
              >
                 <div className="relative flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
                 </div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Intelligence Protocol v2.5</span>
                 <div className="w-1 h-1 bg-slate-300 rounded-full mx-1"></div>
                 <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] leading-none">Live Sync Active</span>
              </motion.div>

              <motion.h1 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-6xl md:text-8xl lg:text-[115px] font-black text-slate-900 mb-8 leading-[0.8] tracking-[-0.08em] uppercase"
              >
                Smarter <br />
                <span className="text-emerald-500 italic drop-shadow-[0_5px_15px_rgba(16,185,129,0.2)]">Yield.</span> Secure <br />
                Future.
              </motion.h1>
              
              <motion.p 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-lg lg:text-xl text-slate-500 mb-12 leading-relaxed max-w-xl font-medium tracking-tight"
              >
                Deploying hardware-accelerated computer vision and decentralized intelligence to secure the future of world food systems.
              </motion.p>
              
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col sm:flex-row items-center gap-6 mb-20"
              >
                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-14 py-7 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.4)] hover:bg-emerald-600 transition-all duration-500 flex items-center justify-center gap-6 group relative overflow-hidden"
                  onClick={() => document.getElementById('platform').scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="relative z-10">Access Lab</span> 
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors relative z-10">
                    <ArrowRight size={18} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-10 py-7 border border-slate-200 text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-300 group hover:border-emerald-500/30"
                  onClick={() => setIsBotOpen(true)}
                >
                  <Bot size={18} className="text-emerald-500 animate-pulse" />
                  Talk to Expert
                </motion.button>
              </motion.div>

              <motion.div 
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                transition={{ duration: 1.5, delay: 1 }}
                className="flex flex-col md:flex-row md:items-center gap-12 pt-12 border-t border-slate-100 max-w-xl"
              >
                <TrustStat value="99.4%" label="Confidence" icon={<ShieldCheck size={14} className="text-emerald-500" />} />
                <div className="hidden md:block w-px h-8 bg-slate-100"></div>
                <TrustStat value="200ms" label="Latency" icon={<Zap size={14} className="text-amber-500" />} />
                <div className="hidden md:block w-px h-8 bg-slate-100"></div>
                <TrustStat value="1.2M+" label="Hectares" icon={<Globe size={14} className="text-blue-500" />} />
              </motion.div>
            </motion.div>

            {/* Right Column: Real-Time Environment Intelligence Panel */}
            <motion.div
              className="lg:col-span-6 relative"
              initial={{ opacity: 0, scale: 0.95, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative rounded-[3rem] p-1 bg-gradient-to-br from-slate-200 to-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.08)] overflow-hidden group/hero">
                <div className="bg-slate-900 rounded-[2.9rem] p-10 relative overflow-hidden h-full flex flex-col">
                  {/* Background effects */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover/hero:scale-150 transition-transform duration-1000"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-emerald-500/10 rounded-2xl">
                        <ThermometerSun size={28} className="text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Environmental Intel</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-60"></div>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Data Stream</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Atmosphere Data */}
                  <div className="bg-slate-950/50 rounded-[2rem] border border-white/5 p-8 mb-6 relative z-10 box-border w-full flex-shrink-0">
                    <div className="flex justify-between items-end mb-8 relative">
                      {/* Left: Temp/Weather */}
                      <div>
                        <div className="text-7xl font-black text-white tracking-tighter tabular-nums flex items-baseline">
                          {heroWeather.temp}<span className="text-2xl text-slate-500 ml-1">°C</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{heroWeather.condition}</div>
                      </div>
                      
                      {/* Decorative scanning line in atmosphere box */}
                      <motion.div 
                        animate={{ opacity: [0.2, 0.7, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 w-full box-border">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                          <Droplets size={14} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Humidity</span>
                        </div>
                        <div className="text-xl font-black text-white tabular-nums">{heroWeather.humidity}%</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 w-full box-border">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                          <Wind size={14} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Wind Speed</span>
                        </div>
                        <div className="text-xl font-black text-white tabular-nums flex items-baseline">{heroWeather.wind}<span className="text-[10px] text-slate-500 ml-1">km/h</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Soil Insights */}
                  <div className="grid grid-cols-3 gap-3 mb-6 relative z-10 flex-shrink-0 w-full">
                     <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 box-border flex flex-col items-center justify-center text-center">
                        <Sprout size={16} className="text-emerald-400 mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Moisture</span>
                        <div className="text-lg font-black text-white tabular-nums">42%</div>
                     </div>
                     <div className="bg-white/5 rounded-2xl p-4 border border-white/5 box-border flex flex-col items-center justify-center text-center">
                        <ThermometerSun size={16} className="text-slate-300 mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Temperature</span>
                        <div className="text-lg font-black text-white tabular-nums">18.5°</div>
                     </div>
                     <div className="bg-white/5 rounded-2xl p-4 border border-white/5 box-border flex flex-col items-center justify-center text-center">
                        <Activity size={16} className="text-slate-300 mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Soil pH</span>
                        <div className="text-lg font-black text-white tabular-nums">6.8</div>
                     </div>
                  </div>

                  {/* 7-Day Mini Forecast Chart Placeholder */}
                  <div className="bg-slate-950/50 rounded-[1.5rem] border border-white/5 p-4 flex flex-col justify-center items-center relative z-10 overflow-hidden box-border w-full flex-grow min-h-[100px]">
                     <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #10b981 1px, transparent 1px), linear-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                     <div className="flex items-center gap-2 mb-2 w-full px-2 relative z-10">
                        <LineChart size={12} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">7-Day Prediction Trend</span>
                     </div>
                     {/* Abstract chart wave */}
                     <svg className="w-full h-12 relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M0,15 Q10,5 20,10 T40,15 T60,5 T80,12 T100,5 L100,20 L0,20 Z" fill="url(#gradient)" opacity="0.3"></path>
                        <path d="M0,15 Q10,5 20,10 T40,15 T60,5 T80,12 T100,5" fill="none" stroke="#10b981" strokeWidth="1.5"></path>
                        <defs>
                           <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#10b981"></stop>
                              <stop offset="100%" stopColor="transparent"></stop>
                           </linearGradient>
                        </defs>
                     </svg>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator - Bottom Anchored */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3"
        >
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] rotate-180 [writing-mode:vertical-lr]">Scroll to Explore</span>
           <div className="w-px h-12 bg-gradient-to-b from-slate-200 to-transparent relative overflow-hidden">
              <motion.div 
                animate={{ top: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 w-full h-1/2 bg-primary blur-[1px]"
              />
           </div>
        </motion.div>
      </section>

      {/* Feature Highlights Group */}
      <section className="py-48 bg-white relative overflow-hidden">
        <div className="container mx-auto px-8">
           <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={{
               hidden: { opacity: 0, y: 30 },
               visible: {
                 opacity: 1,
                 y: 0,
                 transition: {
                   duration: 1,
                   ease: [0.16, 1, 0.3, 1],
                   staggerChildren: 0.1
                 }
               }
             }}
             className="text-center mb-32 max-w-4xl mx-auto"
           >
              <motion.div 
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-900/[0.03] border border-slate-900/[0.06] rounded-full mb-10 group cursor-default"
              >
                 <Layers size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Precision Infrastructure</span>
              </motion.div>
              
              <motion.h2 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-5xl md:text-7xl lg:text-[100px] font-black text-slate-900 tracking-[-0.06em] leading-[0.8] mb-12 uppercase"
              >
                Engineered for <br />
                <span className="text-emerald-500 italic drop-shadow-sm">Global</span> Scale.
              </motion.h2>
              
              <motion.p 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-slate-500 font-medium text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto tracking-tight"
              >
                Our multi-layered neural architecture provides decentralized intelligence across regional territories with zero-latency synchronization.
              </motion.p>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1.2, delay: 0.4 }}
             className="grid md:grid-cols-2 lg:grid-cols-4 gap-10"
           >
              <FeatureItem 
                icon={<Cpu size={32} />} 
                title="Neural Edge" 
                desc="Hardware-accelerated inference running directly in the browser or on-site field nodes." 
              />
              <FeatureItem 
                icon={<Layers size={32} />} 
                title="Multi-spectral" 
                desc="Deep analysis beyond the visible spectrum. Optimized for 4K drone sensor arrays." 
              />
              <FeatureItem 
                icon={<Cloud size={32} />} 
                title="Regional Sync" 
                desc="Decentralized data clusters ensuring field reports are redundant and globally accessible." 
              />
              <FeatureItem 
                icon={<Fingerprint size={32} />} 
                title="Gov-Shield" 
                desc="Enterprise-grade encryption compliant with international agricultural data residency protocols." 
              />
           </motion.div>
        </div>
      </section>

      <HowItWorks />
      <DiagnosisWorkspace 
        selectedLang={selectedLang} 
        onLangChange={setSelectedLang}
        onResultUpdate={setBotContext}
        onBotToggle={() => setIsBotOpen(!isBotOpen)}
      />
      <AnalyticsDashboard />
      <KnowledgeHub />

      {/* Trust & Global Impact */}
      <section className="py-40 bg-slate-900 relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
           <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter leading-[0.85]">
              Decentralized <br />
              <span className="text-primary italic">Intelligence.</span>
           </h2>
           <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto mb-32 tracking-tight">
              AgroVision AI frameworks are deployed across five continents, providing critical food security insights to governmental bodies and private conglomerates.
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-20 max-w-6xl mx-auto">
              <ImpactCard label="Territory Monitored" value="1.2M Ha" desc="Aggregated field surveillance network" />
              <ImpactCard label="Processing Power" value="450k/hr" desc="Concurrent neural model inferences" />
              <ImpactCard label="Yield Enhancement" value="$850M" desc="Economic loss prevention metrics" />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-white relative border-t border-slate-100">
        <div className="container mx-auto px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-24 mb-32">
            <div className="lg:col-span-5 space-y-12">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-slate-950 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                    <Leaf size={28} fill="currentColor" className="group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent"></div>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-950 tracking-tighter uppercase leading-none">AgroVision <span className="text-emerald-500">AI</span></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Precision Intelligence Framework</span>
                 </div>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed font-medium text-lg tracking-tight">
                The world's leading decentralized framework for high-precision agricultural computer vision. Ensuring food security through edge intelligence.
              </p>
              <div className="flex gap-4">
                {['global', 'secure', 'neural', 'cloud'].map(tag => (
                  <div key={tag} className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center hover:shadow-xl group hover:-translate-y-1">
                     <Globe size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16">
               <FooterCol title="Ecosystem" links={['Neural Core v2.5', 'Field Edge API', 'Satellite Sync', 'Enterprise Hub']} />
               <FooterCol title="Governance" links={['Privacy Shield', 'Data Residency', 'ISO 27001', 'Open-Source Foundation']} />
               <FooterCol title="Operations" links={['Palo Alto Hub', 'Bangalore R&D', 'Technical Support', 'Berlin Ops']} />
            </div>
          </div>
          <div className="pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
               <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center md:text-left flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                  © 2026 AgroVision Framework Consortium
               </div>
               <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  System Health: <span className="text-emerald-500">Nominal 99.8%</span>
               </div>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <span className="hover:text-emerald-500 cursor-pointer transition-colors">Legal Protocol</span>
               <span className="hover:text-primary cursor-pointer transition-colors">v2.5 Alpha Changelog</span>
            </div>
          </div>
        </div>
      </footer>
      <AgriBot 
        context={botContext} 
        selectedLang={selectedLang} 
        onLangChange={setSelectedLang}
        isOpen={isBotOpen}
        onOpenChange={setIsBotOpen}
      />
      <FarmerProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}

function TrustStat({ value, label, icon }) {
  return (
    <div className="group cursor-default">
      <div className="flex items-center gap-2 mb-2">
         {icon}
         <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
      </div>
      <div className="flex items-center gap-3">
         <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter tabular-nums group-hover:text-primary transition-colors duration-500">
           {value}
         </div>
         <div className="w-3 h-0.5 bg-slate-100 rounded-full group-hover:w-5 group-hover:bg-primary/30 transition-all"></div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="space-y-10 group p-10 rounded-[3rem] bg-slate-50/50 hover:bg-white hover:shadow-premium transition-all duration-700 border border-transparent hover:border-slate-100 flex flex-col items-start cursor-default">
      <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-400 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 group-hover:bg-slate-900 group-hover:text-emerald-400 group-hover:shadow-primary-glow transition-all duration-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors"></div>
        <div className="relative z-10 group-hover:scale-110 transition-transform duration-700">
          {React.cloneElement(icon, { strokeWidth: 1.5, size: 36 })}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm font-medium text-slate-500 leading-relaxed tracking-tight group-hover:text-slate-600 transition-colors">
          {desc}
        </p>
      </div>
    </div>
  );
}

function ImpactCard({ label, value, desc }) {
  return (
    <div className="text-center group p-10 rounded-[3rem] hover:bg-white/5 transition-all duration-500">
      <div className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter tabular-nums group-hover:text-primary transition-all duration-700 group-hover:scale-105">
        {value}
      </div>
      <div className="flex flex-col items-center gap-4">
         <div className="w-10 h-1 bg-primary/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              transition={{ duration: 1.5 }}
            />
         </div>
         <div className="space-y-2">
            <div className="text-xs font-black text-primary uppercase tracking-[0.3em]">{label}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">{desc}</div>
         </div>
      </div>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-10 border-b border-primary/20 pb-4">{title}</h4>
      <ul className="space-y-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {links.map(l => (
          <li key={l} className="hover:text-primary cursor-pointer transition-colors">{l}</li>
        ))}
      </ul>
    </div>
  );
}
