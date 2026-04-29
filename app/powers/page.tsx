"use client";
import React from 'react';
import { useEnergyStore, MAX_ENERGY } from '@/store/useEnergyStore';
import { Zap, BatteryCharging, Navigation } from 'lucide-react';

export default function PowersPage() {
  const { energy, forceRecharge, isRecharging, lastMovedAt } = useEnergyStore();
  
  const energyPct = Math.max(0, Math.min(100, (energy / MAX_ENERGY) * 100));
  const isFull = energy >= MAX_ENERGY;

  return (
    <div className="min-h-screen bg-background p-6 pb-32 flex flex-col items-center">
      <div className="w-full max-w-md bg-secondary/30 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col items-center gap-6 mt-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center overflow-hidden">
            <Zap className={`w-16 h-16 text-emerald-400 ${isRecharging ? 'animate-pulse' : ''}`} />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            {Math.floor(energy)} / {MAX_ENERGY}
          </div>
        </div>

        <div className="text-center mt-2">
          <h1 className="text-2xl font-bold text-foreground">Energy Core</h1>
          <p className="text-muted-foreground text-sm mt-1">Powers your map navigation</p>
        </div>

        <div className="w-full bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Core Charge</span>
            <span className="font-mono text-emerald-400">{energyPct.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
              style={{ width: `${energyPct}%`, transition: 'width 0.3s ease' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center gap-2">
            <Navigation className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted-foreground uppercase">Cost</span>
            <span className="text-sm font-medium text-foreground">0.02 / meter</span>
          </div>
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center gap-2">
            <BatteryCharging className="w-6 h-6 text-yellow-400" />
            <span className="text-xs text-muted-foreground uppercase">Recharge</span>
            <span className="text-sm font-medium text-foreground">Idle for 1h</span>
          </div>
        </div>

        <button 
          onClick={forceRecharge}
          disabled={isFull}
          className="w-full mt-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-semibold border border-emerald-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5" />
          {isFull ? 'Core Fully Charged' : 'Emergency Recharge'}
        </button>
      </div>
    </div>
  );
}
