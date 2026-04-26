"use client";
import React, { useRef } from 'react';
import Image from 'next/image';

export const UserMarker = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={wrapperRef}
        data-avatar-pulse="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(14,20,27,0.65)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(0,255,213,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transformOrigin: 'center center',
          willChange: 'transform, filter',
        }}
      >
        <Image
          src="/superhero.png"
          alt="You"
          width={46}
          height={46}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </div>
  );
};
