"use client";
import React, { useEffect, useRef, useState } from 'react';
import { triggerBurstAnim } from '../lib/animation';
import { getAvatarById, RARITY_COLOR, RARITY_GLOW } from '../lib/avatars';
import type { AvatarRarity } from '../lib/avatars';

interface CollectibleNodeProps {
  id: string;
  points: number;
  rarity: AvatarRarity;
  avatarId: string;
  isBursting: boolean;
  onBurstComplete: () => void;
  onClick: () => void;
}

export const CollectibleNode: React.FC<CollectibleNodeProps> = ({
  points, rarity, avatarId, isBursting, onBurstComplete, onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const animTriggered = useRef(false);
  const [showPopup, setShowPopup] = useState(false);

  const color = RARITY_COLOR[rarity];
  const glow  = RARITY_GLOW[rarity];
  const def   = getAvatarById(avatarId);
  const image = def?.image_path ?? '/characters/man.png';

  // Shared keyframes
  useEffect(() => {
    if (document.getElementById('col-anim-style')) return;
    const s = document.createElement('style');
    s.id = 'col-anim-style';
    s.textContent = `
      @keyframes pts-pop {
        0%   { opacity: 1; transform: translate(-50%, 0)    scale(1);   }
        60%  { opacity: 1; transform: translate(-50%, -28px) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -44px) scale(0.9); }
      }
      @keyframes col-float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-4px); }
      }
      @keyframes col-idle-pulse {
        0%, 100% { box-shadow: 0 0 10px 2px var(--col-glow); }
        50%       { box-shadow: 0 0 22px 6px var(--col-glow); }
      }
    `;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (isBursting && !animTriggered.current) {
      animTriggered.current = true;
      setShowPopup(true);
      triggerBurstAnim(ref.current, onBurstComplete);
      setTimeout(() => setShowPopup(false), 900);
    }
  }, [isBursting, onBurstComplete]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* +N pts popup */}
      {showPopup && (
        <div style={{
          position: 'absolute',
          bottom: '100%', left: '50%',
          whiteSpace: 'nowrap',
          background: 'rgba(14,20,27,0.9)',
          color,
          fontSize: 13, fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 12,
          border: `1px solid ${color}`,
          pointerEvents: 'none',
          animation: 'pts-pop 0.9s ease-out forwards',
          zIndex: 99,
        }}>
          +{points} pts
        </div>
      )}

      {/* Avatar marker */}
      <div
        ref={ref}
        onClick={onClick}
        title={`${def?.label ?? 'Avatar'} — ${points} pts`}
        style={{
          width: 42, height: 42,
          borderRadius: '50%',
          background: `${color}22`,
          border: `2.5px solid ${color}cc`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          animation: 'col-float 3s ease-in-out infinite',
          /* CSS custom property for glow animation */
          ['--col-glow' as string]: `${glow}66`,
          boxShadow: `0 0 14px 3px ${glow}44, 0 0 4px 1px ${glow}`,
        }}
      >
        <img src={image} alt={def?.label ?? 'Avatar'} style={{ width: 28, height: 28, objectFit: 'contain' }} />

        {/* Rarity ring pulse */}
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          border: `1.5px solid ${color}55`,
          animation: 'col-idle-pulse 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Points badge */}
        <div style={{
          position: 'absolute',
          top: -11, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(14,20,27,0.92)',
          color,
          fontSize: 9, fontWeight: 800,
          padding: '1px 5px',
          borderRadius: 6,
          border: `1px solid ${color}88`,
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
          pointerEvents: 'none',
        }}>
          {points}
        </div>
      </div>
    </div>
  );
};
