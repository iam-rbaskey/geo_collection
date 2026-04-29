"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapView } from '@/components/MapView';
import { ControlPanel } from '@/components/ControlPanel';
import { AvatarSelectModal } from '@/components/AvatarSelectModal';
import { EnergyBar } from '@/components/EnergyBar';
import { AuthModal } from '@/components/AuthModal';
import { useLocationStore } from '@/store/useLocationStore';
import { useGameStore } from '@/store/useGameStore';
import { useAvatarStore } from '@/store/useAvatarStore';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchRoadRoutes } from '@/lib/routing';
import { calculateDistance } from '@/lib/map';

export default function Home() {
  const { userLocation } = useLocationStore();
  const { currentTarget, setRouteSet } = useGameStore();
  const { hasPickedStarterAvatar, setSelectedAvatar } = useAvatarStore();
  const { energy, consumeEnergy } = useEnergyStore();
  const { isAuthenticated, isChecking, setIsAuthenticated, setIsChecking } = useAuthStore();

  const [modalFinished, setModalFinished] = useState(false);
  
  // Track previous location to consume energy on move
  const prevLocation = useRef<{lat: number, lng: number} | null>(null);

  // Check auth and load user data on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch('/api/user/sync');
        if (res.ok) {
          const data = await res.json();
          // Load state into stores
          useGameStore.setState({ 
            score: data.score, 
            level: data.level, 
            levelXP: data.levelXP 
          });
          useEnergyStore.setState({ energy: data.energy || 100 });
          if (data.selectedAvatarId) {
            setSelectedAvatar(data.selectedAvatarId);
            setModalFinished(true);
          }
          if (data.inventory) {
            useAvatarStore.setState({ inventory: data.inventory });
          }
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    initAuth();
  }, [setIsAuthenticated, setIsChecking, setSelectedAvatar]);

  // Sync global collectibles from Supabase on mount
  useEffect(() => {
    const loadCollectibles = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data, error } = await supabase.from('collectibles').select('*');
        if (!error && data) {
          const { RARITY_POINTS } = await import('@/lib/avatars');
          const mapped = data.map(dbCol => ({
            id: dbCol.id,
            lat: dbCol.lat,
            lng: dbCol.lng,
            collected: false,
            points: RARITY_POINTS[dbCol.rarity as keyof typeof RARITY_POINTS] || 10,
            distanceMeters: 0,
            avatarId: dbCol.character, // Assuming character string matches avatar_id
            rarity: dbCol.rarity as any
          }));
          useGameStore.getState().setCollectibles(mapped);
        }
      } catch (err) {
        console.error("Failed to load map collectibles");
      }
    };
    loadCollectibles();
  }, []);

  // Sync state back to server periodically or after actions
  useEffect(() => {
    if (!isAuthenticated || isChecking) return;
    
    // Create a debounce timer for saving
    const timer = setTimeout(() => {
      const state = {
        score: useGameStore.getState().score,
        level: useGameStore.getState().level,
        levelXP: useGameStore.getState().levelXP,
        energy: useEnergyStore.getState().energy,
        selectedAvatarId: useAvatarStore.getState().selectedAvatarId,
        inventory: useAvatarStore.getState().inventory,
      };

      fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state)
      }).catch(() => {
        // Handle error silently in production
      });

    }, 3000); // Saves changes 3 seconds after the latest update occurs

    return () => clearTimeout(timer);
  }, [energy, currentTarget, isAuthenticated, isChecking]);

  useEffect(() => {
    if (hasPickedStarterAvatar && isAuthenticated) {
      setModalFinished(true);
    }
  }, [hasPickedStarterAvatar, isAuthenticated]);

  // Energy drain on location update
  useEffect(() => {
    if (userLocation && prevLocation.current) {
      const dist = calculateDistance(
        prevLocation.current.lat, prevLocation.current.lng,
        userLocation.lat, userLocation.lng
      );
      if (dist > 1) { // Only consume if moved more than 1 meter
        consumeEnergy(dist);
      }
    }
    if (userLocation) {
      prevLocation.current = { lat: userLocation.lat, lng: userLocation.lng };
    }
  }, [userLocation, consumeEnergy]);

  // Optimize viewport for mobile devices
  useEffect(() => {
    // Set viewport meta tag for proper mobile scaling
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';
    
    // Handle safe area insets for notched devices
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
  }, []);

  const handleCenterMap = useCallback(() => {
    // MapView tracks location automatically, trigger zoom if implemented
  }, []);

  const handleNavigateTarget = useCallback(async () => {
    if (energy <= 0) {
      alert("Not enough energy to navigate!");
      return;
    }
    if (userLocation && currentTarget) {
      const routes = await fetchRoadRoutes(
          userLocation.lng, userLocation.lat,
          currentTarget.lng, currentTarget.lat
      );
      setRouteSet(routes);
    }
  }, [userLocation, currentTarget, setRouteSet, energy]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-background" style={{ 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {isChecking ? (
        <div style={{ position: 'absolute', inset: 0, background: '#070b12', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <h2 style={{ color: '#00ffd5', fontSize: 24, animation: 'pulse 1.5s infinite' }}>Loading...</h2>
        </div>
      ) : !isAuthenticated ? (
        <AuthModal onSuccess={(data) => {
          setIsAuthenticated(true);
          const u = data.user || data.userData;
          if (u) {
            if (u.selectedAvatarId) {
              setSelectedAvatar(u.selectedAvatarId);
              setModalFinished(true);
            }
            if (u.inventory) useAvatarStore.setState({ inventory: u.inventory });
            if (u.score !== undefined) useGameStore.setState({ score: u.score, level: u.level, levelXP: u.levelXP || 0 });
            if (u.energy !== undefined) useEnergyStore.setState({ energy: u.energy });
          }
        }} />
      ) : !modalFinished ? (
        <AvatarSelectModal onComplete={() => setModalFinished(true)} />
      ) : null}

      {modalFinished && (
        <>
          <MapView />

          {/* HUD Elements */}
          <EnergyBar />

          {/* Control Panel - Bottom Right */}
          <div className="fixed bottom-0 right-0 z-10 pointer-events-none p-3 sm:p-4">
            <div className="pointer-events-auto">
              <ControlPanel 
                onCenterMap={handleCenterMap}
                onNavigateTarget={handleNavigateTarget}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
