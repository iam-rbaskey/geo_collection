"use client";
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { triggerPopupScore } from '../lib/animation';

export const ScoreDisplay = () => {
  const score = useGameStore((state) => state.score);
  const scoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (score > 0) {
      triggerPopupScore(scoreRef.current);
    }
  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-2 bg-secondary/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg pointer-events-auto">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Score</span>
      <span ref={scoreRef} className="text-3xl font-bold text-foreground font-mono">
        {score.toString().padStart(4, '0')}
      </span>
    </div>
  );
};
