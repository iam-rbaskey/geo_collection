"use client";
import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Trophy, Target, Zap } from 'lucide-react';

export const Navbar = () => {
  const { score, collectibles } = useGameStore();
  const remainingItems = collectibles.filter(c => !c.collected).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full px-3 py-2 sm:px-4 sm:py-3">
        <div className="bg-secondary/90 backdrop-blur-xl rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(0,255,213,0.15)] pointer-events-auto">
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/50">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-foreground tracking-wide">GEO COLLECT</h1>
                <p className="text-[10px] text-muted-foreground">Hunt & Collect</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Score */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-background/50 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-primary/20">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
                  <span className="text-sm sm:text-lg font-bold text-primary font-mono leading-none">
                    {score.toString().padStart(4, '0')}
                  </span>
                </div>
              </div>

              {/* Remaining Items */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-background/50 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Items</span>
                  <span className="text-sm sm:text-lg font-bold text-foreground font-mono leading-none">
                    {remainingItems}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
