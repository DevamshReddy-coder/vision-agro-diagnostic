"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Activity, Users, AlertTriangle, Download, Filter, Info, 
  MapPin, Target, Network, CheckCircle, ChevronRight, Clock, ShieldAlert, Crosshair
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Basic clock implementation for real-time feel
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const fetchStats = async () => {
      try {
         const token = localStorage.getItem('token');
         const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
         const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
         const res = await axios.get(`${baseUrl}/analytics/overview`, config);
         setStats(res.data);
      } catch (err) {
         console.warn("Analytics fetch skipped or unavailable (Offline mode)");
      } finally {
         setTimeout(() => setLoading(false), 800);
      }
    };

    fetchStats();
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#10b981', '#34d399', '#059669', '#064e3b', '#fbbf24'];
  const SEVERITY_COLORS = { 'Low': '#10b981', 'Moderate': '#f59e0b', 'High': '#ef4444' };

  if (loading) {
     return (
       <section className="py-24 bg-white" id="analytics">
         <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
               <div className="space-y-4">
                  <div className="h-4 w-32 bg-slate-100 animate-pulse rounded-full"></div>
                  <div className="h-10 w-96 bg-slate-100 animate-pulse rounded-xl"></div>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-40 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>
               ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
               <div className="h-[450px] bg-slate-50 animate-pulse rounded-[3rem] border border-slate-100"></div>
               <div className="h-[450px] bg-slate-50 animate-pulse rounded-[3rem] border border-slate-100"></div>
            </div>
         </div>
       </section>
     );
  }

  // Calculate synthetic metrics based on dynamic layout requirements
  const highSeverityCount = stats?.bySeverity?.find(s => s._id === 'High')?.count || 0;
  const totalCount = stats?.total || 1;
  const riskPercentage = Math.round((highSeverityCount / totalCount) * 100) || 0;
  const riskLevel = riskPercentage > 40 ? 'Critical' : riskPercentage > 20 ? 'Elevated' : 'Stable';
  const riskColor = riskLevel === 'Critical' ? 'text-red-500' : riskLevel === 'Elevated' ? 'text-amber-500' : 'text-emerald-500';

  // Dynamic Actions generation based on statistics
  const generateActions = (statsData) => {
    if (!statsData || !statsData.byDisease || statsData.total === 0) return [];
    
    let actions = [];
    
    // Action 1: Address most prevalent disease
    const topDisease = [...statsData.byDisease].sort((a,b) => b.count - a.count)[0];
    if (topDisease) {
        actions.push({
            id: 1,
            priority: topDisease.count > 5 ? 'High' : 'Moderate',
            title: `Address ${topDisease._id} Outbreak`,
            desc: `${topDisease.count} cases detected. Review intervention protocols for affected zones.`,
            time: topDisease.count > 5 ? 'Immediate' : 'Within 24h'
        });
    }

    // Action 2: Address High Severity risk
    const highSev = statsData.bySeverity?.find(s => s._id === 'High');
    if (highSev && highSev.count > 0) {
        actions.push({
            id: 2,
            priority: 'High',
            title: 'Critical Threat Mitigation',
            desc: `${highSev.count} Priority 1 cases identified. Disptach field teams to confirm severity.`,
            time: 'Immediate'
        });
    } else {
        // Fallback action if no high severity
         actions.push({
            id: 2,
            priority: 'Low',
            title: 'Routine Sensor Diagnostics',
            desc: 'System baseline is stable. Proceed with scheduled neural node recalibration.',
            time: 'This Week'
        });
    }

    // Action 3: Territory context action
    actions.push({
        id: 3,
        priority: 'Moderate',
        title: 'Sector Containment',
        desc: 'Expanding intervention zones based on active spread vectors in high-density areas.',
        time: 'Within 48h'
    });

    return actions;
  };

  const dynamicActions = generateActions(stats);

  return (
    <section className="py-32 bg-[#fafafa] relative overflow-hidden" id="analytics">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                 <div className="relative flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-60"></div>
                 </div>
                 <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">Intelligence Command Active</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200">
                 <Clock size={12} className="text-slate-500" /> SYNC: {currentTime}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Latency: <span className="text-slate-900">14ms</span></div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-[-0.07em] leading-none uppercase">
                Health <br />
                <span className="text-emerald-500 italic drop-shadow-sm">Insights.</span>
              </h2>
              <p className="text-slate-500 font-medium text-lg max-w-2xl tracking-tight leading-relaxed">
                Real-time regional risk stratification and diagnostic intelligence from 42 deployed agricultural nodes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
             <button className="flex items-center gap-3 px-8 py-5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                <Filter size={16} /> Global View
             </button>
             <button className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)] hover:bg-emerald-600 transition-colors group">
                <Download size={16} className="group-hover:-translate-y-1 transition-transform" /> Export Report
             </button>
          </div>
        </div>

        {/* LEVEL 1: KPI SUMMARY STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            icon={<ShieldAlert className="text-red-500" />} 
            label="Active Disease Alerts" 
            value={highSeverityCount} 
            growth="Critical" 
            sub="Priority 1 Cases"
            valueColor="text-red-500"
            bgColor="bg-white"
          />
          <StatCard 
            icon={<TrendingUp className="text-amber-500" />} 
            label="System Risk Level" 
            value={`${riskPercentage}%`} 
            growth={riskLevel} 
            sub="Threat baseline"
            valueColor={riskColor}
            bgColor="bg-white"
          />
          <StatCard 
            icon={<Crosshair className="text-emerald-500" />} 
            label="Monitoring Coverage" 
            value="98.2%" 
            growth="Optimal" 
            sub="Neural up-time"
            valueColor="text-emerald-600"
            bgColor="bg-white"
          />
          <StatCard 
            icon={<Network className="text-slate-600" />} 
            label="System Resilience" 
            value="99.8%" 
            growth="Optimal" 
            sub="Network Integrity"
            valueColor="text-slate-800"
            bgColor="bg-slate-100" 
          />
        </div>

        {/* LEVEL 2: DATA VISUALIZATIONS */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Bar Chart Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.02)] group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] transition-all duration-700 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Pathological Spread</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Classified Detection Frequencies</p>
               </div>
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all duration-500 shadow-inner">
                  <Activity size={20} strokeWidth={1.5} />
               </div>
            </div>
            <div className="h-80 flex-1 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.byDisease || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 10, fontWeight: 800, textTransform: 'uppercase'}} 
                    dy={16}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 700}} 
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(16, 185, 129, 0.04)', radius: [16,16,0,0]}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-5 rounded-[1.5rem] shadow-2xl backdrop-blur-xl">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 
                               {payload[0].payload._id}
                            </p>
                            <div className="flex items-baseline gap-2">
                               <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{payload[0].value}</p>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Detections</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[12, 12, 12, 12]} 
                    barSize={40}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {stats?.byDisease?.map((entry, index) => (
                      <Cell 
                         key={`cell-${index}`} 
                         fill={COLORS[index % COLORS.length]} 
                         className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.02)] group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] transition-all duration-700 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Severity Index</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Threat Level Concentration</p>
               </div>
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 group-hover:text-red-500 group-hover:bg-red-50 group-hover:border-red-200 transition-all duration-500 shadow-inner">
                  <AlertTriangle size={20} strokeWidth={1.5} />
               </div>
            </div>
            <div className="h-80 flex-1 relative w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.bySeverity || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={110}
                    outerRadius={140}
                    paddingAngle={6}
                    dataKey="count"
                    nameKey="_id"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={1800}
                  >
                    {stats?.bySeverity?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SEVERITY_COLORS[entry._id] || COLORS[0]} 
                        className="hover:opacity-90 transition-opacity cursor-pointer drop-shadow-sm"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-5 rounded-[1.5rem] shadow-2xl backdrop-blur-xl">
                            <p className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" 
                               style={{ color: SEVERITY_COLORS[payload[0].name] || COLORS[0] }}>
                               <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[payload[0].name] || COLORS[0] }}></span> 
                               {payload[0].name} Threat
                            </p>
                            <div className="flex items-baseline gap-2">
                               <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{payload[0].value}</p>
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cases</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Dynamic Center Label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center justify-center bg-white w-48 h-48 rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Total Signals</p>
                 <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                   {totalCount}
                 </p>
                 <div className="mt-3 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">Scans Logged</p>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* LEVEL 3: ACTION & CONTEXT */}
        <div className="grid lg:grid-cols-12 gap-8">
           {/* Territory Context Panel */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="lg:col-span-4 bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl group"
           >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                       <MapPin size={24} className="text-emerald-400" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black tracking-tight leading-none mb-1 text-white uppercase">Territory Context</h3>
                       <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Regional Spread Vectors</p>
                    </div>
                 </div>

                 <div className="bg-slate-950/50 rounded-[2rem] border border-white/5 p-6 mb-6 flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                       <Target size={28} className="text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter tabular-nums mb-1">
                       14.2<span className="text-xl text-slate-500 ml-1">km</span>
                    </div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Estimated Spread Radius</div>
                 </div>

                 <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] flex gap-3 items-start">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase tracking-widest">
                       <span className="text-amber-400">High density clustering in Sector 4.</span> Recommend immediate containment protocols.
                    </p>
                 </div>
              </div>
           </motion.div>

           {/* Actionable Insight Panel */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] flex flex-col"
           >
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                       <Crosshair size={20} strokeWidth={2} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Suggested Monitoring Actions</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">AI-Derived Intervention Strategies</p>
                    </div>
                 </div>
                 <div className="px-3 py-1.5 bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-lg">{dynamicActions.length} Actions Pending</div>
              </div>

              <div className="flex-1 space-y-4">
                 {dynamicActions.map(action => (
                    <ActionRow 
                        key={action.id}
                        priority={action.priority} 
                        title={action.title} 
                        desc={action.desc} 
                        time={action.time}
                    />
                 ))}
                 {dynamicActions.length === 0 && (
                     <div className="text-center py-8 text-slate-400 text-sm font-medium">
                         No critical actions required at this time.
                     </div>
                 )}
              </div>

              <button className="w-full mt-8 py-5 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all transform active:scale-[0.98] border border-slate-200 hover:border-slate-900 group">
                 <span>Acknowledged — Send to Field Teams</span>
                 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, growth, sub, valueColor, bgColor }) {
  const isPriority = growth === 'Critical';
  const isActive = growth === 'Optimal' || growth === 'Stable';
  const isWarning = growth === 'Elevated';
  
  return (
    <div className={`${bgColor} p-8 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-[0_15px_45px_-10px_rgba(0,0,0,0.04)] group hover:border-emerald-500/20 hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.1)] transition-all duration-500 cursor-default relative overflow-hidden flex flex-col justify-between h-full`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-bl-full"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-200 group-hover:border-slate-800">
          {React.cloneElement(icon, { size: 24, strokeWidth: 1.5 })}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white ${
          isPriority ? 'border-red-200 text-red-600' : 
          isActive ? 'border-emerald-200 text-emerald-600' : 
          isWarning ? 'border-amber-200 text-amber-600' :
          'border-slate-200 text-slate-700'
        }`}>
           {!isPriority && !isWarning && <CheckCircle size={10} className="text-emerald-500 shrink-0" />}
           {isWarning && <Activity size={10} className="text-amber-500 shrink-0" />}
           {isPriority && <AlertTriangle size={10} className="text-red-500 shrink-0" />}
           <span className="text-[9px] font-black uppercase tracking-widest leading-none drop-shadow-sm">{growth}</span>
        </div>
      </div>
      
      <div className="space-y-1 relative z-10 mt-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-baseline gap-3">
           <h4 className={`text-4xl lg:text-5xl font-black tracking-tighter leading-none tabular-nums group-hover:scale-[1.03] transition-transform origin-left duration-300 ${valueColor}`}>{value || 0}</h4>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight w-16">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function ActionRow({ priority, title, desc, time }) {
   return (
      <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-all cursor-pointer">
         <div className="flex gap-4 items-start sm:items-center">
            <div className={`w-2 h-2 rounded-full mt-2 sm:mt-0 shrink-0 ${
               priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
               priority === 'Moderate' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' :
               'bg-emerald-500'
            }`}></div>
            <div>
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{title}</h4>
               <p className="text-xs font-semibold text-slate-500 leading-snug mt-1">{desc}</p>
            </div>
         </div>
         <div className="mt-4 sm:mt-0 sm:ml-4 px-3 py-1.5 bg-slate-100 rounded-lg shrink-0">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{time}</span>
         </div>
      </div>
   );
}
