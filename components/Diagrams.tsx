
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
  const [activeTab, setActiveTab] = useState<'game' | 'demo'>('game');
  
  // Game states
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('alphaqubit_game_highscore') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [level, setLevel] = useState<number>(1);
  const [decoherence, setDecoherence] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [errors, setErrors] = useState<number[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: string; y: string; color?: string }[]>([]);
  
  // Custom interactive animations & features
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [activePowerUp, setActivePowerUp] = useState<PowerUp | null>(null);
  const [shieldTimeLeft, setShieldTimeLeft] = useState<number>(0); // Seconds of remaining shield
  const [freezeTimeLeft, setFreezeTimeLeft] = useState<number>(0); // Seconds of remaining freeze
  const [feverActive, setFeverActive] = useState<boolean>(false);

  // Adjacency list: DataQubit Index -> Stabilizer Indices
  // Layout:
  // D0  S0  D1
  // S1  D4  S2
  // D2  S3  D3
  const adjacency: Record<number, number[]> = {
    0: [0, 1],
    1: [0, 2],
    2: [1, 3],
    3: [2, 3],
    4: [0, 1, 2, 3], // Center affects all in this simplified tightly packed model
  };

  // Grid layouts for Qubits & Stabilizers
  const qubitsList = [
    { id: 0, x: '22%', y: '22%', label: 'D0' },
    { id: 1, x: '78%', y: '22%', label: 'D1' },
    { id: 4, x: '50%', y: '50%', label: 'D4' }, // Center
    { id: 2, x: '22%', y: '78%', label: 'D2' },
    { id: 3, x: '78%', y: '78%', label: 'D3' },
  ];

  const stabilizersList = [
    { id: 0, x: '50%', y: '22%', type: 'Z', color: 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' },
    { id: 1, x: '22%', y: '50%', type: 'X', color: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]' },
    { id: 2, x: '78%', y: '50%', type: 'X', color: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]' },
    { id: 3, x: '50%', y: '78%', type: 'Z', color: 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' },
  ];

  // Particle updates loop (60fps simulation)
  useEffect(() => {
    if (particles.length === 0) return;

    const frameId = requestAnimationFrame(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.08, // Subtle gravity
            size: p.size * 0.95 // Slowly shrink
          }))
          .filter(p => p.size > 0.4) // Remove tiny particles
      );
    });

    return () => cancelAnimationFrame(frameId);
  }, [particles]);

  // Handle Shield and Freeze Countdown Timers
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      if (shieldTimeLeft > 0) {
        setShieldTimeLeft(prev => prev - 1);
      }
      if (freezeTimeLeft > 0) {
        setFreezeTimeLeft(prev => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, shieldTimeLeft, freezeTimeLeft]);

  // Fever status trigger
  useEffect(() => {
    if (combo >= 5) {
      if (!feverActive) {
        setFeverActive(true);
        triggerFloatingText('🔥 FEVER FEVER 🔥', '50%', '35%', 'text-amber-400 font-extrabold text-lg scale-110');
      }
    } else {
      setFeverActive(false);
    }
  }, [combo]);

  // Floating text utility
  const triggerFloatingText = (text: string, x: string, y: string, color: string = 'text-amber-400') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 850);
  };

  // Spark Generator
  const spawnSparks = (xStr: string, yStr: string, isFever: boolean = false) => {
    const x = parseFloat(xStr);
    const y = parseFloat(yStr);
    
    const count = isFever ? 15 : 8;
    const colors = isFever 
      ? ['#fbbf24', '#f59e0b', '#ef4444', '#f43f5e'] 
      : ['#34d399', '#fbbf24', '#60a5fa', '#a78bfa'];

    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
      const speed = 2.5 + Math.random() * 3.5;
      return {
        id: Math.random() + Date.now(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0, // Shoot slightly upward
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4
      };
    });

    setParticles(prev => [...prev, ...newParticles]);
  };

  // Trigger brief screen shake
  const shakeScreen = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  // Calculate active stabilizers based on parity (even errors = off, odd errors = on)
  const activeStabilizers = [0, 1, 2, 3].filter(stabId => {
    let errorCount = 0;
    Object.entries(adjacency).forEach(([dataId, stabs]) => {
      if (errors.includes(parseInt(dataId)) && stabs.includes(stabId)) {
        errorCount++;
      }
    });
    return errorCount % 2 !== 0;
  });

  // Game Core Loop 1: Spawning errors & Power-ups
  useEffect(() => {
    if (activeTab !== 'game' || gameState !== 'playing') return;

    // Slow down speed if Freeze Power-up is active
    const isFrozen = freezeTimeLeft > 0;
    const baseInterval = Math.max(380, 2100 - level * 300);
    const spawnSpeed = isFrozen ? baseInterval * 1.8 : baseInterval;
    
    const spawnTimer = setInterval(() => {
      // Pick a qubit that doesn't already have an error
      const availableQubits = qubitsList.map(q => q.id).filter(id => !errors.includes(id));
      if (availableQubits.length > 0) {
        const randomId = availableQubits[Math.floor(Math.random() * availableQubits.length)];
        setErrors(prev => [...prev, randomId]);
        
        // Find qubit position to spawn a warning effect
        const qObj = qubitsList.find(q => q.id === randomId);
        if (qObj) {
          triggerFloatingText('⚠️ ERR', qObj.x, qObj.y, 'text-rose-400 font-mono text-[10px] scale-90');
        }
      }

      // Randomly spawn a shield/freeze power-up (15% chance if none active)
      if (Math.random() < 0.16 && !activePowerUp) {
        const powerPositions = [
          { x: '50%', y: '35%', label: '🛡️ Shield' },
          { x: '50%', y: '65%', label: '❄️ Slow' }
        ];
        const chosen = powerPositions[Math.floor(Math.random() * powerPositions.length)];
        setActivePowerUp({
          type: chosen.label.includes('Shield') ? 'shield' : 'freeze',
          x: chosen.x,
          y: chosen.y,
          label: chosen.label,
          color: chosen.label.includes('Shield') ? 'border-cyan-400 text-cyan-300 bg-cyan-950/80 shadow-[0_0_15px_rgba(34,211,238,0.7)]' : 'border-indigo-400 text-indigo-300 bg-indigo-950/80 shadow-[0_0_15px_rgba(129,140,248,0.7)]'
        });
      }
    }, spawnSpeed);

    return () => clearInterval(spawnTimer);
  }, [gameState, level, errors, activeTab, freezeTimeLeft, activePowerUp]);

  // Game Core Loop 2: Decoherence depletion and score-based level progression
  useEffect(() => {
    if (activeTab !== 'game' || gameState !== 'playing') return;

    const tickTimer = setInterval(() => {
      // Decoherence increases based on active error count
      // If Shield is active, no decoherence penalty!
      const isShielded = shieldTimeLeft > 0;
      const rate = isShielded ? 0 : (0.5 + (errors.length * 2.0));
      
      setDecoherence(prev => {
        const next = prev + rate;
        if (next >= 100) {
          setGameState('gameover');
          // Handle high score
          if (score > highScore) {
            setHighScore(score);
            try {
              localStorage.setItem('alphaqubit_game_highscore', score.toString());
            } catch (e) { console.error(e); }
          }
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(tickTimer);
  }, [gameState, errors, score, highScore, activeTab, shieldTimeLeft]);

  // Handle Score Levels
  useEffect(() => {
    if (score >= 4800) setLevel(6);
    else if (score >= 3000) setLevel(5);
    else if (score >= 1600) setLevel(4);
    else if (score >= 700) setLevel(3);
    else if (score >= 200) setLevel(2);
  }, [score]);

  // Handle game reset
  const startGame = () => {
    setErrors([]);
    setScore(0);
    setLevel(1);
    setDecoherence(0);
    setCombo(0);
    setMaxCombo(0);
    setShieldTimeLeft(0);
    setFreezeTimeLeft(0);
    setActivePowerUp(null);
    setFeverActive(false);
    setGameState('playing');
  };

  const handleQubitClick = (id: number, x: string, y: string) => {
    if (activeTab === 'demo') {
      // Sandbox Mode: Toggle error
      setErrors(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
      return;
    }

    // Game Mode
    if (gameState !== 'playing') return;

    if (errors.includes(id)) {
      // Correction Success!
      setErrors(prev => prev.filter(e => e !== id));
      
      const multiplier = feverActive ? 2 : 1;
      const currentCombo = combo + 1;
      setCombo(currentCombo);
      if (currentCombo > maxCombo) setMaxCombo(currentCombo);

      const pts = 100 * multiplier * Math.max(1, Math.floor(currentCombo / 3));
      setScore(s => s + pts);
      
      // Correcting errors restores stability (reduces decoherence)
      setDecoherence(d => Math.max(0, d - 14)); 
      
      // Explode Sparks!
      spawnSparks(x, y, feverActive);
      
      triggerFloatingText(`+${pts}`, x, y, feverActive ? 'text-amber-400 font-extrabold text-base animate-pulse' : 'text-emerald-400 font-extrabold text-base');
      if (currentCombo >= 3) {
        setTimeout(() => {
          triggerFloatingText(`${currentCombo}X COMBO!`, x, `calc(${y} - 15px)`, 'text-cyan-400 text-xs tracking-wider font-bold');
        }, 120);
      }
    } else {
      // Measurement Fault! Punish clicking a clean qubit
      setCombo(0);
      setDecoherence(d => Math.min(100, d + 14));
      shakeScreen();
      triggerFloatingText('FAULT -14%', x, y, 'text-rose-500 font-bold font-mono');
    }
  };

  // Click powerup item
  const claimPowerUp = () => {
    if (!activePowerUp || gameState !== 'playing') return;
    
    const { type, x, y } = activePowerUp;
    if (type === 'shield') {
      setShieldTimeLeft(6);
      triggerFloatingText('🛡️ SHIELD ACTIVE! (6s)', x, y, 'text-cyan-300 font-black tracking-wide');
    } else {
      setFreezeTimeLeft(6);
      triggerFloatingText('❄️ NOISE FROZEN! (6s)', x, y, 'text-indigo-300 font-black tracking-wide');
    }
    
    spawnSparks(x, y, true);
    setActivePowerUp(null);
  };

  // Get Rank Title
  const getRank = (finalScore: number) => {
    if (finalScore < 400) return { title: '量子见习 (Trainee)', color: 'text-zinc-400 border-zinc-500/30 bg-zinc-900/40' };
    if (finalScore < 1500) return { title: '纠错特工 (Syndrome Agent)', color: 'text-sky-400 border-sky-500/30 bg-sky-950/40' };
    if (finalScore < 3500) return { title: '解码大师 (Decoding Master)', color: 'text-amber-400 border-amber-500/30 bg-amber-950/40' };
    return { title: '容错尊者 (Quantum Master)', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40 animate-pulse' };
  };

  return (
    <motion.div 
      animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="flex flex-col items-center p-5 md:p-6 rounded-2xl shadow-2xl border border-white/10 select-none relative overflow-hidden w-full backdrop-blur-md" 
      style={{ background: 'transparent' }}
    >
      
      {/* Mini Segmented Switcher */}
      <div className="flex bg-white/5 border border-white/10 p-1 rounded-full mb-5 z-10 w-full max-w-[280px]">
        <button 
          onClick={() => {
            setActiveTab('game');
            setErrors([]);
            setGameState('idle');
          }}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'game' 
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>纠错挑战</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab('demo');
            setErrors([]);
          }}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'demo' 
              ? 'bg-white/15 text-white font-bold shadow-md' 
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>原理解析</span>
        </button>
      </div>

      {activeTab === 'game' ? (
        // GAME CHALLENGE MODE
        <div className="w-full flex flex-col items-center">
          <div className="text-center mb-3">
            <h3 className="font-display text-base text-white font-bold tracking-tight flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>量子纠错保卫战</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5 max-w-xs leading-relaxed">
              点击纠正产生的 <span className="text-rose-400 font-bold">翻转错误</span>，快速堆积连击！阻止 <span className="text-cyan-400 font-bold">系统退相干</span>！
            </p>
          </div>

          {/* Game Dashboard Panel */}
          <div className="w-full max-w-[300px] bg-white/[0.03] border border-white/5 rounded-xl p-2.5 mb-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div>
              <div className="text-[9px] text-zinc-500 uppercase font-sans">分数 Score</div>
              <div className="text-base text-amber-400 font-black">{score}</div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 uppercase font-sans">连击 Combo</div>
              <div className="text-base text-cyan-400 font-black flex items-center justify-center gap-0.5">
                {combo > 0 && <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />}
                {combo}x
              </div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 uppercase font-sans">难度 Level</div>
              <div className="text-base text-white font-black">Lv.{level}</div>
            </div>
          </div>

          {/* Active Powerup status row */}
          {(shieldTimeLeft > 0 || freezeTimeLeft > 0 || feverActive) && (
            <div className="flex gap-2 mb-3 max-w-[300px] w-full justify-center">
              {feverActive && (
                <div className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-md text-[9px] text-amber-300 font-bold flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>狂热 2x 积分</span>
                </div>
              )}
              {shieldTimeLeft > 0 && (
                <div className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/40 rounded-md text-[9px] text-cyan-300 font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>护盾 {shieldTimeLeft}s</span>
                </div>
              )}
              {freezeTimeLeft > 0 && (
                <div className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/40 rounded-md text-[9px] text-indigo-300 font-bold flex items-center gap-1">
                  <Snowflake className="w-3 h-3" />
                  <span>减速 {freezeTimeLeft}s</span>
                </div>
              )}
            </div>
          )}

          {/* Decoherence Metre Bar */}
          {gameState === 'playing' && (
            <div className="w-full max-w-[300px] mb-4 space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-pulse text-rose-500" />
                  系统失相率 DECOHERENCE
                </span>
                <span className={`${decoherence > 75 ? 'text-rose-400 animate-pulse font-bold' : decoherence > 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {Math.round(decoherence)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-950/70 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className={`h-full rounded-full transition-all duration-150 ${
                    shieldTimeLeft > 0 
                      ? 'bg-gradient-to-r from-cyan-400 to-sky-500 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                      : decoherence > 75 
                        ? 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]' 
                        : decoherence > 45 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${decoherence}%` }}
                />
              </div>
            </div>
          )}

          {/* Canvas Board Area */}
          <div className="relative w-64 h-64 bg-zinc-950/50 rounded-2xl border border-white/10 p-4 flex flex-wrap justify-between content-between shadow-inner overflow-hidden">
            {/* Grid Line Accents */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
              <div className="w-2/3 h-2/3 border border-dashed border-zinc-500"></div>
              <div className="absolute w-full h-[1px] bg-zinc-500"></div>
              <div className="absolute h-full w-[1px] bg-zinc-500"></div>
            </div>

            {/* Simulated Live Particles Canvas Overlay */}
            {particles.map(p => (
              <div 
                key={p.id}
                className="absolute rounded-full pointer-events-none z-30"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                  transform: 'translate(-50%, -50%)',
                  opacity: Math.min(1, p.size / 2)
                }}
              />
            ))}

            {/* Floating popups */}
            <AnimatePresence>
              {floatingTexts.map(t => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 1, y: 10, scale: 0.8 }}
                  animate={{ opacity: 0, y: -45, scale: 1.25 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`absolute pointer-events-none font-mono font-black text-xs z-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${t.color || 'text-amber-400'}`}
                  style={{ left: t.x, top: t.y, transform: 'translate(-50%, -50%)' }}
                >
                  {t.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {gameState === 'playing' ? (
              <>
                {/* Stabilizers indicators */}
                {stabilizersList.map(stab => {
                  const isActive = activeStabilizers.includes(stab.id);
                  return (
                    <motion.div
                      key={`game-stab-${stab.id}`}
                      className={`absolute w-10 h-10 -ml-5 -mt-5 flex flex-col items-center justify-center text-white text-[11px] font-bold rounded-lg transition-all duration-300 ${
                        isActive 
                          ? stab.color + ' opacity-100 scale-110 ring-2 ring-white/30' 
                          : 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/20 opacity-30'
                      }`}
                      style={{ left: stab.x, top: stab.y }}
                    >
                      <span>{stab.type}</span>
                      {isActive && <span className="text-[7px] text-white/80 scale-90 -mt-0.5 animate-pulse">ERR</span>}
                    </motion.div>
                  );
                })}

                {/* Randomly Spawning PowerUp Item */}
                {activePowerUp && (
                  <motion.button
                    onClick={claimPowerUp}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1.1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.25, rotate: 15 }}
                    className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-xl border flex flex-col items-center justify-center z-40 transition-all cursor-pointer ${activePowerUp.color}`}
                    style={{ left: activePowerUp.x, top: activePowerUp.y }}
                  >
                    <div className="absolute inset-0 rounded-xl border border-dashed border-white/40 animate-spin" style={{ animationDuration: '4s' }} />
                    {activePowerUp.type === 'shield' ? <Shield size={16} className="animate-bounce" /> : <Snowflake size={16} className="animate-pulse" />}
                  </motion.button>
                )}

                {/* Data Qubits Interactive Nodes */}
                {qubitsList.map(q => {
                  const hasErr = errors.includes(q.id);
                  return (
                    <button
                      key={`game-q-${q.id}`}
                      onClick={() => handleQubitClick(q.id, q.x, q.y)}
                      className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 ${
                        hasErr 
                          ? 'bg-rose-600 border-rose-400 text-white scale-110 shadow-[0_0_18px_rgba(244,63,94,0.85)] hover:bg-rose-500 animate-pulse cursor-pointer' 
                          : 'bg-zinc-950/90 border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-white cursor-pointer hover:scale-105 active:scale-90'
                      }`}
                      style={{ left: q.x, top: q.y }}
                    >
                      {hasErr ? (
                        <Activity size={16} className="animate-bounce text-white drop-shadow-md" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">{q.label}</span>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              // MENU / GAMEOVER INNER SCREEN OVERLAYS
              <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                {gameState === 'idle' ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                      <Gamepad2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-300 leading-normal px-2">
                        纠正随机产生的翻转错误。<br/>利用随机掉落的 <span className="text-cyan-300 font-bold">护盾</span> 和 <span className="text-indigo-300 font-bold">减速</span> 道具！
                      </p>
                    </div>
                    <button
                      onClick={startGame}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg shadow-md cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all"
                    >
                      开始量子防卫战
                    </button>
                  </div>
                ) : (
                  // GAME OVER STATE
                  <div className="space-y-3.5 w-full">
                    <div className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-rose-500 tracking-wider">量子态坍缩 STACK OVERFLOW</h4>
                      <p className="text-[10px] text-zinc-400">系统发生退相干，量子计算中止</p>
                    </div>
                    
                    {/* Dynamic rank award */}
                    {(() => {
                      const rank = getRank(score);
                      return (
                        <div className={`border rounded-lg px-3 py-1 text-[10px] font-bold mx-auto inline-flex items-center gap-1 ${rank.color}`}>
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>等级: {rank.title}</span>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-2 gap-2 max-w-[200px] mx-auto text-center font-mono py-1">
                      <div className="bg-white/5 border border-white/5 rounded p-1">
                        <div className="text-[8px] text-zinc-500 uppercase">得分 Score</div>
                        <div className="text-sm font-black text-amber-400">{score}</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded p-1">
                        <div className="text-[8px] text-zinc-500 uppercase">最高 Combo</div>
                        <div className="text-sm font-black text-cyan-400">{maxCombo}x</div>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        onClick={startGame}
                        className="px-5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-lg shadow-md cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1 mx-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>重新挑战</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* High Score / Legends row */}
          <div className="mt-4 flex justify-between items-center w-full max-w-[300px] text-[10px] font-mono text-zinc-500 px-1">
            <span className="flex items-center gap-0.5">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>最高分: {highScore}</span>
            </span>
            <span className="text-[9px]">连击3次以上奖励多倍得分</span>
          </div>
        </div>
      ) : (
        // EDUCATIONAL SANDBOX DEMO MODE
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
                  onClick={() => handleQubitClick(q.id, q.x, q.y)}
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
      )}

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
