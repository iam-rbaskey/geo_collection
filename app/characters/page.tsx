"use client";
import React from 'react';
import { COLLECTIBLE_AVATAR_POOL, RARITY_COLOR, RARITY_LABEL, RARITY_POINTS, STARTER_AVATARS } from '@/lib/avatars';
import { useAvatarStore } from '@/store/useAvatarStore';

export default function CharactersPage() {
  const allCharacters = [...STARTER_AVATARS, ...COLLECTIBLE_AVATAR_POOL];
  const { inventory } = useAvatarStore();

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-foreground">Characters Directory</h1>
          <p className="text-muted-foreground mt-2">
            Discover all {allCharacters.length} characters you can find in the Geo Collectibles universe.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allCharacters.map((def) => {
            const isAcquired = inventory.some(i => i.avatar_id === def.avatar_id);
            const color = isAcquired ? '#22c55e' : RARITY_COLOR[def.rarity];
            const borderStyle = isAcquired ? `2px solid ${color}` : `1px solid rgba(255,255,255,0.05)`;
            const bgStyle = isAcquired ? 'rgba(34,197,94,0.15)' : 'rgba(31,41,55,0.2)';
            
            return (
              <div 
                key={def.avatar_id}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-colors"
                style={{ backgroundColor: bgStyle, border: borderStyle }}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: `${color}15`,
                    border: `2px solid ${color}40`
                  }}
                >
                  <img src={def.image_path} alt={def.label} className="w-14 h-14 object-contain" />
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">{def.label}</div>
                  <div 
                    className="text-[10px] font-bold uppercase tracking-wider mt-1 rounded px-2 py-0.5"
                    style={{
                      color: color,
                      background: `${color}10`,
                      border: `1px solid ${color}30`
                    }}
                  >
                    {RARITY_LABEL[def.rarity]}
                  </div>
                </div>
                
                <div className="text-xs text-slate-400 font-mono mt-1 space-y-1">
                  <div>Points: {RARITY_POINTS[def.rarity]}</div>
                  {def.energy_bonus > 0 && <div>Energy: +{def.energy_bonus * 100}%</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
