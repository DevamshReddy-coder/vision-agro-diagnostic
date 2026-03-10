"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Cpu, FileSearch, ShieldCheck, Zap, Layers, Network, Fingerprint } from 'lucide-react';

const steps = [
  {
    icon: <Camera size={32} className="text-slate-900 group-hover:text-primary transition-colors" />,
    title: "Optical Capture",
    desc: "Deploy field specimen imagery via smartphone sensors or existing high-resolution satellite/drone datasets."
  },
  {
    icon: <Cpu size={32} className="text-slate-900 group-hover:text-primary transition-colors" />,
    title: "Neural Inference",
    desc: "AgroResNet v2.1 architectures process pathogen signatures in <200ms using localized neural compute nodes."
  },
  {
    icon: <FileSearch size={32} className="text-slate-900 group-hover:text-primary transition-colors" />,
    title: "Logical Synthesis",
    desc: "Biological markers are decoded into high-confidence diagnostic clusters with comprehensive stress metrics."
  },
  {
    icon: <ShieldCheck size={32} className="text-slate-900 group-hover:text-primary transition-colors" />,
    title: "Protocol Delivery",
    desc: "End-to-end encryption ensures secure delivery of government-vetted intervention and prevention protocols."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-48 bg-white relative overflow-hidden" id="workflow">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] -ml-[300px] -mt-[300px] opacity-40"></div>

      <div className="container mx-auto px-8 lg:px-12 relative z-10">
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
          className="text-center mb-40 space-y-8"
        >
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
            className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-950/[0.03] border border-slate-950/[0.06] rounded-full group cursor-default shadow-sm"
          >
             <Network size={14} className="text-emerald-500" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Proprietary Intelligence Pipeline</span>
          </motion.div>
          
          <motion.h2 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-6xl md:text-8xl lg:text-[110px] font-black text-slate-950 tracking-[-0.07em] leading-[0.8] uppercase"
          >
            Intelligence <br />
            <span className="text-emerald-500 italic drop-shadow-sm">Flow.</span>
          </motion.h2>
          
          <motion.p 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-slate-500 max-w-2xl mx-auto font-medium text-xl lg:text-2xl leading-relaxed tracking-tight"
          >
            From field specimens to actionable protocols: a high-fidelity bridge between biological reality and neural processing v4.2.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connector Line (Desktop) - High Tech Data Path */}
          <div className="hidden lg:block absolute top-[64px] left-[10%] right-[10%] h-px bg-slate-100 z-0 overflow-hidden">
             <motion.div 
               initial={{ x: "-100%" }}
               whileInView={{ x: "100%" }}
               viewport={{ once: true }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="w-1/4 h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <div className="flex flex-col items-center text-center space-y-12 group cursor-default">
                  <div className="relative">
                    {/* Step Halo */}
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 rounded-full blur-3xl transition-all duration-700 -z-0"></div>
                    
                    <div className="w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.04)] group-hover:shadow-[0_40px_80px_rgba(16,185,129,0.12)] group-hover:scale-105 transition-all duration-700 border border-slate-50 group-hover:border-emerald-500/30 relative z-10">
                      <div className="relative z-10 group-hover:scale-110 transition-transform duration-700 text-slate-400 group-hover:text-emerald-500">
                        {step.icon && React.isValidElement(step.icon) 
                          ? React.cloneElement(step.icon, { size: 42, strokeWidth: 1 })
                          : null}
                      </div>
                    </div>
                    
                    {/* Step Index Badge */}
                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-[10px] tracking-widest border-4 border-white shadow-2xl z-20 group-hover:bg-emerald-500 transition-colors duration-500">
                      SYS_{i + 1}
                    </div>
                  </div>
                  
                  <div className="space-y-5 px-6">
                    <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight group-hover:text-emerald-600 transition-colors leading-none">
                      {step.title}
                    </h3>
                    <p className="text-[13px] font-semibold text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                      {step.desc}
                    </p>
                    <div className="flex justify-center pt-2">
                       <div className="w-8 h-1 bg-slate-100 rounded-full group-hover:w-16 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
