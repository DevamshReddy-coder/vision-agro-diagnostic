"use client";
import React, { useState } from 'react';
import { Book, MapPin, Search, Filter, PlayCircle, X, CheckCircle, AlertOctagon, ExternalLink, Globe, LayoutGrid, CloudRain, Thermometer, Droplets, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const diseases = [
  {
    name: "Early Blight",
    code: "PATH-V195",
    crop: "Tomato/Potato",
    severity: "Moderate",
    symptoms: "Concentric dark brown ring lesions (target spots) primarily affecting older foliage, leading to chlorosis and premature leaf drop.",
    img: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=2000", // Verified pathological specimen close-up
    protocol: ["Apply copper fungicide", "Remove lower leaves", "Mulch around base"]
  },
  {
    name: "Late Blight",
    code: "PATH-V914",
    crop: "Potato/Tomato",
    severity: "High",
    symptoms: "Rapidly expanding water-soaked lesions with necrotizing centers. Characteristic white late-blight mycelium visible on leaf undersides during high humidity.",
    img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000",
    protocol: ["Destroy infected plants", "Avoid overhead watering", "Resistant varieties"]
  },
  {
    name: "Cedar Apple Rust",
    code: "PATH-V442",
    crop: "Apple",
    severity: "High",
    symptoms: "Bright yellow-orange pycnia on upper leaf surface. Development of aecial cups on the underside, leading to significant fruit deformation and defoliation.",
    img: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000",
    protocol: ["Remove nearby Junipers", "Fungicide sprays", "Prune galls"]
  },
  {
    name: "Corn Common Rust",
    code: "PATH-V728",
    crop: "Maize",
    severity: "Low",
    symptoms: "Elongated, reddish-brown pustules (uredinia) scattered across both leaf surfaces. Leads to stunted growth and reduced grain fill in susceptible cultivars.",
    img: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=2000",
    protocol: ["Fungicide if severe", "Check nitrogen levels", "Early planting"]
  }
];

function PathologyImage({ src, alt, className }) {
  const [error, setError] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  
  if (error || !src) {
    return (
      <div className={`bg-slate-50 relative flex flex-col items-center justify-center text-center border border-slate-100 overflow-hidden ${className}`}>
        {/* Scientific Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 flex flex-col items-center p-8">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 mb-4 shadow-sm border border-slate-100">
              <AlertOctagon size={24} strokeWidth={1.5} />
           </div>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] leading-[1.6] max-w-[140px]">
             Specimen Data <br />
             <span className="text-slate-400">Unavailable</span>
           </p>

        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-50 overflow-hidden ${className}`}>
      <motion.img 
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover" 
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default function KnowledgeHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisease, setSelectedDisease] = useState(null);

  const filteredDiseases = diseases.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-32 bg-white" id="knowledge">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/[0.03] border border-slate-900/[0.06] rounded-full group cursor-default">
               <Book size={14} className="text-emerald-500" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none">Pathogen Intelligence Hub</span>
            </div>
            <h2 className="text-5xl lg:text-8xl font-black text-slate-900 tracking-[-0.07em] leading-[0.8] uppercase">
              Biological <br />
              <span className="text-emerald-500 italic drop-shadow-sm">Library.</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg lg:text-xl max-w-xl tracking-tight leading-relaxed">
              Verified repository of global plant pathogens, diagnostic signatures, and localized intervention protocols.
            </p>
          </div>
          <div className="relative w-full md:w-[450px] group">
             <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
             </div>
             <input 
               type="text" 
               placeholder="Search by pathogen or specimen type..." 
               className="w-full pl-16 pr-8 py-6 rounded-[2rem] bg-slate-50 border border-slate-100 focus:border-emerald-500/30 outline-none font-black text-xs uppercase tracking-widest transition-all focus:bg-white focus:shadow-2xl focus:shadow-emerald-500/5 placeholder:text-slate-400 placeholder:font-bold"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <div className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200/50 rounded flex gap-1 items-center">
                <span className="text-[9px] font-black text-slate-500">⌘</span>
                <span className="text-[9px] font-black text-slate-500">K</span>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {filteredDiseases.map((d, i) => (
                <motion.div 
                  key={i}
                  layoutId={`disease-${d.name}`}
                  className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_15px_45px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-10 items-center group cursor-pointer hover:border-emerald-500/20 hover:shadow-primary-glow transition-all duration-700 relative overflow-hidden"
                  onClick={() => setSelectedDisease(d)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                  
                  <div className="w-full md:w-56 h-56 rounded-[2.5rem] overflow-hidden flex-shrink-0 border border-slate-50 shadow-2xl relative z-10">
                    <PathologyImage src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  
                  <div className="flex-1 space-y-6 relative z-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 bg-slate-900 text-white rounded-lg">
                        {d.crop} Specimen
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-lg border ${
                        d.severity === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                        d.severity === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {d.severity} Threat Level
                      </span>
                    </div>
                    
                       <div className="space-y-2">
                       <h3 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors leading-none">
                         {d.name}
                       </h3>

                    </div>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed tracking-tight line-clamp-2 max-w-xl group-hover:text-slate-600 transition-colors">
                      {d.symptoms}
                    </p>
                    
                    <div className="flex items-center gap-4 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] pt-2 group-hover:translate-x-3 transition-transform duration-500">
                      View Intervention Protocol <ExternalLink size={16} className="text-emerald-500" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Intelligence */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                          <Globe size={28} className="text-emerald-400" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black tracking-tight leading-none mb-1 text-white">Sentinel Grid</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Global Node Sync • Online</p>
                          </div>
                       </div>
                    </div>

                    <div className="relative h-48 bg-slate-950/50 rounded-[2.5rem] border border-white/5 mb-8 flex items-center justify-center overflow-hidden group">
                       <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #10b981 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                       
                       <MapPin className="text-emerald-500 relative z-10 group-hover:scale-110 transition-transform" size={40} strokeWidth={1.5} />
                       
                       {/* Radar ring effect */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-500/20 rounded-full animate-ping"></div>
                    </div>

                    <div className="space-y-3 mb-10">
                       <RiskItem region="North-West Sector" status="High Risk" trend="+14% Activity" />
                       <RiskItem region="Valley Delta" status="Warning" trend="+5% Activity" />
                       <RiskItem region="Eastern Plateau" status="Stable" trend="-2% Activity" />
                    </div>

                    <button className="w-full py-5 bg-white text-slate-900 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95 group">
                       Access Full Map <ExternalLink size={14} className="inline ml-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><LayoutGrid size={24} /></div>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Ecosystem Resources</h4>
                 </div>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Access peer-reviewed whitepapers and community diagnostic signatures.</p>
                 <a href="#" className="text-[10px] font-black text-primary uppercase tracking-widest border-b-2 border-primary/20 hover:border-primary transition-all">Download Documentation</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {selectedDisease && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
               onClick={() => setSelectedDisease(null)}
            />
            <motion.div 
               layoutId={`disease-${selectedDisease.name}`}
               className="relative bg-white w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl"
            >
               <button className="absolute top-8 right-8 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-red-500 transition-all z-20" onClick={() => setSelectedDisease(null)}>
                  <X size={28} />
               </button>
               
               <div className="h-80 relative">
                  <PathologyImage src={selectedDisease.img} alt={selectedDisease.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent text-slate-900 p-12 flex flex-col justify-end">
                     <div className="flex gap-3 mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white bg-slate-900 px-4 py-1.5 rounded-full">{selectedDisease.crop}</span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] text-white bg-red-600 px-4 py-1.5 rounded-full`}>{selectedDisease.severity} Priority</span>
                     </div>
                     <h3 className="text-5xl font-black tracking-tighter text-slate-900">{selectedDisease.name}</h3>
                  </div>
               </div>

               <div className="p-12 space-y-10">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Clinical Presentation</h4>
                     <p className="text-xl font-medium text-slate-700 leading-relaxed tracking-tight">{selectedDisease.symptoms}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 text-slate-900">
                           <AlertOctagon size={24} className="text-red-600" />
                           <span className="font-black text-[10px] uppercase tracking-widest">Biological Risk</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase">Confirmed Pathogen Signature requires immediate secondary verification.</p>
                     </div>

                     <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
                        <div className="flex items-center gap-3 mb-6 text-primary">
                           <CheckCircle size={24} />
                           <span className="font-black text-[10px] uppercase tracking-widest">Target Protocol</span>
                        </div>
                        <ul className="space-y-3">
                           {selectedDisease.protocol.map((p, i) => (
                              <li key={i} className="text-xs font-bold text-slate-700 flex items-center gap-3 tracking-tight">
                                 <div className="w-1.5 h-1.5 bg-primary rounded-full"></div> {p}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
                  
                  <button className="w-full py-6 bg-slate-900 text-white rounded-[2rem] justify-center text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary transition-all" onClick={() => setSelectedDisease(null)}>
                     Acknowledge Diagnostic Signal
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function RiskItem({ region, status, trend }) {
  return (
    <div className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/10 group transition-all hover:bg-white/10">
      <div>
        <div className="text-[11px] font-black text-white uppercase tracking-tight mb-1">{region}</div>
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">{trend}</div>
      </div>
      <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${status === 'High Risk' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : status === 'Warning' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'bg-primary/20 text-primary border border-primary/20'}`}>
        {status}
      </div>
    </div>
  );
}
