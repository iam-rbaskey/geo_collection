"use client";
import React, { useEffect } from 'react';
import { useAvatarStore } from '../store/useAvatarStore';
import { useGameStore } from '../store/useGameStore';
import { getAvatarById, RARITY_COLOR, RARITY_LABEL, RARITY_POINTS, xpForLevel } from '../lib/avatars';
import { X, Star } from 'lucide-react';

interface AvatarInventoryProps {
  onClose: () => void;
}

export const AvatarInventory: React.FC<AvatarInventoryProps> = ({ onClose }) => {
  const { inventory, selectedAvatarId } = useAvatarStore();
  const { level, levelXP, score } = useGameStore();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const xpNeeded = xpForLevel(level);
  const xpPct = Math.min(1, levelXP / xpNeeded);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(7,11,18,0.7)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
          background: 'rgba(11,15,20,0.98)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: '0 0 env(safe-area-inset-bottom)',
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
              Avatar Collection
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
              {inventory.length} avatar{inventory.length !== 1 ? 's' : ''} collected
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#94a3b8',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Player Stats */}
        <div style={{
          padding: '14px 20px',
          background: 'rgba(0,255,213,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Avatar icon */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(0,255,213,0.12)',
              border: '2px solid rgba(0,255,213,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}>
              {selectedAvatarId ? (getAvatarById(selectedAvatarId)?.emoji ?? '🧑') : '🧑'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#00ffd5' }}>
                  Level {level}
                </span>
                <span style={{ fontSize: 11, color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                  {levelXP} / {xpNeeded} XP
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  {score.toString().padStart(4, '0')} pts
                </span>
              </div>
              {/* XP Bar */}
              <div style={{
                width: '100%', height: 6, borderRadius: 3,
                background: 'rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${xpPct * 100}%`,
                  background: 'linear-gradient(90deg, #00ffd5, #00b8a9)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
          {inventory.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '40px 20px', gap: 12,
            }}>
              <div style={{ fontSize: 48, opacity: 0.4 }}>🗺️</div>
              <p style={{ fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                No avatars collected yet.<br />
                Explore the map to find them!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 12,
            }}>
              {inventory.map((entry, idx) => {
                const def = getAvatarById(entry.avatar_id);
                if (!def) return null;
                const color = RARITY_COLOR[entry.rarity];
                return (
                  <div
                    key={`${entry.avatar_id}-${idx}`}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 8,
                      padding: '14px 8px',
                      borderRadius: 16,
                      background: 'rgba(30,41,59,0.6)',
                      border: `1px solid ${color}33`,
                      boxShadow: `0 4px 16px ${color}18`,
                    }}
                  >
                    {/* Emoji */}
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: `${color}18`,
                      border: `2px solid ${color}66`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                    }}>
                      {def.emoji}
                    </div>

                    {/* Name */}
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: '#e2e8f0',
                      textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {def.label}
                    </div>

                    {/* Rarity badge */}
                    <div style={{
                      fontSize: 9, fontWeight: 700, color,
                      background: `${color}18`,
                      border: `1px solid ${color}44`,
                      borderRadius: 6, padding: '2px 6px',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {RARITY_LABEL[entry.rarity]}
                    </div>

                    {/* Points */}
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      +{RARITY_POINTS[entry.rarity]} pts
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
};
