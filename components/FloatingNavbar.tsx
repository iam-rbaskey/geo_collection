"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, User, Zap } from 'lucide-react';
import anime from 'animejs';
import { useAvatarStore } from '@/store/useAvatarStore';
import { getAvatarById } from '@/lib/avatars';

interface NavItemData {
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  badgeCount?: number;
}

const NAV_ITEMS: NavItemData[] = [
  { id: 'dashboard', label: 'Map', icon: Home, route: '/' },
  { id: 'inventory', label: 'Inventory', icon: Layers, route: '/inventory' },
  { id: 'characters', label: 'Characters', icon: User, route: '/characters', badgeCount: 1 },
  { id: 'powers', label: 'Powers', icon: Zap, route: '/powers' },
  { id: 'profile', label: 'Profile', icon: 'AVATAR' as unknown as React.ElementType, route: '/profile' },
];

interface NavItemProps {
  item: NavItemData;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive }) => {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const Icon = item.icon;

  const handleMouseEnter = () => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        scale: 1.08,
        duration: 140,
        easing: 'easeOutQuad',
      });
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        scale: 1,
        duration: 140,
        easing: 'easeOutQuad',
      });
    }
  };

  const handleClick = () => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        scale: [1, 0.9, 1.05, 1],
        translateY: [0, 2, -1, 0],
        duration: 180,
        easing: 'easeOutQuad',
      });
    }
  };

  return (
    <Link
      ref={containerRef}
      href={item.route}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative flex flex-col items-center justify-center cursor-pointer select-none no-underline"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="relative flex flex-col items-center justify-center gap-[4px]">
        <div className="relative flex items-center justify-center" style={{ width: 28, height: 28 }}>
          {item.icon === 'AVATAR' as any ? (
            <AvatarIcon isActive={isActive} />
          ) : (
            <Icon
              size={22}
              color={isActive ? '#ffffff' : 'rgba(255,255,255,0.75)'}
              style={{ transition: 'color 0.2s ease', position: 'relative', zIndex: 2 }}
            />
          )}
          {isActive && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                boxShadow: '0 0 12px #8b5cf6',
                opacity: 0.8,
                background: 'rgba(139,92,246,0.1)',
                zIndex: 1,
              }}
            />
          )}
          {item.badgeCount && item.badgeCount > 0 ? (
            <div
              className="absolute z-10"
              style={{
                top: '-4px',
                right: '-8px',
                background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '0 6px',
                height: '16px',
                minWidth: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(236,72,153,0.6)',
              }}
            >
              {item.badgeCount}
            </div>
          ) : null}
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.2px',
            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </span>
      </div>
    </Link>
  );
};

const AvatarIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { selectedAvatarId } = useAvatarStore();
  const selectedDef = selectedAvatarId ? getAvatarById(selectedAvatarId) : null;
  const imagePath = selectedDef?.image_path ?? '/characters/man.png';

  return (
    <div style={{
      width: 26, height: 26, borderRadius: '50%',
      background: 'rgba(0,255,213,0.12)',
      border: `1.5px solid ${isActive ? '#ffffff' : 'rgba(0,255,213,0.4)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', zIndex: 2, overflow: 'hidden',
      transition: 'border-color 0.2s ease'
    }}>
      <img src={imagePath} alt="Avatar" style={{ width: 18, height: 18, objectFit: 'contain' }} />
    </div>
  );
};

export const FloatingNavbar: React.FC = () => {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/auth') {
    return null;
  }

  return (
    <div
      className="fixed z-[100] flex justify-center pointer-events-none"
      style={{
        bottom: '18px',
        left: 0,
        right: 0,
        width: '100%',
      }}
    >
      <nav
        className="pointer-events-auto flex flex-row items-center justify-between w-[90%] max-w-[420px] md:w-[70%] md:max-w-none lg:w-[520px]"
        style={{
          padding: '14px 26px',
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} isActive={pathname === item.route} />
        ))}
      </nav>
    </div>
  );
};
