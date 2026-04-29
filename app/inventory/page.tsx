"use client";
import React from 'react';
import { useAvatarStore } from '@/store/useAvatarStore';
import { getAvatarById, RARITY_COLOR, RARITY_LABEL, RARITY_POINTS } from '@/lib/avatars';

export default function InventoryPage() {
  const { inventory } = useAvatarStore();

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-2">
            You have collected {inventory.length} avatar{inventory.length !== 1 ? 's' : ''}.
          </p>
        </div>

        {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-secondary/20 rounded-3xl border border-white/5">
            <div className="w-16 h-16 opacity-40 border-2 border-dashed border-slate-600 rounded-full mb-4" />
            <p className="text-slate-400 text-center">
              No avatars collected yet.<br />Explore the map to find them!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {inventory.map((entry, idx) => {
              const def = getAvatarById(entry.avatar_id);
              if (!def) return null;
              const color = RARITY_COLOR[entry.rarity];
              
              return (
                <div 
                  key={`${entry.avatar_id}-${idx}`}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-secondary/40 backdrop-blur-sm transition-transform hover:scale-105"
                  style={{
                    border: `1px solid ${color}40`,
                    boxShadow: `0 8px 24px ${color}15`
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: `${color}15`,
                      border: `2px solid ${color}50`
                    }}
                  >
                    <img src={def.image_path} alt={def.label} className="w-10 h-10 object-contain" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-bold text-foreground">{def.label}</div>
                    <div 
                      className="text-[10px] font-bold uppercase tracking-wider mt-1 rounded px-2 py-0.5"
                      style={{
                        color: color,
                        background: `${color}15`,
                        border: `1px solid ${color}30`
                      }}
                    >
                      {RARITY_LABEL[entry.rarity]}
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400 font-mono">
                    +{RARITY_POINTS[entry.rarity]} pts
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
