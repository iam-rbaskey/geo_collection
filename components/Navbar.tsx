"use client";
import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAvatarStore } from '../store/useAvatarStore';
import { Trophy, Target, ChevronUp, Globe } from 'lucide-react';
import { AvatarInventory } from './AvatarInventory';
import { getAvatarById, xpForLevel } from '../lib/avatars';

export const Navbar = () => {
  const { score, collectibles, level, levelXP } = useGameStore();
  const { inventory, selectedAvatarId } = useAvatarStore();
  const remainingItems = collectibles.filter(c => !c.collected).length;
  const [showInventory, setShowInventory] = useState(false);

  const xpNeeded = xpForLevel(level);
  const xpPct = Math.min(1, levelXP / xpNeeded);

  const selectedDef = selectedAvatarId ? getAvatarById(selectedAvatarId) : null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="w-full px-3 py-2 sm:px-4 sm:py-3">
          <div className="bg-secondary/90 backdrop-blur-xl rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(0,255,213,0.15)] pointer-events-auto">
            <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5">

              {/* Left: Avatar + Level */}
              <button
                onClick={() => setShowInventory(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                title="Open Inventory"
              >
                {/* Avatar icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(0,255,213,0.12)',
                  border: '1.5px solid rgba(0,255,213,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative', overflow: 'hidden'
                }}>
                  <img src={selectedDef?.image_path ?? '/characters/man.png'} alt={selectedDef?.label ?? 'Avatar'} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                  {/* Inventory count badge */}
                  {inventory.length > 0 && (
                    <div style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#00ffd5', color: '#0b0f14',
                      fontSize: 8, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid #0b0f14',
                    }}>
                      {inventory.length > 9 ? '9+' : inventory.length}
                    </div>
                  )}
                </div>

                {/* Level + XP bar */}
                <div style={{ display: 'none' }} className="sm:block">
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#00ffd5' }}>Lv.{level}</span>
                    <span style={{ fontSize: 9, color: '#475569' }}>{levelXP}/{xpNeeded}</span>
                  </div>
                  <div style={{ width: 56, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${xpPct * 100}%`,
                      background: 'linear-gradient(90deg, #00ffd5, #00b8a9)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>

                {/* Open indicator */}
                <ChevronUp size={12} color="#475569" />
              </button>

              {/* Center: Logo (hidden on xs) */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/50">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-foreground tracking-wide">GEO COLLECT</h1>
                  <p className="text-[10px] text-muted-foreground">Hunt &amp; Collect</p>
                </div>
              </div>

              {/* Right: Score + Items + Logout */}
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
                <div className="flex items-center gap-1.5 sm:gap-2 bg-background/50 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 hidden sm:flex">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Items</span>
                    <span className="text-sm sm:text-lg font-bold text-foreground font-mono leading-none">
                      {remainingItems}
                    </span>
                  </div>
                </div>

                {/* Logout */}
                <button 
                  onClick={async () => {
                    const { createClient } = await import('@/utils/supabase/client');
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  className="flex items-center justify-center p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors pointer-events-auto cursor-pointer"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      </nav>

      {showInventory && (
        <AvatarInventory onClose={() => setShowInventory(false)} />
      )}
    </>
  );
};
