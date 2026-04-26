"use client";
import React, { useEffect, useRef } from 'react';
import { useEnergyStore, MAX_ENERGY } from '../store/useEnergyStore';
import { Zap } from 'lucide-react';

export const EnergyBar: React.FC = () => {
  const { energy, isRecharging, tick } = useEnergyStore();

  // Drive the tick loop every 500ms (non-blocking, outside React render cycle)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    tickRef.current = setInterval(() => tick(), 500);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [tick]);

  const pct = energy / MAX_ENERGY;

  // Color based on energy level
  const barColor =
    pct > 0.6 ? '#22c55e' :
    pct > 0.3 ? '#facc15' :
                '#ef4444';

  const bgGlow =
    pct > 0.6 ? 'rgba(34,197,94,0.15)' :
    pct > 0.3 ? 'rgba(250,204,21,0.15)' :
                'rgba(239,68,68,0.20)';

  return (
    <div
      className="energy-bar-container"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom) + 190px)',
        right: 16,
        zIndex: 40,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        // GPU-accelerated: no layout properties change
        willChange: 'opacity',
      }}
    >
      {/* Card */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(11,15,20,0.85)',
          border: `1px solid ${barColor}44`,
          borderRadius: 12,
          padding: '6px 10px 6px 8px',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 0 16px ${bgGlow}`,
          minWidth: 120,
        }}
      >
        {/* Zap icon */}
        <Zap
          size={13}
          color={barColor}
          fill={barColor}
          style={{ flexShrink: 0 }}
        />

        {/* Bar + label column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row: label + pct */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: 4, alignItems: 'baseline',
          }}>
            <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
              {isRecharging ? 'Recharging' : 'Energy'}
            </span>
            <span style={{ fontSize: 10, color: barColor, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(energy)}%
            </span>
          </div>

          {/* Track */}
          <div style={{
            width: '100%', height: 5, borderRadius: 3,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Fill — only width changes, GPU composited */}
            <div
              style={{
                height: '100%', borderRadius: 3,
                width: `${pct * 100}%`,
                background: isRecharging
                  ? `linear-gradient(90deg, ${barColor}aa, ${barColor})`
                  : barColor,
                transition: 'width 0.4s ease-out, background 0.6s ease',
                willChange: 'width',
              }}
            />
            {/* Shimmer on recharge */}
            {isRecharging && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'energyShimmer 1.2s linear infinite',
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Low-energy warning */}
      {pct < 0.2 && !isRecharging && (
        <div style={{
          fontSize: 10, color: '#ef4444', fontWeight: 700,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '3px 8px',
          animation: 'energyWarnPulse 1.5s ease-in-out infinite',
        }}>
          ⚡ Low Energy
        </div>
      )}

      <style>{`
        @keyframes energyShimmer {
          from { background-position: -200% center; }
          to   { background-position:  200% center; }
        }
        @keyframes energyWarnPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        
        @media (max-width: 640px) {
          .energy-bar-container {
            bottom: calc(env(safe-area-inset-bottom) + 160px) !important;
            right: 10px !important;
            transform: scale(0.9);
            transform-origin: bottom right;
          }
        }
      `}</style>
    </div>
  );
};
