"use client";
import React, { useEffect, useRef, useState } from 'react';
import { triggerBurstAnim } from '../lib/animation';

interface CollectibleNodeProps {
  id: string;
  points: number;
  isBursting: boolean;
  onBurstComplete: () => void;
  onClick: () => void;
}

/** Color + label by point tier */
const tierStyle = (pts: number) => {
  if (pts >= 75) return { color: '#f59e0b', label: '⭐', glow: '#f59e0b' }; // legendary
  if (pts >= 50) return { color: '#a855f7', label: '💎', glow: '#a855f7' }; // rare
  if (pts >= 35) return { color: '#3b82f6', label: '🔷', glow: '#3b82f6' }; // uncommon
  if (pts >= 20) return { color: '#00ffd5', label: '●', glow: '#00ffd5' }; // common+
  return { color: '#94a3b8', label: '●', glow: '#94a3b8' };                 // common
};

export const CollectibleNode: React.FC<CollectibleNodeProps> = ({
  points, isBursting, onBurstComplete, onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const animTriggered = useRef(false);
  const [showPopup, setShowPopup] = useState(false);
  const { color, label, glow } = tierStyle(points);

  // Idle pulse via CSS
  useEffect(() => {
    if (!document.getElementById('col-anim-style')) {
      const s = document.createElement('style');
      s.id = 'col-anim-style';
      s.textContent = `
        @keyframes col-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.9; }
          50%       { transform: scale(1.2); opacity: 1; }
        }
        @keyframes pts-pop {
          0%   { opacity: 1; transform: translate(-50%, 0)   scale(1); }
          60%  { opacity: 1; transform: translate(-50%, -28px) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -44px) scale(0.9); }
        }
      `;
      document.head.appendChild(s);
    }
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
          bottom: '100%',
          left: '50%',
          whiteSpace: 'nowrap',
          background: 'rgba(14,20,27,0.9)',
          color: color,
          fontSize: 13,
          fontWeight: 700,
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

      {/* Collectible dot */}
      <div
        ref={ref}
        onClick={onClick}
        title={`${points} pts`}
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 12px 4px ${glow}55, 0 0 4px 1px ${glow}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          animation: 'col-pulse 2s ease-in-out infinite',
          border: `2px solid ${color}cc`,
        }}
      >
        {/* Point badge */}
        <div style={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(14,20,27,0.9)',
          color: color,
          fontSize: 9,
          fontWeight: 800,
          padding: '1px 4px',
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
