"use client";
import React, { useState, useEffect } from 'react';
import { useAvatarStore } from '../store/useAvatarStore';
import { STARTER_AVATARS } from '../lib/avatars';
import type { AvatarDef } from '../lib/avatars';

interface AvatarSelectModalProps {
  onComplete: () => void;
}

export const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({ onComplete }) => {
  const { setSelectedAvatar } = useAvatarStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [visible, setVisible] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById('avatar-modal-kf')) return;
    const s = document.createElement('style');
    s.id = 'avatar-modal-kf';
    s.textContent = `
      @keyframes floatCard {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-8px); }
      }
      @keyframes avatarSelectPulse {
        0%   { box-shadow: 0 0 0 0 rgba(0,255,213,0.5); }
        70%  { box-shadow: 0 0 0 16px rgba(0,255,213,0); }
        100% { box-shadow: 0 0 0 0 rgba(0,255,213,0); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes modalSlideUp {
        from { opacity: 0; transform: translateY(40px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0)   scale(1); }
      }
    `;
    document.head.appendChild(s);
  }, []);

  const handleSelect = (avatar: AvatarDef) => {
    setSelected(avatar.avatar_id);
  };

  const handleConfirm = () => {
    if (!selected || confirming) return;
    setConfirming(true);
    setTimeout(() => {
      setSelectedAvatar(selected);
      onComplete();
    }, 500);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(7,11,18,0.97)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(0,255,213,0.12)',
          border: '1.5px solid rgba(0,255,213,0.4)',
          fontSize: 26, marginBottom: 16,
        }}>
          🌍
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800,
          color: '#e2e8f0', letterSpacing: '-0.5px', marginBottom: 8,
          lineHeight: 1.2,
        }}>
          Choose Your Avatar
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', maxWidth: 320, lineHeight: 1.5 }}>
          Pick your explorer identity. More avatars can be collected on the map!
        </p>
      </div>

      {/* Avatar Cards */}
      <div style={{
        display: 'flex', gap: '20px', flexWrap: 'wrap',
        justifyContent: 'center', marginBottom: 40,
      }}>
        {STARTER_AVATARS.map((avatar) => {
          const isSelected = selected === avatar.avatar_id;
          return (
            <button
              key={avatar.avatar_id}
              onClick={() => handleSelect(avatar)}
              style={{
                position: 'relative',
                width: 'clamp(140px, 35vw, 180px)',
                padding: '28px 20px 24px',
                borderRadius: 20,
                border: isSelected
                  ? '2px solid #00ffd5'
                  : '2px solid rgba(255,255,255,0.08)',
                background: isSelected
                  ? 'rgba(0,255,213,0.10)'
                  : 'rgba(30,41,59,0.7)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 0 0 0 rgba(0,255,213,0.5), 0 20px 60px rgba(0,255,213,0.15)'
                  : '0 8px 32px rgba(0,0,0,0.4)',
                animation: isSelected
                  ? 'avatarSelectPulse 1.5s ease-out, floatCard 3s ease-in-out infinite'
                  : 'none',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#00ffd5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: '#0b0f14',
                }}>
                  ✓
                </div>
              )}

              {/* Avatar image / icon */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: isSelected ? 'rgba(0,255,213,0.18)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isSelected ? 'rgba(0,255,213,0.6)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}>
                <img src={avatar.image_path} alt={avatar.label} style={{ width: 48, height: 48, objectFit: 'contain' }} />
              </div>

              {/* Avatar label */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  color: isSelected ? '#00ffd5' : '#e2e8f0',
                  marginBottom: 4,
                  transition: 'color 0.2s',
                }}>
                  {avatar.label}
                </div>
                <div style={{
                  fontSize: 11, color: '#64748b',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '2px 8px', borderRadius: 6,
                  display: 'inline-block',
                }}>
                  Starter
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!selected || confirming}
        style={{
          padding: '14px 48px',
          borderRadius: 14,
          border: 'none',
          background: selected
            ? 'linear-gradient(135deg, #00ffd5, #00b8a9)'
            : 'rgba(30,41,59,0.6)',
          color: selected ? '#0b0f14' : '#475569',
          fontSize: 16, fontWeight: 800,
          cursor: selected ? 'pointer' : 'not-allowed',
          transition: 'all 0.25s ease',
          transform: selected ? 'scale(1)' : 'scale(0.98)',
          boxShadow: selected ? '0 8px 32px rgba(0,255,213,0.3)' : 'none',
          letterSpacing: '0.3px',
          minWidth: 200,
        }}
      >
        {confirming ? '🚀 Starting...' : selected ? 'Begin Adventure' : 'Select an Avatar'}
      </button>

      {/* Hint */}
      <p style={{ marginTop: 16, fontSize: 12, color: '#334155', textAlign: 'center' }}>
        You can collect more avatars by exploring the map
      </p>
    </div>
  );
};
