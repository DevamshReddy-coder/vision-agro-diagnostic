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
      <div className="container mx-auto px-8 relative z-10">
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
          className="text-center mb-36 space-y-8"
        >
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
            className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-900/[0.03] border border-slate-900/[0.06] rounded-full group cursor-default"
          >
             <Network size={14} className="text-emerald-500" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Integrated Pipeline</span>
          </motion.div>
          
          <motion.h2 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-6xl md:text-8xl lg:text-[100px] font-black text-slate-900 tracking-[-0.07em] leading-[0.8] uppercase"
          >
            Intelligence <br />
            <span className="text-emerald-500 italic drop-shadow-sm">Flow.</span>
          </motion.h2>
          
          <motion.p 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-slate-500 max-w-2xl mx-auto font-medium text-xl lg:text-2xl leading-relaxed tracking-tight"
          >
            From raw specimen to actionable intelligence: a high-fidelity bridge between biological reality and digital processing.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connector Line (Desktop) - High Tech Data Path */}
          <div className="hidden lg:block absolute top-[56px] left-[5%] right-[5%] h-[2px] bg-slate-100 z-0 overflow-hidden">
             <motion.div 
               initial={{ x: "-100%" }}
               whileInView={{ x: "100%" }}
               viewport={{ once: true }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-1/3 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" 
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <div className="flex flex-col items-center text-center space-y-10 group cursor-default">
                  <div className="relative">
                    <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center shadow-[0_15px_45px_rgba(0,0,0,0.06)] group-hover:shadow-primary-glow group-hover:scale-110 transition-all duration-700 border border-slate-50 group-hover:border-emerald-500/20 relative z-10">
                      <div className="relative z-10 group-hover:scale-110 transition-transform duration-700 text-slate-400 group-hover:text-emerald-500">
                        {React.cloneElement(step.icon, { size: 36, strokeWidth: 1.5 })}
                      </div>
                    </div>
                    
                    {/* Step Index Badge */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs tracking-widest border-4 border-white shadow-xl z-20 group-hover:bg-emerald-500 transition-colors duration-500">
                      0{i + 1}
                    </div>
                    
                    {/* Subtle Pulse Effect */}
                    <div className="absolute inset-x-0 bottom-0 h-4 w-4/5 mx-auto bg-slate-900/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-500"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed px-4 group-hover:text-slate-600 transition-colors">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Dynamic Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)] pointer-events-none"></div>
    </section>
  );
}
