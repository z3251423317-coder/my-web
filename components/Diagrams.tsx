
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, Activity, Cpu, BarChart2, Trophy, Sparkles, 
  Zap, AlertTriangle, Gamepad2, BookOpen, Award, Shield, Snowflake, Flame
} from 'lucide-react';

// --- TYPE DECLARATIONS ---
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

interface PowerUp {
  type: 'shield' | 'freeze';
  x: string;
  y: string;
  label: string;
  color: string;
}

// --- SURFACE CODE DIAGRAM & MINI-GAME ---
export const SurfaceCodeDiagram: React.FC = () => {
  // Demo states (removing game-only states)
  const [errors, setErrors] = useState<number[]>([]);
  
  // Custom interactive animations & features for demo
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Adjacency list: DataQubit Index -> Stabilizer Indices
  const adjacency: Record<number, number[]> = {
    0: [0, 1],
    1: [0, 2],
    2: [1, 3],
    3: [2, 3],
    4: [0, 1, 2, 3], 
  };

  // Grid layouts for Qubits & Stabilizers
  const qubitsList = [
    { id: 0, x: '22%', y: '22%', label: 'D0' },
    { id: 1, x: '78%', y: '22%', label: 'D1' },
    { id: 4, x: '50%', y: '50%', label: 'D4' },
    { id: 2, x: '22%', y: '78%', label: 'D2' },
    { id: 3, x: '78%', y: '78%', label: 'D3' },
  ];

  const stabilizersList = [
    { id: 0, x: '50%', y: '22%', type: 'Z', color: 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' },
    { id: 1, x: '22%', y: '50%', type: 'X', color: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]' },
    { id: 2, x: '78%', y: '50%', type: 'X', color: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]' },
    { id: 3, x: '50%', y: '78%', type: 'Z', color: 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' },
  ];

  // Calculate active stabilizers based on parity
  const activeStabilizers = [0, 1, 2, 3].filter(stabId => {
    let errorCount = 0;
    Object.entries(adjacency).forEach(([dataId, stabs]) => {
      if (errors.includes(parseInt(dataId)) && stabs.includes(stabId)) {
        errorCount++;
      }
    });
    return errorCount % 2 !== 0;
  });

  const handleQubitClick = (id: number) => {
    setErrors(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  return (
    <motion.div 
      animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="flex flex-col items-center p-5 md:p-6 rounded-2xl shadow-2xl border border-white/10 select-none relative overflow-hidden w-full backdrop-blur-md" 
      style={{ background: 'transparent' }}
    >
      
      {/* EDUCATIONAL SANDBOX DEMO MODE */}
      <div className="w-full flex flex-col items-center animate-fade-in">
        <div className="text-center mb-4">
          <h3 className="font-display text-base text-white font-bold tracking-tight flex items-center justify-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>表面码校验沙盒</span>
          </h3>
          <p className="text-[10px] text-zinc-400 mt-0.5 max-w-xs leading-relaxed">
            点击灰色的 <strong className="text-zinc-200">物理比特</strong> 手动注入错误。观察奇偶校验器在检测到奇数个相邻错误时，如何触发红/蓝警报。
          </p>
        </div>

        <div className="relative w-64 h-64 bg-zinc-950/45 rounded-xl border border-white/5 p-4 flex flex-wrap justify-between content-between shadow-inner">
          {/* Grid Line Accents */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
            <div className="w-2/3 h-2/3 border border-dashed border-zinc-500"></div>
            <div className="absolute w-full h-[1px] bg-zinc-500"></div>
            <div className="absolute h-full w-[1px] bg-zinc-500"></div>
          </div>

          {/* Stabilizers indicators */}
          {stabilizersList.map(stab => {
            const isActive = activeStabilizers.includes(stab.id);
            return (
              <motion.div
                key={`demo-stab-${stab.id}`}
                className={`absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center text-white text-xs font-bold rounded-lg shadow-md transition-all duration-300 ${
                  isActive 
                    ? stab.color + ' opacity-100 scale-110 ring-2 ring-white/30' 
                    : 'bg-zinc-900/40 text-zinc-500 border border-zinc-800/10 opacity-30'
                }`}
                style={{ left: stab.x, top: stab.y }}
              >
                {stab.type}
              </motion.div>
            );
          })}

          {/* Data Qubits Nodes */}
          {qubitsList.map(q => {
            const hasErr = errors.includes(q.id);
            return (
              <button
                key={`demo-q-${q.id}`}
                onClick={() => handleQubitClick(q.id)}
                className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${
                  hasErr 
                    ? 'bg-amber-500 border-amber-400 text-zinc-950 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)] cursor-pointer' 
                    : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white hover:scale-105 cursor-pointer'
                }`}
                style={{ left: q.x, top: q.y }}
              >
                {hasErr ? (
                  <Activity size={14} className="animate-pulse" />
                ) : (
                  <span className="text-[9px] font-mono font-bold">{q.label}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between w-full max-w-[280px]">
          <span className="text-[10px] font-mono text-zinc-400">
            {errors.length === 0 ? "STATUS: STABLE / 系统稳定" : `VIOLATIONS: ${activeStabilizers.length} ALARM(S)`}
          </span>
          {errors.length > 0 && (
            <button 
              onClick={() => setErrors([])}
              className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>清空错误</span>
            </button>
          )}
        </div>
      </div>

    </motion.div>
  );
};


// --- TRANSFORMER DECODER DIAGRAM ---
export const TransformerDecoderDiagram: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setStep(s => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-[#F5F4F0] rounded-xl border border-stone-200 my-8">
      <h3 className="font-serif text-xl mb-4 text-stone-900">AlphaQubit Architecture</h3>
      <p className="text-sm text-stone-600 mb-6 text-center max-w-md">
        The model processes syndrome history using a recurrent transformer, attending to spatial and temporal correlations.
      </p>

      <div className="relative w-full max-w-lg h-56 bg-white rounded-lg shadow-inner overflow-hidden mb-6 border border-stone-200 flex items-center justify-center gap-8 p-4">
        
        {/* Input Stage */}
        <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 0 ? 'border-nobel-gold bg-nobel-gold/10' : 'border-stone-200 bg-stone-50'}`}>
                <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${Math.random() > 0.7 ? 'bg-stone-800' : 'bg-stone-300'}`}></div>)}
                </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Syndrome</span>
        </div>

        {/* Arrows */}
        <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3, x: step >= 1 ? 0 : -5 }}>→</motion.div>

        {/* Transformer Stage */}
        <div className="flex flex-col items-center gap-2">
             <div className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors duration-500 relative overflow-hidden ${step === 1 || step === 2 ? 'border-stone-800 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50'}`}>
                <Cpu size={24} className={step === 1 || step === 2 ? 'text-nobel-gold animate-pulse' : 'text-stone-300'} />
                {step === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-nobel-gold absolute top-1/3 animate-ping"></div>
                        <div className="w-full h-[1px] bg-nobel-gold absolute top-2/3 animate-ping delay-75"></div>
                    </div>
                )}
             </div>
             <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Transformer</span>
        </div>

        {/* Arrows */}
        <motion.div animate={{ opacity: step >= 3 ? 1 : 0.3, x: step >= 3 ? 0 : -5 }}>→</motion.div>

        {/* Output Stage */}
        <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 3 ? 'border-green-500 bg-green-50' : 'border-stone-200 bg-stone-50'}`}>
                {step === 3 ? (
                    <span className="text-2xl font-serif text-green-600">X</span>
                ) : (
                    <span className="text-2xl font-serif text-stone-300">?</span>
                )}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Correction</span>
        </div>

      </div>

      <div className="flex gap-2">
          {[0, 1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-nobel-gold' : 'w-2 bg-stone-300'}`}></div>
          ))}
      </div>
    </div>
  );
};

// --- PERFORMANCE CHART ---
export const PerformanceMetricDiagram: React.FC = () => {
    const [distance, setDistance] = useState<3 | 5 | 11>(5);
    
    // Values represent Logical Error Rate (approx %).
    // Lower is better.
    // Updated with correct Paper values:
    // Dist 3: MWPM 3.5%, Alpha 2.9%
    // Dist 5: MWPM 3.6%, Alpha 2.75%
    // Dist 11: MWPM ~0.0041%, Alpha ~0.0009% (Based on paper's hard input simulation data)
    const data = {
        3: { mwpm: 3.5, alpha: 2.9 },
        5: { mwpm: 3.6, alpha: 2.75 },
        11: { mwpm: 0.0041, alpha: 0.0009 } 
    };

    const currentData = data[distance];
    // Normalize to max value of current set to visually fill the chart, with some headroom
    const maxVal = Math.max(currentData.mwpm, currentData.alpha) * 1.25;
    
    const formatValue = (val: number) => {
        if (val < 0.01) return val.toFixed(4) + '%';
        return val.toFixed(2) + '%';
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-stone-900 text-stone-100 rounded-xl my-8 border border-stone-800 shadow-lg">
            <div className="flex-1 min-w-[240px]">
                <h3 className="font-serif text-xl mb-2 text-nobel-gold">Performance vs Standard</h3>
                <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                    AlphaQubit consistently achieves lower logical error rates (LER) than the standard Minimum-Weight Perfect Matching (MWPM) decoder.
                </p>
                <div className="flex gap-2 mt-6">
                    {[3, 5, 11].map((d) => (
                        <button 
                            key={d}
                            onClick={() => setDistance(d as any)} 
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 border ${distance === d ? 'bg-nobel-gold text-stone-900 border-nobel-gold' : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500 hover:text-stone-200'}`}
                        >
                            Distance {d}
                        </button>
                    ))}
                </div>
                <div className="mt-6 font-mono text-xs text-stone-500 flex items-center gap-2">
                    <BarChart2 size={14} className="text-nobel-gold" /> 
                    <span>LOGICAL ERROR RATE (LOWER IS BETTER)</span>
                </div>
            </div>
            
            <div className="relative w-64 h-72 bg-stone-800/50 rounded-xl border border-stone-700/50 p-6 flex justify-around items-end">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-10">
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                </div>

                {/* MWPM Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-5 w-full text-center text-sm font-mono text-stone-400 font-bold bg-stone-900/90 py-1 px-2 rounded backdrop-blur-sm border border-stone-700/50 shadow-sm">{formatValue(currentData.mwpm)}</div>
                        <motion.div 
                            className="w-full bg-stone-600 rounded-t-md border-t border-x border-stone-500/30"
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentData.mwpm / maxVal) * 100}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        />
                    </div>
                    <div className="h-6 flex items-center text-xs font-bold text-stone-500 uppercase tracking-wider">Standard</div>
                </div>

                {/* AlphaQubit Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                     <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-5 w-full text-center text-sm font-mono text-nobel-gold font-bold bg-stone-900/90 py-1 px-2 rounded backdrop-blur-sm border border-nobel-gold/30 shadow-sm">{formatValue(currentData.alpha)}</div>
                        <motion.div 
                            className="w-full bg-nobel-gold rounded-t-md shadow-[0_0_20px_rgba(197,160,89,0.25)] relative overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(1, (currentData.alpha / maxVal) * 100) + '%' }}
                            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                        >
                           {/* Shine effect */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                        </motion.div>
                    </div>
                     <div className="h-6 flex items-center text-xs font-bold text-nobel-gold uppercase tracking-wider">AlphaQubit</div>
                </div>
            </div>
        </div>
    )
}
