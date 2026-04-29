"use client";
import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useAvatarStore } from '@/store/useAvatarStore';
import { getAvatarById, xpForLevel } from '@/lib/avatars';
import { Trophy, Target, Star, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
  const { score, collectibles, level, levelXP } = useGameStore();
  const { inventory, selectedAvatarId } = useAvatarStore();
  const remainingItems = collectibles.filter(c => !c.collected).length;
  const xpNeeded = xpForLevel(level);
  const xpPct = Math.min(1, levelXP / xpNeeded);

  const selectedDef = selectedAvatarId ? getAvatarById(selectedAvatarId) : null;
  const imagePath = selectedDef?.image_path ?? '/characters/man.png';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-32 flex flex-col items-center">
      <div className="w-full max-w-md bg-secondary/30 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col items-center gap-6 mt-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-primary/40 bg-primary/10 flex items-center justify-center overflow-hidden">
            <img src={imagePath} alt="Avatar" className="w-24 h-24 object-contain" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg">
            Level {level}
          </div>
        </div>

        <div className="text-center mt-2">
          <h1 className="text-2xl font-bold text-foreground">Explorer</h1>
          <p className="text-muted-foreground text-sm mt-1">Geo Collectibles Player</p>
        </div>

        <div className="w-full bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Experience</span>
            <span className="font-mono text-primary">{levelXP} / {xpNeeded} XP</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-emerald-400"
              style={{ width: `${xpPct * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xs text-muted-foreground uppercase">Score</span>
            <span className="text-xl font-bold font-mono text-foreground">{score.toString().padStart(4, '0')}</span>
          </div>
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted-foreground uppercase">Items Left</span>
            <span className="text-xl font-bold font-mono text-foreground">{remainingItems}</span>
          </div>
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2">
            <Star className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-muted-foreground uppercase">Collected</span>
            <span className="text-xl font-bold font-mono text-foreground">{inventory.length}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full mt-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold border border-red-500/20 flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
